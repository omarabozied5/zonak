// authService.ts - Fixed wrapper with proper JWT handling
import { realAuthService, formatPhoneForDisplay } from "./realAuthService";
import { validation } from "./validation";
import type { ExistingUser } from "./types";

export const authService = {
  // Validation helpers
  validatePhone: validation.phone,
  validatePassword: validation.password,
  validateOTP: validation.otp,
  validateUserName: validation.name,

  // Format phone for display
  formatPhoneNumber: (phone: string): string => {
    return formatPhoneForDisplay(phone);
  },

  /**
   * Check if user exists by trying login
   * Returns user type: "new" | "verified" | "unverified"
   */
  async checkUserExists(phone: string) {
    try {
      // Try login with empty password to check if user exists
      const result = await realAuthService.loginWithPassword(phone, "");

      // This shouldn't happen with empty password, but just in case
      if (result.success) {
        return {
          exists: true,
          user: result.userData
            ? {
                id: result.userData.id,
                first_name: result.userData.first_name,
                last_name: result.userData.last_name,
                phone: result.userData.phone,
                lastLogin: new Date().toISOString(),
                isNewUser: false,
              }
            : null,
        };
      }

      return { exists: false, user: null };
    } catch (error) {
      // If we get an error about invalid credentials, user exists
      if (
        error instanceof Error &&
        (error.message.includes("Invalid") ||
          error.message.includes("password") ||
          error.message.includes("كلمة المرور"))
      ) {
        return { exists: true, user: null };
      }

      // 404 or user not found = new user
      return { exists: false, user: null };
    }
  },

  /**
   * Login with phone and password
   */
  async loginWithPassword(phone: string, password: string) {
    try {
      const result = await realAuthService.loginWithPassword(phone, password);

      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        userType: result.userType,
        user: result.userData
          ? {
              id: result.userData.id,
              first_name: result.userData.first_name,
              last_name: result.userData.last_name,
              phone: result.userData.phone,
              lastLogin: new Date().toISOString(),
              isNewUser: false,
            }
          : undefined,
        token: result.token!,
      };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

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
      const result = await realAuthService.registerUser(
        phone,
        firstName,
        lastName,
        password
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        registrationToken: result.token!,
        user: {
          id: `temp_registration_${Date.now()}`, // Temporary ID for registration
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          createdAt: new Date().toISOString(),
          isNewUser: true,
        },
      };
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  },

  /**
   * Send OTP
   */
  async sendOTP(phone: string, token: string) {
    try {
      const result = await realAuthService.sendOTP(phone, token);

      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        sessionId: result.sessionId!,
        message: result.message,
      };
    } catch (error) {
      console.error("Send OTP failed:", error);
      throw error;
    }
  },

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
      const result = await realAuthService.verifyOTP(
        phone,
        otp,
        sessionId,
        token
      );
      return result.isValid;
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  },

  /**
   * Final login after OTP verification - FIXED TO GET REAL USER DATA
   */
  async loginAfterOTPVerification(phone: string, password: string) {
    try {
      console.log("🔑 Performing final login after OTP verification...");

      // Call the real login API again to get updated token with verified status
      const result = await realAuthService.loginWithPassword(phone, password);

      if (!result.success) {
        throw new Error("Failed to complete login after verification");
      }

      console.log("✅ Final login successful, user data:", result.userData);

      // Return the real user data from the backend
      const user: ExistingUser = {
        id: result.userData?.id || `fallback_${Date.now()}`,
        first_name: result.userData?.first_name || "مستخدم",
        last_name: result.userData?.last_name || "",
        phone: result.userData?.phone || phone,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isNewUser: false,
      };

      return {
        user,
        token: result.token!, // Real JWT token from backend
      };
    } catch (error) {
      console.error("❌ Final login after OTP failed:", error);
      throw error;
    }
  },
};
