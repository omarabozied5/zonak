import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Coupon } from "../components/checkout/types";
import { findCouponByCode } from "../lib/couponUtils";

export const useCoupon = () => {
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const applyCoupon = useCallback((): void => {
    if (!couponCode.trim()) {
      toast.error("يرجى إدخال رمز الخصم");
      return;
    }

    const coupon = findCouponByCode(couponCode);

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
  }, [couponCode, appliedCoupon]);

  const removeCoupon = useCallback((): void => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("تم إلغاء رمز الخصم");
  }, []);

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  };
};

export const useFormValidation = () => {
  const validateForm = useCallback(
    (user: any, items: any[], total: number): boolean => {
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
    },
    []
  );

  return { validateForm };
};
