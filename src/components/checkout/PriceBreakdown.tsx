import React from "react";
import { ValidatedCoupon } from "../../lib/couponUtils";

interface PriceBreakdownProps {
  totalPrice: number;
  totalItemDiscounts: number;
  couponDiscountAmount: number;
  total: number;
  itemCount: number;
}

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  totalPrice,
  totalItemDiscounts,
  couponDiscountAmount,
  total,
  itemCount,
}) => {
  const hasAnyDiscount = totalItemDiscounts > 0 || couponDiscountAmount > 0;

  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
      <div className="flex justify-between text-xs sm:text-sm">
        <span className="text-gray-600">قيمة السلة</span>
        <span className="text-gray-900 font-medium">
          {totalPrice.toFixed(2)} ر.س
        </span>
      </div>

      {hasAnyDiscount && (
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600">الخصم</span>
          <span className="text-green-600 font-medium">
            -{(totalItemDiscounts + couponDiscountAmount).toFixed(2)} ر.س
          </span>
        </div>
      )}

      <div className="border-t pt-2 sm:pt-3 flex justify-between">
        <span className="text-sm sm:text-base text-gray-600">
          إجمالي الطلب{" "}
          <span className="text-xs text-gray-400">({itemCount} عناصر)</span>
        </span>
        <span className="text-base sm:text-lg font-bold text-gray-900">
          {total.toFixed(2)} ر.س
        </span>
      </div>
    </div>
  );
};

export default PriceBreakdown;
