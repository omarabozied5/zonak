import React, { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";

// Types
interface WorkingHour {
  day: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: string | null;
  is_closed_bool?: boolean;
  is_24h?: boolean;
  is_closed_now?: boolean;
}

interface Restaurant {
  working_hours: WorkingHour[];
}

interface WorkingHoursDisplayProps {
  restaurant: Restaurant;
}

// Time formatting function
const formatTime = (time: string | null): string => {
  if (!time || time === "00:00:00") return "12:00 ص";
  const [hour, minute] = time.split(":");
  const date = new Date();
  date.setHours(+hour);
  date.setMinutes(+minute);
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

// Status calculation helper
const getWorkingHourStatus = (dayData: WorkingHour | undefined) => {
  if (!dayData) return { text: "مغلق", color: "text-gray-500" };

  // Priority 1: Explicitly closed for the day
  if (dayData.is_closed === "1" || dayData.is_closed_bool === true) {
    return { text: "مغلق", color: "text-gray-500" };
  }

  // Priority 2: 24-hour operation
  if (dayData.is_24h) {
    return { text: "مفتوح 24 ساعة", color: "text-gray-700" };
  }

  // Priority 3: Currently closed but has operating hours
  if (dayData.is_closed_now && dayData.open_time && dayData.close_time) {
    return {
      text: `مغلق حالياً (${formatTime(dayData.open_time)} - ${formatTime(
        dayData.close_time
      )})`,
      color: "text-gray-500",
    };
  }

  // Priority 4: Regular hours
  if (dayData.open_time && dayData.close_time) {
    return {
      text: `${formatTime(dayData.open_time)} - ${formatTime(
        dayData.close_time
      )}`,
      color: "text-gray-700",
    };
  }

  return { text: "مغلق", color: "text-gray-500" };
};

const WorkingHoursDisplay: React.FC<WorkingHoursDisplayProps> = ({
  restaurant,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const dayNames = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];

  const today = new Date().getDay();
  const workingHours = restaurant?.working_hours || [];

  // Event handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (isOpen && !triggerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggleDropdown();
    }
  };

  // Get today's hours and status
  const todayHours = workingHours.find((d) => d.day === today);
  const todayStatus = getWorkingHourStatus(todayHours);

  return (
    <div className="w-full bg-white" dir="rtl">
      {/* Main container */}
      <div ref={triggerRef} className="relative">
        {/* Main display trigger */}
        <div
          className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 select-none"
          onClick={handleToggleDropdown}
          onKeyDown={handleKeyPress}
          tabIndex={0}
          role="button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="عرض مواعيد العمل الأسبوعية"
        >
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-shrink-0 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Clock className="h-3 w-3 text-gray-800" />
            </div>
            <div className="flex-1">
              <span className={`font-medium text-sm ${todayStatus.color}`}>
                {todayStatus.text}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 mr-1">
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Dropdown content */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white border-t border-gray-100">
            <div className="px-4 py-2">
              {dayNames.map((dayName, index) => {
                const dayData = workingHours.find((d) => d.day === index);
                const dayStatus = getWorkingHourStatus(dayData);
                const isToday = index === today;

                return (
                  <div
                    key={index}
                    className={`flex justify-between items-center py-3 ${
                      isToday ? "font-semibold" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <span
                        className={`text-sm ${
                          isToday ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {dayName}
                      </span>
                    </div>
                    <span className={`text-sm ${dayStatus.color}`}>
                      {dayStatus.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingHoursDisplay;
