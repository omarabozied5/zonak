// authService.ts - Updated to handle user name from backend response
import { realAuthService } from "./realAuthService";
import type { BackendUser } from "./types";
import { validation } from "./validation";
import { ExistingUser, AuthResult, UserCheckResult } from "./types";

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

// Helper to convert UserCheckResult userData to ExistingUser
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

export const authService = {
  validatePhone: validation.phone,

  /**
   * Check user status using login-otp-web endpoint
   * Returns token for both verified and unverified users
   * Now properly extracts user data from backend response
   */
  checkUserExists: async (phone: string): Promise<UserCheckResult> => {
    try {
      const result = await realAuthService.checkUserStatus(phone);

      switch (result.userType) {
        case "verified": {
          // Create user from actual backend data
          let user: ExistingUser;

          if (result.userData) {
            user = convertUserDataToExistingUser(result.userData, phone);
            console.log("✅ Using actual user data from backend:", {
              name: `${user.first_name} ${user.last_name}`,
              phone: user.phone,
            });
          } else {
            // Fallback to default values (should rarely happen now)
            user = {
              id: `verified_${Date.now()}`,
              first_name: "مستخدم",
              last_name: "مُفعل",
              phone: phone,
              lastLogin: new Date().toISOString(),
              isNewUser: false,
            };
            console.warn(
              "⚠️ Using fallback user data - backend didn't provide user info"
            );
          }

          return {
            exists: true,
            user: user,
            token: result.token,
            needsVerification: false,
          };
        }

        case "unverified": {
          // For unverified users, we may have user data for display purposes
          return {
            exists: true,
            user: result.userData
              ? convertUserDataToExistingUser(result.userData, phone)
              : null,
            token: result.token, // Include token for send_otp
            needsVerification: true,
          };
        }

        case "new":
        default: {
          return {
            exists: false,
            user: null,
            needsVerification: false,
          };
        }
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      throw error;
    }
  },

  /**
   * Send OTP - now requires token from previous login/registration
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
        registrationToken: result.token, // Same token, but explicit for send_otp
      };
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },

  /**
   * Login after OTP verification
   * Now properly extracts user name from backend response
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
