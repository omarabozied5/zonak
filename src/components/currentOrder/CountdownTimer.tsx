import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

// Order interface (simplified for this component)
interface Order {
  id: number;
  status: string;
  remaining_time: number;
  time_to_ready: string | null;
}

interface CountdownTimerProps {
  order: Order;
  className?: string;
}

// Calculate remaining time as a countdown timer
const calculateRemainingTime = (
  order: Order
): {
  minutes: number;
  seconds: number;
  isExpired: boolean;
} => {
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
const formatCountdownTime = (minutes: number, seconds: number): string => {
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
};

// Check if order should show timer
const shouldShowTimer = (order: Order): boolean => {
  return (
    (order.status === "preparing" || order.status === "confirmed") &&
    (order.time_to_ready || order.remaining_time > 0)
  );
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  order,
  className = "",
}) => {
  const [timeData, setTimeData] = useState(() => calculateRemainingTime(order));

  useEffect(() => {
    if (!shouldShowTimer(order)) return;

    // Update immediately
    setTimeData(calculateRemainingTime(order));

    // Set up interval to update every second
    const interval = setInterval(() => {
      const newTimeData = calculateRemainingTime(order);
      setTimeData(newTimeData);

      // Stop the timer if expired
      if (newTimeData.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order.id, order.time_to_ready, order.remaining_time, order.status]);

  if (!shouldShowTimer(order)) return null;

  if (timeData.isExpired) {
    return (
      <div
        className={`flex items-center gap-2 text-green-600 font-medium ${className}`}
      >
        <Clock className="h-4 w-4" />
        <span>جاهز للاستلام</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-orange-600 font-medium ${className}`}
    >
      <Clock className="h-4 w-4 animate-pulse" />
      <span>
        الوقت المتبقي: {formatCountdownTime(timeData.minutes, timeData.seconds)}
      </span>
    </div>
  );
};

export default CountdownTimer;
