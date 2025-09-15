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
      // Prevent body scroll when dropdown is open
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
      const padding = 16; // 1rem padding on sides

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
    setPaymentType(type);
    setIsDropdownOpen(false);
  };

  const getSelectedPaymentContent = () => {
    if (paymentType === 1) {
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
    } else {
      return (
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
      );
    }
  };

  const DropdownPortal = () => {
    if (!isDropdownOpen) return null;

    return createPortal(
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-[99999]"
          onClick={() => setIsDropdownOpen(false)}
        />

        {/* Dropdown Menu */}
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl z-[100000] max-h-[40vh] overflow-y-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            right: `${dropdownPosition.right}px`,
            maxWidth: "400px",
            minWidth: "280px",
          }}
        >
          {/* Cash on Delivery Option */}
          <div
            className={`p-3 sm:p-4 cursor-pointer transition-all hover:bg-gray-50 ${
              paymentType === 1 ? "bg-yellow-50" : ""
            }`}
            onClick={() => selectPaymentMethod(1)}
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
          </div>

          {/* Online Payment Option */}
          <div
            className={`p-3 sm:p-4 cursor-pointer transition-all hover:bg-gray-50 border-t border-gray-100 ${
              paymentType === 0 ? "bg-yellow-50" : ""
            }`}
            onClick={() => selectPaymentMethod(0)}
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
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4 text-right">
        طريقة الدفع
      </h2>

      {/* Selected Payment Method */}
      <div
        ref={buttonRef}
        className="bg-white rounded-lg p-3 sm:p-4 border-2 border-yellow-400 relative z-10"
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

      {/* Portal-rendered dropdown */}
      <DropdownPortal />
    </div>
  );
};

export default PaymentMethodCard;
