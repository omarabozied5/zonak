import { Coupon } from "../types/types";

// Available coupons (in real app, this would come from API)
export const availableCoupons: Coupon[] = [
  { code: "SAVE10", discount: 10, type: "percentage" },
  { code: "SAVE20", discount: 20, type: "percentage" },
  { code: "SAVE50", discount: 50, type: "percentage" },
  { code: "FIXED25", discount: 25, type: "fixed" },
];

export const calculateDiscountAmount = (
  totalPrice: number,
  appliedCoupon: Coupon | null
): number => {
  if (!appliedCoupon) return 0;

  return appliedCoupon.type === "percentage"
    ? (totalPrice * appliedCoupon.discount) / 100
    : appliedCoupon.discount;
};

export const findCouponByCode = (code: string): Coupon | undefined => {
  return availableCoupons.find(
    (c) => c.code.toLowerCase() === code.trim().toLowerCase()
  );
};
