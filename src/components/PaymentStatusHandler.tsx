// EnhancedPaymentStatusHandler.tsx - Complete payment status detection and handling
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { usePaymentStore } from "@/stores/usePaymentStore";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";

interface PaymentStatusHandlerProps {
  onPaymentSuccess?: (paymentId: string, orderId: string) => void;
  onPaymentFailed?: (reason?: string) => void;
  autoRedirectDelay?: number;
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

  const processedRef = useRef<Set<string>>(new Set());
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null
  );

  const {
    setPaymentStatus,
    clearPaymentState,
    restoreCheckoutWithValidation,
    markPaymentReturnDetected,
    checkoutData,
    orderId: storedOrderId,
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

    // Create unique key for this navigation
    const navigationKey = `${pathname}-${searchParams.toString()}-${Date.now()}`;

    if (processedRef.current.has(navigationKey)) {
      return;
    }

    processedRef.current.add(navigationKey);

    console.log("🔍 PaymentStatusHandler: Analyzing URL:", {
      fullUrl: currentUrl,
      pathname,
      searchParams: searchParams.toString(),
    });

    const paymentStatus = detectPaymentStatus(
      currentUrl,
      pathname,
      searchParams
    );

    if (paymentStatus.type === "success") {
      handleSuccessfulPayment(paymentStatus.paymentId, paymentStatus.orderId);
    } else if (paymentStatus.type === "failed") {
      handleFailedPayment(paymentStatus.reason);
    }

    // Clean up old processed keys
    if (processedRef.current.size > 10) {
      const keysArray = Array.from(processedRef.current);
      processedRef.current.clear();
      keysArray.slice(-5).forEach((key) => processedRef.current.add(key));
    }
  }, [location.pathname, location.search]);

  const detectPaymentStatus = (
    currentUrl: string,
    pathname: string,
    searchParams: URLSearchParams
  ) => {
    // SUCCESS PATTERNS - Based on your backend response
    const successPatterns = [
      pathname.includes("/success/payment/"),
      currentUrl.includes("success/payment"),
      // Check if we're on a success page based on the encrypted token pattern
      /\/success\/payment\/[a-zA-Z0-9+/=]+/.test(pathname),
    ];

    // FAILURE PATTERNS - Based on common failure URLs
    const failurePatterns = [
      pathname.includes("/failed/payment/"),
      pathname.includes("/failure/payment/"),
      currentUrl.includes("failed/payment"),
      currentUrl.includes("failure/payment"),
      // Check for failure token pattern
      /\/failed\/payment\/[a-zA-Z0-9+/=]+/.test(pathname),
    ];

    if (successPatterns.some((pattern) => pattern)) {
      // Extract payment ID and order ID from URL or params
      const paymentId =
        searchParams.get("paymentId") ||
        searchParams.get("Id") ||
        extractTokenFromPath(pathname, "success/payment/");

      const orderId =
        searchParams.get("order_id") ||
        searchParams.get("orderId") ||
        storedOrderId ||
        "unknown";

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
        "عملية الدفع فشلت";

      return {
        type: "failed" as const,
        reason,
      };
    }

    return { type: "none" as const };
  };

  const extractTokenFromPath = (
    pathname: string,
    pattern: string
  ): string | null => {
    const index = pathname.indexOf(pattern);
    if (index !== -1) {
      const afterPattern = pathname.substring(index + pattern.length);
      const segments = afterPattern.split("?")[0].split("/");
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

    // 🎯 CRITICAL: Clear cart immediately and verify
    const clearCartWithRetry = async (maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const itemsBeforeClear = cartStore.items.length;
          console.log(
            `Cart clear attempt ${attempt}: Items before = ${itemsBeforeClear}`
          );

          cartStore.clearCart();

          // Give a small delay to ensure state update
          await new Promise((resolve) => setTimeout(resolve, 100));

          const itemsAfterClear = cartStore.items.length;
          console.log(
            `Cart clear attempt ${attempt}: Items after = ${itemsAfterClear}`
          );

          if (itemsAfterClear === 0) {
            console.log(`✅ Cart successfully cleared on attempt ${attempt}`);
            return true;
          }

          if (attempt === maxRetries) {
            console.error(
              `❌ Failed to clear cart after ${maxRetries} attempts`
            );
            return false;
          }

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Cart clear attempt ${attempt} failed:`, error);
          if (attempt === maxRetries) {
            return false;
          }
        }
      }
      return false;
    };

    try {
      await clearCartWithRetry();
    } catch (error) {
      console.error("Critical error during cart clearing:", error);
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

      setTimeout(() => {
        clearPaymentState();
        // Force cart clear one more time before navigation
        try {
          cartStore.clearCart();
          console.log("🔄 Final cart clear before navigation to orders");
        } catch (error) {
          console.error("Final cart clear error:", error);
        }

        navigate("/current-orders", {
          replace: true,
          state: {
            fromSuccessfulPayment: true,
            paymentSuccess: true,
            timestamp: Date.now(),
            cartCleared: true, // Flag to indicate cart was cleared
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

  // Handle the "Return to Site" button click from backend pages
  useEffect(() => {
    const handleReturnToSite = () => {
      const currentUrl = window.location.href.toLowerCase();

      if (currentUrl.includes("success/payment")) {
        handleSuccessfulPayment("backend_success", storedOrderId || "unknown");
      } else if (
        currentUrl.includes("failed/payment") ||
        currentUrl.includes("failure/payment")
      ) {
        handleFailedPayment("عملية الدفع فشلت");
      }
    };

    // Listen for messages from the backend page
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "return_to_site") {
        handleReturnToSite();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [storedOrderId]);

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

              if (isSuccess) {
                // Ensure cart is cleared before manual navigation
                try {
                  cartStore.clearCart();
                  console.log("🔄 Manual cart clear before navigation");
                } catch (error) {
                  console.error("Manual cart clear error:", error);
                }
              }

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

  return null;
};

export default PaymentStatusHandler;
