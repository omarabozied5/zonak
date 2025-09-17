import { useMemo } from "react";
import { CartItem } from "@/types/types";
import { CartValidation } from "@/types/types";
export const useCartValidation = (items: CartItem[]): CartValidation => {
  return useMemo(() => {
    const validationErrors: string[] = [];

    // Check if cart is empty
    if (items.length === 0) {
      validationErrors.push("السلة فارغة");
    }

    // Check for multiple restaurants
    const restaurantIds = [...new Set(items.map((item) => item.restaurantId))];
    if (restaurantIds.length > 1) {
      validationErrors.push("لا يمكن الطلب من أكثر من مطعم في نفس الوقت");
    }

    // Check for invalid quantities
    const hasInvalidQuantities = items.some((item) => item.quantity <= 0);
    if (hasInvalidQuantities) {
      validationErrors.push("كمية غير صحيحة لبعض الأصناف");
    }

    // Check for missing required data
    const hasMissingData = items.some(
      (item) =>
        !item.name ||
        item.price === undefined ||
        item.price === null ||
        !item.restaurantId
    );
    if (hasMissingData) {
      validationErrors.push("بيانات ناقصة لبعض الأصناف");
    }

    const canProceedToCheckout = validationErrors.length === 0;
    const isCheckoutDisabled = !canProceedToCheckout;

    return {
      canProceedToCheckout,
      validationErrors,
      isCheckoutDisabled,
    };
  }, [items]);
};
