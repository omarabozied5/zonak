// LoginForm.tsx - Fixed phone validation
import React, { useState } from "react";
import { Phone, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { ValidationState } from "./types";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  phone: string;
  password: string;
  validationState: ValidationState;
  isLoading: boolean;
  onPhoneChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (phone: string, password: string) => void;
  onSwitchToRegistration: () => void;
  onValidate: (field: keyof ValidationState, value: string) => boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  phone,
  password,
  validationState,
  isLoading,
  onPhoneChange,
  onPasswordChange,
  onSubmit,
  onSwitchToRegistration,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(phone, password);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && phone && password) {
      handleSubmit(e as any);
    }
  };

  const isFormValid =
    phone.trim() &&
    password.trim() &&
    validationState.phone.isValid &&
    validationState.password.isValid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#053468] to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#053468] mb-2">
          مرحباً بك في زونك
        </h2>
        <p className="text-gray-600 text-sm">ادخل بياناتك لتسجيل الدخول</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone Field */}
        <FormField
          label="رقم الجوال"
          icon={<Phone className="w-4 h-4" />}
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
            className={cn(
              "text-right transition-colors",
              validationState.phone.touched && !validationState.phone.isValid
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-[#FFAA01] focus:ring-[#FFAA01]"
            )}
            disabled={isLoading}
            autoComplete="tel"
          />
        </FormField>

        {/* Password Field */}
        <FormField
          label="كلمة المرور"
          icon={<Lock className="w-4 h-4" />}
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
              placeholder="ادخل كلمة المرور"
              className={cn(
                "text-right pr-10 transition-colors",
                validationState.password.touched &&
                  !validationState.password.isValid
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-[#FFAA01] focus:ring-[#FFAA01]"
              )}
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#053468] transition-colors"
              disabled={isLoading}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </FormField>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full bg-[#FFAA01] hover:bg-[#e69900] text-white disabled:opacity-50 disabled:cursor-not-allowed h-12 text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري تسجيل الدخول...
            </span>
          ) : (
            <>
              تسجيل الدخول
              <LogIn className="w-4 h-4 mr-2" />
            </>
          )}
        </Button>
      </form>

      {/* New User Link */}
      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600 mb-2">ليس لديك حساب؟</p>
        <button
          type="button"
          onClick={onSwitchToRegistration}
          disabled={isLoading}
          className="text-[#053468] hover:text-[#FFAA01] font-medium text-sm transition-colors duration-200 underline hover:no-underline"
        >
          إنشاء حساب جديد
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-2">
        <p>بالمتابعة، أنت توافق على الشروط والأحكام</p>
      </div>
    </div>
  );
};
