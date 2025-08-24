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
  isOpen: boolean;
  description: string;
  closeTime: string;
  color: string;
}

// Time formatting function (matching Swift formatTimeForDisplay)
const formatTimeForDisplay = (timeString: string | null): string => {
  if (!timeString) return "";

  const inputDate = new Date(`1970-01-01T${timeString}`);
  if (isNaN(inputDate.getTime())) return timeString;

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(inputDate);
};

// Convert time string to minutes (matching Swift implementation)
const timeStringToMinutes = (timeString: string): number => {
  if (!timeString) return 0;
  const components = timeString.split(":");
  if (components.length >= 2) {
    const hours = parseInt(components[0]) || 0;
    const minutes = parseInt(components[1]) || 0;
    return hours * 60 + minutes;
  }
  return 0;
};

// Check if time is within period (matching Swift logic)
const isTimeWithinPeriod = (
  currentMinutes: number,
  openMinutes: number,
  closeMinutes: number
): boolean => {
  if (closeMinutes < openMinutes) {
    // Period extends across midnight
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  } else {
    // Regular period within same day
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }
};

// Check previous day extended hours (EXACT Swift logic)
const checkPreviousDayExtendedHours = (
  hours: WorkingHour,
  previousDayHours: WorkingHour,
  currentMinutes: number
): PlaceStatus | null => {
  // Check second period first (EXACT Swift if condition)
  if (
    previousDayHours.is_second_period === 1 &&
    previousDayHours.second_close_time &&
    previousDayHours.second_open_time
  ) {
    const closeMinutes = timeStringToMinutes(
      previousDayHours.second_close_time
    );
    const openMinutes = timeStringToMinutes(previousDayHours.second_open_time);

    if (closeMinutes < openMinutes && currentMinutes < closeMinutes) {
      if (hours.is_24h ?? true) {
        return {
          isOpen: true,
          description: "مفتوح . يفتح 24 ساعه",
          closeTime: "",
          color: "text-green-600",
        };
      } else {
        return {
          isOpen: true,
          description: `مفتوح . ويغلق ${formatTimeForDisplay(
            previousDayHours.second_close_time
          )}`,
          closeTime: previousDayHours.second_close_time,
          color: "text-green-600",
        };
      }
    }
  }
  // EXACT Swift: else if - only check first period if no second period
  else if (previousDayHours.close_time && previousDayHours.open_time) {
    const closeMinutes = timeStringToMinutes(previousDayHours.close_time);
    const openMinutes = timeStringToMinutes(previousDayHours.open_time);

    if (closeMinutes < openMinutes && currentMinutes < closeMinutes) {
      if (hours.is_24h ?? true) {
        return {
          isOpen: true,
          description: "مفتوح . يفتح 24 ساعه",
          closeTime: "",
          color: "text-green-600",
        };
      } else {
        return {
          isOpen: true,
          description: `مفتوح . ويغلق ${formatTimeForDisplay(
            previousDayHours.close_time
          )}`,
          closeTime: previousDayHours.close_time,
          color: "text-green-600",
        };
      }
    }
  }

  return null;
};

// Check current day hours (EXACT Swift implementation)
const checkCurrentDayHours = (
  hours: WorkingHour,
  currentMinutes: number
): PlaceStatus | null => {
  // Check 24h first (Swift defaults to TRUE)
  if (hours.is_24h ?? true) {
    return {
      isOpen: true,
      description: "مفتوح . يفتح 24 ساعه",
      closeTime: "",
      color: "text-green-600",
    };
  }

  // Check if closed (EXACT Swift logic)
  if (hours.is_closed_bool ?? (false || hours.is_closed === "1")) {
    return {
      isOpen: false,
      description: "مغلق . يغلق 24 ساعه",
      closeTime: "",
      color: "text-red-500",
    };
  }

  const firstPeriodOpenMinutes = timeStringToMinutes(hours.open_time ?? "");

  // If current time is before first opening time
  if (currentMinutes < firstPeriodOpenMinutes) {
    return {
      isOpen: false,
      description: `مغلق . ويفتح ${formatTimeForDisplay(hours.open_time)}`,
      closeTime: "",
      color: "text-red-500",
    };
  }

  // Check first period
  if (hours.open_time && hours.close_time) {
    const openMinutes = timeStringToMinutes(hours.open_time);
    const closeMinutes = timeStringToMinutes(hours.close_time);

    if (isTimeWithinPeriod(currentMinutes, openMinutes, closeMinutes)) {
      return {
        isOpen: true,
        description: `مفتوح . ويغلق ${formatTimeForDisplay(hours.close_time)}`,
        closeTime: hours.close_time,
        color: "text-green-600",
      };
    }
  }

  // Check second period
  if (
    hours.is_second_period === 1 &&
    hours.second_open_time &&
    hours.second_close_time
  ) {
    const openMinutes = timeStringToMinutes(hours.second_open_time);
    const closeMinutes = timeStringToMinutes(hours.second_close_time);

    if (isTimeWithinPeriod(currentMinutes, openMinutes, closeMinutes)) {
      return {
        isOpen: true,
        description: `مفتوح . ويغلق ${formatTimeForDisplay(
          hours.second_close_time
        )}`,
        closeTime: hours.second_close_time,
        color: "text-green-600",
      };
    }
  }

  // If time is between first and second period
  if (
    hours.is_second_period === 1 &&
    hours.close_time &&
    hours.second_open_time
  ) {
    const firstCloseMinutes = timeStringToMinutes(hours.close_time);
    const secondOpenMinutes = timeStringToMinutes(hours.second_open_time);

    if (
      currentMinutes > firstCloseMinutes &&
      currentMinutes < secondOpenMinutes
    ) {
      return {
        isOpen: false,
        description: `مغلق . ويفتح ${formatTimeForDisplay(
          hours.second_open_time
        )}`,
        closeTime: "",
        color: "text-red-500",
      };
    }
  }

  return null;
};

// Get next opening time (EXACT Swift implementation)
const getNextOpeningTime = (
  currentDay: number,
  allHours: WorkingHour[]
): PlaceStatus => {
  let nextOpenTime = "";
  let daysUntilOpen = 0;

  for (let i = 1; i <= 7; i++) {
    const futureDayNumber = ((currentDay + i - 1) % 7) + 1;
    const futureDay = allHours.find((h) => h.day === futureDayNumber);

    if (
      futureDay &&
      !(futureDay.is_closed_bool ?? false) &&
      futureDay.is_closed !== "1"
    ) {
      if (futureDay.is_24h ?? false) {
        nextOpenTime = "00:00:00";
      } else {
        nextOpenTime = futureDay.open_time ?? "";
      }
      daysUntilOpen = i;
      break;
    }
  }

  let nextOpenDescription: string;
  if (daysUntilOpen === 1) {
    nextOpenDescription = ` غدًا ${formatTimeForDisplay(nextOpenTime)}`;
  } else {
    nextOpenDescription = ` بعد ${daysUntilOpen} أيام ${formatTimeForDisplay(
      nextOpenTime
    )}`;
  }

  return {
    isOpen: false,
    description: `مغلق . يفتح${nextOpenDescription}`,
    closeTime: "",
    color: "text-red-500",
  };
};

// Get simple working hours display for dropdown (EXACT Swift logic)
const getSimpleWorkingHoursDisplay = (
  hours: WorkingHour
): { isSecond: boolean; openTime: string; secondOpenTime: string } => {
  // CRITICAL: Check closed status FIRST before 24h check
  if (hours.is_closed_bool ?? (false || hours.is_closed === "1")) {
    return {
      isSecond: false,
      openTime: "مغلق طوال اليوم",
      secondOpenTime: "",
    };
  }

  // Then check 24h status
  if (hours.is_24h ?? true) {
    return {
      isSecond: false,
      openTime: "مفتوح طوال اليوم",
      secondOpenTime: "",
    };
  }

  let openTimeText = "";
  if (hours.open_time && hours.close_time) {
    // EXACT Swift format: close time first, then dash, then open time
    openTimeText = `${formatTimeForDisplay(
      hours.close_time
    )} - ${formatTimeForDisplay(hours.open_time)}`;
  }

  if (hours.is_second_period === 1) {
    let secondOpenTimeText = "";
    if (hours.second_open_time && hours.second_close_time) {
      // EXACT Swift format: close time first, then dash, then open time
      secondOpenTimeText = `${formatTimeForDisplay(
        hours.second_close_time
      )} - ${formatTimeForDisplay(hours.second_open_time)}`;
      return {
        isSecond: true,
        openTime: openTimeText,
        secondOpenTime: secondOpenTimeText,
      };
    }
  }

  return {
    isSecond: false,
    openTime: openTimeText,
    secondOpenTime: "",
  };
};

// Main working hours description function (matching Swift getWorkingHoursDescription)
const getWorkingHoursDescription = (
  hours: WorkingHour,
  allHours: WorkingHour[]
): PlaceStatus => {
  const currentTime = new Date();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  if (!hours.day) {
    return {
      isOpen: true,
      description: "في حاله التجهيز",
      closeTime: "",
      color: "text-gray-500",
    };
  }

  // Check extended hours from previous day
  const previousDay = hours.day === 1 ? 7 : hours.day - 1;
  const previousDayHours = allHours.find((h) => h.day === previousDay);

  if (previousDayHours) {
    const previousDayStatus = checkPreviousDayExtendedHours(
      hours,
      previousDayHours,
      currentMinutes
    );
    if (previousDayStatus) {
      return previousDayStatus;
    }
  }

  // Check current day hours
  const currentDayStatus = checkCurrentDayHours(hours, currentMinutes);
  if (currentDayStatus) {
    return currentDayStatus;
  }

  // If time is outside all periods, show next opening time
  return getNextOpeningTime(hours.day, allHours);
};

const WorkingHoursDisplay: React.FC<WorkingHoursDisplayProps> = ({
  restaurant,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Day names for display (Sunday to Saturday) - Index 0 = Sunday
  const dayNames = [
    "الأحد", // 0 = Sunday
    "الاثنين", // 1 = Monday
    "الثلاثاء", // 2 = Tuesday
    "الأربعاء", // 3 = Wednesday
    "الخميس", // 4 = Thursday
    "الجمعة", // 5 = Friday
    "السبت", // 6 = Saturday
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

  // Convert JS day to API day format
  // Based on your data: day 4 = Tuesday, day 5 = Wednesday are closed
  // JS: Sunday=0, Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6
  // API: Saturday=1, Sunday=2, Monday=3, Tuesday=4, Wednesday=5, Thursday=6, Friday=7
  const convertJSDayToAPIDay = (jsDay: number): number => {
    const mapping = [2, 3, 4, 5, 6, 7, 1]; // [Sunday->2, Monday->3, Tuesday->4, Wednesday->5, Thursday->6, Friday->7, Saturday->1]
    return mapping[jsDay];
  };

  // Get today's hours for status calculation
  const todayAPIDay = convertJSDayToAPIDay(today);
  const todayHours = workingHours.find((d) => d.day === todayAPIDay);

  // Use the Swift-matching logic to get current status
  const currentStatus = todayHours
    ? getWorkingHoursDescription(todayHours, workingHours)
    : {
        isOpen: false,
        description: "مغلق",
        closeTime: "",
        color: "text-red-500",
      };

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
                currentStatus.isOpen ? "bg-green-400" : "bg-red-400"
              }`}
            >
              <Clock className="h-3 w-3 text-white" />
            </div>
            <div className="flex-1">
              <span className={`font-medium text-sm ${currentStatus.color}`}>
                {currentStatus.description}
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
                const isToday = index === today;

                let displayText = "مغلق";
                let textColor = "text-gray-500";

                if (dayData) {
                  const simpleDisplay = getSimpleWorkingHoursDisplay(dayData);
                  if (simpleDisplay.isSecond && simpleDisplay.secondOpenTime) {
                    displayText = `${simpleDisplay.openTime} • ${simpleDisplay.secondOpenTime}`;
                    textColor = "text-gray-700";
                  } else if (simpleDisplay.openTime) {
                    displayText = simpleDisplay.openTime;
                    textColor = simpleDisplay.openTime.includes("مفتوح")
                      ? "text-green-600"
                      : simpleDisplay.openTime.includes("مغلق")
                      ? "text-red-500"
                      : "text-gray-700";
                  }
                }

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
                    <span className={`text-sm ${textColor}`}>
                      {displayText}
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
