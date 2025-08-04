// validation.ts - Fixed with better name validation
export interface PhoneValidationResult {
  isValid: boolean;
  message: string;
  formattedPhone: string;
  countryCode?: string;
}

export const validation = {
  phone: (phone: string): PhoneValidationResult => {
    const cleanPhone = phone.replace(/\s/g, "");
    const SAUDI_PHONE_REGEX = /^(\+966|966|0)?5\d{8}$/;

    if (!cleanPhone) {
      return {
        isValid: false,
        message: "يرجى إدخال رقم الجوال",
        formattedPhone: phone,
        countryCode: "",
      };
    }

    if (!SAUDI_PHONE_REGEX.test(cleanPhone)) {
      return {
        isValid: false,
        message:
          "رقم الجوال يجب أن يكون سعودي ويبدأ بـ +966 أو 05 ويحتوي على 9 أرقام",
        formattedPhone: phone,
        countryCode: "",
      };
    }

    let normalizedNumber = cleanPhone.replace(/\D/g, "");

    // Handle different formats
    if (normalizedNumber.startsWith("966")) {
      normalizedNumber = normalizedNumber.substring(3);
    } else if (normalizedNumber.startsWith("05")) {
      normalizedNumber = normalizedNumber.substring(1);
    } else if (normalizedNumber.startsWith("5")) {
      // Already in correct format
    } else {
      return {
        isValid: false,
        message: "رقم الجوال يجب أن يكون سعودي ويبدأ بـ +966 أو 05",
        formattedPhone: phone,
        countryCode: "",
      };
    }

    if (normalizedNumber.length !== 9 || !normalizedNumber.startsWith("5")) {
      return {
        isValid: false,
        message: "رقم الجوال يجب أن يحتوي على 9 أرقام ويبدأ بـ 5",
        formattedPhone: phone,
        countryCode: "",
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
      return { isValid: false, message: "يرجى إدخال الاسم الكامل" };
    }

    // Check for at least first and last name (two words minimum)
    const nameParts = trimmed.split(/\s+/);
    if (nameParts.length < 2) {
      return {
        isValid: false,
        message: "يرجى إدخال الاسم الأول والأخير على الأقل",
      };
    }

    if (trimmed.length < 4) {
      return {
        isValid: false,
        message: "يجب أن يحتوي الاسم على 4 أحرف على الأقل",
      };
    }

    if (trimmed.length > 50) {
      return {
        isValid: false,
        message: "الاسم طويل جداً (الحد الأقصى 50 حرف)",
      };
    }

    // Check for valid Arabic/English characters only
    const nameRegex = /^[\u0621-\u064A\u0660-\u0669a-zA-Z\s]+$/;
    if (!nameRegex.test(trimmed)) {
      return {
        isValid: false,
        message: "الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط",
      };
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

    // Check for at least one letter and one number for stronger passwords
    const hasLetter = /[a-zA-Z\u0621-\u064A]/.test(password);
    const hasNumber = /[0-9\u0660-\u0669]/.test(password);

    if (!hasLetter || !hasNumber) {
      return {
        isValid: false,
        message: "كلمة المرور يجب أن تحتوي على أحرف وأرقام",
      };
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
