// CurrentOrders.tsx - Enhanced with better refresh handling

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useOrderStore, Order } from "../hooks/useOrderStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderRefresh } from "../hooks/useOrderRefresh";
import OrderCard from "../components/currentOrder/OrderCard";
import EmptyState from "../components/currentOrder/EmptyState";
import LoadingState from "../components/currentOrder/LoadingState";
import ErrorState from "../components/currentOrder/ErrorState";
import RefreshButton from "../components/currentOrder/RefreshButton";

const CurrentOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const orderStore = useOrderStore(user?.id || null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  // ✅ Enhanced refresh logic - fetch immediately when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("CurrentOrders: Fetching orders for user:", user.id);
      orderStore.fetchCurrentOrders();
    }
  }, [isAuthenticated, user?.id]);

  // Use custom hook for periodic refresh
  useOrderRefresh({
    isAuthenticated,
    userId: user?.id || null,
    fetchOrders: orderStore.fetchCurrentOrders,
  });

  // ✅ Enhanced order filtering - get active orders from the store
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const orders = orderStore.getActiveOrders();
      console.log("CurrentOrders: Active orders updated:", orders);
      console.log("🔍 DEBUG: Raw orders from store:", orderStore.orders);
      console.log("🔍 DEBUG: Active orders:", orders);
      console.log("🔍 DEBUG: Current user ID:", user?.id);
      setActiveOrders(orders);
    } else {
      setActiveOrders([]);
    }
  }, [isAuthenticated, user?.id, orderStore.orders]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleNavigateToRestaurants = () => {
    navigate("/");
  };

  // ✅ Enhanced refresh handler with loading feedback
  const handleRefresh = async () => {
    console.log("CurrentOrders: Manual refresh triggered");
    try {
      await orderStore.fetchCurrentOrders();
      console.log("CurrentOrders: Manual refresh completed");
    } catch (error) {
      console.error("CurrentOrders: Manual refresh failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFAA01]/10 to-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#053468] mb-2">
            الطلبات الحالية
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            تابع حالة طلباتك الجارية
          </p>
          {/* ✅ Add debug info in development */}
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-gray-400 mt-1">
              المستخدم: {user?.id} | عدد الطلبات: {activeOrders.length} | جاري
              التحميل: {orderStore.loading ? "نعم" : "لا"}
            </p>
          )}
        </div>

        {/* Error State */}
        {orderStore.error && (
          <ErrorState error={orderStore.error} onRetry={handleRefresh} />
        )}

        {/* Loading State */}
        {orderStore.loading ? (
          <LoadingState />
        ) : activeOrders.length === 0 ? (
          <EmptyState onNavigate={handleNavigateToRestaurants} />
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-4 sm:space-y-6">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {/* Refresh Button */}
            <RefreshButton
              onRefresh={handleRefresh}
              loading={orderStore.loading}
              hasOrders={activeOrders.length > 0}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CurrentOrders;
