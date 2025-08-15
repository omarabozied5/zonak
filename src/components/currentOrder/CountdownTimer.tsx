import React, { useState, useEffect } from "react";
import { Clock, ChefHat } from "lucide-react";

// Order interface (simplified for this component)
interface Order {
  id: number;
  status: string;
  remaining_time: number;
  time_to_ready: string | number | null;
  preparing_at: string | null;
}

interface CountdownTimerProps {
  order: Order;
  className?: string;
}

// Calculate remaining time from branch worker's time
const calculateRemainingTime = (
  order: Order
): {
  minutes: number;
  seconds: number;
  isExpired: boolean;
  hasValidTime: boolean;
} => {
  // Only calculate if we're in preparing status
  if (order.status !== "preparing") {
    return { minutes: 0, seconds: 0, isExpired: false, hasValidTime: false };
  }

  let targetCompletionTime: Date;
  const now = new Date();

  // Case 1: time_to_ready is a specific timestamp (ISO string)
  if (
    typeof order.time_to_ready === "string" &&
    order.time_to_ready.includes("T")
  ) {
    targetCompletionTime = new Date(order.time_to_ready);
  }
  // Case 2: time_to_ready is minutes from preparing_at time
  else if (order.time_to_ready && order.preparing_at) {
    const preparingTime = new Date(order.preparing_at);
    const minutesToAdd =
      typeof order.time_to_ready === "string"
        ? parseInt(order.time_to_ready)
        : order.time_to_ready;
    targetCompletionTime = new Date(
      preparingTime.getTime() + minutesToAdd * 60 * 1000
    );
  }
  // Case 3: time_to_ready is minutes from now (fallback)
  else if (order.time_to_ready) {
    const minutesToAdd =
      typeof order.time_to_ready === "string"
        ? parseInt(order.time_to_ready)
        : order.time_to_ready;
    targetCompletionTime = new Date(now.getTime() + minutesToAdd * 60 * 1000);
  }
  // Case 4: Use remaining_time if available
  else if (order.remaining_time > 0) {
    targetCompletionTime = new Date(
      now.getTime() + order.remaining_time * 60 * 1000
    );
  }
  // Case 5: No time set by branch worker yet
  else {
    return { minutes: 0, seconds: 0, isExpired: false, hasValidTime: false };
  }

  const timeDifference = targetCompletionTime.getTime() - now.getTime();

  if (timeDifference <= 0) {
    return { minutes: 0, seconds: 0, isExpired: true, hasValidTime: true };
  }

  const totalSeconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return { minutes, seconds, isExpired: false, hasValidTime: true };
};

// Format countdown timer display
const formatCountdownTime = (minutes: number, seconds: number): string => {
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  order,
  className = "",
}) => {
  const [timeData, setTimeData] = useState(() => calculateRemainingTime(order));

  // Debug logging
  console.log("CountdownTimer Debug:", {
    orderId: order.id,
    status: order.status,
    time_to_ready: order.time_to_ready,
    remaining_time: order.remaining_time,
    preparing_at: order.preparing_at,
    timeData,
    hasValidTime: timeData.hasValidTime,
  });

  useEffect(() => {
    // Always recalculate when order changes
    const newTimeData = calculateRemainingTime(order);
    setTimeData(newTimeData);

    // Only start interval if we're in preparing status with valid time
    if (order.status === "preparing" && newTimeData.hasValidTime) {
      const interval = setInterval(() => {
        const updatedTimeData = calculateRemainingTime(order);
        setTimeData(updatedTimeData);

        // Keep running even if expired - let branch worker update status
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [
    order.id,
    order.status,
    order.time_to_ready,
    order.remaining_time,
    order.preparing_at,
  ]);

  // Case 1: Order is not in preparing status
  if (order.status !== "preparing") {
    return null;
  }

  // Case 2: Order is preparing but branch worker hasn't set time yet
  if (!timeData.hasValidTime) {
    return (
      <div
        className={`bg-blue-50 border border-blue-200 rounded-xl p-4 ${className}`}
      >
        <div className="flex items-center justify-center gap-3 text-blue-700">
          <div className="bg-blue-100 rounded-full p-2">
            <ChefHat className="h-6 w-6 animate-bounce text-blue-600" />
          </div>
          <div className="text-center">
            <div className="text-base font-semibold">بدأ التحضير</div>
            <div className="text-sm text-blue-600">
              المطعم يعمل على طلبك الآن
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Time expired but still in preparing status
  if (timeData.isExpired) {
    return (
      <div
        className={`bg-amber-50 border border-amber-300 rounded-xl p-4 ${className}`}
      >
        <div className="flex items-center justify-center gap-3 text-amber-700">
          <div className="bg-amber-100 rounded-full p-2">
            <Clock className="h-6 w-6 animate-pulse text-amber-600" />
          </div>
          <div className="text-center">
            <div className="text-base font-semibold">قارب على الانتهاء</div>
            <div className="text-sm text-amber-600">
              سيكون جاهزاً في أي لحظة
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 4: Active countdown - branch worker set time and counting down
  return (
    <div
      className={`bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-center gap-4 text-orange-700">
        <div className="bg-orange-100 rounded-full p-3">
          <ChefHat className="h-6 w-6 animate-pulse text-orange-600" />
        </div>
        <div className="text-center">
          <div className="text-sm text-orange-600 mb-1 font-medium">
            وقت التحضير المتبقي
          </div>
          <div className="bg-white/80 rounded-lg px-3 py-1 shadow-inner">
            <div className="font-mono text-3xl font-bold text-orange-800 tracking-wider">
              {formatCountdownTime(timeData.minutes, timeData.seconds)}
            </div>
          </div>
          <div className="text-xs text-orange-500 mt-1">محدد من المطعم</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
