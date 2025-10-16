// CompleteProfileStep.tsx - For new users to complete their profile
import React from "react";
import { User, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";
import { ValidationState } from "./types";
import { authService } from "./authService";

interface CompleteProfileStepProps {
  firstName: string;
  lastName: string;
  phone: string;
  validationState: ValidationState;
  isLoading: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSubmit: () => void;
  onValidate: (field: keyof ValidationState, value: string) => boolean;
}

export const CompleteProfileStep: React.FC<CompleteProfileStepProps> = ({
  firstName,
  lastName,
  phone,
  validationState,
  isLoading,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
  onValidate,
}) => {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      firstName.trim() &&
      lastName.trim() &&
      validationState.name.isValid
    ) {
      onSubmit();
    }
  };

  const formattedPhone = authService.formatPhoneNumber(phone);
  const isFormValid =
    firstName.trim() && lastName.trim() && validationState.name.isValid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-right">
        <h2 className="text-2xl font-bold text-black mb-2">مرحبا بك في زونك</h2>

        {/* Phone Display */}
        {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-gray-600 mb-1">رقم الجوال المؤكد</p>
          <p
            className="font-medium text-[#053468] text-base"
            dir="ltr"
            style={{ direction: "ltr" }}
          >
            {formattedPhone}
          </p>
        </div> */}
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="الاسم الأول"
            icon={<User className="w-4 h-4" />}
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
                "text-right transition-colors",
                "focus:border-[#FFAA01] focus:ring-[#FFAA01]",
                validationState.name.touched &&
                  !validationState.name.isValid &&
                  !firstName.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              )}
              disabled={isLoading}
              autoComplete="given-name"
              autoFocus
            />
          </FormField>

          <FormField
            label="الاسم الأخير"
            icon={<User className="w-4 h-4" />}
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
                "text-right transition-colors",
                "focus:border-[#FFAA01] focus:ring-[#FFAA01]",
                validationState.name.touched &&
                  !validationState.name.isValid &&
                  !lastName.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              )}
              disabled={isLoading}
              autoComplete="family-name"
            />
          </FormField>
        </div>

        {/* Help text */}
        <div className="text-xs text-gray-500 text-center px-2">
          <p>يرجى إدخال اسمك الكامل كما هو في الهوية</p>
        </div>

        {/* Submit Button */}
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !isFormValid}
          className="w-full bg-[#FFAA01] hover:bg-[#e69900] text-white disabled:opacity-50 disabled:cursor-not-allowed h-12 text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري إنشاء الحساب...
            </span>
          ) : (
            <>
              إستمرار <UserPlus className="w-4 h-4 mr-2" />
            </>
          )}
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-2">
        <p>بإنشاء الحساب، أنت توافق على الشروط والأحكام</p>
      </div>
    </div>
  );
};
