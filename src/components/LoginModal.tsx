// LoginModal.tsx - Updated to pass password to final login
import React, { useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

// Import components
import { LoginForm } from "./LoginModal/LoginForm";
import { RegistrationForm } from "./LoginModal/RegistrationForm";
import { OTPVerification } from "./LoginModal/OTPVerification";

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
  const [step, setStep] = useState<LoginStep>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"new" | "existing" | null>(null);

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
        case "password":
          result = authService.validatePassword(value);
          break;
        case "name":
          result = authService.validateUserName(
            `${firstName} ${lastName}`.trim()
          );
          break;
        case "otp":
          result = authService.validateOTP(value);
          break;
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

  // Login handler
  const handleLogin = useCallback(
    async (phoneValue: string, passwordValue: string) => {
      const isPhoneValid = validateField("phone", phoneValue);
      const isPasswordValid = validateField("password", passwordValue);

      if (!isPhoneValid || !isPasswordValid) {
        toast.error("يرجى تصحيح الأخطاء في النموذج");
        return;
      }

      setIsLoading(true);
      try {
        const loginResult = await authService.loginWithPassword(
          phoneValue,
          passwordValue
        );

        if (loginResult.userType === "verified") {
          // Complete login for verified user
          const storeUser = {
            id: loginResult.user!.id,
            first_name: loginResult.user!.first_name,
            last_name: loginResult.user!.last_name,
            phone: loginResult.user!.phone,
            createdAt: loginResult.user!.lastLogin,
            lastLogin: loginResult.user!.lastLogin,
            isNewUser: false,
          };

          storeLogin(storeUser, loginResult.token);
          resetModal();
          onClose();
          onSuccess?.();
          toast.success(`مرحباً بعودتك ${loginResult.user!.first_name}!`);
        } else {
          // User needs verification
          setUserType("existing");
          setAuthToken(loginResult.token);

          const otpResult = await authService.sendOTP(
            phoneValue,
            loginResult.token
          );
          setOtpSessionId(otpResult.sessionId);
          setStep("otp");
          toast.info("تم إرسال رمز التحقق لتفعيل حسابك");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error(
          error instanceof Error ? error.message : "فشل في تسجيل الدخول"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [validateField, storeLogin, onClose, onSuccess]
  );

  // Registration handler
  const handleRegistration = useCallback(
    async (
      phoneValue: string,
      firstNameValue: string,
      lastNameValue: string,
      passwordValue: string
    ) => {
      const isPhoneValid = validateField("phone", phoneValue);
      const isPasswordValid = validateField("password", passwordValue);
      const isNameValid = validateField(
        "name",
        `${firstNameValue} ${lastNameValue}`.trim()
      );

      if (!isPhoneValid || !isPasswordValid || !isNameValid) {
        toast.error("يرجى تصحيح الأخطاء في النموذج");
        return;
      }

      setIsLoading(true);
      try {
        // Register user
        const registerResult = await authService.registerUser(
          phoneValue,
          firstNameValue.trim(),
          lastNameValue.trim(),
          passwordValue
        );

        setUserType("new");
        setAuthToken(registerResult.registrationToken);

        // Send OTP
        const otpResult = await authService.sendOTP(
          phoneValue,
          registerResult.registrationToken
        );
        setOtpSessionId(otpResult.sessionId);
        setStep("otp");
        toast.success("تم إنشاء حسابك. يرجى تأكيد رقم الجوال");
      } catch (error) {
        console.error("Registration error:", error);
        toast.error(
          error instanceof Error ? error.message : "فشل في إنشاء الحساب"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [validateField]
  );

  // OTP verification handler
  const handleOTPVerification = useCallback(
    async (otpValue: string) => {
      const isValid = validateField("otp", otpValue);
      if (!isValid || !otpSessionId) {
        toast.error("يرجى إدخال رمز التحقق الصحيح");
        return;
      }

      setIsLoading(true);
      try {
        const isOtpValid = await authService.verifyOTP(
          phone,
          otpValue,
          otpSessionId,
          authToken
        );

        if (!isOtpValid) {
          toast.error("رمز التحقق غير صحيح");
          return;
        }

        console.log("🔥 OTP verified successfully, performing final login...");

        // FIXED: Pass the password to get real user data from backend
        const loginResult = await authService.loginAfterOTPVerification(
          phone,
          password // ✅ Pass the actual password
        );

        console.log("🔥 Final login result:", loginResult);

        // Store user with real ID from backend
        const storeUser = {
          id: loginResult.user.id,
          first_name: loginResult.user.first_name,
          last_name: loginResult.user.last_name,
          phone: loginResult.user.phone,
          createdAt: loginResult.user.createdAt,
          lastLogin: loginResult.user.lastLogin,
          isNewUser: userType === "new",
        };

        console.log("🔥 Storing user in auth store:", storeUser);

        storeLogin(storeUser, loginResult.token);

        if (userType === "new") {
          toast.success(`مرحباً ${firstName}! تم إنشاء حسابك وتفعيله بنجاح`);
        } else {
          toast.success(`مرحباً بعودتك! تم تفعيل حسابك`);
        }

        resetModal();
        onClose();
        onSuccess?.();
      } catch (error) {
        console.error("❌ OTP verification error:", error);
        toast.error(
          error instanceof Error ? error.message : "فشل في تأكيد رمز التحقق"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      validateField,
      phone,
      password, // ✅ Include password in dependencies
      otpSessionId,
      authToken,
      userType,
      firstName,
      storeLogin,
      onClose,
      onSuccess,
    ]
  );

  // Resend OTP handler
  const handleResendOTP = useCallback(async () => {
    if (!authToken) {
      toast.error("خطأ في النظام");
      return;
    }

    setIsLoading(true);
    try {
      const otpResult = await authService.sendOTP(phone, authToken);
      setOtpSessionId(otpResult.sessionId);
      setOtp("");
      toast.success("تم إرسال رمز التحقق مرة أخرى");
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("فشل في إعادة إرسال رمز التحقق");
    } finally {
      setIsLoading(false);
    }
  }, [phone, authToken]);

  // Reset modal state
  const resetModal = useCallback(() => {
    setStep("login");
    setPhone("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setOtp("");
    setOtpSessionId("");
    setAuthToken("");
    setUserType(null);
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
  const handleSwitchToRegistration = useCallback(() => {
    setStep("registration");
  }, []);

  const handleSwitchToLogin = useCallback(() => {
    setStep("login");
  }, []);

  const handleBackFromOTP = useCallback(() => {
    setStep(userType === "new" ? "registration" : "login");
    setOtp("");
    setOtpSessionId("");
  }, [userType]);

  // Render content based on step
  const renderContent = () => {
    switch (step) {
      case "login":
        return (
          <LoginForm
            phone={phone}
            password={password}
            validationState={validationState}
            isLoading={isLoading}
            onPhoneChange={setPhone}
            onPasswordChange={setPassword}
            onSubmit={handleLogin}
            onSwitchToRegistration={handleSwitchToRegistration}
            onValidate={validateField}
          />
        );

      case "registration":
        return (
          <RegistrationForm
            phone={phone}
            firstName={firstName}
            lastName={lastName}
            password={password}
            validationState={validationState}
            isLoading={isLoading}
            onPhoneChange={setPhone}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onPasswordChange={setPassword}
            onSubmit={handleRegistration}
            onSwitchToLogin={handleSwitchToLogin}
            onValidate={validateField}
          />
        );

      case "otp":
        return (
          <OTPVerification
            phone={phone}
            otp={otp}
            validationState={validationState}
            isLoading={isLoading}
            userType={userType}
            onOTPChange={setOtp}
            onSubmit={handleOTPVerification}
            onBack={handleBackFromOTP}
            onResend={handleResendOTP}
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
