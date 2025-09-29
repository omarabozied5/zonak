import React, { useEffect, useState } from "react";
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
  const [cartCleared, setCartCleared] = useState(false);

  useEffect(() => {
    // 1️⃣ Update payment status once
    setPaymentStatus("success");
    console.log("💳 Payment status updated: success");

    // 2️⃣ Clear cart safely if not already cleared
    if (!cartCleared && cartStore.items.length > 0) {
      cartStore.clearCart();
      setCartCleared(true);
      console.log("✅ Cart cleared");
    }

    // 3️⃣ Clear payment state
    clearPaymentState();
    console.log("🧹 Payment state cleared");

    // 4️⃣ Countdown and redirect
    let remaining = 3;
    setCountdown(remaining);
    const timer = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        navigate("/current-orders", { replace: true });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Run only once on mount

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
