import React from "react";
import { Star, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RestaurantHeaderProps {
  restaurant: any;
}

const RestaurantHeader = ({ restaurant }: RestaurantHeaderProps) => {
  // Better image selection logic
  const getHeaderImage = () => {
    if (restaurant.slider_images && Array.isArray(restaurant.slider_images)) {
      // Find the first valid image URL
      const validImage = restaurant.slider_images.find(
        (img) => img && img.trim() !== ""
      );
      if (validImage) return validImage;
    }

    // Fallback to profile image
    if (restaurant.profile_image) {
      return restaurant.profile_image;
    }

    // Default fallback image
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
  };

  const headerImage = getHeaderImage();

  return (
    <div className="relative">
      {/* Reduced height hero section */}
      <div className="h-48 md:h-56 overflow-hidden">
        <img
          src={headerImage}
          alt={restaurant.merchant_name}
          className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            console.error("Failed to load image:", headerImage);
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      </div>

      {/* Restaurant Info Overlay - Positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 space-x-reverse mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                  {restaurant.merchant_name}
                </h1>
                {restaurant.user?.is_exclusive_partner === 1 && (
                  <Badge className="bg-arabic-gold text-white text-xs px-2 py-1">
                    شريك حصري
                  </Badge>
                )}
              </div>

              {restaurant.description && (
                <p className="text-white/90 mb-3 text-sm md:text-base line-clamp-2 drop-shadow">
                  {restaurant.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                {restaurant.review_average && (
                  <div className="flex items-center space-x-1 space-x-reverse bg-black/30 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">
                      {restaurant.review_average}
                    </span>
                  </div>
                )}

                {restaurant.address && (
                  <div className="flex items-center space-x-1 space-x-reverse bg-black/30 rounded-full px-3 py-1 backdrop-blur-sm">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate max-w-48">
                      {restaurant.address}
                    </span>
                  </div>
                )}

                {restaurant.is_delivery && (
                  <div className="flex items-center space-x-1 space-x-reverse bg-arabic-green/80 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">يتوفر توصيل</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-arabic-gold/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-4 w-16 h-16 bg-arabic-orange/10 rounded-full blur-lg"></div>
    </div>
  );
};

export default RestaurantHeader;
