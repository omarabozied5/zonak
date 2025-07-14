import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Restaurant, WorkingHour } from "../types/types";

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

interface WorkingHoursDisplayProps {
  restaurant: Restaurant;
}

const WorkingHoursDisplay: React.FC<WorkingHoursDisplayProps> = ({
  restaurant,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Calculate optimal dropdown position
  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Estimate dropdown height (approximate)
      const estimatedDropdownHeight = Math.min(350, dayNames.length * 40 + 120);

      // Check if there's enough space below
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Determine if we should open upward
      const shouldOpenUpward =
        spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow;

      // Calculate width (minimum 280px, but respect viewport width)
      const dropdownWidth = Math.min(
        Math.max(rect.width, 280),
        viewportWidth - 32
      );

      // Calculate left position to ensure dropdown stays within viewport
      let leftPosition = rect.left + scrollLeft;
      if (leftPosition + dropdownWidth > viewportWidth) {
        leftPosition = viewportWidth - dropdownWidth - 16;
      }
      if (leftPosition < 16) {
        leftPosition = 16;
      }

      // Calculate top position
      let topPosition;
      if (shouldOpenUpward) {
        topPosition = rect.top + scrollTop - estimatedDropdownHeight;
      } else {
        topPosition = rect.bottom + scrollTop + 4;
      }

      setDropdownPosition({
        top: topPosition,
        left: leftPosition,
        width: dropdownWidth,
        openUpward: shouldOpenUpward,
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
      updateDropdownPosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const handleToggleDropdown = () => {
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  // Get today's hours for the main display
  const todayHours = workingHours.find((d) => d.day === today);

  // Working hours display logic
  const workingHoursDisplay = todayHours
    ? todayHours.is_closed_now || todayHours.is_closed === "1"
      ? "مغلق اليوم"
      : todayHours.is_24h
      ? "مفتوح 24 ساعة"
      : `${formatTime(todayHours.open_time)} - ${formatTime(
          todayHours.close_time
        )}`
    : "غير محدد";

  // Get status for a specific day
  const getDayStatus = (dayData: WorkingHour | undefined): string => {
    if (!dayData) return "غير محدد";

    const isClosed = dayData.is_closed_now || dayData.is_closed === "1";
    const is24h = dayData.is_24h;

    if (isClosed) return "مغلق";
    if (is24h) return "مفتوح 24 ساعة";
    return `${formatTime(dayData.open_time)} - ${formatTime(
      dayData.close_time
    )}`;
  };

  // Get status color for a day
  const getStatusColor = (dayData: WorkingHour | undefined): string => {
    if (!dayData) return "text-gray-500";
    const isClosed = dayData.is_closed_now || dayData.is_closed === "1";
    if (isClosed) return "text-red-500";
    return "text-green-600";
  };

  // Get status for main display
  const getMainStatusColor = (): string => {
    if (!todayHours) return "text-gray-500";
    const isClosed = todayHours.is_closed_now || todayHours.is_closed === "1";
    if (isClosed) return "text-red-500";
    return "text-green-600";
  };

  return (
    <div className="relative">
      {/* Main display - compact and clean */}
      <div
        ref={triggerRef}
        className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 select-none"
        onClick={handleToggleDropdown}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span
              className={`font-medium text-sm ${getMainStatusColor()} block truncate`}
            >
              {workingHoursDisplay}
            </span>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0 transition-transform duration-200" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 transition-transform duration-200" />
        )}
      </div>

      {/* Dropdown menu - Using Portal for better positioning */}
      {isOpen &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[998] bg-black/10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown content */}
            <div
              ref={dropdownRef}
              className={`absolute bg-white rounded-lg shadow-xl border border-gray-200 z-[999] overflow-hidden transition-all duration-200 ${
                dropdownPosition.openUpward
                  ? "animate-in slide-in-from-bottom-2"
                  : "animate-in slide-in-from-top-2"
              }`}
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                maxHeight: "min(350px, 60vh)",
                overflowY: "auto",
              }}
            >
              <div className="p-4">
                <h4 className="font-semibold text-[#1a1a1a] text-sm mb-3 text-center border-b border-gray-100 pb-2">
                  مواعيد العمل الأسبوعية
                </h4>
                <div className="space-y-2">
                  {dayNames.map((dayName, index) => {
                    const dayData = workingHours.find((d) => d.day === index);
                    const isToday = index === today;

                    return (
                      <div
                        key={index}
                        className={`flex justify-between items-center p-2 rounded-md transition-colors duration-200 ${
                          isToday
                            ? "bg-orange-50 border border-orange-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`font-medium text-sm ${
                            isToday
                              ? "text-[#1a1a1a] font-bold"
                              : "text-gray-700"
                          }`}
                        >
                          {dayName}
                          {isToday && (
                            <span className="text-orange-600 mr-1 text-xs">
                              (اليوم)
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-sm font-medium ${getStatusColor(
                            dayData
                          )}`}
                        >
                          {getDayStatus(dayData)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Close button */}
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-gray-500 hover:text-orange-600 transition-colors duration-200 py-1 rounded hover:bg-gray-50"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};

export default WorkingHoursDisplay;
