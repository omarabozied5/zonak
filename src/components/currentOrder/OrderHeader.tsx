import React from "react";
import { Clock, MapPin, Package } from "lucide-react";

// Order interface (simplified for this component)
interface Order {
  id: number;
  status: string;
  created_at: string;
  cart_price: number;
  delivery_cost: number;
  car_delivery_cost: number;
  total_vat: number | null;
  discount: number;
  zonak_discount: number;
  discount_from_coupons: number;
  total_price: number; // Backend calculated total
  orderitems: Array<{
    quantity: number;
  }>;
}

interface OrderHeaderProps {
  order: Order;
}

// Status configuration
const STATUS_CONFIG: Record<string, any> = {
  pending: {
    label: "في الانتظار",
    icon: Clock,
    color: "bg-orange-100 text-orange-800 border border-orange-200",
  },
  confirmed: {
    label: "مؤكد",
    icon: Clock,
    color: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  preparing: {
    label: "قيد التحضير",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  },
  ready: {
    label: "جاهز للاستلام",
    icon: Clock,
    color: "bg-green-100 text-green-800 border border-green-200",
  },
  on_the_way: {
    label: "في الطريق إليك",
    icon: Clock,
    color: "text-white border border-[#053468]",
    bgColor: "#053468",
  },
  waiting_customer: {
    label: "في انتظار العميل",
    icon: Clock,
    color: "bg-purple-100 text-purple-800 border border-purple-200",
  },
  delivered: {
    label: "تم التوصيل",
    icon: Clock,
    color: "bg-green-100 text-green-800 border border-green-200",
  },
  rejected: {
    label: "مرفوض",
    icon: Clock,
    color: "bg-red-100 text-red-800 border border-red-200",
  },
  timeout: {
    label: "انتهت المهلة",
    icon: Clock,
    color: "bg-gray-100 text-gray-800 border border-gray-200",
  },
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh",
  });
};

// Calculate total items
const getTotalItems = (order: Order): number => {
  return (
    order.orderitems?.reduce((total, item) => total + item.quantity, 0) || 0
  );
};

// Determine order type
const getOrderType = (order: Order): "pickup" | "delivery" => {
  return order.delivery_cost > 0 || order.car_delivery_cost > 0
    ? "delivery"
    : "pickup";
};

const OrderHeader: React.FC<OrderHeaderProps> = ({ order }) => {
  const statusInfo = STATUS_CONFIG[order.status] || {
    label: order.status,
    icon: Clock,
    color: "bg-gray-100 text-gray-800 border border-gray-200",
  };

  const StatusIcon = statusInfo.icon;
  const totalItems = getTotalItems(order);
  const orderType = getOrderType(order);

  // Calculate the correct total (same logic as OrderPricing component)
  const calculateCorrectTotal = (): number => {
    let total = order.cart_price;

    // Add costs
    total += order.delivery_cost || 0;
    total += order.car_delivery_cost || 0;
    total += order.total_vat || 0;

    // Subtract discounts
    total -= order.discount || 0;
    total -= order.zonak_discount || 0;
    total -= order.discount_from_coupons || 0;

    return Math.max(0, total);
  };

  const calculatedTotal = calculateCorrectTotal();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-lg sm:text-xl text-gray-900 flex items-center gap-2 mb-3 font-semibold">
          <StatusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#FFAA01] flex-shrink-0" />
          <span className="truncate">طلب رقم: {order.id}</span>
        </div>

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
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
          style={
            statusInfo.bgColor ? { backgroundColor: statusInfo.bgColor } : {}
          }
        >
          {statusInfo.label}
        </div>
        <p className="text-lg sm:text-xl font-bold text-[#FFAA01]">
          {calculatedTotal.toFixed(2)} ر.س
        </p>
      </div>
    </div>
  );
};

export default OrderHeader;
