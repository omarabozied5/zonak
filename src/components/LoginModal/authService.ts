// authService.ts
import { validation } from "./validation";
import { ExistingUser, AuthResult, UserCheckResult } from "./types";

export const authService = {
  validatePhone: validation.phone,

  checkUserExists: async (phone: string): Promise<UserCheckResult> => {
    const mockUsers: ExistingUser[] = [
      { id: "1", name: "أحمد محمد", phone: "0512345678", countryCode: "+966" },
      { id: "2", name: "فاطمة علي", phone: "0523456789", countryCode: "+966" },
      {
        id: "3",
        name: "محمد عبدالله",
        phone: "0534567890",
        countryCode: "+966",
      },
    ];

    const phoneValidation = authService.validatePhone(phone);
    if (!phoneValidation.isValid) {
      return { exists: false, user: null };
    }

    const normalizedPhone = phone.replace(/\D/g, "");
    const user = mockUsers.find((u) => {
      const userPhone = u.phone.replace(/\D/g, "");
      return (
        userPhone === normalizedPhone ||
        userPhone === normalizedPhone.substring(3) ||
        `966${userPhone}` === normalizedPhone
      );
    });

    return { exists: !!user, user: user || null };
  },

  loginExistingUser: async (
    phone: string,
    password: string
  ): Promise<AuthResult> => {
    if (password === "12345678") {
      const phoneValidation = authService.validatePhone(phone);
      const mockUser: ExistingUser = {
        id: Date.now().toString(),
        name: "مستخدم تجريبي",
        phone,
        countryCode: phoneValidation.countryCode,
      };
      return { user: mockUser, token: "mock-token-" + Date.now() };
    }
    throw new Error("كلمة المرور غير صحيحة");
  },

  sendOTP: async (phone: string): Promise<void> => {
    const phoneValidation = authService.validatePhone(phone);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.message);
    }
    return Promise.resolve();
  },

  verifyOTPAndCreateUser: async (
    phone: string,
    otp: string,
    name: string,
    password: string
  ): Promise<AuthResult> => {
    if (otp === "1234") {
      const phoneValidation = authService.validatePhone(phone);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message);
      }
      const mockUser: ExistingUser = {
        id: Date.now().toString(),
        name,
        phone,
        countryCode: phoneValidation.countryCode,
        isNewUser: true,
      };
      return { user: mockUser, token: "mock-token-" + Date.now() };
    }
    throw new Error("رمز التحقق غير صحيح");
  },
};
