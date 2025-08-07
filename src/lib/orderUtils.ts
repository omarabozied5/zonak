import { Order } from "../hooks/useOrderStore";

// Format date in world format (not Islamic)
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  // Use Gregorian calendar with English locale
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh", // Assuming Saudi Arabia timezone
  });
};

// Calculate total items in order
export const getTotalItems = (order: Order): number => {
  return (
    order.orderitems?.reduce((total, item) => total + item.quantity, 0) || 0
  );
};

// Determine order type (pickup or delivery)
export const getOrderType = (order: Order): "pickup" | "delivery" => {
  // Check if delivery cost exists or if it's explicitly a delivery order
  return order.delivery_cost > 0 || order.car_delivery_cost > 0
    ? "delivery"
    : "pickup";
};

// Get estimated time for order completion
export const getEstimatedTime = (order: Order): string | null => {
  // Try time_to_ready first, then fall back to estimated_time
  const timeToUse = order.time_to_ready || order.estimated_time;

  if (!timeToUse) return null;

  const estimatedDate = new Date(timeToUse);
  return estimatedDate.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh",
  });
};

// Calculate remaining time as a countdown timer
export const calculateRemainingTime = (
  order: Order
): {
  minutes: number;
  seconds: number;
  isExpired: boolean;
} => {
  // Check if we have time_to_ready (ISO string) or remaining_time (minutes)
  let targetCompletionTime: Date;

  if (order.time_to_ready) {
    // If time_to_ready is provided, use it directly
    targetCompletionTime = new Date(order.time_to_ready);
  } else if (order.remaining_time > 0) {
    // If remaining_time is provided, calculate from current time
    const now = new Date();
    targetCompletionTime = new Date(
      now.getTime() + order.remaining_time * 60 * 1000
    );
  } else {
    // No valid time data available
    return { minutes: 0, seconds: 0, isExpired: true };
  }

  // Get current time
  const now = new Date();

  // Calculate difference in milliseconds
  const timeDifference = targetCompletionTime.getTime() - now.getTime();

  if (timeDifference <= 0) {
    return { minutes: 0, seconds: 0, isExpired: true };
  }

  // Convert to minutes and seconds
  const totalSeconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return { minutes, seconds, isExpired: false };
};

// Format countdown timer display
export const formatCountdownTime = (
  minutes: number,
  seconds: number
): string => {
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
};

// Check if order should show timer
export const shouldShowTimer = (order: Order): boolean => {
  return (
    (order.status === "preparing" || order.status === "confirmed") &&
    (order.time_to_ready || order.remaining_time > 0)
  );
};

// Get timer display text
export const getTimerDisplayText = (order: Order): string => {
  const timeData = calculateRemainingTime(order);

  if (timeData.isExpired) {
    return "جاهز للاستلام";
  }

  return `الوقت المتبقي: ${formatCountdownTime(
    timeData.minutes,
    timeData.seconds
  )}`;
};
