// EnhancedPaymentStatusHandler.tsx - Complete payment status detection and handling
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { usePaymentStore } from "@/stores/usePaymentStore";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartRestoration } from "@/lib/cartRestoration";

interface PaymentStatusHandlerProps {
  onPaymentSuccess?: (paymentId: string, orderId: string) => void;
  onPaymentFailed?: (reason?: string) => void;
  autoRedirectDelay?: number; // in milliseconds
}

const PaymentStatusHandler: React.FC<PaymentStatusHandlerProps> = ({
  onPaymentSuccess,
  onPaymentFailed,
  autoRedirectDelay = 3000,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const cartStore = useCartStore(user?.id);
  const { restoreCart } = useCartRestoration();

  const processedRef = useRef<Set<string>>(new Set());
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null
  );

  const {
    setPaymentStatus,
    clearPaymentState,
    hasFailedPayment,
    restoreCheckoutWithValidation,
    incrementRestorationAttempt,
    canAttemptRestoration,
    markPaymentReturnDetected,
    checkoutData,
  } = usePaymentStore();

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const currentUrl = window.location.href.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);

    // Create unique key for this navigation to prevent duplicate processing
    const navigationKey = `${pathname}-${searchParams.toString()}-${Date.now()}`;

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

    // 🎯 ENHANCED PAYMENT STATUS DETECTION based on your backend URLs
    const paymentStatus = detectPaymentStatus(
      currentUrl,
      pathname,
      searchParams
    );

    if (paymentStatus.type === "success") {
      handleSuccessfulPayment(paymentStatus.paymentId, paymentStatus.orderId);
    } else if (paymentStatus.type === "failed") {
      handleFailedPayment(paymentStatus.reason);
    } else if (paymentStatus.type === "checkout_restoration") {
      handleCheckoutRestoration();
    }

    // Clean up old processed keys
    if (processedRef.current.size > 10) {
      const keysArray = Array.from(processedRef.current);
      processedRef.current.clear();
      keysArray.slice(-5).forEach((key) => processedRef.current.add(key));
    }
  }, [location.pathname, location.search, location.hash]);

  const detectPaymentStatus = (
    currentUrl: string,
    pathname: string,
    searchParams: URLSearchParams
  ) => {
    // 🏆 SUCCESS PATTERNS - Based on your backend response
    const successPatterns = [
      pathname.includes("/success/payment/"),
      pathname.includes("/payment/success"),
      searchParams.get("payment") === "success",
      searchParams.get("status") === "success",
      currentUrl.includes("success/payment"),
    ];

    // 🚨 FAILURE PATTERNS - Based on common failure URLs
    const failurePatterns = [
      pathname.includes("/failed/payment/"),
      pathname.includes("/failure/payment/"),
      pathname.includes("/payment/failed"),
      pathname.includes("/payment/failure"),
      searchParams.get("payment") === "failed",
      searchParams.get("payment") === "failure",
      searchParams.get("status") === "failed",
      searchParams.get("status") === "failure",
      searchParams.get("result") === "failed",
      currentUrl.includes("failed/payment"),
      currentUrl.includes("failure/payment"),
      currentUrl.includes("payment-failed"),
      // Additional failure indicators
      searchParams.has("error"),
      searchParams.has("payment_error"),
      searchParams.get("success") === "false",
    ];

    if (successPatterns.some((pattern) => pattern)) {
      // Extract payment ID and order ID from URL or params
      const paymentId =
        searchParams.get("paymentId") ||
        searchParams.get("Id") ||
        extractFromPath(pathname, "success/payment/");

      const orderId =
        searchParams.get("order_id") ||
        searchParams.get("orderId") ||
        checkoutData?.orderId;

      return {
        type: "success" as const,
        paymentId: paymentId || "unknown",
        orderId: orderId || "unknown",
      };
    }

    if (failurePatterns.some((pattern) => pattern)) {
      const reason =
        searchParams.get("error") ||
        searchParams.get("reason") ||
        "Payment processing failed";

      return {
        type: "failed" as const,
        reason,
      };
    }

    // Check for checkout restoration needed
    if (
      pathname === "/checkout" &&
      searchParams.get("payment_failed") === "true"
    ) {
      return {
        type: "checkout_restoration" as const,
      };
    }

    return { type: "none" as const };
  };

  const extractFromPath = (
    pathname: string,
    pattern: string
  ): string | null => {
    const index = pathname.indexOf(pattern);
    if (index !== -1) {
      const afterPattern = pathname.substring(index + pattern.length);
      const segments = afterPattern.split("/");
      return segments[0] || null;
    }
    return null;
  };

  const handleSuccessfulPayment = async (
    paymentId: string,
    orderId: string
  ) => {
    console.log("🎉💳✅ PAYMENT SUCCESS DETECTED!", { paymentId, orderId });

    setPaymentStatus("success");
    markPaymentReturnDetected();

    // Show success message
    toast.success("تم الدفع بنجاح! 🎉", {
      duration: 4000,
      description: "سيتم توجيهك إلى صفحة الطلبات الحالية",
    });

    // 🎯 CRITICAL: Clear cart only on successful payment
    try {
      cartStore.clearCart();
      console.log("✅ Cart cleared after successful payment");
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
    }

    // Call custom callback if provided
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentId, orderId);
    }

    // Start countdown and redirect
    startSuccessRedirectCountdown();
  };

  const handleFailedPayment = async (reason?: string) => {
    console.log("🚨💳❌ PAYMENT FAILURE DETECTED!", { reason });

    setPaymentStatus("failed");
    markPaymentReturnDetected();

    // Show failure message
    toast.error("فشل في عملية الدفع", {
      duration: 5000,
      description: "سيتم إعادة توجيهك للمحاولة مرة أخرى",
    });

    // 🎯 CRITICAL: DO NOT clear cart on failed payment
    console.log("⚠️ Cart preserved due to payment failure");

    // Call custom callback if provided
    if (onPaymentFailed) {
      onPaymentFailed(reason);
    }

    // Check if we have saved checkout data for restoration
    if (checkoutData) {
      toast.info("سيتم استعادة بيانات طلبك السابق", {
        duration: 3000,
      });
    }

    // Start countdown and redirect to checkout
    startFailureRedirectCountdown();
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
      const {
        checkoutData: restoredData,
        isValid,
        validationMessage,
      } = restoreCheckoutWithValidation();

      if (!restoredData) {
        console.log("No checkout data available for restoration");
        return;
      }

      if (!isValid) {
        toast.warning(validationMessage, { duration: 5000 });
        incrementRestorationAttempt();
        return;
      }

      // Restore cart if empty and we have items
      if (cartStore.items.length === 0 && restoredData.items?.length > 0) {
        const result = await restoreCart(
          restoredData.items,
          user?.id || null,
          cartStore
        );

        if (result.success) {
          toast.success(
            `تم استعادة ${result.restoredItemsCount} عنصر من السلة السابقة`,
            { duration: 4000 }
          );
        } else {
          toast.warning(
            `تم استعادة ${result.restoredItemsCount} من ${restoredData.items.length} عنصر`,
            { duration: 4000 }
          );
        }
      }

      // Show restoration success
      toast.success("تم استعادة بيانات طلبك بنجاح! يمكنك المحاولة مرة أخرى", {
        duration: 4000,
      });

      incrementRestorationAttempt();

      // Clean up URL parameters
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

  const startSuccessRedirectCountdown = () => {
    let countdown = Math.ceil(autoRedirectDelay / 1000);
    setRedirectCountdown(countdown);

    const countdownInterval = setInterval(() => {
      countdown--;
      setRedirectCountdown(countdown);

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        setRedirectCountdown(null);
      }
    }, 1000);

    redirectTimeoutRef.current = setTimeout(() => {
      clearInterval(countdownInterval);
      setRedirectCountdown(null);

      toast.loading("جاري التوجيه إلى الطلبات الحالية...", { duration: 1000 });

      // Clear payment state and navigate
      setTimeout(() => {
        clearPaymentState();
        navigate("/current-orders", {
          replace: true,
          state: {
            fromSuccessfulPayment: true,
            paymentSuccess: true,
            timestamp: Date.now(),
          },
        });
      }, 1000);
    }, autoRedirectDelay);
  };

  const startFailureRedirectCountdown = () => {
    let countdown = Math.ceil(autoRedirectDelay / 1000);
    setRedirectCountdown(countdown);

    const countdownInterval = setInterval(() => {
      countdown--;
      setRedirectCountdown(countdown);

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        setRedirectCountdown(null);
      }
    }, 1000);

    redirectTimeoutRef.current = setTimeout(() => {
      clearInterval(countdownInterval);
      setRedirectCountdown(null);

      toast.loading("جاري العودة لصفحة الدفع...", { duration: 1000 });

      // Navigate back to checkout with restoration flag
      setTimeout(() => {
        navigate("/checkout?payment_failed=true", {
          replace: true,
          state: {
            fromFailedPayment: true,
            timestamp: Date.now(),
            autoRedirected: true,
          },
        });
      }, 1000);
    }, autoRedirectDelay);
  };

  // Render countdown UI if redirecting
  if (redirectCountdown !== null) {
    const isSuccess = location.pathname.includes("success");

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full text-center">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isSuccess ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <span className="text-2xl">{isSuccess ? "✅" : "❌"}</span>
          </div>

          <h3
            className={`text-lg font-semibold mb-2 ${
              isSuccess ? "text-green-800" : "text-red-800"
            }`}
          >
            {isSuccess ? "تم الدفع بنجاح!" : "فشل في الدفع"}
          </h3>

          <p className="text-gray-600 mb-4">
            {isSuccess
              ? "سيتم توجيهك إلى صفحة الطلبات الحالية"
              : "سيتم إعادة توجيهك لصفحة الدفع"}
          </p>

          <div className="text-sm text-gray-500">
            التوجيه خلال {redirectCountdown} ثانية...
          </div>

          <button
            onClick={() => {
              if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
              }
              setRedirectCountdown(null);

              const targetUrl = isSuccess
                ? "/current-orders"
                : "/checkout?payment_failed=true";
              navigate(targetUrl, { replace: true });
            }}
            className="mt-4 px-4 py-2 bg-[#FFAA01] text-white rounded hover:bg-[#FFAA01]/90 transition-colors"
          >
            متابعة الآن
          </button>
        </div>
      </div>
    );
  }

  // This component renders nothing when not redirecting
  return null;
};

export default PaymentStatusHandler;
