import React from "react";
import { useLocation } from "react-router-dom";

interface BackButtonProps {
  className?: string; // allow extra styling
  showOnHome?: boolean; // optionally show on "/" (default false)
}

const BackButton: React.FC<BackButtonProps> = ({
  className = "",
  showOnHome = false,
}) => {
  const location = useLocation();

  if (!showOnHome && location.pathname === "/") return null;

  return (
    <button
      onClick={() => window.history.back()}
      className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm ${className}`}
      aria-label="Go back"
    >
      <svg
        className="w-5 h-5 text-gray-700"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
};

export default BackButton;
