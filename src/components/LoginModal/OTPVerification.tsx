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
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  // Sync otpDigits with otp prop
  useEffect(() => {
    const digits = otp.padEnd(4, "").split("").slice(0, 4);
    setOtpDigits(digits);
  }, [otp]);

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
    (index: number, value: string) => {
      const cleanValue = value.replace(/\D/g, "");

      if (cleanValue.length > 0) {
        const newDigits = [...otpDigits];
        newDigits[index] = cleanValue[cleanValue.length - 1];
        setOtpDigits(newDigits);

        const newOtp = newDigits.join("");
        onOTPChange(newOtp);

        // Move to next input
        if (index < 3 && cleanValue.length > 0) {
          inputRefs[index + 1].current?.focus();
        }

        // Auto-submit when 4 digits are entered
        if (newOtp.replace("", "").length === 4) {
          setTimeout(() => {
            onSubmit(newOtp);
          }, 100);
        }
      }
    },
    [otpDigits, onOTPChange, onSubmit]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const newDigits = [...otpDigits];

        if (otpDigits[index]) {
          newDigits[index] = "";
          setOtpDigits(newDigits);
          onOTPChange(newDigits.join(""));
        } else if (index > 0) {
          newDigits[index - 1] = "";
          setOtpDigits(newDigits);
          onOTPChange(newDigits.join(""));
          inputRefs[index - 1].current?.focus();
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputRefs[index - 1].current?.focus();
      } else if (e.key === "ArrowRight" && index < 3) {
        inputRefs[index + 1].current?.focus();
      } else if (e.key === "Enter" && otp.length === 4) {
        onSubmit(otp);
      }
    },
    [otpDigits, otp, onOTPChange, onSubmit]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const cleanValue = pastedText.replace(/\D/g, "").slice(0, 4);
      const digits = cleanValue.padEnd(4, "").split("").slice(0, 4);
      setOtpDigits(digits);
      onOTPChange(cleanValue);

      if (cleanValue.length === 4) {
        inputRefs[3].current?.focus();
        setTimeout(() => {
          onSubmit(cleanValue);
        }, 100);
      } else if (cleanValue.length > 0) {
        inputRefs[Math.min(cleanValue.length, 3)].current?.focus();
      }
    },
    [onOTPChange, onSubmit]
  );

  const handleResendClick = useCallback(() => {
    if (resendCooldown === 0) {
      onResend();
      setResendCooldown(60);
    }
  }, [onResend, resendCooldown]);

  const handleOTPBlur = () => {
    onValidate("otp", otp);
  };

  const isSubmitDisabled = isLoading || otp.length !== 4;
  const formattedPhone = authService.formatPhoneNumber(phone);

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
        <h2 className="text-base font-normal text-gray-700 mb-6 leading-relaxed">
          أرسلنا رسالة نصية تحتوي على رمز التفعيل إلى
          <br />
          الرقم{" "}
          <span className="font-medium" dir="ltr">
            {formattedPhone}
          </span>
        </h2>

        {/* OTP Input Boxes */}
        <div className="flex justify-center gap-3 mb-6" dir="ltr">
          {[3, 2, 1, 0].map((index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otpDigits[index]}
              onChange={(e) => handleOTPInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onBlur={handleOTPBlur}
              maxLength={1}
              disabled={isLoading}
              className={cn(
                "w-16 h-16 text-center text-2xl font-medium rounded-xl border-2 transition-all",
                "focus:outline-none focus:ring-0",
                validationState.otp.touched && !validationState.otp.isValid
                  ? "border-red-500 focus:border-red-500"
                  : otpDigits[index]
                  ? "border-gray-300 bg-white"
                  : "border-red-400 bg-white"
              )}
              autoComplete="off"
            />
          ))}
        </div>

        {/* Error Message */}
        {validationState.otp.touched && !validationState.otp.isValid && (
          <p className="text-sm text-red-500 mb-4">
            {validationState.otp.message ||
              "الرمز خطأ، يرجى المحاولة مرة أخرى."}
          </p>
        )}
      </div>

      {/* Resend Section */}
      <div className="text-center">
        {resendCooldown > 0 ? (
          <p className="text-sm text-gray-600">
            أرسل رمز التفعيل{" "}
            <span className="font-medium">
              {String(Math.floor(resendCooldown / 60)).padStart(2, "0")}:
              {String(resendCooldown % 60).padStart(2, "0")}
            </span>
          </p>
        ) : (
          <Button
            variant="ghost"
            onClick={handleResendClick}
            disabled={isLoading}
            className="text-sm text-[#053468] hover:text-[#FFAA01] hover:bg-transparent p-0 h-auto font-normal"
          >
            إرسال رمز التحقق مرة أخرى
          </Button>
        )}
      </div>
    </div>
  );
};
