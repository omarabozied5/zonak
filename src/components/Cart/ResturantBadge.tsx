import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Store, MapPin } from "lucide-react";
import { apiService } from "@/services/apiService";
import { Restaurant } from "@/types/types";

interface RestaurantBadgeProps {
  merchantId: string | number;
  restaurantName: string;
  placeId: string;
}

const RestaurantBadge: React.FC<RestaurantBadgeProps> = ({
  merchantId,
  restaurantName,
  placeId,
}) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      // Debug logging
      console.log("RestaurantBadge - Debug Info:", {
        merchantId,
        restaurantName,
        placeId,
        placeIdType: typeof placeId,
      });

      if (!placeId || placeId === "0" || placeId === "") {
        console.warn("RestaurantBadge - Invalid placeId:", placeId);
        return;
      }

      setLoading(true);
      setImageError(false);

      try {
        const response = await apiService.fetchRestaurantDetails(placeId);
        console.log("RestaurantBadge - API Response:", response);

        // Fix: Check for status 200 instead of success property
        if ((response.success || response.status === 200) && response.data) {
          setRestaurant(response.data);
          console.log("RestaurantBadge - Restaurant data set:", response.data);
        } else {
          console.warn(
            "RestaurantBadge - API returned no data or failed:",
            response
          );
        }
      } catch (err) {
        console.error("RestaurantBadge - Error fetching restaurant details:", {
          error: err,
          placeId,
          merchantId,
          restaurantName,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [placeId, merchantId, restaurantName]);

  // Get restaurant image - similar approach to ImageSlider
  const validImages = useMemo(() => {
    if (!restaurant) return [];

    const allImages = [
      ...(restaurant.slider_images || []),
      ...(restaurant.menu_images || []),
    ];

    return allImages.filter((img) => img && img.trim() !== "");
  }, [restaurant]);

  const restaurantImage =
    validImages.length > 0 && !imageError ? validImages[0] : null;

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  console.log("RestaurantBadge received:", {
    merchantId,
    restaurantName,
    placeId,
    placeIdType: typeof placeId,
  });

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#FFAA01]/20 p-4 mb-6">
      <div className="flex items-center gap-4">
        {/* Restaurant Image/Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-[#FFAA01]/10 to-[#053468]/10 flex items-center justify-center relative">
          {loading ? (
            <div className="w-8 h-8 border-2 border-[#FFAA01] border-t-transparent rounded-full animate-spin"></div>
          ) : restaurantImage ? (
            <img
              src={restaurantImage}
              alt={restaurantName}
              className="w-full h-full object-cover transition-all duration-300"
              onError={handleImageError}
              loading="eager"
            />
          ) : (
            // Fallback with decorative background similar to ImageSlider
            <div className="w-full h-full bg-gradient-to-br from-[#FFAA01] to-[#FFD700] flex items-center justify-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1 left-1 w-4 h-4 border border-white rounded-full animate-pulse"></div>
                <div className="absolute bottom-1 right-1 w-3 h-3 border border-white rounded-full animate-pulse delay-1000"></div>
              </div>
              <Store className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10" />
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-[#053468] truncate">
            {restaurantName}
          </h2>

          {restaurant && (
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {restaurant.address_ar ||
                  restaurant.address ||
                  "العنوان غير متوفر"}
              </span>
            </div>
          )}

          {restaurant && restaurant.distance && (
            <div className="mt-1 text-xs text-[#FFAA01] font-semibold">
              المسافة: {restaurant.distance.toFixed(1)} كم
            </div>
          )}
        </div>

        {/* Status Badge */}
        {/* <div className="flex-shrink-0">
          <div className="bg-gradient-to-r from-[#FFAA01] to-[#FFD700] text-[#053468] px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
            طلبك جاهز
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default RestaurantBadge;
