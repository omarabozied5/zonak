import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Phone, User, CreditCard, Clock } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore, CartItem } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrderStore } from "@/hooks/useOrderStore";

// Type definitions
interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Coupon {
  code: string;
  discount: number;
  type: "percentage" | "fixed";
}

interface ContactInfoCardProps {
  user: User | null;
  notes: string;
  setNotes: (notes: string) => void;
}

interface CouponCardProps {
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: Coupon | null;
  applyCoupon: () => void;
  removeCoupon: () => void;
}

interface OrderSummaryCardProps {
  items: CartItem[];
  totalPrice: number;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  total: number;
  handleSubmitOrder: () => void;
  isProcessing: boolean;
}

// Move components outside of the main component to prevent recreation on each render
const ContactInfoCard = React.memo<ContactInfoCardProps>(
  ({ user, notes, setNotes }) => (
    <Card className="border-[#FFAA01]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-[#FFAA01]" />
          <span>معلومات الاتصال</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="display-name" className="text-sm">
              الاسم
            </Label>
            <Input
              id="display-name"
              value={user?.name || ""}
              readOnly
              className="mt-1 bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div>
            <Label htmlFor="display-phone" className="text-sm">
              رقم الهاتف
            </Label>
            <Input
              id="display-phone"
              value={user?.phone || ""}
              readOnly
              className="mt-1 bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm">
            ملاحظات إضافية
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أي ملاحظات خاصة بالطلب..."
            className="mt-1 focus:border-[#FFAA01] focus:ring-[#FFAA01]"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  )
);

const CouponCard = React.memo<CouponCardProps>(
  ({ couponCode, setCouponCode, appliedCoupon, applyCoupon, removeCoupon }) => (
    <Card className="border-[#FFAA01]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5 text-[#FFAA01]" />
          <span>رمز الخصم</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="أدخل رمز الخصم"
            className="flex-1 focus:border-[#FFAA01] focus:ring-[#FFAA01]"
            disabled={!!appliedCoupon}
          />
          <Button
            onClick={applyCoupon}
            disabled={!!appliedCoupon}
            className="bg-[#FFAA01] hover:bg-[#FFAA01]/90 text-white"
          >
            تطبيق
          </Button>
        </div>

        {appliedCoupon && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">
                تم تطبيق رمز الخصم: {appliedCoupon.code}
              </p>
              <p className="text-xs text-green-600">
                خصم {appliedCoupon.discount}
                {appliedCoupon.type === "percentage" ? "%" : " ر.س"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeCoupon}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              إلغاء
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>أكواد الخصم المتاحة للتجربة:</p>
          <p>SAVE10 (10%) • SAVE20 (20%) • SAVE50 (50%) • FIXED25 (25 ر.س)</p>
        </div>
      </CardContent>
    </Card>
  )
);

const OrderSummaryCard = React.memo<OrderSummaryCardProps>(
  ({
    items,
    totalPrice,
    appliedCoupon,
    discountAmount,
    total,
    handleSubmitOrder,
    isProcessing,
  }) => (
    <Card className="border-[#FFAA01]/20 lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle className="text-lg">ملخص الطلب</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        <div className="space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start text-sm gap-2"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-gray-500 text-xs truncate">
                  {item.restaurantName}
                </p>
                <p className="text-[#FFAA01] text-xs">
                  الكمية: {item.quantity}
                </p>
              </div>
              <p className="font-semibold whitespace-nowrap text-sm">
                {(item.price * item.quantity).toFixed(2)} ر.س
              </p>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-[#FFAA01]/20 pt-4 space-y-2">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>المجموع الفرعي</span>
            <span>{totalPrice.toFixed(2)} ر.س</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-green-600 text-sm">
              <span>الخصم ({appliedCoupon.code})</span>
              <span>-{discountAmount.toFixed(2)} ر.س</span>
            </div>
          )}

          <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t border-[#FFAA01]/20">
            <span>المجموع الكلي</span>
            <span className="text-[#FFAA01]">{total.toFixed(2)} ر.س</span>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="bg-[#FFAA01]/10 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-[#FFAA01]" />
            <p className="text-sm font-medium">وقت التحضير المتوقع</p>
          </div>
          <p className="text-[#FFAA01] font-bold text-sm sm:text-base">
            15-20 دقيقة
          </p>
        </div>

        {/* Confirm Button */}
        <Button
          className="w-full bg-gradient-to-r from-[#FFAA01] to-[#FFAA01]/90 hover:from-[#FFAA01]/90 hover:to-[#FFAA01]/80 text-white text-base sm:text-lg py-3 rounded-xl hover:shadow-lg transition-all duration-300"
          onClick={handleSubmitOrder}
          disabled={isProcessing}
        >
          {isProcessing
            ? "جاري معالجة الطلب..."
            : `تأكيد الطلب - ${total.toFixed(2)} ر.س`}
        </Button>
      </CardContent>
    </Card>
  )
);

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items, totalPrice, clearCart } = useCartStore(user?.id);
  const { addOrder } = useOrderStore(user?.id);

  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [notes, setNotes] = useState<string>("");
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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

  // Available coupons (in real app, this would come from API)
  const availableCoupons: Coupon[] = [
    { code: "SAVE10", discount: 10, type: "percentage" },
    { code: "SAVE20", discount: 20, type: "percentage" },
    { code: "SAVE50", discount: 50, type: "percentage" },
    { code: "FIXED25", discount: 25, type: "fixed" },
  ];

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === "percentage"
      ? (totalPrice * appliedCoupon.discount) / 100
      : appliedCoupon.discount
    : 0;

  const total = totalPrice - discountAmount;

  const validateForm = (): boolean => {
    if (!user?.name || !user?.phone) {
      toast.error("معلومات المستخدم غير مكتملة");
      return false;
    }
    if (items.length === 0) {
      toast.error("السلة فارغة");
      return false;
    }
    if (total <= 0) {
      toast.error("إجمالي الطلب غير صحيح");
      return false;
    }
    return true;
  };

  const applyCoupon = (): void => {
    if (!couponCode.trim()) {
      toast.error("يرجى إدخال رمز الخصم");
      return;
    }

    const coupon = availableCoupons.find(
      (c) => c.code.toLowerCase() === couponCode.trim().toLowerCase()
    );

    if (!coupon) {
      toast.error("رمز الخصم غير صحيح");
      return;
    }

    if (appliedCoupon?.code === coupon.code) {
      toast.error("تم تطبيق هذا الرمز بالفعل");
      return;
    }

    setAppliedCoupon(coupon);
    toast.success(
      `تم تطبيق خصم ${coupon.discount}${
        coupon.type === "percentage" ? "%" : " ر.س"
      }`
    );
  };

  const removeCoupon = (): void => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("تم إلغاء رمز الخصم");
  };

  const handleSubmitOrder = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      await addOrder({
        items: [...items],
        customerInfo: {
          name: user?.name || "",
          phone: user?.phone || "",
          notes: notes.trim() || undefined,
        },
        orderType: "pickup", // Default to pickup, you can make this configurable
        paymentMethod,
        totalPrice,
        tax: 0, // Add tax calculation if needed
        deliveryFee: 0, // Add delivery fee if needed
        total,
      });

      clearCart();
      toast.success("تم تأكيد طلبك بنجاح!");
      navigate("/current-orders");
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("حدث خطأ في معالجة الطلب");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFAA01]/5 to-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/cart")}
            className="mr-2 sm:mr-4 p-2 hover:bg-[#FFAA01]/10"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#053468]">
              تنفيذ الطلب
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              أكمل بياناتك لتأكيد الطلب
            </p>
          </div>
        </div>

        {/* Main Content */}
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
          </div>

          {/* Order Summary */}
          <div className="xl:col-span-1">
            <OrderSummaryCard
              items={items}
              totalPrice={totalPrice}
              appliedCoupon={appliedCoupon}
              discountAmount={discountAmount}
              total={total}
              handleSubmitOrder={handleSubmitOrder}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
