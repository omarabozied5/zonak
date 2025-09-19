// RegistrationForm.tsx - Enhanced responsive design with modern layout
import React, { useState } from "react";
import { User, Phone, Lock, Eye, EyeOff, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { ValidationState } from "./types";
import { cn } from "@/lib/utils";

interface RegistrationFormProps {
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  validationState: ValidationState;
  isLoading: boolean;
  onPhoneChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (
    phone: string,
    firstName: string,
    lastName: string,
    password: string
  ) => void;
  onSwitchToLogin: () => void;
  onValidate: (field: keyof ValidationState, value: string) => boolean;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  phone,
  firstName,
  lastName,
  password,
  validationState,
  isLoading,
  onPhoneChange,
  onFirstNameChange,
  onLastNameChange,
  onPasswordChange,
  onSubmit,
  onSwitchToLogin,
  onValidate,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handlePhoneChange = (value: string) => {
    const cleanValue = value.replace(/[^\d+\s]/g, "");
    onPhoneChange(cleanValue);

    // Validate on change to clear red outline immediately
    if (cleanValue.trim()) {
      onValidate("phone", cleanValue);
    }
  };

  const handlePhoneBlur = () => {
    onValidate("phone", phone);
  };

  const handlePasswordChange = (value: string) => {
    onPasswordChange(value);

    // Validate on change if field was touched
    if (validationState.password.touched && value.trim()) {
      onValidate("password", value);
    }
  };

  const handlePasswordBlur = () => {
    onValidate("password", password);
  };

  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    if (field === "firstName") {
      onFirstNameChange(value);
    } else {
      onLastNameChange(value);
    }

    // Validate name on change if either field was touched
    if (validationState.name.touched) {
      const fullName =
        field === "firstName"
          ? `${value} ${lastName}`.trim()
          : `${firstName} ${value}`.trim();
      onValidate("name", fullName);
    }
  };

  const handleNameBlur = () => {
    onValidate("name", `${firstName} ${lastName}`.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(phone, firstName, lastName, password);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFormValid) {
      handleSubmit(e as any);
    }
  };

  const isFormValid =
    phone.trim() &&
    firstName.trim() &&
    lastName.trim() &&
    password.trim() &&
    validationState.phone.isValid &&
    validationState.password.isValid &&
    validationState.name.isValid;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="space-y-4">
        {/* Compact Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FFAA01] to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#053468] mb-1">
            إنشاء حساب جديد
          </h2>
          <p className="text-gray-600 text-xs">
            أكمل بياناتك لإنشاء حسابك الجديد
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name Fields - Compact layout */}
          <div className="grid grid-cols-2 gap-2">
            <FormField
              label="الاسم الأول"
              icon={<User className="w-3 h-3" />}
              error={
                validationState.name.touched &&
                !validationState.name.isValid &&
                !firstName.trim()
                  ? "مطلوب"
                  : undefined
              }
            >
              <Input
                type="text"
                value={firstName}
                onChange={(e) => handleNameChange("firstName", e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleKeyDown}
                placeholder="الأول"
                className={cn(
                  "text-right transition-colors h-9 text-sm",
                  "focus:border-[#FFAA01] focus:ring-1 focus:ring-[#FFAA01]",
                  "border-gray-300",
                  validationState.name.touched &&
                    !validationState.name.isValid &&
                    !firstName.trim()
                    ? "border-red-500"
                    : ""
                )}
                disabled={isLoading}
                autoComplete="given-name"
              />
            </FormField>

            <FormField
              label="الاسم الأخير"
              icon={<User className="w-3 h-3" />}
              error={
                validationState.name.touched &&
                !validationState.name.isValid &&
                !lastName.trim()
                  ? "مطلوب"
                  : undefined
              }
            >
              <Input
                type="text"
                value={lastName}
                onChange={(e) => handleNameChange("lastName", e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleKeyDown}
                placeholder="الأخير"
                className={cn(
                  "text-right transition-colors h-9 text-sm",
                  "focus:border-[#FFAA01] focus:ring-1 focus:ring-[#FFAA01]",
                  "border-gray-300",
                  validationState.name.touched &&
                    !validationState.name.isValid &&
                    !lastName.trim()
                    ? "border-red-500"
                    : ""
                )}
                disabled={isLoading}
                autoComplete="family-name"
              />
            </FormField>
          </div>

          {/* Phone Field */}
          <FormField
            label="رقم الجوال"
            icon={<Phone className="w-3 h-3" />}
            error={
              validationState.phone.touched && !validationState.phone.isValid
                ? validationState.phone.message
                : undefined
            }
          >
            <Input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={handlePhoneBlur}
              onKeyDown={handleKeyDown}
              placeholder="05xxxxxxxx أو +966"
              className={cn(
                "text-right transition-colors h-9 text-sm",
                "focus:border-[#FFAA01] focus:ring-1 focus:ring-[#FFAA01]",
                "border-gray-300",
                validationState.phone.touched && !validationState.phone.isValid
                  ? "border-red-500"
                  : ""
              )}
              disabled={isLoading}
              autoComplete="tel"
              dir="ltr"
            />
          </FormField>

          {/* Password Field */}
          <FormField
            label="كلمة المرور"
            icon={<Lock className="w-3 h-3" />}
            error={
              validationState.password.touched &&
              !validationState.password.isValid
                ? validationState.password.message
                : undefined
            }
          >
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={handlePasswordBlur}
                onKeyDown={handleKeyDown}
                placeholder="8+ أحرف"
                className={cn(
                  "text-right pr-8 transition-colors h-9 text-sm",
                  "focus:border-[#FFAA01] focus:ring-1 focus:ring-[#FFAA01]",
                  "border-gray-300",
                  validationState.password.touched &&
                    !validationState.password.isValid
                    ? "border-red-500"
                    : ""
                )}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#053468] transition-colors"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </button>
            </div>
          </FormField>

          {/* Compact Password Strength */}
          {password && (
            <div className="flex items-center justify-center gap-4 text-xs bg-gray-50 rounded px-3 py-2">
              <div className="flex items-center gap-1">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    password.length >= 8 ? "bg-green-500" : "bg-gray-300"
                  )}
                />
                <span
                  className={
                    password.length >= 8 ? "text-green-600" : "text-gray-500"
                  }
                >
                  8+ أحرف
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    /[a-zA-Z\u0621-\u064A]/.test(password) &&
                      /[0-9\u0660-\u0669]/.test(password)
                      ? "bg-green-500"
                      : "bg-gray-300"
                  )}
                />
                <span
                  className={
                    /[a-zA-Z\u0621-\u064A]/.test(password) &&
                    /[0-9\u0660-\u0669]/.test(password)
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  أحرف + أرقام
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={cn(
              "w-full bg-[#FFAA01] hover:bg-[#e69900] text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "h-10 text-sm font-medium transition-colors",
              "shadow-sm hover:shadow-md"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الإنشاء...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                إنشاء الحساب
                <UserPlus className="w-3 h-3" />
              </span>
            )}
          </Button>
        </form>

        {/* Compact Footer */}
        <div className="text-center pt-3 space-y-2">
          <p className="text-xs text-gray-600">لديك حساب؟</p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={isLoading}
            className="text-[#053468] hover:text-[#FFAA01] font-medium text-sm transition-colors px-2 py-1 rounded"
          >
            تسجيل الدخول
          </button>
          <p className="text-xs text-gray-400 pt-1">
            بالمتابعة، توافق على الشروط والأحكام
          </p>
        </div>
      </div>
    </div>
  );
};
