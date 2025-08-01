import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { apiService } from "@/services/apiService";
import { CartItem } from "@/components/Cart/types";

interface UnavailableItem {
  id: string;
  name: string;
  restaurantName: string;
  reason: "not_found" | "not_available" | "api_error";
}

interface UseCartAvailabilityCheckReturn {
  isCheckingAvailability: boolean;
  unavailableItems: UnavailableItem[];
  isItemAvailable: (itemId: string) => boolean;
  removeUnavailableItem: (itemId: string) => void;
  recheckAvailability: () => Promise<void>;
  lastChecked: Date | null;
}

export const useCartAvailabilityCheck = (
  cartItems: CartItem[],
  removeItem: (itemId: string) => void
): UseCartAvailabilityCheckReturn => {
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [unavailableItems, setUnavailableItems] = useState<UnavailableItem[]>(
    []
  );
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Use refs to prevent infinite loops
  const previousItemIdsRef = useRef<string[]>([]);
  const checkInProgressRef = useRef(false);

  // Memoize current item IDs to prevent unnecessary re-renders
  const currentItemIds = useMemo(
    () => cartItems.map((item) => item.id).sort(),
    [cartItems]
  );

  // Memoize items by restaurant to optimize API calls
  const itemsByRestaurant = useMemo(() => {
    const grouped: Record<
      string,
      { userId: string; placeId: number; items: CartItem[] }
    > = {};

    cartItems.forEach((item) => {
      const key = `${item.restaurantId}-${item.restaurantId}`;
      if (!grouped[key]) {
        grouped[key] = {
          userId: item.userId,
          placeId: item.restaurantId,
          items: [],
        };
      }
      grouped[key].items.push(item);
    });

    return grouped;
  }, [cartItems]);

  const checkItemAvailability = useCallback(
    async (
      userId: string,
      placeId: number,
      items: CartItem[]
    ): Promise<UnavailableItem[]> => {
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const menuData = await apiService.fetchMenuItems(userId, placeId);
        clearTimeout(timeoutId);

        if (!menuData?.items) {
          console.warn(`No menu items returned for place ${placeId}`);
          // Instead of marking all as errors, return empty array and let items remain "available"
          return [];
        }

        const unavailable: UnavailableItem[] = [];

        items.forEach((cartItem) => {
          const baseItemId = cartItem.id.split("-")[0];
          const menuItem = menuData.items.find(
            (item: any) => item.id.toString() === baseItemId
          );

          if (!menuItem) {
            unavailable.push({
              id: cartItem.id,
              name: cartItem.name,
              restaurantName: cartItem.restaurantName || "Unknown Restaurant",
              reason: "not_found",
            });
          } else if (!menuItem.is_available) {
            unavailable.push({
              id: cartItem.id,
              name: cartItem.name,
              restaurantName: cartItem.restaurantName || "Unknown Restaurant",
              reason: "not_available",
            });
          }
        });

        return unavailable;
      } catch (error) {
        console.error("Error checking availability:", error);

        // Only mark as API error if it's a network/server error
        if (error.name === "AbortError") {
          console.warn("Availability check timed out");
        }

        // Instead of marking all items as errors, return empty array
        // This allows normal cart operations to continue
        return [];
      }
    },
    []
  );
  const checkAllItemsAvailability = useCallback(async () => {
    if (checkInProgressRef.current || cartItems.length === 0) {
      return;
    }

    checkInProgressRef.current = true;
    setIsCheckingAvailability(true);

    try {
      const allUnavailableItems: UnavailableItem[] = [];

      // Check each restaurant group
      for (const [, restaurantGroup] of Object.entries(itemsByRestaurant)) {
        const unavailable = await checkItemAvailability(
          restaurantGroup.userId,
          restaurantGroup.placeId,
          restaurantGroup.items
        );
        allUnavailableItems.push(...unavailable);
      }

      setUnavailableItems(allUnavailableItems);
      setLastChecked(new Date());
    } catch (error) {
      console.error("Error during availability check:", error);
    } finally {
      setIsCheckingAvailability(false);
      checkInProgressRef.current = false;
    }
  }, [itemsByRestaurant, checkItemAvailability]);

  // Check if items have changed (by comparing sorted IDs)
  const itemsChanged = useMemo(() => {
    const prev = previousItemIdsRef.current;
    const current = currentItemIds;

    if (prev.length !== current.length) return true;
    return prev.some((id, index) => id !== current[index]);
  }, [currentItemIds]);

  // Main effect to check availability when items change
  useEffect(() => {
    if (itemsChanged && cartItems.length > 0) {
      previousItemIdsRef.current = currentItemIds;

      // Debounce the check to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        checkAllItemsAvailability();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [
    itemsChanged,
    currentItemIds,
    cartItems.length,
    checkAllItemsAvailability,
  ]);

  // Clean up unavailable items when cart items are removed
  useEffect(() => {
    setUnavailableItems((prev) =>
      prev.filter((unavailableItem) =>
        cartItems.some((cartItem) => cartItem.id === unavailableItem.id)
      )
    );
  }, [cartItems]);

  const isItemAvailable = useCallback(
    (itemId: string): boolean => {
      return !unavailableItems.some((item) => item.id === itemId);
    },
    [unavailableItems]
  );

  const removeUnavailableItem = useCallback(
    (itemId: string) => {
      removeItem(itemId);
      setUnavailableItems((prev) => prev.filter((item) => item.id !== itemId));
    },
    [removeItem]
  );

  const recheckAvailability = useCallback(async () => {
    await checkAllItemsAvailability();
  }, [checkAllItemsAvailability]);

  return {
    isCheckingAvailability,
    unavailableItems,
    isItemAvailable,
    removeUnavailableItem,
    recheckAvailability,
    lastChecked,
  };
};
