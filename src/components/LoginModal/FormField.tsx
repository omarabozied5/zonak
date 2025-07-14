// FormField.tsx
import React from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  children,
  icon,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-[#053468]">
      {icon}
      {label}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
        {error}
      </p>
    )}
  </div>
);
