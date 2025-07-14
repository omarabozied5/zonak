// StepIndicator.tsx
import React from "react";
import { Phone, Lock, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginStep } from "./types";

interface StepIndicatorProps {
  currentStep: LoginStep;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
}) => {
  const steps = [
    { key: "phone", label: "رقم الجوال", icon: <Phone className="w-4 h-4" /> },
    {
      key: "existing-user-password",
      label: "كلمة المرور",
      icon: <Lock className="w-4 h-4" />,
    },
    {
      key: "new-user-details",
      label: "البيانات",
      icon: <User className="w-4 h-4" />,
    },
    {
      key: "new-user-otp",
      label: "التحقق",
      icon: <Shield className="w-4 h-4" />,
    },
  ];

  const currentIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <div className="flex justify-center items-center gap-2 mb-6">
      {steps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = step.key === currentStep;

        return (
          <div
            key={step.key}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all",
              isCurrent
                ? "bg-[#FFAA01] text-white"
                : isActive
                ? "bg-[#053468] text-white"
                : "bg-gray-100 text-gray-400"
            )}
          >
            {step.icon}
            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};
