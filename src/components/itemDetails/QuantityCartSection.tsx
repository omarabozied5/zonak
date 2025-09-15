import React from "react";
import { Button } from "@/components/ui/button";
import CartSummary from "./CartSummary";

interface QuantityCartSectionProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  optionsPrice: number;
  totalPrice: number;
  itemsCount: number;
  isEditMode: boolean;
  canAddToCartFinal: boolean;
  isItemActive: boolean;
  handleAddToCart: () => void;
  isAuthenticated: boolean;
}

const QuantityCartSection: React.FC<QuantityCartSectionProps> = ({
  quantity,
  setQuantity,
  optionsPrice,
  totalPrice,
  itemsCount,
  isEditMode,
  canAddToCartFinal,
  isItemActive,
  handleAddToCart,
  isAuthenticated,
}) => {
  return (
    <>
      {" "}
      <div className="flex justify-end ">
        <CartSummary totalPrice={totalPrice} itemCount={itemsCount} />
      </div>
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="space-y-4">
          {/* Cart Summary */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">سعر الإضافات</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-900">
                {optionsPrice.toFixed(2)} ر.س
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              سعر المنتج
            </span>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">
                {totalPrice.toFixed(2)} ر.س
              </div>
              <div className="text-xs text-gray-600">{itemsCount} منتجات</div>
            </div>
          </div>

          {/* Add to Cart Button and Quantity */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCartFinal}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base h-14"
            >
              {isEditMode ? "تحديث العنصر" : "أضف إلى السلة"}
            </Button>

            <div className="flex items-center bg-gray-100 rounded-full h-14">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(quantity - 1)}
                disabled={quantity <= 1}
                className="h-12 w-12 p-0 rounded-full bg-transparent hover:bg-gray-200 text-gray-700 disabled:opacity-50"
              >
                <span className="text-lg">−</span>
              </Button>

              <div className="text-lg font-bold min-w-[2.5rem] text-center text-gray-900 px-2">
                {quantity}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="h-12 w-12 p-0 rounded-full bg-transparent hover:bg-gray-200 text-gray-700"
              >
                <span className="text-lg">+</span>
              </Button>
            </div>
          </div>

          {/* Error Messages */}
          {!isAuthenticated && (
            <p className="text-red-500 text-center text-sm">
              يجب تسجيل الدخول أولاً
            </p>
          )}

          {isAuthenticated && !isItemActive && (
            <p className="text-red-500 text-center text-sm">
              هذا العنصر غير متوفر حالياً
            </p>
          )}

          {isAuthenticated && isItemActive && !canAddToCartFinal && (
            <p className="text-red-500 text-center text-sm">
              يجب اختيار جميع الخيارات المطلوبة
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default QuantityCartSection;
