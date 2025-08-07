// FormField.tsx - Enhanced form field component
import React from "react";
import { AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  children,
  icon,
  required = false,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-[#053468]">
      {icon}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
);
