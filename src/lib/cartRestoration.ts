import { CartItem } from "../types/types";
import { useCartStore } from "../stores/useCartStore";
import { toast } from "sonner";

export interface RestorationResult {
  success: boolean;
  message: string;
  restoredItemsCount: number;
  failedItems: CartItem[];
}

export class CartRestorationManager {
  static async restoreCartItems(
    items: CartItem[],
    userId: string | null
  ): Promise<RestorationResult> {
    if (!items || items.length === 0) {
      return {
        success: true,
        message: "لا توجد عناصر للاستعادة",
        restoredItemsCount: 0,
        failedItems: [],
      };
    }

    const cartStore = useCartStore(userId);
    const failedItems: CartItem[] = [];
    let restoredCount = 0;

    try {
      // Clear existing cart first
      cartStore.clearCart();

      // Validate and restore each item
      for (const item of items) {
        try {
          // Validate item before restoration
          if (this.validateCartItem(item)) {
            cartStore.addItem(item);
            restoredCount++;
          } else {
            failedItems.push(item);
          }
        } catch (error) {
          console.error(`Failed to restore item: ${item.name}`, error);
          failedItems.push(item);
        }
      }

      const success = restoredCount > 0;
      const message = success
        ? `تم استعادة ${restoredCount} عنصر من السلة السابقة`
        : "فشل في استعادة عناصر السلة";

      if (failedItems.length > 0) {
        console.warn(
          `Failed to restore ${failedItems.length} items:`,
          failedItems
        );
      }

      return {
        success,
        message,
        restoredItemsCount: restoredCount,
        failedItems,
      };
    } catch (error) {
      console.error("Cart restoration failed:", error);
      return {
        success: false,
        message: "فشل في استعادة السلة السابقة",
        restoredItemsCount: 0,
        failedItems: items,
      };
    }
  }
}

// Hook to handle cart restoration with proper React Hook usage
export const useCartRestoration = () => {
  const restoreCartItems = async (
    items: CartItem[],
    userId: string | null,
    cartStore: any // Pass the cart store from the component
  ): Promise<RestorationResult> => {
    if (!items || items.length === 0) {
      return {
        success: true,
        message: "لا توجد عناصر للاستعادة",
        restoredItemsCount: 0,
        failedItems: [],
      };
    }

    try {
      // Clear existing cart first
      cartStore.clearCart();

      // Process items using the static helper
      const { validItems, invalidItems } =
        CartRestorationManager.processItemsForRestoration(items);

      // Add valid items to cart
      let restoredCount = 0;
      for (const item of validItems) {
        try {
          cartStore.addItem(item);
          restoredCount++;
        } catch (error) {
          console.error(`Failed to restore item: ${item.name}`, error);
          invalidItems.push(item);
        }
      }

      const success = restoredCount > 0;
      const message = success
        ? `تم استعادة ${restoredCount} عنصر من السلة السابقة`
        : "فشل في استعادة عناصر السلة";

      if (invalidItems.length > 0) {
        console.warn(
          `Failed to restore ${invalidItems.length} items:`,
          invalidItems
        );
      }

      return {
        success,
        message,
        restoredItemsCount: restoredCount,
        failedItems: invalidItems,
      };
    } catch (error) {
      console.error("Cart restoration failed:", error);
      return {
        success: false,
        message: "فشل في استعادة السلة السابقة",
        restoredItemsCount: 0,
        failedItems: items,
      };
    }
  };

  const restoreCart = async (
    items: CartItem[],
    userId: string | null,
    cartStore: any
  ) => {
    const result = await restoreCartItems(items, userId, cartStore);

    if (result.success) {
      toast.success(result.message);

      if (result.failedItems.length > 0) {
        toast.warning(
          `تعذر استعادة ${result.failedItems.length} عنصر. قد تكون غير متوفرة`
        );
      }
    } else {
      toast.error(result.message);
    }

    return result;
  };

  return { restoreCart, restoreCartItems };
};
