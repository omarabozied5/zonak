import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentMethodCardProps {
  paymentType: number;
  setPaymentType: (type: number) => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = React.memo(
  ({ paymentType, setPaymentType }) => (
    <Card className="border-[#FFAA01]/20 max-w-lg mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="w-5 h-5 bg-[#FFAA01] rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">💳</span>
          </div>
          <span>طريقة الدفع</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Cash on Delivery */}
          <div
            onClick={() => setPaymentType(1)}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${
              paymentType === 1
                ? "border-[#FFAA01] bg-[#FFAA01]/5 shadow-sm"
                : "border-gray-200 hover:border-[#FFAA01]/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src="/cash-logo.png"
                alt="Cash"
                className="h-6 w-6 flex-shrink-0 object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs leading-tight">
                  الدفع عند الاستلام
                </p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5 truncate">
                  ادفع نقداً عند استلام الطلب
                </p>
              </div>
            </div>
          </div>

          {/* Pay Online */}
          <div
            onClick={() => setPaymentType(0)}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${
              paymentType === 0
                ? "border-[#FFAA01] bg-[#FFAA01]/5 shadow-sm"
                : "border-gray-200 hover:border-[#FFAA01]/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src="/visa-logo.png"
                alt="Visa"
                className="h-6 w-6 flex-shrink-0 object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs leading-tight">
                  الدفع الإلكتروني
                </p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5 truncate">
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
