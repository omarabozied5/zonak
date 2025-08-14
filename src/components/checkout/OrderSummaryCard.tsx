import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartItem } from "../../types/types";
import OrderItem from "./OrderItem";
import PriceBreakdown from "./PriceBreakdown";
import EstimatedTime from "./EstimatedTime";
import { ValidatedCoupon } from "../../lib/couponUtils";

interface OrderSummaryCardProps {
  items: CartItem[];
  totalPrice: number;
  discountAmount: number;
  totalItemDiscounts?: number;
  originalTotalPrice?: number;
  total: number;
  handleSubmitOrder: () => void;
  isProcessing: boolean;
  paymentType?: number;
  appliedCoupon: ValidatedCoupon | null;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = React.memo(
  ({
    items,
    totalPrice,
    appliedCoupon,
    discountAmount,
    total,
    totalItemDiscounts = 0,
    originalTotalPrice = 0,
    handleSubmitOrder,
    isProcessing,
    paymentType = 1,
  }) => {
    const getButtonText = () => {
      if (isProcessing) {
        return "جاري معالجة الطلب...";
      }

      if (paymentType === 0) {
        return `ادفع الآن - ${total.toFixed(2)} ر.س`;
      } else {
        return `تأكيد الطلب - ${total.toFixed(2)} ر.س`;
      }
    };

    return (
      <Card className="border-[#FFAA01]/20 lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle className="text-lg">ملخص الطلب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items List */}
          <div className="space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
            {items.map((item) => (
              <OrderItem key={item.id} item={item} />
            ))}
          </div>

          {/* Enhanced Price Breakdown with Item Discounts */}
          <PriceBreakdown
            totalPrice={totalPrice}
            appliedCoupon={appliedCoupon}
            discountAmount={discountAmount}
            total={total}
            totalItemDiscounts={totalItemDiscounts}
            originalTotalPrice={originalTotalPrice}
          />

          <EstimatedTime />

          {/* Confirm Button */}
          <Button
            className="w-full bg-gradient-to-r from-[#FFAA01] to-[#FFAA01]/90 hover:from-[#FFAA01]/90 hover:to-[#FFAA01]/80 text-white text-base sm:text-lg py-3 rounded-xl hover:shadow-lg transition-all duration-300"
            onClick={handleSubmitOrder}
            disabled={isProcessing}
          >
            {getButtonText()}
          </Button>
        </CardContent>
      </Card>
    );
  }
);

OrderSummaryCard.displayName = "OrderSummaryCard";

export default OrderSummaryCard;
