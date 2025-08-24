// Updated Checkout.tsx with separated components
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderStore } from "@/hooks/useOrderStore";
import { usePaymentStore } from "@/stores/usePaymentStore";

// Components
import CheckoutHeader from "../components/checkout/CheckoutHeader";
import CouponCard from "../components/checkout/CouponCard";
import OrderSummaryCard from "../components/checkout/OrderSummaryCard";
import PriceBreakdown from "../components/checkout/PriceBreakdown";
import PaymentMethodCard from "../components/checkout/PaymentMethodCard";
import LoyaltyBanner from "../components/checkout/LoyaltyBanner";
import CheckoutCTAButton from "../components/checkout/CheckoutCTAButton";

// Hooks and Utils
import { useCoupon } from "../hooks/useCoupon";
import { useFormValidation } from "../hooks/useCheckout";
import { useCheckoutRestoration } from "../hooks/useCheckoutRestoration";
import { calculateDiscountAmount } from "../lib/couponUtils";
import {
  calculateTotalItemDiscounts,
  calculateOriginalTotal,
} from "../lib/cartUtils";
import { apiService, buildOrderPayload } from "../services/apiService";
import { OrderResponse, CartItem, User, Restaurant } from "../types/types";

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
  const [isLoadingRestaurant, setIsLoadingRestaurant] =
    useState<boolean>(false);

  const [paymentType, setPaymentType] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  // Get placeId from first item for coupon validation
  const placeId = items.length > 0 ? items[0].placeId : "";

  const {
    couponCode,
    setCouponCode,
    appliedCoupon,
    setAppliedCoupon,
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

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (items.length > 0 && items[0].placeId) {
        try {
          const response = await apiService.fetchRestaurantDetails(
            items[0].placeId
          );
          console.log("API response:", response);
          console.log("User data:", response.data?.user);
          console.log("Profile image:", response.data?.user?.profile_image);
          if (response.message === "success" && response.data) {
            console.log("Calling setRestaurant with:", response.data); // Add this
            setRestaurant(response.data);
            console.log("setRestaurant called"); // Add this
          }
        } catch (error) {
          console.error("Error fetching restaurant details:", error);
        }
      }
    };

    fetchRestaurantDetails();
  }, [items]);

  // Add this useEffect to monitor restaurant state changes
  useEffect(() => {
    console.log("Restaurant state changed to:", restaurant);
  }, [restaurant]);

  // Apply restored state when available
  useEffect(() => {
    if (isRestoring) {
      applyRestoredState(
        setNotes,
        setPaymentType,
        setCouponCode,
        setAppliedCoupon || (() => {})
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
        items: [...items],
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
        timestamp: Date.now(),
        restaurantInfo: {
          placeId: placeId!,
          merchantId: merchantId!,
          restaurantName: items[0]?.restaurantName || "",
        },
      };

      console.log("Building order payload...");

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

      const response: OrderResponse = await apiService.submitOrder(
        orderPayload
      );

      if (response.success) {
        console.log("Order submitted successfully:", response);

        const orderId =
          response.order_id || response.data?.order_id || response.data?.id;

        if (paymentType === 0 && orderId) {
          try {
            const paymentResponse = await apiService.getPaymentUrl(orderId);

            if (paymentResponse.data) {
              paymentStore.initiatePay(
                checkoutData,
                orderId.toString(),
                paymentResponse.data
              );

              paymentStore.updateCheckoutFormState({
                notes,
                paymentType,
                couponCode: appliedCoupon?.code || couponCode,
              });

              paymentStore.markLeftAppForPayment();

              toast.success("تم إنشاء الطلب! جاري توجيهك لصفحة الدفع...", {
                duration: 3000,
              });

              console.log(
                "💳 Redirecting to payment URL:",
                paymentResponse.data
              );

              setTimeout(() => {
                window.location.href = paymentResponse.data;
              }, 1000);

              return;
            }
          } catch (paymentError) {
            console.error("Payment URL error:", paymentError);
            toast.error("فشل في فتح صفحة الدفع");
            return;
          }
        } else {
          clearCart();
          toast.success(response.message || "تم تأكيد طلبك بنجاح!");

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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-sm mx-auto bg-gray-50">
        <CheckoutHeader onBack={handleBack} />

        {/* Show restoration indicator */}
        {isRestoring && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg mx-4">
            <p className="text-blue-700 text-sm">
              🔄 جاري استعادة بيانات الطلب السابق...
            </p>
          </div>
        )}

        <div className="px-4 py-6 space-y-6 pb-24">
          {/* العروض Section */}

          {/* القسائم Section */}
          <CouponCard
            appliedCoupon={appliedCoupon}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            applyCoupon={applyCoupon}
            removeCoupon={removeCoupon}
            isValidating={isValidating}
          />

          {/* ملخص الطلب Section */}
          {console.log(
            "About to render OrderSummaryCard with restaurant:",
            restaurant
          )}

          {isLoadingRestaurant ? (
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <OrderSummaryCard items={items} restaurant={restaurant} />
          )}

          {/* Price Breakdown */}
          <PriceBreakdown
            totalPrice={totalPrice}
            totalItemDiscounts={totalItemDiscounts}
            couponDiscountAmount={couponDiscountAmount}
            total={total}
            itemCount={items.length}
          />

          {/* طريقة الدفع Section */}
          <PaymentMethodCard
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            total={total}
          />

          {/* Loyalty Points Banner */}
          <LoyaltyBanner
            totalSavings={totalItemDiscounts + couponDiscountAmount}
          />
        </div>

        {/* Fixed Bottom CTA Button */}
        <CheckoutCTAButton
          total={total}
          isProcessing={isProcessing}
          onSubmit={handleSubmitOrder}
        />
      </div>
    </div>
  );
};

export default Checkout;
