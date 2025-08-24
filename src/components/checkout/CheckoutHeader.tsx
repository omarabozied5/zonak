import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BackButton from "../ui/BackButton";

interface CheckoutHeaderProps {
  onBack: () => void;
}

const CheckoutHeader: React.FC<CheckoutHeaderProps> = React.memo(
  ({ onBack }) => (
    <div className="relative flex items-center justify-center  h-20 bg-white border-b">
      {/* Back Button on the right edge */}
      <div className="absolute right-4">
        <BackButton />
      </div>

      {/* Centered Title */}
      <h1 className="text-lg sm:text-xl font-bold text-black">إتمام الطلب</h1>
    </div>
  )
);

CheckoutHeader.displayName = "CheckoutHeader";

export default CheckoutHeader;
