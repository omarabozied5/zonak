import { User, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { ValidationState } from "./types";

interface RegistrationFormProps {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  validationState: ValidationState;
  isLoading: boolean;
  showPassword: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  firstName,
  lastName,
  phone,
  password,
  validationState,
  isLoading,
  showPassword,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onBack,
}) => {
  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    phone &&
    password &&
    validationState.phone.isValid &&
    validationState.password.isValid;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="الاسم الأول" icon={<User className="w-4 h-4" />}>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="الاسم الأول"
            className="text-right"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="الاسم الأخير" icon={<User className="w-4 h-4" />}>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="الاسم الأخير"
            className="text-right"
            disabled={isLoading}
          />
        </FormField>
      </div>

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
          placeholder="05xxxxxxxx أو +966xxxxxxxx"
          className="text-right"
          disabled={isLoading}
          readOnly // Phone is already entered in first step
        />
      </FormField>

      <FormField
        label="كلمة المرور"
        error={
          validationState.password.touched && !validationState.password.isValid
            ? validationState.password.message
            : undefined
        }
        icon={<Lock className="w-4 h-4" />}
      >
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="ادخل كلمة المرور (8 أحرف على الأقل)"
            className="text-right pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#053468]"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </FormField>

      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={isLoading || !isFormValid}
          className="flex-1 bg-[#FFAA01] hover:bg-[#e69900] text-white"
        >
          {isLoading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
        </Button>
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="border-[#053468] text-[#053468] hover:bg-[#053468] hover:text-white"
        >
          رجوع
        </Button>
      </div>
    </div>
  );
};
