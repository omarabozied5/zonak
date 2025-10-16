// types.ts - Updated for OTP-only authentication flow
export type LoginStep = "phone" | "otp" | "complete-profile";

// Backend interfaces
export interface BackendUser {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  createdAt?: string;
  lastLogin?: string;
  isNewUser?: boolean;
}

export interface SendOtpRequest {
  phone: string;
  lang: string;
  uuid: string;
}

export interface SendOtpResponse {
  message: string;
  id: string; // Session ID
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
  uuid: string;
  device_token: string | null;
  device_type: string;
}

export interface VerifyOtpResponse {
  message: string;
  data: string; // JWT token
  is_otp_verified: string;
  name?: string;
  is_new_user: boolean;
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    phone: string;
  };
}

export interface UpdateNamesRequest {
  first_name: string;
  last_name: string;
  phone: string;
}

export interface UpdateNamesResponse {
  message: string;
  data: string; // Full name
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
  password: {
    isValid: boolean;
    message: string;
    touched: boolean;
  };
  name: {
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

// Helper functions for name handling
export interface NameParts {
  firstName: string;
  lastName: string;
}

export const splitName = (fullName: string): NameParts => {
  const trimmed = fullName.trim();
  const parts = trimmed.split(" ");

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
};

export const combineName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};
