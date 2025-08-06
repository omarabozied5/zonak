// realAuthService.ts - Updated with separate phone check and password login
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

// User existence check result
export interface UserExistsResult {
  exists: boolean;
  message: string;
  userData?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

// Extended UserCheckResult for login with password
export interface UserLoginResult {
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
   * Check if user exists (phone only check)
   * Uses login-otp-web endpoint without password to determine user existence
   */
  async checkUserExists(phone: string): Promise<UserExistsResult> {
    try {
      const formattedPhone = phoneHelpers.formatToBackend(phone);
      console.log(
        `🔍 Checking if user exists for: ${phone} -> ${formattedPhone}`
      );

      // Try to call login-otp-web without password to check user existence
      const payload = {
        phone: formattedPhone,
        ...DEVICE_INFO,
      };

      const response = await this.axiosInstance.post<LoginOtpResponse>(
        "/login-otp-web",
        payload
      );

      console.log("✅ User exists check response:", response.data);
      const { name } = response.data;
      let userData = null;

      if (name && name.trim()) {
        const nameParts = name.trim().split(" ");
        userData = {
          first_name: nameParts[0] || "مستخدم",
          last_name: nameParts.slice(1).join(" ") || "",
          phone: formattedPhone,
        };
      }

      // If we get a response, user exists
      return {
        exists: true,
        message: "User exists",
        userData: userData,
      };
    } catch (error) {
      console.error("❌ Error checking user existence:", error);

      if (axios.isAxiosError(error)) {
        // Handle 404 - user not found
        if (error.response?.status === 404) {
          console.log("🆕 User not found (404) - user doesn't exist");
          return {
            exists: false,
            message: "User not found - new user",
          };
        }

        // Handle 400 - might indicate missing password for existing user
        if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || "";
          if (
            errorMessage.includes("password") ||
            errorMessage.includes("required")
          ) {
            console.log("✅ User exists but password required");
            return {
              exists: true,
              message: "User exists - password required",
            };
          }
        }

        // Other errors might also indicate user exists but other issues
        if (error.response?.status && error.response.status < 500) {
          console.log("⚠️ User likely exists but authentication issue");
          return {
            exists: true,
            message: "User exists - authentication required",
          };
        }

        throw new Error(
          error.response?.data?.message || "فشل في التحقق من وجود المستخدم"
        );
      }

      throw new Error("حدث خطأ في الاتصال بالخادم");
    }
  }

  /**
   * Login with phone and password
   * Uses login-otp-web endpoint with full credentials
   */
  async loginWithPassword(
    phone: string,
    password: string
  ): Promise<UserLoginResult> {
    try {
      const formattedPhone = phoneHelpers.formatToBackend(phone);
      console.log(`🔐 Logging in user: ${phone} -> ${formattedPhone}`);

      const payload: LoginOtpRequest = {
        phone: formattedPhone,
        password: password,
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
        throw new Error(message || "فشل في تسجيل الدخول");
      }

      console.log(
        `📊 Login Response - is_otp_verified: ${is_otp_verified}, name: ${name}`
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

      // Based on API docs, is_otp_verified can be 1 (verified) or null/0 (unverified)
      if (is_otp_verified === 1) {
        // User is verified - complete login
        console.log("✅ User is verified - login successful");
        return {
          userType: "verified",
          token: token,
          message: "Login successful - user verified",
          userData: userData,
        };
      } else {
        // User login successful but not verified - needs OTP
        console.log("⚠️ Login successful but user not verified - needs OTP");
        return {
          userType: "unverified",
          token: token,
          message: "Login successful but verification required",
          userData: userData,
        };
      }
    } catch (error) {
      console.error("❌ Error logging in with password:", error);

      if (axios.isAxiosError(error)) {
        // Handle specific error cases
        if (error.response?.status === 401) {
          throw new Error("كلمة المرور غير صحيحة");
        } else if (error.response?.status === 404) {
          throw new Error("المستخدم غير موجود");
        } else if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || "";
          if (errorMessage.includes("password")) {
            throw new Error("كلمة المرور مطلوبة");
          }
          throw new Error("بيانات غير صحيحة");
        }

        const errorMessage =
          error.response?.data?.message || "فشل في تسجيل الدخول";
        throw new Error(errorMessage);
      }

      throw new Error("حدث خطأ في الاتصال بالخادم");
    }
  }

  /**
   * Send OTP for verification
   * Uses send_otp endpoint with form-data format
   * REQUIRES: x-auth-token header with JWT token from login
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
            "x-auth-token": token, // REQUIRED: JWT token from login
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
   * Verify OTP using session ID
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

      // Try URLSearchParams for better compatibility
      const params = new URLSearchParams();
      params.append("id", sessionId.toString().trim());
      params.append("code", otp.toString().trim());
      params.append("lang", "Ar");
      params.append("phone", formattedPhone);

      console.log("📝 Sending verification data:", {
        id: sessionId.toString().trim(),
        code: otp.toString().trim(),
        lang: "Ar",
        phone: formattedPhone,
      });

      const response = await this.axiosInstance.post<VerifyOtpResponse>(
        "/verify_otp",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-auth-token": token,
          },
          timeout: 15000,
        }
      );

      console.log("📥 Raw response:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      if (!response || !response.data) {
        throw new Error("لم يتم استلام رد من الخادم");
      }

      const responseMessage = response.data.message || "";
      const isValid =
        responseMessage.includes("تم بنجاح") || responseMessage === "تم بنجاح";

      console.log(
        `✅ OTP verification result: ${isValid ? "SUCCESS" : "FAILED"}`,
        { responseMessage, isValid }
      );

      return {
        isValid,
        message: responseMessage || "رد غير متوقع من الخادم",
      };
    } catch (error) {
      console.error("❌ OTP verification error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
          throw new Error(
            "خطأ في الخادم. قد يكون رمز التحقق منتهي الصلاحية أو غير صحيح"
          );
        } else if (error.response?.status === 400) {
          throw new Error("رمز التحقق غير صحيح أو منتهي الصلاحية");
        } else if (error.response?.status === 404) {
          throw new Error("جلسة التحقق غير موجودة. يرجى طلب رمز جديد");
        }

        const errorMessage =
          error.response?.data?.message || "فشل في تأكيد رمز التحقق";
        throw new Error(errorMessage);
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

      const user: BackendUser = {
        id: `user_${Date.now()}`,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: formattedPhone,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isNewUser: true,
      };

      return {
        user,
        token,
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
   * After OTP verification, get final authenticated token
   */
  async loginAfterOTPVerification(phone: string): Promise<{
    user: BackendUser;
    token: string;
    message: string;
  }> {
    try {
      // For now, we'll use the existing token from the login
      // In a real scenario, you might need to call another endpoint
      // to get a fresh token after OTP verification

      const formattedPhone = phoneHelpers.formatToBackend(phone);

      // Create a basic user object - this should ideally come from the backend
      const user: BackendUser = {
        id: `user_${Date.now()}`,
        first_name: "مستخدم",
        last_name: "مُفعل",
        phone: formattedPhone,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isNewUser: false,
      };

      return {
        user,
        token: "temp_token", // This should be a real token from your backend
        message: "تم تسجيل الدخول بنجاح",
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
