import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOrderStore, Order } from "../hooks/useOrderStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore, clearUserCart } from "@/stores/useCartStore";
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
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const orderStore = useOrderStore(user?.id || null);
  const cartStore = useCartStore(user?.id);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  // Clear cart only once when arriving from successful payment
  useEffect(() => {
    const state = location.state as any;

    if (state?.fromSuccessfulPayment && !state?.processed) {
      cartStore.clearCart();
      clearUserCart(user?.id);

      // Mark as processed to prevent repeated clearing
      window.history.replaceState(
        { ...state, processed: true },
        document.title
      );
    }
  }, [location.state, cartStore, user?.id]);

  // Fetch orders on mount
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    orderStore.fetchCurrentOrders();
  }, [isAuthenticated, user?.id, orderStore.fetchCurrentOrders]);

  // Update local state when store changes
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setActiveOrders([]);
      return;
    }

    const orders = orderStore.getActiveOrders();
    setActiveOrders(orders);
  }, [orderStore.orders, isAuthenticated, user?.id]);

  const handleRefresh = useCallback(async () => {
    await orderStore.fetchCurrentOrders();
  }, [orderStore.fetchCurrentOrders]);

  const handleBackButton = () => {
    navigate("/", { replace: true });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleNavigateToRestaurants = () => {
    navigate("/");
  };

  return (
    <div
      className="w-full max-w-[393px] mx-auto min-h-screen bg-white"
      dir="rtl"
    >
      <div className="w-full bg-white pb-4">
        <div className="flex items-center justify-between px-6 pt-2 mt-2">
          <BackButton onClick={handleBackButton} />
          <h1 className="text-[18px] font-medium text-[#111719] font-['Bahij_TheSansArabic']">
            الطلبات الحالية
          </h1>
          <div className="w-[38px]" />
        </div>
      </div>

      <div className="px-0 py-2">
        {orderStore.error && (
          <div className="px-4">
            <ErrorState error={orderStore.error} onRetry={handleRefresh} />
          </div>
        )}

        {orderStore.loading ? (
          <div className="px-4">
            <LoadingState />
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="px-4">
            <EmptyState onNavigate={handleNavigateToRestaurants} />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {activeOrders.map((order, index) => (
                <div key={order.id}>
                  {index > 0 && <div className="h-1 bg-[#f6f6f6]" />}
                  <OrderCard order={order} />
                </div>
              ))}
            </div>

            <div className="px-4 mt-4">
              <RefreshButton
                onRefresh={handleRefresh}
                loading={orderStore.loading}
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
