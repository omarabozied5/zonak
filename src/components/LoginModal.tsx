// LoginModal.tsx
import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

// Import types and services
import { LoginStep, ValidationState, ExistingUser } from "./LoginModal/types";
import { validation } from "./LoginModal/validation";
import { authService } from "./LoginModal/authService";

// Import step components
import { StepIndicator } from "./LoginModal/StepIndicator";
import { PhoneStep } from "./LoginModal/PhoneStep";
import { PasswordStep } from "./LoginModal/PasswordStep";
import { UserDetailsStep } from "./LoginModal/UserDetailsStep";
import { OTPStep } from "./LoginModal/OtpStep";

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
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<LoginStep>("phone");
  const [existingUser, setExistingUser] = useState<ExistingUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>({
    phone: { isValid: true, message: "", touched: false },
    name: { isValid: true, message: "", touched: false },
    password: { isValid: true, message: "", touched: false },
    otp: { isValid: true, message: "", touched: false },
  });

  const { login: storeLogin } = useAuthStore();

  // Validation helper
  const validateField = useCallback(
    (field: keyof ValidationState, value: string) => {
      let result;
      switch (field) {
        case "phone":
          result = validation.phone(value);
          break;
        case "name":
          result = validation.name(value);
          break;
        case "password":
          result = validation.password(value);
          break;
        case "otp":
          result = validation.otp(value);
          break;
      }

      setValidationState((prev) => ({
        ...prev,
        [field]: {
          isValid: result.isValid,
          message: result.message,
          touched: true,
        },
      }));

      return result.isValid;
    },
    []
  );

  // Auto-validation on input change
  useEffect(() => {
    if (validationState.phone.touched) {
      validateField("phone", phone);
    }
  }, [phone, validateField, validationState.phone.touched]);

  useEffect(() => {
    if (validationState.name.touched) {
      validateField("name", name);
    }
  }, [name, validateField, validationState.name.touched]);

  useEffect(() => {
    if (validationState.password.touched) {
      validateField("password", password);
    }
  }, [password, validateField, validationState.password.touched]);

  useEffect(() => {
    if (validationState.otp.touched) {
      validateField("otp", otp);
    }
  }, [otp, validateField, validationState.otp.touched]);

  // Step handlers
  const handlePhoneSubmit = useCallback(async () => {
    const isValid = validateField("phone", phone);
    if (!isValid) return;

    setIsLoading(true);
    try {
      const userCheck = await authService.checkUserExists(phone);
      if (userCheck.exists && userCheck.user) {
        setExistingUser(userCheck.user);
        setStep("existing-user-password");
      } else {
        setStep("new-user-details");
      }
    } catch (error) {
      toast.error("فشل في التحقق من رقم الهاتف");
    } finally {
      setIsLoading(false);
    }
  }, [phone, validateField]);

  const handleExistingUserLogin = useCallback(async () => {
    if (!existingUser) return;

    const isValid = validateField("password", password);
    if (!isValid) return;

    setIsLoading(true);
    try {
      const loginResult = await authService.loginExistingUser(
        existingUser.phone,
        password
      );
      if (loginResult.user && loginResult.token) {
        storeLogin(loginResult.user, loginResult.token);
      }
      resetModal();
      onClose();
      onSuccess?.();
      toast.success(`مرحباً ${existingUser.name}! تم تسجيل الدخول بنجاح`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "فشل في تسجيل الدخول"
      );
    } finally {
      setIsLoading(false);
    }
  }, [existingUser, password, validateField, storeLogin, onClose, onSuccess]);

  const handleNewUserDetailsSubmit = useCallback(async () => {
    const isNameValid = validateField("name", name);
    const isPasswordValid = validateField("password", password);
    const isPhoneValid = validateField("phone", phone);

    if (!isNameValid || !isPasswordValid || !isPhoneValid) return;

    setIsLoading(true);
    try {
      await authService.sendOTP(phone);
      setStep("new-user-otp");
      toast.info("تم إرسال رمز التحقق إلى هاتفك");
      if (process.env.NODE_ENV === "development") {
        toast.info("للتطوير: استخدم الرمز 1234", { duration: 3000 });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "فشل في إرسال رمز التحقق"
      );
    } finally {
      setIsLoading(false);
    }
  }, [name, password, phone, validateField]);

  const handleNewUserOTPVerification = useCallback(async () => {
    const isValid = validateField("otp", otp);
    if (!isValid) return;

    setIsLoading(true);
    try {
      const createUserResult = await authService.verifyOTPAndCreateUser(
        phone,
        otp,
        name.trim(),
        password
      );
      if (createUserResult.user && createUserResult.token) {
        storeLogin(
          { ...createUserResult.user, isNewUser: true },
          createUserResult.token
        );
      }
      resetModal();
      onClose();
      onSuccess?.();
      toast.success(`مرحباً ${name.trim()}! تم إنشاء حسابك بنجاح`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "فشل في تأكيد رمز التحقق"
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    otp,
    phone,
    name,
    password,
    validateField,
    storeLogin,
    onClose,
    onSuccess,
  ]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    switch (step) {
      case "existing-user-password":
      case "new-user-details":
        setStep("phone");
        setExistingUser(null);
        setPassword("");
        setShowPassword(false);
        break;
      case "new-user-otp":
        setStep("new-user-details");
        setOtp("");
        break;
    }
  }, [step]);

  const resetModal = useCallback(() => {
    setPhone("");
    setName("");
    setPassword("");
    setOtp("");
    setStep("phone");
    setExistingUser(null);
    setShowPassword(false);
    setValidationState({
      phone: { isValid: true, message: "", touched: false },
      name: { isValid: true, message: "", touched: false },
      password: { isValid: true, message: "", touched: false },
      otp: { isValid: true, message: "", touched: false },
    });
  }, []);

  // Input handlers
  const handleInputChange = useCallback(
    (
      field: keyof ValidationState,
      value: string,
      setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
      setter(value);
      if (validationState[field].touched) {
        validateField(field, value);
      }
    },
    [validateField, validationState]
  );

  const handleInputBlur = useCallback(
    (field: keyof ValidationState, value: string) => {
      validateField(field, value);
    },
    [validateField]
  );

  // Show test info
  const showTestInfo = () => {
    if (process.env.NODE_ENV === "development") {
      toast.info(
        "أرقام تجريبية: 0512345678, 0523456789, 0534567890 - كلمة المرور: 12345678",
        { duration: 5000 }
      );
    } else {
      toast.info("للحصول على حساب تجريبي، يرجى التواصل مع الدعم الفني");
    }
  };

  // Step content renderer
  const renderStepContent = () => {
    switch (step) {
      case "phone":
        return (
          <PhoneStep
            phone={phone}
            validationState={validationState}
            isLoading={isLoading}
            onPhoneChange={(value) =>
              handleInputChange("phone", value, setPhone)
            }
            onPhoneBlur={() => handleInputBlur("phone", phone)}
            onSubmit={handlePhoneSubmit}
            onShowTestInfo={showTestInfo}
          />
        );

      case "existing-user-password":
        return (
          <PasswordStep
            existingUser={existingUser}
            password={password}
            validationState={validationState}
            isLoading={isLoading}
            showPassword={showPassword}
            onPasswordChange={(value) =>
              handleInputChange("password", value, setPassword)
            }
            onPasswordBlur={() => handleInputBlur("password", password)}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handleExistingUserLogin}
            onBack={handleBack}
          />
        );

      case "new-user-details":
        return (
          <UserDetailsStep
            name={name}
            phone={phone}
            password={password}
            validationState={validationState}
            isLoading={isLoading}
            showPassword={showPassword}
            onNameChange={(value) => handleInputChange("name", value, setName)}
            onNameBlur={() => handleInputBlur("name", name)}
            onPhoneChange={(value) =>
              handleInputChange("phone", value, setPhone)
            }
            onPhoneBlur={() => handleInputBlur("phone", phone)}
            onPasswordChange={(value) =>
              handleInputChange("password", value, setPassword)
            }
            onPasswordBlur={() => handleInputBlur("password", password)}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handleNewUserDetailsSubmit}
            onBack={handleBack}
          />
        );

      case "new-user-otp":
        return (
          <OTPStep
            phone={phone}
            otp={otp}
            validationState={validationState}
            isLoading={isLoading}
            onOTPChange={(value) => handleInputChange("otp", value, setOtp)}
            onOTPBlur={() => handleInputBlur("otp", otp)}
            onSubmit={handleNewUserOTPVerification}
            onBack={handleBack}
          />
        );

      default:
        return null;
    }
  };

  // Get step title and description
  const getStepInfo = () => {
    switch (step) {
      case "phone":
        return {
          title: "مرحباً بك",
          description: "ادخل رقم جوالك للمتابعة",
        };
      case "existing-user-password":
        return {
          title: "تسجيل الدخول",
          description: "ادخل كلمة المرور للدخول",
        };
      case "new-user-details":
        return {
          title: "إنشاء حساب جديد",
          description: "أكمل بياناتك لإنشاء حساب جديد",
        };
      case "new-user-otp":
        return {
          title: "تأكيد الحساب",
          description: "ادخل رمز التحقق المرسل لهاتفك",
        };
      default:
        return { title: "", description: "" };
    }
  };

  const handleModalClose = useCallback(() => {
    onClose();
    resetModal();
  }, [onClose, resetModal]);

  const stepInfo = getStepInfo();

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent
        className="sm:max-w-md w-full max-w-sm mx-auto p-6"
        dir="rtl"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#053468] mb-2">
              {stepInfo.title}
            </h2>
            <p className="text-gray-600 text-sm">{stepInfo.description}</p>
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep={step} />

          {/* Form Content */}
          <div className="space-y-4">{renderStepContent()}</div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <p>بالمتابعة، أنت توافق على الشروط والأحكام</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
