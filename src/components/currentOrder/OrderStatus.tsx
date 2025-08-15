import React from "react";
import { Order } from "../../hooks/useOrderStore";
import { STATUS_CONFIG } from "./orderConstants";

interface OrderStatusProps {
  order: Order;
}

const OrderStatus: React.FC<OrderStatusProps> = ({ order }) => {
  const statusInfo = STATUS_CONFIG[order.status] || {
    description: "حالة غير معروفة",
  };

  // For preparing status, let CountdownTimer handle everything
  if (order.status === "preparing") {
    return null; // CountdownTimer will show the appropriate message
  }

  return (
    <div className="bg-[#FFAA01]/10 rounded-lg p-3 sm:p-4 mb-4">
      <p className="text-[#FFAA01] font-medium text-center text-sm sm:text-base">
        {statusInfo.description}
      </p>
    </div>
  );
};

export default OrderStatus;
