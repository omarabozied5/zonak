import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePaymentStore } from "@/stores/usePaymentStore";
import { CheckCircle } from "lucide-react";

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const cartStore = useCartStore(user?.id);
  const { clearPaymentState, setPaymentStatus } = usePaymentStore();
  const [countdown, setCountdown] = useState(3);
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (processedRef.current) return;
    processedRef.current = true;

    const processSuccess = async () => {
      console.log("Processing payment success...");

      // Set payment status to success immediately
      setPaymentStatus("success");

      // CRITICAL: Clear cart immediately and synchronously
      try {
        // Get current cart state for logging
        const currentItems = cartStore.items;
        console.log("Cart items before clearing:", currentItems.length);

        // Clear the cart
        cartStore.clearCart();

        // Verify cart is cleared
        const itemsAfterClear = cartStore.items;
        console.log("Cart items after clearing:", itemsAfterClear.length);

        if (itemsAfterClear.length === 0) {
          console.log("✅ Cart successfully cleared after payment success");
        } else {
          console.error("❌ Cart not properly cleared, forcing clear again");
          // Force clear again if needed
          cartStore.clearCart();
        }
      } catch (error) {
        console.error("Error clearing cart:", error);
        // Force clear even if there's an error
        try {
          cartStore.clearCart();
        } catch (retryError) {
          console.error("Failed to clear cart on retry:", retryError);
        }
      }

      // Clear payment state after a delay
      setTimeout(() => {
        clearPaymentState();
        console.log("Payment state cleared");
      }, 2000);
    };

    // Process success immediately
    processSuccess();

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/current-orders", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []); // Empty dependency array - run only once

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50"
      dir="rtl"
    >
      <div className="text-center p-8 max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-green-800 mb-4">
          تم الدفع بنجاح!
        </h1>

        <p className="text-green-700 mb-6 text-lg">
          شكراً على إتمام الدفع، سيتم تجهيز طلبكم في أسرع وقت
        </p>

        <div className="space-y-4">
          <div className="text-green-600 text-lg font-medium">
            جاري التوجيه إلى صفحة الطلبات...
          </div>
          <div className="text-5xl font-bold text-green-600 animate-pulse">
            {countdown}
          </div>
        </div>

        <button
          onClick={() => navigate("/current-orders", { replace: true })}
          className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          الذهاب إلى الطلبات الآن
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
