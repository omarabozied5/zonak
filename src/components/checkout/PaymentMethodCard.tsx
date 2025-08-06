import React from "react";
import { CreditCard, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentMethodCardProps {
  paymentType: number;
  setPaymentType: (type: number) => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = React.memo(
  ({ paymentType, setPaymentType }) => (
    <Card className="border-[#FFAA01]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5 text-[#FFAA01]" />
          <span>طريقة الدفع</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Cash on Delivery */}
          <div
            onClick={() => setPaymentType(1)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              paymentType === 1
                ? "border-[#FFAA01] bg-[#FFAA01]/5"
                : "border-gray-200 hover:border-[#FFAA01]/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  paymentType === 1
                    ? "border-[#FFAA01] bg-[#FFAA01]"
                    : "border-gray-300"
                }`}
              >
                {paymentType === 1 && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <Banknote className="h-5 w-5 text-[#FFAA01]" />
              <div>
                <p className="font-medium text-sm">الدفع عند الاستلام</p>
                <p className="text-xs text-gray-500">
                  ادفع نقداً عند استلام الطلب
                </p>
              </div>
            </div>
          </div>

          {/* Pay Online */}
          <div
            onClick={() => setPaymentType(0)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              paymentType === 0
                ? "border-[#FFAA01] bg-[#FFAA01]/5"
                : "border-gray-200 hover:border-[#FFAA01]/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  paymentType === 0
                    ? "border-[#FFAA01] bg-[#FFAA01]"
                    : "border-gray-300"
                }`}
              >
                {paymentType === 0 && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <CreditCard className="h-5 w-5 text-[#FFAA01]" />
              <div>
                <p className="font-medium text-sm">الدفع الإلكتروني</p>
                <p className="text-xs text-gray-500">
                  ادفع الآن بالبطاقة أو المحفظة
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
);

PaymentMethodCard.displayName = "PaymentMethodCard";

export default PaymentMethodCard;
