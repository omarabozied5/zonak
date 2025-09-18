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
        className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white rounded-2xl cursor-pointer transform hover:-translate-y-1 relative"
        onClick={() =>
          onRestaurantClick(restaurant.place?.id || restaurant.user_id)
        }
      >
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={
                restaurant.profile_image ||
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              }
              alt={restaurant.merchant_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>

          {/* Discount Badge - Top Left */}
          {(() => {
            // Debug: Log the restaurant data to console
            console.log("Restaurant data:", restaurant.merchant_name, {
              cashback_offer: restaurant.cashback_offer,
              place_main_offer: restaurant.place?.main_offer,
            });

            // Check for cashback offer first
            if (restaurant.cashback_offer?.discount) {
              return (
                <div className="absolute top-3 right-3">
                  <div className="backdrop-blur-md bg-white/20 rounded-lg px-2 py-1 font-bold text-sm shadow-md flex flex-col items-center leading-tight">
                    <span className="text-base" style={{ color: "#F7BD01" }}>
                      {restaurant.cashback_offer.discount}%
                    </span>
                    <span className="text-[11px]" style={{ color: "#F7BD01" }}>
                      كاش باك
                    </span>
                  </div>
                </div>
              );
            }

            // Check for main offer as fallback
            if (
              restaurant.place?.main_offer?.offer_type === 3 &&
              restaurant.place.main_offer.discount
            ) {
              return (
                <div className="absolute top-1 right-1">
                  <div className="backdrop-blur-md bg-black/20 rounded-md px-4 py-3 font-bold  shadow-md flex flex-col items-center leading-tight">
                    <span className=" text-[25px]" style={{ color: "#F7BD01" }}>
                      {restaurant.place.main_offer.discount}%
                    </span>
                    <span className="text-[12px]" style={{ color: "#F7BD01" }}>
                      كاش باك
                    </span>
                  </div>
                </div>
              );
            }

            return null;
          })()}

          {/* Status Badge - Top Right */}
          <div className="absolute top-3 left-3">
            <div
              className={`rounded-full px-3 py-1 text-xs font-bold shadow-lg ${
                isBusy ? "bg-red-500 text-white" : "bg-green-500 text-white"
              }`}
            >
              {isBusy ? "مشغول" : "متاح"}
            </div>
          </div>

          {/* Rating Badge - Bottom Left */}
          {restaurant.review_average > 0 && (
            <div className="absolute bottom-3 left-3">
              <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 space-x-reverse shadow-lg">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs font-bold text-gray-800">
                  {restaurant.review_average.toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {/* Delivery Info Badge - Bottom Right */}
          {/* <div className="absolute bottom-3 right-3">
            <div className="bg-[#FF6B6B] text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg">
              50+ ريال
              <div className="text-xs opacity-90">أجور توصيل</div>
            </div>
          </div> */}
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            {/* Restaurant Name */}
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 text-right">
              {restaurant.merchant_name}
            </h3>

            {/* Category and Location */}
            <div className="text-right">
              <p className="text-sm text-gray-600 line-clamp-1">
                {restaurant.category_name || "مطعم"} • {restaurant.taddress}
              </p>
            </div>

            {/* Delivery Time */}
            {/* <div className="flex items-center justify-start space-x-2 space-x-reverse text-gray-600">
              <span className="text-sm">
                {restaurant.distance > 0
                  ? `${restaurant.distance.toFixed(1)} كم • `
                  : ""}
                25-35 دقيقة
              </span>
            </div> */}

            {/* Promotional Text */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-3">
              <p className="text-xs text-yellow-800 text-center font-medium">
                ⚡ اشتر اليوم واحصل على خصم مجانا طباخك بالبيت
                <span className="text-yellow-600"> كوبونك</span>
              </p>
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

  // console.log(
  //   "Home component - restaurants:",
  //   restaurants,
  //   "loading:",
  //   loading,
  //   "error:",
  //   error
  // );

  // Memoized handlers to prevent recreation on every render
  const handleRetry = useCallback(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleRestaurantClick = useCallback(
    (user_id: number) => {
      navigate(`/restaurant/${user_id}`);
      // console.log("Navigating to restaurant:", user_id);
    },
    [navigate]
  );

  // Memoized section title and description
  const sectionInfo = useMemo(
    () => ({
      title: isSearchActive ? "نتائج البحث" : "أقرب الكاش باك",
      description: isSearchActive ? `نتائج البحث عن: "${searchQuery}"` : "",
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
      {/* Pass search props to Navigation */}
      <Navigation
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="ابحث عن مطاعم"
      />

      {/* Main Content */}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Title */}
          <div className="mb-6 text-right">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {sectionInfo.title}
            </h2>
            {sectionInfo.description && (
              <p className="text-sm text-gray-600">{sectionInfo.description}</p>
            )}
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
