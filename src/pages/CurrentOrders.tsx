import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useOrderStore, Order } from "../hooks/useOrderStore";
import { useAuthStore } from "@/stores/useAuthStore";
import OrderCard from "../components/currentOrder/OrderCard";
import EmptyState from "../components/currentOrder/EmptyState";
import LoadingState from "../components/currentOrder/LoadingState";
import ErrorState from "../components/currentOrder/ErrorState";
import RefreshButton from "../components/currentOrder/RefreshButton";
import { toast } from "sonner";

const CurrentOrders: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const orderStore = useOrderStore(user?.id || null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  // Check if we just submitted an order
  const justSubmitted = location.state?.justSubmitted;
  const orderId = location.state?.orderId;

  // Clear navigation state after first render
  useEffect(() => {
    if (justSubmitted) {
      const timer = setTimeout(() => {
        window.history.replaceState({}, document.title, location.pathname);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

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

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول لعرض الطلبات الحالية");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleNavigateToRestaurants = useCallback(() => {
    navigate("/");
  }, [navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const showSuccessMessage = justSubmitted && orderId;
  const isLoading = orderStore.loading;

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

          {/* Success message for just submitted orders */}
          {showSuccessMessage && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    تم إرسال طلبك بنجاح! رقم الطلب: {orderId}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {isLoading
                      ? "جاري تحميل طلبك..."
                      : activeOrders.length === 0
                      ? "سيظهر طلبك خلال لحظات"
                      : "تم تحميل طلبك بنجاح"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {orderStore.error && (
          <ErrorState error={orderStore.error} onRetry={handleRefresh} />
        )}

        {/* Loading State */}
        {isLoading ? (
          <LoadingState />
        ) : activeOrders.length === 0 ? (
          <div>
            {/* Show different empty state if we just submitted an order */}
            {showSuccessMessage ? (
              <div className="text-center py-12">
                <div className="animate-pulse space-y-4">
                  <div className="h-12 w-12 bg-[#FFAA01]/20 rounded-full mx-auto"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">
                  جاري البحث عن طلبك...
                </h3>
                <p className="text-gray-600 mb-4">
                  قد يستغرق ظهور الطلب بعض الوقت
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-[#FFAA01] text-white rounded-lg hover:bg-[#e69500] transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  تحديث الطلبات
                </button>
              </div>
            ) : (
              <EmptyState onNavigate={handleNavigateToRestaurants} />
            )}
          </div>
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
              loading={isLoading}
              hasOrders={activeOrders.length > 0}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CurrentOrders;
