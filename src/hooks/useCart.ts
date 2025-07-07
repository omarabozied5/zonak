// useCart.ts
import { useCallback, useEffect } from "react";
import { useCartStore, CartItem } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";

export const useCart = () => {
  const { user } = useAuthStore();
  const userId = user?.id || null;

  const {
    items,
    totalPrice,
    editingItemId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    setEditingItem,
    updateItem,
    hasCustomizations,
    getItemQuantity,
    getMenuItemQuantity,
    getMenuItemQuantityByRestaurant,
    getRestaurantItemCount,
    getItemVariants,
    canAddMoreItems,
    getQuantityBreakdown,
    setCurrentUser,
  } = useCartStore(userId);

  // Sync cart with current user
  useEffect(() => {
    setCurrentUser(userId);
  }, [userId, setCurrentUser]);

  // Cart actions
  const addToCart = useCallback(
    (item: CartItem) => {
      addItem(item);
    },
    [addItem]
  );

  const removeFromCart = useCallback(
    (itemId: string) => {
      removeItem(itemId);
    },
    [removeItem]
  );

  const updateItemQuantity = useCallback(
    (itemId: string, quantity: number) => {
      updateQuantity(itemId, quantity);
    },
    [updateQuantity]
  );

  const clearUserCart = useCallback(() => {
    clearCart();
  }, [clearCart]);

  const startEditingItem = useCallback(
    (itemId: string) => {
      setEditingItem(itemId);
    },
    [setEditingItem]
  );

  const cancelEditingItem = useCallback(() => {
    setEditingItem(null);
  }, [setEditingItem]);

  const saveEditedItem = useCallback(
    (itemId: string, updatedItem: CartItem) => {
      updateItem(itemId, updatedItem);
    },
    [updateItem]
  );

  // Helper functions
  const isItemCustomized = useCallback(
    (item: CartItem) => {
      return hasCustomizations(item);
    },
    [hasCustomizations]
  );

  const getItemCount = useCallback(
    (itemId: string, restaurantId: string) => {
      return getItemQuantity(itemId, restaurantId);
    },
    [getItemQuantity]
  );

  const getMenuItemCount = useCallback(
    (menuItemId: string, restaurantId?: string) => {
      return getMenuItemQuantity(menuItemId, restaurantId);
    },
    [getMenuItemQuantity]
  );

  const getMenuItemsByRestaurant = useCallback(
    (menuItemId: string) => {
      return getMenuItemQuantityByRestaurant(menuItemId);
    },
    [getMenuItemQuantityByRestaurant]
  );

  const getRestaurantItemsCount = useCallback(
    (restaurantId: string) => {
      return getRestaurantItemCount(restaurantId);
    },
    [getRestaurantItemCount]
  );

  const getItemVariantsInCart = useCallback(
    (menuItemId: string, restaurantId?: string) => {
      return getItemVariants(menuItemId, restaurantId);
    },
    [getItemVariants]
  );

  const canAddMoreOfItem = useCallback(
    (menuItemId: string, restaurantId: string, maxQuantity?: number) => {
      return canAddMoreItems(menuItemId, restaurantId, maxQuantity);
    },
    [canAddMoreItems]
  );

  const getCartSummary = useCallback(() => {
    return getQuantityBreakdown();
  }, [getQuantityBreakdown]);

  // Computed values
  const totalItems = getTotalItems();
  const isEmpty = totalItems === 0;
  const hasItems = totalItems > 0;
  const isEditing = editingItemId !== null;

  // Group items by restaurant for display
  const itemsByRestaurant = useCallback(() => {
    const grouped: Record<string, CartItem[]> = {};
    items.forEach((item) => {
      if (!grouped[item.restaurantId]) {
        grouped[item.restaurantId] = [];
      }
      grouped[item.restaurantId].push(item);
    });
    return grouped;
  }, [items]);

  // Get unique restaurants in cart
  const restaurantsInCart = useCallback(() => {
    const restaurants = new Set<string>();
    items.forEach((item) => {
      restaurants.add(item.restaurantId);
    });
    return Array.from(restaurants);
  }, [items]);

  // Calculate tax and delivery fee (you can adjust these based on your business logic)
  const getTax = useCallback((subtotal: number) => {
    return Math.round(subtotal * 0.15 * 100) / 100; // 15% tax
  }, []);

  const getDeliveryFee = useCallback((orderType: "pickup" | "delivery") => {
    return orderType === "delivery" ? 10 : 0; // 10 SAR delivery fee
  }, []);

  const getOrderTotal = useCallback(
    (orderType: "pickup" | "delivery") => {
      const tax = getTax(totalPrice);
      const deliveryFee = getDeliveryFee(orderType);
      return {
        subtotal: totalPrice,
        tax,
        deliveryFee,
        total: totalPrice + tax + deliveryFee,
      };
    },
    [totalPrice, getTax, getDeliveryFee]
  );

  return {
    // State
    items,
    totalPrice,
    totalItems,
    isEmpty,
    hasItems,
    isEditing,
    editingItemId,

    // Actions
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearUserCart,
    startEditingItem,
    cancelEditingItem,
    saveEditedItem,

    // Helpers
    isItemCustomized,
    getItemCount,
    getMenuItemCount,
    getMenuItemsByRestaurant,
    getRestaurantItemsCount,
    getItemVariantsInCart,
    canAddMoreOfItem,
    getCartSummary,

    // Display helpers
    itemsByRestaurant,
    restaurantsInCart,

    // Order calculations
    getTax,
    getDeliveryFee,
    getOrderTotal,

    // Current user context
    currentUserId: userId,
    isLoggedIn: !!userId,
  };
};
