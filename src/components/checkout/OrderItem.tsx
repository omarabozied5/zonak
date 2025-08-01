import React from "react";
import { CartItem } from "../../types/types";

interface OrderItemProps {
  item: CartItem;
}

const OrderItem: React.FC<OrderItemProps> = React.memo(({ item }) => {
  const hasDiscount = (item.discountAmount || 0) > 0;
  const totalDiscount = (item.discountAmount || 0) * item.quantity;
  const totalOriginalPrice = (item.originalPrice || item.price) * item.quantity;

  return (
    <div className="flex justify-between items-start text-sm gap-2">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.name}</p>
        <p className="text-gray-500 text-xs truncate">{item.restaurantName}</p>
        <p className="text-[#FFAA01] text-xs">الكمية: {item.quantity}</p>
        {hasDiscount && (
          <p className="text-green-600 text-xs">
            وفرت {totalDiscount.toFixed(2)} ر.س
          </p>
        )}
      </div>
      <div className="text-right whitespace-nowrap">
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
  );
});

OrderItem.displayName = "OrderItem";

export default OrderItem;
