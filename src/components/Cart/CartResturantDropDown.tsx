import React, { useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Store,
  MapPin,
  Clock,
} from "lucide-react";
import { CartItem, Restaurant } from "../../types/types";
import CartItemOptions from "./CartItemOptions";

interface CartRestaurantDropdownProps {
  // Restaurant info for header
  merchantId: string | number;
  restaurantName: string;
  placeId: string;
  restaurant: Restaurant | null;

  // Cart items data
  items: CartItem[];
  totalPrice: number;
  totalItemDiscounts: number;

  // Cart item handlers
  onQuantityUpdate: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem: (item: CartItem) => void;
  hasCustomizations: (item: CartItem) => boolean;
  onAddMoreItems?: () => void;

  // Optional customization
  defaultExpanded?: boolean;
  className?: string;
}

const CartRestaurantDropdown: React.FC<CartRestaurantDropdownProps> = ({
  merchantId,
  restaurantName,
  placeId,
  restaurant,
  items,
  totalPrice,
  totalItemDiscounts,
  onQuantityUpdate,
  onRemoveItem,
  onEditItem,
  hasCustomizations,
  onAddMoreItems,
  defaultExpanded = false,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleAddQuantity = (item: CartItem) => {
    onQuantityUpdate(item.id, item.quantity + 1);
  };

  const handleReduceQuantity = (item: CartItem) => {
    if (item.quantity === 1) {
      onRemoveItem(item.id);
    } else {
      onQuantityUpdate(item.id, item.quantity - 1);
    }
  };

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Get restaurant image
  const getRestaurantImage = () => {
    if (restaurant?.user?.profile_image) {
      if (Array.isArray(restaurant.user.profile_image)) {
        return (
          restaurant.user.profile_image.find(
            (img) => img && img.trim() !== ""
          ) || null
        );
      }
      return restaurant.user.profile_image &&
        restaurant.user.profile_image.trim() !== ""
        ? restaurant.user.profile_image
        : null;
    }
    return null;
  };

  const restaurantImage = getRestaurantImage();

  // Don't render if no items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className={`w-full bg-white shadow-sm border border-gray-100 ${className}`}
      dir="rtl"
    >
      {/* <span>ملخص الطلب</span> */}
      {/* Restaurant Header with Toggle */}
      <div
        className="flex items-center justify-between py-2 px-3 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Restaurant Image */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 rounded-full overflow-hidden bg-white flex items-center justify-center">
            {restaurantImage ? (
              <img
                src={restaurantImage}
                alt={restaurantName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`w-full h-full bg-[#22c55e] flex items-center justify-center ${
                restaurantImage ? "hidden" : "flex"
              }`}
              style={{ display: restaurantImage ? "none" : "flex" }}
            >
              <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {restaurantName || "مطعم غير محدد"}
              </h3>
              {/* <div className="flex-shrink-0 mr-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  طلبك جاهز
                </span>
              </div> */}
            </div>

            {/* Restaurant Address */}
            {/* {restaurant && (restaurant.address_ar || restaurant.address) && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {restaurant.address_ar || restaurant.address}
                </span>
              </div>
            )} */}

            {/* Distance and Delivery Time */}
            {/* <div className="flex items-center gap-3 text-xs text-gray-500">
              {restaurant?.distance && (
                <span className="flex items-center gap-1">
                  <span>المسافة:</span>
                  <span className="font-medium text-[#FBD252]">
                    {restaurant.distance.toFixed(1)} كم
                  </span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>15-25 دقيقة</span>
              </span>
            </div> */}

            {/* Cart Summary */}
            <div className="text-xs text-gray-600 mt-1 font-medium">
              {totalItems} منتج{totalItems > 1 ? "ات" : ""} •{" "}
              {totalPrice.toFixed(2)} ر.س
            </div>
          </div>
        </div>

        {/* Toggle Icon */}
        <div className="text-gray-400 flex-shrink-0 mr-2">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Add Products Button - Shows when collapsed */}
      {/* {!isExpanded && onAddMoreItems && (
        <div className="px-4 pb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddMoreItems();
            }}
            className="w-2/4 sm:w-auto bg-gray-100 rounded-full px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">
              إضافة منتجات
            </span>
          </button>
        </div>
      )} */}

      {/* Expandable Cart Items */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {/* Add Products Button - Shows when expanded */}
          {onAddMoreItems && (
            <div className="px-4 py-3 border-b border-gray-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddMoreItems();
                }}
                className="w-3/
                4 sm:w-auto bg-gray-100 rounded-full px-4 py-1 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">
                  إضافة منتجات
                </span>
              </button>
            </div>
          )}

          {/* Items List */}
          <div className="max-h-80 overflow-y-auto">
            {items.map((item) => {
              const hasDiscount = (item.discountAmount || 0) > 0;
              const originalPrice = item.originalPrice || item.price;
              const canEdit = hasCustomizations(item);

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-gray-50 last:border-b-0"
                >
                  {/* Product Image and Basic Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.image || "/api/placeholder/56/56"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                        {item.name}
                      </h4>

                      {/* Price */}
                      <div className="mb-2">
                        {hasDiscount ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {(item.price * item.quantity).toFixed(2)} ر.س
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              {(originalPrice * item.quantity).toFixed(2)} ر.س
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} ر.س
                          </span>
                        )}
                      </div>

                      {/* Options - Condensed */}
                      {canEdit && (
                        <div className="mb-2">
                          <CartItemOptions item={item} className="text-xs" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        {item.quantity === 1 ? (
                          <div className="bg-gray-100  px-1 py-1 flex items-center gap-1 shadow-sm border border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddQuantity(item);
                              }}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <span className="text-sm font-bold text-gray-700">
                                +
                              </span>
                            </button>
                            <span className="text-sm font-bold text-gray-900 text-center min-w-[20px]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReduceQuantity(item);
                              }}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-black" />
                            </button>
                          </div>
                        ) : (
                          <div className="bg-gray-100  px-2 py-1 flex items-center gap-1 shadow-sm border border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddQuantity(item);
                              }}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200  transition-colors"
                            >
                              <span className="text-sm font-bold text-gray-700">
                                +
                              </span>
                            </button>
                            <span className="text-sm font-bold text-gray-900 text-center min-w-[20px]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReduceQuantity(item);
                              }}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200  transition-colors"
                            >
                              <span className="text-sm font-bold text-gray-700">
                                −
                              </span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Edit Button */}
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditItem(item);
                          }}
                          className="text-xs text-gray-800 hover:text-[#f9c52b] font-medium px-2 py-1 rounded hover:bg-[#FBD252]/10 transition-colors"
                        >
                          تعديل
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Controls Section */}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartRestaurantDropdown;
