
import React from 'react';
import { Plus, ShoppingCart, Star } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
      {/* Restaurant Header */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-8 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">{selectedRestaurant?.logo}</div>
          <h1 className="text-3xl font-black mb-2">{selectedRestaurant?.name}</h1>
          <div className="flex items-center justify-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-white" />
              <span className="font-bold">{selectedRestaurant?.rating}</span>
            </div>
            <span className="font-medium">{selectedRestaurant?.deliveryTime}</span>
            <span className="font-medium">{selectedRestaurant?.category}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Categories */}
        <section>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-2xl whitespace-nowrap font-bold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Most Ordered Items */}
        <section>
          <h3 className="text-2xl font-black text-gray-900 mb-6">الأكثر طلباً</h3>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {mockMenuItems.slice(0, 3).map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 min-w-[280px] group hover:shadow-xl transition-all duration-300">
                <div className="text-4xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                  {item.image}
                </div>
                <h4 className="font-bold text-lg mb-2 text-center group-hover:text-orange-600 transition-colors duration-300">
                  {item.name}
                </h4>
                <div className="text-center mb-4">
                  <span className="text-orange-600 font-black text-xl">{item.price.toFixed(2)}</span>
                  <span className="text-gray-500 font-semibold text-sm mr-1">ر.س</span>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-orange-500 hover:to-red-500 text-white py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  إضافة
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Menu Items */}
        <section>
          <h3 className="text-2xl font-black text-gray-900 mb-6">{selectedCategory}</h3>
          <div className="space-y-6">
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
        </section>
      </div>

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-3xl shadow-2xl flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-lg">{cart.length} عنصر</div>
              <div className="text-white/80 text-sm">في السلة</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="font-black text-2xl">{calculateTotal().toFixed(2)}</div>
              <div className="text-white/80 text-sm">ر.س</div>
            </div>
            <button
              onClick={() => setCurrentPage('cart')}
              className="bg-white text-green-600 px-8 py-4 rounded-2xl font-black hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
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
