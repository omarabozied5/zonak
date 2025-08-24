import React from "react";
import { Plus } from "lucide-react";
import { ValidatedCoupon } from "../../lib/couponUtils";

interface CouponCardProps {
  appliedCoupon: ValidatedCoupon | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  applyCoupon: () => Promise<void>;
  removeCoupon: () => void;
  isValidating: boolean;
}

const CouponCard: React.FC<CouponCardProps> = ({
  appliedCoupon,
  couponCode,
  setCouponCode,
  applyCoupon,
  removeCoupon,
  isValidating,
}) => {
  return (
    <div>
      <h2 className="text-sm font-bold text-gray-900 mb-4 text-right">
        القسائم
      </h2>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {appliedCoupon ? (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 flex items-center gap-3 min-w-[120px] flex-shrink-0">
            <div className="text-center">
              <div className="text-base font-bold text-gray-900">
                {appliedCoupon.code}
              </div>
              <div className="text-xs text-gray-700">
                خصم {appliedCoupon.discount_value}
                {appliedCoupon.discount_type === "percentage" ? "%" : " ر.س"}
              </div>
            </div>
            <div className="h-8 border-r-2 border-dashed border-yellow-400"></div>
            <button
              onClick={removeCoupon}
              className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
            >
              إلغاء
            </button>
          </div>
        ) : (
          <div
            className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors min-w-[120px] flex-shrink-0"
            onClick={applyCoupon}
          >
            <Plus className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-700">إضافة قسيمة</span>
          </div>
        )}
      </div>

      {/* Hidden coupon input for functionality */}
      {!appliedCoupon && (
        <div className="mt-3">
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="أدخل رمز الخصم"
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:border-yellow-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isValidating && couponCode.trim()) {
                  applyCoupon();
                }
              }}
              disabled={isValidating}
            />
            <button
              onClick={applyCoupon}
              disabled={isValidating || !couponCode.trim()}
              className="px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-medium hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? "جاري التحقق..." : "تطبيق"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponCard;
