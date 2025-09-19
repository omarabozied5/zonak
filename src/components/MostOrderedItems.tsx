import React from "react";
import { Button } from "@/components/ui/button";
import { Restaurant } from "@/types/types";
import {
  useMostOrderedItems,
  MostOrderedItem,
} from "@/hooks/useMostOrderedItems";
import { Loader2 } from "lucide-react";
import MostOrderedItemCard from "./MostOrderedItemCard";

interface MostOrderedItemsProps {
  userId: string;
  placeId: string | number;
  onAddToCart?: (item: MostOrderedItem) => void;
  restaurant: Restaurant;
  restaurantName: string;
}

const MostOrderedItems: React.FC<MostOrderedItemsProps> = ({
  userId,
  placeId,
  onAddToCart,
  restaurant,
  restaurantName,
}) => {
  const { mostOrderedItems, loading, error, refetch } = useMostOrderedItems(
    userId,
    placeId
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl mx-4 my-4 p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#FFAA01] mx-auto" />
            <p className="text-gray-700 font-medium text-sm">
              جاري تحميل الأصناف الأكثر طلباً
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl mx-0 my-4 p-0">
        <div className="text-center py-8">
          <div className="text-4xl mb-3">😕</div>
          <p className="text-red-500 mb-4 font-medium text-sm">⚠️ {error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="text-[#FFAA01] border-[#FFAA01]/30 hover:bg-[#FFAA01]/5"
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  if (!mostOrderedItems || mostOrderedItems.length === 0) {
    return null;
  }

  // Show only first 3 items to match the design
  const displayItems = mostOrderedItems.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl mx-0 my-4 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-white px-7 py-2 rounded-t-2xl">
        <h2 className="text-sm font-bold text-black text-right leading-5">
          الأكثر طلباً
        </h2>
      </div>

      {/* Items Grid */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-4">
          {/* Items Images */}
          <div className="flex gap-2">
            {displayItems.map((item, index) => (
              <MostOrderedItemCard
                key={item.id}
                item={item}
                index={index}
                restaurant={restaurant}
                restaurantName={
                  restaurantName || restaurant?.merchant_name || "مطعم"
                }
                placeId={placeId || restaurant?.id}
                merchantId={userId || restaurant?.user_id}
                categoryId={item.categories?.[0]?.id || 0}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MostOrderedItems;
