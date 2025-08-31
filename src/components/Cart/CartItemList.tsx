import React from "react";
import { Plus, Minus, Edit2, Trash2 } from "lucide-react";
import { CartItem } from "../../types/types";
import CartItemOptions from "./CartItemOptions";

interface CartItemsListProps {
  items: CartItem[];
  onQuantityUpdate: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem: (item: CartItem) => void;
  hasCustomizations: (item: CartItem) => boolean; // Updated to accept CartItem instead of string
}

const CartItemsList: React.FC<CartItemsListProps> = ({
  items,
  onQuantityUpdate,
  onRemoveItem,
  onEditItem,
  hasCustomizations,
}) => {
  
  // Helper function to check if item has customizable options
  const itemHasCustomizations = (item: CartItem): boolean => {
    // Check if item is marked as customizable
    if (item.isCustomizable) return true;
    
    // Check if item has any selected options that make it customizable
    if (item.selectedOptions) {
      const hasRequiredOptions = item.selectedOptions.requiredOptions && 
        Object.keys(item.selectedOptions.requiredOptions).length > 0;
      const hasOptionalOptions = item.selectedOptions.optionalOptions && 
        item.selectedOptions.optionalOptions.length > 0;
      const hasNotes = item.selectedOptions.notes && 
        item.selectedOptions.notes.trim().length > 0;
      const hasSize = item.selectedOptions.size;
      
      return !!(hasRequiredOptions || hasOptionalOptions || hasNotes || hasSize);
    }
    
    // Fallback to passed function (though signature needs to be updated)
    return hasCustomizations(item);
  };
  return (
    <div>
      <h2 className="text-sm font-bold text-gray-900 mb-4 text-right">
        عناصر السلة
      </h2>

      <div className="bg-white rounded-lg divide-y divide-gray-100">
        {items.map((item) => {
          const hasDiscount = (item.discountAmount || 0) > 0;
          const totalDiscount = (item.discountAmount || 0) * item.quantity;
          const totalOriginalPrice =
            (item.originalPrice || item.price) * item.quantity;
          const canEdit = itemHasCustomizations(item);

          return (
            <div key={item.id} className="p-4">
              {/* Item Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-xs truncate mt-1">
                    {item.restaurantName}
                  </p>
                  {hasDiscount && (
                    <p className="text-green-600 text-xs mt-1">
                      وفرت {totalDiscount.toFixed(2)} ر.س
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="text-right whitespace-nowrap mr-3">
                  {hasDiscount ? (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 line-through">
                        {totalOriginalPrice.toFixed(2)} ر.س
                      </p>
                      <p className="font-semibold text-sm">
                        {(item.price * item.quantity).toFixed(2)} ر.س
                      </p>
                    </div>
                  ) : (
                    <p className="font-semibold text-sm">
                      {(item.price * item.quantity).toFixed(2)} ر.س
                    </p>
                  )}
                </div>
              </div>

              {/* Customizations - Use dedicated component */}
              <CartItemOptions item={item} className="mb-3" />

              {/* Actions */}
              <div className="flex items-center justify-between">
                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onQuantityUpdate(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#FFAA01] hover:bg-[#FFAA01]/10 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>

                  <span className="w-8 text-center font-medium text-gray-900">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => onQuantityUpdate(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#FFAA01] hover:bg-[#FFAA01]/10 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Edit and Delete Actions */}
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-2 text-gray-500 hover:text-[#FFAA01] transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartItemsList;