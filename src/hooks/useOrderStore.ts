// useOrderStore.ts - Fixed hook call issue and improved refresh logic

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Export OrderInput for backward compatibility (though it's not used anymore)
export interface OrderInput {
  items: any[];
  customerInfo: {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
  };
  orderType: "pickup" | "delivery";
  paymentMethod: string;
  totalPrice: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

// Backend order structure to match API response
export interface OrderPlace {
  id: number;
  title: string;
  merchant_name: string;
  logo: string;
  longitude: string;
  latitude: string;
  phone: string;
  reviews_average: number;
}

export interface OrderItem {
  item_name: string;
  quantity: number;
  options: Array<{
    option_id?: number;
    price_option?: number;
    quantity_option?: number;
    subitem_id?: number;
    type_option_id?: number;
  }>;
}

export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  cart_price: number;
  note: string | null;
  merchant_id: number;
  place_id: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "on_the_way"
    | "waiting_customer"
    | "delivered"
    | "rejected"
    | "timeout";
  cancelled_at: string | null;
  confirmed_at: string | null;
  max_delivery_time: string | null;
  rejected_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
  rejection_type: string | null;
  discount: number;
  total_vat: number | null;
  remaining_time: number;
  zonak_discount: number;
  delivery_cost: number;
  location: string | null;
  long: string | null;
  lat: string | null;
  address: string | null;
  discount_from_coupons: number;
  cashback_from_coupons: number;
  title: string | null;
  phone: string | null;
  is_car_delivery: number | null;
  car_delivery_cost: number;
  is_zonak_account_used: number;
  remaining_amount: number;
  time_to_ready: string | null;
  firebase_uuid: string;
  created_at: string;
  type_payment: number;
  is_waiting_car: number;
  is_new: number;
  is_accepted: number;
  is_delivery: number;
  status_payment: string;
  provider: string | null;
  place: OrderPlace;
  orderitems: OrderItem[];
}

interface OrderState {
  // State
  orders: Order[];
  currentUserId: string | null;
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;

  // Core actions
  fetchCurrentOrders: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  setCurrentUser: (userId: string | null) => void;
  clearOrders: () => void;

  // Getters
  getActiveOrders: () => Order[];
  getUserOrders: () => Order[];
  getOrderById: (orderId: number) => Order | null;
  getOrdersByStatus: (status: Order["status"]) => Order[];

  // Statistics
  getOrdersCount: () => number;
  getActiveOrdersCount: () => number;
  getTotalSpent: () => number;

  // Internal state management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOrders: (orders: Order[]) => void;
}

// Helper functions
const requireAuth = (userId: string | null): void => {
  if (!userId) {
    throw new Error("User must be logged in to perform this action");
  }
};

const sortOrdersByDate = (orders: Order[]): Order[] =>
  orders.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

const filterUserOrders = (orders: Order[], userId: string | null): Order[] =>
  userId ? orders.filter((order) => order.user_id.toString() === userId) : [];

// API integration - FIXED: No longer uses hooks inside
const fetchCurrentOrdersFromAPI = async (): Promise<Order[]> => {
  try {
    // Import apiService dynamically to avoid hooks issue
    const { apiService } = await import("../services/apiService");
    const response = await apiService.fetchCurrentOrders();

    console.log("🔍 Raw API response:", response);

    if (response.message === "Success" && response.data) {
      console.log("✅ Orders fetched successfully:", response.data.length);

      // Log first order for debugging
      if (response.data.length > 0) {
        console.log("📋 Sample order:", {
          id: response.data[0].id,
          status: response.data[0].status,
          user_id: response.data[0].user_id,
          total_price: response.data[0].total_price,
          place: response.data[0].place?.title,
        });
      }

      return response.data;
    } else {
      console.log("ℹ️ No orders found or unsuccessful response");
      return [];
    }
  } catch (error) {
    console.error("❌ Failed to fetch orders from API:", error);
    throw error;
  }
};

const createOrderStore = (userId: string | null) => {
  return create<OrderState>()(
    persist(
      (set, get) => ({
        orders: [],
        currentUserId: userId,
        loading: false,
        error: null,
        lastFetchTime: null,

        // Internal state management
        setLoading: (loading: boolean) => {
          set({ loading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        setOrders: (orders: Order[]) => {
          set({
            orders,
            lastFetchTime: Date.now(),
            error: null,
          });
        },

        setCurrentUser: (newUserId: string | null) => {
          set({ currentUserId: newUserId });
        },

        clearOrders: () => {
          set({
            orders: [],
            error: null,
            lastFetchTime: null,
          });
        },

        // Main fetch function with improved error handling
        fetchCurrentOrders: async (): Promise<void> => {
          const { currentUserId } = get();

          console.log("🔍 fetchCurrentOrders called for user:", currentUserId);

          if (!currentUserId) {
            console.log("❌ No user ID - cannot fetch orders");
            set({ error: "User not authenticated", loading: false });
            return;
          }

          set({ loading: true, error: null });

          try {
            const orders = await fetchCurrentOrdersFromAPI();
            console.log("📦 Orders received:", orders.length);

            // Filter orders for current user (extra safety)
            const userOrders = orders.filter(
              (order) => order.user_id.toString() === currentUserId
            );

            console.log("👤 User orders filtered:", userOrders.length);

            set({
              orders: userOrders,
              loading: false,
              lastFetchTime: Date.now(),
              error: null,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to fetch orders";

            console.error("❌ fetchCurrentOrders error:", errorMessage);
            set({
              error: errorMessage,
              loading: false,
            });
          }
        },

        // Refresh function with retry logic
        refreshOrders: async (): Promise<void> => {
          console.log("🔄 Refreshing orders...");
          const maxRetries = 3;
          let attempt = 1;

          while (attempt <= maxRetries) {
            try {
              await get().fetchCurrentOrders();
              console.log(`✅ Orders refresh successful on attempt ${attempt}`);
              return;
            } catch (error) {
              console.warn(`⚠️ Refresh attempt ${attempt} failed:`, error);
              if (attempt === maxRetries) {
                console.error("❌ All refresh attempts failed");
                throw error;
              }
              // Wait before retry (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, attempt * 1000)
              );
              attempt++;
            }
          }
        },

        // Getters
        getUserOrders: (): Order[] => {
          const { currentUserId, orders } = get();
          return sortOrdersByDate(filterUserOrders(orders, currentUserId));
        },

        getActiveOrders: (): Order[] => {
          const { currentUserId, orders } = get();
          const userOrders = filterUserOrders(orders, currentUserId);
          const activeOrders = userOrders.filter(
            (order) =>
              !["delivered", "rejected", "timeout"].includes(order.status)
          );
          return sortOrdersByDate(activeOrders);
        },

        getOrderById: (orderId: number): Order | null => {
          const { currentUserId, orders } = get();
          if (!currentUserId) return null;

          return (
            orders.find(
              (order) =>
                order.id === orderId &&
                order.user_id.toString() === currentUserId
            ) || null
          );
        },

        getOrdersByStatus: (status: Order["status"]): Order[] => {
          const { currentUserId, orders } = get();
          const userOrders = filterUserOrders(orders, currentUserId);
          const filteredOrders = userOrders.filter(
            (order) => order.status === status
          );
          return sortOrdersByDate(filteredOrders);
        },

        // Statistics
        getOrdersCount: (): number => {
          const { currentUserId, orders } = get();
          return filterUserOrders(orders, currentUserId).length;
        },

        getActiveOrdersCount: (): number => {
          return get().getActiveOrders().length;
        },

        getTotalSpent: (): number => {
          const { currentUserId, orders } = get();
          return filterUserOrders(orders, currentUserId)
            .filter((order) => order.status === "delivered")
            .reduce((total, order) => total + order.total_price, 0);
        },
      }),
      {
        name: `orders-storage-${userId || "guest"}`,
        version: 1,
        partialize: (state) => ({
          orders: state.orders,
          lastFetchTime: state.lastFetchTime,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            console.log(
              `📱 Orders rehydrated for user: ${state.currentUserId || "guest"}`
            );
            console.log(`📦 Rehydrated ${state.orders.length} orders`);
          }
        },
      }
    )
  );
};

// Store instances cache
const orderStoreInstances = new Map<
  string,
  {
    store: ReturnType<typeof createOrderStore>;
    lastAccessed: number;
  }
>();

// Cleanup old instances periodically
const cleanupOldInstances = () => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes

  for (const [key, value] of orderStoreInstances.entries()) {
    if (now - value.lastAccessed > maxAge) {
      orderStoreInstances.delete(key);
    }
  }
};

// Get or create store instance
const getOrCreateStoreInstance = (userId: string | null) => {
  const storeKey = userId || "guest";

  if (!orderStoreInstances.has(storeKey)) {
    orderStoreInstances.set(storeKey, {
      store: createOrderStore(userId),
      lastAccessed: Date.now(),
    });
  }

  const instance = orderStoreInstances.get(storeKey)!;
  instance.lastAccessed = Date.now();

  // Occasionally cleanup old instances
  if (Math.random() < 0.01) {
    cleanupOldInstances();
  }

  return instance;
};

// Main hook
export const useOrderStore = (userId: string | null = null) => {
  const instance = getOrCreateStoreInstance(userId);
  return instance.store();
};

// FIXED: Utility functions for external use - No longer use hooks

// Force refresh orders after order submission - FIXED
export const refreshOrdersAfterSubmission = async (
  userId: string | null,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    expectedOrderId?: number;
  } = {}
): Promise<void> => {
  if (!userId) {
    console.warn("⚠️ Cannot refresh orders - no user ID provided");
    return;
  }

  const { maxRetries = 5, retryDelay = 3000, expectedOrderId } = options;

  console.log("🚀 Enhanced refresh after order submission:", {
    userId,
    maxRetries,
    retryDelay,
    expectedOrderId,
  });

  const instance = getOrCreateStoreInstance(userId);
  const store = instance.store.getState();

  let attempt = 0;
  let orderFound = false;

  while (attempt < maxRetries && !orderFound) {
    attempt++;

    try {
      // Add progressive delay: 3s, 5s, 7s, 10s, 15s
      const delay = retryDelay + (attempt - 1) * 2000;
      console.log(
        `⏳ Attempt ${attempt}/${maxRetries} - waiting ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(`🔄 Refreshing orders - attempt ${attempt}...`);
      await store.refreshOrders();

      // Get the current orders after refresh
      const currentOrders = store.getUserOrders();
      console.log(`📦 Found ${currentOrders.length} orders after refresh`);

      // If we have an expected order ID, check for it specifically
      if (expectedOrderId) {
        orderFound = currentOrders.some(
          (order) => order.id === expectedOrderId
        );
        console.log(
          `🔍 Looking for order ${expectedOrderId}: ${
            orderFound ? "FOUND" : "NOT FOUND"
          }`
        );
      } else {
        // Otherwise, just check if we have any orders
        orderFound = currentOrders.length > 0;
      }

      if (orderFound) {
        console.log(`✅ Order refresh successful on attempt ${attempt}`);
        return;
      } else {
        console.log(`⚠️ Order not found yet on attempt ${attempt}`);
      }
    } catch (error) {
      console.error(`❌ Refresh attempt ${attempt} failed:`, error);

      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        console.error("❌ All refresh attempts failed");
        throw error;
      }
    }
  }

  if (!orderFound) {
    console.warn(`⚠️ Order not found after ${maxRetries} attempts`);
    // Don't throw error - the order was still submitted successfully
    // Just log a warning for debugging
  }
};

export const fetchOrdersWithRetry = async (
  userId: string | null,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { maxRetries = 3, retryDelay = 1000, backoffMultiplier = 2 } = options;

  console.log("🔄 Starting fetch with retry logic:", {
    userId,
    maxRetries,
    retryDelay,
    backoffMultiplier,
  });

  const instance = getOrCreateStoreInstance(userId);
  const store = instance.store.getState();

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 Fetch attempt ${attempt}/${maxRetries}...`);

      await store.fetchCurrentOrders();

      const orders = store.getUserOrders();
      console.log(`✅ Fetch successful: ${orders.length} orders found`);

      return; // Success!
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      console.error(`❌ Fetch attempt ${attempt} failed:`, lastError.message);

      // If this isn't the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt - 1);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // If we get here, all attempts failed
  console.error(`❌ All ${maxRetries} fetch attempts failed`);
  throw (
    lastError || new Error("Failed to fetch orders after multiple attempts")
  );
};
// Check if orders are stale and need refresh
export const shouldRefreshOrders = (userId: string | null): boolean => {
  if (!userId) return false;

  const instance = getOrCreateStoreInstance(userId);
  const state = instance.store.getState();

  if (!state.lastFetchTime) return true;

  const now = Date.now();
  const staleThreshold = 2 * 60 * 1000; // 2 minutes

  return now - state.lastFetchTime > staleThreshold;
};

// Clear user orders (for logout)
export const clearUserOrders = (userId: string | null) => {
  const storeKey = userId || "guest";
  orderStoreInstances.delete(storeKey);

  // Clear from localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(`orders-storage-${userId || "guest"}`);
    } catch (error) {
      console.error("Error clearing orders localStorage:", error);
    }
  }
};

// Helper functions for UI
export const getOrderStatusText = (status: Order["status"]): string => {
  const statusMap: Record<Order["status"], string> = {
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
  return statusMap[status] || status;
};

export const getOrderTypeText = (isDelivery: number): string => {
  return isDelivery === 1 ? "توصيل" : "استلام";
};

export const isOrderActive = (order: Order): boolean => {
  return !["delivered", "rejected", "timeout"].includes(order.status);
};

export const canCancelOrder = (order: Order): boolean => {
  return ["pending", "confirmed", "preparing"].includes(order.status);
};
