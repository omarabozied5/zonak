// UserDetailsStep.tsx - Updated with correct button text
import React from "react";
import { User, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";
import { ValidationState } from "./types";
import { authService } from "./authService";

interface UserDetailsStepProps {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  showPassword: boolean;
  validationState: ValidationState;
  isLoading: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPhoneBlur: () => void;
  onPasswordChange: (value: string) => void;
  onPasswordBlur: () => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

export const UserDetailsStep: React.FC<UserDetailsStepProps> = ({
  firstName,
  lastName,
  phone,
  password,
  showPassword,
  validationState,
  isLoading,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onPhoneBlur,
  onPasswordChange,
  onPasswordBlur,
  onTogglePassword,
  onSubmit,
  onBack,
}) => {
  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    password &&
    validationState.password.isValid;

  // Format phone for display
  const formattedPhone = authService.formatPhoneNumber(phone);

  return (
    <div className="space-y-4">
      {/* Name fields in a grid */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="الاسم الأول" icon={<User className="w-4 h-4" />}>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="الاسم الأول"
            className="text-right"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isFormValid) {
                onSubmit();
              }
            }}
          />
        </FormField>

        <FormField label="الاسم الأخير" icon={<User className="w-4 h-4" />}>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="الاسم الأخير"
            className="text-right"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isFormValid) {
                onSubmit();
              }
            }}
          />
        </FormField>
      </div>

      {/* Phone field - display only */}
      <FormField label="رقم الجوال" icon={<Phone className="w-4 h-4" />}>
        <div className="bg-gray-50 border rounded-md p-3 text-center">
          <span
            className="text-gray-700 font-medium"
            dir="ltr"
            style={{ direction: "ltr" }}
          >
            {formattedPhone}
          </span>
          <p className="text-xs text-gray-500 mt-1">
            (تم تأكيد هذا الرقم مسبقاً)
          </p>
        </div>
      </FormField>

      {/* Password field */}
      <FormField
        label="كلمة المرور"
        error={
          validationState.password.touched && !validationState.password.isValid
            ? validationState.password.message
            : undefined
        }
        icon={<Lock className="w-4 h-4" />}
      >
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onBlur={onPasswordBlur}
            placeholder="ادخل كلمة المرور (8 أحرف على الأقل)"
            className={cn(
              "text-right pr-10",
              validationState.password.touched &&
                !validationState.password.isValid
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-[#FFAA01]"
            )}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isFormValid) {
                onSubmit();
              }
            }}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#053468]"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </FormField>

      {/* Password strength indicator */}
      {password && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                password.length >= 8 ? "bg-green-500" : "bg-gray-300"
              )}
            />
            <span
              className={
                password.length >= 8 ? "text-green-600" : "text-gray-500"
              }
            >
              8 أحرف على الأقل
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
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
              أحرف وأرقام
            </span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={isLoading || !isFormValid}
          className="flex-1 bg-[#FFAA01] hover:bg-[#e69900] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="إنشاء الحساب الجديد"
        >
          {isLoading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
        </Button>
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="border-[#053468] text-[#053468] hover:bg-[#053468] hover:text-white disabled:opacity-50"
          aria-label="العودة للخطوة السابقة"
        >
          رجوع
        </Button>
      </div>

      {/* Help text */}
      <div className="text-center text-xs text-gray-500 px-2">
        <p>
          سيتم إنشاء حسابك الجديد
          <br />
          ثم إرسال رمز التحقق لتفعيل الحساب
        </p>
      </div>
    </div>
  );
};
