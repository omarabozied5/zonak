// UserDetailsStep.tsx
import React from "react";
import { User, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";
import { ValidationState } from "./types";

interface UserDetailsStepProps {
  name: string;
  phone: string;
  password: string;
  showPassword: boolean;
  validationState: ValidationState;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onNameBlur: () => void;
  onPhoneChange: (value: string) => void;
  onPhoneBlur: () => void;
  onPasswordChange: (value: string) => void;
  onPasswordBlur: () => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

export const UserDetailsStep: React.FC<UserDetailsStepProps> = ({
  name,
  phone,
  password,
  showPassword,
  validationState,
  isLoading,
  onNameChange,
  onNameBlur,
  onPhoneChange,
  onPhoneBlur,
  onPasswordChange,
  onPasswordBlur,
  onTogglePassword,
  onSubmit,
  onBack,
}) => {
  const isFormValid =
    validationState.name.isValid &&
    validationState.phone.isValid &&
    validationState.password.isValid &&
    name.trim() &&
    phone &&
    password;

  return (
    <div className="space-y-4">
      <FormField
        label="الاسم الكامل"
        error={
          validationState.name.touched && !validationState.name.isValid
            ? validationState.name.message
            : undefined
        }
        icon={<User className="w-4 h-4" />}
      >
        <Input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={onNameBlur}
          placeholder="ادخل اسمك الكامل"
          className={cn(
            "text-right",
            validationState.name.touched && !validationState.name.isValid
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-[#FFAA01]"
          )}
          disabled={isLoading}
        />
      </FormField>

      <FormField
        label="رقم الجوال"
        error={
          validationState.phone.touched && !validationState.phone.isValid
            ? validationState.phone.message
            : undefined
        }
        icon={<Phone className="w-4 h-4" />}
      >
        <Input
          type="tel"
          value={phone}
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d+\s]/g, "");
            onPhoneChange(value);
          }}
          onBlur={onPhoneBlur}
          placeholder="05xxxxxxxx أو +966xxxxxxxx"
          className={cn(
            "text-right",
            validationState.phone.touched && !validationState.phone.isValid
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-[#FFAA01]"
          )}
          disabled={isLoading}
        />
      </FormField>

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
          disabled={isLoading || !isFormValid}
          className="flex-1 bg-[#FFAA01] hover:bg-[#e69900] text-white"
        >
          {isLoading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
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
