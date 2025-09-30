import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "../types/types";

interface CartState {
  items: CartItem[];
  totalPrice: number;
  editingItemId: string | null;
  currentUserId: string | null;

  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  batchClearCart: () => void; // NEW: Optimized batch clear
  setEditingItem: (itemId: string | null) => void;
  updateItem: (itemId: string, updatedItem: CartItem) => void;

  setCurrentUser: (userId: string | null) => void;
  migrateGuestCart: (guestItems: CartItem[]) => void;

  getTotalItems: () => number;
  hasCustomizations: (item: CartItem) => boolean;
  getMenuItemQuantity: (menuItemId: string, restaurantId?: string) => number;
  getRestaurantItemCount: (restaurantId: string) => number;
}

// OPTIMIZED: Cached helper functions
const getBaseItemId = (itemId: string): string => itemId.split("-")[0];

const createItemKey = (item: CartItem): string => {
  const baseId = getBaseItemId(item.id);
  const restaurantIdentifier = item.placeId || item.restaurantId || "";

  return JSON.stringify({
    baseId,
    restaurant: restaurantIdentifier,
    unitPrice: item.price,
    selectedOptions: {
      size: item.selectedOptions?.size || null,
      requiredOptions: item.selectedOptions?.requiredOptions || {},
      optionalOptions: (item.selectedOptions?.optionalOptions || []).sort(),
      notes: item.selectedOptions?.notes?.trim() || null,
    },
  });
};

const calculateTotalPrice = (items: CartItem[]): number =>
  items.reduce(
    (sum, item) => sum + item.totalPriceWithModifiers * item.quantity,
    0
  );

const getStorageKey = (userId: string | null): string =>
  userId ? `cart-storage-${userId}` : "cart-storage-guest";

// OPTIMIZED: Create cart store with better performance
const createCartStore = (userId: string | null) => {
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

        migrateGuestCart: (guestItems: CartItem[]) => {
          const { items } = get();
          if (items.length === 0 && guestItems.length > 0) {
            const totalPrice = calculateTotalPrice(guestItems);
            set({ items: guestItems, totalPrice });
          }
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

        getMenuItemQuantity: (menuItemId: string, restaurantId?: string) => {
          const { items } = get();
          return items
            .filter((item) => {
              const baseId = getBaseItemId(item.id);
              const itemRestaurantId = item.placeId || item.restaurantId || "";
              return (
                baseId === menuItemId &&
                (!restaurantId || itemRestaurantId === restaurantId)
              );
            })
            .reduce((total, item) => total + item.quantity, 0);
        },

        getRestaurantItemCount: (restaurantId: string) => {
          const { items } = get();
          return items
            .filter((item) => {
              const itemRestaurantId = item.placeId || item.restaurantId || "";
              return itemRestaurantId === restaurantId;
            })
            .reduce((total, item) => total + item.quantity, 0);
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
              lastModified: new Date(),
            };
          } else {
            updatedItems = [...items, { ...item, addedAt: new Date() }];
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
          if (quantity <= 0) {
            get().removeItem(itemId);
            return;
          }

          const { items } = get();
          const updatedItems = items.map((item) =>
            item.id === itemId
              ? { ...item, quantity, lastModified: new Date() }
              : item
          );
          const totalPrice = calculateTotalPrice(updatedItems);
          set({ items: updatedItems, totalPrice });
        },

        // OPTIMIZED: Standard clear (maintains backward compatibility)
        clearCart: () => {
          set({ items: [], totalPrice: 0, editingItemId: null });
        },

        // NEW: Batch clear - single atomic operation
        batchClearCart: () => {
          set(
            {
              items: [],
              totalPrice: 0,
              editingItemId: null,
            },
            true // Replace state completely
          );
        },

        getTotalItems: () => {
          const { items } = get();
          return items.reduce((total, item) => total + item.quantity, 0);
        },
      }),
      {
        name: getStorageKey(userId),
        version: 1,
        partialize: (state) => ({
          items: state.items,
          totalPrice: state.totalPrice,
          editingItemId: state.editingItemId,
        }),
      }
    )
  );
};

// OPTIMIZED: Store instances with automatic cleanup
const cartStoreInstances = new Map<
  string,
  {
    store: ReturnType<typeof createCartStore>;
    lastAccessed: number;
  }
>();

// Cleanup old instances every 5 minutes
if (typeof window !== "undefined") {
  const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const INSTANCE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  setInterval(() => {
    const now = Date.now();
    cartStoreInstances.forEach((instance, key) => {
      if (now - instance.lastAccessed > INSTANCE_TIMEOUT) {
        cartStoreInstances.delete(key);
      }
    });
  }, CLEANUP_INTERVAL);
}

const getStoreKey = (userId: string | null): string => userId || "guest";

const getOrCreateStoreInstance = (userId: string | null) => {
  const storeKey = getStoreKey(userId);

  if (!cartStoreInstances.has(storeKey)) {
    cartStoreInstances.set(storeKey, {
      store: createCartStore(userId),
      lastAccessed: Date.now(),
    });
  }

  const instance = cartStoreInstances.get(storeKey)!;
  instance.lastAccessed = Date.now();
  return instance;
};

// Main hook
export const useCartStore = (userId: string | null = null) => {
  const instance = getOrCreateStoreInstance(userId);
  return instance.store();
};

// OPTIMIZED: Switch user cart with batch operations
export const switchUserCart = (newUserId: string | null) => {
  let guestItems: CartItem[] = [];

  if (newUserId && cartStoreInstances.has("guest")) {
    const guestInstance = cartStoreInstances.get("guest")!;
    guestItems = guestInstance.store.getState().items;
  }

  const instance = getOrCreateStoreInstance(newUserId);

  if (newUserId && guestItems.length > 0) {
    instance.store.getState().migrateGuestCart(guestItems);
    const guestInstance = cartStoreInstances.get("guest");
    if (guestInstance) {
      guestInstance.store.getState().batchClearCart();
    }
  }

  return instance.store;
};

// OPTIMIZED: Clear with immediate localStorage removal
export const clearUserCart = (userId: string | null) => {
  const storeKey = getStoreKey(userId);
  const storageKey = getStorageKey(userId);

  // Remove from memory
  cartStoreInstances.delete(storeKey);

  // Remove from localStorage immediately
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(storageKey);

      // Force garbage collection hint (if available)
      if (typeof window.gc === "function") {
        window.gc();
      }
    } catch (error) {
      console.error("Error clearing cart localStorage:", error);
    }
  }
};

// OPTIMIZED: Fast item count without hydrating full store
export const getCurrentCartItemsCount = (userId: string | null): number => {
  try {
    const storeKey = getStoreKey(userId);
    const instance = cartStoreInstances.get(storeKey);

    if (!instance) {
      // Fast path: check localStorage directly without hydrating
      const storageKey = getStorageKey(userId);
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        const data = JSON.parse(stored);
        const items = data?.state?.items || [];
        return items.reduce(
          (total: number, item: CartItem) => total + (item.quantity || 0),
          0
        );
      }

      return 0;
    }

    return instance.store.getState().getTotalItems();
  } catch (error) {
    return 0;
  }
};

// Event listeners for auth state changes
if (typeof window !== "undefined") {
  window.addEventListener("auth-logout", (event: CustomEvent) => {
    const { userId } = event.detail;
    clearUserCart(userId);
  });

  window.addEventListener("auth-login", (event: CustomEvent) => {
    const { userId } = event.detail;
    const guestInstance = cartStoreInstances.get("guest");

    if (guestInstance) {
      const guestItems = guestInstance.store.getState().items;
      if (guestItems.length > 0) {
        const userInstance = getOrCreateStoreInstance(userId);
        userInstance.store.getState().migrateGuestCart(guestItems);
        guestInstance.store.getState().batchClearCart();
      }
    }
  });
}
