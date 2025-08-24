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
    <div className="bottom-0 left-0 right-0 max-w-sm mx-auto z-50">
      <div className="w-full h-[100px] bg-white shadow-none flex items-center justify-center">
        <button
          className="w-[353px] h-[56px] bg-[#fbd252] rounded-[10px] mx-[20px] mt-[22px] flex items-center justify-between px-[44px] disabled:opacity-70 hover:bg-[#f9c52b] transition-colors"
          onClick={onProceedToCheckout}
          disabled={isDisabled}
        >
          <span className="font-medium text-[16px] leading-[20px] text-white">
            {total.toFixed(2)} ر.س
          </span>
          <span className="font-medium text-[16px] leading-[20px] text-white">
            متابعة للدفع
          </span>
        </button>
      </div>
    </div>
  );
};

export default CartCTAButton;
