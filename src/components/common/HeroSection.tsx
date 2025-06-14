
import React from 'react';
import { Search } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 overflow-hidden min-h-[500px]" dir="rtl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-10 text-6xl animate-bounce delay-100">🍕</div>
        <div className="absolute top-20 left-20 text-4xl animate-pulse delay-300">🍔</div>
        <div className="absolute bottom-20 right-1/4 text-5xl animate-bounce delay-500">🥤</div>
        <div className="absolute bottom-10 left-10 text-3xl animate-pulse delay-700">🍟</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-10 animate-spin duration-[20s]">🍽️</div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
            اطلب طعامك المفضل
            <br />
            <span className="text-black drop-shadow-lg">في دقائق معدودة</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-10 max-w-2xl mx-auto font-medium">
            أشهى الأطباق من أفضل المطاعم تصلك طازجة وسريعة
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-lg mx-auto mb-12">
            <div className="relative group">
              <input
                type="text"
                placeholder="ابحث عن مطعم أو طبق..."
                className="w-full px-8 py-5 rounded-2xl text-gray-800 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-white/40 shadow-2xl transition-all duration-300 group-hover:shadow-3xl border-2 border-white/20"
              />
              <button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-orange-500 hover:to-red-500 p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                <Search className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          
          {/* Enhanced Stats */}
          <div className="flex justify-center gap-12 text-white">
            <div className="text-center group cursor-pointer">
              <div className="text-3xl md:text-4xl font-black mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
              <div className="text-base md:text-lg opacity-90 font-medium">مطعم شريك</div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="text-3xl md:text-4xl font-black mb-2 group-hover:scale-110 transition-transform duration-300">15</div>
              <div className="text-base md:text-lg opacity-90 font-medium">دقيقة توصيل</div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="text-3xl md:text-4xl font-black mb-2 group-hover:scale-110 transition-transform duration-300">10k+</div>
              <div className="text-base md:text-lg opacity-90 font-medium">عميل سعيد</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-gray-50">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
