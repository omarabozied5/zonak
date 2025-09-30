import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePaymentStore } from "@/stores/usePaymentStore";
import { XCircle } from "lucide-react";

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const { setPaymentStatus, markPaymentReturnDetected } = usePaymentStore();
  const [countdown, setCountdown] = useState(3);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    setPaymentStatus("failed");
    markPaymentReturnDetected();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/checkout", {
            replace: true,
            state: { fromFailedPayment: true },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50"
      dir="rtl"
    >
      <div className="text-center p-8 max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
          <XCircle className="w-16 h-16 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-red-800 mb-4">
          فشلت عملية الدفع
        </h1>
        <p className="text-red-700 mb-6 text-lg">
          لم تتم عملية الدفع بنجاح، يرجى المحاولة مرة أخرى
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">
            تم الاحتفاظ بجميع العناصر في السلة
          </p>
        </div>
        <div className="space-y-4">
          <div className="text-red-600 text-lg font-medium">
            جاري إعادة التوجيه للسلة...
          </div>
          <div className="text-5xl font-bold text-red-600 animate-pulse">
            {countdown}
          </div>
        </div>
        <button
          onClick={() =>
            navigate("/checkout", {
              replace: true,
              state: { fromFailedPayment: true },
            })
          }
          className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          العودة للسلة الآن
        </button>
      </div>
    </div>
  );
};

export default PaymentFailed;
