// usePaymentRestoration.ts - Hook for handling payment restoration
import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { usePaymentStore } from "@/stores/usePaymentStore";
import { useCartStore } from "@/stores/useCartStore";
import { CartItem } from "@/types/types";

interface RestorationResult {
  success: boolean;
  restoredItemsCount: number;
  skippedItemsCount: number;
  errors: string[];
}

export const usePaymentRestoration = (userId: string | null) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const cartStore = useCartStore(userId);
  const [isRestoring, setIsRestoring] = useState(false);

  const {
    restoreCheckoutWithValidation,
    incrementRestorationAttempt,
    canAttemptRestoration,
    hasFailedPayment,
    clearPaymentState,
    setPaymentStatus,
  } = usePaymentStore();

  // Check if we need to restore checkout data
  useEffect(() => {
    const paymentFailed = searchParams.get("payment_failed") === "true";
    const autoRedirected = searchParams.get("auto_redirect") === "true";
    const fromFailedPayment = location.state?.fromFailedPayment;

    if (paymentFailed || fromFailedPayment) {
      handlePaymentFailureRestoration();
    }
  }, [searchParams, location.state]);

  const restoreCartItems = async (
    items: CartItem[]
  ): Promise<RestorationResult> => {
    const result: RestorationResult = {
      success: false,
      restoredItemsCount: 0,
      skippedItemsCount: 0,
      errors: [],
    };

    if (!items || items.length === 0) {
      result.errors.push("لا توجد عناصر للاستعادة");
      return result;
    }

    try {
      // Clear current cart first
      cartStore.clearCart();

      // Restore items one by one with validation
      for (const item of items) {
        try {
          // Validate item before adding
          if (!item.id || !item.name || !item.price || item.quantity <= 0) {
            result.skippedItemsCount++;
            result.errors.push(`تخطي العنصر: ${item.name || "عنصر غير صالح"}`);
            continue;
          }

          // Add item to cart
          cartStore.addItem({
            ...item,
            // Reset timestamps
            addedAt: new Date(),
            lastModified: new Date(),
          });

          result.restoredItemsCount++;
        } catch (itemError) {
          result.skippedItemsCount++;
          result.errors.push(
            `فشل في استعادة العنصر ${item.name}: ${
              itemError instanceof Error ? itemError.message : "خطأ غير معروف"
            }`
          );
        }
      }

      result.success = result.restoredItemsCount > 0;

      console.log("Cart restoration result:", {
        totalItems: items.length,
        restored: result.restoredItemsCount,
        skipped: result.skippedItemsCount,
        errors: result.errors,
      });

      return result;
    } catch (error) {
      result.errors.push(
        `خطأ عام في الاستعادة: ${
          error instanceof Error ? error.message : "خطأ غير معروف"
        }`
      );
      return result;
    }
  };

  const handlePaymentFailureRestoration = async () => {
    console.log("🔄 Starting payment failure restoration...");

    if (!hasFailedPayment()) {
      console.log("No failed payment state found");
      return;
    }

    if (!canAttemptRestoration()) {
      toast.error("تم تجاوز الحد الأقصى لمحاولات الاستعادة");
      clearPaymentState();
      return;
    }

    setIsRestoring(true);

    try {
      const {
        checkoutData: restoredData,
        isValid,
        validationMessage,
      } = restoreCheckoutWithValidation();

      if (!restoredData) {
        toast.error("لا توجد بيانات محفوظة للاستعادة");
        return;
      }

      if (!isValid) {
        toast.warning(validationMessage, { duration: 5000 });
        incrementRestorationAttempt();
        return;
      }

      // Show restoration start message
      toast.info("جاري استعادة بيانات طلبك السابق...", { duration: 2000 });

      // Restore cart if empty and we have items
      if (cartStore.items.length === 0 && restoredData.items?.length > 0) {
        const restorationResult = await restoreCartItems(restoredData.items);

        if (restorationResult.success) {
          if (restorationResult.skippedItemsCount > 0) {
            toast.warning(
              `تم استعادة ${restorationResult.restoredItemsCount} عنصر، تم تخطي ${restorationResult.skippedItemsCount} عنصر`,
              { duration: 4000 }
            );
          } else {
            toast.success(
              `تم استعادة ${restorationResult.restoredItemsCount} عنصر من السلة السابقة`,
              { duration: 4000 }
            );
          }
        } else {
          toast.error(
            `فشل في استعادة العناصر: ${restorationResult.errors.join(", ")}`,
            { duration: 5000 }
          );
        }
      }

      // Mark restoration attempt
      incrementRestorationAttempt();

      // Update payment status
      setPaymentStatus("failed");

      // Clean up URL parameters
      setTimeout(() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("payment_failed");
        newSearchParams.delete("auto_redirect");
        setSearchParams(newSearchParams, { replace: true });
      }, 2000);

      // Show final restoration message
      toast.success("تم استعادة بيانات طلبك بنجاح! يمكنك المحاولة مرة أخرى", {
        duration: 4000,
      });
    } catch (error) {
      console.error("Restoration failed:", error);
      toast.error("فشل في استعادة بيانات الطلب السابق");
      incrementRestorationAttempt();
    } finally {
      setIsRestoring(false);
    }
  };

  const manualRestoration = async () => {
    if (!canAttemptRestoration()) {
      toast.error("تم تجاوز الحد الأقصى لمحاولات الاستعادة");
      return false;
    }

    setIsRestoring(true);
    await handlePaymentFailureRestoration();
    return true;
  };

  return {
    isRestoring,
    manualRestoration,
    canRestore: canAttemptRestoration(),
    hasFailedPayment: hasFailedPayment(),
  };
};
