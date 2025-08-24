import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Store, MapPin, Clock, Star } from "lucide-react";
import { apiService } from "@/services/apiService";
import { Restaurant } from "@/types/types";

interface CheckoutRestaurantHeaderProps {
  merchantId: string | number;
  restaurantName: string;
  placeId: string;
  user: {
    profile_image: string | string[];
  };
  className?: string;
}

const CheckoutRestaurantHeader: React.FC<CheckoutRestaurantHeaderProps> = ({
  merchantId,
  restaurantName,
  placeId,
  user,
  className = "",
}) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      console.log("CheckoutRestaurantHeader - Debug Info:", {
        merchantId,
        restaurantName,
        placeId,
        userProfileImages: user?.profile_image,
      });

      if (!placeId || placeId === "0" || placeId === "") {
        console.warn("CheckoutRestaurantHeader - Invalid placeId:", placeId);
        return;
      }

      setLoading(true);
      setImageError(false);

      try {
        const response = await apiService.fetchRestaurantDetails(placeId);
        console.log("CheckoutRestaurantHeader - API Response:", response);

        if ((response.success || response.status === 200) && response.data) {
          setRestaurant(response.data);
          console.log(
            "CheckoutRestaurantHeader - Restaurant data set:",
            response.data
          );
        } else {
          console.warn(
            "CheckoutRestaurantHeader - API returned no data or failed:",
            response
          );
        }
      } catch (err) {
        console.error(
          "CheckoutRestaurantHeader - Error fetching restaurant details:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [placeId, merchantId, restaurantName, user]);

  // Handle both string and array profile_image formats
  const validImages = useMemo(() => {
    const normalizeToArray = (
      images: string | string[] | undefined
    ): string[] => {
      if (!images) return [];
      return Array.isArray(images) ? images : [images];
    };

    // Get images from API-fetched restaurant data
    const restaurantImages = normalizeToArray(restaurant?.user?.profile_image);

    // Get images from user prop passed from parent
    const userImages = normalizeToArray(user?.profile_image);

    // Combine both sources, preferring restaurant API data
    const allImages = [...restaurantImages, ...userImages];

    // Filter out empty/invalid images
    const filtered = allImages.filter((img) => img && img.trim() !== "");

    console.log("CheckoutRestaurantHeader - Image processing:", {
      restaurantRawImages: restaurant?.user?.profile_image,
      userRawImages: user?.profile_image,
      restaurantImages,
      userImages,
      allImages,
      filtered,
    });

    return filtered;
  }, [restaurant, user]);

  const restaurantImage =
    validImages.length > 0 && !imageError ? validImages[0] : null;

  const handleImageError = useCallback(() => {
    console.log(
      "CheckoutRestaurantHeader - Image failed to load:",
      restaurantImage
    );
    setImageError(true);
  }, [restaurantImage]);

  return (
    <div className={`bg-white border-b border-gray-100 p-4 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Restaurant Image/Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-[#FFAA01]/10 to-[#053468]/10 flex items-center justify-center relative">
          {loading ? (
            <div className="w-6 h-6 border-2 border-[#FFAA01] border-t-transparent rounded-full animate-spin"></div>
          ) : restaurantImage ? (
            <img
              src={restaurantImage}
              alt={restaurantName}
              className="w-full h-full object-cover transition-all duration-300"
              onError={handleImageError}
              loading="eager"
              onLoad={() =>
                console.log(
                  "CheckoutRestaurantHeader - Image loaded successfully:",
                  restaurantImage
                )
              }
            />
          ) : (
            // Fallback with decorative background
            <div className="w-full h-full bg-gradient-to-br from-[#FFAA01] to-[#FFD700] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1 left-1 w-3 h-3 border border-white rounded-full animate-pulse"></div>
                <div className="absolute bottom-1 right-1 w-2 h-2 border border-white rounded-full animate-pulse delay-1000"></div>
              </div>
              <Store className="w-6 h-6 sm:w-8 sm:h-8 text-white relative z-10" />
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        {restaurant && (
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-black truncate">
              {restaurant.title_ar}
            </h2>

            {/* {restaurant && (
            <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {restaurant.address_ar ||
                  restaurant.address ||
                  "العنوان غير متوفر"}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 mt-1">
            {restaurant && restaurant.distance && (
              <div className="text-xs text-[#FFAA01] font-semibold">
                {restaurant.distance.toFixed(1)} كم
              </div>
            )}

            {restaurant && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{restaurant.time_to_ready || "15"} دقيقة</span>
              </div>
            )}
          </div> */}
          </div>
        )}
        {/* Rating Badge (if available) */}
        {/* {restaurant && restaurant.reviews_average > 0 && (
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
            <Star className="w-3 h-3 text-green-600 fill-current" />
            <span className="text-xs font-semibold text-green-700">
              {restaurant.reviews_average.toFixed(1)}
            </span>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default CheckoutRestaurantHeader;
