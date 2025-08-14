import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import { useSearch } from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "@/hooks/useLocation";

import {
  Loader2,
  MapPin,
  Star,
  Clock,
  ChefHat,
  Zap,
  Search,
} from "lucide-react";

// Memoized RestaurantCard component to prevent unnecessary re-renders
const RestaurantCard = React.memo(
  ({
    restaurant,
    onRestaurantClick,
  }: {
    restaurant: any;
    onRestaurantClick: (user_id: number) => void;
  }) => {
    // Fixed logic: is_busy: 1 means available, is_busy: 0 means busy
    const isBusy = restaurant.is_busy === 0;

    return (
      <Card
        className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white rounded-2xl cursor-pointer transform hover:-translate-y-1"
        onClick={() =>
          onRestaurantClick(restaurant.place?.id || restaurant.user_id)
        }
      >
        <div className="relative">
          <div className="aspect-video overflow-hidden">
            <img
              src={
                restaurant.profile_image ||
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              }
              alt={restaurant.merchant_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Status Badges - Top Right */}
          <div className="absolute top-2 md:top-3 right-2 md:right-3 flex flex-col gap-1 md:gap-2">
            {restaurant.review_average > 0 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 flex items-center space-x-1 space-x-reverse shadow-sm">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs font-bold text-gray-800">
                  {restaurant.review_average.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Status Badges - Top Left */}
          <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-col gap-1 md:gap-2">
            <div
              className={`rounded-full px-2 md:px-3 py-1 shadow-sm ${
                isBusy ? "bg-red-500 text-white" : "bg-green-500 text-white"
              }`}
            >
              <span className="text-xs font-bold">
                {isBusy ? "مشغول" : "متاح"}
              </span>
            </div>
          </div>

          {/* Favorite Badge - Bottom Right */}
          {restaurant.is_favor && (
            <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3">
              <div className="bg-red-500 text-white rounded-full p-2 shadow-lg">
                <Star className="h-3 w-3 fill-current" />
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4 md:p-5">
          <div className="space-y-3 md:space-y-4">
            {/* Restaurant Name & Category */}
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                {restaurant.merchant_name}
              </h3>
              {restaurant.category_name && (
                <p className="text-[#FFAA01] font-medium text-sm">
                  {restaurant.category_name}
                </p>
              )}
            </div>

            {/* Restaurant Details */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                <MapPin className="h-4 w-4 text-[#FFAA01] flex-shrink-0" />
                <span className="text-sm line-clamp-1">
                  {restaurant.taddress}
                </span>
              </div>

              {restaurant.distance > 0 && (
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <Clock className="h-4 w-4 text-[#FFAA01] flex-shrink-0" />
                  <span className="text-sm">
                    {restaurant.distance.toFixed(1)} كم • 20-30 دقيقة
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                <ChefHat className="h-4 w-4 text-[#FFAA01] flex-shrink-0" />
                <span className="text-sm">مأكولات عربية</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button
                className="w-full bg-gradient-to-r from-[#FFAA01] to-yellow-500 hover:from-[#FFAA01]/90 hover:to-yellow-500/90 text-white font-bold py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestaurantClick(restaurant.place?.id || restaurant.user_id);
                }}
              >
                عرض المنيو
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

RestaurantCard.displayName = "RestaurantCard";

const Home = () => {
  const navigate = useNavigate();
  const {
    latitude,
    longitude,
    loading: locationLoading,
    error: locationError,
  } = useLocation();

  const {
    restaurants,
    searchResults,
    loading,
    error,
    fetchRestaurants,
    isSearchActive,
    searchQuery,
    showResults,
    searchLoading,
    isDebouncing,
    searchStatus,
    handleSearchChange,
    handleSearchSubmit,
    handleCategoryClick,
    handleResultClick,
    clearSearch,
    hideResults,
  } = useSearch(latitude, longitude);

  console.log(
    "Home component - restaurants:",
    restaurants,
    "loading:",
    loading,
    "error:",
    error
  );

  // Memoized handlers to prevent recreation on every render
  const handleRetry = useCallback(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleRestaurantClick = useCallback(
    (user_id: number) => {
      navigate(`/restaurant/${user_id}`);
      console.log("Navigating to restaurant:", user_id);
    },
    [navigate]
  );

  // Memoized section title and description
  const sectionInfo = useMemo(
    () => ({
      title: isSearchActive ? "نتائج البحث" : "أفضل المطاعم",
      description: isSearchActive
        ? `نتائج البحث عن: "${searchQuery}"`
        : "اختر من مجموعة مميزة من أشهر المطاعم في المملكة",
    }),
    [isSearchActive, searchQuery]
  );

  // Memoized stats to prevent recalculation
  const stats = useMemo(
    () => ({
      restaurantCount: restaurants.length,
      searchResultText: isSearchActive ? "نتيجة" : "مطعم متاح",
    }),
    [restaurants.length, isSearchActive]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <HeroSection
        searchResults={searchResults}
        loading={loading}
        searchLoading={searchLoading}
        searchQuery={searchQuery}
        showResults={showResults}
        isDebouncing={isDebouncing}
        searchStatus={
          searchStatus as "idle" | "debouncing" | "searching" | "completed"
        }
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onCategoryClick={handleCategoryClick}
        onResultClick={handleResultClick}
        onClearSearch={clearSearch}
        onHideResults={hideResults}
      />

      {/* Featured Restaurants Section */}
      <section className="py-6 md:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                <span className="text-[#FFAA01]">{sectionInfo.title}</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {sectionInfo.description}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center sm:justify-end space-x-6 space-x-reverse">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-[#FFAA01]">
                  {stats.restaurantCount}+
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {stats.searchResultText}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-[#053468]">
                  24/7
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  خدمة دائمة
                </div>
              </div>
            </div>
          </div>

          {/* Search Results Info - Only show when search is active and not debouncing */}
          {isSearchActive && !isDebouncing && (
            <div className="bg-gradient-to-r from-[#FFAA01]/10 to-yellow-100 border border-[#FFAA01]/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-[#FFAA01] rounded-full flex items-center justify-center">
                    <Search className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      تم العثور على {restaurants.length} مطعم
                    </p>
                    <p className="text-xs text-gray-600">
                      نتائج البحث عن: "{searchQuery}"
                    </p>
                  </div>
                </div>
                <Button
                  onClick={clearSearch}
                  variant="outline"
                  size="sm"
                  className="text-[#FFAA01] border-[#FFAA01] hover:bg-[#FFAA01] hover:text-white"
                >
                  مسح البحث
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && restaurants.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 md:py-16">
              <div className="relative">
                <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-[#FFAA01]" />
                <div className="absolute inset-0 bg-[#FFAA01]/20 rounded-full animate-ping"></div>
              </div>
              <p className="mt-4 text-sm md:text-base text-gray-600 font-medium">
                {isSearchActive
                  ? "جاري البحث..."
                  : "جاري تحميل المطاعم المميزة..."}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 md:h-8 md:w-8 text-red-500" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-red-800 mb-2">
                حدث خطأ في التحميل
              </h3>
              <p className="text-sm md:text-base text-red-600 mb-4">{error}</p>
              <Button
                onClick={handleRetry}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                إعادة المحاولة
              </Button>
            </div>
          )}

          {/* Restaurants Grid - Only render when we have data and not in initial loading */}
          {(!loading || restaurants.length > 0) && restaurants.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onRestaurantClick={handleRestaurantClick}
                />
              ))}
            </div>
          )}

          {/* No Results State - Only show when search is complete (not debouncing) */}
          {!loading &&
            restaurants.length === 0 &&
            !error &&
            isSearchActive &&
            !isDebouncing && (
              <div className="text-center py-12 md:py-16">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  لم يتم العثور على نتائج
                </h3>
                <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto px-4 mb-4">
                  لم نتمكن من العثور على مطاعم تطابق بحثك عن "{searchQuery}"
                </p>
                <Button
                  onClick={clearSearch}
                  className="bg-[#FFAA01] hover:bg-[#FFAA01]/90 text-white"
                >
                  مسح البحث وعرض جميع المطاعم
                </Button>
              </div>
            )}

          {/* Empty State */}
          {!loading &&
            restaurants.length === 0 &&
            !error &&
            !isSearchActive && (
              <div className="text-center py-12 md:py-16">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChefHat className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  لا توجد مطاعم متاحة حالياً
                </h3>
                <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto px-4">
                  نعمل على إضافة المزيد من المطاعم المميزة. تحقق مرة أخرى
                  قريباً!
                </p>
              </div>
            )}

          {/* Loading More Indicator */}
          {loading && restaurants.length > 0 && (
            <div className="flex items-center justify-center mt-6 md:mt-8 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-[#FFAA01] ml-2" />
              <span className="text-sm md:text-base text-gray-600">
                جاري تحميل المزيد...
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
