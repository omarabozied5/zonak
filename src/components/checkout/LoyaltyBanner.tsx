import React, { useMemo } from "react";

interface CashbackData {
  id: number;
  discount: number;
  max_daily_cashback: number | null;
}

interface LoyaltyBannerProps {
  totalSavings: number;
  orderTotal: number;
  // Cart order response data from API
  cashbackBranch?: number;
  cashbackData?: CashbackData | null;
  maxCashbackPerOrder?: number | null;
  totalCashbackReceivedToday?: number;
}

const LoyaltyBanner: React.FC<LoyaltyBannerProps> = ({
  totalSavings,
  orderTotal,
  cashbackBranch,
  cashbackData,
  maxCashbackPerOrder,
  totalCashbackReceivedToday = 0,
}) => {
  const calculatedCashback = useMemo(() => {
    if (orderTotal <= 0 || !cashbackBranch) return 0;

    // Base cashback calculation (branch pickup)
    const baseCashback = orderTotal * (cashbackBranch / 100.0);

    // If no cashback data or daily limit, return base cashback capped by max per order
    if (!cashbackData?.max_daily_cashback) {
      return maxCashbackPerOrder !== null
        ? Math.min(baseCashback, maxCashbackPerOrder)
        : baseCashback;
    }

    // Calculate remaining daily cashback allowance
    const remainingDailyCashback = Math.max(
      0,
      cashbackData.max_daily_cashback - totalCashbackReceivedToday
    );

    // Apply daily limit first
    let finalCashback = Math.min(baseCashback, remainingDailyCashback);

    // Then apply per-order limit if it exists
    if (maxCashbackPerOrder !== null) {
      finalCashback = Math.min(finalCashback, maxCashbackPerOrder);
    }

    // Round to 2 decimal places
    return Math.round(finalCashback * 100) / 100;
  }, [
    orderTotal,
    cashbackBranch,
    cashbackData,
    maxCashbackPerOrder,
    totalCashbackReceivedToday,
  ]);

  // Don't show banner if no savings and no meaningful cashback
  if (totalSavings <= 0 && calculatedCashback < 0.01) return null;

  return (
    <div className="p-3 flex items-center gap-3 font-light">
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
        <img src="Vector.png" alt="Cashback" />
      </div>
      <div className="flex-1 text-[#575757] text-xs">
        {totalSavings > 0 && (
          <>
            <span>وفّرت </span>
            <span className="font-extrabold text-black">
              {totalSavings.toFixed(2)} ر.س
            </span>
            <span> مع عروضنا</span>
            {calculatedCashback > 0 && <span> + </span>}
          </>
        )}
        {calculatedCashback > 0 && (
          <>
            <span>ستحصل على </span>
            <span className="font-bold text-black">
              {calculatedCashback.toFixed(2)}
            </span>
            <span> ر.س كاش باك بعد استلام الطلب</span>
          </>
        )}
      </div>
    </div>
  );
};

export default LoyaltyBanner;
