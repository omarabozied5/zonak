import React from "react";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantityCartSectionProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  basePrice: number;
  optionsPrice: number;
  totalPrice: number;
  isEditMode: boolean;
  canAddToCartFinal: boolean;
  isItemActive: boolean;
  canAddToCart: () => boolean;
  handleAddToCart: () => void;
  isAuthenticated: boolean;
}

const QuantityCartSection: React.FC<QuantityCartSectionProps> = ({
  quantity,
  setQuantity,
  basePrice,
  optionsPrice,
  totalPrice,
  isEditMode,
  canAddToCartFinal,
  isItemActive,
  canAddToCart,
  handleAddToCart,
  isAuthenticated,
}) => {
  return (
    <div className="space-y-4">
      {/* Cart Summary Section */}
      <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalPrice.toFixed(2)} ر.س</div>
          <div className="text-xs text-gray-500">{quantity} منتجات</div>
        </div>
        <ShoppingBag className="h-8 w-8 text-gray-400" />
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2">
        {/* Options Price */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">+ {optionsPrice.toFixed(2)} ر.س</span>
          <span className="text-gray-900 font-medium">سعر الإضافات</span>
        </div>
        
        {/* Product Price */}
        <div className="flex items-center justify-between text-lg font-semibold border-t border-gray-200 pt-2">
          <span className="text-[#E49B0F]">{totalPrice.toFixed(2)} ر.س</span>
          <span className="text-gray-900">سعر المنتج</span>
        </div>
      </div>

      {/* Quantity Controls and Add to Cart */}
      <div className="flex items-center gap-4">
        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCartFinal}
          className="flex-1 bg-[#E49B0F] hover:bg-[#D4910E] text-white font-bold py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base"
        >
          {isEditMode ? "تحديث العنصر" : "أضف إلى السلة"}
        </Button>

        {/* Quantity Controls */}
        <div className="flex items-center bg-gray-100 rounded-2xl p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuantity(quantity + 1)}
            className="h-10 w-10 p-0 rounded-xl bg-transparent hover:bg-gray-200 text-gray-700"
          >
            <Plus className="h-5 w-5" />
          </Button>
          
          <span className="text-xl font-bold min-w-[3rem] text-center text-gray-900 px-2">
            {quantity}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="h-10 w-10 p-0 rounded-xl bg-transparent hover:bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            <Minus className="h-5 w-5" />
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
      
      {isAuthenticated && isItemActive && !canAddToCart() && (
        <p className="text-red-500 text-center text-sm">
          يجب اختيار جميع الخيارات المطلوبة
        </p>
      )}
    </div>
  );
};

export default QuantityCartSection;