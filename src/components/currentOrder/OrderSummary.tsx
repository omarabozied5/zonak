import React from "react";
import { CreditCard } from "lucide-react";
import { Order } from "../../hooks/useOrderStore";
import { PAYMENT_STATUS_MAP } from "./orderConstants";
import { getTotalItems, getOrderType } from "../../lib/orderUtils";

interface OrderSummaryProps {
  order: Order;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  const totalItems = getTotalItems(order);
  const orderType = getOrderType(order);
  const paymentStatus =
    PAYMENT_STATUS_MAP[order.status_payment] || order.status_payment;

  return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-[#FFAA01]">
      <h4 className="font-semibold text-[#053468] mb-3 flex items-center gap-2">
        <CreditCard className="h-4 w-4 flex-shrink-0 text-[#FFAA01]" />
        <span>تفاصيل الطلب</span>
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
          <span className="text-gray-600">نوع الطلب:</span>
          <span className="font-medium">
            {orderType === "pickup" ? "استلام من المطعم" : "توصيل للمنزل"}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
          <span className="text-gray-600">طريقة الدفع:</span>
          <span className="font-medium">{paymentStatus}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
          <span className="text-gray-600">عدد الأصناف:</span>
          <span className="font-medium">{totalItems}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
          <span className="text-gray-600">المطعم:</span>
          <span className="font-medium">{order.place.title}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
