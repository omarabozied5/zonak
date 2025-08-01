import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Heart, Plus, Eye } from "lucide-react";
import { MostOrderedItem } from "@/hooks/useMostOrderedItems";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createCartItem } from "@/lib/cartUtils";

interface MostOrderedItemCardProps {
  item: MostOrderedItem;
  index: number;
  placeId?: string | number; // Add placeId prop
  merchantId?: string | number; // Add merchantId prop
  categoryId: number;
  restaurantName: string;
  onAddToCart?: (item: MostOrderedItem) => void;
}

const MostOrderedItemCard: React.FC<MostOrderedItemCardProps> = ({
  item,
  index,
  restaurantName,
  placeId,
  merchantId,
  categoryId,
  onAddToCart,
}) => {
  const navigate = useNavigate();

  // Get current user ID from auth store
  const currentUserId = useAuthStore((state) => state.getUserId());

  // Get cart store instance for current user
  const cartStore = useCartStore(currentUserId);
  const { addItem, items } = cartStore;

  const hasOptions = item.options && item.options.length > 0;
  const isAvailable = item.is_available === 1;

  // Calculate total quantity for this specific menu item across all cart items
  const itemQuantity = React.useMemo(() => {
    return items
      .filter((cartItem) => {
        // Extract base item ID from cart item (remove timestamp suffix)
        const baseItemId = cartItem.id.split("-")[0];
        return baseItemId === item.id.toString();
      })
      .reduce((total, cartItem) => total + cartItem.quantity, 0);
  }, [items, item.id]);

  const handleAddToCart = () => {
    if (!isAvailable) {
      toast.error("هذا العنصر غير متوفر حالياً");
      return;
    }

    if (hasOptions) {
      navigate(`/item/${item.id}`);
      return;
    }

    // // Generate unique ID for cart item
    // const uniqueId = `${item.id}-${Date.now()}-${Math.random()
    //   .toString(36)
    //   .substr(2, 9)}`;

    const cartItem = createCartItem({
      item,
      restaurantName,
      placeId: placeId || "0", // Use placeId from props (this is place_id from URL)
      merchantId: merchantId,
      quantity: 1,
    });

    addItem(cartItem);
    toast.success(`تم إضافة ${item.name} إلى السلة`);

    // Call the optional callback
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  const handleViewDetails = () => navigate(`/item/${item.id}`);

  const formatPrice = (price: number, newPrice?: number) => {
    if (newPrice && newPrice < price) {
      return (
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="text-sm sm:text-base font-bold text-[#FFAA01]">
            {newPrice} ريال
          </span>
          <span className="text-xs text-gray-400 line-through">
            {price} ريال
          </span>
        </div>
      );
    }
    return (
      <span className="text-sm sm:text-base font-bold text-[#FFAA01]">
        {price} ريال
      </span>
    );
  };

  const getItemImage = (item: MostOrderedItem) => {
    if (item.images && item.images.length > 0) {
      return item.images[0].image_url;
    }
    return null;
  };

  const QuantityBadge = () => {
    if (itemQuantity === 0) return null;

    return (
      <div className="absolute -top-2 -right-4 z-20">
        <div className="relative">
          <Badge className="bg-white hover:bg-[#053468] text-black font-bold min-w-[20px] h-6 flex items-center justify-center px-1.5 rounded-full border-2 border-white shadow-lg transform transition-all duration-200">
            <span className="text-xs font-extrabold">x{itemQuantity}</span>
          </Badge>
          <div className="absolute inset-0 bg-[#053468] rounded-full animate-ping opacity-20"></div>
        </div>
      </div>
    );
  };

  const isUnavailable = item.is_available !== 1;

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:shadow-[#FFAA01]/20 hover:-translate-y-1 sm:hover:-translate-y-2 relative overflow-hidden bg-white rounded-xl sm:rounded-2xl w-full max-w-[280px] sm:max-w-[260px] lg:max-w-[280px] xl:max-w-[300px] mx-auto h-[370px] sm:h-[410px] lg:h-[430px] flex flex-col mb-3">
      {/* Popularity Badge */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20">
        <Badge className="bg-gradient-to-r from-[#FFAA01] to-[#ff8c00] text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg rounded-full font-semibold border-2 border-white/20">
          #{index + 1}
        </Badge>
      </div>

      {/* Offer Badge */}
      {item.has_offer === 1 && (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20">
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg rounded-full font-semibold border-2 border-white/20 animate-pulse">
            عرض خاص
          </Badge>
        </div>
      )}

      {/* Favorite Button */}
      {/* <div className="absolute top-3 sm:top-4 left-1/4 transform -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 sm:h-10 sm:w-10 p-0 bg-white/95 hover:bg-white rounded-full shadow-xl backdrop-blur-sm hover:scale-110 border border-gray-100"
        >
          <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 hover:text-red-500 transition-colors duration-300" />
        </Button>
      </div> */}

      {/* Unavailable Overlay */}
      {isUnavailable && (
        <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center rounded-xl sm:rounded-2xl">
          <span className="text-white text-xs sm:text-sm font-semibold bg-gray-800/90 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            غير متوفر
          </span>
        </div>
      )}

      <CardContent className="p-0 h-full flex flex-col">
        {/* Item Image */}
        <div className="relative h-36 sm:h-40 lg:h-44 bg-gradient-to-br from-[#FFAA01]/10 to-[#053468]/10 overflow-hidden flex-shrink-0 rounded-t-xl sm:rounded-t-2xl">
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
            <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl opacity-60">
              {item.is_combo === 1 ? "🍽️" : "🍴"}
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Order Count Badge */}
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-[#053468]/90 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Star className="h-3 w-3 text-[#FFAA01] fill-current" />
              <span className="font-semibold">{item.order_count} طلب</span>
            </div>
          </div>
        </div>

        {/* Item Info */}
        <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5 sm:space-y-2">
            {/* Title & Description */}
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#053468] line-clamp-2 group-hover:text-[#FFAA01] transition-colors duration-300 leading-tight min-h-[2.5rem] sm:min-h-[3rem]">
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
                    className="bg-gradient-to-r from-[#FFAA01] to-[#ff8c00] text-white text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold"
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="pt-2 sm:pt-3 border-t border-gray-100 mt-auto">
            {/* Price and Buttons in same line */}
            <div className="flex items-center justify-between gap-2">
              {/* Price */}
              <div className="flex-shrink-0">
                {formatPrice(item.price, item.new_price)}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewDetails}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-gray-100 rounded-full flex-shrink-0"
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                <div className="relative">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    size="sm"
                    className="h-8 px-3 sm:h-9 sm:px-4 text-xs sm:text-sm transition-all duration-300 bg-[#EFF2F3] hover:bg-[#E0E3E4] text-[#053468] disabled:bg-gray-300 rounded-full flex-shrink-0"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                    أضف
                  </Button>
                  <QuantityBadge />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MostOrderedItemCard;
