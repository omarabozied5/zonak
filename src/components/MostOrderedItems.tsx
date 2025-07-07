import React from "react";
import { Button } from "@/components/ui/button";
import {
  useMostOrderedItems,
  MostOrderedItem,
} from "@/hooks/useMostOrderedItems";
import { Loader2, TrendingUp, Sparkles } from "lucide-react";
import MostOrderedItemSlider from "./MostOrderedItemSlider";
import MostOrderedItemCard from "./MostOrderedItemCard";

interface MostOrderedItemsProps {
  userId: string;
  placeId: string;
  onAddToCart?: (item: MostOrderedItem) => void;
}

const MostOrderedItems: React.FC<MostOrderedItemsProps> = ({
  userId,
  placeId,
  onAddToCart,
}) => {
  const { mostOrderedItems, loading, error, refetch } = useMostOrderedItems(
    userId,
    placeId
  );

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mx-4">
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-[#FFAA01] mx-auto" />
              <div className="absolute inset-0 h-10 w-10 animate-ping bg-[#FFAA01]/20 rounded-full mx-auto opacity-20"></div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700 font-medium">
                جاري تحميل الأصناف الأكثر طلباً
              </p>
              <p className="text-gray-500 text-sm">
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
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mx-4">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-500 mb-4 font-medium">⚠️ {error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="text-[#FFAA01] border-[#FFAA01]/30 hover:bg-[#FFAA01]/5 hover:border-[#FFAA01] rounded-xl px-6 py-2 font-medium transition-all duration-300"
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
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mx-4 my-6">
      {/* Header */}
      <div className="relative p-8 bg-gradient-to-br from-[#FFAA01]/10 via-[#FFD700]/10 to-[#FFAA01]/5 border-b border-[#FFAA01]/10">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-8 text-4xl">🍽️</div>
          <div className="absolute bottom-4 left-8 text-3xl">⭐</div>
          <div className="absolute top-8 left-1/4 text-2xl">🔥</div>
          <div className="absolute bottom-6 right-1/3 text-2xl">👑</div>
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#FFAA01] to-[#053468] rounded-2xl shadow-lg">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  الأصناف الأكثر طلباً
                </h2>
                <Sparkles className="h-5 w-5 text-[#FFAA01]" />
              </div>
              <p className="text-gray-600 font-medium">
                الأطباق المفضلة لدى عملائنا
              </p>
            </div>
          </div>

          {/* Stats Badge */}
          <div className="hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-md">
            <div className="text-center">
              <div className="text-lg font-bold text-[#FFAA01]">
                {mostOrderedItems.length}
              </div>
              <div className="text-xs text-gray-600">طبق مميز</div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Slider */}
      <div className="p-6">
        <MostOrderedItemSlider
          itemsPerView={{
            mobile: 1,
            tablet: 2,
            desktop: 4,
          }}
          gap="1rem"
        >
          {mostOrderedItems.map((item, index) => (
            <MostOrderedItemCard
              key={item.id}
              item={item}
              index={index}
              onAddToCart={onAddToCart}
            />
          ))}
        </MostOrderedItemSlider>
      </div>
    </div>
  );
};

export default MostOrderedItems;
