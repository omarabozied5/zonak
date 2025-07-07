import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Heart } from "lucide-react";
import { MostOrderedItem } from "@/hooks/useMostOrderedItems";

interface MostOrderedItemCardProps {
  item: MostOrderedItem;
  index: number;
  onAddToCart?: (item: MostOrderedItem) => void;
}

const MostOrderedItemCard: React.FC<MostOrderedItemCardProps> = ({
  item,
  index,
  onAddToCart,
}) => {
  const formatPrice = (price: number, newPrice?: number) => {
    if (newPrice && newPrice < price) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-base font-bold text-[#FFAA01]">
            {newPrice} ريال
          </span>
          <span className="text-xs text-gray-400 line-through">
            {price} ريال
          </span>
        </div>
      );
    }
    return (
      <span className="text-base font-bold text-[#FFAA01]">{price} ريال</span>
    );
  };

  const getItemImage = (item: MostOrderedItem) => {
    if (item.images && item.images.length > 0) {
      return item.images[0].image_url;
    }
    return null;
  };

  const isUnavailable = item.is_available !== 1;

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:shadow-[#FFAA01]/20 hover:-translate-y-2 relative overflow-hidden bg-white rounded-2xl w-[260px] h-[380px] flex flex-col mb-3">
      {/* Popularity Badge */}
      <div className="absolute top-3 right-3 z-20">
        <Badge className="bg-gradient-to-r from-[#FFAA01] to-[#ff8c00] text-white text-xs px-3 py-1.5 shadow-lg rounded-full font-semibold border-2 border-white/20">
          #{index + 1}
        </Badge>
      </div>

      {/* Offer Badge */}
      {item.has_offer === 1 && (
        <div className="absolute top-3 left-3 z-20">
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1.5 shadow-lg rounded-full font-semibold border-2 border-white/20 animate-pulse">
            عرض خاص
          </Badge>
        </div>
      )}

      {/* Favorite Button */}
      <div className="absolute top-4 left-1/4 transform -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <Button
          size="sm"
          variant="ghost"
          className="h-10 w-10 p-0 bg-white/95 hover:bg-white rounded-full shadow-xl backdrop-blur-sm hover:scale-110 border border-gray-100"
        >
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors duration-300" />
        </Button>
      </div>

      {/* Unavailable Overlay */}
      {isUnavailable && (
        <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center rounded-3xl">
          <span className="text-white text-sm font-semibold bg-gray-800/90 px-4 py-2 rounded-full">
            غير متوفر
          </span>
        </div>
      )}

      <CardContent className="p-0 h-full flex flex-col">
        {/* Item Image */}
        <div className="relative h-44 bg-gradient-to-br from-[#FFAA01]/10 to-[#053468]/10 overflow-hidden flex-shrink-0 rounded-t-2xl">
          {getItemImage(item) ? (
            <img
              src={getItemImage(item)!}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-60">
              {item.is_combo === 1 ? "🍽️" : "🍴"}
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Order Count Badge */}
          <div className="absolute bottom-3 left-3 bg-[#053468]/90 text-white px-3 py-1.5 rounded-full text-xs backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-1.5">
              <Star className="h-3 w-3 text-[#FFAA01] fill-current" />
              <span className="font-semibold">{item.order_count} طلب</span>
            </div>
          </div>
        </div>

        {/* Item Info */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Title & Description */}
            <div>
              <h3 className="text-base font-bold text-[#053468] line-clamp-2 group-hover:text-[#FFAA01] transition-colors duration-300 leading-tight min-h-[3rem]">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-gray-600 text-xs mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            {/* Categories */}
            {item.categories && item.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.categories.slice(0, 1).map((category) => (
                  <Badge
                    key={category.id}
                    variant="secondary"
                    className="bg-gradient-to-r from-[#FFAA01] to-[#ff8c00] text-white text-xs px-3 py-1 rounded-full font-semibold"
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Combo Badge & Time */}
            {/* <div className="flex items-center gap-2">
              {item.is_combo === 1 && (
                <Badge className="bg-gradient-to-r from-[#FFAA01] to-[#ff8c00] text-white text-xs px-3 py-1 rounded-full font-semibold">
                  كومبو
                </Badge>
              )}
              {item.minutes && (
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>{item.minutes} دقيقة</span>
                </div>
              )}
            </div> */}
          </div>

          {/* Price */}
          <div className="pt-3 border-t border-gray-100">
            <div className="text-center">
              {formatPrice(item.price, item.new_price)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MostOrderedItemCard;
