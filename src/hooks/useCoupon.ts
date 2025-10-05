// hooks/useCoupon.ts - Updated to use real API with user-friendly error messages
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { ValidatedCoupon, calculateDiscountAmount } from "@/lib/couponUtils";
import { couponApiService } from "@/services/couponApi";

interface UseCouponProps {
  totalPrice: number;
  placeId: string | number;
}

interface UseCouponReturn {
  // State
  couponCode: string;
  appliedCoupon: ValidatedCoupon | null;
  isValidating: boolean;

  // Computed values
  discountAmount: number;
  finalTotal: number;

  // Actions
  setCouponCode: (code: string) => void;
  applyCoupon: () => Promise<void>;
  removeCoupon: () => void;

  // Utilities
  hasCoupon: boolean;
  canApplyCoupon: boolean;
}

// Helper function to map error codes to user-friendly messages
const getErrorMessage = (error: any): string => {
  // Extract error code from various possible error structures
  const errorCode =
    error?.response?.data?.error ||
    error?.response?.data?.code ||
    error?.code ||
    error?.message;

  // Convert to string for comparison
  const errorStr = String(errorCode);

  // Map error codes to user-friendly Arabic messages
  if (errorStr === "101" || errorStr.includes("101")) {
    return "الرجاء إدخال كوبون صالح";
  }

  if (
    errorStr === "102" ||
    errorStr.includes("102") ||
    errorStr.includes("expired")
  ) {
    return "هذا الكوبون منتهي الصلاحية";
  }

  if (
    errorStr === "103" ||
    errorStr.includes("103") ||
    errorStr.includes("already used")
  ) {
    return "لقد استخدمت هذا الكوبون من قبل";
  }

  if (
    errorStr === "104" ||
    errorStr.includes("104") ||
    errorStr.includes("minimum")
  ) {
    return "الحد الأدنى للطلب غير مستوفى";
  }

  if (errorStr.includes("invalid") || errorStr.includes("not found")) {
    return "الرجاء إدخال كوبون صالح";
  }

  if (errorStr.includes("not active") || errorStr.includes("inactive")) {
    return "هذا الكوبون غير نشط حالياً";
  }

  if (errorStr.includes("limit") || errorStr.includes("exceeded")) {
    return "تم تجاوز حد استخدام هذا الكوبون";
  }

  // Default error message
  return "رمز الخصم غير صحيح";
};

export const useCoupon = ({
  totalPrice,
  placeId,
}: UseCouponProps): UseCouponReturn => {
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<ValidatedCoupon | null>(
    null
  );
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Calculate discount amount based on applied coupon
  const discountAmount = useMemo(() => {
    return calculateDiscountAmount(totalPrice, appliedCoupon);
  }, [totalPrice, appliedCoupon]);

  // Calculate final total after discount
  const finalTotal = useMemo(() => {
    return Math.max(0, totalPrice - discountAmount);
  }, [totalPrice, discountAmount]);

  // Validate and apply coupon
  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      toast.error("يرجى إدخال رمز الخصم");
      return;
    }

    if (!placeId) {
      toast.error("معرف المطعم غير متوفر");
      return;
    }

    if (appliedCoupon?.code === couponCode.trim()) {
      toast.error("تم تطبيق هذا الرمز بالفعل");
      return;
    }

    // Check minimum order value before API call to save unnecessary requests
    setIsValidating(true);

    try {
      const validatedCoupon = await couponApiService.validateCoupon(
        couponCode,
        placeId
      );

      // Check minimum order value
      const minOrderValue = parseFloat(
        validatedCoupon.minimum_order_value || "0"
      );
      if (minOrderValue > 0 && totalPrice < minOrderValue) {
        toast.error(
          `الحد الأدنى للطلب لاستخدام هذا الكوبون ${minOrderValue.toFixed(
            2
          )} ر.س`
        );
        return;
      }

      setAppliedCoupon(validatedCoupon);

      const discount = calculateDiscountAmount(totalPrice, validatedCoupon);
      const discountText =
        validatedCoupon.discount_type === "percentage"
          ? `${validatedCoupon.discount_value}%`
          : `${validatedCoupon.discount_value} ر.س`;

      toast.success(
        `تم تطبيق خصم ${discountText} - وفرت ${discount.toFixed(2)} ر.س`
      );

      // console.log("Coupon applied successfully:", {
      //   code: validatedCoupon.code,
      //   discountType: validatedCoupon.discount_type,
      //   discountValue: validatedCoupon.discount_value,
      //   calculatedDiscount: discount,
      // });
    } catch (error) {
      console.error("Coupon validation failed:", error);

      // Use the helper function to get user-friendly error message
      const userFriendlyError = getErrorMessage(error);
      toast.error(userFriendlyError);
    } finally {
      setIsValidating(false);
    }
  }, [couponCode, placeId, totalPrice, appliedCoupon]);

  // Remove coupon handler
  const removeCoupon = useCallback(() => {
    // console.log("Removing coupon:", appliedCoupon?.code);
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("تم إلغاء رمز الخصم");
  }, [appliedCoupon]);

  // Computed flags
  const hasCoupon = !!appliedCoupon;
  const canApplyCoupon =
    !hasCoupon && !!placeId && totalPrice > 0 && !isValidating;

  return {
    // State
    couponCode,
    appliedCoupon,
    isValidating,

    // Computed values
    discountAmount,
    finalTotal,

    // Actions
    setCouponCode,
    applyCoupon,
    removeCoupon,

    // Utilities
    hasCoupon,
    canApplyCoupon,
  };
};
