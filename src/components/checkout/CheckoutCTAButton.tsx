import React from "react";

interface CheckoutCTAButtonProps {
  total: number;
  isProcessing: boolean;
  onSubmit: () => void;
}

const CheckoutCTAButton: React.FC<CheckoutCTAButtonProps> = ({
  total,
  isProcessing,
  onSubmit,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9990] pointer-events-none">
      {/* Safe area for modern devices */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto pointer-events-auto">
        {/* Background container with proper spacing */}
        <div className="w-full bg-white shadow-2xl border-t border-gray-200 safe-area-inset-bottom">
          {/* Inner container with responsive padding */}
          <div className="flex items-center justify-center px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            {/* Button with responsive sizing */}
            <button
              className={`
                w-full max-w-sm h-12 sm:h-14 md:h-16 
                bg-[#fbd252] rounded-lg 
                flex items-center justify-between 
                px-4 sm:px-6 md:px-8
                transition-all duration-200 ease-in-out
                ${
                  isProcessing
                    ? "opacity-70 cursor-not-allowed scale-[0.98]"
                    : "hover:bg-[#f9c52b] hover:shadow-lg active:scale-[0.97]"
                }
                focus:outline-none focus:ring-2 focus:ring-[#fbd252] focus:ring-opacity-50
                disabled:transform-none
              `}
              onClick={onSubmit}
              disabled={isProcessing}
            >
              {/* Price display */}

              {/* Action text */}
              <span className="font-semibold text-sm sm:text-base md:text-lg text-white truncate">
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">جاري المعالجة...</span>
                    <span className="sm:hidden">معالجة...</span>
                  </div>
                ) : (
                  <>
                    <span className="hidden sm:inline">تنفيذ الطلب</span>
                    <span className="sm:hidden">طلب</span>
                  </>
                )}
              </span>
              <span className="font-semibold text-sm sm:text-base md:text-lg text-white truncate">
                {total.toFixed(2)} ر.س
              </span>
            </button>
          </div>

          {/* Safe area padding for devices with home indicator */}
          <div className="h-0 sm:h-1 md:h-2"></div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCTAButton;
