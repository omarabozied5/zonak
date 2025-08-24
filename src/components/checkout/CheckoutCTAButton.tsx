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
    <div className="bottom-0 left-0 right-0 max-w-sm mx-auto z-50">
      <div className="w-full h-[100px] bg-white shadow-none flex items-center justify-center">
        <button
          className="w-[353px] h-[56px] bg-[#fbd252] rounded-[10px] mx-[20px] mt-[22px] flex items-center justify-between px-[44px] disabled:opacity-70 hover:bg-[#f9c52b] transition-colors"
          onClick={onSubmit}
          disabled={isProcessing}
        >
          <span className="font-medium text-[16px] leading-[20px] text-white">
            {total.toFixed(2)} ر.س
          </span>
          <span className="font-medium text-[16px] leading-[20px] text-white">
            {isProcessing ? "جاري المعالجة..." : "تنفيذ الطلب"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default CheckoutCTAButton;
