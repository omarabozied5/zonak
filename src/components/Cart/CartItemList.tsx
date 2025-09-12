import React from "react";
import { Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { CartItem } from "../../types/types";
import CartItemOptions from "./CartItemOptions";

interface CartItemsListProps {
  items: CartItem[];
  onQuantityUpdate: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem: (item: CartItem) => void;
  hasCustomizations: (item: CartItem) => boolean;
  isCollapsed?: boolean;
}

const CartItemsList: React.FC<CartItemsListProps> = ({
  items,
  onQuantityUpdate,
  onRemoveItem,
  onEditItem,
  hasCustomizations,
  isCollapsed = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const itemHasCustomizations = (item: CartItem): boolean => {
    if (item.isCustomizable) return true;

    if (item.selectedOptions) {
      const hasRequiredOptions =
        item.selectedOptions.requiredOptions &&
        Object.keys(item.selectedOptions.requiredOptions).length > 0;
      const hasOptionalOptions =
        item.selectedOptions.optionalOptions &&
        item.selectedOptions.optionalOptions.length > 0;
      const hasNotes =
        item.selectedOptions.notes &&
        item.selectedOptions.notes.trim().length > 0;
      const hasSize = item.selectedOptions.size;

      return !!(
        hasRequiredOptions ||
        hasOptionalOptions ||
        hasNotes ||
        hasSize
      );
    }

    return hasCustomizations(item);
  };

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

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (isCollapsed) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Dropdown Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        dir="rtl"
      >
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-gray-900">ملخص الطلب</div>
          <div className="text-xs text-gray-500">
            {totalItems} منتجات • {totalPrice.toFixed(2)} ر.س
          </div>
        </div>

        <div className="text-gray-400">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="space-y-3 p-4">
            {items.map((item) => {
              const hasDiscount = (item.discountAmount || 0) > 0;
              const totalDiscount = (item.discountAmount || 0) * item.quantity;
              const originalPrice = item.originalPrice || item.price;
              const canEdit = itemHasCustomizations(item);

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-b-0"
                  dir="rtl"
                >
                  {/* Small Product Image */}
                  <div className="w-12 h-12 flex-shrink-0">
                    <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.image || "/api/placeholder/400/300"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">
                      {item.name}
                    </h4>

                    {/* Price */}
                    <div className="text-right mb-1">
                      {hasDiscount ? (
                        <div className="flex items-center gap-2 justify-end">
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
                    {itemHasCustomizations(item) && (
                      <div className="text-xs text-gray-500 mb-1">
                        <CartItemOptions item={item} />
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex-shrink-0">
                    {item.quantity === 1 ? (
                      <div className="bg-gray-100 rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm border border-gray-200">
                        <button
                          onClick={() => handleAddQuantity(item)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <span className="text-sm font-bold text-gray-700">
                            +
                          </span>
                        </button>
                        <span className="text-sm font-bold text-gray-900 text-center min-w-[16px]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleReduceQuantity(item)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm border border-gray-200">
                        <button
                          onClick={() => handleAddQuantity(item)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <span className="text-sm font-bold text-gray-700">
                            +
                          </span>
                        </button>
                        <span className="text-sm font-bold text-gray-900 text-center min-w-[16px]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleReduceQuantity(item)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <span className="text-sm font-bold text-gray-700">
                            −
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItemsList;
