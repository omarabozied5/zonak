
import React from 'react';
import HeroSection from '../components/common/HeroSection';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import { useAppStore } from '../store/useAppStore';
import { mockRestaurants, mockMenuItems } from '../data/mockData';

const HomePage: React.FC = () => {
  const { setSelectedRestaurant, setCurrentPage } = useAppStore();

  const handleRestaurantClick = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setCurrentPage('restaurant');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <HeroSection />
      
      <div className="p-6" dir="rtl">
        {/* Categories Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">تصفح حسب الفئة</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {['🍕 بيتزا', '🍔 برجر', '🥤 مشروبات', '🍟 وجبات سريعة', '🍰 حلويات', '☕ قهوة', '🥗 صحي'].map((category, index) => (
              <div key={index} className="bg-white rounded-full px-6 py-3 shadow-sm border hover:shadow-md transition-shadow cursor-pointer whitespace-nowrap">
                <span className="text-sm font-medium text-gray-700">{category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Restaurants */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">المطاعم المميزة</h2>
            <button className="text-yellow-600 hover:text-yellow-700 font-medium">عرض الكل</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRestaurants.map(restaurant => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={handleRestaurantClick}
              />
            ))}
          </div>
        </div>

        {/* Popular Dishes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">الأطباق الشائعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockMenuItems.slice(0, 4).map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4">
                <div className="text-3xl mb-2 text-center">{item.image}</div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1 text-center">{item.name}</h4>
                <p className="text-yellow-600 font-bold text-center">{item.price.toFixed(2)} ر.س</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* How it Works */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">كيف يعمل التطبيق؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">اختر مطعمك</h3>
              <p className="text-gray-600 text-sm">تصفح المطاعم واختر المفضل لديك</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">أضف للسلة</h3>
              <p className="text-gray-600 text-sm">اختر أطباقك المفضلة وأضفها للسلة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">استلم طلبك</h3>
              <p className="text-gray-600 text-sm">استلم طلبك طازجاً في الوقت المحدد</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
