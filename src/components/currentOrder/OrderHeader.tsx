import React from "react";
import { Clock, MapPin, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { Order } from "../../hooks/useOrderStore";
import { STATUS_CONFIG } from "./orderConstants";
import { formatDate, getTotalItems, getOrderType } from "../../lib/orderUtils";

interface OrderHeaderProps {
  order: Order;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ order }) => {
  const statusInfo = STATUS_CONFIG[order.status] || {
    label: order.status,
    icon: Clock,
    color: "bg-gray-100 text-gray-800 border border-gray-200",
    description: "",
  };
  const StatusIcon = statusInfo.icon;
  const totalItems = getTotalItems(order);
  const orderType = getOrderType(order);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <CardTitle className="text-lg sm:text-xl text-gray-900 flex items-center gap-2 mb-3">
          <StatusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#FFAA01] flex-shrink-0" />
          <span className="truncate">طلب رقم: {order.id}</span>
        </CardTitle>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              {formatDate(order.created_at)}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{orderType === "pickup" ? "استلام" : "توصيل"}</span>
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-4 w-4 flex-shrink-0" />
            <span>{totalItems} صنف</span>
          </span>
        </div>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
        <Badge
          className={statusInfo.color}
          style={
            statusInfo.bgColor ? { backgroundColor: statusInfo.bgColor } : {}
          }
        >
          {statusInfo.label}
        </Badge>
        <p className="text-lg sm:text-xl font-bold text-[#FFAA01]">
          {order.total_price.toFixed(2)} ر.س
        </p>
      </div>
    </div>
  );
};

export default OrderHeader;
