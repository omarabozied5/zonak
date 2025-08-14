// Enhanced PaymentStatusHandler.tsx - Updated with auto-redirect functionality
import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { usePaymentStore } from "@/stores/usePaymentStore";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartRestoration } from "@/lib/cartRestoration";

const PaymentStatusHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const cartStore = useCartStore(user?.id);
  const { restoreCart } = useCartRestoration();
  const processedRef = useRef<Set<string>>(new Set());
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    setPaymentStatus,
    clearPaymentState,
    hasFailedPayment,
    restoreCheckoutWithValidation,
    incrementRestorationAttempt,
    canAttemptRestoration,
    isPaymentExpired,
    paymentStatus,
    markPaymentReturnDetected,
  } = usePaymentStore();

  // Cleanup function for timeouts and intervals
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const currentUrl = window.location.href.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);

    // Create a more robust navigation key
    const navigationKey = `${pathname}-${searchParams.toString()}-${Math.floor(
      Date.now() / 1000
    )}`;

    // Prevent duplicate processing
    if (processedRef.current.has(navigationKey)) {
      console.log("Already processed this navigation:", navigationKey);
      return;
    }

    processedRef.current.add(navigationKey);

    console.log("🔍 PaymentStatusHandler: Analyzing URL:", {
      fullUrl: currentUrl,
      pathname,
      searchParams: searchParams.toString(),
    });

    // 🔧 ENHANCED: More comprehensive failed payment detection
    const isFailedPayment =
      // Backend payment failure URLs
      pathname.includes("/failed/payment/") ||
      pathname.includes("/payment/failed") ||
      pathname.includes("/payment_failed") ||
      // Query parameters
      searchParams.get("payment") === "failed" ||
      searchParams.get("payment") === "failure" ||
      searchParams.get("status") === "failed" ||
      searchParams.get("result") === "failed" ||
      searchParams.get("payment_status") === "failed" ||
      // URL fragments
      currentUrl.includes("failed/payment") ||
      currentUrl.includes("payment-failed") ||
      currentUrl.includes("payment_failed") ||
      // Check for error codes in URL
      searchParams.has("error") ||
      searchParams.has("payment_error");

    const isSuccessfulPayment =
      pathname.includes("/success/payment/") ||
      pathname.includes("/payment/success") ||
      searchParams.get("payment") === "success" ||
      searchParams.get("status") === "success" ||
      searchParams.get("result") === "success" ||
      currentUrl.includes("success/payment") ||
      currentUrl.includes("payment-success");

    // Handle based on detection
    if (isFailedPayment) {
      console.log("🚨 FAILED PAYMENT DETECTED!");
      handleFailedPaymentWithRedirect();
    } else if (isSuccessfulPayment) {
      console.log("✅ SUCCESSFUL PAYMENT DETECTED!");
      handleSuccessfulPayment();
    } else if (
      pathname === "/checkout" &&
      searchParams.get("payment_failed") === "true"
    ) {
      console.log("🔄 CHECKOUT RESTORATION NEEDED");
      handleCheckoutRestoration();
    }

    // Clean up old navigation keys
    if (processedRef.current.size > 10) {
      const keysArray = Array.from(processedRef.current);
      processedRef.current.clear();
      keysArray.slice(-5).forEach((key) => processedRef.current.add(key));
    }
  }, [location.pathname, location.search, location.hash]);

  // Clean up expired payment states
  useEffect(() => {
    if (paymentStatus === "processing" && isPaymentExpired(30)) {
      console.log("Payment expired, clearing state");
      setPaymentStatus("failed");
    }
  }, [paymentStatus, isPaymentExpired, setPaymentStatus]);

  const handleFailedPaymentWithAutoRedirect = async (): Promise<void> => {
    console.log("🚨💳❌ Payment failure detected - starting enhanced handling");

    setPaymentStatus("failed");
    markPaymentReturnDetected();

    // Show immediate failure notification
    toast.error("فشل في عملية الدفع. جاري إعادة توجيهك للمحاولة مرة أخرى...", {
      duration: 5000,
    });

    // Check for saved checkout data
    const paymentState = usePaymentStore.getState();
    const { checkoutData } = paymentState;

    if (checkoutData) {
      toast.info("سيتم استعادة بيانات طلبك السابق", {
        duration: 3000,
      });

      console.log("📦 Available checkout data for restoration:", {
        itemsCount: checkoutData.items?.length || 0,
        total: checkoutData.total,
        couponCode: checkoutData.appliedCoupon?.code,
        formState: checkoutData.formState,
        notes: checkoutData.notes,
        paymentType: checkoutData.paymentType,
      });
    } else {
      console.warn("⚠️ No checkout data available for restoration");
    }

    // Start auto-redirect with countdown
    startAutoRedirectCountdown();
  };

  const startAutoRedirectCountdown = (): void => {
    let countdown = 3; // 3 seconds for failed payment redirect

    // Show countdown toast
    const countdownToastId = toast.loading(
      `العودة لصفحة الدفع خلال ${countdown} ثواني... (يمكنك إغلاق هذه الصفحة)`,
      { duration: Infinity }
    );

    // Update countdown every second
    countdownIntervalRef.current = setInterval(() => {
      countdown--;

      if (countdown > 0) {
        toast.loading(`العودة لصفحة الدفع خلال ${countdown} ثواني...`, {
          id: countdownToastId,
        });
      } else {
        // Clean up interval
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        toast.dismiss(countdownToastId);
      }
    }, 1000);

    // Set redirect timeout
    redirectTimeoutRef.current = setTimeout(() => {
      // Clean up any remaining intervals
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      toast.dismiss(countdownToastId);
      toast.loading("جاري التوجيه...", { duration: 1000 });

      console.log("🔄 Auto-redirecting to checkout with restoration flags");

      // Navigate to checkout with payment failure flag
      navigate("/checkout?payment_failed=true", {
        replace: true,
        state: {
          fromFailedPayment: true,
          timestamp: Date.now(),
          autoRedirected: true,
        },
      });
    }, 3000);
  };

  const handleSuccessfulPayment = () => {
    console.log("🎉💳✅ Payment successful detected");

    setPaymentStatus("success");
    toast.success("تم الدفع بنجاح!", { duration: 3000 });

    // Clear cart on success
    cartStore.clearCart();

    // Navigate to orders
    setTimeout(() => {
      clearPaymentState();
      navigate("/current-orders", {
        replace: true,
        state: {
          justSubmitted: true,
          paymentSuccess: true,
          timestamp: Date.now(),
        },
      });
    }, 2000);
  };

  const handleCheckoutRestoration = async () => {
    console.log("🔄 Starting checkout restoration...");

    if (!hasFailedPayment()) {
      console.log("No failed payment state found");
      return;
    }

    if (!canAttemptRestoration()) {
      toast.error("تم تجاوز الحد الأقصى لمحاولات الاستعادة");
      clearPaymentState();
      return;
    }

    try {
      const { checkoutData, isValid, validationMessage } =
        restoreCheckoutWithValidation();

      if (!checkoutData) {
        console.log("No checkout data available");
        return;
      }

      if (!isValid) {
        toast.warning(validationMessage, { duration: 5000 });
        incrementRestorationAttempt();
        return;
      }

      // Restore cart if needed
      if (cartStore.items.length === 0 && checkoutData.items?.length > 0) {
        const result = await restoreCart(
          checkoutData.items,
          user?.id || null,
          cartStore
        );

        if (result.success) {
          toast.success(
            `تم استعادة ${result.restoredItemsCount} عنصر من السلة السابقة`
          );
        }
      }

      // Show restoration success
      toast.success("تم استعادة بيانات طلبك بنجاح! يمكنك المحاولة مرة أخرى", {
        duration: 4000,
      });

      incrementRestorationAttempt();

      // Clean up URL
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("payment_failed");
        window.history.replaceState({}, "", url.toString());
      }, 2000);
    } catch (error) {
      console.error("Restoration failed:", error);
      toast.error("فشل في استعادة بيانات الطلب السابق");
      incrementRestorationAttempt();
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default PaymentStatusHandler;
