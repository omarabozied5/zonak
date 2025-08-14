// Updated Checkout.tsx with restoration functionality
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderStore } from "@/hooks/useOrderStore";
import { usePaymentStore } from "@/stores/usePaymentStore";

// Components
import CheckoutHeader from "../components/checkout/CheckoutHeader";
import ContactInfoCard from "../components/checkout/ContactInfoCard";
import CouponCard from "../components/checkout/CouponCard";
import PaymentMethodCard from "../components/checkout/PaymentMethodCard";
import OrderSummaryCard from "../components/checkout/OrderSummaryCard";

// Hooks and Utils
import { useCoupon } from "../hooks/useCoupon";
import { useFormValidation } from "../hooks/useCheckout";
import { useCheckoutRestoration } from "../hooks/useCheckoutRestoration"; // New hook
import { calculateDiscountAmount } from "../lib/couponUtils";
import {
  calculateTotalItemDiscounts,
  calculateOriginalTotal,
} from "../lib/cartUtils";
import { apiService, buildOrderPayload } from "../services/apiService";
import { OrderResponse, CartItem } from "../types/types";

interface OrderValidation {
  isValid: boolean;
  placeId?: number;
  merchantId?: number;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const cartStore = useCartStore(user?.id);
  const { items, totalPrice, clearCart } = cartStore;
  const { validateForm } = useFormValidation();
  const orderStore = useOrderStore(user?.id?.toString());
  const paymentStore = usePaymentStore();

  const [notes, setNotes] = useState<string>("");
  const [paymentType, setPaymentType] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Get placeId from first item for coupon validation
  const placeId = items.length > 0 ? items[0].placeId : "";

  const {
    couponCode,
    setCouponCode,
    appliedCoupon,
    setAppliedCoupon, // Add this method to useCoupon hook
    applyCoupon,
    removeCoupon,
    isValidating,
  } = useCoupon({
    totalPrice,
    placeId,
  });

  // Use the restoration hook
  const { restorationState, applyRestoredState, isRestoring } =
    useCheckoutRestoration(user?.id || null, cartStore, {
      notes,
      paymentType,
      couponCode,
    });

  // Calculate discount information
  const totalItemDiscounts = calculateTotalItemDiscounts(items);
  const originalTotalPrice = calculateOriginalTotal(items);
  const couponDiscountAmount = calculateDiscountAmount(
    totalPrice,
    appliedCoupon
  );
  const total = totalPrice - couponDiscountAmount;

  // Apply restored state when available
  useEffect(() => {
    if (isRestoring) {
      applyRestoredState(
        setNotes,
        setPaymentType,
        setCouponCode,
        setAppliedCoupon || (() => {}) // Fallback if setAppliedCoupon not available
      );
    }
  }, [isRestoring, applyRestoredState]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/");
      return;
    }
    if (items.length === 0) {
      toast.error("السلة فارغة");
      navigate("/cart");
      return;
    }
  }, [isAuthenticated, items.length, navigate]);

  // Log discount information for debugging
  useEffect(() => {
    if (totalItemDiscounts > 0 || couponDiscountAmount > 0) {
      console.log("Checkout discount breakdown:", {
        originalTotal: originalTotalPrice,
        itemDiscounts: totalItemDiscounts,
        subtotalAfterItemDiscounts: totalPrice,
        couponDiscount: couponDiscountAmount,
        finalTotal: total,
        totalSavings: totalItemDiscounts + couponDiscountAmount,
      });
    }
  }, [
    totalItemDiscounts,
    originalTotalPrice,
    totalPrice,
    couponDiscountAmount,
    total,
  ]);

  if (!isAuthenticated || items.length === 0) return null;

  const handleBack = (): void => {
    navigate("/cart");
  };

  const validateOrderData = (): OrderValidation => {
    if (!items.length) {
      toast.error("السلة فارغة");
      return { isValid: false };
    }

    const firstItem = items[0];

    if (
      !firstItem.restaurantId ||
      firstItem.restaurantId.toString().trim() === ""
    ) {
      toast.error("معرف المطعم مفقود - يرجى إعادة اختيار العناصر");
      return { isValid: false };
    }

    if (!firstItem.placeId || firstItem.placeId.toString().trim() === "") {
      toast.error("معرف الفرع مفقود - يرجى إعادة اختيار العناصر");
      return { isValid: false };
    }

    const invalidItems = items.filter((item: CartItem) => {
      return (
        !item.id ||
        !item.categoryId ||
        item.categoryId === 0 ||
        !item.price ||
        isNaN(item.price) ||
        !item.totalPriceWithModifiers ||
        isNaN(item.totalPriceWithModifiers) ||
        item.quantity <= 0
      );
    });

    if (invalidItems.length > 0) {
      toast.error("بعض العناصر في السلة غير صالحة - يرجى إعادة إضافة العناصر");
      return { isValid: false };
    }

    const placeId = parseInt(firstItem.placeId.toString());
    const merchantId = parseInt(firstItem.restaurantId.toString());

    if (
      isNaN(placeId) ||
      isNaN(merchantId) ||
      placeId <= 0 ||
      merchantId <= 0
    ) {
      toast.error("معرف المطعم غير صحيح");
      return { isValid: false };
    }

    const allFromSameRestaurant = items.every(
      (item) =>
        item.placeId === firstItem.placeId &&
        item.restaurantId === firstItem.restaurantId
    );

    if (!allFromSameRestaurant) {
      toast.error("لا يمكن طلب عناصر من مطاعم مختلفة في طلب واحد");
      return { isValid: false };
    }

    return { isValid: true, placeId, merchantId };
  };

  const handleSubmitOrder = async (): Promise<void> => {
    if (!validateForm(user, items, total, paymentType)) return;

    const validation = validateOrderData();
    if (!validation.isValid) return;

    const { placeId, merchantId } = validation;

    setIsProcessing(true);
    try {
      // Create comprehensive checkout data snapshot
      const checkoutData = {
        items: [...items], // Deep copy of items
        totalPrice,
        appliedCoupon,
        couponDiscountAmount,
        total,
        paymentType,
        notes,
        userInfo: user,
        formState: {
          notes,
          paymentType,
          couponCode: appliedCoupon?.code || couponCode,
        },
        // Additional metadata for restoration
        timestamp: Date.now(),
        restaurantInfo: {
          placeId: placeId!,
          merchantId: merchantId!,
          restaurantName: items[0]?.restaurantName || "",
        },
      };

      console.log("Building order payload...");

      // Build the order payload with coupon information
      const orderPayload = buildOrderPayload(
        items,
        placeId!,
        merchantId!,
        total,
        paymentType,
        appliedCoupon,
        couponDiscountAmount
      );

      console.log(
        "Final order payload:",
        JSON.stringify(orderPayload, null, 2)
      );

      // Submit order to backend
      const response: OrderResponse = await apiService.submitOrder(
        orderPayload
      );

      if (response.success) {
        console.log("Order submitted successfully:", response);

        const orderId =
          response.order_id || response.data?.order_id || response.data?.id;

        if (paymentType === 0 && orderId) {
          // ONLINE PAYMENT - Preserve state before redirecting
          try {
            const paymentResponse = await apiService.getPaymentUrl(orderId);

            if (paymentResponse.data) {
              // ✅ CRITICAL: Store checkout state BEFORE opening payment URL
              paymentStore.initiatePay(
                checkoutData,
                orderId.toString(),
                paymentResponse.data
              );

              // Save additional form state
              paymentStore.updateCheckoutFormState({
                notes,
                paymentType,
                couponCode: appliedCoupon?.code || couponCode,
              });

              // Mark that user is leaving app for payment
              paymentStore.markLeftAppForPayment();

              // Show success message
              toast.success("تم إنشاء الطلب! جاري توجيهك لصفحة الدفع...", {
                duration: 3000,
              });

              // ⚠️ IMPORTANT: Don't clear cart here - only clear after successful payment
              console.log(
                "💳 Redirecting to payment URL:",
                paymentResponse.data
              );

              // Add a small delay to ensure state is saved
              setTimeout(() => {
                // Open payment URL in same window
                window.location.href = paymentResponse.data;
              }, 1000);

              return; // Don't continue with success flow
            }
          } catch (paymentError) {
            console.error("Payment URL error:", paymentError);
            toast.error("فشل في فتح صفحة الدفع");
            return;
          }
        } else {
          // CASH ON DELIVERY - Clear cart immediately
          clearCart();
          toast.success(response.message || "تم تأكيد طلبك بنجاح!");

          // Navigate to current orders
          navigate("/current-orders", {
            state: {
              orderId: orderId,
              message: "تم إرسال طلبك بنجاح",
              justSubmitted: true,
              timestamp: Date.now(),
              paymentType: paymentType,
              orderDetails: {
                total: total,
                itemsCount: items.length,
                totalSavings: totalItemDiscounts + couponDiscountAmount,
                restaurantName: items[0]?.restaurantName || "المطعم",
                couponUsed: appliedCoupon?.code || null,
              },
            },
          });
        }

        // Refresh orders in background
        setTimeout(() => {
          orderStore.fetchCurrentOrders().catch((error) => {
            console.error("Background order refresh failed:", error);
          });
        }, 1000);
      } else {
        console.error("Order submission failed:", response);
        toast.error(response.message || "فشل في إرسال الطلب");
      }
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("حدث خطأ في معالجة الطلب. يرجى المحاولة مرة أخرى");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFAA01]/5 to-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <CheckoutHeader onBack={handleBack} />

        {/* Show restoration indicator */}
        {isRestoring && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              🔄 جاري استعادة بيانات الطلب السابق...
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Forms Section */}
          <div className="xl:col-span-2 space-y-6">
            <ContactInfoCard user={user} notes={notes} setNotes={setNotes} />
            <CouponCard
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              appliedCoupon={appliedCoupon}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
              isValidating={isValidating}
            />
            <PaymentMethodCard
              paymentType={paymentType}
              setPaymentType={setPaymentType}
            />
          </div>

          {/* Order Summary */}
          <div className="xl:col-span-1">
            <OrderSummaryCard
              items={items}
              totalPrice={totalPrice}
              appliedCoupon={appliedCoupon}
              discountAmount={couponDiscountAmount}
              total={total}
              totalItemDiscounts={totalItemDiscounts}
              originalTotalPrice={originalTotalPrice}
              handleSubmitOrder={handleSubmitOrder}
              isProcessing={isProcessing}
              paymentType={paymentType}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
