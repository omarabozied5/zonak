// realAuthService.ts - Updated to handle name from login response
import axios, { AxiosInstance } from "axios";
import type {
  BackendUser,
  LoginOtpRequest,
  LoginOtpResponse,
  RegisterRequest,
  RegisterResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "./types";

const BASE_URL = "https://dev-backend.zonak.net/api";

// Device info constants based on API documentation
const DEVICE_INFO = {
  device_token: null,
  device_type: "w", // 'w' for web platform
  uuid: "ipaddress",
  os_version: "windows7",
  device_name: "dell",
  model_name: "dell",
  build_version_number: "1.0.0",
};

// Phone number helper functions
export const phoneHelpers = {
  /**
   * Format Saudi phone number to backend format
   * Input: "0512345678" or "512345678" or "+966512345678"
   * Output: "966512345678" (without +)
   */
  formatToBackend: (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, "");

    // If starts with 966, already formatted
    if (cleanPhone.startsWith("966")) {
      return cleanPhone;
    }

    // If starts with 05, remove 0 and add 966
    if (cleanPhone.startsWith("05")) {
      return "966" + cleanPhone.substring(1);
    }

    // If starts with 5, add 966
    if (cleanPhone.startsWith("5")) {
      return "966" + cleanPhone;
    }

    throw new Error("Invalid phone number format");
  },

  /**
   * Format phone for display
   * Input: "966512345678" or "0512345678"
   * Output: "+966 51 234 5678"
   */
  formatForDisplay: (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, "");

    let normalizedNumber = cleanPhone;

    // If starts with 966, use as is
    if (cleanPhone.startsWith("966")) {
      normalizedNumber = cleanPhone.substring(3);
    }
    // If starts with 05, remove 0
    else if (cleanPhone.startsWith("05")) {
      normalizedNumber = cleanPhone.substring(1);
    }

    // Format as +966 XX XXX XXXX
    if (normalizedNumber.length === 9) {
      return `+966 ${normalizedNumber.substring(
        0,
        2
      )} ${normalizedNumber.substring(2, 5)} ${normalizedNumber.substring(5)}`;
    }

    return phone; // Return original if can't format
  },
};

// User status type based on API documentation
export type UserStatusType = "new" | "verified" | "unverified";

// Extended UserCheckResult to include token and user data
export interface UserCheckResult {
  userType: UserStatusType;
  token?: string;
  message: string;
  userData?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
}

// JWT decode helper function (simplified version)
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.warn("Failed to decode JWT:", error);
    return null;
  }
};

// Real Authentication Service
export class RealAuthService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(
          `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
          {
            data: config.data,
            headers: config.headers,
          }
        );
        return config;
      },
      (error) => {
        console.error("❌ Request error:", error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status}`, response.data);
        return response;
      },
      (error) => {
        console.error(
          "❌ Response error:",
          error.response?.status,
          error.response?.data || error.message
        );
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check user status using login-otp-web endpoint
   * Based on API documentation:
   * - is_otp_verified: 1 = verified user (Auto login)
   * - is_otp_verified: 0 or null = unverified user (Send OTP)
   * - 404 error = new user (Registration flow)
   */
  async checkUserStatus(phone: string): Promise<UserCheckResult> {
    try {
      const formattedPhone = phoneHelpers.formatToBackend(phone);
      console.log(`🔍 Checking user status for: ${phone} -> ${formattedPhone}`);

      const payload: LoginOtpRequest = {
        phone: formattedPhone,
        ...DEVICE_INFO,
      };

      const response = await this.axiosInstance.post<LoginOtpResponse>(
        "/login-otp-web",
        payload
      );

      const {
        data: token,
        is_otp_verified,
        message,
        code,
        name,
      } = response.data;

      // Check if request was successful
      if (code !== "0") {
        throw new Error(message || "Failed to check user status");
      }

      console.log(
        `📊 API Response - is_otp_verified: ${is_otp_verified}, name: ${name}`
      );

      // Parse the name from backend response
      let firstName = "مستخدم";
      let lastName = "";

      if (name && name.trim()) {
        const nameParts = name.trim().split(" ");
        firstName = nameParts[0] || "مستخدم";
        lastName = nameParts.slice(1).join(" ") || "";
        console.log(`👤 Parsed name: ${firstName} ${lastName}`);
      }

      // Try to decode JWT to get additional user information
      const decodedToken = decodeJWT(token);
      let userId = `user_${Date.now()}`;

      if (decodedToken) {
        console.log("🔑 Decoded JWT payload:", decodedToken);
        userId = decodedToken.sub || decodedToken.user_id || userId;
      }

      // Create user data object
      const userData = {
        id: userId,
        first_name: firstName,
        last_name: lastName,
        phone: formattedPhone,
      };

      // Based on your API docs, is_otp_verified can be 1 (verified) or null/0 (unverified)
      if (is_otp_verified === 1) {
        // User is verified - auto login
        console.log("✅ User is verified - returning token for auto login");
        return {
          userType: "verified",
          token: token, // JWT token for authenticated requests
          message: "User is verified and logged in",
          userData: userData,
        };
      } else {
        // User exists but not verified (is_otp_verified: null or 0)
        // Return the token so it can be used for send_otp
        console.log("⚠️ User exists but not verified - needs OTP verification");
        return {
          userType: "unverified",
          token: token, // JWT token needed for send_otp
          message: "User exists but not verified",
          userData: userData, // Include user data for unverified users too
        };
      }
    } catch (error) {
      console.error("❌ Error checking user status:", error);

      if (axios.isAxiosError(error)) {
        // Handle 404 - user not found, redirect to registration
        if (error.response?.status === 404) {
          console.log("🆕 User not found (404) - needs registration");
          return {
            userType: "new",
            message: "User not found - needs registration",
          };
        }

        const errorMessage =
          error.response?.data?.message || "فشل في التحقق من حالة المستخدم";
        throw new Error(errorMessage);
      }

      throw new Error("حدث خطأ في الاتصال بالخادم");
    }
  }

  /**
   * Send OTP for verification
   * Uses send_otp endpoint with form-data format
   * REQUIRES: x-auth-token header with JWT token from login/registration
   */
  async sendOTP(
    phone: string,
    token: string
  ): Promise<{
    sessionId: string;
    message: string;
  }> {
    try {
      const formattedPhone = phoneHelpers.formatToBackend(phone);
      console.log(`📱 Sending OTP to: ${phone} -> ${formattedPhone}`);
      console.log(`🔑 Using token: ${token.substring(0, 20)}...`);

      // Validate inputs
      if (!token || token.trim() === "") {
        throw new Error("Token is required for sending OTP");
      }

      if (!formattedPhone || formattedPhone.length < 10) {
        throw new Error("Invalid phone number format");
      }

      // Create form data as per API documentation
      const formData = new FormData();
      formData.append("phone", formattedPhone);
      formData.append("lang", "Ar"); // Arabic language

      // Log what we're sending
      console.log("📝 Sending OTP request:", {
        phone: formattedPhone,
        lang: "Ar",
        tokenLength: token.length,
      });

      const response = await this.axiosInstance.post<SendOtpResponse>(
        "/send_otp",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-auth-token": token, // REQUIRED: JWT token from login/registration
          },
        }
      );

      // Validate response
      if (!response || !response.data) {
        throw new Error("No response received from server");
      }

      if (!response.data.id) {
        console.error("❌ Missing session ID in response:", response.data);
        throw new Error("لم يتم إنشاء جلسة التحقق بشكل صحيح");
      }

      console.log("✅ OTP sent successfully:", {
        sessionId: response.data.id,
        message: response.data.message,
        phone: response.data.phone,
      });

      return {
        sessionId: response.data.id,
        message: response.data.message,
      };
    } catch (error) {
      console.error("❌ Error sending OTP:", error);

      if (axios.isAxiosError(error)) {
        // Log detailed error information
        console.error("Status:", error.response?.status);
        console.error("Response data:", error.response?.data);
        console.error("Request headers:", error.config?.headers);

        // Handle specific error cases
        if (error.response?.status === 401) {
          throw new Error("انتهت صلاحية الجلسة، يرجى المحاولة من البداية");
        } else if (error.response?.status === 400) {
          throw new Error("بيانات غير صحيحة. يرجى التحقق من رقم الهاتف");
        } else if (error.response?.status === 403) {
          throw new Error("غير مسموح. يرجى التحقق من صحة التوكن");
        } else if (error.response?.status === 500) {
          throw new Error("خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً");
        }

        const errorMessage =
          error.response?.data?.message || "فشل في إرسال رمز التحقق";
        throw new Error(errorMessage);
      }

      throw new Error("حدث خطأ في الاتصال بالخادم");
    }
  }

  /**
   * Verify OTP using session ID - FIXED VERSION
   * Uses verify_otp endpoint with proper error handling
   */
  async verifyOTP(
    phone: string,
    otp: string,
    sessionId: string,
    token: string
  ): Promise<{
    isValid: boolean;
    message: string;
  }> {
    try {
      const formattedPhone = phoneHelpers.formatToBackend(phone);
      console.log("🔐 OTP Verification Debug Info:", {
        originalPhone: phone,
        formattedPhone: formattedPhone,
        sessionId: sessionId,
        otp: otp,
        otpLength: otp.length,
        sessionIdType: typeof sessionId,
      });

      // Validate inputs
      if (!sessionId || sessionId.trim() === "") {
        throw new Error("Session ID is required");
      }

      if (!otp || otp.length !== 4) {
        throw new Error("OTP must be 4 digits");
      }

      if (!/^\d{4}$/.test(otp)) {
        throw new Error("OTP must contain only digits");
      }

      // Try URLSearchParams instead of FormData for better compatibility
      const params = new URLSearchParams();
      params.append("id", sessionId.toString().trim());
      params.append("code", otp.toString().trim());
      params.append("lang", "Ar");
      params.append("phone", formattedPhone);

      // Log the exact data being sent
      console.log("📝 Sending verification data:", {
        id: sessionId.toString().trim(),
        code: otp.toString().trim(),
        lang: "Ar",
        phone: formattedPhone,
      });

      console.log("📤 Raw URLSearchParams string:", params.toString());

      const response = await this.axiosInstance.post<VerifyOtpResponse>(
        "/verify_otp",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-auth-token": token, // Use session ID as token for verification
          },
          // Add timeout to prevent hanging
          timeout: 15000,
        }
      );

      console.log("📥 Raw response:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      });

      // Check if response exists
      if (!response) {
        console.error("❌ No response object received");
        throw new Error("لم يتم استلام رد من الخادم");
      }

      // Check if response.data exists
      if (!response.data) {
        console.error("❌ No response data received");
        throw new Error("لم يتم استلام بيانات من الخادم");
      }

      // Check for success message
      const responseMessage = response.data.message || "";
      const isValid =
        responseMessage.includes("تم بنجاح") || responseMessage === "تم بنجاح";

      console.log(
        `✅ OTP verification result: ${isValid ? "SUCCESS" : "FAILED"}`,
        {
          responseMessage,
          expectedMessage: "تم بنجاح",
          isMatch: isValid,
        }
      );

      return {
        isValid,
        message: responseMessage || "رد غير متوقع من الخادم",
      };
    } catch (error) {
      console.error("❌ Full error details:", error);

      if (axios.isAxiosError(error)) {
        console.error("🔍 Axios Error Details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            data: error.config?.data,
          },
        });

        // Handle specific status codes with detailed logging
        if (error.response?.status === 500) {
          console.error("🚨 Server Error (500):", {
            responseData: error.response.data,
            possibleCauses: [
              "Invalid session ID",
              "Expired OTP session",
              "Invalid OTP code",
              "Database/backend error",
              "Incorrect data format",
            ],
          });

          // Try to extract meaningful error message
          const errorData = error.response?.data;
          if (errorData) {
            if (typeof errorData === "string") {
              throw new Error(`خطأ في الخادم: ${errorData}`);
            } else if (errorData.message) {
              throw new Error(errorData.message);
            } else if (errorData.error) {
              throw new Error(errorData.error);
            }
          }

          throw new Error(
            "خطأ في الخادم. قد يكون رمز التحقق منتهي الصلاحية أو غير صحيح"
          );
        } else if (error.response?.status === 400) {
          throw new Error("رمز التحقق غير صحيح أو منتهي الصلاحية");
        } else if (error.response?.status === 404) {
          throw new Error("جلسة التحقق غير موجودة. يرجى طلب رمز جديد");
        } else if (error.response?.status === 422) {
          throw new Error("بيانات غير صحيحة. يرجى التحقق من الرمز");
        }

        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "فشل في تأكيد رمز التحقق";
        throw new Error(errorMessage);
      }

      // Handle network errors
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          throw new Error("انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى");
        } else if (error.message.includes("Network Error")) {
          throw new Error("خطأ في الشبكة. يرجى التحقق من الاتصال");
        }
      }

      throw new Error("حدث خطأ غير متوقع في الاتصال بالخادم");
    }
  }

  /**
   * Register new user
   * Uses register-web endpoint with form-data format
   */
  async registerUser(
    phone: string,
    firstName: string,
    lastName: string,
    password: string,
    latitude: string = "24.7136", // Riyadh coordinates as default
    longitude: string = "46.6753"
  ): Promise<{
    user: BackendUser;
    token: string;
    message: string;
  }> {
    try {
      const formattedPhone = phoneHelpers.formatToBackend(phone);
      console.log(
        `👤 Registering user: ${firstName} ${lastName}, Phone: ${formattedPhone}`
      );

      // Create form data as per API documentation
      const formData = new FormData();
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());
      formData.append("phone", formattedPhone);
      formData.append("password", password);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);

      // Add device info
      Object.entries(DEVICE_INFO).forEach(([key, value]) => {
        formData.append(key, value?.toString() || "");
      });

      const response = await this.axiosInstance.post<RegisterResponse>(
        "/register-web",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { data: token, message, code } = response.data;

      if (code !== "0") {
        throw new Error(message || "فشل في إنشاء الحساب");
      }

      console.log("✅ User registered successfully");

      // Create user object from registration data (use actual data, not from JWT yet)
      const user: BackendUser = {
        id: `user_${Date.now()}`, // This should come from JWT decode in production
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: formattedPhone,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isNewUser: true,
      };

      return {
        user,
        token, // This token will be used for send_otp
        message,
      };
    } catch (error) {
      console.error("❌ Error registering user:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "فشل في إنشاء الحساب";
        throw new Error(errorMessage);
      }

      throw new Error("حدث خطأ في الاتصال بالخادم");
    }
  }

  /**
   * After OTP verification for existing users, get their token via login-otp-web
   * Now extracts user data from JWT token
   */
  async loginAfterOTPVerification(phone: string): Promise<{
    user: BackendUser;
    token: string;
    message: string;
  }> {
    try {
      const result = await this.checkUserStatus(phone);

      if (result.userType !== "verified" || !result.token) {
        throw new Error("User not verified after OTP");
      }

      // Try to get user data from the result or decode JWT
      let userData = result.userData;
      if (!userData) {
        // Fallback: try to decode JWT
        const decodedToken = decodeJWT(result.token);
        if (decodedToken) {
          userData = {
            id:
              decodedToken.user_id || decodedToken.sub || `user_${Date.now()}`,
            first_name:
              decodedToken.first_name ||
              decodedToken.name?.split(" ")[0] ||
              "مستخدم",
            last_name:
              decodedToken.last_name ||
              decodedToken.name?.split(" ").slice(1).join(" ") ||
              "",
            phone: phoneHelpers.formatToBackend(phone),
          };
        }
      }

      // Create user object - use actual data from JWT or API response
      const user: BackendUser = {
        id: userData?.id || `user_${Date.now()}`,
        first_name: userData?.first_name || "مستخدم",
        last_name: userData?.last_name || "",
        phone: phoneHelpers.formatToBackend(phone),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isNewUser: false,
      };

      console.log("✅ Login after OTP verification successful:", {
        userId: user.id,
        userName: `${user.first_name} ${user.last_name}`,
        phone: user.phone,
      });

      return {
        user,
        token: result.token,
        message: result.message,
      };
    } catch (error) {
      console.error("❌ Error logging in after OTP verification:", error);
      throw error;
    }
  }

  /**
   * Validate phone number format
   */
  validatePhone(phone: string): {
    isValid: boolean;
    message: string;
    formattedPhone: string;
  } {
    try {
      const backendFormat = phoneHelpers.formatToBackend(phone);
      const displayFormat = phoneHelpers.formatForDisplay(phone);

      return {
        isValid: true,
        message: "",
        formattedPhone: displayFormat,
      };
    } catch (error) {
      return {
        isValid: false,
        message: "رقم الجوال يجب أن يكون سعودي ويبدأ بـ 05 أو 5",
        formattedPhone: phone,
      };
    }
  }

  /**
   * Format phone for display
   */
  formatPhoneForDisplay(phone: string): string {
    return phoneHelpers.formatForDisplay(phone);
  }
}

// Create singleton instance
export const realAuthService = new RealAuthService();

// Re-export types for backward compatibility
export type { BackendUser } from "./types";
