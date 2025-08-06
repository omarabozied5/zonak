// LoginModal.tsx - Updated for phone → password → login flow
import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

// Import types and services
import { LoginStep, ValidationState, combineName } from "./LoginModal/types";
import { validation } from "./LoginModal/validation";
import { authService } from "./LoginModal/authService";

// Import step components
import { PhoneStep } from "./LoginModal/PhoneStep";
import { PasswordStep } from "./LoginModal/PasswordStep";
import { StepIndicator } from "./LoginModal/StepIndicator";
import { UserDetailsStep } from "./LoginModal/UserDetailsStep";
import { OTPStep } from "./LoginModal/OTPStep";

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
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");
  const [authToken, setAuthToken] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null); // Store logged in user info
  const [step, setStep] = useState<LoginStep>("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<
    "new" | "verified" | "unverified" | null
  >(null);
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
          result = validation.name(`${firstName} ${lastName}`.trim());
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
    [firstName, lastName]
  );

  // Auto-validation on input change
  useEffect(() => {
    if (validationState.phone.touched) {
      validateField("phone", phone);
    }
  }, [phone, validateField, validationState.phone.touched]);

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

  // MAIN PHONE SUBMIT HANDLER - Updated for new flow
  const handlePhoneSubmit = useCallback(async () => {
    const isValid = validateField("phone", phone);
    if (!isValid) {
      toast.error("يرجى إدخال رقم جوال صحيح");
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Check if user exists (phone only)
      const userExistsResult = await authService.checkUserExists(phone);

      if (userExistsResult.exists) {
        // User exists - go to password step
        console.log("✅ User exists - proceeding to password step");
        if (userExistsResult.user) {
          setCurrentUser(userExistsResult.user);
        }
        setStep("password");
        toast.info("يرجى إدخال كلمة المرور للمتابعة");
      } else {
        // User doesn't exist - go to registration
        console.log("🆕 New user - proceeding to registration");
        setUserType("new");
        setStep("new-user-details");
        toast.info("مرحباً! يرجى إكمال بياناتك لإنشاء حساب جديد");
      }
    } catch (error) {
      console.error("Phone submit error:", error);
      toast.error(
        error instanceof Error ? error.message : "فشل في التحقق من رقم الهاتف"
      );
    } finally {
      setIsLoading(false);
    }
  }, [phone, validateField]);

  // NEW PASSWORD SUBMIT HANDLER
  const handlePasswordSubmit = useCallback(async () => {
    const isPasswordValid = validateField("password", password);
    if (!isPasswordValid) {
      toast.error("يرجى إدخال كلمة مرور صحيحة");
      return;
    }

    setIsLoading(true);
    try {
      // Step 2: Login with phone and password
      const loginResult = await authService.loginWithPassword(phone, password);

      // Store user info and token
      setCurrentUser(loginResult.user);
      setAuthToken(loginResult.token);

      if (loginResult.userType === "verified") {
        // User is verified - complete login
        setUserType("verified");

        const storeUser = {
          id: loginResult.user.id,
          first_name: loginResult.user.first_name,
          last_name: loginResult.user.last_name,
          phone: loginResult.user.phone,
          createdAt: loginResult.user.createdAt,
          lastLogin: loginResult.user.lastLogin,
          isNewUser: false,
        };

        storeLogin(storeUser, loginResult.token);
        resetModal();
        onClose();
        onSuccess?.();

        const displayName = combineName(
          loginResult.user.first_name,
          loginResult.user.last_name
        );
        toast.success(`مرحباً بعودتك ${displayName}!`);
      } else if (loginResult.userType === "unverified") {
        // User login successful but needs verification
        setUserType("unverified");

        try {
          const otpResult = await authService.sendOTP(phone, loginResult.token);
          setOtpSessionId(otpResult.sessionId);
          setStep("existing-user-otp");
          toast.info("تم إرسال رمز التحقق لتفعيل حسابك");
        } catch (otpError) {
          console.error("Failed to send OTP:", otpError);
          toast.error("فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى");
          // Reset on failure
          setStep("phone");
          setUserType(null);
          setAuthToken("");
          setCurrentUser(null);
        }
      }
    } catch (error) {
      console.error("Password submit error:", error);
      toast.error(
        error instanceof Error ? error.message : "فشل في تسجيل الدخول"
      );
    } finally {
      setIsLoading(false);
    }
  }, [phone, password, validateField, storeLogin, onClose, onSuccess]);

  // NEW USER REGISTRATION SUBMIT
  const handleNewUserDetailsSubmit = useCallback(async () => {
    const isNameValid = validateField(
      "name",
      `${firstName} ${lastName}`.trim()
    );
    const isPasswordValid = validateField("password", password);

    if (
      !isNameValid ||
      !isPasswordValid ||
      !firstName.trim() ||
      !lastName.trim()
    ) {
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setIsLoading(true);
    try {
      // Register user first - this returns a token
      const registerResult = await authService.registerUser(
        phone,
        firstName.trim(),
        lastName.trim(),
        password
      );

      // Store the registration token for send_otp
      setAuthToken(registerResult.registrationToken);

      // Then send OTP for verification using the token
      const otpResult = await authService.sendOTP(
        phone,
        registerResult.registrationToken
      );
      setOtpSessionId(otpResult.sessionId);
      setStep("new-user-otp");
      toast.success(
        "تم إنشاء حسابك بنجاح. يرجى تأكيد رقم الجوال لتفعيل الحساب"
      );
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error instanceof Error ? error.message : "فشل في إنشاء الحساب"
      );
    } finally {
      setIsLoading(false);
    }
  }, [firstName, lastName, password, phone, validateField]);

  // OTP VERIFICATION HANDLER
  const handleOTPVerification = useCallback(async () => {
    const isValid = validateField("otp", otp);
    if (!isValid || !otpSessionId) {
      toast.error("يرجى إدخال رمز التحقق الصحيح");
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP
      const verificationResult = await authService.verifyOTP(
        phone,
        otp,
        otpSessionId,
        authToken
      );

      if (!verificationResult) {
        toast.error("رمز التحقق غير صحيح");
        setOtp("");
        return;
      }

      // After successful verification, login the user
      const loginResult = await authService.loginAfterOTPVerification(phone);

      const storeUser = {
        id: loginResult.user.id,
        first_name: loginResult.user.first_name,
        last_name: loginResult.user.last_name,
        phone: loginResult.user.phone,
        createdAt: loginResult.user.createdAt,
        lastLogin: loginResult.user.lastLogin,
        isNewUser: userType === "new",
      };

      storeLogin(storeUser, loginResult.token);

      const displayName = combineName(
        loginResult.user.first_name,
        loginResult.user.last_name
      );

      if (userType === "new") {
        toast.success(`مرحباً ${firstName}! تم إنشاء حسابك وتفعيله بنجاح`);
      } else {
        toast.success(`مرحباً بعودتك ${displayName}! تم تفعيل حسابك`);
      }

      resetModal();
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("OTP verification error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "فشل في تأكيد رمز التحقق";

      if (
        errorMessage.includes("رمز التحقق غير صحيح") ||
        errorMessage.includes("invalid")
      ) {
        toast.error("رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى");
        setOtp("");
      } else if (
        errorMessage.includes("انتهت صلاحية") ||
        errorMessage.includes("expired")
      ) {
        toast.error("انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد");
        if (userType === "new") {
          setStep("new-user-details");
        } else {
          setStep("password");
        }
        setOtp("");
        setOtpSessionId("");
        setAuthToken("");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    otp,
    phone,
    firstName,
    otpSessionId,
    userType,
    validateField,
    storeLogin,
    onClose,
    onSuccess,
    authToken,
  ]);

  // Navigation handlers - Updated for new flow
  const handleBack = useCallback(() => {
    switch (step) {
      case "password":
        setStep("phone");
        setPassword("");
        setShowPassword(false);
        setCurrentUser(null);
        break;
      case "new-user-details":
        setStep("phone");
        setPassword("");
        setFirstName("");
        setLastName("");
        setShowPassword(false);
        setUserType(null);
        setAuthToken("");
        break;
      case "new-user-otp":
      case "existing-user-otp":
        if (userType === "new") {
          setStep("new-user-details");
        } else {
          setStep("password");
        }
        setOtp("");
        setOtpSessionId("");
        break;
    }
  }, [step, userType]);

  const resetModal = useCallback(() => {
    setPhone("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setOtp("");
    setOtpSessionId("");
    setAuthToken("");
    setCurrentUser(null);
    setStep("phone");
    setShowPassword(false);
    setUserType(null);
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

  // Resend OTP handler
  const handleResendOTP = useCallback(async () => {
    if (!authToken) {
      toast.error("خطأ في النظام. يرجى المحاولة من البداية");
      setStep("phone");
      return;
    }

    setIsLoading(true);
    try {
      const otpResult = await authService.sendOTP(phone, authToken);
      setOtpSessionId(otpResult.sessionId);
      setOtp(""); // Clear current OTP
      toast.success("تم إرسال رمز التحقق مرة أخرى");
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("فشل في إعادة إرسال رمز التحقق");
    } finally {
      setIsLoading(false);
    }
  }, [phone, authToken]);

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
          />
        );

      case "password":
        return (
          <PasswordStep
            existingUser={currentUser}
            phone={phone} // Pass phone for display if no user data
            password={password}
            showPassword={showPassword}
            validationState={validationState}
            isLoading={isLoading}
            onPasswordChange={(value) =>
              handleInputChange("password", value, setPassword)
            }
            onPasswordBlur={() => handleInputBlur("password", password)}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handlePasswordSubmit}
            onBack={handleBack}
          />
        );

      case "new-user-details":
        return (
          <UserDetailsStep
            firstName={firstName}
            lastName={lastName}
            phone={phone}
            password={password}
            showPassword={showPassword}
            validationState={validationState}
            isLoading={isLoading}
            onFirstNameChange={(value) =>
              handleInputChange("name", value, setFirstName)
            }
            onLastNameChange={(value) =>
              handleInputChange("name", value, setLastName)
            }
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
      case "existing-user-otp":
        return (
          <OTPStep
            phone={phone}
            otp={otp}
            validationState={validationState}
            isLoading={isLoading}
            onOTPChange={(value) => handleInputChange("otp", value, setOtp)}
            onOTPBlur={() => handleInputBlur("otp", otp)}
            onSubmit={handleOTPVerification}
            onBack={handleBack}
            onResend={handleResendOTP}
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
          title: "مرحباً بك في زونك",
          description: "ادخل رقم جوالك للدخول أو التسجيل",
        };
      case "password":
        return {
          title: "تسجيل الدخول",
          description: "ادخل كلمة المرور لتسجيل الدخول",
        };
      case "new-user-details":
        return {
          title: "إنشاء حساب جديد",
          description: "أكمل بياناتك الشخصية",
        };
      case "new-user-otp":
        return {
          title: "تأكيد الحساب الجديد",
          description: "ادخل رمز التحقق لتفعيل حسابك الجديد",
        };
      case "existing-user-otp":
        return {
          title: "تفعيل الحساب",
          description: "ادخل رمز التحقق لتفعيل حسابك",
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

          {/* Step Indicator - Show for multi-step flows */}
          {(step === "new-user-details" || step === "new-user-otp") && (
            <StepIndicator currentStep={step} />
          )}

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
