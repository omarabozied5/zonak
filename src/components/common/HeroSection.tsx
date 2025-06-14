
import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 overflow-hidden" dir="rtl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 text-6xl">🍕</div>
        <div className="absolute top-20 left-20 text-4xl">🍔</div>
        <div className="absolute bottom-20 right-1/4 text-5xl">🥤</div>
        <div className="absolute bottom-10 left-10 text-3xl">🍟</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-7xl opacity-5">🍽️</div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            اطلب طعامك المفضل
            <br />
            <span className="text-black">في دقائق معدودة</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            أشهى الأطباق من أفضل المطاعم تصلك طازجة وسريعة
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن مطعم أو طبق..."
                className="w-full px-6 py-4 rounded-full text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
              />
              <button className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 text-white">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">500+</div>
              <div className="text-sm md:text-base opacity-90">مطعم</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">15</div>
              <div className="text-sm md:text-base opacity-90">دقيقة متوسط التوصيل</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold">10k+</div>
              <div className="text-sm md:text-base opacity-90">عميل راضي</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-gray-50">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
