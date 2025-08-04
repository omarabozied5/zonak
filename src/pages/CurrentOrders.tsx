// CurrentOrders.tsx - Fixed version with reduced re-renders

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const orderStore = useOrderStore(user?.id || null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const fetchAttempts = useRef(0);
  const maxFetchAttempts = 3;

  // Check if we just submitted an order
  const justSubmitted = location.state?.justSubmitted;
  const orderId = location.state?.orderId;

  // Clear navigation state after first render to prevent infinite refreshes
  useEffect(() => {
    if (justSubmitted) {
      const timer = setTimeout(() => {
        window.history.replaceState({}, document.title, location.pathname);
      }, 3000); // Reduced from 5000ms
      return () => clearTimeout(timer);
    }
  }, []); // Only run once

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // ✅ FIXED: Single effect for initial data fetching
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchInitialData = async () => {
      console.log("🚀 Initial fetch for user:", user.id);
      setIsInitialLoad(true);
      fetchAttempts.current = 0;

      try {
        if (justSubmitted) {
          console.log(
            "📦 Just submitted order, waiting 3 seconds before fetch..."
          );
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        await orderStore.fetchCurrentOrders();
        console.log("✅ Initial fetch completed");
      } catch (error) {
        console.error("❌ Initial fetch failed:", error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchInitialData();
  }, [isAuthenticated, user?.id]); // Remove justSubmitted dependency

  // ✅ FIXED: Separate effect for updating local state when store changes
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setActiveOrders([]);
      return;
    }

    const orders = orderStore.getActiveOrders();
    console.log("📋 Store orders updated:", {
      totalOrders: orderStore.orders.length,
      activeOrders: orders.length,
      loading: orderStore.loading,
      userId: user.id,
    });

    setActiveOrders(orders);

    // ✅ FIXED: Retry logic only if we just submitted and still no orders
    if (
      justSubmitted &&
      orders.length === 0 &&
      !orderStore.loading &&
      !isInitialLoad &&
      fetchAttempts.current < maxFetchAttempts
    ) {
      const retryDelay = (fetchAttempts.current + 1) * 2000; // 2s, 4s, 6s
      console.log(
        `🔄 Retry ${
          fetchAttempts.current + 1
        }/${maxFetchAttempts} in ${retryDelay}ms...`
      );

      const timer = setTimeout(async () => {
        fetchAttempts.current++;
        console.log(`🔄 Retry attempt ${fetchAttempts.current}...`);
        try {
          await orderStore.fetchCurrentOrders();
        } catch (error) {
          console.error(`❌ Retry ${fetchAttempts.current} failed:`, error);
        }
      }, retryDelay);

      return () => clearTimeout(timer);
    }
  }, [
    orderStore.orders,
    orderStore.loading,
    isAuthenticated,
    user?.id,
    justSubmitted,
    isInitialLoad,
  ]);

  // Use the refresh hook (but disable it during initial load)
  useOrderRefresh({
    isAuthenticated: isAuthenticated && !isInitialLoad,
    userId: user?.id || null,
    fetchOrders: orderStore.fetchCurrentOrders,
  });

  // ✅ Enhanced refresh handler
  const handleRefresh = useCallback(async () => {
    console.log("🔄 Manual refresh triggered");
    fetchAttempts.current = 0; // Reset attempts on manual refresh
    try {
      await orderStore.fetchCurrentOrders();
      console.log("✅ Manual refresh completed");
    } catch (error) {
      console.error("❌ Manual refresh failed:", error);
    }
  }, [orderStore]);

  const handleNavigateToRestaurants = useCallback(() => {
    navigate("/");
  }, [navigate]);

  if (!isAuthenticated) {
    return null;
  }

  // Show success message if we just submitted an order
  const showSuccessMessage = justSubmitted && orderId;
  const isLoading = orderStore.loading || isInitialLoad;

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

          {/* ✅ Enhanced debug info */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
              <div>
                المستخدم: {user?.id} | جاري التحميل: {isLoading ? "نعم" : "لا"}
              </div>
              <div>
                إجمالي الطلبات: {orderStore.orders.length} | النشطة:{" "}
                {activeOrders.length}
              </div>
              <div>
                محاولات الجلب: {fetchAttempts.current}/{maxFetchAttempts}
              </div>
              <div>
                آخر تحديث:{" "}
                {orderStore.lastFetchTime
                  ? new Date(orderStore.lastFetchTime).toLocaleTimeString("ar")
                  : "لم يتم"}
              </div>
              {orderStore.error && (
                <div className="text-red-500">خطأ: {orderStore.error}</div>
              )}
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
                  {fetchAttempts.current < maxFetchAttempts
                    ? "جاري البحث عن طلبك..."
                    : "قد يستغرق الأمر بعض الوقت"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {fetchAttempts.current < maxFetchAttempts
                    ? `محاولة ${
                        fetchAttempts.current + 1
                      } من ${maxFetchAttempts}`
                    : "يرجى المحاولة يدوياً أو الانتظار قليلاً"}
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
