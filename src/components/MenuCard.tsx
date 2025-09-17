"use client";

import React, { useState } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { MenuItem, Restaurant } from "@/types/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { createCartItem } from "@/lib/cartUtils";
import { useRestaurantStatus } from "@/hooks/useRestaurantStatus";
import LoginModal from "@/components/LoginModal";

interface MenuCardProps {
  item: MenuItem;
  restaurant?: Restaurant;
  restaurantName: string;
  placeId?: string | number;
  merchantId?: string | number;
  categoryId: number;
}

const MenuCard = ({
  item,
  restaurant,
  restaurantName,
  placeId,
  merchantId,
  categoryId,
}: MenuCardProps) => {
  console.log("🔍 MenuCard Debug - Props received:", {
    itemId: item.id,
    itemName: item.name,
    placeId: placeId,
    placeIdType: typeof placeId,
    merchantId: merchantId,
    merchantIdType: typeof merchantId,
    restaurantName: restaurantName,
    restaurantFromProp: restaurant?.id,
    restaurantUserId: restaurant?.user_id,
  });

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const currentUserId = useAuthStore((state) => state.getUserId());
  const cartStore = useCartStore(currentUserId);
  const { addItem, removeItem, items } = cartStore;
  const [showLoginModal, setShowLoginModal] = useState(false);

  const restaurantStatus = useRestaurantStatus(restaurant);

  const hasOptions = item.options && item.options.length > 0;
  const isItemAvailable = item.is_available === true || item.is_available === 1;

  const canAddToCart =
    isAuthenticated && isItemAvailable && restaurantStatus.canOrder;

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
    console.log("🛒 MenuCard - handleAddToCart called:", {
      hasOptions: hasOptions,
      placeId: placeId,
      merchantId: merchantId,
      finalURL: `${placeId?.toString() || "MISSING"}/${
        merchantId?.toString() || "MISSING"
      }/${restaurantName}`,
    });

    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول لإضافة العناصر إلى السلة");
      setShowLoginModal(true);
      return;
    }

    if (!restaurantStatus.canOrder) {
      toast.error(restaurantStatus.statusMessage);
      return;
    }

    if (!isItemAvailable) {
      toast.error("هذا العنصر غير متوفر حالياً");
      return;
    }

    if (hasOptions) {
      // 🔧 FIX: Ensure all required parameters are passed
      const searchParams = new URLSearchParams();

      // Validate and set placeId
      const validPlaceId = placeId?.toString() || "";
      const validMerchantId = merchantId?.toString() || "";

      if (!validPlaceId) {
        console.error("❌ Missing placeId for item with options");
        toast.error("معلومات المطعم مفقودة");
        return;
      }

      searchParams.set("placeId", validPlaceId);
      searchParams.set("merchantId", validMerchantId);
      searchParams.set("restaurantName", restaurantName || "");

      const navigationUrl = `/item/${item.id}?${searchParams.toString()}`;
      console.log("🔄 Navigating to:", navigationUrl);

      navigate(navigationUrl);
      return;
    }

    // For items without options, create cart item directly
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
  const handleIncreaseQuantity = () => {
    handleAddToCart();
  };

  const handleDecreaseQuantity = () => {
    if (!isAuthenticated || itemQuantity === 0) return;

    const cartItem = items.find((cartItem) => {
      const baseItemId = cartItem.id.split("-")[0];
      return baseItemId === item.id.toString();
    });

    if (cartItem) {
      if (cartItem.quantity > 1) {
        const updatedItem = { ...cartItem, quantity: cartItem.quantity - 1 };
        removeItem(cartItem.id);
        addItem(updatedItem);
        toast.success(`تم تقليل كمية ${item.name}`);
      } else {
        removeItem(cartItem.id);
        toast.success(`تم حذف ${item.name} من السلة`);
      }
    }
  };

  const formatPrice = (price: number, newPrice?: number | null) => {
    if (newPrice && newPrice < price) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-bold text-[#F7BD01]">
            {newPrice} ر.س
          </span>
          <span className="text-sm text-gray-400 line-through">
            {price} ر.س
          </span>
        </div>
      );
    }
    return (
      <span className="text-base sm:text-lg font-bold text-[#F7BD01]">
        {price} ر.س
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-sm shadow-none mb-1 overflow-hidden">
        <div className="flex items-start p-4" dir="rtl">
          {/* Image */}
          <div className="w-[82px] h-[82px] flex-shrink-0 ml-4 relative overflow-hidden rounded-xl">
            <img
              src={item.images?.[0]?.image_url || "/api/placeholder/400/300"}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
            {/* Title + Description */}
            <div className="mb-2">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 leading-tight mb-1">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            {/* Price + Controls row */}
            <div className="flex justify-between items-center mt-3">
              {/* Price on right */}
              <div className="flex-shrink-0 text-right">
                {formatPrice(item.price, item.new_price)}
              </div>

              {/* Controls on left */}
              <div className="flex items-center gap-2">
                {isAuthenticated && itemQuantity > 0 ? (
                  <div className="flex items-center bg-gray-50 rounded-lg border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-200 text-gray-600 rounded-r-lg"
                      onClick={handleDecreaseQuantity}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold text-sm min-w-[32px] text-center px-2">
                      {itemQuantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-200 text-gray-600 rounded-l-lg"
                      onClick={handleIncreaseQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleAddToCart}
                    size="sm"
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    أضف
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          // After successful login, you might want to add the item automatically
          // handleAddToCart();
        }}
      />
    </>
  );
};

export default MenuCard;
