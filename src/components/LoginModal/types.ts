// types.ts
export type LoginStep =
  | "phone"
  | "existing-user-password"
  | "new-user-details"
  | "new-user-otp";

export interface ExistingUser {
  id: string;
  name: string;
  phone: string;
  countryCode: string;
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
  countryCode: string;
  formattedPhone: string;
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

export interface UserCheckResult {
  exists: boolean;
  user: ExistingUser | null;
}
