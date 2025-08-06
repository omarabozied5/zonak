import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderStore } from "@/hooks/useOrderStore";

// Components
import CheckoutHeader from "../components/checkout/CheckoutHeader";
import ContactInfoCard from "../components/checkout/ContactInfoCard";
import CouponCard from "../components/checkout/CouponCard";
import PaymentMethodCard from "../components/checkout/PaymentMethodCard";
import OrderSummaryCard from "../components/checkout/OrderSummaryCard";

// Hooks and Utils
import { useCoupon, useFormValidation } from "../hooks/useCheckout";
import { calculateDiscountAmount } from "../lib/couponUtils";
import { apiService, buildOrderPayload } from "../services/apiService";
import { OrderResponse, CartItem } from "../types/types";

interface OrderValidation {
  isValid: boolean;
  placeId?: number;
  merchantId?: number;
  categoryId?: number;
}

const calculateTotalItemDiscounts = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const itemDiscount = (item.discountAmount || 0) * item.quantity;
    return total + itemDiscount;
  }, 0);
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items, totalPrice, clearCart } = useCartStore(user?.id);
  const { validateForm } = useFormValidation();
  const orderStore = useOrderStore(user?.id?.toString());

  const [notes, setNotes] = useState<string>("");
  const [paymentType, setPaymentType] = useState<number>(1); // Default to Cash on Delivery
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const {
    couponCode,
    setCouponCode,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCoupon();

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

  if (!isAuthenticated || items.length === 0) return null;

  const totalItemDiscounts = calculateTotalItemDiscounts(items);
  const discountAmount = calculateDiscountAmount(totalPrice, appliedCoupon);
  const total = totalPrice - discountAmount;

  const handleBack = (): void => {
    navigate("/cart");
  };

  const validateOrderData = (): OrderValidation => {
    if (!items.length) {
      toast.error("السلة فارغة");
      return { isValid: false };
    }

    console.log("=== DEBUGGING ORDER VALIDATION ===");

    const firstItem = items[0];

    // Debug all items
    items.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        id: item.id,
        productId: item.productId,
        categoryId: item.categoryId,
        price: item.price,
        totalPriceWithModifiers: item.totalPriceWithModifiers,
        quantity: item.quantity,
        restaurantId: item.restaurantId,
        placeId: item.placeId,
        name: item.name,
      });

      // Test ID parsing
      try {
        const baseId = item.id.includes("-") ? item.id.split("-")[0] : item.id;
        const numericId = parseInt(baseId, 10);
        console.log(`Base ID for ${item.id}: ${baseId} -> ${numericId}`);
        if (isNaN(numericId) || numericId <= 0) {
          console.error("❌ Invalid base ID:", item.id);
        }
      } catch (e) {
        console.error("❌ Error parsing item ID:", item.id, e);
      }
    });

    // Validate restaurantId (merchant_id)
    if (
      !firstItem.restaurantId ||
      firstItem.restaurantId.toString().trim() === ""
    ) {
      toast.error("معرف المطعم مفقود - يرجى إعادة اختيار العناصر");
      console.error("Missing restaurant ID:", {
        restaurantId: firstItem.restaurantId,
      });
      return { isValid: false };
    }

    // Validate placeId
    if (!firstItem.placeId || firstItem.placeId.toString().trim() === "") {
      toast.error("معرف الفرع مفقود - يرجى إعادة اختيار العناصر");
      console.error("Missing place ID:", { placeId: firstItem.placeId });
      return { isValid: false };
    }

    // Check for items with missing or invalid data
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
      console.error("Invalid items found:", invalidItems);
      toast.error("بعض العناصر في السلة غير صالحة - يرجى إعادة إضافة العناصر");
      return { isValid: false };
    }

    // Convert to numbers and validate
    const placeId = parseInt(firstItem.placeId.toString());
    const merchantId = parseInt(firstItem.restaurantId.toString());

    if (
      isNaN(placeId) ||
      isNaN(merchantId) ||
      placeId <= 0 ||
      merchantId <= 0
    ) {
      toast.error("معرف المطعم غير صحيح");
      console.error("Invalid restaurant IDs:", {
        placeId: firstItem.placeId,
        restaurantId: firstItem.restaurantId,
        parsedPlaceId: placeId,
        parsedMerchantId: merchantId,
      });
      return { isValid: false };
    }

    // Validate all items are from same restaurant
    const allFromSameRestaurant = items.every(
      (item) =>
        item.placeId === firstItem.placeId &&
        item.restaurantId === firstItem.restaurantId
    );

    if (!allFromSameRestaurant) {
      toast.error("لا يمكن طلب عناصر من مطاعم مختلفة في طلب واحد");
      console.error("Items from different restaurants found");
      return { isValid: false };
    }

    console.log("✅ Order validation successful:", { placeId, merchantId });
    console.log("=== END VALIDATION DEBUG ===");

    return { isValid: true, placeId, merchantId };
  };

  const handleSubmitOrder = async (): Promise<void> => {
    if (!validateForm(user, items, total, paymentType)) return;

    const validation = validateOrderData();
    if (!validation.isValid) return;

    const { placeId, merchantId } = validation;

    setIsProcessing(true);
    try {
      console.log("Building order payload with:", {
        itemsCount: items.length,
        placeId,
        merchantId,
        totalPrice: total,
        discountAmount,
        paymentType,
      });

      // Build the order payload with selected payment type
      const orderPayload = buildOrderPayload(
        items,
        placeId!,
        merchantId!,
        total,
        paymentType, // Use selected payment type
        discountAmount
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

        // Extract order ID from response
        const orderId =
          response.order_id || response.data?.order_id || response.data?.id;
        console.log("📝 Order ID from response:", orderId);

        // Clear cart on successful order
        clearCart();

        toast.success(response.message || "تم تأكيد طلبك بنجاح!");

        // Handle payment based on type
        if (paymentType === 0 && orderId) {
          // Online payment - get payment URL and redirect
          try {
            console.log("🔄 Getting payment URL for order:", orderId);
            const paymentResponse = await apiService.getPaymentUrl(orderId);

            if (paymentResponse.data) {
              console.log("💳 Opening payment URL:", paymentResponse.data);
              // Open payment URL in new tab
              window.open(paymentResponse.data, "_blank");

              toast.success("تم فتح صفحة الدفع في نافذة جديدة");
            } else {
              throw new Error("Payment URL not received");
            }
          } catch (paymentError) {
            console.error("Payment URL error:", paymentError);
            toast.error(
              "فشل في فتح صفحة الدفع. يمكنك المتابعة للطلبات الحالية"
            );
          }
        }

        // Refresh orders in background to get the new order
        setTimeout(() => {
          orderStore.fetchCurrentOrders().catch((error) => {
            console.error("Background order refresh failed:", error);
          });
        }, 1000);

        // Navigate with detailed state
        navigate("/current-orders", {
          state: {
            orderId: orderId,
            message:
              paymentType === 0
                ? "تم إرسال طلبك بنجاح - يرجى إكمال عملية الدفع"
                : "تم إرسال طلبك بنجاح",
            justSubmitted: true,
            timestamp: Date.now(),
            paymentType: paymentType,
            orderDetails: {
              total: total,
              itemsCount: items.length,
              restaurantName: items[0]?.restaurantName || "المطعم",
            },
          },
        });
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
              discountAmount={discountAmount}
              total={total}
              totalItemDiscounts={totalItemDiscounts}
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
