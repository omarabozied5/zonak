// OTPStep.tsx - Updated with resend functionality
import React, { useRef, useEffect, useCallback, useState } from "react";
import { Shield, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";
import { ValidationState } from "./types";
import { authService } from "./authService";

interface OTPStepProps {
  phone: string;
  otp: string;
  validationState: ValidationState;
  isLoading: boolean;
  onOTPChange: (value: string) => void;
  onOTPBlur: () => void;
  onSubmit: () => void;
  onBack: () => void;
  onResend?: () => void; // Optional resend handler
}

export const OTPStep: React.FC<OTPStepProps> = ({
  phone,
  otp,
  validationState,
  isLoading,
  onOTPChange,
  onOTPBlur,
  onSubmit,
  onBack,
  onResend,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Focus input when component mounts
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
    },
    [onOTPChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter
      if (
        [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)
      ) {
        return;
      }
      // Ensure that it is a number and stop the keypress
      if (
        (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
        (e.keyCode < 96 || e.keyCode > 105)
      ) {
        e.preventDefault();
      }

      // Submit on Enter if OTP is valid
      if (e.keyCode === 13 && otp.length === 4) {
        onSubmit();
      }
    },
    [otp.length, onSubmit]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const cleanValue = pastedText.replace(/\D/g, "").slice(0, 4);
      onOTPChange(cleanValue);
    },
    [onOTPChange]
  );

  const handleResendClick = useCallback(() => {
    if (onResend && resendCooldown === 0) {
      onResend();
      setResendCooldown(60); // Start 60-second cooldown
    }
  }, [onResend, resendCooldown]);

  const isSubmitDisabled =
    isLoading || !validationState.otp.isValid || otp.length !== 4;

  // Get formatted phone number for display
  const formattedPhone = authService.formatPhoneNumber(phone);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Shield className="w-12 h-12 mx-auto mb-2 text-[#053468]" />
        <h3 className="font-medium text-[#053468] mb-2">رمز التحقق</h3>
        <p className="text-sm text-gray-600">
          تم إرسال رمز التحقق إلى{" "}
          <span
            className="font-medium inline-block"
            dir="ltr"
            style={{ direction: "ltr" }}
          >
            {formattedPhone}
          </span>
        </p>
      </div>

      <FormField
        label="رمز التحقق"
        error={
          validationState.otp.touched && !validationState.otp.isValid
            ? validationState.otp.message
            : undefined
        }
        icon={<Shield className="w-4 h-4" />}
      >
        <Input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={otp}
          onChange={(e) => handleOTPInput(e.target.value)}
          onBlur={onOTPBlur}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="- - - -"
          className={cn(
            "text-center text-lg tracking-[0.5em] font-mono",
            "direction-ltr",
            validationState.otp.touched && !validationState.otp.isValid
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-[#FFAA01]"
          )}
          style={{ direction: "ltr" }}
          maxLength={4}
          disabled={isLoading}
          autoComplete="one-time-code"
          aria-label="رمز التحقق المكون من 4 أرقام"
        />
      </FormField>

      {/* Help text */}
      <div className="text-xs text-gray-500 text-center px-2 leading-relaxed">
        أدخل رمز التحقق المكون من 4 أرقام المرسل إلى هاتفك
      </div>

      {/* Resend OTP section */}
      {onResend && (
        <div className="text-center">
          {resendCooldown > 0 ? (
            <p className="text-sm text-gray-500">
              يمكنك طلب رمز جديد خلال{" "}
              <span className="font-mono text-[#053468] font-medium">
                {resendCooldown}
              </span>{" "}
              ثانية
            </p>
          ) : (
            <Button
              variant="ghost"
              onClick={handleResendClick}
              disabled={isLoading}
              className="text-sm text-[#053468] hover:text-[#FFAA01] hover:bg-transparent p-0 h-auto font-normal"
            >
              <RotateCcw className="w-4 h-4 ml-1" />
              إرسال رمز التحقق مرة أخرى
            </Button>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="flex-1 bg-[#FFAA01] hover:bg-[#e69900] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="تأكيد رمز التحقق"
        >
          {isLoading ? "جاري التحقق..." : "تأكيد"}
        </Button>
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="border-[#053468] text-[#053468] hover:bg-[#053468] hover:text-white disabled:opacity-50"
          aria-label="العودة إلى الخطوة السابقة"
        >
          رجوع
        </Button>
      </div>
    </div>
  );
};
