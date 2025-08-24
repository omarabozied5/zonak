import React from "react";
import BackButton from "../ui/BackButton";

interface CartHeaderProps {
  onBack: () => void;
}

const CartHeader: React.FC<CartHeaderProps> = React.memo(({ onBack }) => (
  <div className="relative flex items-center justify-center h-20 bg-white border-b">
    {/* Back Button on the right edge */}
    <div className="absolute right-4">
      <BackButton />
    </div>

    {/* Centered Title */}
    <h1 className="text-lg sm:text-xl font-bold text-black">السلة</h1>
  </div>
));

CartHeader.displayName = "CartCheckoutHeader";

export default CartHeader;
