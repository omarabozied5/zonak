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

// Status calculation helper
const getWorkingHourStatus = (dayData: WorkingHour | undefined) => {
  if (!dayData) return { text: "غير محدد", color: "text-gray-500" };

  // Priority 1: Explicitly closed for the day
  if (dayData.is_closed === "1" || dayData.is_closed_bool === true) {
    return { text: "مغلق", color: "text-red-500" };
  }

  // Priority 2: 24-hour operation
  if (dayData.is_24h) {
    return { text: "مفتوح 24 ساعة", color: "text-green-600" };
  }

  // Priority 3: Currently closed but has operating hours
  if (dayData.is_closed_now && dayData.open_time && dayData.close_time) {
    return {
      text: `مغلق حالياً (${formatTime(dayData.open_time)} - ${formatTime(
        dayData.close_time
      )})`,
      color: "text-amber-600",
    };
  }

  // Priority 4: Regular hours
  if (dayData.open_time && dayData.close_time) {
    return {
      text: `${formatTime(dayData.open_time)} - ${formatTime(
        dayData.close_time
      )}`,
      color: "text-green-600",
    };
  }

  return { text: "غير محدد", color: "text-gray-500" };
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
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const estimatedDropdownHeight = Math.min(400, dayNames.length * 48 + 120);
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenUpward =
      spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow;

    const dropdownWidth = Math.min(
      Math.max(rect.width, 320),
      viewportWidth - 32
    );

    let leftPosition = rect.left + scrollLeft;
    if (leftPosition + dropdownWidth > viewportWidth) {
      leftPosition = viewportWidth - dropdownWidth - 16;
    }
    if (leftPosition < 16) {
      leftPosition = 16;
    }

    const topPosition = shouldOpenUpward
      ? rect.top + scrollTop - estimatedDropdownHeight
      : rect.bottom + scrollTop + 8;

    setDropdownPosition({
      top: topPosition,
      left: leftPosition,
      width: dropdownWidth,
      openUpward: shouldOpenUpward,
    });
  };

  // Event handlers
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

    const handleScrollOrResize = () => {
      if (isOpen) updateDropdownPosition();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      updateDropdownPosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const handleToggleDropdown = () => {
    if (!isOpen) updateDropdownPosition();
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggleDropdown();
    }
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Get today's hours and status
  const todayHours = workingHours.find((d) => d.day === today);
  const todayStatus = getWorkingHourStatus(todayHours);

  return (
    <div className="relative">
      {/* Main display trigger */}
      <div
        ref={triggerRef}
        className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 select-none shadow-sm"
        onClick={handleToggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="عرض مواعيد العمل الأسبوعية"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#FFAA01] to-[#ff9500] rounded-lg flex items-center justify-center">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span
              className={`font-medium text-sm ${todayStatus.color} block truncate`}
            >
              {todayStatus.text}
            </span>
            <span className="text-xs text-gray-500 block truncate">
              اضغط لعرض جميع الأيام
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-2">
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500 transition-transform duration-200" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" />
          )}
        </div>
      </div>

      {/* Dropdown portal */}
      {isOpen &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown content */}
            <div
              ref={dropdownRef}
              className={`absolute bg-white rounded-2xl shadow-2xl border border-gray-200 z-[999] overflow-hidden transition-all duration-300 ${
                dropdownPosition.openUpward
                  ? "animate-in slide-in-from-bottom-2 fade-in-0"
                  : "animate-in slide-in-from-top-2 fade-in-0"
              }`}
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                maxHeight: "min(400px, 70vh)",
                overflowY: "auto",
              }}
              role="dialog"
              aria-labelledby="working-hours-title"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#053468] to-[#0a4d8c] p-4">
                <h4
                  id="working-hours-title"
                  className="font-bold text-white text-center text-base"
                >
                  مواعيد العمل الأسبوعية
                </h4>
              </div>

              {/* Days list */}
              <div className="p-4 space-y-2">
                {dayNames.map((dayName, index) => {
                  const dayData = workingHours.find((d) => d.day === index);
                  const dayStatus = getWorkingHourStatus(dayData);
                  const isToday = index === today;

                  return (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-3 rounded-xl transition-all duration-200 ${
                        isToday
                          ? "bg-gradient-to-r from-[#FFAA01]/10 to-[#ff9500]/10 border-2 border-[#FFAA01]/30"
                          : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isToday && (
                          <div className="w-2 h-2 bg-[#FFAA01] rounded-full animate-pulse" />
                        )}
                        <span
                          className={`font-medium text-sm ${
                            isToday
                              ? "text-[#053468] font-bold"
                              : "text-gray-700"
                          }`}
                        >
                          {dayName}
                        </span>
                        {isToday && (
                          <span className="text-xs bg-[#FFAA01] text-white px-2 py-1 rounded-full font-medium">
                            اليوم
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${dayStatus.color} text-right`}
                      >
                        {dayStatus.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 p-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-gray-500 hover:text-[#053468] transition-colors duration-200 py-2 rounded-lg hover:bg-gray-50 font-medium"
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
