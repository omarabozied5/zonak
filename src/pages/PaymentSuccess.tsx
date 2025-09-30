import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore, clearUserCart } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePaymentStore } from "@/stores/usePaymentStore";
import { CheckCircle } from "lucide-react";

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const cartStore = useCartStore(user?.id);
  const { clearPaymentState, setPaymentStatus } = usePaymentStore();
  const [countdown, setCountdown] = useState(3);
  const [isClearing, setIsClearing] = useState(true);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleSuccess = async () => {
      console.log("Processing payment success...");

      // Update payment status
      setPaymentStatus("success");

      // CRITICAL: Clear cart with multiple attempts and verification
      try {
        console.log("Starting cart clearing process...");
        const initialItemCount = cartStore.items.length;
        console.log(`Initial cart items: ${initialItemCount}`);

        // First clear attempt
        cartStore.clearCart();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Second clear attempt (ensure state propagated)
        cartStore.clearCart();
        clearUserCart(user?.id);
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Third clear attempt (force)
        cartStore.clearCart();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verify cart is empty
        const finalItemCount = cartStore.items.length;
        console.log(`Final cart items after clearing: ${finalItemCount}`);

        if (finalItemCount > 0) {
          console.error("Cart still has items, forcing additional clear");
          cartStore.clearCart();
          clearUserCart(user?.id);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Verify localStorage was cleared
        const storageKey = `cart-storage-${user?.id || "guest"}`;
        const storageData = localStorage.getItem(storageKey);
        if (storageData) {
          console.warn("localStorage still has cart data, clearing manually");
          localStorage.removeItem(storageKey);
        }

        console.log("Cart cleared successfully");
      } catch (error) {
        console.error("Error during cart clearing:", error);
        // Force clear even on error
        try {
          cartStore.clearCart();
          clearUserCart(user?.id);
        } catch (retryError) {
          console.error("Retry clear failed:", retryError);
        }
      }

      // Clear payment state
      clearPaymentState();
      console.log("Payment state cleared");

      // Mark clearing as complete
      setIsClearing(false);
    };

    handleSuccess();
  }, [cartStore, clearPaymentState, setPaymentStatus, user?.id]);

  // Only start countdown after clearing is done
  useEffect(() => {
    if (isClearing) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          // Final cart clear before navigation
          console.log("Final cart clear before navigation");
          cartStore.clearCart();
          clearUserCart(user?.id);

          // Navigate with state flag
          navigate("/current-orders", {
            replace: true,
            state: {
              fromSuccessfulPayment: true,
              cartWasCleared: true,
              timestamp: Date.now(),
            },
          });

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isClearing, navigate, cartStore, user?.id]);

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

        {isClearing ? (
          <div className="space-y-4">
            <div className="text-green-600 text-lg font-medium">
              جاري معالجة الطلب...
            </div>
            <div className="w-8 h-8 mx-auto border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-green-600 text-lg font-medium">
              جاري التوجيه إلى صفحة الطلبات...
            </div>
            <div className="text-5xl font-bold text-green-600 animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            cartStore.clearCart();
            clearUserCart(user?.id);
            navigate("/current-orders", { replace: true });
          }}
          className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          disabled={isClearing}
        >
          الذهاب إلى الطلبات الآن
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
