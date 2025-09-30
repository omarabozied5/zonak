import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "../types/types";
import { ValidatedCoupon } from "../lib/couponUtils";

export interface PaymentState {
  cartSnapshot: string | null;
  restorationAttempts: number;
  maxRestorationAttempts: number;
  orderId: string | null;
  paymentUrl: string | null;
  paymentStatus: "pending" | "processing" | "success" | "failed" | null;

  checkoutData: {
    items: CartItem[];
    totalPrice: number;
    appliedCoupon: ValidatedCoupon | null;
    couponDiscountAmount: number;
    total: number;
    paymentType: number;
    notes: string;
    userInfo: any;
    // Additional form state preservation
    formState?: {
      notes: string;
      paymentType: number;
      couponCode: string;
    };
  } | null;

  paymentInitiatedAt: number | null;
  lastUpdated: number | null;
  // Track navigation away from app
  leftAppForPayment: boolean;
  paymentReturnDetected: boolean;
}

interface PaymentStore extends PaymentState {
  initiatePay: (
    checkoutData: PaymentState["checkoutData"],
    orderId: string,
    paymentUrl: string,
    cartSnapshot?: string
  ) => void;

  setPaymentStatus: (status: PaymentState["paymentStatus"]) => void;
  restoreCheckoutState: () => PaymentState["checkoutData"];
  clearPaymentState: () => void;
  isPaymentInProgress: () => boolean;
  hasFailedPayment: () => boolean;

  getTimeSincePaymentInitiated: () => number | null;
  isPaymentExpired: (maxMinutes?: number) => boolean;

  restoreCheckoutWithValidation: () => {
    checkoutData: PaymentState["checkoutData"];
    isValid: boolean;
    validationMessage: string;
  };

  incrementRestorationAttempt: () => void;
  canAttemptRestoration: () => boolean;

  // New methods for better state management
  markLeftAppForPayment: () => void;
  markPaymentReturnDetected: () => void;
  shouldShowRestorationPrompt: () => boolean;
  updateCheckoutFormState: (formState: {
    notes: string;
    paymentType: number;
    couponCode: string;
  }) => void;
}

// Helper function to create cart snapshot with more details
const createCartSnapshot = (items: CartItem[]): string => {
  const snapshot = items.map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
    originalPrice: item.originalPrice,
    selectedOptions: item.selectedOptions,
    restaurantId: item.restaurantId,
    placeId: item.placeId,
    name: item.name,
    // Include timestamps for validation
    addedAt: item.addedAt,
    lastModified: item.lastModified,
  }));

  return JSON.stringify({
    items: snapshot,
    timestamp: Date.now(),
    version: "1.0",
  });
};

// Enhanced validation function
const validateCartSnapshot = (items: CartItem[], snapshot: string): boolean => {
  try {
    const parsed = JSON.parse(snapshot);
    const snapshotItems = parsed.items || [];

    if (items.length !== snapshotItems.length) {
      console.log("Cart length mismatch", {
        current: items.length,
        snapshot: snapshotItems.length,
      });
      return false;
    }

    // Check if snapshot is too old (more than 1 hour)
    const snapshotAge = Date.now() - (parsed.timestamp || 0);
    if (snapshotAge > 60 * 60 * 1000) {
      console.log("Cart snapshot too old", { age: snapshotAge });
      return false;
    }

    return items.every((currentItem, index) => {
      const snapshotItem = snapshotItems[index];
      const isValid =
        currentItem.id === snapshotItem.id &&
        currentItem.quantity === snapshotItem.quantity &&
        currentItem.price === snapshotItem.price &&
        currentItem.restaurantId === snapshotItem.restaurantId &&
        currentItem.placeId === snapshotItem.placeId;

      if (!isValid) {
        console.log("Item validation failed", { currentItem, snapshotItem });
      }

      return isValid;
    });
  } catch (error) {
    console.error("Snapshot validation error:", error);
    return false;
  }
};

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      orderId: null,
      paymentUrl: null,
      paymentStatus: null,
      checkoutData: null,
      paymentInitiatedAt: null,
      lastUpdated: null,
      cartSnapshot: null,
      restorationAttempts: 0,
      maxRestorationAttempts: 3,
      leftAppForPayment: false,
      paymentReturnDetected: false,

      initiatePay: (checkoutData, orderId, paymentUrl, cartSnapshot) => {
        const now = Date.now();
        const snapshot =
          cartSnapshot || createCartSnapshot(checkoutData?.items || []);

        set({
          checkoutData,
          orderId,
          paymentUrl,
          paymentStatus: "processing",
          paymentInitiatedAt: now,
          lastUpdated: now,
          cartSnapshot: snapshot,
          restorationAttempts: 0,
          leftAppForPayment: true,
          paymentReturnDetected: false,
        });

        console.log("💳 Payment initiated:", {
          orderId,
          itemsCount: checkoutData?.items.length,
          total: checkoutData?.total,
          coupon: checkoutData?.appliedCoupon?.code,
        });
      },

      markLeftAppForPayment: () => {
        set({ leftAppForPayment: true });
      },

      markPaymentReturnDetected: () => {
        set({ paymentReturnDetected: true });
      },

      shouldShowRestorationPrompt: () => {
        const { leftAppForPayment, paymentReturnDetected, checkoutData } =
          get();
        return leftAppForPayment && paymentReturnDetected && !!checkoutData;
      },

      updateCheckoutFormState: (formState) => {
        const { checkoutData } = get();
        if (checkoutData) {
          set({
            checkoutData: {
              ...checkoutData,
              formState,
              notes: formState.notes,
              paymentType: formState.paymentType,
            },
            lastUpdated: Date.now(),
          });
        }
      },

      restoreCheckoutWithValidation: () => {
        const {
          checkoutData,
          cartSnapshot,
          restorationAttempts,
          maxRestorationAttempts,
          paymentInitiatedAt,
        } = get();

        if (!checkoutData) {
          return {
            checkoutData: null,
            isValid: false,
            validationMessage: "لا توجد بيانات محفوظة للاستعادة",
          };
        }

        if (restorationAttempts >= maxRestorationAttempts) {
          return {
            checkoutData: null,
            isValid: false,
            validationMessage: "تم تجاوز الحد الأقصى لمحاولات الاستعادة",
          };
        }

        // Check if payment session is too old (more than 2 hours)
        if (
          paymentInitiatedAt &&
          Date.now() - paymentInitiatedAt > 2 * 60 * 60 * 1000
        ) {
          return {
            checkoutData: null,
            isValid: false,
            validationMessage: "انتهت صلاحية جلسة الدفع",
          };
        }

        // Validate cart snapshot if available
        if (cartSnapshot && checkoutData.items) {
          const isValid = validateCartSnapshot(
            checkoutData.items,
            cartSnapshot
          );

          if (!isValid) {
            return {
              checkoutData,
              isValid: false,
              validationMessage: "تم تعديل السلة منذ آخر محاولة دفع",
            };
          }
        }

        return {
          checkoutData,
          isValid: true,
          validationMessage: "تم التحقق من صحة البيانات بنجاح",
        };
      },

      setPaymentStatus: (status) => {
        const now = Date.now();
        set({
          paymentStatus: status,
          lastUpdated: now,
        });

        if (status === "success") {
          // Auto-clear after success with delay
          setTimeout(() => {
            get().clearPaymentState();
          }, 10000); // 10 seconds
        } else if (status === "failed") {
          // Mark that user returned from failed payment
          set({ paymentReturnDetected: true });
        }

        console.log("💳 Payment status updated:", status);
      },

      incrementRestorationAttempt: () => {
        set((state) => ({
          restorationAttempts: state.restorationAttempts + 1,
          lastUpdated: Date.now(),
        }));
      },

      canAttemptRestoration: () => {
        const { restorationAttempts, maxRestorationAttempts } = get();
        return restorationAttempts < maxRestorationAttempts;
      },

      restoreCheckoutState: () => {
        return get().checkoutData;
      },

      clearPaymentState: () => {
        set({
          orderId: null,
          paymentUrl: null,
          paymentStatus: null,
          checkoutData: null,
          paymentInitiatedAt: null,
          lastUpdated: null,
          cartSnapshot: null,
          restorationAttempts: 0,
          leftAppForPayment: false,
          paymentReturnDetected: false,
        });

        console.log("🧹 Payment state cleared");
      },

      isPaymentInProgress: () => {
        const { paymentStatus } = get();
        return paymentStatus === "processing";
      },

      hasFailedPayment: () => {
        const { paymentStatus } = get();
        return paymentStatus === "failed";
      },

      getTimeSincePaymentInitiated: () => {
        const { paymentInitiatedAt } = get();
        return paymentInitiatedAt ? Date.now() - paymentInitiatedAt : null;
      },

      isPaymentExpired: (maxMinutes = 30) => {
        const timeSince = get().getTimeSincePaymentInitiated();
        return timeSince ? timeSince > maxMinutes * 60 * 1000 : false;
      },
    }),
    {
      name: "payment-storage",
      version: 2, // Increment version for new fields
      partialize: (state) => ({
        orderId: state.orderId,
        paymentUrl: state.paymentUrl,
        paymentStatus: state.paymentStatus,
        checkoutData: state.checkoutData,
        paymentInitiatedAt: state.paymentInitiatedAt,
        lastUpdated: state.lastUpdated,
        cartSnapshot: state.cartSnapshot,
        restorationAttempts: state.restorationAttempts,
        leftAppForPayment: state.leftAppForPayment,
        paymentReturnDetected: state.paymentReturnDetected,
      }),
    }
  )
);
