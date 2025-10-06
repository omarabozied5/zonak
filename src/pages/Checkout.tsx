// Updated Checkout.tsx with payment flow navigation fixes
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderStore } from "@/hooks/useOrderStore";
import { usePaymentStore } from "@/stores/usePaymentStore";

// Components
import CheckoutHeader from "../components/checkout/CheckoutHeader";
import OffersSection from "../components/checkout/OfferSection";
import CouponCard from "../components/checkout/CouponCard";
import PriceBreakdown from "../components/checkout/PriceBreakdown";
import PaymentMethodCard from "../components/checkout/PaymentMethodCard";
import LoyaltyBanner from "../components/checkout/LoyaltyBanner";
import CheckoutCTAButton from "../components/checkout/CheckoutCTAButton";
import CheckoutRestaurantHeader from "@/components/checkout/CheckoutRestaurantHeader";

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
import { OrderResponse, CartItem, Restaurant } from "../types/types";

interface OrderValidation {
  isValid: boolean;
  placeId?: number;
  merchantId?: number;
}

interface CashbackData {
  id: number;
  discount: number;
  max_daily_cashback: number | null;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const cartStore = useCartStore(user?.id);
  const { items, totalPrice, clearCart } = cartStore;
  const { validateForm } = useFormValidation();
  const orderStore = useOrderStore(user?.id?.toString());
  const paymentStore = usePaymentStore();

  // ⭐ NEW: Detect if coming from failed payment
  const fromFailedPayment = location.state?.fromFailedPayment || false;

  const [notes, setNotes] = useState<string>("");
  const [isLoadingRestaurant, setIsLoadingRestaurant] =
    useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const placeId = items.length > 0 ? items[0].placeId : "";
  const merchantId = items.length > 0 ? items[0].restaurantId : "";

  const [offersData, setOffersData] = useState<any[]>([]);
  const [offersLoading, setOffersLoading] = useState<boolean>(false);
  const [cashbackData, setCashbackData] = useState<CashbackData | null>(null);
  const [cashbackBranch, setCashbackBranch] = useState<number>(0);
  const [maxCashbackPerOrder, setMaxCashbackPerOrder] = useState<number | null>(
    null
  );
  const [totalCashbackToday, setTotalCashbackToday] = useState<number>(0);

  const fetchOffers = async () => {
    if (!merchantId || !placeId) return;
    setOffersLoading(true);
    try {
      const response = await apiService.fetchCartOrderInfo(merchantId, placeId);
      setOffersData(response.offers || []);
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

  const { restorationState, applyRestoredState, isRestoring } =
    useCheckoutRestoration(user?.id || null, cartStore, {
      notes,
      paymentType,
      couponCode,
    });

  const totalItemDiscounts = calculateTotalItemDiscounts(items);
  const originalTotalPrice = calculateOriginalTotal(items);
  const couponDiscountAmount = calculateDiscountAmount(
    totalPrice,
    appliedCoupon
  );
  const total = totalPrice - couponDiscountAmount;

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

  // ⭐ UPDATED: Smart back navigation
  const handleBack = (): void => {
    if (fromFailedPayment) {
      // Coming from failed payment - replace history to avoid MyFatoorah
      navigate("/cart", { replace: true });
    } else {
      // Normal navigation
      navigate("/cart");
    }
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
          orderStore.fetchCurrentOrders().catch((error) => {});
        }, 1000);
      } else {
        toast.error(response.message || "فشل في إرسال الطلب");
      }
    } catch (error) {
      toast.error("حدث خطأ في معالجة الطلب. يرجى المحاولة مرة أخرى");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto bg-gray-50 relative">
        {/* ⭐ UPDATED: Pass fromFailedPayment flag */}
        <CheckoutHeader
          onBack={handleBack}
          fromFailedPayment={fromFailedPayment}
        />

        {isRestoring && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg mx-3 sm:mx-4 mt-4 mb-3">
            <p className="text-blue-700 text-sm p-3">
              جاري استعادة بيانات الطلب السابق...
            </p>
          </div>
        )}

        {/* ⭐ NEW: Failed payment notice */}
        {fromFailedPayment && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg mx-3 sm:mx-4 mt-4 mb-3">
            <p className="text-amber-800 text-sm p-3">
              💡 تم الاحتفاظ بجميع العناصر في السلة. يمكنك المحاولة مرة أخرى.
            </p>
          </div>
        )}

        <div className="px-3 sm:px-4 md:px-5 pb-32 sm:pb-36 relative space-y-4 sm:space-y-5">
          <div className="pt-4 sm:pt-5">
            <OffersSection offers={offersData} loading={offersLoading} />
          </div>

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

          <div>
            <PriceBreakdown
              totalPrice={totalPrice}
              totalItemDiscounts={totalItemDiscounts}
              couponDiscountAmount={couponDiscountAmount}
              total={total}
              itemCount={items.length}
            />
          </div>

          <div>
            <PaymentMethodCard
              paymentType={paymentType}
              setPaymentType={setPaymentType}
              total={total}
            />
          </div>

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
