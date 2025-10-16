// PhoneStep.tsx - First step: Enter phone number only
import React from "react";
import { Phone, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";
import { ValidationState } from "./types";

interface PhoneStepProps {
  phone: string;
  validationState: ValidationState;
  isLoading: boolean;
  onPhoneChange: (value: string) => void;
  onPhoneBlur: () => void;
  onSubmit: () => void;
}

export const PhoneStep: React.FC<PhoneStepProps> = ({
  phone,
  validationState,
  isLoading,
  onPhoneChange,
  onPhoneBlur,
  onSubmit,
}) => {
  const handlePhoneChange = (value: string) => {
    const cleanValue = value.replace(/[^\d+\s]/g, "");
    onPhoneChange(cleanValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && validationState.phone.isValid && phone.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <img src="/login.png" alt="Login" />
        </div>
        <h2 className="text-2xl font-bold text-black mb-2">إبدأ مع زوونك</h2>
        <p className="text-gray-600 text-sm">
          أدخل رقم جوالك للحصول على رمز التحقق
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Phone Field */}
        <FormField
          label="رقم الجوال"
          error={
            validationState.phone.touched && !validationState.phone.isValid
              ? validationState.phone.message
              : undefined
          }
        >
          <div className="flex flex-row-reverse w-full gap-2">
            {/* Country Selector (flag only) */}
            <div className="flex items-center justify-center w-[65px] h-[49px] rounded-md border border-[#d8dadc]">
              <svg
                className="w-3 h-3 text-gray-500 ml-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <img
                src="/saudiArabia.png"
                alt="SA"
                className="w-6 h-6 object-cover"
              />
            </div>

            {/* Phone Number Input with +966 prefix */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-[16px] font-medium select-none">
                +966
              </span>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={onPhoneBlur}
                onKeyDown={handleKeyDown}
                placeholder="051 234 5678"
                className={cn(
                  "h-[49px] pr-14 text-center text-[16px] rounded-md border border-[#d8dadc] placeholder:text-[#c8c8c8]",
                  validationState.phone.touched &&
                    !validationState.phone.isValid
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "focus:border-[#FFAA01] focus:ring-[#FFAA01]"
                )}
                disabled={isLoading}
                autoComplete="tel"
              />
            </div>
          </div>
        </FormField>

        {/* Submit Button */}
        <Button
          type="button"
          onClick={onSubmit}
          disabled={
            isLoading || !validationState.phone.isValid || !phone.trim()
          }
          className="w-full bg-[#FBD252] hover:bg-[#e69900] text-white disabled:opacity-50 disabled:cursor-not-allowed h-12 text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري الإرسال...
            </span>
          ) : (
            <>
              إستمرار
              <ArrowRight className="w-4 h-4 mr-2" />
            </>
          )}
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-2">
        <p>سيتم إرسال رمز التحقق إلى رقم جوالك</p>
        <p className="mt-1">بالمتابعة، أنت توافق على الشروط والأحكام</p>
      </div>
    </div>
  );
};
