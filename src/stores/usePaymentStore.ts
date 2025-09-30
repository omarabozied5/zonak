import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "../types/types";
import { ValidatedCoupon } from "../lib/couponUtils";

export interface PaymentState {
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
  } | null;
  paymentInitiatedAt: number | null;
}

interface PaymentStore extends PaymentState {
  initiatePay: (
    checkoutData: PaymentState["checkoutData"],
    orderId: string,
    paymentUrl: string
  ) => void;
  setPaymentStatus: (status: PaymentState["paymentStatus"]) => void;
  clearPaymentState: () => void;
  isPaymentInProgress: () => boolean;
  markPaymentReturnDetected: () => void;
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      orderId: null,
      paymentUrl: null,
      paymentStatus: null,
      checkoutData: null,
      paymentInitiatedAt: null,

      initiatePay: (checkoutData, orderId, paymentUrl) => {
        set({
          checkoutData,
          orderId,
          paymentUrl,
          paymentStatus: "processing",
          paymentInitiatedAt: Date.now(),
        });
      },

      setPaymentStatus: (status) => {
        set({ paymentStatus: status });
        if (status === "success") {
          setTimeout(() => get().clearPaymentState(), 5000);
        }
      },

      markPaymentReturnDetected: () => {
        set({ paymentStatus: get().paymentStatus || "pending" });
      },

      clearPaymentState: () => {
        set({
          orderId: null,
          paymentUrl: null,
          paymentStatus: null,
          checkoutData: null,
          paymentInitiatedAt: null,
        });
      },

      isPaymentInProgress: () => get().paymentStatus === "processing",
    }),
    { name: "payment-storage", version: 1 }
  )
);
