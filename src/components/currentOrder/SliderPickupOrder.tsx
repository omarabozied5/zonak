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
  const activeColor = statusIndex === -1 ? "#ff3d1f" : "#fbd252";
  const inactiveColor = "#d9d9d9";

  return (
    <div className={`w-full ${className}`} dir="rtl">
      {/* Progress circles and connecting lines */}
      <div className="relative w-full">
        {/* Background line */}
        <div className="absolute top-[14px] right-[14px] left-[14px] h-px bg-[#d9d9d9]" />
        
        {/* Active progress line segments */}
        {statusIndex >= 1 && (
          <div 
            className="absolute top-[14px] h-px bg-[#fbd252]"
            style={{
              right: '118px',
              width: statusIndex === 1 ? '0px' : 
                     statusIndex === 2 ? '104px' :
                     statusIndex === 3 ? '208px' : '312px'
            }}
          />
        )}

        {/* Step circles */}
        <div className="flex justify-between items-center relative px-[14px]">
          {/* Step 1: تأكيد المتجر */}
          <div className="relative">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border-2"
              style={{
                backgroundColor: statusIndex === -1 || statusIndex >= 1 ? activeColor : "white",
                borderColor: statusIndex === -1 || statusIndex >= 1 ? activeColor : inactiveColor,
              }}
            >
              <img 
                src="/true.png" 
                alt="check" 
                className="w-4 h-4" 
                style={{
                  filter: statusIndex === -1 || statusIndex >= 1 ? "none" : "grayscale(100%)",
                }}
              />
            </div>
          </div>

          {/* Step 2: تجهيز */}
          <div className="relative">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border-2"
              style={{
                backgroundColor: statusIndex >= 2 ? activeColor : "white",
                borderColor: statusIndex >= 2 ? activeColor : inactiveColor,
              }}
            >
              <img 
                src="/prepare.png" 
                alt="prepare" 
                className="w-4 h-4" 
                style={{
                  filter: statusIndex >= 2 ? "none" : "grayscale(100%)",
                }}
              />
            </div>
          </div>

          {/* Step 3: جاهز */}
          <div className="relative">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border-2"
              style={{
                backgroundColor: statusIndex >= 3 ? activeColor : "white",
                borderColor: statusIndex >= 3 ? activeColor : inactiveColor,
              }}
            >
              <img 
                src="/ready.png" 
                alt="ready" 
                className="w-4 h-4" 
                style={{
                  filter: statusIndex >= 3 ? "none" : "grayscale(100%)",
                }}
              />
            </div>
          </div>

          {/* Step 4: تم الإستلام */}
          <div className="relative">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border-2"
              style={{
                backgroundColor: statusIndex >= 4 ? activeColor : "white",
                borderColor: statusIndex >= 4 ? activeColor : inactiveColor,
              }}
            >
              <img 
                src="/done.png" 
                alt="done" 
                className="w-4 h-4" 
                style={{
                  filter: statusIndex >= 4 ? "none" : "grayscale(100%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status labels */}
      <div className="flex justify-between items-center mt-2 px-1">
        <div className="flex-1 text-center">
          <span
            className="text-[10px] font-medium leading-[15.732px] font-['Bahij_TheSansArabic']"
            style={{
              color: statusIndex === -1 || statusIndex >= 1 ? activeColor : inactiveColor,
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
            className="text-[10px] font-medium leading-[15.732px] font-['Bahij_TheSansArabic']"
            style={{
              color: statusIndex >= 2 ? activeColor : inactiveColor,
            }}
          >
            {data[1]}
          </span>
        </div>

        <div className="flex-1 text-center">
          <span
            className="text-[10px] font-medium leading-[15.732px] font-['Bahij_TheSansArabic']"
            style={{
              color: statusIndex >= 3 ? activeColor : inactiveColor,
            }}
          >
            {data[2]}
          </span>
        </div>

        <div className="flex-1 text-center">
          <span
            className="text-[10px] font-medium leading-[15.732px] font-['Bahij_TheSansArabic']"
            style={{
              color: statusIndex >= 4 ? activeColor : inactiveColor,
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