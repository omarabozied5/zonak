import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Truck, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const HeroSection = () => {
  const { isLoggedIn, getDisplayName } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FFAA01] via-[#FFAA01]/95 to-[#FFAA01]/90 py-12">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-8 left-8 w-16 h-16 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-16 w-12 h-12 bg-white rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-16 left-1/4 w-10 h-10 bg-white rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-white rounded-full animate-pulse delay-1000"></div>

        {/* Additional geometric shapes */}
        <div className="absolute top-12 left-1/3 w-8 h-8 bg-white transform rotate-45 animate-pulse delay-500"></div>
        <div className="absolute bottom-12 right-1/4 w-6 h-6 bg-white transform rotate-45 animate-pulse delay-900"></div>
      </div>

      {/* Content */}
      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        dir="rtl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-right">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 font-['Bahij_TheSansArabic']">
                أهلاً بك في
                <span className="block text-white/90">
                  <img
                    src="./public/logo.png"
                    width="150"
                    height="auto"
                    alt="Logo"
                  />
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-1">
                اكتشف أجمل المأكولات العربية الأصيلة
              </p>
              {isLoggedIn() && (
                <p className="text-base text-white/80">
                  مرحباً، {getDisplayName()}
                </p>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Truck className="text-white h-6 w-6" />
                </div>
                <p className="text-white text-sm font-medium">توصيل سريع</p>
                <p className="text-white/70 text-xs">أقل من 30 دقيقة</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Star className="text-white h-6 w-6" />
                </div>
                <p className="text-white text-sm font-medium">جودة عالية</p>
                <p className="text-white/70 text-xs">أفضل المطاعم</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="text-white h-6 w-6" />
                </div>
                <p className="text-white text-sm font-medium">متاح دائماً</p>
                <p className="text-white/70 text-xs">خدمة 24/7</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center justify-center lg:justify-start">
              <div className="inline-flex items-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <MapPin className="h-4 w-4 text-white" />
                <span className="text-white font-medium text-sm">
                  المدينة المنورة
                </span>
              </div>
            </div>
          </div>

          {/* Right Content - Search & Categories */}
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6">
              <h3 className="text-white font-semibold mb-4 text-center">
                ابحث عن مطعمك المفضل
              </h3>
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="اسم المطعم أو نوع الطعام..."
                  className="w-full pl-4 pr-12 py-3 rounded-2xl border-0 bg-white/95 backdrop-blur-sm text-right shadow-lg focus:ring-2 focus:ring-[#053468]/20"
                />
                <Button className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#053468] hover:bg-[#053468]/90 text-white px-4 py-2 rounded-xl text-sm">
                  بحث
                </Button>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6">
              <h3 className="text-white font-semibold mb-4 text-center">
                الأصناف المحبوبة
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center group cursor-pointer">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                    <span className="text-2xl">🍔</span>
                  </div>
                  <p className="text-white text-xs font-medium">برجر</p>
                </div>

                <div className="text-center group cursor-pointer">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                    <span className="text-2xl">🍕</span>
                  </div>
                  <p className="text-white text-xs font-medium">بيتزا</p>
                </div>

                <div className="text-center group cursor-pointer">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                    <span className="text-2xl">🥙</span>
                  </div>
                  <p className="text-white text-xs font-medium">شاورما</p>
                </div>

                <div className="text-center group cursor-pointer">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                    <span className="text-2xl">🥤</span>
                  </div>
                  <p className="text-white text-xs font-medium">مشروبات</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
