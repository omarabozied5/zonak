// lib/couponUtils.ts - Updated to work with real API
export interface ValidatedCoupon {
  id: number;
  name: string;
  code: string;
  discount_value: number;
  discount_type: "percentage" | "fixed";
  minimum_order_value: string;
  max_coupoun_discount: number;
  start_datetime_coupoun: string;
  end_datetime_coupoun: string;
  count_usage: number;
  is_active: number;
  places: Array<{
    id: number;
    place_id: number;
    coupoun_id: number;
    is_active: number;
  }>;
  items: Array<{
    id: number;
    item_id: number;
    coupoun_id: number;
    is_active: number;
  }>;
}

export interface CouponValidationResponse {
  message: string;
  data: ValidatedCoupon;
}

export const calculateDiscountAmount = (
  totalPrice: number,
  appliedCoupon: ValidatedCoupon | null
): number => {
  if (!appliedCoupon) return 0;

  const discountValue = appliedCoupon.discount_value;
  const discountType = appliedCoupon.discount_type;

  let calculatedDiscount = 0;

  if (discountType === "percentage") {
    calculatedDiscount = (totalPrice * discountValue) / 100;
  } else {
    calculatedDiscount = discountValue;
  }

  // Apply maximum discount limit if set
  if (appliedCoupon.max_coupoun_discount > 0) {
    calculatedDiscount = Math.min(
      calculatedDiscount,
      appliedCoupon.max_coupoun_discount
    );
  }

  return Math.min(calculatedDiscount, totalPrice);
};
