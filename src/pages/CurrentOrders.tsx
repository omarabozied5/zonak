import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderStore, Order } from "../hooks/useOrderStore";
import { useAuthStore } from "@/stores/useAuthStore";
import OrderCard from "../components/currentOrder/OrderCard";
import {
  EmptyState,
  LoadingState,
} from "../components/currentOrder/EmptyState";
import ErrorState from "../components/currentOrder/ErrorState";
import RefreshButton from "../components/currentOrder/RefreshButton";
import BackButton from "@/components/ui/BackButton";

const CurrentOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const orderStore = useOrderStore(user?.id || null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  // Polling control
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  // Performance optimizations
  const MIN_FETCH_INTERVAL = 5000; // Prevent too frequent requests
  const BASE_POLLING_INTERVAL = 20000; // 20 seconds default
  const URGENT_POLLING_INTERVAL = 10000; // 10 seconds for urgent statuses
  const MAX_POLLING_INTERVAL = 60000; // 60 seconds for completed orders

  // Determine polling interval based on order statuses
  const getOptimalPollingInterval = useCallback((orders: Order[]): number => {
    if (orders.length === 0) return MAX_POLLING_INTERVAL;

    const hasUrgentOrders = orders.some(
      (order) =>
        order.status === "preparing" ||
        order.status === "on_the_way" ||
        order.status === "waiting_customer"
    );

    const hasActiveOrders = orders.some(
      (order) =>
        order.status === "pending" ||
        order.status === "confirmed" ||
        order.status === "ready"
    );

    if (hasUrgentOrders) return URGENT_POLLING_INTERVAL;
    if (hasActiveOrders) return BASE_POLLING_INTERVAL;
    return MAX_POLLING_INTERVAL;
  }, []);

  // Optimized fetch with debouncing
  const fetchOrders = useCallback(
    async (force = false) => {
      // Prevent concurrent fetches
      if (isFetchingRef.current && !force) return;

      // Prevent too frequent requests
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      if (timeSinceLastFetch < MIN_FETCH_INTERVAL && !force) return;

      if (!isAuthenticated || !user?.id) return;

      try {
        isFetchingRef.current = true;
        lastFetchTimeRef.current = now;
        await orderStore.fetchCurrentOrders();
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [isAuthenticated, user?.id, orderStore]
  );

  // Smart polling manager
  const setupPolling = useCallback(() => {
    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Don't poll if not authenticated
    if (!isAuthenticated || !user?.id) return;

    // Get optimal interval
    const interval = getOptimalPollingInterval(activeOrders);

    // Only poll if we have orders or checking for new ones
    if (activeOrders.length > 0 || interval === BASE_POLLING_INTERVAL) {
      pollingIntervalRef.current = setInterval(() => {
        fetchOrders();
      }, interval);
    }
  }, [
    activeOrders,
    isAuthenticated,
    user?.id,
    getOptimalPollingInterval,
    fetchOrders,
  ]);

  // Page visibility optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause polling when tab is hidden
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else {
        // Resume polling and fetch immediately when tab becomes visible
        fetchOrders(true);
        setupPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [setupPolling, fetchOrders]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchOrders(true);
    }
  }, [isAuthenticated, user?.id]);

  // Update local state from store
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setActiveOrders([]);
      return;
    }

    const orders = orderStore.getActiveOrders();
    setActiveOrders(orders);
  }, [orderStore.orders, isAuthenticated, user?.id]);

  // Setup/teardown polling based on orders
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    setupPolling();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [activeOrders.length, isAuthenticated, user?.id, setupPolling]);

  const handleRefresh = useCallback(async () => {
    await fetchOrders(true);
  }, [fetchOrders]);

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleNavigateToRestaurants = () => {
    navigate("/");
  };

  const isLoading = orderStore.loading;

  return (
    <div
      className="w-full max-w-[393px] mx-auto min-h-screen bg-white"
      dir="rtl"
    >
      {/* Header Section */}
      <div className="w-full bg-white pb-4">
        <div className="flex items-center justify-between px-6 pt-2 mt-2">
          <BackButton />
          <h1 className="text-[18px] font-medium text-[#111719] font-['Bahij_TheSansArabic']">
            الطلبات الحالية
          </h1>
          <div className="w-[38px]" />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-0 py-2">
        {/* Error State */}
        {orderStore.error && (
          <div className="px-4">
            <ErrorState error={orderStore.error} onRetry={handleRefresh} />
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="px-4">
            <LoadingState />
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="px-4">
            <EmptyState onNavigate={handleNavigateToRestaurants} />
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-2">
              {activeOrders.map((order, index) => (
                <div key={order.id}>
                  {index > 0 && <div className="h-1 bg-[#f6f6f6]" />}
                  <OrderCard order={order} />
                </div>
              ))}
            </div>

            {/* Refresh Button */}
            {/* <div className="px-4 mt-4">
              <RefreshButton
                onRefresh={handleRefresh}
                loading={isLoading}
                hasOrders={activeOrders.length > 0}
              />
            </div> */}
          </>
        )}
      </div>
    </div>
  );
};

export default CurrentOrders;
