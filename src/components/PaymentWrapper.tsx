// PaymentWrapper.tsx - Add this component to wrap your main App or specific routes
import React from "react";
import { useLocation } from "react-router-dom";
import EnhancedPaymentStatusHandler from "./PaymentStatusHandler";
import { usePaymentStatus } from "../hooks/usePaymentStatus";

interface PaymentWrapperProps {
  children: React.ReactNode;
}

const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ children }) => {
  const location = useLocation();

  // Use the payment status hook for automatic handling
  const {
    handlePaymentSuccess,
    handlePaymentFailed,
    isProcessingPayment,
    hasCheckoutData,
  } = usePaymentStatus({
    autoRedirect: true,
    redirectDelay: 3000,
    onPaymentSuccess: (paymentId, orderId) => {
      console.log("✅ Payment Success Callback:", { paymentId, orderId });

      // You can add any additional success handling here
      // For example: analytics tracking, user notifications, etc.

      // Example: Track successful payment
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "purchase", {
          transaction_id: orderId,
          payment_method: "online",
          currency: "SAR",
        });
      }
    },
    onPaymentFailed: (reason) => {
      console.log("❌ Payment Failed Callback:", { reason });

      // You can add any additional failure handling here
      // For example: analytics tracking, error logging, etc.

      // Example: Track failed payment
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "payment_failed", {
          reason: reason || "unknown",
        });
      }
    },
    onRestoreNeeded: () => {
      console.log("🔄 Checkout restoration needed");

      // You can add any additional restoration handling here
    },
  });

  // Show payment status indicator if processing
  const showPaymentStatus = isProcessingPayment || hasCheckoutData;
  const isPaymentRelatedPage =
    location.pathname.includes("/success/payment/") ||
    location.pathname.includes("/failed/payment/") ||
    location.pathname.includes("/checkout");

  return (
    <>
      {children}

      {/* Enhanced Payment Status Handler - only active on payment-related pages */}
      {isPaymentRelatedPage && (
        <EnhancedPaymentStatusHandler
          onPaymentSuccess={(paymentId, orderId) => {
            console.log("🎉 Enhanced handler - Payment Success:", {
              paymentId,
              orderId,
            });
            // The hook already handles most of the logic, this is for additional UI feedback
          }}
          onPaymentFailed={(reason) => {
            console.log("❌ Enhanced handler - Payment Failed:", { reason });
            // The hook already handles most of the logic, this is for additional UI feedback
          }}
          autoRedirectDelay={3000}
        />
      )}

      {/* Payment Status Indicator (optional) */}
      {showPaymentStatus && !isPaymentRelatedPage && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span className="text-sm">
              {isProcessingPayment ? "معالجة الدفع..." : "بيانات طلب محفوظة"}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentWrapper;
