
import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../../store/useAppStore';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between gap-6">
          {/* Item Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">{item.image}</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-orange-600">{item.price.toFixed(2)}</span>
                <span className="text-sm font-semibold text-gray-500">ر.س</span>
              </div>
            </div>
          </div>
          
          {/* Quantity Controls and Total */}
          <div className="flex items-center gap-6">
            {/* Quantity Controls */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-2 py-1">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className={`p-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 ${
                  item.quantity === 1 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white hover:bg-gray-100 text-gray-600'
                }`}
              >
                {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
              
              <span className="font-bold text-lg px-4 text-gray-800 min-w-[3rem] text-center">
                {item.quantity}
              </span>
              
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white p-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Item Total */}
            <div className="text-right min-w-[100px]">
              <div className="text-2xl font-black text-gray-900">
                {(item.price * item.quantity).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 font-semibold">ر.س</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
