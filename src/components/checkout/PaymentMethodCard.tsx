import React, { useState } from "react";

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
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded flex items-center justify-center">
            <img src="cash-logo.png" alt="Visa" />
          </div>
          <span className="text-sm font-medium text-gray-900">
            الدفع عند الاستلام
          </span>
          {/* <div className="text-sm font-medium">{total.toFixed(2)} ر.س</div> */}
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-5 rounded flex items-center justify-center">
            <img src="visa-logo.png" alt="Visa" />
          </div>
          <span className="text-sm font-medium text-gray-900">
            الدفع أونلاين
          </span>
        </div>
      );
    }
  };

  return (
    <div className="relative">
      <h2 className="text-sm font-bold text-gray-900 mb-4 text-right">
        طريقة الدفع
      </h2>

      {/* Selected Payment Method */}
      <div className="bg-white rounded-lg p-4 border-2 border-yellow-400">
        <div className="flex items-center justify-between">
          {getSelectedPaymentContent()}
          <button
            className="text-xs text-gray-500 cursor-pointer hover:text-gray-700"
            onClick={toggleDropdown}
          >
            تغيير
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Cash on Delivery Option */}
          <div
            className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
              paymentType === 1 ? "bg-yellow-50" : ""
            }`}
            onClick={() => selectPaymentMethod(1)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-5 rounded flex items-center justify-center">
                <img src="cash-logo.png" alt="Visa" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                الدفع عند الاستلام
              </span>
              {/* <div className="text-sm font-medium">{total.toFixed(2)} ر.س</div> */}
            </div>
          </div>

          {/* Online Payment Option */}
          <div
            className={`p-4 cursor-pointer transition-all hover:bg-gray-50 border-t border-gray-100 ${
              paymentType === 0 ? "bg-yellow-50" : ""
            }`}
            onClick={() => selectPaymentMethod(0)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-5 rounded flex items-center justify-center">
                <img src="visa-logo.png" alt="Visa" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                الدفع أونلاين
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodCard;
