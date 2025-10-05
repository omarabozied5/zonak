"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "ابحث عن منتجات",
}: SearchBarProps) {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="flex justify-center mb-4">
      <div className="relative w-full max-w-md">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir="rtl"
          className="w-full h-11 pr-10 pl-12 text-right text-sm font-medium
                     border border-gray-300 rounded-full shadow-sm outline-none
                     focus:border-gray-400 focus:ring-1 focus:ring-gray-200
                     placeholder:text-gray-400"
        />
        {value ? (
          <button
            onClick={handleClear}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        ) : (
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        )}
      </div>
    </div>
  );
}
