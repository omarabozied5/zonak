// PasswordStep.tsx - Updated for existing user login with password
import React from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";
import { ExistingUser, ValidationState, combineName } from "./types";
import { authService } from "./authService";

interface PasswordStepProps {
  existingUser: ExistingUser | null;
  phone?: string;
  password: string;
  showPassword: boolean;
  validationState: ValidationState;
  isLoading: boolean;
  onPasswordChange: (value: string) => void;
  onPasswordBlur: () => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

export const PasswordStep: React.FC<PasswordStepProps> = ({
  existingUser,
  phone,
  password,
  showPassword,
  validationState,
  isLoading,
  onPasswordChange,
  onPasswordBlur,
  onTogglePassword,
  onSubmit,
  onBack,
}) => {
  // Use existingUser data if available, otherwise use phone for display
  const displayPhone = existingUser?.phone || phone || "";
  const displayName = existingUser
    ? combineName(existingUser.first_name, existingUser.last_name)
    : "مستخدم موجود";

  const formattedPhone = authService.formatPhoneNumber(displayPhone);

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      validationState.password.isValid &&
      password.trim()
    ) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* User Profile Display */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center border border-blue-100">
        <div className="w-16 h-16 bg-gradient-to-br from-[#053468] to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
          <User className="w-8 h-8 text-white" />
        </div>

        <h3 className="font-semibold text-lg text-[#053468] mb-1">
          مرحباً {displayName}
        </h3>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="font-mono" dir="ltr" style={{ direction: "ltr" }}>
            {formattedPhone}
          </span>
        </div>

        {existingUser?.lastLogin && (
          <p className="text-xs text-gray-500 mt-2">
            آخر دخول:{" "}
            {new Date(existingUser.lastLogin).toLocaleDateString("ar-SA")}
          </p>
        )}
      </div>

      {/* Password Input */}
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
            onKeyDown={handleKeyDown}
            placeholder="ادخل كلمة المرور"
            className={cn(
              "text-right pr-10",
              validationState.password.touched &&
                !validationState.password.isValid
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-[#FFAA01] focus:ring-[#FFAA01]"
            )}
            disabled={isLoading}
            autoComplete="current-password"
            autoFocus
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#053468] transition-colors"
            disabled={isLoading}
            tabIndex={-1}
            aria-label={
              showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
            }
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </FormField>

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center px-2">
        <p>ادخل كلمة المرور الخاصة بحسابك للدخول</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={
            isLoading || !validationState.password.isValid || !password.trim()
          }
          className="flex-1 bg-[#FFAA01] hover:bg-[#e69900] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="تسجيل الدخول بكلمة المرور"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري تسجيل الدخول...
            </span>
          ) : (
            "تسجيل الدخول"
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="border-[#053468] text-[#053468] hover:bg-[#053468] hover:text-white disabled:opacity-50 transition-all duration-200"
          aria-label="العودة إلى الخطوة السابقة"
        >
          رجوع
        </Button>
      </div>

      {/* Forgot Password Link (Optional) */}
      <div className="text-center">
        <button
          type="button"
          className="text-xs text-gray-500 hover:text-[#053468] transition-colors"
          disabled={isLoading}
          onClick={() => {
            // Handle forgot password functionality here
            console.log("Forgot password clicked");
          }}
        >
          نسيت كلمة المرور؟
        </button>
      </div>
    </div>
  );
};
