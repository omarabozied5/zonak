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

  // CRITICAL: Clear cart when arriving from successful payment
  useEffect(() => {
    const state = location.state as any;

    if (
      state?.fromSuccessfulPayment ||
      state?.paymentSuccess ||
      state?.cartWasCleared ||
      state?.cartCleared
    ) {
      console.log(
        "🧹 CurrentOrders: Clearing cart on arrival from payment success",
        {
          fromSuccessfulPayment: state.fromSuccessfulPayment,
          paymentSuccess: state.paymentSuccess,
          cartWasCleared: state.cartWasCleared,
          cartCleared: state.cartCleared,
        }
      );

      // Clear cart multiple times to ensure it takes
      const clearCartMultipleTimes = async () => {
        try {
          // First clear
          cartStore.clearCart();
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Second clear
          cartStore.clearCart();
          clearUserCart(user?.id);
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Third clear
          cartStore.clearCart();

          // Verify
          const finalItemCount = cartStore.items.length;
          console.log(`Cart verification: ${finalItemCount} items remaining`);

          if (finalItemCount > 0) {
            console.warn("Cart still has items, forcing final clear");
            cartStore.clearCart();
            clearUserCart(user?.id);
            localStorage.removeItem(`cart-storage-${user?.id || "guest"}`);
          }

          console.log("✅ Cart successfully cleared in CurrentOrders");
        } catch (error) {
          console.error("Error clearing cart in CurrentOrders:", error);
        }
      };

      clearCartMultipleTimes();

      // Replace history state to prevent back button issues
      window.history.replaceState(
        {
          ...state,
          processed: true,
        },
        document.title
      );
    }
  }, [location.state, cartStore, user?.id]);

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
    navigate("/");
  };

  // Override back button behavior
  const handleBackButton = () => {
    // Clear any remaining cart data before going back
    cartStore.clearCart();
    clearUserCart(user?.id);

    // Navigate to home instead of previous page
    navigate("/", { replace: true });
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
          <BackButton onClick={handleBackButton} />
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
