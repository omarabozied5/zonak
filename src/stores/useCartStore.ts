import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurantId: string;
  restaurantName: string;
  selectedOptions?: {
    size?: string;
    requiredOptions?: Record<string, number>;
    requiredOptionNames?: Record<string, string>;
    optionalOptions?: number[];
    optionalOptionNames?: string[];
    notes?: string;
  };
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
  editingItemId: string | null;
  currentUserId: string | null;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setEditingItem: (itemId: string | null) => void;
  updateItem: (itemId: string, updatedItem: CartItem) => void;
  setCurrentUser: (userId: string | null) => void;

  // Getters
  getTotalItems: () => number;
  hasCustomizations: (item: CartItem) => boolean;
  getItemQuantity: (itemId: string, restaurantId: string) => number;
  getMenuItemQuantity: (menuItemId: string, restaurantId?: string) => number;
  getMenuItemQuantityByRestaurant: (
    menuItemId: string
  ) => Record<string, number>;
  getRestaurantItemCount: (restaurantId: string) => number;
  getItemVariants: (menuItemId: string, restaurantId?: string) => CartItem[];
  canAddMoreItems: (
    menuItemId: string,
    restaurantId: string,
    maxQuantity?: number
  ) => boolean;
  getQuantityBreakdown: () => {
    totalItems: number;
    byRestaurant: Record<string, number>;
    byMenuItem: Record<string, number>;
  };
}

// Helper functions
const getBaseItemId = (itemId: string): string => {
  return itemId.split("-")[0];
};

const createItemKey = (item: CartItem) => {
  const baseId = getBaseItemId(item.id);
  const itemSignature = {
    baseId,
    restaurantId: item.restaurantId,
    unitPrice: item.price,
    selectedOptions: {
      size: item.selectedOptions?.size || null,
      requiredOptions: item.selectedOptions?.requiredOptions || {},
      optionalOptions: (item.selectedOptions?.optionalOptions || []).sort(),
      notes: item.selectedOptions?.notes?.trim() || null,
    },
  };
  return JSON.stringify(itemSignature);
};

const calculateTotalPrice = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// Create cart store factory
const createCartStore = (userId: string | null) => {
  const storageKey = userId ? `cart-storage-${userId}` : "cart-storage-guest";

  return create<CartState>()(
    persist(
      (set, get) => ({
        items: [],
        totalPrice: 0,
        editingItemId: null,
        currentUserId: userId,

        setCurrentUser: (newUserId: string | null) => {
          set({ currentUserId: newUserId });
        },

        hasCustomizations: (item: CartItem) => {
          const options = item.selectedOptions;
          if (!options) return false;

          return !!(
            options.size ||
            (options.requiredOptions &&
              Object.keys(options.requiredOptions).length > 0) ||
            (options.optionalOptions && options.optionalOptions.length > 0) ||
            (options.notes && options.notes.trim().length > 0)
          );
        },

        getItemQuantity: (itemId: string, restaurantId: string) => {
          const { items } = get();
          return items
            .filter((item) => {
              const baseId = getBaseItemId(item.id);
              return baseId === itemId && item.restaurantId === restaurantId;
            })
            .reduce((total, item) => total + item.quantity, 0);
        },

        getMenuItemQuantity: (menuItemId: string, restaurantId?: string) => {
          const { items } = get();
          return items
            .filter((item) => {
              const baseId = getBaseItemId(item.id);
              const matchesItem = baseId === menuItemId;
              const matchesRestaurant =
                !restaurantId || item.restaurantId === restaurantId;
              return matchesItem && matchesRestaurant;
            })
            .reduce((total, item) => total + item.quantity, 0);
        },

        getMenuItemQuantityByRestaurant: (menuItemId: string) => {
          const { items } = get();
          const breakdown: Record<string, number> = {};

          items
            .filter((item) => getBaseItemId(item.id) === menuItemId)
            .forEach((item) => {
              breakdown[item.restaurantId] =
                (breakdown[item.restaurantId] || 0) + item.quantity;
            });

          return breakdown;
        },

        getRestaurantItemCount: (restaurantId: string) => {
          const { items } = get();
          return items
            .filter((item) => item.restaurantId === restaurantId)
            .reduce((total, item) => total + item.quantity, 0);
        },

        getItemVariants: (menuItemId: string, restaurantId?: string) => {
          const { items } = get();
          return items.filter((item) => {
            const baseId = getBaseItemId(item.id);
            const matchesItem = baseId === menuItemId;
            const matchesRestaurant =
              !restaurantId || item.restaurantId === restaurantId;
            return matchesItem && matchesRestaurant;
          });
        },

        canAddMoreItems: (
          menuItemId: string,
          restaurantId: string,
          maxQuantity = 50
        ) => {
          const currentQuantity = get().getMenuItemQuantity(
            menuItemId,
            restaurantId
          );
          return currentQuantity < maxQuantity;
        },

        getQuantityBreakdown: () => {
          const { items } = get();
          const breakdown = {
            totalItems: 0,
            byRestaurant: {} as Record<string, number>,
            byMenuItem: {} as Record<string, number>,
          };

          items.forEach((item) => {
            const baseId = getBaseItemId(item.id);
            breakdown.totalItems += item.quantity;
            breakdown.byRestaurant[item.restaurantId] =
              (breakdown.byRestaurant[item.restaurantId] || 0) + item.quantity;
            breakdown.byMenuItem[baseId] =
              (breakdown.byMenuItem[baseId] || 0) + item.quantity;
          });

          return breakdown;
        },

        setEditingItem: (itemId) => {
          set({ editingItemId: itemId });
        },

        updateItem: (itemId, updatedItem) => {
          const { items } = get();
          const updatedItems = items.map((item) =>
            item.id === itemId ? { ...updatedItem, id: itemId } : item
          );
          const totalPrice = calculateTotalPrice(updatedItems);
          set({ items: updatedItems, totalPrice, editingItemId: null });
        },

        addItem: (item) => {
          const { items, editingItemId } = get();

          if (editingItemId) {
            get().updateItem(editingItemId, item);
            return;
          }

          const itemKey = createItemKey(item);
          const existingItemIndex = items.findIndex(
            (existingItem) => createItemKey(existingItem) === itemKey
          );

          let updatedItems;

          if (existingItemIndex >= 0) {
            updatedItems = [...items];
            const existingItem = updatedItems[existingItemIndex];
            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + item.quantity,
              selectedOptions: {
                ...existingItem.selectedOptions,
                ...item.selectedOptions,
                requiredOptionNames: {
                  ...existingItem.selectedOptions?.requiredOptionNames,
                  ...item.selectedOptions?.requiredOptionNames,
                },
                optionalOptionNames: [
                  ...(existingItem.selectedOptions?.optionalOptionNames || []),
                  ...(item.selectedOptions?.optionalOptionNames || []),
                ].filter((name, index, arr) => arr.indexOf(name) === index),
              },
            };
          } else {
            updatedItems = [...items, item];
          }

          const totalPrice = calculateTotalPrice(updatedItems);
          set({ items: updatedItems, totalPrice });
        },

        removeItem: (itemId) => {
          const { items } = get();
          const updatedItems = items.filter((item) => item.id !== itemId);
          const totalPrice = calculateTotalPrice(updatedItems);
          set({ items: updatedItems, totalPrice });
        },

        updateQuantity: (itemId, quantity) => {
          const { items } = get();
          if (quantity <= 0) {
            get().removeItem(itemId);
            return;
          }

          const updatedItems = items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
          const totalPrice = calculateTotalPrice(updatedItems);
          set({ items: updatedItems, totalPrice });
        },

        clearCart: () => {
          set({ items: [], totalPrice: 0, editingItemId: null });
        },

        getTotalItems: () => {
          const { items } = get();
          return items.reduce((total, item) => total + item.quantity, 0);
        },
      }),
      {
        name: storageKey,
        version: 1,
        partialize: (state) => ({
          items: state.items,
          totalPrice: state.totalPrice,
          editingItemId: state.editingItemId,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            console.log(
              `Cart rehydrated for user: ${state.currentUserId || "guest"}`
            );
          }
        },
      }
    )
  );
};

// Store instances cache
const cartStoreInstances = new Map<
  string,
  {
    store: ReturnType<typeof createCartStore>;
    lastAccessed: number;
  }
>();

// Cleanup old instances (performance optimization)
const cleanupOldInstances = () => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes

  for (const [key, value] of cartStoreInstances.entries()) {
    if (now - value.lastAccessed > maxAge) {
      cartStoreInstances.delete(key);
    }
  }
};

// Listen for auth logout events to clean up cart data
if (typeof window !== "undefined") {
  window.addEventListener("auth-logout", (event: CustomEvent) => {
    const { userId } = event.detail;
    console.log(`Cleaning up cart data for user: ${userId || "guest"}`);

    // Clear specific user's cart from memory
    const storeKey = userId || "guest";
    cartStoreInstances.delete(storeKey);

    // Clear from localStorage
    const storageKey = userId ? `cart-storage-${userId}` : "cart-storage-guest";
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Error clearing cart localStorage:", error);
    }
  });

  window.addEventListener("user-data-cleanup", (event: CustomEvent) => {
    const { userId } = event.detail;
    console.log(`Additional cart cleanup for user: ${userId || "guest"}`);

    // Additional cleanup if needed
    cleanupOldInstances();
  });
}

// Main hook
export const useCartStore = (userId: string | null = null) => {
  const storeKey = userId || "guest";

  if (!cartStoreInstances.has(storeKey)) {
    cartStoreInstances.set(storeKey, {
      store: createCartStore(userId),
      lastAccessed: Date.now(),
    });
  }

  // Update last accessed time
  const instance = cartStoreInstances.get(storeKey)!;
  instance.lastAccessed = Date.now();

  // Occasionally cleanup old instances
  if (Math.random() < 0.01) {
    cleanupOldInstances();
  }

  return instance.store();
};

// Helper function to switch between user carts
export const switchUserCart = (newUserId: string | null) => {
  const newStoreKey = newUserId || "guest";

  if (!cartStoreInstances.has(newStoreKey)) {
    cartStoreInstances.set(newStoreKey, {
      store: createCartStore(newUserId),
      lastAccessed: Date.now(),
    });
  }

  const instance = cartStoreInstances.get(newStoreKey)!;
  instance.lastAccessed = Date.now();

  return instance.store;
};

// Helper function to clear a specific user's cart
export const clearUserCart = (userId: string | null) => {
  const storeKey = userId || "guest";
  const storageKey = userId ? `cart-storage-${userId}` : "cart-storage-guest";

  try {
    // Clear from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }

    // Clear from memory cache
    cartStoreInstances.delete(storeKey);

    console.log(`Cleared cart for user: ${userId || "guest"}`);
  } catch (error) {
    console.error("Error clearing user cart:", error);
  }
};

// Helper function to get cart instance without hook (for cleanup operations)
export const getCartStoreInstance = (userId: string | null) => {
  const storeKey = userId || "guest";
  const instance = cartStoreInstances.get(storeKey);

  if (!instance) {
    return createCartStore(userId);
  }

  return instance.store;
};

// Helper function to force cleanup all cart instances
export const forceCleanupAllCartInstances = () => {
  console.log("Force cleaning up all cart instances");
  cartStoreInstances.clear();
};

// Helper function to get current cart items count (useful for navigation)
export const getCurrentCartItemsCount = (userId: string | null): number => {
  try {
    const storeKey = userId || "guest";
    const instance = cartStoreInstances.get(storeKey);

    if (!instance) {
      return 0;
    }

    return instance.store.getState().getTotalItems();
  } catch (error) {
    console.error("Error getting cart items count:", error);
    return 0;
  }
};

// Helper function to ensure cart is properly initialized for user
export const ensureCartForUser = (userId: string | null) => {
  const storeKey = userId || "guest";

  if (!cartStoreInstances.has(storeKey)) {
    cartStoreInstances.set(storeKey, {
      store: createCartStore(userId),
      lastAccessed: Date.now(),
    });
  }

  const instance = cartStoreInstances.get(storeKey)!;
  instance.lastAccessed = Date.now();

  return instance.store;
};
