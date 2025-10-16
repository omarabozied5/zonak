// LoginModal.tsx - Updated for OTP-only authentication flow
import React, { useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

// Import components
import { PhoneStep } from "./LoginModal/PhoneStep";
import { OTPVerification } from "./LoginModal/OTPVerification";
import { CompleteProfileStep } from "./LoginModal/CompleteProfileStep";

// Import types and services
import { ValidationState, LoginStep } from "./LoginModal/types";
import { authService } from "./LoginModal/authService";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // State management
  const [step, setStep] = useState<LoginStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Validation state
  const [validationState, setValidationState] = useState<ValidationState>({
    phone: { isValid: true, message: "", touched: false },
    password: { isValid: true, message: "", touched: false },
    name: { isValid: true, message: "", touched: false },
    otp: { isValid: true, message: "", touched: false },
  });

  const { login: storeLogin } = useAuthStore();

  // Validation helper
  const validateField = useCallback(
    (field: keyof ValidationState, value: string) => {
      let result;
      switch (field) {
        case "phone":
          result = authService.validatePhone(value);
          break;
        case "otp":
          result = authService.validateOTP(value);
          break;
        case "name":
          result = authService.validateUserName(
            `${firstName} ${lastName}`.trim()
          );
          break;
        default:
          result = { isValid: true, message: "" };
      }

      const isValid = result.isValid;
      const message = result.message;

      setValidationState((prev) => ({
        ...prev,
        [field]: { isValid, message, touched: true },
      }));

      return isValid;
    },
    [firstName, lastName]
  );

  // Step 1: Send OTP to phone number
  const handlePhoneSubmit = useCallback(async () => {
    const isPhoneValid = validateField("phone", phone);

    if (!isPhoneValid) {
      toast.error("يرجى إدخال رقم جوال صحيح");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.sendOTP(phone);
      setOtpSessionId(result.sessionId);
      setStep("otp");
      toast.success("تم إرسال رمز التحقق إلى جوالك");
    } catch (error) {
      // console.error("Send OTP error:", error);
      toast.error(
        error instanceof Error ? error.message : "فشل في إرسال رمز التحقق"
      );
    } finally {
      setIsLoading(false);
    }
  }, [phone, validateField]);

  // Step 2: Verify OTP
  const handleOTPVerification = useCallback(
    async (otpValue: string) => {
      const isValid = validateField("otp", otpValue);
      if (!isValid || !otpSessionId) {
        toast.error("يرجى إدخال رمز التحقق الصحيح");
        return;
      }

      setIsLoading(true);
      try {
        const result = await authService.verifyOTP(
          phone,
          otpValue,
          otpSessionId
        );

        if (!result.isValid) {
          toast.error("رمز التحقق غير صحيح");
          return;
        }

        // Store token for later use
        setAuthToken(result.token);

        if (result.isNewUser) {
          // New user - needs to complete profile
          setIsNewUser(true);
          setStep("complete-profile");
          toast.info("يرجى إكمال بياناتك لإنشاء حسابك");
        } else {
          // Existing user - login directly
          setIsNewUser(false);
          const storeUser = {
            id: result.user!.id,
            first_name: result.user!.first_name,
            last_name: result.user!.last_name,
            phone: result.user!.phone,
            createdAt: result.user!.createdAt,
            lastLogin: result.user!.lastLogin,
            isNewUser: false,
          };

          storeLogin(storeUser, result.token);
          toast.success(`مرحباً بعودتك ${result.user!.first_name}!`);
          resetModal();
          onClose();
          onSuccess?.();
        }
      } catch (error) {
        // console.error("OTP verification error:", error);
        toast.error(
          error instanceof Error ? error.message : "فشل في تأكيد رمز التحقق"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [validateField, phone, otpSessionId, storeLogin, onClose, onSuccess]
  );

  // Step 3: Complete profile for new users
  const handleCompleteProfile = useCallback(async () => {
    const isNameValid = validateField(
      "name",
      `${firstName} ${lastName}`.trim()
    );

    if (!isNameValid || !firstName.trim() || !lastName.trim()) {
      toast.error("يرجى إدخال الاسم الكامل");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.updateUserNames(
        firstName,
        lastName,
        phone,
        authToken
      );

      // Login the user after profile completion
      const storeUser = {
        id: result.user.id,
        first_name: result.user.first_name,
        last_name: result.user.last_name,
        phone: result.user.phone,
        createdAt: result.user.createdAt,
        lastLogin: result.user.lastLogin,
        isNewUser: true,
      };

      storeLogin(storeUser, authToken);
      toast.success(`مرحباً ${firstName}! تم إنشاء حسابك بنجاح`);
      resetModal();
      onClose();
      onSuccess?.();
    } catch (error) {
      // console.error("Complete profile error:", error);
      toast.error(
        error instanceof Error ? error.message : "فشل في إنشاء الحساب"
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    firstName,
    lastName,
    phone,
    authToken,
    validateField,
    storeLogin,
    onClose,
    onSuccess,
  ]);

  // Resend OTP handler
  const handleResendOTP = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await authService.sendOTP(phone);
      setOtpSessionId(result.sessionId);
      setOtp("");
      toast.success("تم إرسال رمز التحقق مرة أخرى");
    } catch (error) {
      // console.error("Resend OTP error:", error);
      toast.error("فشل في إعادة إرسال رمز التحقق");
    } finally {
      setIsLoading(false);
    }
  }, [phone]);

  // Reset modal state
  const resetModal = useCallback(() => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setOtpSessionId("");
    setAuthToken("");
    setFirstName("");
    setLastName("");
    setIsNewUser(false);
    setValidationState({
      phone: { isValid: true, message: "", touched: false },
      password: { isValid: true, message: "", touched: false },
      name: { isValid: true, message: "", touched: false },
      otp: { isValid: true, message: "", touched: false },
    });
  }, []);

  const handleModalClose = useCallback(() => {
    onClose();
    resetModal();
  }, [onClose, resetModal]);

  // Navigation handlers
  const handleBackFromOTP = useCallback(() => {
    setStep("phone");
    setOtp("");
    setOtpSessionId("");
  }, []);

  const handlePhoneBlur = useCallback(() => {
    validateField("phone", phone);
  }, [phone, validateField]);

  // Render content based on step
  const renderContent = () => {
    switch (step) {
      case "phone":
        return (
          <PhoneStep
            phone={phone}
            validationState={validationState}
            isLoading={isLoading}
            onPhoneChange={setPhone}
            onPhoneBlur={handlePhoneBlur}
            onSubmit={handlePhoneSubmit}
          />
        );

      case "otp":
        return (
          <OTPVerification
            phone={phone}
            otp={otp}
            validationState={validationState}
            isLoading={isLoading}
            userType={isNewUser ? "new" : "existing"}
            onOTPChange={setOtp}
            onSubmit={handleOTPVerification}
            onBack={handleBackFromOTP}
            onResend={handleResendOTP}
            onValidate={validateField}
          />
        );

      case "complete-profile":
        return (
          <CompleteProfileStep
            firstName={firstName}
            lastName={lastName}
            phone={phone}
            validationState={validationState}
            isLoading={isLoading}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onSubmit={handleCompleteProfile}
            onValidate={validateField}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent
        className="sm:max-w-md w-full max-w-sm mx-auto p-0"
        dir="rtl"
      >
        <div className="p-6">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
