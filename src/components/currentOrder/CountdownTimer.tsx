import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Order } from "../../hooks/useOrderStore";
import {
  calculateRemainingTime,
  formatCountdownTime,
  shouldShowTimer,
} from "../../lib/orderUtils";

interface CountdownTimerProps {
  order: Order;
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  order,
  className = "",
}) => {
  const [timeData, setTimeData] = useState(() => calculateRemainingTime(order));

  useEffect(() => {
    if (!shouldShowTimer(order)) return;

    const interval = setInterval(() => {
      const newTimeData = calculateRemainingTime(order);
      setTimeData(newTimeData);

      // Stop the timer if expired
      if (newTimeData.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

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
