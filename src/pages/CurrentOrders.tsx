import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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

  // Memoize selectors to prevent unnecessary re-renders
  const user = useAuthStore(useCallback((state) => state.user, []));
  const isAuthenticated = useAuthStore(
    useCallback((state) => state.isAuthenticated, [])
  );

  const orderStore = useOrderStore(user?.id || null);
  const cartStore = useCartStore(user?.id);

  // Use ref to track if initial load is complete
  const initialLoadRef = useRef(false);
  const cartClearedRef = useRef(false);

  // Single state for orders
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  // OPTIMIZED: Clear cart only once on mount if coming from payment success
  useEffect(() => {
    if (cartClearedRef.current) return;

    const state = location.state as any;
    const shouldClearCart =
      state?.fromSuccessfulPayment ||
      state?.paymentSuccess ||
      state?.cartWasCleared ||
      state?.cartCleared;

    if (shouldClearCart) {
      cartClearedRef.current = true;

      // Single cart clear operation
      cartStore.clearCart();
      clearUserCart(user?.id);

      // Replace state immediately to prevent re-processing
      window.history.replaceState({ processed: true }, document.title);
    }
  }, []); // Empty deps - run once on mount

  // OPTIMIZED: Fetch orders only once on mount
  useEffect(() => {
    if (!isAuthenticated || !user?.id || initialLoadRef.current) return;

    initialLoadRef.current = true;

    const fetchData = async () => {
      try {
        await orderStore.fetchCurrentOrders();
      } catch (error) {}
    };

    fetchData();
  }, [isAuthenticated, user?.id]); // Only depend on auth changes

  // OPTIMIZED: Memoize active orders computation
  const computedActiveOrders = useMemo(() => {
    if (!isAuthenticated || !user?.id) return [];
    return orderStore.getActiveOrders();
  }, [orderStore.orders, isAuthenticated, user?.id]);

  // OPTIMIZED: Update local state only when computed orders change
  useEffect(() => {
    setActiveOrders(computedActiveOrders);
  }, [computedActiveOrders]);

  // OPTIMIZED: Memoized refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      await orderStore.fetchCurrentOrders();
    } catch (error) {}
  }, [orderStore]);

  // OPTIMIZED: Memoized navigation handlers
  const handleNavigateToRestaurants = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleBackButton = useCallback(() => {
    // Clear cart state before navigating
    if (!cartClearedRef.current) {
      cartStore.clearCart();
      clearUserCart(user?.id);
    }
    navigate("/", { replace: true });
  }, [navigate, cartStore, user?.id]);

  // Early return for unauthenticated users
  if (!isAuthenticated || !user) {
    return null;
  }

  const isLoading = orderStore.loading && !initialLoadRef.current;

  return (
    <div
      className="w-full max-w-[393px] mx-auto min-h-screen bg-white"
      dir="rtl"
    >
      {/* Header Section - Static, no re-renders needed */}
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

        {/* Loading State - Only show on initial load */}
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
            {/* Orders List - Memoized rendering */}
            <OrdersList orders={activeOrders} />

            {/* Refresh Button */}
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

// OPTIMIZED: Separate memoized component for orders list
const OrdersList = React.memo<{ orders: Order[] }>(
  ({ orders }) => {
    return (
      <div className="space-y-2">
        {orders.map((order, index) => (
          <div key={order.id}>
            {index > 0 && <div className="h-1 bg-[#f6f6f6]" />}
            <OrderCard order={order} />
          </div>
        ))}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if order IDs or count change
    if (prevProps.orders.length !== nextProps.orders.length) return false;

    return prevProps.orders.every(
      (order, index) =>
        order.id === nextProps.orders[index]?.id &&
        order.status === nextProps.orders[index]?.status
    );
  }
);

OrdersList.displayName = "OrdersList";

export default CurrentOrders;
