import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartHeaderProps {
  userName: string;
  onGoBack: () => void;
}

const CartHeader: React.FC<CartHeaderProps> = ({ userName, onGoBack }) => {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onGoBack}
          className="border-[#FFAA01]/30 hover:bg-[#FFAA01]/10"
          aria-label="العودة للصفحة السابقة"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#053468]">
            سلة التسوق
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            مرحباً {userName}، راجع طلبك قبل المتابعة للدفع
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartHeader;
