import React from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface FloatingCartProps {
  userId?: string | null;
}

const FloatingCart: React.FC<FloatingCartProps> = ({ userId = null }) => {
  const { getTotalItems, totalPrice } = useCartStore(userId);
  const navigate = useNavigate();

  const totalItems = getTotalItems();

  // Don't render if cart is empty
  if (totalItems === 0) {
    return null;
  }

  const handleViewCart = () => {
    console.log("FloatingCart: Navigating to cart");
    navigate("/cart");
  };

  return (
    <>
      {/* Spacer div to prevent content from being hidden behind floating cart */}
      <div className="h-16 md:h-20" />

      <div className="fixed bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 z-50">
        <Card className="bg-[#FFAA01] text-white shadow-2xl border-[#FFAA01] transition-all duration-300 hover:shadow-3xl">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                <span className="font-semibold text-sm md:text-base whitespace-nowrap">
                  {totalItems} {totalItems === 1 ? "صنف" : "أصناف"}
                </span>
                <span className="mx-1 md:mx-2 text-sm md:text-base">•</span>
                <span className="font-bold text-sm md:text-base truncate">
                  {totalPrice.toFixed(2)} ر.س
                </span>
              </div>
              <Button
                variant="secondary"
                className="bg-white text-[#053468] hover:bg-gray-100 hover:text-[#053468] font-semibold text-sm md:text-base px-3 md:px-4 py-2 flex-shrink-0 transition-colors duration-200"
                onClick={handleViewCart}
              >
                عرض السلة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FloatingCart;
