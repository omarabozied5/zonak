import React from "react";

interface SliderPickupOrderProps {
  status: string;
  className?: string;
}

const SliderPickupOrder: React.FC<SliderPickupOrderProps> = ({
  status = "",
  className = "",
}) => {
  const data = ["تأكيد المتجر", "تجهيز", "جاهز", "تم الإستلام"];

  const getStatusIndex = (status: string): number => {
    switch (status) {
      case "rejected":
      case "timeout":
        return -1;
      case "pending":
        return 0;
      case "confirmed":
        return 1;
      case "preparing":
        return 2;
      case "ready":
        return 3;
      case "delivered":
        return 4;
      default:
        return -1;
    }
  };

  const statusIndex = getStatusIndex(status);

  // Colors based on design
  const activeColor =
    statusIndex === -1
      ? "#ff3d1f" // Red for cancelled/rejected
      : "#fbd252"; // Yellow for normal states from design

  const inactiveColor = "#d9d9d9";

  return (
    <div className={`w-full ${className}`}>
      {/* Progress circles and connecting lines */}
      <div className="relative flex items-center justify-between px-4 mb-2">
        {/* Step 1: تأكيد المتجر */}
        <div className="relative flex items-center">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center relative z-10"
            style={{
              backgroundColor:
                statusIndex === -1 || statusIndex >= 1
                  ? activeColor
                  : inactiveColor,
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  statusIndex === -1 || statusIndex >= 1 ? "white" : "#999",
              }}
            />
          </div>
        </div>

        {/* Step 2: تجهيز */}
        <div className="relative flex items-center">
          <div
            className="absolute right-7 w-16 sm:w-20 md:w-24 h-px"
            style={{
              backgroundColor: statusIndex >= 2 ? activeColor : inactiveColor,
            }}
          />
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center relative z-10"
            style={{
              backgroundColor: statusIndex >= 2 ? activeColor : inactiveColor,
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: statusIndex >= 2 ? "white" : "#999",
              }}
            />
          </div>
        </div>

        {/* Step 3: جاهز */}
        <div className="relative flex items-center">
          <div
            className="absolute right-7 w-16 sm:w-20 md:w-24 h-px"
            style={{
              backgroundColor: statusIndex >= 3 ? activeColor : inactiveColor,
            }}
          />
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center relative z-10"
            style={{
              backgroundColor: statusIndex >= 3 ? activeColor : inactiveColor,
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: statusIndex >= 3 ? "white" : "#999",
              }}
            />
          </div>
        </div>

        {/* Step 4: تم الإستلام */}
        <div className="relative flex items-center">
          <div
            className="absolute right-7 w-16 sm:w-20 md:w-24 h-px"
            style={{
              backgroundColor: statusIndex >= 4 ? activeColor : inactiveColor,
            }}
          />
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center relative z-10"
            style={{
              backgroundColor: statusIndex >= 4 ? activeColor : inactiveColor,
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: statusIndex >= 4 ? "white" : "#999",
              }}
            />
          </div>
        </div>
      </div>

      {/* Status labels */}
      <div className="flex items-center justify-between px-1">
        <div className="flex-1 text-center">
          <span
            className="text-xs font-medium leading-4"
            style={{
              color:
                statusIndex === -1 || statusIndex >= 1
                  ? activeColor
                  : inactiveColor,
              fontFamily: "Bahij TheSansArabic, -apple-system, sans-serif",
            }}
          >
            {statusIndex === -1
              ? status === "timeout"
                ? "لم يتم الاستلام"
                : "رفض المتجر"
              : data[0]}
          </span>
        </div>

        <div className="flex-1 text-center">
          <span
            className="text-xs font-medium leading-4"
            style={{
              color: statusIndex >= 2 ? activeColor : inactiveColor,
              fontFamily: "Bahij TheSansArabic, -apple-system, sans-serif",
            }}
          >
            {data[1]}
          </span>
        </div>

        <div className="flex-1 text-center">
          <span
            className="text-xs font-medium leading-4"
            style={{
              color: statusIndex >= 3 ? activeColor : inactiveColor,
              fontFamily: "Bahij TheSansArabic, -apple-system, sans-serif",
            }}
          >
            {data[2]}
          </span>
        </div>

        <div className="flex-1 text-center">
          <span
            className="text-xs font-medium leading-4"
            style={{
              color: statusIndex >= 4 ? activeColor : inactiveColor,
              fontFamily: "Bahij TheSansArabic, -apple-system, sans-serif",
            }}
          >
            {data[3]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SliderPickupOrder;
