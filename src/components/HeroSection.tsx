import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Truck, Clock, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SearchResult {
  id: number;
  merchant_name: string;
  taddress: string;
  distance: number;
  review_average: number;
  category_name?: string;
  profile_image?: string;
  is_favor: boolean;
  user?: {
    full_name: string;
    is_exclusive_partner: number;
  };
}

interface HeroSectionProps {
  searchResults: SearchResult[];
  loading: boolean;
  searchQuery: string;
  showResults: boolean;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  onCategoryClick: (category: string) => void;
  onResultClick: (result: SearchResult) => void;
  onClearSearch: () => void;
  onHideResults: () => void;
}

// Feature data
const features = [
  {
    icon: Truck,
    title: "توصيل سريع",
    subtitle: "أقل من 30 دقيقة",
  },
  {
    icon: Star,
    title: "جودة عالية",
    subtitle: "أفضل المطاعم",
  },
  {
    icon: Clock,
    title: "متاح دائماً",
    subtitle: "خدمة 24/7",
  },
];

// Category data
const categories = [
  { name: "برجر", emoji: "🍔" },
  { name: "بيتزا", emoji: "🍕" },
  { name: "شاورما", emoji: "🥙" },
  { name: "مشروبات", emoji: "🥤" },
];

const HeroSection: React.FC<HeroSectionProps> = ({
  searchResults,
  loading,
  searchQuery,
  showResults,
  onSearchChange,
  onSearchSubmit,
  onCategoryClick,
  onResultClick,
  onClearSearch,
  onHideResults,
}) => {
  const { isLoggedIn, getDisplayName } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        onHideResults();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onHideResults]);

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FFAA01] via-[#FFAA01]/95 to-[#FFAA01]/90 py-8 sm:py-12 lg:py-16">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 sm:top-8 left-4 sm:left-8 w-12 sm:w-16 h-12 sm:h-16 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-16 sm:top-20 right-8 sm:right-16 w-8 sm:w-12 h-8 sm:h-12 bg-white rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-12 sm:bottom-16 left-1/4 w-6 sm:w-10 h-6 sm:h-10 bg-white rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-16 sm:bottom-20 right-1/3 w-10 sm:w-14 h-10 sm:h-14 bg-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-8 sm:top-12 left-1/3 w-4 sm:w-8 h-4 sm:h-8 bg-white transform rotate-45 animate-pulse delay-500"></div>
        <div className="absolute bottom-8 sm:bottom-12 right-1/4 w-3 sm:w-6 h-3 sm:h-6 bg-white transform rotate-45 animate-pulse delay-900"></div>
      </div>

      {/* Content */}
      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        dir="rtl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 font-['Bahij_TheSansArabic']">
                أهلاً بك في
              </h1>

              {/* Logo with responsive alignment */}
              <div className="flex justify-center lg:justify-start mb-3 sm:mb-4">
                <img
                  src="/logo.png"
                  width="120"
                  height="auto"
                  alt="Logo"
                  className="sm:w-[150px] max-w-full h-auto"
                />
              </div>

              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-2 sm:mb-3 px-2 sm:px-0">
                اكتشف أجمل المأكولات العربية الأصيلة
              </p>

              {isLoggedIn() && (
                <p className="text-sm sm:text-base text-white/80">
                  مرحباً، {getDisplayName()}
                </p>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-1 sm:mb-2 hover:scale-110 transition-transform duration-300">
                    <feature.icon className="text-white h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  <p className="text-white text-xs sm:text-sm font-medium">
                    {feature.title}
                  </p>
                  <p className="text-white/70 text-xs hidden sm:block">
                    {feature.subtitle}
                  </p>
                </div>
              ))}
            </div>

            {/* Location */}
            <div className="flex items-center justify-center lg:justify-start">
              <div className="inline-flex items-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                <span className="text-white font-medium text-xs sm:text-sm">
                  المدينة المنورة
                </span>
              </div>
            </div>
          </div>

          {/* Right Content - Search & Categories */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            {/* Search Bar */}
            <div
              className="bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative"
              ref={searchRef}
            >
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-center text-sm sm:text-base">
                ابحث عن مطعمك المفضل
              </h3>
              <div className="relative">
                <Search className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <Input
                  type="text"
                  placeholder="اسم المطعم أو نوع الطعام..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-0 bg-white/95 backdrop-blur-sm text-right shadow-lg focus:ring-2 focus:ring-[#053468]/20 text-sm sm:text-base"
                />

                {/* Clear button */}
                {searchQuery && (
                  <button
                    onClick={onClearSearch}
                    className="absolute left-12 sm:left-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                )}

                <Button
                  onClick={onSearchSubmit}
                  disabled={loading}
                  className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-[#053468] hover:bg-[#053468]/90 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    "بحث"
                  )}
                </Button>
              </div>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 max-h-80 sm:max-h-96 overflow-y-auto z-50">
                  {searchResults.length > 0 ? (
                    <div className="p-1 sm:p-2">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          onClick={() => onResultClick(result)}
                          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg sm:rounded-xl cursor-pointer transition-colors"
                        >
                          <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {result.profile_image ? (
                              <img
                                src={result.profile_image}
                                alt={result.merchant_name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-lg sm:text-2xl">🍽️</span>
                            )}
                          </div>
                          <div className="flex-1 text-right min-w-0">
                            <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                              {result.merchant_name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">
                              {result.taddress}
                            </p>
                            <div className="flex items-center justify-end gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                              <span className="text-xs text-gray-400">
                                {result.distance?.toFixed(1)} كم
                              </span>
                              {result.review_average > 0 && (
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-500 fill-current" />
                                  <span className="text-xs text-gray-600">
                                    {result.review_average.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4 text-center text-gray-500">
                      <p className="text-sm">لا توجد نتائج للبحث</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Popular Categories */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-center text-sm sm:text-base">
                الأصناف المحبوبة
              </h3>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className="text-center group cursor-pointer"
                    onClick={() => onCategoryClick(category.name)}
                  >
                    <div className="w-10 sm:w-14 h-10 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-1 sm:mb-2 group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                      <span className="text-lg sm:text-2xl">
                        {category.emoji}
                      </span>
                    </div>
                    <p className="text-white text-xs font-medium">
                      {category.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
