import React from "react";
import { Button } from "@/components/ui/button";
import { Restaurant } from "@/types/types";
import {
  useMostOrderedItems,
  MostOrderedItem,
} from "@/hooks/useMostOrderedItems";
import { Loader2, TrendingUp, Sparkles } from "lucide-react";
import MostOrderedItemSlider from "./MostOrderedItemSlider";
import MostOrderedItemCard from "./MostOrderedItemCard";

interface MostOrderedItemsProps {
  userId: string;
  placeId: string | number; // Use string or number based on your API
  onAddToCart?: (item: MostOrderedItem) => void;
  restaurant: Restaurant; // Add restaurant prop
  restaurantName: string;
}

const MostOrderedItems: React.FC<MostOrderedItemsProps> = ({
  userId,
  placeId,
  onAddToCart,
  restaurant,
  restaurantName, // Add restaurant prop
}) => {
  const { mostOrderedItems, loading, error, refetch } = useMostOrderedItems(
    userId,
    placeId
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4 lg:p-6 mx-1 sm:mx-2 lg:mx-4">
        <div className="flex items-center justify-center py-6 sm:py-8 lg:py-12">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="relative">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 animate-spin text-[#FFAA01] mx-auto" />
              <div className="absolute inset-0 h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 animate-ping bg-[#FFAA01]/20 rounded-full mx-auto opacity-20"></div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-700 font-medium text-xs sm:text-sm lg:text-base">
                جاري تحميل الأصناف الأكثر طلباً
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">
                اكتشف الأطباق المفضلة لدى عملائنا
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4 lg:p-6 mx-1 sm:mx-2 lg:mx-4">
        <div className="text-center py-6 sm:py-8 lg:py-12">
          <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 sm:mb-3">
            😕
          </div>
          <p className="text-red-500 mb-3 sm:mb-4 font-medium text-xs sm:text-sm lg:text-base">
            ⚠️ {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="text-[#FFAA01] border-[#FFAA01]/30 hover:bg-[#FFAA01]/5 hover:border-[#FFAA01] rounded-lg px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 font-medium transition-all duration-300 text-xs sm:text-sm lg:text-base"
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

  return (
    <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden mx-1 sm:mx-2 lg:mx-4 my-3 sm:my-4 lg:my-6">
      {/* Header */}
      <div className="relative p-3 sm:p-4 lg:p-6 xl:p-8 bg-gradient-to-br from-[#FFAA01]/10 via-[#FFD700]/10 to-[#FFAA01]/5 border-b border-[#FFAA01]/10">
        {/* Background Pattern - Hidden on mobile for cleaner look */}
        <div className="absolute inset-0 opacity-5 hidden sm:block">
          <div className="absolute top-2 sm:top-4 right-4 sm:right-8 text-2xl sm:text-3xl lg:text-4xl">
            🍽️
          </div>
          <div className="absolute bottom-2 sm:bottom-4 left-4 sm:left-8 text-xl sm:text-2xl lg:text-3xl">
            ⭐
          </div>
          <div className="absolute top-4 sm:top-8 left-1/4 text-lg sm:text-xl lg:text-2xl">
            🔥
          </div>
          <div className="absolute bottom-3 sm:bottom-6 right-1/3 text-lg sm:text-xl lg:text-2xl">
            👑
          </div>
        </div>

        <div className="relative flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 lg:p-3 bg-gradient-to-br from-[#FFAA01] to-[#053468] rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 truncate">
                  الأصناف الأكثر طلباً
                </h2>
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-[#FFAA01] flex-shrink-0" />
              </div>
              <p className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base truncate">
                الأطباق المفضلة لدى عملائنا
              </p>
            </div>
          </div>

          {/* Stats Badge - Compact and always on same line */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 shadow-md flex-shrink-0">
            <div className="text-center">
              <div className="text-sm sm:text-base lg:text-lg font-bold text-[#FFAA01] leading-tight">
                {mostOrderedItems.length}
              </div>
              <div className="text-xs text-gray-600 leading-tight whitespace-nowrap">
                طبق مميز
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Slider - Adjusted padding for better mobile experience */}
      <div className="p-2 sm:p-3 lg:p-4 xl:p-6">
        <MostOrderedItemSlider
          itemsPerView={{
            mobile: 1.2,
            tablet: 2.2,
            desktop: 3.5,
            large: 4.5,
          }}
          gap={8}
        >
          {mostOrderedItems.map((item, index) => (
            <MostOrderedItemCard
              key={item.id}
              item={item}
              index={index}
              restaurant={restaurant}
              restaurantName={restaurantName || ""}
              placeId={placeId}
              merchantId={userId} // Using userId as merchantId since that's the pattern in your app
              categoryId={item.categories?.[0]?.id || 0}
              onAddToCart={onAddToCart}
            />
          ))}
        </MostOrderedItemSlider>
      </div>
    </div>
  );
};

export default MostOrderedItems;
