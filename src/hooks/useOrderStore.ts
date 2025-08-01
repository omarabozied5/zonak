import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "../types/types";

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
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
  loading: boolean;
  error: string | null;
  addOrder: (order: OrderInput) => Promise<void>;
  updateOrderStatus: (
    orderId: number,
    status: Order["status"]
  ) => Promise<void>;
  getActiveOrders: () => Order[];
  getUserOrders: () => Order[];
  getOrderById: (orderId: number) => Order | null;
  removeOrder: (orderId: number) => Promise<void>;
  setCurrentUser: (userId: string | null) => void;
  clearUserOrders: () => void;
  cancelOrder: (orderId: number) => Promise<void>;
  getOrdersByStatus: (status: Order["status"]) => Order[];
  getOrdersCount: () => number;
  getTotalSpent: () => number;
  fetchCurrentOrders: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOrders: (orders: Order[]) => void;
  // ✅ NEW: Enhanced method for submitting order and refreshing
  submitOrderAndRefresh: (
    orderData: OrderInput
  ) => Promise<{ success: boolean; orderId?: number; message?: string }>;
}

// Helper functions
const generateOrderId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
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
  const cancelableStatuses: Order["status"][] = [
    "pending",
    "confirmed",
    "preparing",
  ];
  return cancelableStatuses.includes(order.status);
};

const getStoreKey = (userId: string | null): string => userId || "guest";

const getStorageKey = (userId: string | null): string =>
  userId ? `orders-storage-${userId}` : "orders-storage-guest";

const sortOrdersByDate = (orders: Order[]): Order[] =>
  orders.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

const filterUserOrders = (orders: Order[], userId: string | null): Order[] =>
  userId ? orders.filter((order) => order.user_id.toString() === userId) : [];

const requireAuth = (userId: string | null): void => {
  if (!userId) {
    throw new Error("User must be logged in to perform this action");
  }
};

// Import API service function
// Replace the fetchCurrentOrdersFromAPI function in useOrderStore.ts with this debug version

const fetchCurrentOrdersFromAPI = async (): Promise<Order[]> => {
  console.log("🔥 DEBUG: fetchCurrentOrdersFromAPI called");

  try {
    console.log("🔥 DEBUG: Importing apiService");
    const { apiService } = await import("../services/apiService");

    console.log("🔥 DEBUG: Calling apiService.fetchCurrentOrders()");
    const response = await apiService.fetchCurrentOrders();

    console.log("🔥 DEBUG: API service response:", response);
    console.log("🔥 DEBUG: Response success:", response.success);
    console.log("🔥 DEBUG: Response data:", response.data);

    if (response.success && response.data) {
      console.log("🔥 DEBUG: Found", response.data.length, "orders");
      console.log("🔥 DEBUG: Returning orders:", response.data);
      return response.data;
    } else {
      console.log("🔥 DEBUG: No orders found or unsuccessful response");
      return [];
    }
  } catch (error) {
    console.error("❌ DEBUG: fetchCurrentOrdersFromAPI error:", error);
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

        setLoading: (loading: boolean) => {
          set({ loading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        setOrders: (orders: Order[]) => {
          set({ orders });
        },

        setCurrentUser: (newUserId: string | null) => {
          set({ currentUserId: newUserId });
        },

        clearUserOrders: () => {
          set({ orders: [] });
        },

        fetchCurrentOrders: async (): Promise<void> => {
          const { currentUserId } = get();

          console.log("🔥 DEBUG: fetchCurrentOrders called");
          console.log("🔥 DEBUG: currentUserId:", currentUserId);

          if (!currentUserId) {
            console.log("❌ DEBUG: No currentUserId - setting error");
            set({ error: "User not authenticated" });
            return;
          }

          console.log("🔥 DEBUG: Setting loading to true");
          set({ loading: true, error: null });

          try {
            console.log("🔥 DEBUG: About to call fetchCurrentOrdersFromAPI");
            const orders = await fetchCurrentOrdersFromAPI();
            console.log("🔥 DEBUG: API response received:", orders);
            console.log("🔥 DEBUG: Orders length:", orders?.length || 0);

            if (orders && orders.length > 0) {
              console.log("🔥 DEBUG: First order:", orders[0]);
            }

            console.log("🔥 DEBUG: Setting orders in store");
            set({ orders, loading: false });
            console.log("🔥 DEBUG: Orders set successfully");
          } catch (error) {
            console.error("❌ DEBUG: fetchCurrentOrders error:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Failed to fetch orders";
            console.log("❌ DEBUG: Setting error:", errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        // ✅ NEW: Enhanced method that submits order and immediately refreshes
        submitOrderAndRefresh: async (
          orderData: OrderInput
        ): Promise<{
          success: boolean;
          orderId?: number;
          message?: string;
        }> => {
          const { currentUserId } = get();
          requireAuth(currentUserId);

          set({ loading: true, error: null });

          try {
            // First, add the order locally (for immediate feedback)
            await get().addOrder(orderData);

            // Then, wait a moment and refresh from server to get the real order
            setTimeout(async () => {
              try {
                await get().fetchCurrentOrders();
              } catch (error) {
                console.error(
                  "Failed to refresh orders after submission:",
                  error
                );
              }
            }, 1500); // Wait 1.5 seconds for backend to process

            set({ loading: false });

            return {
              success: true,
              message: "تم إنشاء الطلب بنجاح",
            };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "فشل في إنشاء الطلب";
            set({ error: errorMessage, loading: false });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        addOrder: async (orderData: OrderInput): Promise<void> => {
          const { currentUserId } = get();
          requireAuth(currentUserId);

          try {
            // This would typically submit to backend first, then add to local state
            // For now, creating a mock order structure
            const newOrder: Order = {
              id: generateOrderId(),
              user_id: parseInt(currentUserId!),
              total_price: orderData.total,
              cart_price: orderData.totalPrice,
              note: orderData.customerInfo.notes || null,
              merchant_id: 0, // Would come from context
              place_id: 0, // Would come from context
              status: "pending",
              cancelled_at: null,
              confirmed_at: null,
              max_delivery_time: null,
              rejected_at: null,
              preparing_at: null,
              ready_at: null,
              delivered_at: null,
              rejection_type: null,
              discount: 0,
              total_vat: orderData.tax,
              remaining_time: 30,
              zonak_discount: 0,
              delivery_cost: orderData.deliveryFee,
              location: null,
              long: null,
              lat: null,
              address: orderData.customerInfo.address || null,
              discount_from_coupons: 0,
              cashback_from_coupons: 0,
              title: orderData.customerInfo.name,
              phone: orderData.customerInfo.phone,
              is_car_delivery: null,
              car_delivery_cost: 0,
              is_zonak_account_used: 0,
              remaining_amount: 0,
              time_to_ready: calculateEstimatedTime(orderData.orderType),
              firebase_uuid: `uuid-${Date.now()}`,
              created_at: new Date().toISOString(),
              type_payment: orderData.paymentMethod === "cash" ? 1 : 2,
              is_waiting_car: 0,
              is_new: 1,
              is_accepted: 0,
              is_delivery: orderData.orderType === "delivery" ? 1 : 0,
              status_payment:
                orderData.paymentMethod === "cash"
                  ? "cash_on_delivery"
                  : "paid_with_card",
              provider: null,
              place: {
                id: 0,
                title: "مطعم تجريبي",
                merchant_name: "مطعم تجريبي",
                logo: "",
                longitude: "0",
                latitude: "0",
                phone: "",
                reviews_average: 0,
              },
              orderitems: orderData.items.map((item) => ({
                item_name: item.name,
                quantity: item.quantity,
                options: [],
              })),
            };

            set({ orders: [...get().orders, newOrder] });
          } catch (error) {
            console.error("Error adding order:", error);
            throw new Error("Failed to add order");
          }
        },

        updateOrderStatus: async (
          orderId: number,
          status: Order["status"]
        ): Promise<void> => {
          const { currentUserId } = get();
          requireAuth(currentUserId);

          try {
            set({
              orders: get().orders.map((order) =>
                order.id === orderId &&
                order.user_id.toString() === currentUserId
                  ? {
                      ...order,
                      status,
                      [`${status}_at`]: new Date().toISOString(),
                    }
                  : order
              ),
            });
          } catch (error) {
            console.error("Error updating order status:", error);
            throw new Error("Failed to update order status");
          }
        },

        cancelOrder: async (orderId: number): Promise<void> => {
          const { currentUserId } = get();
          requireAuth(currentUserId);

          const order = get().orders.find(
            (o) => o.id === orderId && o.user_id.toString() === currentUserId
          );
          if (!order) {
            throw new Error("Order not found");
          }

          if (!isOrderCancellable(order)) {
            throw new Error("Order cannot be cancelled at this stage");
          }

          try {
            await get().updateOrderStatus(orderId, "rejected");
          } catch (error) {
            console.error("Error cancelling order:", error);
            throw new Error("Failed to cancel order");
          }
        },

        getOrderById: (orderId: number): Order | null => {
          const { currentUserId } = get();
          if (!currentUserId) return null;

          return (
            get().orders.find(
              (order) =>
                order.id === orderId &&
                order.user_id.toString() === currentUserId
            ) || null
          );
        },

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

        getOrdersByStatus: (status: Order["status"]): Order[] => {
          const { currentUserId, orders } = get();
          const userOrders = filterUserOrders(orders, currentUserId);
          const filteredOrders = userOrders.filter(
            (order) => order.status === status
          );
          return sortOrdersByDate(filteredOrders);
        },

        getOrdersCount: (): number => {
          const { currentUserId, orders } = get();
          return filterUserOrders(orders, currentUserId).length;
        },

        getTotalSpent: (): number => {
          const { currentUserId, orders } = get();
          return filterUserOrders(orders, currentUserId)
            .filter((order) => order.status === "delivered")
            .reduce((total, order) => total + order.total_price, 0);
        },

        removeOrder: async (orderId: number): Promise<void> => {
          const { currentUserId } = get();
          requireAuth(currentUserId);

          try {
            set({
              orders: get().orders.filter(
                (order) =>
                  !(
                    order.id === orderId &&
                    order.user_id.toString() === currentUserId
                  )
              ),
            });
          } catch (error) {
            console.error("Error removing order:", error);
            throw new Error("Failed to remove order");
          }
        },
      }),
      {
        name: getStorageKey(userId),
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

// Store instances cache
const orderStoreInstances = new Map<
  string,
  {
    store: ReturnType<typeof createOrderStore>;
    lastAccessed: number;
  }
>();

// Cleanup old instances
const cleanupOldInstances = () => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes

  for (const [key, value] of orderStoreInstances.entries()) {
    if (now - value.lastAccessed > maxAge) {
      orderStoreInstances.delete(key);
    }
  }
};

// Centralized store instance management
const getOrCreateStoreInstance = (userId: string | null) => {
  const storeKey = getStoreKey(userId);

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

// Cleanup order data helper
const cleanupOrderData = (userId: string | null) => {
  const storeKey = getStoreKey(userId);
  const storageKey = getStorageKey(userId);

  // Clear from memory
  orderStoreInstances.delete(storeKey);

  // Clear from localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Error clearing orders localStorage:", error);
    }
  }
};

// Main hook
export const useOrderStore = (userId: string | null = null) => {
  const instance = getOrCreateStoreInstance(userId);
  return instance.store();
};

// ✅ NEW: Helper function for checkout to submit order and refresh
export const submitOrderAndRefresh = async (
  userId: string | null,
  orderData: OrderInput
): Promise<{ success: boolean; orderId?: number; message?: string }> => {
  const instance = getOrCreateStoreInstance(userId);
  const store = instance.store();

  return await store.submitOrderAndRefresh(orderData);
};

// Helper function to switch between user orders
export const switchUserOrders = (newUserId: string | null) => {
  const instance = getOrCreateStoreInstance(newUserId);
  return instance.store();
};

// Helper function to clear a specific user's orders
export const clearUserOrders = (userId: string | null) => {
  try {
    cleanupOrderData(userId);
    console.log(`Cleared orders for user: ${userId || "guest"}`);
  } catch (error) {
    console.error("Error clearing user orders:", error);
  }
};

// Helper function to get orders for a specific user (useful for admin views)
export const getUserOrdersById = (userId: string): Order[] => {
  try {
    const instance = getOrCreateStoreInstance(userId);
    const orderStore = instance.store.getState();
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
