import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckoutHeaderProps {
  onBack: () => void;
}

const CheckoutHeader: React.FC<CheckoutHeaderProps> = React.memo(
  ({ onBack }) => (
    <div className="flex items-center mb-6 sm:mb-8">
      <Button
        variant="ghost"
        onClick={onBack}
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
  )
);

CheckoutHeader.displayName = "CheckoutHeader";

export default CheckoutHeader;
