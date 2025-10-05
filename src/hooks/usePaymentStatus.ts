// usePaymentStatus.ts - Enhanced hook for payment status management
import { useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { usePaymentStore } from "../stores/usePaymentStore";
import { useCartStore } from "../stores/useCartStore";
import { useAuthStore } from "../stores/useAuthStore";

interface PaymentStatusConfig {
  autoRedirect?: boolean;
  redirectDelay?: number;
  onPaymentSuccess?: (paymentId: string, orderId: string) => void;
  onPaymentFailed?: (reason?: string) => void;
  onRestoreNeeded?: () => void;
}

export const usePaymentStatus = (config: PaymentStatusConfig = {}) => {
  const {
    autoRedirect = true,
    redirectDelay = 3000,
    onPaymentSuccess,
    onPaymentFailed,
    onRestoreNeeded,
  } = config;

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const cartStore = useCartStore(user?.id);
  const processedRef = useRef<Set<string>>(new Set());

  const {
    setPaymentStatus,
    clearPaymentState,
    hasFailedPayment,
    restoreCheckoutWithValidation,
    markPaymentReturnDetected,
    checkoutData,
  } = usePaymentStore();

  // Enhanced payment detection based on your backend URLs
  const detectPaymentResult = useCallback(() => {
    const currentUrl = window.location.href.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);

    // console.log("🔍 Detecting payment result:", {
    //   url: currentUrl,
    //   pathname,
    //   params: searchParams.toString(),
    // });

    // Success detection patterns based on your backend
    if (
      pathname.includes("/success/payment/") ||
      searchParams.get("paymentId") ||
      searchParams.get("Id") ||
      currentUrl.includes("success/payment")
    ) {
      const paymentId =
        searchParams.get("paymentId") ||
        searchParams.get("Id") ||
        extractPaymentIdFromPath(pathname);

      const orderId =
        searchParams.get("order_id") ||
        checkoutData?.orderId ||
        extractOrderIdFromPath(pathname);

      return {
        status: "success" as const,
        paymentId: paymentId || "unknown",
        orderId: orderId || "unknown",
      };
    }

    // Failure detection patterns
    if (
      pathname.includes("/failed/payment/") ||
      pathname.includes("/failure/payment/") ||
      pathname.includes("/payment/failed") ||
      searchParams.get("payment") === "failed" ||
      searchParams.get("status") === "failed" ||
      searchParams.has("error") ||
      currentUrl.includes("failed/payment")
    ) {
      const reason =
        searchParams.get("error") ||
        searchParams.get("reason") ||
        "Payment failed";

      return {
        status: "failed" as const,
        reason,
      };
    }

    // Restoration needed
    if (
      pathname === "/checkout" &&
      searchParams.get("payment_failed") === "true"
    ) {
      return { status: "restore" as const };
    }

    return { status: "none" as const };
  }, [checkoutData, location]);

  const extractPaymentIdFromPath = (pathname: string): string | null => {
    const match = pathname.match(/\/success\/payment\/([^/?]+)/);
    return match ? match[1] : null;
  };

  const extractOrderIdFromPath = (pathname: string): string | null => {
    // Try to extract order ID from various URL patterns
    const patterns = [
      /\/order\/(\d+)/,
      /order_id[=/](\d+)/,
      /orderId[=/](\d+)/,
    ];

    for (const pattern of patterns) {
      const match = pathname.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handlePaymentSuccess = useCallback(
    async (paymentId: string, orderId: string) => {
      // console.log("🎉 Payment Success Handler:", { paymentId, orderId });

      setPaymentStatus("success");
      markPaymentReturnDetected();

      toast.success("تم الدفع بنجاح! 🎉", {
        duration: 4000,
        description: `رقم الدفعة: ${paymentId}`,
      });

      // CRITICAL: Clear cart only on successful payment
      try {
        cartStore.clearCart();
        // console.log("✅ Cart cleared after successful payment");

        // Optional: Clear any saved checkout data
        setTimeout(() => clearPaymentState(), 5000);
      } catch (error) {
        // console.error("Error clearing cart:", error);
      }

      // Call custom callback
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentId, orderId);
      }

      // Auto-redirect to orders page
      if (autoRedirect) {
        setTimeout(() => {
          navigate("/current-orders", {
            replace: true,
            state: {
              fromPayment: true,
              paymentSuccess: true,
              paymentId,
              orderId,
              timestamp: Date.now(),
            },
          });
        }, redirectDelay);
      }
    },
    [
      setPaymentStatus,
      markPaymentReturnDetected,
      cartStore,
      clearPaymentState,
      onPaymentSuccess,
      autoRedirect,
      navigate,
      redirectDelay,
    ]
  );

  const handlePaymentFailed = useCallback(
    async (reason?: string) => {
      // console.log("❌ Payment Failed Handler:", { reason });

      setPaymentStatus("failed");
      markPaymentReturnDetected();

      toast.error("فشل في عملية الدفع", {
        duration: 5000,
        description: reason || "يرجى المحاولة مرة أخرى",
      });

      // CRITICAL: DO NOT clear cart on payment failure
      console.log("⚠️ Cart preserved due to payment failure");

      // Show restoration message if data available
      if (checkoutData) {
        toast.info("سيتم استعادة بيانات طلبك السابق", {
          duration: 3000,
        });
      }

      // Call custom callback
      if (onPaymentFailed) {
        onPaymentFailed(reason);
      }

      // Auto-redirect back to checkout with restoration flag
      if (autoRedirect) {
        setTimeout(() => {
          navigate("/checkout?payment_failed=true", {
            replace: true,
            state: {
              fromPayment: true,
              paymentFailed: true,
              reason,
              timestamp: Date.now(),
            },
          });
        }, redirectDelay);
      }
    },
    [
      setPaymentStatus,
      markPaymentReturnDetected,
      checkoutData,
      onPaymentFailed,
      autoRedirect,
      navigate,
      redirectDelay,
    ]
  );

  const handleRestoreCheckout = useCallback(async () => {
    // console.log("🔄 Restore Checkout Handler");

    if (!hasFailedPayment()) {
      // console.log("No failed payment to restore");
      return;
    }

    try {
      const {
        checkoutData: restored,
        isValid,
        validationMessage,
      } = restoreCheckoutWithValidation();

      if (restored && isValid) {
        toast.success("تم استعادة بيانات الطلب بنجاح", {
          duration: 3000,
        });

        if (onRestoreNeeded) {
          onRestoreNeeded();
        }
      } else {
        toast.warning(validationMessage || "فشل في استعادة بيانات الطلب", {
          duration: 4000,
        });
      }
    } catch (error) {
      // console.error("Restoration error:", error);
      toast.error("خطأ في استعادة بيانات الطلب");
    }
  }, [hasFailedPayment, restoreCheckoutWithValidation, onRestoreNeeded]);

  // Main effect for payment status detection
  useEffect(() => {
    const navigationKey = `${location.pathname}-${
      location.search
    }-${Date.now()}`;

    // Prevent duplicate processing
    if (processedRef.current.has(navigationKey)) {
      return;
    }

    processedRef.current.add(navigationKey);

    const result = detectPaymentResult();

    switch (result.status) {
      case "success":
        handlePaymentSuccess(result.paymentId, result.orderId);
        break;
      case "failed":
        handlePaymentFailed(result.reason);
        break;
      case "restore":
        handleRestoreCheckout();
        break;
      default:
        // No payment status detected
        break;
    }

    // Cleanup old processed keys
    if (processedRef.current.size > 10) {
      const keys = Array.from(processedRef.current);
      processedRef.current.clear();
      keys.slice(-5).forEach((key) => processedRef.current.add(key));
    }
  }, [
    location.pathname,
    location.search,
    detectPaymentResult,
    handlePaymentSuccess,
    handlePaymentFailed,
    handleRestoreCheckout,
  ]);

  // Return utility functions for manual control
  return {
    handlePaymentSuccess,
    handlePaymentFailed,
    handleRestoreCheckout,
    detectPaymentResult,
    isProcessingPayment: hasFailedPayment(),
    hasCheckoutData: !!checkoutData,
  };
};
