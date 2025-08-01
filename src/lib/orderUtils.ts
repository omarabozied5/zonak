import { Order } from "../hooks/useOrderStore";

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (timeString: string | null) => {
  if (!timeString) return "";
  return new Date(timeString).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getTotalItems = (order: Order) => {
  return order.orderitems.reduce((sum, item) => sum + item.quantity, 0);
};

export const getOrderType = (order: Order) => {
  return order.is_delivery === 1 ? "delivery" : "pickup";
};

export const getEstimatedTime = (order: Order) => {
  if (order.time_to_ready) return formatTime(order.time_to_ready);
  if (order.remaining_time > 0) {
    const estimatedTime = new Date();
    estimatedTime.setMinutes(estimatedTime.getMinutes() + order.remaining_time);
    return estimatedTime.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return "";
};
