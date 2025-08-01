import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QuantityControls from "./QuntityControls";
import CartItemOptions from "./CartItemOptions";
import { CartItem } from "../../types/types";

interface CartItemProps {
  item: CartItem;
  onQuantityUpdate: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem: (item: CartItem) => void;
  hasCustomizations: (item: CartItem) => boolean;
}

const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  onQuantityUpdate,
  onRemoveItem,
  onEditItem,
  hasCustomizations,
}) => {
  const itemTotal = item.price * item.quantity;

  const handleQuantityIncrease = () => {
    onQuantityUpdate(item.id, item.quantity + 1);
  };

  const handleQuantityDecrease = () => {
    if (item.quantity > 1) {
      onQuantityUpdate(item.id, item.quantity - 1);
    } else {
      onRemoveItem(item.id);
    }
  };

  const handleEditClick = () => {
    onEditItem(item);
  };

  const handleRemoveClick = () => {
    onRemoveItem(item.id);
  };

  return (
    <Card className="border-[#FFAA01]/20 hover:shadow-lg transition-all duration-300 hover:border-[#FFAA01]/40">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Item Image & Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0 border-2 border-[#FFAA01]/20"
                loading="lazy"
              />
              <div className="absolute -top-2 -right-2 bg-[#FFAA01] text-[#053468] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {item.quantity}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-[#053468] truncate">
                {item.name}
              </h3>
              <p className="text-sm text-[#FFAA01] mb-1 truncate font-medium">
                {item.restaurantName}
              </p>
              {(item.discountAmount || 0) > 0 ? (
                <div className="text-sm mb-2 space-y-1">
                  <p className="text-gray-400 line-through">
                    {(item.originalPrice || item.price).toFixed(2)} ر.س ×{" "}
                    {item.quantity}
                  </p>
                  <p className="text-green-600">
                    {item.price.toFixed(2)} ر.س × {item.quantity}
                  </p>
                  <p className="text-xs text-green-600">
                    وفرت{" "}
                    {((item.discountAmount || 0) * item.quantity).toFixed(2)}{" "}
                    ر.س
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-2">
                  {item.price.toFixed(2)} ر.س × {item.quantity}
                </p>
              )}

              {/* Selected Options */}
              <CartItemOptions item={item} />
            </div>
          </div>

          {/* Quantity Controls & Actions */}
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-4">
            <QuantityControls
              quantity={item.quantity}
              onIncrease={handleQuantityIncrease}
              onDecrease={handleQuantityDecrease}
              minQuantity={0}
            />

            <div className="flex items-center gap-2">
              <p className="text-base sm:text-lg font-bold text-[#FFAA01] whitespace-nowrap">
                {itemTotal.toFixed(2)} ر.س
              </p>

              {/* Edit Button - Only show if item has customizations */}
              {hasCustomizations(item) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[#053468] hover:bg-[#053468]/10 border-[#053468]/30 h-8 px-3 text-xs font-medium"
                  onClick={handleEditClick}
                  title="تعديل الخيارات"
                  aria-label="تعديل خيارات الصنف"
                >
                  تعديل
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="text-red-500 hover:bg-red-50 border-red-200 h-8 w-8 p-0"
                onClick={handleRemoveClick}
                title="حذف من السلة"
                aria-label="حذف الصنف من السلة"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItemComponent;
