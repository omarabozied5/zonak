import React, { useState, useEffect, useCallback } from "react";
import { useOrderStore, Order } from "../hooks/useOrderStore";
import { useAuthStore } from "@/stores/useAuthStore";
import OrderCard from "../components/currentOrder/OrderCard";
import {EmptyState , LoadingState} from "../components/currentOrder/EmptyState";
import ErrorState from "../components/currentOrder/ErrorState";
import RefreshButton from "../components/currentOrder/RefreshButton";
import BackButton from "@/components/ui/BackButton";

const CurrentOrders: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const orderStore = useOrderStore(user?.id || null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  

  

  // Initial data fetching
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchData = async () => {
      try {
        await orderStore.fetchCurrentOrders();
      } catch (error) {
        // Error is handled by the store
      }
    };

    fetchData();
  }, [isAuthenticated, user?.id]);



  console.log("Auth Check:", {
    isAuthenticated,
    userId: user?.id,
    storeOrders: orderStore.orders.length,
    activeOrdersCalculated: orderStore.getActiveOrders().length,
  });

  // Update local state when store changes
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setActiveOrders([]);
      return;
    }

    const orders = orderStore.getActiveOrders();
    setActiveOrders(orders);
  }, [orderStore.orders, orderStore.loading, isAuthenticated, user?.id]);

  const handleRefresh = useCallback(async () => {
    try {
      await orderStore.fetchCurrentOrders();
    } catch (error) {
      // Error is handled by the store
    }
  }, [orderStore]);

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleNavigateToRestaurants = () => {
    // Navigation logic would be handled by parent component
    console.log("Navigate to restaurants");
  };

  const isLoading = orderStore.loading;

  return (
    <div className="w-full max-w-[393px] mx-auto min-h-screen bg-[#f6f6f6]" dir="rtl">
      

      {/* Header Section */}
      <div className="w-full bg-white   pb-4">
        <div className="flex items-center justify-between px-6 pt-2">
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
            <div className="px-4 mt-4">
              <RefreshButton
                onRefresh={handleRefresh}
                loading={isLoading}
                hasOrders={activeOrders.length > 0}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CurrentOrders;