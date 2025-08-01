import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import RestaurantBadge from "./ResturantBadge";
import { Restaurant } from "@/types/types";

interface CartHeaderProps {
  userName: string;
  onGoBack: () => void;
  primaryRestaurant?: {
    merchantId: string | number;
    name: string;
    placeId: string;
  } | null;
}

const CartHeader: React.FC<CartHeaderProps> = ({
  userName,
  onGoBack,
  primaryRestaurant,
}) => {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Back Button and Title */}
      <div className="flex items-center gap-4 mb-6">
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

      {/* Restaurant Badge */}
      {primaryRestaurant && (
        <RestaurantBadge
          merchantId={primaryRestaurant.merchantId}
          restaurantName={primaryRestaurant.name}
          placeId={primaryRestaurant.placeId}
        />
      )}
    </div>
  );
};

export default CartHeader;
