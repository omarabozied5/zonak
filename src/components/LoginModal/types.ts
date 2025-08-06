// types.ts - Updated to support new phone → password → login flow
export type LoginStep =
  | "phone"
  | "password" // NEW: Password step for existing users
  | "new-user-details"
  | "new-user-otp"
  | "existing-user-otp";

// Backend interfaces - Updated to match actual API responses
export interface BackendUser {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  createdAt?: string;
  lastLogin?: string;
  isNewUser?: boolean;
}

export interface LoginOtpRequest {
  phone: string;
  password?: string; // Password is optional for existence check
  device_token: null;
  device_type: string;
  uuid: string;
  os_version: string;
  device_name: string;
  model_name: string;
  build_version_number: string;
}

export interface LoginOtpResponse {
  message: string;
  data: string; // JWT token
  code: string;
  name?: string; // User's full name from backend (e.g., "حمزة احمد")
  is_otp_verified: number | null; // 1 = verified user, null = new user, 0 = unverified user
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  latitude: string;
  longitude: string;
  device_token: null;
  device_type: string;
  uuid: string;
  os_version: string;
  device_name: string;
  model_name: string;
  build_version_number: string;
}

export interface RegisterResponse {
  message: string;
  data: string; // JWT token
  code: string;
  is_otp_verified: null;
}

// Updated to match actual API responses
export interface SendOtpRequest {
  phone: string;
  lang: string; // "Ar" or "En"
}

export interface SendOtpResponse {
  message: string;
  id: string; // Session ID for verification
  phone: string;
}

export interface VerifyOtpRequest {
  id: string; // Session ID from send_otp
  code: string; // OTP code
  lang: string; // "Ar" or "En"
  phone: string;
}

export interface VerifyOtpResponse {
  message: string; // "تم بنجاح" on success
}

// Frontend interfaces
export interface ExistingUser {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  createdAt?: string;
  lastLogin?: string;
  isNewUser?: boolean;
}

export interface ValidationState {
  phone: {
    isValid: boolean;
    message: string;
    touched: boolean;
  };
  name: {
    isValid: boolean;
    message: string;
    touched: boolean;
  };
  password: {
    isValid: boolean;
    message: string;
    touched: boolean;
  };
  otp: {
    isValid: boolean;
    message: string;
    touched: boolean;
  };
}

export interface PhoneValidationResult {
  isValid: boolean;
  message: string;
  formattedPhone: string;
  countryCode?: string;
}

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface AuthResult {
  user: ExistingUser;
  token: string;
}

// Updated interfaces for the new flow
export interface UserExistsResult {
  exists: boolean;
  message: string;
}

export interface UserLoginResult {
  userType: "verified" | "unverified";
  user: ExistingUser;
  token: string;
  needsVerification: boolean;
}

// Legacy interface - keeping for backward compatibility
export interface UserCheckResult {
  exists: boolean;
  user: ExistingUser | null;
  token?: string;
  needsVerification?: boolean;
}

// Additional types for name handling
export interface NameParts {
  firstName: string;
  lastName: string;
}

// Helper function to split name into parts
export const splitName = (fullName: string): NameParts => {
  const trimmed = fullName.trim();
  const parts = trimmed.split(" ");

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
};

// Helper function to combine name parts
export const combineName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};
