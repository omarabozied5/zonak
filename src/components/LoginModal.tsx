import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { Eye, EyeOff, Phone, User, Lock, Shield } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type LoginStep =
  | "phone"
  | "existing-user-password"
  | "new-user-details"
  | "new-user-otp";

interface ExistingUser {
  id: string;
  name: string;
  phone: string;
  countryCode: string;
  createdAt?: string;
  lastLogin?: string;
}

interface PhoneValidationResult {
  isValid: boolean;
  message: string;
  countryCode: string;
  formattedPhone: string;
}

// Enhanced mock auth functions with multi-country support
const mockAuthFunctions = {
  validatePhone: (phone: string): PhoneValidationResult => {
    const cleanPhone = phone.replace(/\D/g, "");

    // Saudi Arabia validation
    if (cleanPhone.startsWith("966")) {
      const localNumber = cleanPhone.substring(3);
      if (localNumber.length === 9 && localNumber.startsWith("5")) {
        return {
          isValid: true,
          message: "",
          countryCode: "+966",
          formattedPhone: `+966 ${localNumber.substring(
            0,
            2
          )} ${localNumber.substring(2, 5)} ${localNumber.substring(5)}`,
        };
      }
    } else if (cleanPhone.startsWith("05") && cleanPhone.length === 10) {
      return {
        isValid: true,
        message: "",
        countryCode: "+966",
        formattedPhone: `+966 ${cleanPhone.substring(
          1,
          3
        )} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}`,
      };
    }

    // Egypt validation
    else if (cleanPhone.startsWith("20")) {
      const localNumber = cleanPhone.substring(2);
      if (localNumber.length === 10 && localNumber.startsWith("1")) {
        return {
          isValid: true,
          message: "",
          countryCode: "+20",
          formattedPhone: `+20 ${localNumber.substring(
            0,
            2
          )} ${localNumber.substring(2, 5)} ${localNumber.substring(
            5,
            8
          )} ${localNumber.substring(8)}`,
        };
      }
    } else if (cleanPhone.startsWith("01") && cleanPhone.length === 11) {
      return {
        isValid: true,
        message: "",
        countryCode: "+20",
        formattedPhone: `+20 ${cleanPhone.substring(
          1,
          3
        )} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(
          6,
          9
        )} ${cleanPhone.substring(9)}`,
      };
    }

    return {
      isValid: false,
      message: "يرجى إدخال رقم هاتف صحيح",
      countryCode: "",
      formattedPhone: phone,
    };
  },

  checkUserExists: async (phone: string) => {
    // Mock implementation - replace with actual API call
    const mockUsers = [
      { id: "1", name: "أحمد محمد", phone: "0512345678", countryCode: "+966" },
      { id: "2", name: "فاطمة علي", phone: "0523456789", countryCode: "+966" },
      {
        id: "3",
        name: "محمد عبدالله",
        phone: "01234567890",
        countryCode: "+20",
      },
    ];

    const normalizedPhone = phone.replace(/\D/g, "");
    const user = mockUsers.find((u) => {
      const userPhone = u.phone.replace(/\D/g, "");
      return (
        userPhone === normalizedPhone ||
        userPhone === normalizedPhone.substring(3) || // Remove country code
        userPhone === normalizedPhone.substring(2)
      ); // Remove country code
    });

    return { exists: !!user, user };
  },

  loginExistingUser: async (phone: string, password: string) => {
    // Mock implementation - replace with actual API call
    if (password === "123456") {
      const validation = mockAuthFunctions.validatePhone(phone);
      const mockUser = {
        id: Date.now().toString(),
        name: "مستخدم تجريبي",
        phone,
        countryCode: validation.countryCode,
      };
      return { user: mockUser, token: "mock-token-" + Date.now() };
    }
    throw new Error("كلمة المرور غير صحيحة");
  },

  sendOTP: async (phone: string) => {
    // Mock implementation - replace with actual API call
    return Promise.resolve();
  },

  verifyOTPAndCreateUser: async (
    phone: string,
    otp: string,
    name: string,
    password: string
  ) => {
    // Mock implementation - replace with actual API call
    if (otp === "1234") {
      const validation = mockAuthFunctions.validatePhone(phone);
      const mockUser = {
        id: Date.now().toString(),
        name,
        phone,
        countryCode: validation.countryCode,
      };
      return { user: mockUser, token: "mock-token-" + Date.now() };
    }
    throw new Error("رمز التحقق غير صحيح");
  },

  validateName: (name: string) => {
    return {
      isValid: name.trim().length >= 2,
      message:
        name.trim().length >= 2 ? "" : "يجب أن يحتوي الاسم على حرفين على الأقل",
    };
  },

  validatePassword: (password: string) => {
    return {
      isValid: password.length >= 6,
      message:
        password.length >= 6
          ? ""
          : "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل",
    };
  },

  validateOTP: (otp: string) => {
    return {
      isValid: otp.length === 4,
      message: otp.length === 4 ? "" : "رمز التحقق يجب أن يحتوي على 4 أرقام",
    };
  },

  formatPhoneDisplay: (phone: string) => {
    const validation = mockAuthFunctions.validatePhone(phone);
    return validation.formattedPhone;
  },
};

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<LoginStep>("phone");
  const [existingUser, setExistingUser] = useState<ExistingUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneValidation, setPhoneValidation] =
    useState<PhoneValidationResult | null>(null);

  const { login: storeLogin } = useAuthStore();

  const handlePhoneSubmit = useCallback(async () => {
    const validation = mockAuthFunctions.validatePhone(phone);
    setPhoneValidation(validation);

    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    setIsLoading(true);
    try {
      const userCheck = await mockAuthFunctions.checkUserExists(phone);

      if (userCheck.exists && userCheck.user) {
        setExistingUser({
          ...userCheck.user,
          countryCode: validation.countryCode,
        });
        setStep("existing-user-password");
      } else {
        setStep("new-user-details");
      }
    } catch (error) {
      toast.error("فشل في التحقق من رقم الهاتف");
    } finally {
      setIsLoading(false);
    }
  }, [phone]);

  const handleExistingUserLogin = useCallback(async () => {
    if (!existingUser || !password) return;

    const passwordValidation = mockAuthFunctions.validatePassword(password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message);
      return;
    }

    setIsLoading(true);
    try {
      const loginResult = await mockAuthFunctions.loginExistingUser(
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
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("فشل في تسجيل الدخول");
      }
    } finally {
      setIsLoading(false);
    }
  }, [existingUser, password, storeLogin, onClose, onSuccess]);

  const handleNewUserDetailsSubmit = useCallback(async () => {
    const nameValidation = mockAuthFunctions.validateName(name);
    if (!nameValidation.isValid) {
      toast.error(nameValidation.message);
      return;
    }

    const passwordValidation = mockAuthFunctions.validatePassword(password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message);
      return;
    }

    setIsLoading(true);
    try {
      await mockAuthFunctions.sendOTP(phone);
      setStep("new-user-otp");
      toast.info("تم إرسال رمز التحقق إلى هاتفك");
      if (process.env.NODE_ENV === "development") {
        toast.info("للتطوير: استخدم الرمز 1234", { duration: 3000 });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("فشل في إرسال رمز التحقق");
      }
    } finally {
      setIsLoading(false);
    }
  }, [name, password, phone]);

  const handleNewUserOTPVerification = useCallback(async () => {
    const otpValidation = mockAuthFunctions.validateOTP(otp);
    if (!otpValidation.isValid) {
      toast.error(otpValidation.message);
      return;
    }

    setIsLoading(true);
    try {
      const createUserResult = await mockAuthFunctions.verifyOTPAndCreateUser(
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
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("فشل في تأكيد رمز التحقق");
      }
    } finally {
      setIsLoading(false);
    }
  }, [otp, phone, name, password, storeLogin, onClose, onSuccess]);

  const resetModal = useCallback(() => {
    setPhone("");
    setName("");
    setPassword("");
    setOtp("");
    setStep("phone");
    setExistingUser(null);
    setShowPassword(false);
    setPhoneValidation(null);
  }, []);

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

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^\d+]/g, "");
      setPhone(value);
      setPhoneValidation(null);
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    []
  );

  const handleOTPChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "");
      if (value.length <= 4) {
        setOtp(value);
      }
    },
    []
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
    },
    []
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const getTitle = () => {
    switch (step) {
      case "phone":
        return "تسجيل الدخول";
      case "existing-user-password":
        return "تسجيل الدخول";
      case "new-user-details":
        return "إنشاء حساب جديد";
      case "new-user-otp":
        return "تأكيد رقم الهاتف";
      default:
        return "تسجيل الدخول";
    }
  };

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent, action: () => void) => {
      if (e.key === "Enter" && !isLoading) {
        action();
      }
    },
    [isLoading]
  );

  const handleModalClose = useCallback(() => {
    onClose();
    resetModal();
  }, [onClose, resetModal]);

  const showTestInfo = () => {
    if (process.env.NODE_ENV === "development") {
      toast.info(
        "أرقام تجريبية: 0512345678 (السعودية), 01234567890 (مصر) - كلمة المرور: 123456",
        { duration: 5000 }
      );
    } else {
      toast.info("للحصول على حساب تجريبي، يرجى التواصل مع الدعم الفني");
    }
  };

  const isPhoneValid = () => {
    const validation = mockAuthFunctions.validatePhone(phone);
    return validation.isValid;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-md w-full max-w-sm mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === "phone" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  رقم الهاتف
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={phone}
                    onChange={handlePhoneChange}
                    onKeyPress={(e) => handleKeyPress(e, handlePhoneSubmit)}
                    className="text-left pl-12"
                    dir="ltr"
                    autoComplete="tel"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">
                    الأرقام المدعومة:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <img
                          src="/saudiArabia.png"
                          alt="Saudi Arabia"
                          className="w-4 h-4 mb-1"
                        />
                        <span className="font-semibold text-gray-700">
                          السعودية
                        </span>
                      </div>
                      <p className="text-gray-500" dir="ltr">
                        +966 5X XXX XXXX
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <img
                          src="/egypt.png"
                          alt="Egypt"
                          className="w-4 h-4 mb-1"
                        />
                        <span className="font-semibold text-gray-700">مصر</span>
                      </div>
                      <p className="text-gray-500" dir="ltr">
                        +20 1X XXX XXXX
                      </p>
                    </div>
                  </div>
                </div>
                {phoneValidation && !phoneValidation.isValid && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      {phoneValidation.message}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Button
                  onClick={handlePhoneSubmit}
                  disabled={isLoading || !phone || !isPhoneValid()}
                  className="w-full transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: "#FFAA01", color: "white" }}
                >
                  {isLoading ? "جاري التحقق..." : "التالي"}
                </Button>
                {process.env.NODE_ENV === "development" && (
                  <Button
                    onClick={showTestInfo}
                    variant="outline"
                    className="w-full text-xs transition-all duration-200"
                    style={{ borderColor: "#053468", color: "#053468" }}
                  >
                    عرض أرقام التجربة
                  </Button>
                )}
              </div>
            </>
          )}

          {step === "existing-user-password" && existingUser && (
            <>
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white text-xl font-bold">
                    {existingUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1 text-gray-800">
                  مرحباً {existingUser.name}
                </h3>
                <p className="text-sm text-gray-600 font-mono" dir="ltr">
                  {mockAuthFunctions.formatPhoneDisplay(existingUser.phone)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  كلمة المرور
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyPress={(e) =>
                      handleKeyPress(e, handleExistingUserLogin)
                    }
                    autoComplete="current-password"
                    className="pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {process.env.NODE_ENV === "development" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-700">
                      للتطوير: استخدم كلمة المرور{" "}
                      <span className="font-mono font-bold">123456</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleExistingUserLogin}
                  disabled={isLoading || !password}
                  className="w-full transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: "#FFAA01", color: "white" }}
                >
                  {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="w-full transition-all duration-200 hover:bg-gray-50"
                  style={{ borderColor: "#053468", color: "#053468" }}
                  disabled={isLoading}
                >
                  تغيير رقم الهاتف
                </Button>
              </div>
            </>
          )}

          {step === "new-user-details" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  الاسم الكامل
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="محمد أحمد"
                    value={name}
                    onChange={handleNameChange}
                    autoComplete="name"
                    className="pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  رقم الهاتف
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    value={mockAuthFunctions.formatPhoneDisplay(phone)}
                    disabled
                    className="bg-gray-50 text-gray-700 pr-12"
                    dir="ltr"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  كلمة المرور
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyPress={(e) =>
                      handleKeyPress(e, handleNewUserDetailsSubmit)
                    }
                    autoComplete="new-password"
                    className="pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">6 أحرف على الأقل</p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleNewUserDetailsSubmit}
                  disabled={isLoading || !name.trim() || !password}
                  className="w-full transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: "#FFAA01", color: "white" }}
                >
                  {isLoading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
                </Button>
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="w-full transition-all duration-200 hover:bg-gray-50"
                  style={{ borderColor: "#053468", color: "#053468" }}
                  disabled={isLoading}
                >
                  رجوع
                </Button>
              </div>
            </>
          )}

          {step === "new-user-otp" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  رمز التحقق
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="- - - -"
                    value={otp}
                    onChange={handleOTPChange}
                    onKeyPress={(e) =>
                      handleKeyPress(e, handleNewUserOTPVerification)
                    }
                    className="text-center text-2xl font-mono tracking-[0.5em] pr-12"
                    maxLength={4}
                    autoComplete="one-time-code"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700 text-center">
                    تم إرسال الرمز إلى{" "}
                    <span className="font-mono font-semibold" dir="ltr">
                      {mockAuthFunctions.formatPhoneDisplay(phone)}
                    </span>
                  </p>
                </div>
                {process.env.NODE_ENV === "development" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-700 text-center">
                      للتطوير: استخدم الرمز{" "}
                      <span className="font-mono font-bold">1234</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleNewUserOTPVerification}
                  disabled={isLoading || otp.length !== 4}
                  className="w-full transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: "#FFAA01", color: "white" }}
                >
                  {isLoading ? "جاري التحقق..." : "تأكيد وإنشاء الحساب"}
                </Button>
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="w-full transition-all duration-200 hover:bg-gray-50"
                  style={{ borderColor: "#053468", color: "#053468" }}
                  disabled={isLoading}
                >
                  تغيير البيانات
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
