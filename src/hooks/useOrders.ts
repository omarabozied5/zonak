// useOrders.ts - Simplified wrapper around useOrderStore for backward compatibility

import { useCallback } from "react";
import { useOrderStore, Order } from "@/hooks/useOrderStore";
import { useAuthStore } from "@/stores/useAuthStore";

export const useOrders = () => {
  const { user } = useAuthStore();
  const userId = user?.id?.toString() || null;

  const orderStore = useOrderStore(userId);

  // Order actions
  const updateStatus = useCallback(
    (orderId: number, status: Order["status"]) => {
      // This would typically call an API to update order status
      // For now, we don't implement this since orders are read-only from customer side
      console.log(
        "Update status not implemented for customer orders:",
        orderId,
        status
      );
    },
    []
  );

  const deleteOrder = useCallback((orderId: number) => {
    // This would typically call an API to cancel/delete order
    // For now, we don't implement this since it requires API integration
    console.log("Delete order not implemented:", orderId);
  }, []);

  const clearOrders = useCallback(() => {
    orderStore.clearOrders();
  }, [orderStore]);

  // Get orders with different filters
  const getOrdersByStatus = useCallback(
    (status: Order["status"]) => {
      return orderStore.getOrdersByStatus(status);
    },
    [orderStore]
  );

  const getOrdersByDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      return orderStore.getUserOrders().filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && orderDate <= endDate;
      });
    },
    [orderStore]
  );

  const getOrdersByType = useCallback(
    (orderType: "pickup" | "delivery") => {
      return orderStore.getUserOrders().filter((order) => {
        const isDelivery = order.is_delivery === 1;
        return orderType === "delivery" ? isDelivery : !isDelivery;
      });
    },
    [orderStore]
  );

  const getOrdersByPaymentMethod = useCallback(
    (paymentMethod: string) => {
      return orderStore
        .getUserOrders()
        .filter((order) => order.status_payment === paymentMethod);
    },
    [orderStore]
  );

  // Get single order
  const getOrderById = useCallback(
    (orderId: number) => {
      return orderStore.getOrderById(orderId);
    },
    [orderStore]
  );

  // Statistics
  const getOrdersStatistics = useCallback(() => {
    const allOrders = orderStore.getUserOrders();
    const activeOrders = orderStore.getActiveOrders();

    const stats = {
      total: allOrders.length,
      active: activeOrders.length,
      completed: allOrders.filter((order) => order.status === "delivered")
        .length,
      cancelled: allOrders.filter((order) =>
        ["rejected", "timeout"].includes(order.status)
      ).length,
      preparing: allOrders.filter((order) => order.status === "preparing")
        .length,
      ready: allOrders.filter((order) => order.status === "ready").length,
      outForDelivery: allOrders.filter((order) =>
        ["on_the_way", "waiting_customer"].includes(order.status)
      ).length,

      // Financial stats
      totalSpent: orderStore.getTotalSpent(),
      averageOrderValue:
        allOrders.length > 0
          ? allOrders.reduce((sum, order) => sum + order.total_price, 0) /
            allOrders.length
          : 0,

      // Order type breakdown
      deliveryOrders: allOrders.filter((order) => order.is_delivery === 1)
        .length,
      pickupOrders: allOrders.filter((order) => order.is_delivery === 0).length,

      // Recent activity
      ordersThisMonth: allOrders.filter((order) => {
        const orderDate = new Date(order.created_at);
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return orderDate >= firstDayOfMonth;
      }).length,

      ordersThisWeek: allOrders.filter((order) => {
        const orderDate = new Date(order.created_at);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
      }).length,
    };

    return stats;
  }, [orderStore]);

  // Get orders with pagination
  const getOrdersPaginated = useCallback(
    (page: number = 1, limit: number = 10) => {
      const allOrders = orderStore.getUserOrders();
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      return {
        orders: allOrders.slice(startIndex, endIndex),
        totalOrders: allOrders.length,
        currentPage: page,
        totalPages: Math.ceil(allOrders.length / limit),
        hasNext: endIndex < allOrders.length,
        hasPrevious: page > 1,
      };
    },
    [orderStore]
  );

  // Order status helpers
  const isOrderActive = useCallback((order: Order) => {
    return !["delivered", "rejected", "timeout"].includes(order.status);
  }, []);

  const isOrderCancellable = useCallback((order: Order) => {
    return ["pending", "confirmed", "preparing"].includes(order.status);
  }, []);

  const canTrackOrder = useCallback((order: Order) => {
    return (
      order.is_delivery === 1 &&
      ["preparing", "ready", "on_the_way", "waiting_customer"].includes(
        order.status
      )
    );
  }, []);

  const getOrderStatusText = useCallback((status: Order["status"]) => {
    const statusTexts = {
      pending: "في الانتظار",
      confirmed: "مؤكد",
      preparing: "جاري التحضير",
      ready: "جاهز للاستلام",
      on_the_way: "في الطريق",
      waiting_customer: "في انتظار العميل",
      delivered: "تم التوصيل",
      rejected: "مرفوض",
      timeout: "انتهت المهلة",
    };
    return statusTexts[status] || status;
  }, []);

  const getOrderTypeText = useCallback((isDelivery: number) => {
    return isDelivery === 1 ? "توصيل" : "استلام";
  }, []);

  // Helper to check if user can place orders
  const canPlaceOrder = useCallback(() => {
    return !!userId;
  }, [userId]);

  // Get computed values
  const allOrders = orderStore.getUserOrders();
  const activeOrders = orderStore.getActiveOrders();
  const hasOrders = allOrders.length > 0;
  const hasActiveOrders = activeOrders.length > 0;
  const orderStatistics = getOrdersStatistics();

  return {
    // State
    orders: allOrders,
    activeOrders,
    hasOrders,
    hasActiveOrders,

    // Actions (limited for customer side)
    updateStatus,
    deleteOrder,
    clearOrders,

    // Direct store actions
    fetchOrders: orderStore.fetchCurrentOrders,
    refreshOrders: orderStore.refreshOrders,

    // Getters
    getOrdersByStatus,
    getOrdersByDateRange,
    getOrdersByType,
    getOrdersByPaymentMethod,
    getOrderById,
    getOrdersPaginated,

    // Statistics
    orderStatistics,

    // Helpers
    isOrderActive,
    isOrderCancellable,
    canTrackOrder,
    getOrderStatusText,
    getOrderTypeText,
    canPlaceOrder,

    // Current user context
    currentUserId: userId,
    isLoggedIn: !!userId,

    // Store state
    loading: orderStore.loading,
    error: orderStore.error,
  };
};
