import React from "react";

interface CartCTAButtonProps {
  total: number;
  isDisabled: boolean;
  onProceedToCheckout: () => void;
}

const CartCTAButton: React.FC<CartCTAButtonProps> = ({
  total,
  isDisabled,
  onProceedToCheckout,
}) => {
  return (
    <div className="w-full bg-white border-t border-gray-100 shadow-lg">
      <div className="p-4 safe-area-inset-bottom">
        <button
          className="w-full h-12 sm:h-14 bg-[#fbd252] rounded-lg flex items-center justify-between px-4 sm:px-6 disabled:opacity-70 hover:bg-[#f9c52b] transition-colors disabled:hover:bg-[#fbd252]"
          onClick={onProceedToCheckout}
          disabled={isDisabled}
        >
          <span className="font-medium text-sm sm:text-base text-white">
            متابعة للدفع
          </span>
          <span className="font-medium text-sm sm:text-base text-white">
            {total.toFixed(2)} ر.س
          </span>
        </button>
      </div>
    </div>
  );
};

export default CartCTAButton;
