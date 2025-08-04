// StepIndicator.tsx - Updated for simplified flow
import React from "react";
import { Phone, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginStep } from "./types";

interface StepIndicatorProps {
  currentStep: LoginStep;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
}) => {
  // Only show steps for registration flow (phone step doesn't need indicator)
  const steps = [
    { key: "phone", label: "رقم الجوال", icon: <Phone className="w-4 h-4" /> },
    {
      key: "new-user-details",
      label: "البيانات الشخصية",
      icon: <User className="w-4 h-4" />,
    },
    {
      key: "new-user-otp",
      label: "تأكيد الرقم",
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
              "flex items-center gap-1 px-3 py-2 rounded-full text-xs transition-all",
              isCurrent
                ? "bg-[#FFAA01] text-white shadow-md"
                : isActive
                ? "bg-[#053468] text-white"
                : "bg-gray-100 text-gray-400"
            )}
          >
            {step.icon}
            <span className="hidden sm:inline">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};
