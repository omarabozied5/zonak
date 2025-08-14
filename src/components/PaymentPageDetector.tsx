// PaymentPageDetector.tsx - Detects payment failure pages and auto-redirects
import React, { useEffect, useRef } from "react";

interface PaymentPageDetectorProps {
  onFailedPaymentDetected?: () => void;
  onSuccessfulPaymentDetected?: () => void;
  redirectDelay?: number; // in milliseconds
}

const PaymentPageDetector: React.FC<PaymentPageDetectorProps> = ({
  onFailedPaymentDetected,
  onSuccessfulPaymentDetected,
  redirectDelay = 3000,
}) => {
  const hasProcessedRef = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only process once
    if (hasProcessedRef.current) return;

    const currentUrl = window.location.href;
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    console.log("PaymentPageDetector: Analyzing URL:", currentUrl);

    // Check for failed payment patterns
    const failedPatterns = [
      pathname.includes("/failed/payment/"),
      pathname.includes("/payment/failed"),
      searchParams.get("payment") === "failed",
      searchParams.get("status") === "failed",
      searchParams.get("result") === "failed",
      currentUrl.includes("failed/payment"),
      currentUrl.includes("payment-failed"),
    ];

    // Check for successful payment patterns
    const successPatterns = [
      pathname.includes("/success/payment/"),
      pathname.includes("/payment/success"),
      searchParams.get("payment") === "success",
      searchParams.get("status") === "success",
      searchParams.get("result") === "success",
      currentUrl.includes("success/payment"),
      currentUrl.includes("payment-success"),
    ];

    if (failedPatterns.some((pattern) => pattern)) {
      hasProcessedRef.current = true;
      handleFailedPayment();
    } else if (successPatterns.some((pattern) => pattern)) {
      hasProcessedRef.current = true;
      handleSuccessfulPayment();
    }

    // Cleanup on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleFailedPayment = () => {
    console.log("🚨 Failed payment page detected");

    // Call the callback if provided
    if (onFailedPaymentDetected) {
      onFailedPaymentDetected();
    }

    // Default behavior: show message and redirect
    if (typeof window !== "undefined") {
      // Show a simple alert or use your toast system
      showFailedPaymentMessage();

      // Auto-redirect after delay
      redirectTimeoutRef.current = setTimeout(() => {
        redirectToCheckout();
      }, redirectDelay);
    }
  };

  const handleSuccessfulPayment = () => {
    console.log("✅ Successful payment page detected");

    // Call the callback if provided
    if (onSuccessfulPaymentDetected) {
      onSuccessfulPaymentDetected();
    }

    // Default behavior: redirect to orders page
    if (typeof window !== "undefined") {
      showSuccessPaymentMessage();

      // Auto-redirect after delay
      redirectTimeoutRef.current = setTimeout(() => {
        redirectToOrders();
      }, redirectDelay);
    }
  };

  const showFailedPaymentMessage = () => {
    // Create a simple notification div
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 16px;
      border-radius: 8px;
      z-index: 10000;
      max-width: 300px;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">فشل في عملية الدفع</div>
      <div style="font-size: 14px; margin-bottom: 8px;">جاري إعادة توجيهك للمحاولة مرة أخرى...</div>
      <div id="countdown" style="font-size: 12px; color: #7f1d1d;">العودة خلال ${Math.ceil(
        redirectDelay / 1000
      )} ثواني</div>
    `;

    document.body.appendChild(notification);

    // Update countdown
    let remaining = Math.ceil(redirectDelay / 1000);
    const countdownElement = document.getElementById("countdown");

    const interval = setInterval(() => {
      remaining--;
      if (countdownElement && remaining > 0) {
        countdownElement.textContent = `العودة خلال ${remaining} ثواني`;
      } else {
        clearInterval(interval);
        document.body.removeChild(notification);
      }
    }, 1000);
  };

  const showSuccessPaymentMessage = () => {
    // Create a simple success notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dcfce7;
      border: 1px solid #bbf7d0;
      color: #166534;
      padding: 16px;
      border-radius: 8px;
      z-index: 10000;
      max-width: 300px;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">تم الدفع بنجاح!</div>
      <div style="font-size: 14px; margin-bottom: 8px;">جاري توجيهك لصفحة الطلبات...</div>
      <div id="countdown" style="font-size: 12px; color: #14532d;">التوجيه خلال ${Math.ceil(
        redirectDelay / 1000
      )} ثواني</div>
    `;

    document.body.appendChild(notification);

    // Update countdown
    let remaining = Math.ceil(redirectDelay / 1000);
    const countdownElement = document.getElementById("countdown");

    const interval = setInterval(() => {
      remaining--;
      if (countdownElement && remaining > 0) {
        countdownElement.textContent = `التوجيه خلال ${remaining} ثواني`;
      } else {
        clearInterval(interval);
        document.body.removeChild(notification);
      }
    }, 1000);
  };

  const redirectToCheckout = () => {
    try {
      // First try to use your app's base URL
      const baseUrl = getAppBaseUrl();
      const checkoutUrl = `${baseUrl}/checkout?payment_failed=true`;

      console.log("🔄 Redirecting to checkout:", checkoutUrl);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Failed to redirect to checkout:", error);
      // Fallback: try common checkout paths
      window.location.href = "/checkout?payment_failed=true";
    }
  };

  const redirectToOrders = () => {
    try {
      const baseUrl = getAppBaseUrl();
      const ordersUrl = `${baseUrl}/current-orders`;

      console.log("🔄 Redirecting to orders:", ordersUrl);
      window.location.href = ordersUrl;
    } catch (error) {
      console.error("Failed to redirect to orders:", error);
      window.location.href = "/current-orders";
    }
  };

  const getAppBaseUrl = (): string => {
    // Try to detect your app's base URL
    const { protocol, host } = window.location;

    // Check if we're on your backend domain and need to redirect to frontend
    if (host.includes("dev-backend.zonak.net")) {
      // Replace with your actual frontend URL
      return `${protocol}//your-frontend-domain.com`;
    }

    return `${protocol}//${host}`;
  };

  // This component renders nothing
  return null;
};

// Usage example component that you can add to any page
export const PaymentPageHandler: React.FC = () => {
  return (
    <PaymentPageDetector
      redirectDelay={3000} // 3 seconds
      onFailedPaymentDetected={() => {
        console.log("Payment failed - custom handling");
        // Add any custom logic here (analytics, logging, etc.)
      }}
      onSuccessfulPaymentDetected={() => {
        console.log("Payment succeeded - custom handling");
        // Add any custom logic here
      }}
    />
  );
};

export default PaymentPageDetector;
