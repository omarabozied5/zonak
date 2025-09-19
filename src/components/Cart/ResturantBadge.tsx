import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Store, MapPin } from "lucide-react";
import { apiService } from "@/services/apiService";
import { Restaurant } from "@/types/types";

interface RestaurantBadgeProps {
  merchantId: string | number;
  restaurantName: string;
  placeId: string;
  user: {
    profile_image: string | string[]; // Support both string and array
  };
  // Optional props for dropdown integration
  showStatus?: boolean;
  statusText?: string;
  onClick?: () => void;
  className?: string;
}

const RestaurantBadge: React.FC<RestaurantBadgeProps> = ({
  merchantId,
  restaurantName,
  placeId,
  user,
  showStatus = true,
  statusText = "طلبك جاهز",
  onClick,
  className = "",
}) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      console.log("RestaurantBadge - Debug Info:", {
        merchantId,
        restaurantName,
        placeId,
        placeIdType: typeof placeId,
        userProfileImages: user?.profile_image,
        userProfileImageType: typeof user?.profile_image,
      });

      if (!placeId || placeId === "0" || placeId === "") {
        console.warn("RestaurantBadge - Invalid placeId:", placeId);
        return;
      }

      setLoading(true);
      setImageError(false);

      try {
        const response = await apiService.fetchRestaurantDetails(placeId);

        if ((response.success || response.status === 200) && response.data) {
          setRestaurant(response.data);
          console.log("RestaurantBadge - Restaurant data set:", response.data);
        } else {
          console.warn(
            "RestaurantBadge - API returned no data or failed:",
            response
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [placeId, merchantId, restaurantName, user]);

  // FIXED: Properly handle both string and array profile_image formats
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

    // console.log("RestaurantBadge - Image processing:", {
    //   restaurantRawImages: restaurant?.user?.profile_image,
    //   userRawImages: user?.profile_image,
    //   restaurantImages,
    //   userImages,
    //   allImages,
    //   filtered,
    // });

    return filtered;
  }, [restaurant, user]);

  const restaurantImage =
    validImages.length > 0 && !imageError ? validImages[0] : null;

  const handleImageError = useCallback(() => {
    // console.log("RestaurantBadge - Image failed to load:", restaurantImage);
    setImageError(true);
  }, [restaurantImage]);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  // console.log("RestaurantBadge - Final render state:", {
  //   restaurantImage,
  //   validImages,
  //   imageError,
  //   loading,
  // });

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative z-10 ${
        onClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""
      } ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        {/* Restaurant Image/Icon */}
        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
          {loading ? (
            <div className="w-6 h-6 border-2 border-[#FBD252] border-t-transparent rounded-full animate-spin"></div>
          ) : restaurantImage ? (
            <img
              src={restaurantImage}
              alt={restaurantName}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="eager"
              onLoad={() =>
                console.log(
                  "RestaurantBadge - Image loaded successfully:",
                  restaurantImage
                )
              }
            />
          ) : (
            <div className="w-full h-full bg-[#FBD252] flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900 truncate">
            {restaurantName}
          </h2>

          {restaurant && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {restaurant.address_ar ||
                  restaurant.address ||
                  "العنوان غير متوفر"}
              </span>
            </div>
          )}

          {restaurant && restaurant.distance && (
            <div className="mt-1 text-xs text-[#FBD252] font-medium">
              المسافة: {restaurant.distance.toFixed(1)} كم
            </div>
          )}
        </div>

        {/* Status Badge */}
        {showStatus && (
          <div className="flex-shrink-0">
            <div className="bg-[#FBD252] text-black px-3 py-1 rounded-full text-xs font-medium">
              {statusText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantBadge;
