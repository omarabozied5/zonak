// authServices.ts
import {
  dummyUsers,
  generateDummyToken,
  validateUserCredentials,
} from "../lib/dummyData";
import {
  validatePhone,
  validateName,
  validateOTP,
  validatePassword,
} from "../lib/validationHelpers";

interface User {
  id: string;
  name: string;
  phone: string;
  password: string;
  createdAt?: string;
  lastLogin?: string;
}

interface UserCheckResponse {
  exists: boolean;
  user?: Omit<User, "password">;
  message?: string;
}

interface OTPResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
}

interface OTPVerificationResponse {
  success: boolean;
  message: string;
  user?: Omit<User, "password">;
  token?: string;
}

interface LoginResponse {
  success: boolean;
  user?: Omit<User, "password">;
  token?: string;
  message: string;
}

interface CreateUserResponse {
  success: boolean;
  user?: Omit<User, "password">;
  token?: string;
  message: string;
}

class AuthService {
  private dummyOTP = "1234"; // Hardcoded dummy OTP for testing

  /**
   * Simulate API delay
   */
  private async simulateDelay(ms: number = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Remove password from user object for security
   */
  private sanitizeUser(user: User): Omit<User, "password"> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Check if a user exists by phone number
   */
  async checkUserExists(phone: string): Promise<UserCheckResponse> {
    try {
      await this.simulateDelay(800);

      const existingUser = dummyUsers.find((user) => user.phone === phone);

      if (existingUser) {
        return {
          exists: true,
          user: this.sanitizeUser(existingUser),
          message: "المستخدم موجود",
        };
      }

      return {
        exists: false,
        message: "المستخدم غير موجود",
      };
    } catch (error) {
      console.error("Error checking user existence:", error);
      throw new Error("فشل في التحقق من وجود المستخدم");
    }
  }

  /**
   * Login existing user with phone number and password
   */
  async loginExistingUser(
    phone: string,
    password: string
  ): Promise<LoginResponse> {
    try {
      await this.simulateDelay(1000);

      const user = validateUserCredentials(phone, password);

      if (!user) {
        return {
          success: false,
          message: "رقم الهاتف أو كلمة المرور غير صحيحة",
        };
      }

      const token = generateDummyToken();
      const now = new Date().toISOString();

      // Update last login
      user.lastLogin = now;

      return {
        success: true,
        user: this.sanitizeUser({ ...user, lastLogin: now }),
        token,
        message: "تم تسجيل الدخول بنجاح",
      };
    } catch (error) {
      console.error("Error logging in user:", error);
      throw new Error("فشل في تسجيل الدخول");
    }
  }

  /**
   * Send OTP to new user's phone (simulate)
   */
  async sendOTP(phone: string): Promise<OTPResponse> {
    try {
      await this.simulateDelay(1200);

      // Check if user already exists
      const existingUser = dummyUsers.find((user) => user.phone === phone);
      if (existingUser) {
        return {
          success: false,
          message: "هذا الرقم مسجل مسبقاً",
        };
      }

      // Simulate sending OTP
      console.log(`Simulated OTP sent to ${phone}: ${this.dummyOTP}`);

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      return {
        success: true,
        message: "تم إرسال رمز التحقق بنجاح",
        expiresAt,
      };
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw new Error("فشل في إرسال رمز التحقق");
    }
  }

  /**
   * Verify OTP and create new user account
   */
  async verifyOTPAndCreateUser(
    phone: string,
    otp: string,
    name: string,
    password: string
  ): Promise<CreateUserResponse> {
    try {
      await this.simulateDelay(1500);

      // Verify OTP
      if (otp !== this.dummyOTP) {
        return {
          success: false,
          message: "رمز التحقق غير صحيح",
        };
      }

      // Check if user already exists
      const existingUser = dummyUsers.find((user) => user.phone === phone);
      if (existingUser) {
        return {
          success: false,
          message: "هذا الرقم مسجل مسبقاً",
        };
      }

      // Create new user
      const now = new Date().toISOString();
      const newUser: User = {
        id: `dummy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        phone,
        password,
        createdAt: now,
        lastLogin: now,
      };

      // Add to dummy users list
      dummyUsers.push(newUser);

      const token = generateDummyToken();

      return {
        success: true,
        user: this.sanitizeUser(newUser),
        token,
        message: "تم إنشاء حسابك بنجاح",
      };
    } catch (error) {
      console.error("Error verifying OTP and creating user:", error);
      throw new Error("فشل في التحقق من الرمز أو إنشاء الحساب");
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    return validatePhone(phone);
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone: string): string {
    if (!phone || phone.length !== 10) return phone;

    // Format: 05X-XXX-XXXX
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  }

  /**
   * Validate user name
   */
  validateUserName(name: string): { isValid: boolean; message?: string } {
    return validateName(name);
  }

  /**
   * Validate password
   */
  validatePassword(password: string): { isValid: boolean; message?: string } {
    return validatePassword(password);
  }

  /**
   * Validate OTP format
   */
  validateOTP(otp: string): { isValid: boolean; message?: string } {
    return validateOTP(otp);
  }

  /**
   * Get user profile by token (simulate)
   */
  async getUserProfile(token: string): Promise<Omit<User, "password">> {
    try {
      await this.simulateDelay(600);

      if (!token || !token.startsWith("dummy_token_")) {
        throw new Error("Invalid token");
      }

      // In a real implementation, you'd decode the token
      // For now, we'll just return the first user as a fallback
      const user = dummyUsers[0];

      if (!user) {
        throw new Error("User not found");
      }

      return this.sanitizeUser(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new Error("فشل في جلب بيانات المستخدم");
    }
  }

  /**
   * Update user profile (simulate)
   */
  async updateUserProfile(
    token: string,
    updates: Partial<Pick<User, "name">>
  ): Promise<Omit<User, "password">> {
    try {
      await this.simulateDelay(800);

      if (!token || !token.startsWith("dummy_token_")) {
        throw new Error("Invalid token");
      }

      // Find user by token (simplified)
      const user = dummyUsers[0]; // In real implementation, decode token to find user

      if (!user) {
        throw new Error("User not found");
      }

      // Update user
      if (updates.name) {
        user.name = updates.name.trim();
      }

      return this.sanitizeUser(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("فشل في تحديث بيانات المستخدم");
    }
  }

  /**
   * Logout user (simulate)
   */
  async logout(token: string): Promise<void> {
    try {
      await this.simulateDelay(300);

      // In a real implementation, you'd invalidate the token on the server
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      // Don't throw error for logout - we'll clear local state anyway
    }
  }

  /**
   * Get dummy OTP for testing purposes
   */
  getDummyOTP(): string {
    return this.dummyOTP;
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export types for use in components
export type {
  User,
  UserCheckResponse,
  OTPResponse,
  OTPVerificationResponse,
  LoginResponse,
  CreateUserResponse,
};
