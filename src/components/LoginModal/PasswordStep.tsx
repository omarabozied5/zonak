// PasswordStep.tsx
import React from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";
import { ExistingUser, ValidationState } from "./types";
import { authService } from "./authService";

interface PasswordStepProps {
  existingUser: ExistingUser;
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
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <User className="w-12 h-12 mx-auto mb-2 text-[#053468]" />
        <h3 className="font-medium text-[#053468]">{existingUser.name}</h3>
        <p className="text-sm text-gray-600">
          {authService.validatePhone(existingUser.phone).formattedPhone}
        </p>
      </div>

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
            placeholder="ادخل كلمة المرور"
            className={cn(
              "text-right pr-10",
              validationState.password.touched &&
                !validationState.password.isValid
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-[#FFAA01]"
            )}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#053468]"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </FormField>

      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={isLoading || !validationState.password.isValid}
          className="flex-1 bg-[#FFAA01] hover:bg-[#e69900] text-white"
        >
          {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </Button>
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="border-[#053468] text-[#053468] hover:bg-[#053468] hover:text-white"
        >
          رجوع
        </Button>
      </div>
    </div>
  );
};
