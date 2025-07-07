// utils/validationHelpers.ts

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validate Saudi phone number format
 * Format: 05xxxxxxxx (10 digits starting with 05)
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;

  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");

  // Check if it's exactly 10 digits and starts with 05
  const phoneRegex = /^05\d{8}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Validate user name
 */
export const validateName = (name: string): ValidationResult => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { isValid: false, message: "يرجى إدخال اسمك" };
  }

  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: "يرجى إدخال اسم صحيح (حرفين على الأقل)",
    };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, message: "الاسم طويل جداً (أقل من 50 حرف)" };
  }

  // Check for valid Arabic/English characters and spaces
  const nameRegex = /^[a-zA-Zأ-ي\u0600-\u06FF\s]+$/;
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      message: "يرجى إدخال اسم صحيح (أحرف عربية أو إنجليزية فقط)",
    };
  }

  return { isValid: true };
};

/**
 * Validate password format
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: "يرجى إدخال كلمة المرور" };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    };
  }

  if (password.length > 50) {
    return {
      isValid: false,
      message: "كلمة المرور طويلة جداً (أقل من 50 حرف)",
    };
  }

  // Check for at least one number or letter
  const hasValidCharacters = /[a-zA-Z0-9]/.test(password);
  if (!hasValidCharacters) {
    return {
      isValid: false,
      message: "كلمة المرور يجب أن تحتوي على أحرف أو أرقام",
    };
  }

  return { isValid: true };
};

/**
 * Validate OTP format
 */
export const validateOTP = (otp: string): ValidationResult => {
  if (!otp) {
    return { isValid: false, message: "يرجى إدخال رمز التحقق" };
  }

  if (otp.length !== 4) {
    return {
      isValid: false,
      message: "رمز التحقق يجب أن يكون مكوناً من 4 أرقام",
    };
  }

  if (!/^\d{4}$/.test(otp)) {
    return {
      isValid: false,
      message: "رمز التحقق يجب أن يحتوي على أرقام فقط",
    };
  }

  return { isValid: true };
};

/**
 * Format phone number for display
 */
export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone || phone.length !== 10) return phone;

  // Format: 05X-XXX-XXXX
  return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
};

/**
 * Clean phone number input (remove non-digits)
 */
export const cleanPhoneInput = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

/**
 * Validate phone number and return formatted error message
 */
export const validatePhoneWithMessage = (phone: string): ValidationResult => {
  const cleanPhone = cleanPhoneInput(phone);

  if (!cleanPhone) {
    return { isValid: false, message: "يرجى إدخال رقم الهاتف" };
  }

  if (cleanPhone.length !== 10) {
    return {
      isValid: false,
      message: "رقم الهاتف يجب أن يكون مكوناً من 10 أرقام",
    };
  }

  if (!cleanPhone.startsWith("05")) {
    return { isValid: false, message: "رقم الهاتف يجب أن يبدأ بـ 05" };
  }

  return { isValid: true };
};

/**
 * Validate email format (for future use)
 */
export const validateEmail = (email: string): ValidationResult => {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { isValid: false, message: "يرجى إدخال البريد الإلكتروني" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, message: "يرجى إدخال بريد إلكتروني صحيح" };
  }

  return { isValid: true };
};

/**
 * Check if string contains only Arabic characters
 */
export const isArabicOnly = (text: string): boolean => {
  const arabicRegex = /^[\u0600-\u06FF\s]+$/;
  return arabicRegex.test(text.trim());
};

/**
 * Check if string contains only English characters
 */
export const isEnglishOnly = (text: string): boolean => {
  const englishRegex = /^[a-zA-Z\s]+$/;
  return englishRegex.test(text.trim());
};

/**
 * Sanitize user input (remove harmful characters)
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
};
