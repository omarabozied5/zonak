import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { usePaymentStore } from "../stores/usePaymentStore";

export const usePaymentStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    setPaymentStatus,
    hasFailedPayment,
    restoreCheckoutState,
    clearPaymentState,
  } = usePaymentStore();

  useEffect(() => {
    // Check if user is coming back from payment
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const paymentId = urlParams.get("paymentId");
    const token = urlParams.get("token");

    // Check if this is a payment callback URL
    if (paymentStatus || paymentId || token) {
      handlePaymentCallback(paymentStatus, paymentId, token);
    }

    // Check for failed payment in URL path
    if (window.location.pathname.includes("/failed/payment/")) {
      handleFailedPayment();
    }

    // Check for successful payment
    if (
      window.location.pathname.includes("/success/payment/") ||
      paymentStatus === "success"
    ) {
      handleSuccessfulPayment();
    }

    // Auto-restore checkout state if user navigates back and has failed payment
    if (hasFailedPayment() && location.pathname === "/checkout") {
      handleCheckoutRestore();
    }
  }, [location]);
  const safeNavigate = (path: string, replace = false) => {
    try {
      navigate(path, { replace }); // try react-router navigate
    } catch {
      if (replace) {
        window.location.replace(path);
      } else {
        window.location.href = path;
      }
    }
  };

  const handlePaymentCallback = (
    status: string | null,
    paymentId: string | null,
    token: string | null
  ) => {
    console.log("Payment callback detected:", { status, paymentId, token });

    if (
      status === "failed" ||
      window.location.pathname.includes("/failed/payment/")
    ) {
      setPaymentStatus("failed");
      toast.error("فشل في عملية الدفع. يرجى المحاولة مرة أخرى");

      // Redirect to checkout with state preserved
      setTimeout(() => {
        safeNavigate("/checkout?payment_failed=true", { replace: true });
      }, 2000);
    } else if (
      status === "success" ||
      window.location.pathname.includes("/success/payment/")
    ) {
      setPaymentStatus("success");
      toast.success("تم الدفع بنجاح!");

      // Redirect to current orders
      setTimeout(() => {
        navigate("/current-orders", { replace: true });
      }, 2000);
    }
  };

  const handleFailedPayment = () => {
    setPaymentStatus("failed");
    toast.error("فشل في عملية الدفع");

    // Redirect back to checkout
    navigate("/checkout?payment_failed=true", { replace: true });
  };

  const handleSuccessfulPayment = () => {
    setPaymentStatus("success");
    toast.success("تم الدفع بنجاح!");

    // Clear payment state and redirect
    setTimeout(() => {
      clearPaymentState();
      navigate("/current-orders", { replace: true });
    }, 3000);
  };

  const handleCheckoutRestore = () => {
    const checkoutData = restoreCheckoutState();
    if (checkoutData) {
      toast.info("تم استعادة بيانات الطلب السابق");
    }
  };

  return {
    handlePaymentCallback,
    handleFailedPayment,
    handleSuccessfulPayment,
  };
};
