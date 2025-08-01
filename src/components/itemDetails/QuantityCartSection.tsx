import React from "react";
import { Plus, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuantityCartSectionProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  totalPrice: number;
  isEditMode: boolean;
  canAddToCartFinal: boolean;
  isItemActive: boolean;
  canAddToCart: () => boolean;
  handleAddToCart: () => void;
}

const QuantityCartSection: React.FC<QuantityCartSectionProps> = ({
  quantity,
  setQuantity,
  totalPrice,
  isEditMode,
  canAddToCartFinal,
  isItemActive,
  canAddToCart,
  handleAddToCart,
}) => {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-[#FFAA01]/5 to-[#053468]/5 sticky bottom-4 sm:static">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Quantity Selector */}
        <div className="flex items-center justify-between">
          <span className="text-base sm:text-lg font-semibold text-[#053468]">
            الكمية
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 sm:h-10 sm:w-10 p-0 border-[#FFAA01] text-[#053468] hover:bg-[#FFAA01]/10 rounded-full"
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <span className="text-lg sm:text-xl font-bold min-w-[2rem] text-center text-[#053468]">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8 sm:h-10 sm:w-10 p-0 border-[#FFAA01] text-[#053468] hover:bg-[#FFAA01]/10 rounded-full"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Total Price */}
        <div className="flex items-center justify-between py-2 border-t border-gray-200">
          <span className="text-base sm:text-lg font-semibold text-[#053468]">
            المجموع
          </span>
          <span className="text-xl sm:text-2xl font-bold text-[#FFAA01]">
            {totalPrice.toFixed(2)} ر.س
          </span>
        </div>

        {/* Add to Cart / Update Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCartFinal}
          className="w-full bg-[#FFAA01] hover:bg-yellow-500 text-[#053468] font-bold py-2.5 sm:py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
        >
          {isEditMode ? "تحديث العنصر" : "إضافة إلى السلة"}
        </Button>

        {/* Error Messages */}
        {!isItemActive && (
          <p className="text-red-500 text-center text-xs sm:text-sm">
            هذا العنصر غير متوفر حالياً
          </p>
        )}
        {!canAddToCart() && isItemActive && (
          <p className="text-red-500 text-center text-xs sm:text-sm">
            يجب اختيار جميع الخيارات المطلوبة
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default QuantityCartSection;
