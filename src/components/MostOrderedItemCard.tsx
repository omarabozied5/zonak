import React from "react";
import { Clock } from "lucide-react";
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
  restaurant: Restaurant;
  placeId?: string | number;
  merchantId?: string | number;
  categoryId: number;
  restaurantName: string;
  onAddToCart?: (item: MostOrderedItem) => void;
}

const MostOrderedItemCard: React.FC<MostOrderedItemCardProps> = ({
  item,
  index,
  restaurant,
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

  const handleRemoveFromCart = () => {
    if (!isAuthenticated) return;

    // Find the first cart item for this menu item
    const cartItem = items.find((cartItem) => {
      const baseItemId = cartItem.id.split("-")[0];
      return baseItemId === item.id.toString();
    });

    if (cartItem) {
      if (cartItem.quantity === 1) {
        // Remove the item completely
        cartStore.removeItem(cartItem.id);
        toast.success(`تم حذف ${item.name} من السلة`);
      } else {
        // Decrease quantity
        cartStore.updateQuantity(cartItem.id, cartItem.quantity - 1);
        toast.success(`تم تقليل كمية ${item.name}`);
      }
    }
  };

  const getItemImage = (item: MostOrderedItem) => {
    if (item.images && item.images.length > 0) {
      return item.images[0].image_url;
    }
    return null;
  };

  const formatPrice = (price: number, newPrice?: number) => {
    if (newPrice && newPrice < price) {
      return (
        <div className="text-center">
          <div className="text-xs font-medium text-black">{newPrice} ر.س</div>
          <div className="text-xs text-gray-400 line-through">{price} ر.س</div>
        </div>
      );
    }
    return (
      <div className="text-xs font-medium text-black text-center">
        {price} ر.س
      </div>
    );
  };

  // Status indicator overlay
  const StatusOverlay = () => {
    if (canAddToCart) return null;

    return (
      <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center rounded-lg">
        <div className="bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          {!isAuthenticated
            ? "يجب تسجيل الدخول"
            : !isItemAvailable
            ? "غير متوفر"
            : restaurantStatus.reasonClosed === "busy"
            ? "المطعم مشغول"
            : "المطعم مغلق"}
          <Clock className="h-3 w-3" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center pb-2">
      {/* Item Image with Controls */}
      <div className="relative w-[84px] h-[84px] mb-2">
        <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
          {getItemImage(item) ? (
            <img
              src={getItemImage(item)!}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl opacity-60">
              {item.is_combo === 1 ? "🍽️" : "🍴"}
            </div>
          )}

          {/* Status Overlay */}
          <StatusOverlay />

          {/* Quantity Controls */}
          <div className="absolute bottom-1 left-2 right-1  z-20">
            {itemQuantity === 0 && (
              // Case 1: Only big + button
              <div className="absolute bottom-0 right-0 z-20">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className={`w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center transition-all ${
                    canAddToCart
                      ? "hover:bg-gray-50"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <span className="text-base font-bold text-black">+</span>
                </button>
              </div>
            )}

            {itemQuantity === 1 && (
              // Case 3: delete | qty | +
              <div className="bg-white rounded-full px-3 py-1 flex items-center justify-between shadow-md border border-gray-200 w-full max-w-[90px]">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className="w-5 h-5 flex items-center justify-center transition-all hover:bg-gray-50 rounded-full"
                >
                  <span className="text-base font-bold text-black">+</span>
                </button>

                <span className="text-sm font-bold text-black text-center">
                  {itemQuantity}
                </span>
                <button
                  onClick={handleRemoveFromCart}
                  className="w-5 h-5 flex items-center justify-center transition-all hover:bg-gray-50 rounded-full"
                >
                  <img src="/delete.png" alt="delete" className="w-3 h-3" />
                </button>
              </div>
            )}

            {itemQuantity > 1 && (
              // Case 2: - | qty | +
              <div className="bg-white rounded-full px-3 py-1 flex items-center justify-between shadow-md border border-gray-200 w-full max-w-[90px]">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className="w-5 h-5 flex items-center justify-center transition-all hover:bg-gray-50 rounded-full"
                >
                  <span className="text-base font-bold text-black">+</span>
                </button>

                <span className="text-sm font-bold text-black text-center">
                  {itemQuantity}
                </span>
                <button
                  onClick={handleRemoveFromCart}
                  className="w-5 h-5 flex items-center justify-center transition-all hover:bg-gray-50 rounded-full"
                >
                  <span className="text-base font-bold text-black">−</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Name */}
      {/* Item Info (name + price) */}
      <div className="w-full px-1 flex flex-col items-start">
        {/* Item Name */}
        <p className="text-sm font-bold text-black leading-tight line-clamp-2 text-right">
          {item.name}
        </p>

        {/* Item Price */}
        <div className="text-right text-sm font-medium text-gray-800">
          {formatPrice(item.price, item.new_price)}
        </div>
      </div>
    </div>
  );
};

export default MostOrderedItemCard;
