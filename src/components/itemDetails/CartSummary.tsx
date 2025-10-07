import React from "react";
import { ShoppingBag } from "lucide-react";

interface CartSummaryProps {
  totalPrice?: number;
  itemCount?: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  totalPrice = 0,
  itemCount = 0,
}) => {
  return (
    <div className="flex items-center justify-between bg-white shadow-md rounded-full px-3 sm:px-4 py-1.5 sm:py-2 w-fit">
      <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
      <div className="flex flex-col text-right mr-1.5 sm:mr-2">
        <span className="text-xs sm:text-sm font-bold text-gray-900">
          {totalPrice.toFixed(2)} ر.س
        </span>
        <span className="text-[10px] sm:text-xs text-gray-500">
          {itemCount} منتجات
        </span>
      </div>
    </div>
  );
};

export default CartSummary;
