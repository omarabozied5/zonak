// hooks/useCheckoutRestoration.ts
import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { usePaymentStore } from "../stores/usePaymentStore";
import { useCartRestoration } from "../lib/cartRestoration";
import { ValidatedCoupon } from "../lib/couponUtils";

interface RestoredFormState {
  notes: string;
  paymentType: number;
  appliedCoupon: ValidatedCoupon | null;
  couponCode: string;
  shouldRestoreForm: boolean;
}

export const useCheckoutRestoration = (
  userId: string | null,
  cartStore: any,
  currentFormState: {
    notes: string;
    paymentType: number;
    couponCode: string;
  }
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { restoreCart } = useCartRestoration();

  const {
    hasFailedPayment,
    restoreCheckoutWithValidation,
    incrementRestorationAttempt,
    canAttemptRestoration,
    clearPaymentState,
    paymentReturnDetected,
    markPaymentReturnDetected,
  } = usePaymentStore();

  const [restorationState, setRestorationState] = useState<RestoredFormState>({
    notes: "",
    paymentType: 1,
    appliedCoupon: null,
    couponCode: "",
    shouldRestoreForm: false,
  });

  // Check for payment failure and restore state
  useEffect(() => {
    const paymentFailed = searchParams.get("payment_failed");
    const isCheckoutPage = location.pathname === "/checkout";

    if (paymentFailed === "true" && isCheckoutPage && hasFailedPayment()) {
      handleCheckoutRestoration();
    }
  }, [searchParams, location.pathname]);

  // Mark payment return when component mounts on checkout with failed payment
  useEffect(() => {
    if (hasFailedPayment() && !paymentReturnDetected) {
      markPaymentReturnDetected();
    }
  }, []);

  const handleCheckoutRestoration = async () => {
    console.log("🔄 Attempting checkout restoration");

    if (!canAttemptRestoration()) {
      toast.error("تم تجاوز الحد الأقصى لمحاولات الاستعادة");
      clearPaymentState();
      // Clean up URL
      setSearchParams((params) => {
        params.delete("payment_failed");
        return params;
      });
      return;
    }

    try {
      const { checkoutData, isValid, validationMessage } =
        restoreCheckoutWithValidation();

      if (!checkoutData) {
        console.log("No checkout data to restore");
        return;
      }

      if (!isValid) {
        toast.warning(validationMessage, { duration: 5000 });
        incrementRestorationAttempt();
        return;
      }

      let restorationSuccess = false;

      // Restore cart items if current cart is empty but we have saved items
      if (cartStore.items.length === 0 && checkoutData.items.length > 0) {
        console.log("Restoring cart items:", checkoutData.items.length);

        const restorationResult = await restoreCart(
          checkoutData.items,
          userId,
          cartStore
        );

        if (restorationResult.success) {
          restorationSuccess = true;
          toast.success(
            `تم استعادة ${restorationResult.restoredItemsCount} عنصر من السلة السابقة`,
            {
              duration: 4000,
            }
          );

          if (restorationResult.failedItems.length > 0) {
            toast.warning(
              `تعذر استعادة ${restorationResult.failedItems.length} عنصر`
            );
          }
        } else {
          toast.error("فشل في استعادة عناصر السلة");
        }
      }

      // Restore form state
      const formState = checkoutData.formState || {
        notes: checkoutData.notes || "",
        paymentType: checkoutData.paymentType || 1,
        couponCode: checkoutData.appliedCoupon?.code || "",
      };

      setRestorationState({
        notes: formState.notes,
        paymentType: formState.paymentType,
        appliedCoupon: checkoutData.appliedCoupon,
        couponCode: formState.couponCode,
        shouldRestoreForm: true,
      });

      // Show restoration info
      if (checkoutData.appliedCoupon) {
        toast.info(`كوبون الخصم السابق: ${checkoutData.appliedCoupon.code}`, {
          duration: 4000,
        });
      }

      if (restorationSuccess || checkoutData.items.length > 0) {
        toast.success("تم استعادة بيانات الطلب السابق", {
          duration: 3000,
        });
      }

      incrementRestorationAttempt();

      // Clean up URL parameters
      setTimeout(() => {
        setSearchParams((params) => {
          params.delete("payment_failed");
          return params;
        });
      }, 2000);
    } catch (error) {
      console.error("Checkout restoration failed:", error);
      toast.error("فشل في استعادة بيانات الطلب السابق");
      incrementRestorationAttempt();
    }
  };

  // Function to apply restored state to form
  const applyRestoredState = (
    setNotes: (notes: string) => void,
    setPaymentType: (type: number) => void,
    setCouponCode: (code: string) => void,
    setAppliedCoupon: (coupon: ValidatedCoupon | null) => void
  ) => {
    if (restorationState.shouldRestoreForm) {
      setNotes(restorationState.notes);
      setPaymentType(restorationState.paymentType);
      setCouponCode(restorationState.couponCode);

      if (restorationState.appliedCoupon) {
        setAppliedCoupon(restorationState.appliedCoupon);
      }

      // Reset the restoration flag
      setRestorationState((prev) => ({ ...prev, shouldRestoreForm: false }));

      console.log("Applied restored form state:", restorationState);
    }
  };

  return {
    restorationState,
    applyRestoredState,
    isRestoring: restorationState.shouldRestoreForm,
    handleCheckoutRestoration,
  };
};
