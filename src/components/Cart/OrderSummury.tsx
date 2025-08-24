import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OrderSummaryProps {
  totalItems: number;
  totalPrice: number;
  restaurantCount: number;
  hasMultipleRestaurants: boolean;
  totalItemDiscounts?: number;
  originalTotalPrice?: number;
  onProceedToCheckout: () => void;
  isCheckoutDisabled: boolean;
  isEmpty?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  totalItems,
  totalPrice,
  restaurantCount,
  totalItemDiscounts = 0,
  originalTotalPrice = 0,
  hasMultipleRestaurants,
  onProceedToCheckout,
  isCheckoutDisabled,
  isEmpty = false,
}) => {
  return (
    <div className="px-4 pb-4">
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="p-4">
          {/* Order Summary Header */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ملخص الطلب
          </h3>

          {/* Order Details */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">عدد الأصناف</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">المطاعم</span>
              <span className="font-medium">{restaurantCount}</span>
            </div>

            {totalItemDiscounts > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">السعر الأصلي</span>
                  <span className="text-gray-500">
                    {originalTotalPrice.toFixed(2)} ر.س
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-black-600">إجمالي الخصومات</span>
                  <span className="text-black-600">
                    -{totalItemDiscounts.toFixed(2)} ر.س
                  </span>
                </div>
              </>
            )}

            {/* Delivery Fee */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">رسوم التوصيل</span>
              <span className="font-medium">15.00 ر.س</span>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">المجموع الكلي</span>
                <span className="text-gray-900">
                  {(totalPrice + 15).toFixed(2)} ر.س
                </span>
              </div>
            </div>
          </div>

          {/* Warning for multiple restaurants */}
          {hasMultipleRestaurants && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-600 font-medium text-center">
                ⚠️ لا يمكن الطلب من أكثر من مطعم في نفس الوقت
              </p>
            </div>
          )}

          {/* Empty cart message */}
          {isEmpty && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-600 font-medium text-center">
                السلة فارغة - أضف أصناف للمتابعة
              </p>
            </div>
          )}

          {/* Checkout Button */}
          <Button
            className="w-full bg-[#FBD252] hover:bg-[#F5C842] text-white font-semibold text-base py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onProceedToCheckout}
            disabled={isCheckoutDisabled}
            aria-label="المتابعة للدفع"
          >
            تأكيد الطلب
          </Button>

          {/* Order Type */}
          <div className="bg-[#FBD252]/10 rounded-lg p-3 text-center border border-[#FBD252]/20 mt-3">
            <p className="text-xs text-gray-600 mb-1">🏪 نوع الطلب</p>
            <p className="font-semibold text-gray-900 text-sm">
              استلام من المطعم
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSummary;
