// authService.ts - Updated wrapper for OTP-only authentication
import { realAuthService, formatPhoneForDisplay } from "./realAuthService";
import { validation } from "./validation";
import type { ExistingUser } from "./types";

export const authService = {
  // Validation helpers
  validatePhone: validation.phone,
  validatePassword: validation.password, // Keep for legacy, but won't be used
  validateOTP: validation.otp,
  validateUserName: validation.name,

  // Format phone for display
  formatPhoneNumber: (phone: string): string => {
    return formatPhoneForDisplay(phone);
  },

  /**
   * NEW FLOW: Send OTP to phone number
   * This is the first step for ALL users (existing and new)
   */
  async sendOTP(phone: string) {
    try {
      const result = await realAuthService.sendOTP(phone);

      return {
        sessionId: result.id,
        message: result.message,
        phone: result.phone,
      };
    } catch (error) {
      console.error("Send OTP failed:", error);
      throw error;
    }
  },

  /**
   * NEW FLOW: Verify OTP and get user info
   * Returns JWT token + user data + is_new_user flag
   */
  async verifyOTP(phone: string, otp: string, sessionId: string) {
    try {
      const result = await realAuthService.verifyOTP(phone, otp, sessionId);

      // If existing user, return complete user data
      if (!result.is_new_user && result.user) {
        const user: ExistingUser = {
          id: result.user.id,
          first_name: result.user.first_name || "مستخدم",
          last_name: result.user.last_name || "",
          phone: result.user.phone,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isNewUser: false,
        };

        return {
          isValid: true,
          isNewUser: false,
          token: result.data,
          user,
          message: result.message,
        };
      }

      // If new user, return minimal data (needs name completion)
      return {
        isValid: true,
        isNewUser: true,
        token: result.data,
        user: null,
        message: result.message,
      };
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  },

  /**
   * NEW: Update names for new users after OTP verification
   */
  async updateUserNames(
    firstName: string,
    lastName: string,
    phone: string,
    token: string
  ) {
    try {
      const result = await realAuthService.updateNames(
        firstName,
        lastName,
        phone,
        token
      );

      // After successful update, create user object
      // Decode JWT to get real user ID
      const jwtPayload = token.split(".")[1];
      const decoded = JSON.parse(atob(jwtPayload));
      const userId = decoded?.user_id || decoded?.sub || decoded?.id;

      const user: ExistingUser = {
        id: userId?.toString() || `user_${Date.now()}`,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isNewUser: true,
      };

      return {
        user,
        message: result.message,
      };
    } catch (error) {
      console.error("Update names failed:", error);
      throw error;
    }
  },

  /**
   * DEPRECATED: No longer used in OTP-only flow
   */
  async checkUserExists(phone: string) {
    throw new Error("checkUserExists is deprecated. Use sendOTP instead.");
  },

  /**
   * DEPRECATED: No longer used in OTP-only flow
   */
  async loginWithPassword(phone: string, password: string) {
    throw new Error("Password login is deprecated. Use OTP authentication.");
  },

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
      "Password registration is deprecated. Use OTP authentication."
    );
  },

  /**
   * DEPRECATED: No longer used in OTP-only flow
   */
  async loginAfterOTPVerification(phone: string, password: string) {
    throw new Error(
      "loginAfterOTPVerification is deprecated. Use verifyOTP instead."
    );
  },
};
