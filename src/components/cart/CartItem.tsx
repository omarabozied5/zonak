
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '../../store/useAppStore';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl">{item.image}</div>
          <div>
            <h4 className="font-semibold text-gray-800">{item.name}</h4>
            <p className="text-yellow-600 font-semibold">{item.price.toFixed(2)} ر.س</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="bg-gray-200 p-1 rounded-full hover:bg-gray-300"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-semibold px-3">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="bg-yellow-400 p-1 rounded-full hover:bg-yellow-500"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="font-semibold text-gray-800 min-w-[80px] text-left">
            {(item.price * item.quantity).toFixed(2)} ر.س
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
