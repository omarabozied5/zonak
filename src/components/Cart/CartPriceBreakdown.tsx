import React from "react";

interface CartPriceBreakdownProps {
  totalPrice: number;
  totalItemDiscounts: number;
  itemCount: number;
}

const CartPriceBreakdown: React.FC<CartPriceBreakdownProps> = ({
  totalPrice,
  totalItemDiscounts,
  itemCount,
}) => {
  const originalTotal = totalPrice + totalItemDiscounts;
  const hasDiscounts = totalItemDiscounts > 0;

  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 space-y-3 shadow-sm border border-gray-100">
      {/* Cart Value */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">قيمة السلة</span>
        <span className="text-gray-900 font-medium">
          {hasDiscounts ? originalTotal.toFixed(2) : totalPrice.toFixed(2)} ر.س
        </span>
      </div>

      {/* Discount - only show if there are discounts */}
      {hasDiscounts && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">الخصم</span>
          <span className="text-gray-600 font-medium">
            -{totalItemDiscounts.toFixed(2)} ر.س
          </span>
        </div>
      )}

      {/* Total with border separator */}
      <div className="border-t pt-3 flex justify-between items-center">
        <span className="text-gray-900 font-medium text-base">
          إجمالي السلة{" "}
          <span className="text-xs sm:text-sm text-gray-500 font-normal">
            ({itemCount} عنصر{itemCount > 1 ? "" : ""})
          </span>
        </span>
        <span className="text-lg sm:text-xl font-bold text-gray-900">
          {totalPrice.toFixed(2)} ر.س
        </span>
      </div>

      {/* VAT Notice - responsive text size */}
    </div>
  );
};

export default CartPriceBreakdown;
