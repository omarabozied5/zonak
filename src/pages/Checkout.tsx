// Updated Checkout.tsx with cashback integration
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderStore } from "@/hooks/useOrderStore";
import { usePaymentStore } from "@/stores/usePaymentStore";

// Components
import CheckoutHeader from "../components/checkout/CheckoutHeader";
import OffersSection from "../components/checkout/OfferSection";
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
import CheckoutRestaurantHeader from "@/components/checkout/CheckoutRestaurantHeader";

interface OrderValidation {
  isValid: boolean;
  placeId?: number;
  merchantId?: number;
}

// Cashback data interface
interface CashbackData {
  id: number;
  discount: number;
  max_daily_cashback: number | null;
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

  // Get placeId and merchantId from first item
  const placeId = items.length > 0 ? items[0].placeId : "";
  const merchantId = items.length > 0 ? items[0].restaurantId : "";

  // State for offers and cashback data
  const [offersData, setOffersData] = useState<any[]>([]);
  const [offersLoading, setOffersLoading] = useState<boolean>(false);
  const [cashbackData, setCashbackData] = useState<CashbackData | null>(null);
  const [cashbackBranch, setCashbackBranch] = useState<number>(0);
  const [maxCashbackPerOrder, setMaxCashbackPerOrder] = useState<number | null>(
    null
  );
  const [totalCashbackToday, setTotalCashbackToday] = useState<number>(0);

  // Function to fetch offers and cashback data
  const fetchOffers = async () => {
    if (!merchantId || !placeId) return;

    setOffersLoading(true);
    try {
      const response = await apiService.fetchCartOrderInfo(merchantId, placeId);

      // Set offers data
      setOffersData(response.offers || []);

      // Extract cashback data from API response
      setCashbackData(
        response.cashback
          ? {
              id: response.cashback.id,
              discount: response.cashback.discount || 0,
              max_daily_cashback: response.cashback.max_daily_cashback,
            }
          : null
      );
      setCashbackBranch(response.cashback_branch || 0);
      setMaxCashbackPerOrder(response.max || null);
      setTotalCashbackToday(response.cash || 0);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setOffersData([]);
      setCashbackData(null);
      setCashbackBranch(0);
      setMaxCashbackPerOrder(null);
      setTotalCashbackToday(0);
    } finally {
      setOffersLoading(false);
    }
  };

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

  // Fetch offers when component mounts or when merchantId/placeId changes
  useEffect(() => {
    if (merchantId && placeId) {
      fetchOffers();
    }
  }, [merchantId, placeId]);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (items.length > 0 && items[0].placeId) {
        try {
          const response = await apiService.fetchRestaurantDetails(
            items[0].placeId
          );

          if (response.message === "success" && response.data) {
            setRestaurant(response.data);
          } else {
            toast.error("تعذر تحميل بيانات المطعم حالياً");
          }
        } catch (error) {
          toast.error("حدث خطأ أثناء تحميل بيانات المطعم");
        }
      }
    };

    fetchRestaurantDetails();
  }, [items]);

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

      const orderPayload = buildOrderPayload(
        items,
        placeId!,
        merchantId!,
        total,
        paymentType,
        appliedCoupon,
        couponDiscountAmount
      );

      const response: OrderResponse = await apiService.submitOrder(
        orderPayload
      );

      if (response.success) {
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
      <div className="w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto bg-gray-50 relative">
        <CheckoutHeader onBack={handleBack} />

        {/* Show restoration indicator */}
        {isRestoring && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg mx-3 sm:mx-4 mt-4 mb-3">
            <p className="text-blue-700 text-sm p-3">
              🔄 جاري استعادة بيانات الطلب السابق...
            </p>
          </div>
        )}

        {/* Main content with proper spacing */}
        <div className="px-3 sm:px-4 md:px-5 pb-32 sm:pb-36 relative space-y-4 sm:space-y-5">
          {/* العروض Section */}
          <div className="pt-4 sm:pt-5">
            <OffersSection offers={offersData} loading={offersLoading} />
          </div>

          {/* القسائم Section */}
          <div>
            <CouponCard
              appliedCoupon={appliedCoupon}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
              isValidating={isValidating}
            />
          </div>

          {/* ملخص الطلب Section */}
          <div>
            {isLoadingRestaurant ? (
              <div className="bg-white rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-right">
                      <div className="h-4 w-16 sm:w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-12 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : (
              <CheckoutRestaurantHeader
                merchantId={merchantId}
                restaurantName={items[0]?.restaurantName || "مطعم"}
                placeId={placeId}
                items={items}
                totalPrice={totalPrice}
                totalItemDiscounts={totalItemDiscounts}
                defaultExpanded={false}
                onAddMoreItems={() => navigate("/restaurant/" + placeId)}
              />
            )}
          </div>

          {/* Price Breakdown */}
          <div>
            <PriceBreakdown
              totalPrice={totalPrice}
              totalItemDiscounts={totalItemDiscounts}
              couponDiscountAmount={couponDiscountAmount}
              total={total}
              itemCount={items.length}
            />
          </div>

          {/* طريقة الدفع Section */}
          <div>
            <PaymentMethodCard
              paymentType={paymentType}
              setPaymentType={setPaymentType}
              total={total}
            />
          </div>

          {/* Loyalty Points Banner */}
          <div>
            <LoyaltyBanner
              totalSavings={totalItemDiscounts + couponDiscountAmount}
              orderTotal={total}
              cashbackBranch={cashbackBranch}
              cashbackData={cashbackData}
              maxCashbackPerOrder={maxCashbackPerOrder}
              totalCashbackReceivedToday={totalCashbackToday}
            />
          </div>
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
