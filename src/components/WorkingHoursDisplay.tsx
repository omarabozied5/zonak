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
  second_open_time?: string | null;
  second_close_time?: string | null;
  is_second_period?: number;
}

interface Restaurant {
  working_hours: WorkingHour[];
}

interface WorkingHoursDisplayProps {
  restaurant: Restaurant;
}

interface PlaceStatus {
  status: "Open" | "Close" | "OpenAllDay" | "CloseAllDay";
  until?: string;
  text?: string;
  color?: string;
}

// Time formatting function
const formatTime = (time: string | null | Date): string => {
  if (!time) return "12:00 ص";

  let date: Date;
  if (time instanceof Date) {
    date = time;
  } else {
    if (time === "00:00:00") return "12:00 ص";
    const [hour, minute] = time.split(":");
    date = new Date();
    date.setHours(+hour);
    date.setMinutes(+minute);
  }

  return new Intl.DateTimeFormat("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

// Simplified place status checker based on business rules
const isPlaceOpenNow = (
  workingHoursToday: WorkingHour | undefined,
  currentTime: Date = new Date()
): PlaceStatus => {
  // If no working hours data
  if (!workingHoursToday) {
    return {
      status: "CloseAllDay",
      text: "مغلق",
      color: "text-gray-500",
    };
  }

  // Case 1: is_24h is true - restaurant is open 24 hours (ignore all other flags)
  if (workingHoursToday.is_24h) {
    return {
      status: "OpenAllDay",
      text: "مفتوح 24 ساعة",
      color: "text-green-600",
    };
  }

  // Case 2: is_24h is false - check is_closed
  if (!workingHoursToday.is_24h) {
    // If is_closed is true, restaurant is closed
    if (
      workingHoursToday.is_closed === "1" ||
      workingHoursToday.is_closed_bool === true
    ) {
      return {
        status: "CloseAllDay",
        text: "مغلق",
        color: "text-gray-500",
      };
    }

    // If is_closed is false, check open/close times
    const parseTime = (timeStr: string | null): Date | null => {
      if (!timeStr || timeStr.trim() === "") return null;
      const [h, m] = timeStr.split(":").map(Number);
      const date = new Date(currentTime);
      date.setHours(h, m || 0, 0, 0);
      return date;
    };

    const isTimeBetween = (start: Date | null, end: Date | null): boolean => {
      if (!start || !end) return false;
      if (end < start) {
        // Crosses midnight
        return currentTime >= start || currentTime < end;
      }
      return currentTime >= start && currentTime < end;
    };

    // Case 3: Check if restaurant has second period (is_second_period = 1)
    if (workingHoursToday.is_second_period === 1) {
      const secondOpen = parseTime(workingHoursToday.second_open_time);
      const secondClose = parseTime(workingHoursToday.second_close_time);

      if (isTimeBetween(secondOpen, secondClose)) {
        return {
          status: "Open",
          until: formatTime(secondClose!),
          text: `مفتوح حتى ${formatTime(secondClose!)}`,
          color: "text-green-600",
        };
      }

      // If not in second period but has second period, check if we should show next opening
      if (secondOpen && currentTime < secondOpen) {
        return {
          status: "Close",
          until: formatTime(secondOpen),
          text: `مغلق - يفتح ${formatTime(secondOpen)}`,
          color: "text-red-500",
        };
      }
    } else {
      // Regular single period
      const firstOpen = parseTime(workingHoursToday.open_time);
      const firstClose = parseTime(workingHoursToday.close_time);

      if (isTimeBetween(firstOpen, firstClose)) {
        return {
          status: "Open",
          until: formatTime(firstClose!),
          text: `مفتوح حتى ${formatTime(firstClose!)}`,
          color: "text-green-600",
        };
      }

      // If not open now, check if we should show next opening
      if (firstOpen && currentTime < firstOpen) {
        return {
          status: "Close",
          until: formatTime(firstOpen),
          text: `مغلق - يفتح ${formatTime(firstOpen)}`,
          color: "text-red-500",
        };
      }
    }
  }

  // Default: closed
  return {
    status: "CloseAllDay",
    text: "مغلق",
    color: "text-gray-500",
  };
};

// Get detailed working hours display for a day
const getWorkingHourDisplay = (
  dayData: WorkingHour | undefined
): { text: string; color: string } => {
  if (!dayData) return { text: "مغلق", color: "text-gray-500" };

  // Check if 24 hours first (ignore all other flags)
  if (dayData.is_24h) {
    return { text: "مفتوح 24 ساعة", color: "text-green-600" };
  }

  // Check if explicitly closed
  if (dayData.is_closed === "1" || dayData.is_closed_bool === true) {
    return { text: "مغلق", color: "text-gray-500" };
  }

  // Build time display based on periods
  const periods: string[] = [];

  if (dayData.is_second_period === 1) {
    // Show second period times
    if (dayData.second_open_time && dayData.second_close_time) {
      periods.push(
        `${formatTime(dayData.second_open_time)} - ${formatTime(
          dayData.second_close_time
        )}`
      );
    }
  } else {
    // Show regular period times
    if (dayData.open_time && dayData.close_time) {
      periods.push(
        `${formatTime(dayData.open_time)} - ${formatTime(dayData.close_time)}`
      );
    }
  }

  if (periods.length > 0) {
    return { text: periods.join(" • "), color: "text-gray-700" };
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

  // Convert JS day (0=Sunday) to API day format (7=Sunday, 1=Monday, etc.)
  const convertJSDayToAPIDay = (jsDay: number): number => {
    return jsDay === 0 ? 7 : jsDay;
  };

  // Get today's hours for status calculation
  const todayAPIDay = convertJSDayToAPIDay(today);
  const todayHours = workingHours.find((d) => d.day === todayAPIDay);
  const currentStatus = isPlaceOpenNow(todayHours);

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
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                currentStatus.status === "Open" ||
                currentStatus.status === "OpenAllDay"
                  ? "bg-green-400"
                  : "bg-red-400"
              }`}
            >
              <Clock className="h-3 w-3 text-white" />
            </div>
            <div className="flex-1">
              <span
                className={`font-medium text-sm ${
                  currentStatus.color || "text-gray-700"
                }`}
              >
                {currentStatus.text || "غير محدد"}
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
                const apiDay = convertJSDayToAPIDay(index);
                const dayData = workingHours.find((d) => d.day === apiDay);
                const dayDisplay = getWorkingHourDisplay(dayData);
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
                      {isToday && (
                        <span className="mr-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          اليوم
                        </span>
                      )}
                    </div>
                    <span className={`text-sm ${dayDisplay.color}`}>
                      {dayDisplay.text}
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
