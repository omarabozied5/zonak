import React from "react";
import { Coupon } from "../../types/types";

interface PriceBreakdownProps {
  totalPrice: number;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  total: number;
  totalItemDiscounts?: number;
}

const PriceBreakdown: React.FC<PriceBreakdownProps> = React.memo(
  ({
    totalPrice,
    appliedCoupon,
    discountAmount,
    total,
    totalItemDiscounts = 0,
  }) => (
    <div className="border-t border-[#FFAA01]/20 pt-4 space-y-2">
      <div className="flex justify-between text-gray-600 text-sm">
        <span>المجموع الفرعي</span>
        <span>{totalPrice.toFixed(2)} ر.س</span>
      </div>

      {totalItemDiscounts > 0 && (
        <div className="flex justify-between text-green-600 text-sm">
          <span>خصم الأصناف</span>
          <span>-{totalItemDiscounts.toFixed(2)} ر.س</span>
        </div>
      )}

      {appliedCoupon && (
        <div className="flex justify-between text-green-600 text-sm">
          <span>الخصم ({appliedCoupon.code})</span>
          <span>-{discountAmount.toFixed(2)} ر.س</span>
        </div>
      )}

      <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t border-[#FFAA01]/20">
        <span>المجموع الكلي</span>
        <span className="text-[#FFAA01]">{total.toFixed(2)} ر.س</span>
      </div>
    </div>
  )
);

PriceBreakdown.displayName = "PriceBreakdown";

export default PriceBreakdown;
