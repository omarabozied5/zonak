import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "../stores/useCartStore";

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  customerInfo: CustomerInfo;
  orderType: "pickup" | "delivery";
  paymentMethod: string;
  status:
    | "preparing"
    | "ready"
    | "out_for_delivery"
    | "completed"
    | "cancelled";
  totalPrice: number;
  tax: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  estimatedTime: string;
  updatedAt?: string;
}

export interface OrderInput {
  items: CartItem[];
  customerInfo: CustomerInfo;
  orderType: "pickup" | "delivery";
  paymentMethod: string;
  totalPrice: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

interface OrderState {
  orders: Order[];
  currentUserId: string | null;
  addOrder: (order: OrderInput) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: Order["status"]
  ) => Promise<void>;
  getActiveOrders: () => Order[];
  getUserOrders: () => Order[];
  getOrderById: (orderId: string) => Order | null;
  removeOrder: (orderId: string) => Promise<void>;
  setCurrentUser: (userId: string | null) => void;
  clearUserOrders: () => void;
  cancelOrder: (orderId: string) => Promise<void>;
  getOrdersByStatus: (status: Order["status"]) => Order[];
  getOrdersCount: () => number;
  getTotalSpent: () => number;
}

const generateOrderId = (): string => {
  return `ORD-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 5)
    .toUpperCase()}`;
};

const calculateEstimatedTime = (orderType: "pickup" | "delivery"): string => {
  const now = new Date();
  const minutes = orderType === "pickup" ? 18 : 35;
  now.setMinutes(now.getMinutes() + minutes);
  return now.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isOrderCancellable = (order: Order): boolean => {
  const cancelableStatuses: Order["status"][] = ["preparing", "ready"];
  return cancelableStatuses.includes(order.status);
};

const createOrderStore = (userId: string | null) => {
  const storageKey = userId
    ? `orders-storage-${userId}`
    : "orders-storage-guest";

  return create<OrderState>()(
    persist(
      (set, get) => ({
        orders: [],
        currentUserId: userId,

        setCurrentUser: (newUserId: string | null) => {
          set({ currentUserId: newUserId });
        },

        clearUserOrders: () => {
          set({ orders: [] });
        },

        addOrder: async (orderData: OrderInput): Promise<void> => {
          const { currentUserId } = get();
          if (!currentUserId) {
            throw new Error("User must be logged in to place an order");
          }

          try {
            const newOrder: Order = {
              ...orderData,
              id: generateOrderId(),
              userId: currentUserId,
              status: "preparing",
              createdAt: new Date().toISOString(),
              estimatedTime: calculateEstimatedTime(orderData.orderType),
            };

            set({ orders: [...get().orders, newOrder] });

            // Auto-update order status for demo purposes
            setTimeout(() => {
              const currentOrders = get().orders;
              const orderExists = currentOrders.find(
                (o) => o.id === newOrder.id
              );
              if (orderExists && orderExists.status === "preparing") {
                get().updateOrderStatus(newOrder.id, "ready");
              }
            }, 300000); // 5 minutes
          } catch (error) {
            console.error("Error adding order:", error);
            throw new Error("Failed to add order");
          }
        },

        updateOrderStatus: async (
          orderId: string,
          status: Order["status"]
        ): Promise<void> => {
          const { currentUserId } = get();
          if (!currentUserId) {
            throw new Error("User must be logged in to update order");
          }

          try {
            set({
              orders: get().orders.map((order) =>
                order.id === orderId && order.userId === currentUserId
                  ? {
                      ...order,
                      status,
                      updatedAt: new Date().toISOString(),
                    }
                  : order
              ),
            });
          } catch (error) {
            console.error("Error updating order status:", error);
            throw new Error("Failed to update order status");
          }
        },

        cancelOrder: async (orderId: string): Promise<void> => {
          const { currentUserId } = get();
          if (!currentUserId) {
            throw new Error("User must be logged in to cancel order");
          }

          const order = get().orders.find(
            (o) => o.id === orderId && o.userId === currentUserId
          );
          if (!order) {
            throw new Error("Order not found");
          }

          if (!isOrderCancellable(order)) {
            throw new Error("Order cannot be cancelled at this stage");
          }

          try {
            await get().updateOrderStatus(orderId, "cancelled");
          } catch (error) {
            console.error("Error cancelling order:", error);
            throw new Error("Failed to cancel order");
          }
        },

        getOrderById: (orderId: string): Order | null => {
          const { currentUserId } = get();
          if (!currentUserId) return null;

          return (
            get().orders.find(
              (order) => order.id === orderId && order.userId === currentUserId
            ) || null
          );
        },

        getUserOrders: (): Order[] => {
          const { currentUserId } = get();
          if (!currentUserId) return [];

          return get()
            .orders.filter((order) => order.userId === currentUserId)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
        },

        getActiveOrders: (): Order[] => {
          const { currentUserId } = get();
          if (!currentUserId) return [];

          return get()
            .orders.filter(
              (order) =>
                order.userId === currentUserId &&
                order.status !== "completed" &&
                order.status !== "cancelled"
            )
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
        },

        getOrdersByStatus: (status: Order["status"]): Order[] => {
          const { currentUserId } = get();
          if (!currentUserId) return [];

          return get()
            .orders.filter(
              (order) =>
                order.userId === currentUserId && order.status === status
            )
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
        },

        getOrdersCount: (): number => {
          const { currentUserId } = get();
          if (!currentUserId) return 0;

          return get().orders.filter((order) => order.userId === currentUserId)
            .length;
        },

        getTotalSpent: (): number => {
          const { currentUserId } = get();
          if (!currentUserId) return 0;

          return get()
            .orders.filter(
              (order) =>
                order.userId === currentUserId && order.status === "completed"
            )
            .reduce((total, order) => total + order.total, 0);
        },

        removeOrder: async (orderId: string): Promise<void> => {
          const { currentUserId } = get();
          if (!currentUserId) {
            throw new Error("User must be logged in to remove order");
          }

          try {
            set({
              orders: get().orders.filter(
                (order) =>
                  !(order.id === orderId && order.userId === currentUserId)
              ),
            });
          } catch (error) {
            console.error("Error removing order:", error);
            throw new Error("Failed to remove order");
          }
        },
      }),
      {
        name: storageKey,
        version: 1,
        partialize: (state) => ({
          orders: state.orders,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            console.log(
              `Orders rehydrated for user: ${state.currentUserId || "guest"}`
            );
          }
        },
      }
    )
  );
};

// Store instances cache with better memory management
const orderStoreInstances = new Map<
  string,
  {
    store: ReturnType<typeof createOrderStore>;
    lastAccessed: number;
  }
>();

// Cleanup old instances (optional performance optimization)
const cleanupOldInstances = () => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes

  for (const [key, value] of orderStoreInstances.entries()) {
    if (now - value.lastAccessed > maxAge) {
      orderStoreInstances.delete(key);
    }
  }
};

export const useOrderStore = (userId: string | null = null) => {
  const storeKey = userId || "guest";

  if (!orderStoreInstances.has(storeKey)) {
    orderStoreInstances.set(storeKey, {
      store: createOrderStore(userId),
      lastAccessed: Date.now(),
    });
  }

  // Update last accessed time
  const instance = orderStoreInstances.get(storeKey)!;
  instance.lastAccessed = Date.now();

  // Occasionally cleanup old instances
  if (Math.random() < 0.01) {
    cleanupOldInstances();
  }

  return instance.store();
};

// Helper function to switch between user orders with better memory management
export const switchUserOrders = (newUserId: string | null) => {
  const newStoreKey = newUserId || "guest";

  // Don't clear all instances, just ensure we have the right one
  if (!orderStoreInstances.has(newStoreKey)) {
    orderStoreInstances.set(newStoreKey, {
      store: createOrderStore(newUserId),
      lastAccessed: Date.now(),
    });
  }

  // Return the store instance
  return useOrderStore(newUserId);
};

// Helper function to clear a specific user's orders
export const clearUserOrders = (userId: string | null) => {
  const storeKey = userId || "guest";
  const storageKey = userId
    ? `orders-storage-${userId}`
    : "orders-storage-guest";

  try {
    // Clear from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }

    // Clear from memory cache
    orderStoreInstances.delete(storeKey);
  } catch (error) {
    console.error("Error clearing user orders:", error);
  }
};

// Helper function to get orders for a specific user (useful for admin views)
export const getUserOrdersById = (userId: string): Order[] => {
  try {
    const orderStore = useOrderStore(userId);
    return orderStore.getUserOrders();
  } catch (error) {
    console.error("Error getting user orders:", error);
    return [];
  }
};

// Helper function to check if an order can be cancelled
export const canCancelOrder = (order: Order): boolean => {
  return isOrderCancellable(order);
};

// Helper function to get order status display text (Arabic)
export const getOrderStatusText = (status: Order["status"]): string => {
  const statusMap: Record<Order["status"], string> = {
    preparing: "جاري التحضير",
    ready: "جاهز للاستلام",
    out_for_delivery: "في الطريق",
    completed: "مكتمل",
    cancelled: "ملغي",
  };
  return statusMap[status] || status;
};

// Helper function to get order type display text (Arabic)
export const getOrderTypeText = (orderType: "pickup" | "delivery"): string => {
  return orderType === "pickup" ? "استلام" : "توصيل";
};

// Helper to validate order data before adding
export const validateOrderData = (orderData: OrderInput): boolean => {
  if (!orderData.items || orderData.items.length === 0) {
    return false;
  }

  if (!orderData.customerInfo.name || !orderData.customerInfo.phone) {
    return false;
  }

  if (orderData.orderType === "delivery" && !orderData.customerInfo.address) {
    return false;
  }

  if (orderData.total <= 0) {
    return false;
  }

  return true;
};
