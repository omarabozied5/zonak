import { useMemo } from "react";
import { CartSummary, CartItem } from "@/types/types";

// Extended interface for cart summary with restaurant info
export interface EnhancedCartSummary extends CartSummary {
  primaryRestaurant: {
    merchantId: string;
    name: string;
    placeId: string;
  } | null;
}

export const useCartSummary = (items: CartItem[]): EnhancedCartSummary => {
  return useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const restaurantGroups = items.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = 0;
      }
      acc[item.restaurantId] += item.quantity;
      return acc;
    }, {} as Record<string, number>);

    const restaurantCount = Object.keys(restaurantGroups).length;
    const hasMultipleRestaurants = restaurantCount > 1;
    const isEmpty = items.length === 0;

    // Extract primary restaurant info with better ID handling
    const primaryRestaurant =
      items.length > 0
        ? {
            merchantId: items[0].restaurantId,
            name: items[0].restaurantName,
            // Try to get the most reliable place ID
            placeId:
              items[0].placeId &&
              items[0].placeId !== "" &&
              items[0].placeId !== "0"
                ? items[0].placeId
                : items[0].restaurantId, // Fallback to restaurantId if placeId is invalid
          }
        : null;
    // console.log(
    //   "Cart items for summary:",
    //   items.map((item) => ({
    //     id: item.id,
    //     restaurantId: item.restaurantId,
    //     placeId: item.placeId,
    //     restaurantName: item.restaurantName,
    //   }))
    // );

    // Debug logging for cart summary
    // if (items.length > 0) {
    //   console.log("Cart Summary - Debug Info:", {
    //     firstItem: {
    //       restaurantId: items[0].restaurantId,
    //       restaurantName: items[0].restaurantName,
    //       placeId: items[0].placeId,
    //     },
    //     extractedRestaurant: primaryRestaurant,
    //   });
    // }

    return {
      totalItems,
      totalPrice,
      restaurantGroups,
      restaurantCount,
      hasMultipleRestaurants,
      isEmpty,
      primaryRestaurant,
    };
  }, [items]);
};
