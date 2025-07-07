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
  createdAt?: string;
  lastLogin?: string;
}

// Mock auth functions - replace with your actual implementation
const mockAuthFunctions = {
  checkUserExists: async (phone: string) => {
    // Mock implementation - replace with actual API call
    const mockUsers = [
      { id: "1", name: "أحمد محمد", phone: "0512345678" },
      { id: "2", name: "فاطمة علي", phone: "0523456789" },
      { id: "3", name: "محمد عبدالله", phone: "0534567890" },
    ];

    const user = mockUsers.find((u) => u.phone === phone);
    return { exists: !!user, user };
  },

  loginExistingUser: async (phone: string, password: string) => {
    // Mock implementation - replace with actual API call
    if (password === "123456") {
      const mockUser = {
        id: Date.now().toString(),
        name: "مستخدم تجريبي",
        phone,
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
      const mockUser = { id: Date.now().toString(), name, phone };
      return { user: mockUser, token: "mock-token-" + Date.now() };
    }
    throw new Error("رمز التحقق غير صحيح");
  },

  validatePhone: (phone: string) => {
    return phone.length === 10 && phone.startsWith("05");
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

  formatPhone: (phone: string) => {
    if (phone.length === 10) {
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    }
    return phone;
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

  const { login: storeLogin } = useAuthStore();

  const handlePhoneSubmit = useCallback(async () => {
    if (!mockAuthFunctions.validatePhone(phone)) {
      toast.error("يرجى إدخال رقم هاتف صحيح يبدأ بـ 05 ويتكون من 10 أرقام");
      return;
    }

    setIsLoading(true);
    try {
      const userCheck = await mockAuthFunctions.checkUserExists(phone);

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
  }, []);

  const handleBack = useCallback(() => {
    switch (step) {
      case "existing-user-password":
      case "new-user-details":
        setStep("phone");
        setExistingUser(null);
        setPassword("");
        break;
      case "new-user-otp":
        setStep("new-user-details");
        setOtp("");
        break;
    }
  }, [step]);

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "");
      if (value.length <= 10) {
        setPhone(value);
      }
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

  // Development helper - shows dummy users for testing
  const showTestInfo = () => {
    if (process.env.NODE_ENV === "development") {
      toast.info(
        "أرقام تجريبية: 0512345678, 0523456789, 0534567890 - كلمة المرور: 123456",
        { duration: 5000 }
      );
    } else {
      toast.info("للحصول على حساب تجريبي، يرجى التواصل مع الدعم الفني");
    }
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
                <label className="text-sm font-medium block">رقم الهاتف</label>
                <Input
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyPress={(e) => handleKeyPress(e, handlePhoneSubmit)}
                  className="text-left"
                  dir="ltr"
                  maxLength={10}
                  autoComplete="tel"
                />
                <p className="text-xs text-gray-500">
                  أدخل رقم هاتفك المحمول للمتابعة
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={handlePhoneSubmit}
                  disabled={isLoading || !phone || phone.length !== 10}
                  className="w-full transition-colors"
                  style={{ backgroundColor: "#FFAA01", color: "white" }}
                >
                  {isLoading ? "جاري التحقق..." : "التالي"}
                </Button>
                {process.env.NODE_ENV === "development" && (
                  <Button
                    onClick={showTestInfo}
                    variant="outline"
                    className="w-full text-xs"
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
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-lg font-bold">
                    {existingUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-medium text-lg mb-1">
                  مرحباً {existingUser.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {mockAuthFunctions.formatPhone(existingUser.phone)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium block">كلمة المرور</label>
                <Input
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyPress={(e) => handleKeyPress(e, handleExistingUserLogin)}
                  autoComplete="current-password"
                />
                {process.env.NODE_ENV === "development" && (
                  <p className="text-xs text-gray-500">
                    للتطوير: استخدم كلمة المرور <strong>123456</strong>
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleExistingUserLogin}
                  disabled={isLoading || !password}
                  className="w-full transition-colors"
                  style={{ backgroundColor: "#FFAA01", color: "white" }}
                >
                  {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="w-full transition-colors"
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
                <label className="text-sm font-medium block">
                  الاسم الكامل
                </label>
                <Input
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={name}
                  onChange={handleNameChange}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium block">رقم الهاتف</label>
                <Input
                  type="tel"
                  value={mockAuthFunctions.formatPhone(phone)}
                  disabled
                  className="bg-gray-50 text-gray-700"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium block">كلمة المرور</label>
                <Input
                  type="password"
                  placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyPress={(e) =>
                    handleKeyPress(e, handleNewUserDetailsSubmit)
                  }
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleNewUserDetailsSubmit}
                  disabled={isLoading || !name.trim() || !password}
                  className="w-full transition-colors"
                  style={{ backgroundColor: "#FFAA01", color: "white" }}
                >
                  {isLoading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
                </Button>
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="w-full transition-colors"
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
                <label className="text-sm font-medium block">رمز التحقق</label>
                <Input
                  type="text"
                  placeholder="1234"
                  value={otp}
                  onChange={handleOTPChange}
                  onKeyPress={(e) =>
                    handleKeyPress(e, handleNewUserOTPVerification)
                  }
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={4}
                  autoComplete="one-time-code"
                />
                <div className="text-sm text-gray-500 text-center space-y-1">
                  <p>
                    تم إرسال الرمز إلى{" "}
                    <span className="font-medium">
                      {mockAuthFunctions.formatPhone(phone)}
                    </span>
                  </p>
                  {process.env.NODE_ENV === "development" && (
                    <p className="text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
                      للتطوير: استخدم الرمز <strong>1234</strong>
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleNewUserOTPVerification}
                  disabled={isLoading || otp.length !== 4}
                  className="w-full transition-colors"
                  style={{ backgroundColor: "#FFAA01", color: "white" }}
                >
                  {isLoading ? "جاري التحقق..." : "تأكيد وإنشاء الحساب"}
                </Button>
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="w-full transition-colors"
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
