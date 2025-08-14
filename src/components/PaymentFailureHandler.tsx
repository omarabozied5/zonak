// FailedPaymentRedirect.tsx - Simple auto-redirect for failed payments
import { useEffect } from "react";

interface FailedPaymentRedirectProps {
  redirectDelay?: number; // milliseconds
  onRedirect?: () => void;
}

export const FailedPaymentRedirect: React.FC<FailedPaymentRedirectProps> = ({
  redirectDelay = 3000,
  onRedirect,
}) => {
  useEffect(() => {
    const currentUrl = window.location.href;
    const pathname = window.location.pathname;

    // Check if this is a failed payment page
    const isFailedPaymentPage =
      pathname.includes("/failed/payment/") ||
      currentUrl.includes("dev-backend.zonak.net/failed/payment/");

    if (!isFailedPaymentPage) return;

    console.log("🚨 Failed payment page detected, starting redirect...");

    // Show countdown message
    let countdown = Math.ceil(redirectDelay / 1000);
    const updateMessage = () => {
      const messageEl = document.getElementById("redirect-message");
      if (messageEl) {
        messageEl.textContent = `جاري إعادة توجيهك خلال ${countdown} ثواني...`;
      }
      countdown--;
    };

    updateMessage();
    const countdownInterval = setInterval(updateMessage, 1000);

    // Redirect after delay
    const redirectTimeout = setTimeout(() => {
      clearInterval(countdownInterval);

      if (onRedirect) {
        onRedirect();
      }

      // Build redirect URL to your frontend checkout
      const frontendUrl = window.location.origin.replace(
        "dev-backend.zonak.net",
        "your-frontend-domain.com"
      );
      const checkoutUrl = `${frontendUrl}/checkout?payment_failed=true&auto_redirect=true&timestamp=${Date.now()}`;

      console.log("🔄 Redirecting to:", checkoutUrl);

      try {
        window.location.replace(checkoutUrl);
      } catch (error) {
        console.error("Redirect failed, trying href:", error);
        window.location.href = checkoutUrl;
      }
    }, redirectDelay);

    // Cleanup
    return () => {
      clearTimeout(redirectTimeout);
      clearInterval(countdownInterval);
    };
  }, [redirectDelay, onRedirect]);

  // Only render UI if we're on a failed payment page
  if (!window.location.pathname.includes("/failed/payment/")) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
          width: "90%",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#fee2e2",
            margin: "0 auto 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            style={{ width: "30px", height: "30px", color: "#dc2626" }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2
          style={{
            color: "#dc2626",
            marginBottom: "1rem",
            fontSize: "1.25rem",
          }}
        >
          فشل في عملية الدفع
        </h2>

        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          سيتم استعادة بيانات طلبك والعودة لصفحة الدفع
        </p>

        <div
          id="redirect-message"
          style={{
            color: "#374151",
            fontSize: "0.875rem",
            marginBottom: "1rem",
          }}
        >
          جاري إعادة توجيهك خلال 3 ثواني...
        </div>

        <div
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: "#e5e7eb",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#3b82f6",
              animation: "progress 3s linear forwards",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0% }
          to { width: 100% }
        }
      `}</style>
    </div>
  );
};

// Add this component to pages that might be failed payment callbacks
export default FailedPaymentRedirect;
