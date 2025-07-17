import { useMemo } from "react";
import { CartSummary, CartItem } from "@/components/Cart/types";

export const useCartSummary = (items: CartItem[]): CartSummary => {
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

    return {
      totalItems,
      totalPrice,
      restaurantGroups,
      restaurantCount,
      hasMultipleRestaurants,
      isEmpty,
    };
  }, [items]);
};
