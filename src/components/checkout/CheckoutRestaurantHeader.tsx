import React, { useState, useCallback, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Store,
  MapPin,
  Clock,
  Star,
  Plus,
} from "lucide-react";
import { CartItem, Restaurant } from "../../types/types";
import { apiService } from "@/services/apiService";

interface CheckoutRestaurantDropdownProps {
  // Restaurant info
  merchantId: string | number;
  restaurantName: string;
  placeId: string;

  // Cart items data
  items: CartItem[];
  totalPrice: number;
  totalItemDiscounts: number;

  // Optional customization
  defaultExpanded?: boolean;
  className?: string;
  onAddMoreItems?: () => void;
}

const CheckoutRestaurantHeader: React.FC<CheckoutRestaurantDropdownProps> = ({
  merchantId,
  restaurantName,
  placeId,
  items,
  totalPrice,
  totalItemDiscounts,
  defaultExpanded = false,
  className = "",
  onAddMoreItems,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (!placeId || placeId === "0" || placeId === "") {
        return;
      }

      setLoading(true);
      setImageError(false);

      try {
        const response = await apiService.fetchRestaurantDetails(placeId);
        if ((response.success || response.status === 200) && response.data) {
          setRestaurant(response.data);
        }
      } catch (err) {
        console.error("Error fetching restaurant details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [placeId, merchantId]);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Get restaurant image
  const getRestaurantImage = () => {
    if (restaurant?.user?.profile_image && !imageError) {
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
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Don't render if no items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className={`w-full bg-transparent rounded-lg shadow-sm  ${className}`}
      dir="rtl"
    >
      <div className="px-1 pt-3 font-bold text-md">
        <span>ملخص الطلب</span>
      </div>
      {/* Restaurant Header with Toggle */}
      <div
        className="flex items-center bg-white justify-between py-1 my-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Restaurant Image */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-[#FFAA01]/10 to-[#053468]/10 flex items-center justify-center relative">
            {loading ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#FFAA01] border-t-transparent rounded-full animate-spin"></div>
            ) : restaurantImage ? (
              <img
                src={restaurantImage}
                alt={restaurantName}
                className="w-full h-full object-cover transition-all duration-300"
                onError={handleImageError}
                loading="eager"
              />
            ) : (
              // Fallback with decorative background
              <div className="w-full h-full bg-gradient-to-br from-[#FFAA01] to-[#FFD700] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-1 left-1 w-2 h-2 sm:w-3 sm:h-3 border border-white rounded-full animate-pulse"></div>
                  <div className="absolute bottom-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 border border-white rounded-full animate-pulse delay-1000"></div>
                </div>
                <Store className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10" />
              </div>
            )}
          </div>

          {/* Restaurant Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {restaurant?.title_ar || restaurantName || "مطعم غير محدد"}
              </h3>
            </div>

            {/* Cart Summary */}
            <div className="text-xs text-gray-600 mt-1 font-medium">
              {totalItems} منتج{totalItems > 1 ? "ات" : ""} •{" "}
              {totalPrice.toFixed(2)} ر.س
              {totalItemDiscounts > 0 && (
                <span className="text-green-600 mr-2">
                  • وفرت {totalItemDiscounts.toFixed(2)} ر.س
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Icon */}
        <div className="text-gray-400 flex-shrink-0 mr-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Add Products Button - Shows when collapsed */}
      {!isExpanded && onAddMoreItems && (
        <div className="px-4 pb-4 ">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddMoreItems();
            }}
            className="w-1/2 sm:w-3/4 bg-gray-100 rounded-full px-4 py-2 flex items-center justify-start gap-2 hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">
              إضافة منتجات
            </span>
          </button>
        </div>
      )}

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-white rounded-b-lg shadow-sm">
          {/* Add Products Button - Shows when expanded */}
          {onAddMoreItems && (
            <div className="px-4 py-3 border-b border-gray-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddMoreItems();
                }}
                className="w-1/2 sm:w-auto bg-gray-100 rounded-full px-4 py-2 flex items-center justify-start gap-2 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">
                  إضافة منتجات
                </span>
              </button>
            </div>
          )}

          {/* Items Summary */}
          <div className="p-4 space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">تفاصيل الطلب:</h4>

            {/* Items List - Now with images like cart */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => {
                const hasDiscount = (item.discountAmount || 0) > 0;
                const originalPrice = item.originalPrice || item.price;

                return (
                  <div
                    key={item.id}
                    className="flex items-center   border-b border-gray-50 last:border-b-0"
                  >
                    {/* Product Image */}
                    <div className="w-8 h-8 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.image || "/api/placeholder/48/48"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/api/placeholder/48/48";
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              x{item.quantity}
                            </span>
                            <span className="text-xs font-light text-gray-900 truncate">
                              {item.name}
                            </span>
                          </div>

                          {hasDiscount && (
                            <div className="text-xs text-gray-600 mt-1">
                              وفرت{" "}
                              {(
                                (originalPrice - item.price) *
                                item.quantity
                              ).toFixed(2)}{" "}
                              ر.س
                            </div>
                          )}
                        </div>

                        {/* Price Section */}
                        <div className="text-right flex-shrink-0 mr-2">
                          {hasDiscount ? (
                            <div className="space-y-1">
                              <div className="text-xs text-gray-400 line-through">
                                {(originalPrice * item.quantity).toFixed(2)} ر.س
                              </div>
                              <div className="text-xs font-semibold text-gray-900">
                                {(item.price * item.quantity).toFixed(2)} ر.س
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs font-semibold text-gray-900">
                              {(item.price * item.quantity).toFixed(2)} ر.س
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Summary */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              {totalItemDiscounts > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">إجمالي الخصومات</span>
                  <span className="text-green-600 font-medium">
                    -{totalItemDiscounts.toFixed(2)} ر.س
                  </span>
                </div>
              )}

              <div className="flex justify-between text-base font-semibold">
                <span className="text-gray-900">المجموع</span>
                <span className="text-gray-900">
                  {totalPrice.toFixed(2)} ر.س
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutRestaurantHeader;
