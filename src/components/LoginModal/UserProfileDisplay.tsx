import React from "react";
import { User, Phone, Clock } from "lucide-react";

interface UserProfileDisplayProps {
  name: string;
  phone: string;
  formatPhoneDisplay: (phone: string) => string;
  lastLogin?: string;
  isReturningUser?: boolean;
}

const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({
  name,
  phone,
  formatPhoneDisplay,
  lastLogin,
  isReturningUser = false,
}) => {
  const getInitials = (fullName: string) => {
    const words = fullName.trim().split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const formatLastLogin = (loginTime: string) => {
    const now = new Date();
    const login = new Date(loginTime);
    const diffInHours = Math.floor(
      (now.getTime() - login.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "منذ دقائق";
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInHours < 48) return "منذ يوم";
    return `منذ ${Math.floor(diffInHours / 24)} أيام`;
  };

  return (
    <div className="relative">
      {/* Welcome back badge */}
      {isReturningUser && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10 shadow-lg">
          مرحباً بعودتك
        </div>
      )}

      <div className="text-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm">
        {/* Avatar */}
        <div className="relative mx-auto mb-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">
              {getInitials(name)}
            </span>
          </div>

          {/* Status indicator */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* User info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-800">مرحباً {name}</h3>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span className="font-mono" dir="ltr">
              {formatPhoneDisplay(phone)}
            </span>
          </div>

          {/* Last login info */}
          {lastLogin && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>آخر دخول: {formatLastLogin(lastLogin)}</span>
            </div>
          )}
        </div>

        {/* Account status */}
        <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          حساب مُفعل
        </div>
      </div>
    </div>
  );
};

export default UserProfileDisplay;
