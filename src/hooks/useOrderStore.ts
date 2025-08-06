// useOrderStore.ts - Simplified and cleaned

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
const sortOrdersByDate = (orders: Order[]): Order[] =>
  orders.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

const filterUserOrders = (orders: Order[], userId: string | null): Order[] =>
  userId ? orders.filter((order) => order.user_id.toString() === userId) : [];

// API integration
const fetchCurrentOrdersFromAPI = async (): Promise<Order[]> => {
  const { apiService } = await import("../services/apiService");
  const response = await apiService.fetchCurrentOrders();

  if (response.message === "Success" && response.data) {
    return response.data;
  } else {
    return [];
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

        // Main fetch function
        fetchCurrentOrders: async (): Promise<void> => {
          const { currentUserId } = get();

          if (!currentUserId) {
            set({ error: "User not authenticated", loading: false });
            return;
          }

          set({ loading: true, error: null });

          try {
            const orders = await fetchCurrentOrdersFromAPI();

            // Filter orders for current user
            const userOrders = orders.filter(
              (order) => order.user_id.toString() === currentUserId
            );

            set({
              orders: userOrders,
              loading: false,
              lastFetchTime: Date.now(),
              error: null,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to fetch orders";

            set({
              error: errorMessage,
              loading: false,
            });
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

  return instance;
};

// Main hook
export const useOrderStore = (userId: string | null = null) => {
  const instance = getOrCreateStoreInstance(userId);
  return instance.store();
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

// Clear user orders (for logout)
export const clearUserOrders = (userId: string | null) => {
  const storeKey = userId || "guest";
  orderStoreInstances.delete(storeKey);

  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(`orders-storage-${userId || "guest"}`);
    } catch (error) {
      // Ignore localStorage errors
    }
  }
};
