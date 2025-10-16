// realAuthService.ts - Fixed: Now includes session ID in verify_otp
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
    // console.log("Decoded JWT payload:", decoded);
    return decoded;
  } catch (error) {
    // console.error("Failed to decode JWT:", error);
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

// Response interfaces
interface SendOtpResponse {
  message: string;
  id: string; // Session ID - CRITICAL for verify_otp
  phone: string;
}

interface VerifyOtpResponse {
  message: string;
  data: string; // JWT token
  is_otp_verified: string;
  name?: string;
  is_new_user: boolean;
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    phone: string;
  };
}

interface UpdateNamesResponse {
  message: string;
  data: string; // Full name
}

export class RealAuthService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "x-auth-app-token": "b7dcbb3bee57ed51b8bcc5e4ec8dd62a",
      },
    });

    this.axiosInstance.interceptors.request.use((config) => {
      // console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => {
        // console.log(`✅ ${response.status}`, response.data);
        return response;
      },
      (error) => {
        // console.error(`❌ ${error.response?.status}`, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Send OTP to phone number
   * Returns session ID that MUST be used in verify_otp
   */
  async sendOTP(phone: string): Promise<SendOtpResponse> {
    try {
      const formattedPhone = formatPhoneToBackend(phone);

      const formData = new FormData();
      formData.append("phone", formattedPhone);
      formData.append("lang", "ar");
      formData.append("uuid", DEVICE_INFO.uuid);

      const response = await this.axiosInstance.post("/send_otp", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      return {
        message: response.data.message || "تم الإرسال بنجاح",
        id: response.data.id, // Session ID - save this!
        phone: response.data.phone,
      };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "فشل في إرسال رمز التحقق"
        : "خطأ في الشبكة";
      throw new Error(errorMessage);
    }
  }

  /**
   * Verify OTP and get JWT token + user info
   * CRITICAL: Must include the session ID from send_otp response
   */
  async verifyOTP(
    phone: string,
    otp: string,
    sessionId: string // ✅ REQUIRED: The 'id' from send_otp response
  ): Promise<VerifyOtpResponse> {
    try {
      const formattedPhone = formatPhoneToBackend(phone);

      const formData = new FormData();
      formData.append("phone", formattedPhone);
      formData.append("code", otp);
      formData.append("id", sessionId); // ✅ Session ID from send_otp
      formData.append("lang", "ar"); // ✅ Required by backend
      formData.append("uuid", DEVICE_INFO.uuid);
      formData.append("device_token", DEVICE_INFO.device_token || "");
      formData.append("device_type", DEVICE_INFO.device_type);
      formData.append("os_version", DEVICE_INFO.os_version);
      formData.append("device_name", DEVICE_INFO.device_name);
      formData.append("model_name", DEVICE_INFO.model_name);
      formData.append("build_version_number", DEVICE_INFO.build_version_number);

      const response = await this.axiosInstance.post("/verify_otp", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const data = response.data;

      // Decode JWT to get user ID
      const jwtPayload = decodeJWT(data.data);
      const userId = jwtPayload?.user_id || jwtPayload?.sub || jwtPayload?.id;

      // Parse user data from response
      let userData = null;
      if (data.user) {
        userData = {
          id:
            userId?.toString() ||
            data.user.id?.toString() ||
            `user_${Date.now()}`,
          first_name: data.user.first_name || "",
          last_name: data.user.last_name || "",
          phone: formattedPhone,
        };
      } else if (data.name && !data.is_new_user) {
        // Parse name if user exists but user object not provided
        const nameParts = data.name.trim().split(" ");
        userData = {
          id: userId?.toString() || `user_${Date.now()}`,
          first_name: nameParts[0] || "",
          last_name: nameParts.slice(1).join(" ") || "",
          phone: formattedPhone,
        };
      }

      return {
        message: data.message || "تم بنجاح",
        data: data.data, // JWT token
        is_otp_verified: data.is_otp_verified,
        name: data.name,
        is_new_user: data.is_new_user === true || data.is_new_user === "true",
        user: userData || undefined,
      };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "رمز التحقق غير صحيح"
        : "خطأ في التحقق";
      throw new Error(errorMessage);
    }
  }

  /**
   * Update user names (for new users after OTP verification)
   */
  async updateNames(
    firstName: string,
    lastName: string,
    phone: string,
    token: string
  ): Promise<UpdateNamesResponse> {
    try {
      const formattedPhone = formatPhoneToBackend(phone);

      const response = await this.axiosInstance.post("/auth/update-names", {
        params: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: formattedPhone,
        },
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      });

      return {
        message: response.data.message || "success",
        data: response.data.data, // Full name
      };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "فشل في تحديث البيانات"
        : "خطأ في الشبكة";
      throw new Error(errorMessage);
    }
  }

  /**
   * DEPRECATED: No longer used in OTP-only flow
   */
  async loginWithPassword(phone: string, password: string) {
    throw new Error(
      "Password login is deprecated. Please use OTP authentication."
    );
  }

  /**
   * DEPRECATED: No longer used in OTP-only flow
   */
  async registerUser(
    phone: string,
    firstName: string,
    lastName: string,
    password: string
  ) {
    throw new Error(
      "Password registration is deprecated. Please use OTP authentication."
    );
  }
}

export const realAuthService = new RealAuthService();
