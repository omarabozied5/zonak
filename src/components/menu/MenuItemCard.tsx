
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
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-3xl">{item.image}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-1">{item.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            <p className="text-yellow-600 font-semibold">{item.price.toFixed(2)} ر.س</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {cartItem ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.id, cartItem.quantity - 1)}
                className="bg-gray-200 p-1 rounded-full hover:bg-gray-300"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-semibold px-2">x{cartItem.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, cartItem.quantity + 1)}
                className="bg-yellow-400 p-1 rounded-full hover:bg-yellow-500"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(item)}
              className="bg-yellow-400 text-black px-4 py-2 rounded-full hover:bg-yellow-500 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              إضافة
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
