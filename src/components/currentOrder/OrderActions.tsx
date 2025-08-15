import React from "react";
import { Order } from "../../hooks/useOrderStore";
import { getOrderType } from "../../lib/orderUtils";

interface OrderActionsProps {
  order: Order;
}

const OrderActions: React.FC<OrderActionsProps> = ({ order }) => {
  const orderType = getOrderType(order);

  // Only show action message if it's NOT preparing status (countdown handles that)
  if (order.status === "preparing") {
    return null;
  }

  const renderStatusMessage = () => {
    switch (order.status) {
      case "pending":
        return (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 text-center w-full">
            <p className="text-orange-800 font-medium text-sm sm:text-base">
              طلبك في انتظار الموافقة من المطعم
            </p>
          </div>
        );

      case "confirmed":
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center w-full">
            <p className="text-blue-800 font-medium text-sm sm:text-base">
              تم تأكيد طلبك وسيتم البدء في التحضير قريباً
            </p>
          </div>
        );

      case "ready":
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-center w-full">
            <p className="text-green-800 font-medium text-sm sm:text-base">
              {orderType === "pickup"
                ? "طلبك جاهز للاستلام من المطعم"
                : "طلبك جاهز للتوصيل"}
            </p>
          </div>
        );

      case "on_the_way":
      case "waiting_customer":
        return (
          <div
            className="border rounded-lg p-3 sm:p-4 text-center w-full"
            style={{ backgroundColor: "#053468", borderColor: "#053468" }}
          >
            <p className="text-white font-medium text-sm sm:text-base">
              {order.status === "on_the_way"
                ? "طلبك في الطريق إليك الآن"
                : "المندوب وصل ويتنظرك"}
            </p>
          </div>
        );

      case "delivered":
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-center w-full">
            <p className="text-green-800 font-medium text-sm sm:text-base">
              تم توصيل طلبك بنجاح. شكراً لك!
            </p>
          </div>
        );

      case "rejected":
      case "timeout":
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 text-center w-full">
            <p className="text-red-800 font-medium text-sm sm:text-base">
              {order.status === "rejected"
                ? "تم رفض طلبك من المطعم"
                : "انتهت مهلة معالجة الطلب"}
            </p>
            {order.rejection_type && (
              <p className="text-red-600 text-xs mt-1">
                السبب: {order.rejection_type}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const statusMessage = renderStatusMessage();
  if (!statusMessage) return null;

  return <div className="flex justify-center mt-6">{statusMessage}</div>;
};

export default OrderActions;
