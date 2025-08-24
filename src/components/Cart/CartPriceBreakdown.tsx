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
    <div className="bg-white rounded-lg p-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">قيمة السلة</span>
        <span className="text-gray-900">
          {hasDiscounts ? originalTotal.toFixed(2) : totalPrice.toFixed(2)} ر.س
        </span>
      </div>

      {hasDiscounts && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">الخصم</span>
          <span className="text-green-600">
            -{totalItemDiscounts.toFixed(2)} ر.س
          </span>
        </div>
      )}

      <div className="border-t pt-3 flex justify-between">
        <span className="text-gray-600">
          إجمالي السلة{" "}
          <span className="text-xs text-gray-400">({itemCount} عناصر)</span>
        </span>
        <span className="text-lg font-bold text-gray-900">
          {totalPrice.toFixed(2)} ر.س
        </span>
      </div>

      <div className="text-xs text-gray-400 text-right">
        جميع الأسعار تشمل ضريبة القيمة المضافة 15%
      </div>
    </div>
  );
};

export default CartPriceBreakdown;
