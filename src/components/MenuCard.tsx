import React from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { MenuItem } from "@/hooks/useMenuItems";
import { Restaurant } from "@/types/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Clock } from "lucide-react";
import { createCartItem } from "@/lib/cartUtils";
import { useRestaurantStatus } from "@/hooks/useRestaurantStatus";

interface MenuCardProps {
  item: MenuItem;
  restaurant: Restaurant; // Add restaurant prop
  restaurantName: string;
  viewMode?: "list" | "grid";
  placeId?: string | number;
  merchantId?: string | number;
  categoryId: number;
}

const MenuCard = ({
  item,
  restaurant, // New prop
  restaurantName,
  viewMode = "list",
  placeId,
  merchantId,
  categoryId,
}: MenuCardProps) => {
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

  // Calculate total quantity for this menu item
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
      const searchParams = new URLSearchParams({
        placeId: placeId?.toString() || "",
        merchantId: merchantId?.toString() || "",
        restaurantName: restaurantName,
      });
      navigate(`/item/${item.id}?${searchParams}`);
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
  };

  const handleViewDetails = () => {
    const searchParams = new URLSearchParams({
      placeId: placeId?.toString() || "",
      merchantId: merchantId?.toString() || "",
      restaurantName: restaurantName,
    });
    navigate(`/item/${item.id}?${searchParams}`);
  };

  const formatPrice = (price: number, newPrice?: number | boolean) => {
    if (newPrice && typeof newPrice === "number" && newPrice < price) {
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

  // Status indicator for unavailable items
  const getStatusBadge = () => {
    if (!isItemAvailable) {
      return (
        <Badge variant="destructive" className="text-xs">
          غير متوفر
        </Badge>
      );
    }

    if (!restaurantStatus.canOrder) {
      return (
        <Badge
          className={`text-xs ${
            restaurantStatus.reasonClosed === "busy"
              ? "bg-amber-100 text-amber-800 border-amber-200"
              : "bg-red-100 text-red-800 border-red-200"
          }`}
        >
          <Clock className="h-3 w-3 mr-1" />
          {restaurantStatus.reasonClosed === "busy" ? "مشغول" : "مغلق"}
        </Badge>
      );
    }

    return null;
  };

  const GridView = () => (
    <Card
      className={`group relative overflow-hidden border transition-all duration-300 hover:shadow-lg ${
        canAddToCart
          ? "border-blue-200 hover:border-[#053468]"
          : "border-gray-200 opacity-75"
      } ${itemQuantity > 0 ? "ring-2 ring-[#FFAA01]/20" : ""}`}
    >
      <div className="aspect-square relative overflow-hidden">
        <img
          src={item.images?.[0]?.image_url || "/api/placeholder/400/300"}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Status overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300">
          {!canAddToCart && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              {getStatusBadge()}
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 leading-tight">
            {item.name}
          </h3>

          {item.description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex-1">
              {formatPrice(item.price, item.new_price)}
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewDetails}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              <div className="relative">
                <Button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  size="sm"
                  className={`h-7 px-2 sm:h-8 sm:px-3 text-xs sm:text-sm transition-all duration-300 ${
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
      </CardContent>
    </Card>
  );

  const ListView = () => (
    <Card
      className={`group overflow-hidden border transition-all duration-300 hover:shadow-md ${
        canAddToCart
          ? "border-blue-200 hover:border-[#053468]"
          : "border-gray-200 opacity-75"
      } ${itemQuantity > 0 ? "ring-2 ring-[#FFAA01]/20" : ""}`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex-shrink-0 relative overflow-hidden rounded-lg">
            <img
              src={item.images?.[0]?.image_url || "/api/placeholder/400/300"}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {!canAddToCart && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                {getStatusBadge()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 line-clamp-2 mb-1">
                  {item.name}
                </h3>

                {item.description && (
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-start gap-2">
                <div className="whitespace-nowrap">
                  {formatPrice(item.price, item.new_price)}
                </div>

                <div className="flex gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewDetails}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>

                  <div className="relative">
                    <Button
                      onClick={handleAddToCart}
                      disabled={!canAddToCart}
                      size="sm"
                      className={`h-7 px-2 sm:h-8 sm:px-3 text-xs sm:text-sm transition-all duration-300 ${
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
        </div>
      </CardContent>
    </Card>
  );

  return viewMode === "grid" ? <GridView /> : <ListView />;
};

export default MenuCard;
