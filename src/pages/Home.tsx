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
    const isBusy = restaurant.is_busy === 0;

    // Generate dynamic offer text
    const getOfferText = React.useMemo(() => {
      const offers = restaurant.place?.valid_offers || [];
      const cashbackOffer = restaurant.cashback_offer;
      const mainOffer = restaurant.place?.main_offer;

      if (!cashbackOffer && !mainOffer && offers.length === 0) return null;

      let offerDescription = "";
      let remainingCount = 0;

      // Priority 1: Cashback offer
      if (cashbackOffer) {
        offerDescription =
          cashbackOffer.offer_details ||
          cashbackOffer.description ||
          `كاش باك ${cashbackOffer.discount}%`;
        remainingCount = offers.length;
      }
      // Priority 2: Main offer
      else if (mainOffer) {
        if (
          mainOffer.offer_type === 0 &&
          mainOffer.old_price &&
          mainOffer.new_price
        ) {
          // Price offer
          offerDescription = `${mainOffer.product_name || "منتج"} - ${
            mainOffer.new_price
          } ريال بدلاً من ${mainOffer.old_price}`;
        } else if (mainOffer.offer_type === 1 && mainOffer.discount) {
          // Discount offer
          offerDescription = `خصم ${mainOffer.discount}%`;
        } else if (mainOffer.offer_type === 3 && mainOffer.discount) {
          // Cashback offer
          offerDescription = `كاش باك ${mainOffer.discount}%`;
        } else {
          offerDescription =
            mainOffer.offer_details || mainOffer.description || "عرض خاص";
        }
        remainingCount = offers.length - 1; // Subtract main offer
      }
      // Priority 3: First valid offer
      else if (offers.length > 0) {
        const firstOffer = offers[0];
        if (
          firstOffer.offer_type === 0 &&
          firstOffer.old_price &&
          firstOffer.new_price
        ) {
          offerDescription = `${firstOffer.product_name || "منتج"} - ${
            firstOffer.new_price
          } ريال`;
        } else if (firstOffer.discount) {
          offerDescription = `خصم ${firstOffer.discount}%`;
        } else {
          offerDescription = "عرض خاص";
        }
        remainingCount = offers.length - 1;
      }

      // Build final text
      let finalText = offerDescription;
      if (remainingCount > 0) {
        finalText += ` + ${remainingCount} ${
          remainingCount === 1 ? "عرض آخر" : "عروض أخرى"
        }`;
      }

      return finalText;
    }, [
      restaurant.cashback_offer,
      restaurant.place?.valid_offers,
      restaurant.place?.main_offer,
      restaurant.merchant_name,
    ]);

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

          {/* Discount Badge - Top Right */}
          {(() => {
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

            if (
              restaurant.place?.main_offer?.offer_type === 3 &&
              restaurant.place.main_offer.discount
            ) {
              return (
                <div className="absolute top-1 right-1">
                  <div className="backdrop-blur-md bg-black/20 rounded-md px-4 py-3 font-bold shadow-md flex flex-col items-center leading-tight">
                    <span className="text-[25px]" style={{ color: "#F7BD01" }}>
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

          {/* Status Badge - Top Left */}
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
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            {/* Header Row: Right side (Image + Name + Address) | Left side (Rating) */}
            <div className="flex items-center justify-between">
              {/* Right Side */}
              <div className="flex items-center space-x-3 space-x-reverse">
                <img
                  src={
                    restaurant.profile_image ||
                    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                  }
                  alt={restaurant.merchant_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex flex-col items-end">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                    {restaurant.merchant_name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {restaurant.category_name || "مطعم"} • {restaurant.taddress}
                  </p>
                </div>
              </div>

              {/* Left Side - Rating */}
              <div className="flex items-center text-xs text-gray-600">
                <span className="ml-1">{restaurant.rating || "4.3"}</span>
                <svg
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-gray-400 ml-1">
                  ({restaurant.rating_count || "270"})
                </span>
              </div>
            </div>

            {/* Dynamic Promotional Text */}
            {getOfferText && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-3">
                <p className="text-[11px] text-yellow-800 text-center font-medium">
                  ⚡ {getOfferText}
                </p>
              </div>
            )}
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

  // Memoized handlers to prevent recreation on every render
  const handleRetry = useCallback(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleRestaurantClick = useCallback(
    (user_id: number) => {
      navigate(`/restaurant/${user_id}`);
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
                  نعمل على إضافة المزيد من المطاعم الممي��ة. تحقق مرة أخرى
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
