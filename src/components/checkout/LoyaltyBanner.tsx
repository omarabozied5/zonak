import React from "react";

interface LoyaltyBannerProps {
  totalSavings: number;
  cashbackAmount?: number;
}

const LoyaltyBanner: React.FC<LoyaltyBannerProps> = ({
  totalSavings,
  cashbackAmount = 15,
}) => {
  if (totalSavings <= 0) return null;

  return (
    <div className="  p-3 flex items-center gap-3 font-light ">
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
        <img src="Vector.png" />
      </div>
      <div className="flex-1 text-[#575757] text-xs ">
        <span>وفّرت </span>
        <span className="font-extrabold text-black">
          {totalSavings.toFixed(2)} ر.س
        </span>
        <span> مع عروضنا + ستحصل على </span>
        <span className="font-bold">{cashbackAmount}</span>
        <span> ر.س كاش باك بعد استلام الطلب</span>
      </div>
    </div>
  );
};

export default LoyaltyBanner;
