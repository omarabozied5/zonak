// useOrders.ts
import { useCallback, useEffect } from "react";
import { useOrderStore, Order, OrderInput } from "@/hooks/useOrderStore";
import { useAuthStore } from "@/stores/useAuthStore";

export const useOrders = () => {
  const { user } = useAuthStore();
  const userId = user?.id || null;

  const {
    orders,
    addOrder,
    updateOrderStatus,
    getActiveOrders,
    getUserOrders,
    removeOrder,
    setCurrentUser,
    clearUserOrders,
  } = useOrderStore(userId);

  // Sync orders with current user
  useEffect(() => {
    setCurrentUser(userId);
  }, [userId, setCurrentUser]);

  // Order actions
  const createOrder = useCallback(
    (orderData: OrderInput) => {
      if (!userId) {
        throw new Error("يجب تسجيل الدخول لإنشاء طلب");
      }
      addOrder(orderData);
    },
    [addOrder, userId]
  );

  const updateStatus = useCallback(
    (orderId: string, status: Order["status"]) => {
      updateOrderStatus(orderId, status);
    },
    [updateOrderStatus]
  );

  const deleteOrder = useCallback(
    (orderId: string) => {
      removeOrder(orderId);
    },
    [removeOrder]
  );

  const clearOrders = useCallback(() => {
    clearUserOrders();
  }, [clearUserOrders]);

  // Get orders with different filters
  const getOrdersByStatus = useCallback(
    (status: Order["status"]) => {
      return getUserOrders().filter((order) => order.status === status);
    },
    [getUserOrders]
  );

  const getOrdersByDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      return getUserOrders().filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    },
    [getUserOrders]
  );

  const getOrdersByType = useCallback(
    (orderType: "pickup" | "delivery") => {
      return getUserOrders().filter((order) => order.orderType === orderType);
    },
    [getUserOrders]
  );

  const getOrdersByPaymentMethod = useCallback(
    (paymentMethod: string) => {
      return getUserOrders().filter(
        (order) => order.paymentMethod === paymentMethod
      );
    },
    [getUserOrders]
  );

  // Get single order
  const getOrderById = useCallback(
    (orderId: string) => {
      return getUserOrders().find((order) => order.id === orderId);
    },
    [getUserOrders]
  );

  // Statistics
  const getOrdersStatistics = useCallback(() => {
    const allOrders = getUserOrders();
    const activeOrders = getActiveOrders();

    const stats = {
      total: allOrders.length,
      active: activeOrders.length,
      completed: allOrders.filter((order) => order.status === "completed")
        .length,
      cancelled: allOrders.filter((order) => order.status === "cancelled")
        .length,
      preparing: allOrders.filter((order) => order.status === "preparing")
        .length,
      ready: allOrders.filter((order) => order.status === "ready").length,
      outForDelivery: allOrders.filter(
        (order) => order.status === "out_for_delivery"
      ).length,

      // Financial stats
      totalSpent: allOrders.reduce((sum, order) => sum + order.total, 0),
      averageOrderValue:
        allOrders.length > 0
          ? allOrders.reduce((sum, order) => sum + order.total, 0) /
            allOrders.length
          : 0,

      // Order type breakdown
      deliveryOrders: allOrders.filter(
        (order) => order.orderType === "delivery"
      ).length,
      pickupOrders: allOrders.filter((order) => order.orderType === "pickup")
        .length,

      // Recent activity
      ordersThisMonth: allOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return orderDate >= firstDayOfMonth;
      }).length,

      ordersThisWeek: allOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
      }).length,
    };

    return stats;
  }, [getUserOrders, getActiveOrders]);

  // Get orders with pagination
  const getOrdersPaginated = useCallback(
    (page: number = 1, limit: number = 10) => {
      const allOrders = getUserOrders();
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
    [getUserOrders]
  );

  // Order status helpers
  const isOrderActive = useCallback((order: Order) => {
    return !["completed", "cancelled"].includes(order.status);
  }, []);

  const isOrderCancellable = useCallback((order: Order) => {
    return ["preparing", "ready"].includes(order.status);
  }, []);

  const canTrackOrder = useCallback((order: Order) => {
    return (
      order.orderType === "delivery" &&
      ["preparing", "ready", "out_for_delivery"].includes(order.status)
    );
  }, []);

  const getOrderStatusText = useCallback((status: Order["status"]) => {
    const statusTexts = {
      preparing: "جاري التحضير",
      ready: "جاهز للاستلام",
      out_for_delivery: "في الطريق",
      completed: "مكتمل",
      cancelled: "ملغي",
    };
    return statusTexts[status] || status;
  }, []);

  const getOrderTypeText = useCallback((orderType: "pickup" | "delivery") => {
    return orderType === "delivery" ? "توصيل" : "استلام";
  }, []);

  // Helper to check if user can place orders
  const canPlaceOrder = useCallback(() => {
    return !!userId;
  }, [userId]);

  // Get computed values
  const allOrders = getUserOrders();
  const activeOrders = getActiveOrders();
  const hasOrders = allOrders.length > 0;
  const hasActiveOrders = activeOrders.length > 0;
  const orderStatistics = getOrdersStatistics();

  return {
    // State
    orders: allOrders,
    activeOrders,
    hasOrders,
    hasActiveOrders,

    // Actions
    createOrder,
    updateStatus,
    deleteOrder,
    clearOrders,

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
  };
};
