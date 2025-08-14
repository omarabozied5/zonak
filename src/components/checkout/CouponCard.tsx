import React from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ValidatedCoupon } from "../../lib/couponUtils";

interface CouponCardProps {
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: ValidatedCoupon | null;
  applyCoupon: () => Promise<void>;
  removeCoupon: () => void;
  isValidating: boolean;
}

const CouponCard: React.FC<CouponCardProps> = React.memo(
  ({
    couponCode,
    setCouponCode,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    isValidating,
  }) => (
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
            disabled={!!appliedCoupon || isValidating}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !appliedCoupon && !isValidating) {
                applyCoupon();
              }
            }}
          />
          <Button
            onClick={applyCoupon}
            disabled={!!appliedCoupon || isValidating || !couponCode.trim()}
            className="bg-[#FFAA01] hover:bg-[#FFAA01]/90 text-white min-w-[80px]"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                التحقق
              </>
            ) : (
              "تطبيق"
            )}
          </Button>
        </div>

        {appliedCoupon && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">
                تم تطبيق رمز الخصم: {appliedCoupon.code}
              </p>
              <p className="text-xs text-green-600">
                خصم {appliedCoupon.discount_value}
                {appliedCoupon.discount_type === "percentage" ? "%" : " ر.س"}
              </p>
              {appliedCoupon.minimum_order_value &&
                parseFloat(appliedCoupon.minimum_order_value) > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    الحد الأدنى للطلب:{" "}
                    {parseFloat(appliedCoupon.minimum_order_value).toFixed(2)}{" "}
                    ر.س
                  </p>
                )}
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
          <p>أدخل رمز الخصم الخاص بك للحصول على خصم إضافي</p>
        </div>
      </CardContent>
    </Card>
  )
);

CouponCard.displayName = "CouponCard";

export default CouponCard;
