import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface PaymentMethodCardProps {
  paymentType: number;
  setPaymentType: (type: number) => void;
  total: number;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentType,
  setPaymentType,
  total,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    right: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      if (isDropdownOpen) {
        updateDropdownPosition();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleScroll, true);
      document.body.style.overflow = "hidden";
      updateDropdownPosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
      document.body.style.overflow = "unset";
    };
  }, [isDropdownOpen]);

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const padding = 16;

      setDropdownPosition({
        top: rect.bottom + 4,
        left: Math.max(padding, rect.left),
        right: Math.max(padding, viewportWidth - rect.right),
      });
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectPaymentMethod = (type: number) => {
    console.log("Selecting payment method:", type);
    console.log("setPaymentType function:", typeof setPaymentType);
    setPaymentType(type);
    setIsDropdownOpen(false);
  };

  const getSelectedPaymentContent = () => {
    console.log("Current paymentType:", paymentType);
    if (paymentType === 0) {
      return (
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-4 sm:w-8 sm:h-5  flex items-center justify-center">
            <img
              src="visa-logo.png"
              alt="Visa"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-900">
            الدفع أونلاين
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center">
            <img
              src="cash-logo.png"
              alt="Cash"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-900">
            الدفع عند الاستلام
          </span>
        </div>
      );
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <h2 className="text-sm sm:text-base font-bold text-gray-900 text-right">
        طريقة الدفع
      </h2>

      {/* Selected Payment Method - removed padding */}
      <div
        ref={buttonRef}
        className="bg-white px-2 py-1 rounded-sm border-2 border-yellow-400 relative z-10"
      >
        <div className="flex items-center justify-between">
          {getSelectedPaymentContent()}
          <button
            className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 px-2 py-1 rounded transition-colors"
            onClick={toggleDropdown}
          >
            تغيير
          </button>
        </div>
      </div>

      {/* Simple dropdown without portal for testing */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          {/* Online Payment Option */}
          <button
            className={`w-full text-left transition-all hover:bg-gray-50 ${
              paymentType === 0 ? "bg-yellow-50" : ""
            }`}
            onClick={() => {
              console.log("Online button clicked!");
              selectPaymentMethod(0);
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-4 sm:w-8 sm:h-5 rounded flex items-center justify-center">
                <img
                  src="visa-logo.png"
                  alt="Visa"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-900">
                الدفع أونلاين
              </span>
            </div>
          </button>

          {/* Cash on Delivery Option */}
          <button
            className={`w-full text-left transition-all hover:bg-gray-50 border-t border-gray-100 ${
              paymentType === 1 ? "bg-yellow-50" : ""
            }`}
            onClick={() => {
              console.log("Cash button clicked!");
              selectPaymentMethod(1);
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center">
                <img
                  src="cash-logo.png"
                  alt="Cash"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-900">
                الدفع عند الاستلام
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodCard;
