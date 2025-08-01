import { useEffect } from "react";

interface UseOrderRefreshProps {
  isAuthenticated: boolean;
  userId: number | string;
  fetchOrders: () => void;
  refreshInterval?: number;
}

export const useOrderRefresh = ({
  isAuthenticated,
  userId,
  fetchOrders,
  refreshInterval = 30000, // 30 seconds default
}: UseOrderRefreshProps) => {
  // Fetch orders when component mounts
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchOrders();
    }
  }, [isAuthenticated, userId, fetchOrders]);

  // Set up periodic refresh for order status
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAuthenticated, userId, fetchOrders, refreshInterval]);
};
