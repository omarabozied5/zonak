// OTPVerification.tsx - Clean OTP verification component
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Shield, RotateCcw, CheckCircle, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { ValidationState } from "./types";
import { authService } from "./authService";
import { cn } from "@/lib/utils";

interface OTPVerificationProps {
  phone: string;
  otp: string;
  validationState: ValidationState;
  isLoading: boolean;
  userType: "new" | "existing" | null;
  onOTPChange: (value: string) => void;
  onSubmit: (otp: string) => void;
  onBack: () => void;
  onResend: () => void;
  onValidate: (field: keyof ValidationState, value: string) => boolean;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  phone,
  otp,
  validationState,
  isLoading,
  userType,
  onOTPChange,
  onSubmit,
  onBack,
  onResend,
  onValidate,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOTPInput = useCallback(
    (value: string) => {
      // Filter out non-digits and limit to 4 characters
      const cleanValue = value.replace(/\D/g, "").slice(0, 4);
      onOTPChange(cleanValue);

      // Auto-submit when 4 digits are entered
      if (cleanValue.length === 4) {
        setTimeout(() => {
          onSubmit(cleanValue);
        }, 100);
      }
    },
    [onOTPChange, onSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter, arrows
      if (
        [8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey) ||
        (e.keyCode === 67 && e.ctrlKey) ||
        (e.keyCode === 86 && e.ctrlKey) ||
        (e.keyCode === 88 && e.ctrlKey)
      ) {
        return;
      }
      // Ensure that it is a number
      if (
        (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
        (e.keyCode < 96 || e.keyCode > 105)
      ) {
        e.preventDefault();
      }

      // Submit on Enter if OTP is valid
      if (e.keyCode === 13 && otp.length === 4) {
        onSubmit(otp);
      }
    },
    [otp, onSubmit]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const cleanValue = pastedText.replace(/\D/g, "").slice(0, 4);
      handleOTPInput(cleanValue);
    },
    [handleOTPInput]
  );

  const handleResendClick = useCallback(() => {
    if (resendCooldown === 0) {
      onResend();
      setResendCooldown(60); // Start 60-second cooldown
    }
  }, [onResend, resendCooldown]);

  const handleOTPBlur = () => {
    onValidate("otp", otp);
  };

  const isSubmitDisabled = isLoading || otp.length !== 4;
  const formattedPhone = authService.formatPhoneNumber(phone);

  // Get appropriate title and description based on user type
  const getContent = () => {
    if (userType === "new") {
      return {
        title: "تأكيد الحساب الجديد",
        description: "ادخل رمز التحقق لتفعيل حسابك الجديد",
        icon: <CheckCircle className="w-8 h-8 text-white" />,
        gradient: "from-[#FFAA01] to-orange-500",
      };
    } else {
      return {
        title: "تفعيل الحساب",
        description: "ادخل رمز التحقق لتفعيل حسابك",
        icon: <Shield className="w-8 h-8 text-white" />,
        gradient: "from-[#053468] to-blue-600",
      };
    }
  };

  const content = getContent();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div
          className={cn(
            "w-16 h-16 bg-gradient-to-br rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg",
            content.gradient
          )}
        >
          {content.icon}
        </div>
        <h2 className="text-2xl font-bold text-[#053468] mb-2">
          {content.title}
        </h2>
        <p className="text-gray-600 text-sm mb-4">{content.description}</p>

        {/* Phone Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
          <p className="text-sm text-gray-600 mb-1">تم إرسال رمز التحقق إلى</p>
          <p
            className="font-medium text-[#053468] text-base"
            dir="ltr"
            style={{ direction: "ltr" }}
          >
            {formattedPhone}
          </p>
        </div>
      </div>

      {/* OTP Input */}
      <div className="space-y-4">
        <FormField
          label="رمز التحقق (4 أرقام)"
          icon={<Shield className="w-4 h-4" />}
          error={
            validationState.otp.touched && !validationState.otp.isValid
              ? validationState.otp.message
              : undefined
          }
        >
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={otp}
            onChange={(e) => handleOTPInput(e.target.value)}
            onBlur={handleOTPBlur}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="• • • •"
            className={cn(
              "text-center text-xl tracking-[0.8em] font-mono h-12 transition-colors",
              validationState.otp.touched && !validationState.otp.isValid
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-[#FFAA01] focus:ring-[#FFAA01]"
            )}
            style={{ direction: "ltr" }}
            maxLength={4}
            disabled={isLoading}
            autoComplete="one-time-code"
          />
        </FormField>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          أدخل الرمز المكون من 4 أرقام المرسل إلى هاتفك
        </p>
      </div>

      {/* Resend Section */}
      <div className="text-center py-2">
        {resendCooldown > 0 ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#053468] rounded-full animate-spin"></div>
            <span>
              يمكنك طلب رمز جديد خلال{" "}
              <span className="font-mono text-[#053468] font-bold">
                {resendCooldown}
              </span>{" "}
              ثانية
            </span>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={handleResendClick}
            disabled={isLoading}
            className="text-sm text-[#053468] hover:text-[#FFAA01] hover:bg-transparent p-2 h-auto font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4 ml-1" />
            إرسال رمز التحقق مرة أخرى
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => onSubmit(otp)}
          disabled={isSubmitDisabled}
          className="flex-1 bg-[#FFAA01] hover:bg-[#e69900] text-white disabled:opacity-50 disabled:cursor-not-allowed h-12 text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري التحقق...
            </span>
          ) : (
            <>
              تأكيد
              <ArrowRight className="w-4 h-4 mr-2" />
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="border-[#053468] text-[#053468] hover:bg-[#053468] hover:text-white disabled:opacity-50 px-4 h-12 transition-all duration-200"
        >
          رجوع
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-2">
        <p>لم تستلم الرمز؟ تحقق من رسائل SMS أو جرب الإرسال مرة أخرى</p>
      </div>
    </div>
  );
};
