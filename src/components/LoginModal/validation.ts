// validation.ts
import { PhoneValidationResult } from "./types";

export const validation = {
  phone: (phone: string): PhoneValidationResult => {
    const cleanPhone = phone.replace(/\s/g, "");
    const SAUDI_PHONE_REGEX = /^(\+966|0)?5\d{8}$/;

    if (!cleanPhone) {
      return {
        isValid: false,
        message: "يرجى إدخال رقم الجوال",
        countryCode: "",
        formattedPhone: phone,
      };
    }

    if (!SAUDI_PHONE_REGEX.test(cleanPhone)) {
      return {
        isValid: false,
        message:
          "رقم الجوال يجب أن يكون سعودي ويبدأ بـ +966 أو 05 ويحتوي على 9 أرقام",
        countryCode: "",
        formattedPhone: phone,
      };
    }

    let normalizedNumber = cleanPhone.replace(/\D/g, "");

    if (normalizedNumber.startsWith("966")) {
      normalizedNumber = normalizedNumber.substring(3);
    } else if (normalizedNumber.startsWith("05")) {
      normalizedNumber = normalizedNumber.substring(1);
    }

    if (normalizedNumber.length !== 9 || !normalizedNumber.startsWith("5")) {
      return {
        isValid: false,
        message:
          "رقم الجوال يجب أن يكون سعودي ويبدأ بـ +966 أو 05 ويحتوي على 9 أرقام",
        countryCode: "",
        formattedPhone: phone,
      };
    }

    return {
      isValid: true,
      message: "",
      countryCode: "+966",
      formattedPhone: `+966 ${normalizedNumber.substring(
        0,
        2
      )} ${normalizedNumber.substring(2, 5)} ${normalizedNumber.substring(5)}`,
    };
  },

  name: (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return { isValid: false, message: "يرجى إدخال الاسم" };
    }
    if (trimmed.length < 2) {
      return {
        isValid: false,
        message: "يجب أن يحتوي الاسم على حرفين على الأقل",
      };
    }
    if (trimmed.length > 50) {
      return { isValid: false, message: "الاسم طويل جداً" };
    }
    return { isValid: true, message: "" };
  },

  password: (password: string) => {
    if (!password) {
      return { isValid: false, message: "يرجى إدخال كلمة المرور" };
    }
    if (password.length < 8) {
      return {
        isValid: false,
        message: "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل",
      };
    }
    if (password.length > 100) {
      return { isValid: false, message: "كلمة المرور طويلة جداً" };
    }
    return { isValid: true, message: "" };
  },

  otp: (otp: string) => {
    if (!otp) {
      return { isValid: false, message: "يرجى إدخال رمز التحقق" };
    }
    if (otp.length !== 4) {
      return { isValid: false, message: "رمز التحقق يجب أن يحتوي على 4 أرقام" };
    }
    if (!/^\d{4}$/.test(otp)) {
      return {
        isValid: false,
        message: "رمز التحقق يجب أن يحتوي على أرقام فقط",
      };
    }
    return { isValid: true, message: "" };
  },
};
