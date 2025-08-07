// PhoneStep.tsx - Simplified version
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
  return (
    <div className="space-y-4">
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && validationState.phone.isValid) {
              onSubmit();
            }
          }}
        />
      </FormField>

      <Button
        onClick={onSubmit}
        disabled={isLoading || !validationState.phone.isValid}
        className="w-full bg-[#FFAA01] hover:bg-[#e69900] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="المتابعة بعد إدخال رقم الجوال"
      >
        {isLoading ? "جاري المعالجة..." : "متابعة"}
        <ArrowRight className="w-4 h-4 mr-2" />
      </Button>

      <div className="text-center text-xs text-gray-500 px-2">
        <p>
          ستحتاج إلى إدخال كلمة المرور
          <br />
          أو إنشاء حساب جديد إذا لم يكن لديك حساب
        </p>
      </div>
    </div>
  );
};
