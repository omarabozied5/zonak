import React from "react";
import { Order } from "../../hooks/useOrderStore";
import { STATUS_CONFIG } from "./orderConstants";
import { getEstimatedTime } from "../../lib/orderUtils";

interface OrderStatusProps {
  order: Order;
}

const OrderStatus: React.FC<OrderStatusProps> = ({ order }) => {
  const statusInfo = STATUS_CONFIG[order.status] || {
    description: "",
  };
  const estimatedTime = getEstimatedTime(order);

  return (
    <div className="bg-[#FFAA01]/10 rounded-lg p-3 sm:p-4 mb-4">
      <p className="text-[#FFAA01] font-medium text-center text-sm sm:text-base">
        {statusInfo.description}
      </p>
      {estimatedTime &&
        (order.status === "preparing" || order.status === "confirmed") && (
          <p className="text-xs sm:text-sm text-gray-600 text-center mt-1">
            الوقت المتوقع للاستلام: {estimatedTime}
          </p>
        )}
      {order.remaining_time > 0 && order.status === "preparing" && (
        <p className="text-xs sm:text-sm text-gray-600 text-center mt-1">
          الوقت المتبقي: {order.remaining_time} دقيقة
        </p>
      )}
    </div>
  );
};

export default OrderStatus;
