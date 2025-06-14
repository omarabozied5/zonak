
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { MenuItem, CartItem } from '../../store/useAppStore';

interface MenuItemCardProps {
  item: MenuItem;
  cartItem?: CartItem;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  item, 
  cartItem, 
  onAddToCart, 
  onUpdateQuantity 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-1">
            {/* Item Image */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl drop-shadow-sm">{item.image}</span>
              </div>
              {cartItem && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {cartItem.quantity}
                </div>
              )}
            </div>
            
            {/* Item Details */}
            <div className="flex-1 space-y-2">
              <h4 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                {item.name}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-orange-600">
                  {item.price.toFixed(2)}
                </span>
                <span className="text-lg font-semibold text-gray-500">ر.س</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {cartItem ? (
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-2 py-1">
                <button
                  onClick={() => onUpdateQuantity(item.id, cartItem.quantity - 1)}
                  className="bg-white hover:bg-red-50 text-red-500 p-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 border border-red-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-lg px-3 text-gray-800 min-w-[3rem] text-center">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, cartItem.quantity + 1)}
                  className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white p-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(item)}
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-orange-500 hover:to-red-500 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                إضافة
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
