// authService.ts - Updated with separate phone check and password login
import { realAuthService } from "./realAuthService";
import type { BackendUser } from "./types";
import { validation } from "./validation";
import { ExistingUser, AuthResult } from "./types";

const convertBackendUserToExistingUser = (
  backendUser: BackendUser
): ExistingUser => {
  return {
    id: backendUser.id,
    first_name: backendUser.first_name,
    last_name: backendUser.last_name,
    phone: backendUser.phone,
    createdAt: backendUser.createdAt,
    lastLogin: backendUser.lastLogin,
    isNewUser: backendUser.isNewUser,
  };
};

// Helper to convert user data to ExistingUser
const convertUserDataToExistingUser = (
  userData: any,
  phone: string
): ExistingUser => {
  return {
    id: userData.id,
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone: phone,
    createdAt: userData.createdAt || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isNewUser: false,
  };
};

// New interfaces for the updated flow
export interface UserExistsResult {
  exists: boolean;
  message: string;
  user?: ExistingUser;
}

export interface UserLoginResult {
  userType: "verified" | "unverified";
  user: ExistingUser;
  token: string;
  needsVerification: boolean;
}

export const authService = {
  validatePhone: validation.phone,

  /**
   * Check if user exists (phone only)
   * Used in the first step to determine if user should go to password step or registration
   */
  checkUserExists: async (phone: string): Promise<UserExistsResult> => {
    try {
      const result = await realAuthService.checkUserExists(phone);
      return {
        exists: result.exists,
        message: result.message,
        user: result.userData
          ? convertUserDataToExistingUser(result.userData, phone)
          : undefined,
      };
    } catch (error) {
      console.error("Error checking if user exists:", error);
      throw error;
    }
  },

  /**
   * Login with phone and password
   * Used after phone check confirms user exists
   */
  loginWithPassword: async (
    phone: string,
    password: string
  ): Promise<UserLoginResult> => {
    try {
      const result = await realAuthService.loginWithPassword(phone, password);

      // Convert user data to ExistingUser format
      let user: ExistingUser;

      if (result.userData) {
        user = convertUserDataToExistingUser(result.userData, phone);
        console.log("✅ Using user data from login response:", {
          name: `${user.first_name} ${user.last_name}`,
          phone: user.phone,
        });
      } else {
        // Fallback user data
        user = {
          id: `user_${Date.now()}`,
          first_name: "مستخدم",
          last_name: "",
          phone: phone,
          lastLogin: new Date().toISOString(),
          isNewUser: false,
        };
        console.warn("⚠️ Using fallback user data - no data in login response");
      }

      switch (result.userType) {
        case "verified":
          return {
            userType: "verified",
            user: user,
            token: result.token!,
            needsVerification: false,
          };

        case "unverified":
          return {
            userType: "unverified",
            user: user,
            token: result.token!,
            needsVerification: true,
          };

        default:
          throw new Error("Unexpected user type from login");
      }
    } catch (error) {
      console.error("Error logging in with password:", error);
      throw error;
    }
  },

  /**
   * Send OTP - requires token from login
   */
  sendOTP: async (
    phone: string,
    token: string
  ): Promise<{ sessionId: string; message: string }> => {
    try {
      if (!token) {
        throw new Error("Token required for sending OTP");
      }
      return await realAuthService.sendOTP(phone, token);
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw error;
    }
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (
    phone: string,
    otp: string,
    sessionId: string,
    token: string
  ): Promise<boolean> => {
    try {
      const result = await realAuthService.verifyOTP(
        phone,
        otp,
        sessionId,
        token
      );
      return result.isValid;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  },

  /**
   * Register new user - creates account immediately and returns token
   */
  registerUser: async (
    phone: string,
    firstName: string,
    lastName: string,
    password: string
  ): Promise<AuthResult & { registrationToken: string }> => {
    try {
      const result = await realAuthService.registerUser(
        phone,
        firstName,
        lastName,
        password
      );
      const user = convertBackendUserToExistingUser(result.user);

      return {
        user,
        token: result.token,
        registrationToken: result.token, // Same token for send_otp
      };
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },

  /**
   * Login after OTP verification
   */
  loginAfterOTPVerification: async (phone: string): Promise<AuthResult> => {
    try {
      const result = await realAuthService.loginAfterOTPVerification(phone);
      return {
        user: convertBackendUserToExistingUser(result.user),
        token: result.token,
      };
    } catch (error) {
      console.error("Error logging in after OTP verification:", error);
      throw error;
    }
  },

  /**
   * Format phone number for display
   */
  formatPhoneNumber: (phone: string): string => {
    return realAuthService.formatPhoneForDisplay(phone);
  },

  validateUserName: validation.name,
  validatePassword: validation.password,
  validateOTP: validation.otp,
};
