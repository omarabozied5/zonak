import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface BackButtonProps {
  className?: string;
  showOnHome?: boolean;
  onClick?: () => void;
  fallbackRoute?: string; // NEW: Custom fallback route
}

const BackButton: React.FC<BackButtonProps> = ({
  className = "",
  showOnHome = false,
  onClick,
  fallbackRoute,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!showOnHome && location.pathname === "/") return null;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (fallbackRoute) {
      // Use fallback route if provided (for payment flows)
      navigate(fallbackRoute, { replace: true });
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm ${className}`}
      aria-label="العودة"
    >
      <svg
        className="w-5 h-5 text-gray-700"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
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
