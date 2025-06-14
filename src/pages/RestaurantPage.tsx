
import React from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { mockMenuItems, categories } from '../data/mockData';
import MenuItemCard from '../components/menu/MenuItemCard';

const RestaurantPage: React.FC = () => {
  const {
    selectedRestaurant,
    selectedCategory,
    setSelectedCategory,
    cart,
    addToCart,
    updateQuantity,
    calculateTotal,
    setCurrentPage
  } = useAppStore();

  const filteredItems = selectedCategory === 'الكل' 
    ? mockMenuItems.filter(item => item.restaurantId === selectedRestaurant?.id)
    : mockMenuItems.filter(item => item.category === selectedCategory && item.restaurantId === selectedRestaurant?.id);

  return (
    <div className="p-4" dir="rtl">
      {/* Categories */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Most Ordered Items */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">الأكثر طلباً</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {mockMenuItems.slice(0, 3).map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border p-3 min-w-[200px]">
              <div className="text-2xl mb-2">{item.image}</div>
              <h4 className="font-medium text-sm mb-1">{item.name}</h4>
              <p className="text-yellow-600 font-semibold">{item.price.toFixed(2)} ر.س</p>
              <button
                onClick={() => addToCart(item)}
                className="mt-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm hover:bg-yellow-500 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                إضافة
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div>
        <h3 className="text-lg font-semibold mb-3">{selectedCategory}</h3>
        <div className="space-y-4">
          {filteredItems.map(item => {
            const cartItem = cart.find(cartItem => cartItem.id === item.id);
            return (
              <MenuItemCard
                key={item.id}
                item={item}
                cartItem={cartItem}
                onAddToCart={addToCart}
                onUpdateQuantity={updateQuantity}
              />
            );
          })}
        </div>
      </div>

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 bg-yellow-400 text-black p-4 rounded-lg shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">{cart.length} عنصر</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold">{calculateTotal().toFixed(2)} ر.س</span>
            <button
              onClick={() => setCurrentPage('cart')}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              عرض السلة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPage;
