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
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleSuccess = async () => {
      console.log("Processing payment success...");

      // Update payment status
      setPaymentStatus("success");

      // Clear cart store & localStorage
      cartStore.clearCart();
      clearUserCart(user?.id);
      console.log("✅ Cart cleared");

      // Clear payment state
      clearPaymentState();
      console.log("🧹 Payment state cleared");
    };

    handleSuccess();

    // Countdown timer to redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/current-orders", { replace: true });
          cartStore.clearCart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cartStore, clearPaymentState, navigate, setPaymentStatus, user?.id]);

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
