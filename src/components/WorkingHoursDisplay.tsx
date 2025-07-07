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
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const dayNames = [
    "الأحد", // Sunday
    "الاثنين", // Monday
    "الثلاثاء", // Tuesday
    "الأربعاء", // Wednesday
    "الخميس", // Thursday
    "الجمعة", // Friday
    "السبت", // Saturday
  ];

  const today = new Date().getDay(); // 0 = Sunday
  const workingHours = restaurant?.working_hours || [];

  // Update dropdown position when opening
  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      setDropdownPosition({
        top: rect.top + scrollTop - 10, // 10px gap above trigger
        left: rect.left + scrollLeft,
        width: rect.width,
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleTouchOutside = (event: TouchEvent) => {
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
      document.addEventListener("touchstart", handleTouchOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
      updateDropdownPosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleTouchOutside);
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

  // Fixed logic for working hours display
  const workingHoursDisplay = todayHours
    ? // Check if closed first - prioritize is_closed_now over is_closed string
      todayHours.is_closed_now || todayHours.is_closed === "1"
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

    // Fixed logic - check is_closed_now first, then is_closed string
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

    // Fixed logic - check is_closed_now first, then is_closed string
    const isClosed = dayData.is_closed_now || dayData.is_closed === "1";
    if (isClosed) return "text-red-600";
    return "text-green-600";
  };

  // Debug: Log the current state (remove this in production)
  console.log("=== DEBUG WORKING HOURS ===");
  console.log("Today's day number:", today); // 0=Sunday, 1=Monday, etc.
  console.log("Full restaurant object:", restaurant);
  console.log("restaurant.place:", restaurant.place);
  console.log("restaurant.place?.working_hours:", restaurant?.working_hours);
  console.log("Working hours array length:", workingHours.length);
  console.log("Working hours array:", workingHours);
  console.log("Today's hours found:", todayHours);
  console.log("Final display:", workingHoursDisplay);
  console.log("========================");

  return (
    <div className="relative">
      {/* Main display - clickable */}
      <div
        ref={triggerRef}
        className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 select-none"
        onClick={handleToggleDropdown}
      >
        <div className="flex items-center justify-center space-x-1 space-x-reverse">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
          <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
            {workingHoursDisplay}
          </span>
          {isOpen ? (
            <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1 transition-transform duration-200" />
          ) : (
            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1 transition-transform duration-200" />
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1">مواعيد العمل</p>
      </div>

      {/* Dropdown menu - Using Portal to render outside card */}
      {isOpen &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[998]"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown content */}
            <div
              ref={dropdownRef}
              className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 z-[999] overflow-hidden animate-in slide-in-from-bottom-2 duration-200"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                transform: "translateY(-100%)",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                maxHeight: "320px",
                overflowY: "auto",
              }}
            >
              <div className="p-3">
                <h4 className="font-semibold text-[#053468] text-sm mb-3 text-center border-b border-gray-100 pb-2">
                  مواعيد العمل الأسبوعية
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dayNames.map((dayName, index) => {
                    const dayData = workingHours.find((d) => d.day === index);
                    const isToday = index === today;

                    return (
                      <div
                        key={index}
                        className={`flex justify-between items-center p-2 rounded-md transition-colors duration-200 ${
                          isToday
                            ? "bg-[#FFAA01]/10 border border-[#FFAA01]/30"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`font-medium text-xs sm:text-sm ${
                            isToday
                              ? "text-[#053468] font-bold"
                              : "text-gray-700"
                          }`}
                        >
                          {dayName}
                          {isToday && (
                            <span className="text-[#FFAA01] mr-1 text-xs">
                              (اليوم)
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-medium ${getStatusColor(
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
                  className="w-full text-center text-xs text-gray-500 hover:text-[#FFAA01] transition-colors duration-200 py-1 rounded hover:bg-gray-50"
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
