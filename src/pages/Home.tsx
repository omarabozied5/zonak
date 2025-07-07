import React from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import { usePreparedOrders } from "@/hooks/usePreparedOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Star, Clock, ChefHat, Zap } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { orders, loading, error, fetchOrders } = usePreparedOrders();

  console.log(
    "Home component - orders:",
    orders,
    "loading:",
    loading,
    "error:",
    error
  );

  const safeOrders = Array.isArray(orders) ? orders : [];

  const handleRetry = () => {
    fetchOrders();
  };

  const handleRestaurantClick = (user_id: number) => {
    navigate(`/restaurant/${user_id}`);
    console.log("Navigating to restaurant:", user_id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <HeroSection />

      {/* Featured Restaurants Section */}
      <section className="py-6 md:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                <span className="text-[#FFAA01]">أفضل المطاعم</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                اختر من مجموعة مميزة من أشهر المطاعم في المملكة
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center sm:justify-end space-x-6 space-x-reverse">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-[#FFAA01]">
                  {safeOrders.length}+
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  مطعم متاح
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

          {/* Loading State */}
          {loading && safeOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 md:py-16">
              <div className="relative">
                <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-[#FFAA01]" />
                <div className="absolute inset-0 bg-[#FFAA01]/20 rounded-full animate-ping"></div>
              </div>
              <p className="mt-4 text-sm md:text-base text-gray-600 font-medium">
                جاري تحميل المطاعم المميزة...
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

          {/* Restaurants Grid */}
          {(!loading || safeOrders.length > 0) && safeOrders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {safeOrders.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white rounded-2xl cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleRestaurantClick(restaurant.place?.id)}
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
                      {restaurant.place?.review_average && (
                        <div className="bg-white/95 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 flex items-center space-x-1 space-x-reverse shadow-sm">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-bold text-gray-800">
                            {restaurant.place.review_average}
                          </span>
                        </div>
                      )}

                      {/* {restaurant.user?.is_exclusive_partner === 1 && (
                        <div className="bg-gradient-to-r from-[#FFAA01] to-yellow-500 text-white rounded-full px-2 md:px-3 py-1 shadow-sm">
                          <span className="text-xs font-bold">شريك حصري</span>
                        </div>
                      )} */}
                    </div>

                    {/* Status Badges - Top Left */}
                    <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-col gap-1 md:gap-2">
                      <div
                        className={`rounded-full px-2 md:px-3 py-1 shadow-sm ${
                          restaurant.is_busy
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        <span className="text-xs font-bold">
                          {restaurant.is_busy ? "مشغول" : "متاح"}
                        </span>
                      </div>

                      {/* {restaurant.enable_delivery && (
                        <div className="bg-[#053468] text-white rounded-full px-2 md:px-3 py-1 shadow-sm">
                          <span className="text-xs font-bold">توصيل متاح</span>
                        </div>
                      )} */}
                    </div>

                    {/* Favorite Badge - Bottom Right */}
                    {restaurant.place?.is_favor && (
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
                        {restaurant.place?.taddress && (
                          <p className="text-[#FFAA01] font-medium text-sm">
                            {restaurant.place.taddress}
                          </p>
                        )}
                      </div>

                      {/* Restaurant Details */}
                      <div className="space-y-2">
                        {restaurant.place?.taddress && (
                          <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                            <MapPin className="h-4 w-4 text-[#FFAA01] flex-shrink-0" />
                            <span className="text-sm line-clamp-1">
                              {restaurant.place.taddress}
                            </span>
                          </div>
                        )}

                        {restaurant.place?.distance && (
                          <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                            <Clock className="h-4 w-4 text-[#FFAA01] flex-shrink-0" />
                            <span className="text-sm">
                              {restaurant.place.distance.toFixed(1)} كم • 20-30
                              دقيقة
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
                            handleRestaurantClick(restaurant.place?.id);
                          }}
                        >
                          عرض المنيو
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && safeOrders.length === 0 && !error && (
            <div className="text-center py-12 md:py-16">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChefHat className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                لا توجد مطاعم متاحة حالياً
              </h3>
              <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto px-4">
                نعمل على إضافة المزيد من المطاعم المميزة. تحقق مرة أخرى قريباً!
              </p>
            </div>
          )}

          {/* Loading More Indicator */}
          {loading && safeOrders.length > 0 && (
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
