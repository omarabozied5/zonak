import React from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderSummaryProps {
  totalItems: number;
  totalPrice: number;
  restaurantCount: number;
  hasMultipleRestaurants: boolean;
  onProceedToCheckout: () => void;
  isCheckoutDisabled: boolean;
  isEmpty?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  totalItems,
  totalPrice,
  restaurantCount,
  hasMultipleRestaurants,
  onProceedToCheckout,
  isCheckoutDisabled,
  isEmpty = false,
}) => {
  return (
    <Card className="border-[#FFAA01]/20 lg:sticky lg:top-24 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#FFAA01]/10 to-[#FFD700]/10 rounded-t-lg">
        <CardTitle className="text-lg sm:text-xl text-[#053468] flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          ملخص الطلب
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Order Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>عدد الأصناف</span>
            <span className="font-semibold">{totalItems}</span>
          </div>
          <div className="flex justify-between">
            <span>المطاعم</span>
            <span className="font-semibold">{restaurantCount}</span>
          </div>
        </div>

        {/* Warning for multiple restaurants */}
        {hasMultipleRestaurants && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-xs text-red-600 font-medium">
              ⚠️ لا يمكن الطلب من أكثر من مطعم في نفس الوقت
            </p>
          </div>
        )}

        {/* Empty cart message */}
        {isEmpty && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 font-medium">
              السلة فارغة - أضف أصناف للمتابعة
            </p>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span className="text-[#053468]">المجموع الكلي</span>
            <span className="text-[#FFAA01]">{totalPrice.toFixed(2)} ر.س</span>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-[#FFAA01] to-[#FFD700] hover:from-[#FF9900] hover:to-[#FFAA01] text-[#053468] font-semibold text-base sm:text-lg py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onProceedToCheckout}
          disabled={isCheckoutDisabled}
          aria-label="المتابعة للدفع"
        >
          متابعة للدفع
        </Button>

        <div className="bg-[#FFAA01]/10 rounded-lg p-4 text-center border border-[#FFAA01]/20">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">📍 نوع الطلب</p>
          <p className="font-semibold text-[#FFAA01] text-sm sm:text-base">
            استلام من المطعم
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
