import React, { useState, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CartItem, Restaurant } from "../../types/types";

interface CartDropdownProps {
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

  // Optional customization
  defaultExpanded?: boolean;
  className?: string;
}

const CartDropdown: React.FC<CartDropdownProps> = ({
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

  // Don't render if no items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`} dir="rtl">
      {/* Restaurant Header with Toggle */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          {/* Restaurant Image */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#22c55e] flex items-center justify-center">
            <span className="text-white font-bold text-sm">ك</span>
          </div>

          {/* Restaurant Info */}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {restaurantName || "كاس مختص"}
            </h3>
            <p className="text-xs text-gray-500">{totalItems} منتجات</p>
          </div>
        </div>

        {/* Toggle Icon */}
        <div className="text-gray-400">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Add Products Button */}
      {!isExpanded && (
        <div className="p-4 border-b border-gray-100">
          <button className="flex items-center gap-2 text-gray-600 text-sm hover:text-gray-800 transition-colors">
            <span className="text-lg">+</span>
            <span>إضافة منتجات</span>
          </button>
        </div>
      )}

      {/* Expandable Cart Items - Only render when expanded */}
      {isExpanded && items.length > 0 && (
        <div className="border-b border-gray-100">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-4 border-b border-gray-50 last:border-b-0"
            >
              {/* Product Image */}
              <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={item.image || "/api/placeholder/48/48"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 mb-1">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  {item.price.toFixed(2)} ر.س
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddQuantity(item)}
                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <span className="text-xs font-bold text-gray-700">+</span>
                  </button>
                  <span className="text-sm font-medium min-w-[20px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleReduceQuantity(item)}
                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <span className="text-xs font-bold text-gray-700">-</span>
                  </button>
                </div>
              </div>

              {/* Item Total Price */}
              <div className="text-sm font-semibold text-gray-900">
                {(item.price * item.quantity).toFixed(2)} ر.س
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="p-4 space-y-3">
        {/* Cart Value */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">قيمة السلة</span>
          <span className="font-medium">{totalPrice.toFixed(2)} ر.س</span>
        </div>

        {/* Discount */}
        {totalItemDiscounts > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">الخصم</span>
            <span className="font-medium text-green-600">
              -{totalItemDiscounts.toFixed(2)} ر.س
            </span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center text-base font-semibold border-t pt-3">
          <span className="text-gray-900">
            إجمالي الطلب
            <span className="text-xs font-normal text-gray-500 mr-1">
              ({totalItems} منتج{totalItems > 1 ? "ات" : ""})
            </span>
          </span>
          <span className="text-gray-900">{totalPrice.toFixed(2)} ر.س</span>
        </div>

        {/* Payment Method */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">طريقة الدفع</span>
            <span className="font-medium">الدفع عند الإستلام</span>
          </div>
        </div>

        {/* VAT Notice */}
        <div className="text-xs text-gray-400 text-center">
          جميع الأسعار شاملة ضريبة القيمة المضافة 15%
        </div>
      </div>
    </div>
  );
};

export default CartDropdown;
