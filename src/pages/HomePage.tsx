
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
      
      <div className="px-6 py-8 space-y-12" dir="rtl">
        {/* Categories Section */}
        <section>
          <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">تصفح حسب الفئة</h2>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
            {['🍕 بيتزا', '🍔 برجر', '🥤 مشروبات', '🍟 وجبات سريعة', '🍰 حلويات', '☕ قهوة', '🥗 صحي'].map((category, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl px-8 py-4 shadow-md border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap group"
              >
                <span className="text-base font-bold text-gray-700 group-hover:text-orange-600 transition-colors duration-300">
                  {category}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Restaurants */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-900">المطاعم المميزة</h2>
            <button className="text-orange-600 hover:text-red-600 font-bold text-lg hover:scale-105 transition-all duration-300">
              عرض الكل
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockRestaurants.map(restaurant => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={handleRestaurantClick}
              />
            ))}
          </div>
        </section>

        {/* Popular Dishes */}
        <section>
          <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">الأطباق الشائعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mockMenuItems.slice(0, 4).map(item => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-6 group border border-gray-100"
              >
                <div className="text-4xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                  {item.image}
                </div>
                <h4 className="font-bold text-gray-900 text-base mb-2 text-center group-hover:text-orange-600 transition-colors duration-300">
                  {item.name}
                </h4>
                <div className="text-center">
                  <span className="text-orange-600 font-black text-lg">{item.price.toFixed(2)}</span>
                  <span className="text-gray-500 font-semibold text-sm mr-1">ر.س</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* How it Works */}
        <section>
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-10 border border-gray-100">
            <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">كيف يعمل التطبيق؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: '🔍', title: 'اختر مطعمك', desc: 'تصفح المطاعم واختر المفضل لديك' },
                { icon: '🛒', title: 'أضف للسلة', desc: 'اختر أطباقك المفضلة وأضفها للسلة' },
                { icon: '🚚', title: 'استلم طلبك', desc: 'استلم طلبك طازجاً في الوقت المحدد' }
              ].map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <h3 className="font-black text-gray-900 mb-3 text-xl group-hover:text-orange-600 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
