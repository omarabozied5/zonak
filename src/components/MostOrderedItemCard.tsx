import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Heart, Plus, Eye } from "lucide-react";
import { MostOrderedItem } from "@/hooks/useMostOrderedItems";
import { Restaurant } from "@/types/types";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createCartItem } from "@/lib/cartUtils";
import { useRestaurantStatus } from "@/hooks/useRestaurantStatus";

interface MostOrderedItemCardProps {
  item: MostOrderedItem;
  index: number;
  restaurant: Restaurant; // Add restaurant prop
  placeId?: string | number;
  merchantId?: string | number;
  categoryId: number;
  restaurantName: string;
  onAddToCart?: (item: MostOrderedItem) => void;
}

const MostOrderedItemCard: React.FC<MostOrderedItemCardProps> = ({
  item,
  index,
  restaurant, // New prop
  restaurantName,
  placeId,
  merchantId,
  categoryId,
  onAddToCart,
}) => {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuthStore();
  const currentUserId = useAuthStore((state) => state.getUserId());
  const cartStore = useCartStore(currentUserId);
  const { addItem, items } = cartStore;

  // Get restaurant status
  const restaurantStatus = useRestaurantStatus(restaurant);

  const hasOptions = item.options && item.options.length > 0;
  const isItemAvailable = item.is_available === 1;

  // Combined availability check
  const canAddToCart =
    isAuthenticated && isItemAvailable && restaurantStatus.canOrder;

  // Calculate total quantity for this specific menu item across all cart items
  const itemQuantity = React.useMemo(() => {
    if (!isAuthenticated) return 0;

    return items
      .filter((cartItem) => {
        const baseItemId = cartItem.id.split("-")[0];
        return baseItemId === item.id.toString();
      })
      .reduce((total, cartItem) => total + cartItem.quantity, 0);
  }, [items, item.id, isAuthenticated]);

  const handleAddToCart = () => {
    // Check authentication first
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول لإضافة العناصر إلى السلة");
      return;
    }

    // Check restaurant status
    if (!restaurantStatus.canOrder) {
      toast.error(restaurantStatus.statusMessage);
      return;
    }

    // Check item availability
    if (!isItemAvailable) {
      toast.error("هذا العنصر غير متوفر حالياً");
      return;
    }

    if (hasOptions) {
      navigate(`/item/${item.id}`);
      return;
    }

    const cartItem = createCartItem({
      item,
      restaurantName,
      placeId: placeId || "0",
      merchantId: merchantId,
      quantity: 1,
    });

    addItem(cartItem);
    toast.success(`تم إضافة ${item.name} إلى السلة`);

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
    if (!isAuthenticated || itemQuantity === 0) return null;

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

  // Status indicator overlay
  const StatusOverlay = () => {
    if (canAddToCart) return null;

    return (
      <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center rounded-xl sm:rounded-2xl">
        <div className="text-center">
          <Badge
            className={`text-xs mb-2 ${
              !isItemAvailable
                ? "bg-red-500 text-white"
                : restaurantStatus.reasonClosed === "busy"
                ? "bg-amber-500 text-white"
                : "bg-gray-600 text-white"
            }`}
          >
            <Clock className="h-3 w-3 mr-1" />
            {!isItemAvailable
              ? "غير متوفر"
              : restaurantStatus.reasonClosed === "busy"
              ? "المطعم مشغول"
              : "المطعم مغلق"}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <Card
      className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:shadow-[#FFAA01]/20 hover:-translate-y-1 sm:hover:-translate-y-2 relative overflow-hidden bg-white rounded-xl sm:rounded-2xl w-full max-w-[280px] sm:max-w-[260px] lg:max-w-[280px] xl:max-w-[300px] mx-auto h-[370px] sm:h-[410px] lg:h-[430px] flex flex-col mb-3 ${
        !canAddToCart ? "opacity-80" : ""
      }`}
    >
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

      {/* Status Overlay */}
      <StatusOverlay />

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
                    disabled={!canAddToCart}
                    size="sm"
                    className={`h-8 px-3 sm:h-9 sm:px-4 text-xs sm:text-sm transition-all duration-300 rounded-full flex-shrink-0 ${
                      canAddToCart
                        ? "bg-[#EFF2F3] hover:bg-[#E0E3E4] text-[#053468]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
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
