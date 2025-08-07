// realAuthService.ts - Fixed with JWT decoding for real user ID
import axios, { AxiosInstance } from "axios";

const BASE_URL = "https://dev-backend.zonak.net/api";

// Device info constants
const DEVICE_INFO = {
  device_token: null,
  device_type: "w",
  uuid: "ipaddress",
  os_version: "windows7",
  device_name: "dell",
  model_name: "dell",
  build_version_number: "1.0.0",
};

// JWT Decoder helper function
const decodeJWT = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    console.log("Decoded JWT payload:", decoded);
    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

// Phone formatting utilities
export const formatPhoneToBackend = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.startsWith("966")) return cleanPhone;
  if (cleanPhone.startsWith("05")) return "966" + cleanPhone.substring(1);
  if (cleanPhone.startsWith("5")) return "966" + cleanPhone;

  throw new Error("Invalid phone format");
};

export const formatPhoneForDisplay = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, "");
  let normalizedNumber = cleanPhone;

  if (cleanPhone.startsWith("966")) {
    normalizedNumber = cleanPhone.substring(3);
  } else if (cleanPhone.startsWith("05")) {
    normalizedNumber = cleanPhone.substring(1);
  }

  if (normalizedNumber.length === 9) {
    return `+966 ${normalizedNumber.substring(
      0,
      2
    )} ${normalizedNumber.substring(2, 5)} ${normalizedNumber.substring(5)}`;
  }
  return phone;
};

export class RealAuthService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: { "Content-Type": "application/json" },
    });

    this.axiosInstance.interceptors.request.use((config) => {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ ${response.status}`, response.data);
        return response;
      },
      (error) => {
        console.error(`❌ ${error.response?.status}`, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Try login with password - this is our main auth method
   */
  async loginWithPassword(phone: string, password: string) {
    try {
      const formattedPhone = formatPhoneToBackend(phone);

      const payload = {
        phone: formattedPhone,
        password: password,
        ...DEVICE_INFO,
      };

      const response = await this.axiosInstance.post("/login-otp-web", payload);

      if (response.data.code !== "0") {
        throw new Error(response.data.message || "Login failed");
      }

      const { data: token, is_otp_verified, name } = response.data;

      // Decode JWT to get real user ID
      const jwtPayload = decodeJWT(token);
      const realUserId =
        jwtPayload?.user_id || jwtPayload?.sub || jwtPayload?.id;

      console.log("Extracted real user ID from JWT:", realUserId);

      // Parse user name if available
      let userData = null;
      if (name?.trim()) {
        const nameParts = name.trim().split(" ");
        userData = {
          id: realUserId?.toString() || `fallback_${Date.now()}`, // Use real ID from JWT
          first_name: nameParts[0] || "مستخدم",
          last_name: nameParts.slice(1).join(" ") || "",
          phone: formattedPhone,
        };

        console.log("Created user data with real ID:", userData);
      }

      return {
        success: true,
        userType: is_otp_verified === 1 ? "verified" : "unverified",
        token,
        userData,
        message: "Login successful",
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // 404 = user not found (new user)
        if (error.response?.status === 404) {
          return {
            success: false,
            userType: "new" as const,
            message: "User not found",
          };
        }

        const errorMessage = error.response?.data?.message || "Login failed";
        throw new Error(errorMessage);
      }
      throw new Error("Network error");
    }
  }

  /**
   * Register new user
   */
  async registerUser(
    phone: string,
    firstName: string,
    lastName: string,
    password: string
  ) {
    try {
      const formattedPhone = formatPhoneToBackend(phone);

      const formData = new FormData();
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());
      formData.append("phone", formattedPhone);
      formData.append("password", password);
      formData.append("latitude", "24.7136");
      formData.append("longitude", "46.6753");

      Object.entries(DEVICE_INFO).forEach(([key, value]) => {
        formData.append(key, value?.toString() || "");
      });

      const response = await this.axiosInstance.post(
        "/register-web",
        formData,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (response.data.code !== "0") {
        throw new Error(response.data.message || "Registration failed");
      }

      return {
        success: true,
        token: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Registration failed"
        : "Network error";
      throw new Error(errorMessage);
    }
  }

  /**
   * Send OTP
   */
  async sendOTP(phone: string, token: string) {
    try {
      const formattedPhone = formatPhoneToBackend(phone);

      const formData = new FormData();
      formData.append("phone", formattedPhone);
      formData.append("lang", "Ar");

      const response = await this.axiosInstance.post("/send_otp", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-auth-token": token,
        },
      });

      return {
        success: true,
        sessionId: response.data.id,
        message: response.data.message,
      };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to send OTP"
        : "Network error";
      throw new Error(errorMessage);
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(
    phone: string,
    otp: string,
    sessionId: string,
    token: string
  ) {
    try {
      const formattedPhone = formatPhoneToBackend(phone);

      const params = new URLSearchParams();
      params.append("id", sessionId);
      params.append("code", otp);
      params.append("lang", "Ar");
      params.append("phone", formattedPhone);

      const response = await this.axiosInstance.post("/verify_otp", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-auth-token": token,
        },
      });

      const isValid = response.data.message?.includes("تم بنجاح") || false;

      return {
        isValid,
        message: response.data.message || "Verification completed",
      };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "OTP verification failed"
        : "Network error";
      throw new Error(errorMessage);
    }
  }
}

export const realAuthService = new RealAuthService();
