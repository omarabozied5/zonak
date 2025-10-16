import React, { useState, useCallback, useMemo, memo } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, Store } from "lucide-react";
import { CartItem, Restaurant } from "../../types/types";
import CartItemOptions from "./CartItemOptions";

interface CartRestaurantDropdownProps {
  merchantId: string | number;
  restaurantName: string;
  placeId: string;
  restaurant: Restaurant | null;
  items: CartItem[];
  totalPrice: number;
  totalItemDiscounts: number;
  onQuantityUpdate: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem: (item: CartItem) => void;
  hasCustomizations: (item: CartItem) => boolean;
  onAddMoreItems?: () => void;
  defaultExpanded?: boolean;
  className?: string;
}

// Memoized item component
const CartItemRow = memo<{
  item: CartItem;
  canEdit: boolean;
  onAdd: () => void;
  onReduce: () => void;
  onEdit: () => void;
}>(({ item, canEdit, onAdd, onReduce, onEdit }) => {
  const hasDiscount = (item.discountAmount || 0) > 0;
  const originalPrice = item.originalPrice || item.price;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-gray-50 last:border-b-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={item.image || "/api/placeholder/56/56"}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
            {item.name}
          </h4>

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

          {canEdit && (
            <div className="mb-2">
              <CartItemOptions item={item} className="text-xs" />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 mb-2">
            <div className="bg-gray-100 px-1 py-1 flex items-center gap-1 shadow-sm border border-gray-200">
              <button
                onClick={onAdd}
                className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
              >
                <span className="text-sm font-bold text-gray-700">+</span>
              </button>
              <span className="text-sm font-bold text-gray-900 text-center min-w-[20px]">
                {item.quantity}
              </span>
              <button
                onClick={onReduce}
                className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
              >
                {item.quantity === 1 ? (
                  <Trash2 className="w-4 h-4 text-black" />
                ) : (
                  <span className="text-sm font-bold text-gray-700">−</span>
                )}
              </button>
            </div>
          </div>

          {canEdit && (
            <button
              onClick={onEdit}
              className="text-xs bg-gray-100 text-gray-800 hover:text-[#f9c52b] font-medium px-3 py-1 hover:bg-[#FBD252]/10 transition-colors"
            >
              تعديل
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

CartItemRow.displayName = "CartItemRow";

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

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const restaurantImage = useMemo(() => {
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
  }, [restaurant]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className={`w-full bg-white shadow-sm border border-gray-100 ${className}`}
      dir="rtl"
    >
      <div
        className="flex items-center justify-between py-2 px-3 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 rounded-full overflow-hidden bg-white flex items-center justify-center">
            {restaurantImage ? (
              <img
                src={restaurantImage}
                alt={restaurantName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-[#22c55e] flex items-center justify-center">
                <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {restaurantName || "مطعم غير محدد"}
              </h3>
            </div>

            <div className="text-xs text-gray-600 mt-1 font-medium">
              {totalItems} منتج{totalItems > 1 ? "ات" : ""} •{" "}
              {totalPrice.toFixed(2)} ر.س
            </div>
          </div>
        </div>

        <div className="text-gray-400 flex-shrink-0 mr-2">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100">
          {onAddMoreItems && (
            <div className="px-4 py-3 border-b border-gray-50">
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

          <div className="max-h-80 overflow-y-auto">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                canEdit={hasCustomizations(item)}
                onAdd={() => onQuantityUpdate(item.id, item.quantity + 1)}
                onReduce={() => {
                  if (item.quantity === 1) {
                    onRemoveItem(item.id);
                  } else {
                    onQuantityUpdate(item.id, item.quantity - 1);
                  }
                }}
                onEdit={() => onEditItem(item)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(CartRestaurantDropdown);

// Separate optimized CartItemOptions component
export const OptimizedCartItemOptions = memo<{
  item: CartItem;
  className?: string;
}>(({ item, className = "" }) => {
  const optionDisplays = useMemo(() => {
    if (!item.selectedOptions) return [];

    const displays: string[] = [];

    if (item.selectedOptions.size) {
      const sizeName =
        typeof item.selectedOptions.size === "object"
          ? item.selectedOptions.size.name
          : item.selectedOptions.size;
      displays.push(`الحجم: ${sizeName}`);
    }

    if (
      item.selectedOptions.requiredOptions &&
      Object.keys(item.selectedOptions.requiredOptions).length > 0
    ) {
      if (item.selectedOptions.requiredOptionNames) {
        Object.entries(item.selectedOptions.requiredOptionNames).forEach(
          ([groupName, optionName]) => {
            displays.push(`${groupName}: ${optionName}`);
          }
        );
      } else {
        const requiredCount = Object.keys(
          item.selectedOptions.requiredOptions
        ).length;
        displays.push(`الخيارات المطلوبة: ${requiredCount} خيار`);
      }
    }

    if (
      item.selectedOptions.optionalOptions &&
      item.selectedOptions.optionalOptions.length > 0
    ) {
      if (
        item.selectedOptions.optionalOptionNames &&
        item.selectedOptions.optionalOptionNames.length > 0
      ) {
        const optionsText = item.selectedOptions.optionalOptionNames.join("، ");
        displays.push(`الإضافات: ${optionsText}`);
      } else {
        displays.push(
          `الإضافات: ${item.selectedOptions.optionalOptions.length} إضافة`
        );
      }
    }

    if (item.selectedOptions.notes?.trim()) {
      displays.push(`ملاحظات: ${item.selectedOptions.notes.trim()}`);
    }

    return displays;
  }, [item.selectedOptions]);

  if (optionDisplays.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-gray-50 rounded-lg p-2 text-xs sm:text-sm text-gray-600 space-y-1 ${className}`}
    >
      {optionDisplays.map((display: string, index: number) => (
        <p key={index} className="truncate" title={display}>
          • {display}
        </p>
      ))}
    </div>
  );
});
