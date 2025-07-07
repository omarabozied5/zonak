import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, ShoppingCart, Heart } from "lucide-react";
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
          <span className="text-base font-bold text-orange-600">
            {newPrice} ريال
          </span>
          <span className="text-xs text-gray-400 line-through">
            {price} ريال
          </span>
        </div>
      );
    }
    return (
      <span className="text-base font-bold text-orange-600">{price} ريال</span>
    );
  };

  const getItemImage = (item: MostOrderedItem) => {
    if (item.images && item.images.length > 0) {
      return item.images[0].image_url;
    }
    return null;
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-500 border-0 shadow-md hover:shadow-orange-100 hover:-translate-y-1 relative overflow-hidden bg-white rounded-2xl w-full h-[420px] flex flex-col">
      {/* Popularity Badge */}
      <div className="absolute top-2.5 right-2.5 z-20">
        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 shadow-lg rounded-full font-medium">
          #{index + 1}
        </Badge>
      </div>

      {/* Offer Badge */}
      {item.has_offer === 1 && (
        <div className="absolute top-2.5 left-2.5 z-20">
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 shadow-lg rounded-full">
            عرض خاص
          </Badge>
        </div>
      )}

      {/* Favorite Icon */}
      <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-lg backdrop-blur-sm"
        >
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
        </Button>
      </div>

      <CardContent className="p-0 h-full flex flex-col">
        {/* Item Image - Fixed Height */}
        <div className="relative h-48 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden flex-shrink-0 rounded-t-2xl">
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
          ) : null}

          {/* Fallback when no image */}
          <div
            className={`${
              getItemImage(item) ? "hidden" : ""
            } w-full h-full flex items-center justify-center text-4xl opacity-60`}
          >
            {item.is_combo === 1 ? "🍽️" : "🍴"}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Order Count Overlay */}
          <div className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="font-medium">{item.order_count} طلب</span>
            </div>
          </div>
        </div>

        {/* Item Info - Flexible Height */}
        <div className="p-3 flex-1 flex flex-col justify-between min-h-0">
          <div className="space-y-2">
            <div>
              <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300 leading-tight min-h-[2.5rem]">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-gray-600 text-xs mt-1 line-clamp-2 leading-relaxed min-h-[2rem]">
                  {item.description}
                </p>
              )}
            </div>

            {/* Categories */}
            {item.categories && item.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
                {item.categories.slice(0, 1).map((category) => (
                  <Badge
                    key={category.id}
                    variant="secondary"
                    className="text-xs bg-orange-50 text-orange-700 hover:bg-orange-100 border-0 rounded-full px-2 py-0.5"
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Combo Badge & Minutes */}
            <div className="flex items-center justify-between min-h-[1.5rem]">
              <div className="flex items-center gap-1.5">
                {item.is_combo === 1 && (
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    كومبو
                  </Badge>
                )}
                {item.minutes && (
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>{item.minutes} دقيقة</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price and Add to Cart - Fixed at bottom */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            <div>{formatPrice(item.price, item.new_price)}</div>

            {/* <Button
              size="sm"
              onClick={() => onAddToCart?.(item)}
              disabled={item.is_available !== 1}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-3 py-1.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-105 transform text-xs font-medium shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="h-3 w-3 ml-1" />
              {item.is_available !== 1 ? "غير متوفر" : "أضف"}
            </Button> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MostOrderedItemCard;
