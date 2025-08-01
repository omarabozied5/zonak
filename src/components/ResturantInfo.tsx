import React from "react";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  Heart,
  Navigation,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WorkingHoursDisplay from "@/components/WorkingHoursDisplay";
import { Restaurant } from "../types/types";

// Interface for rating data
interface RatingData {
  averageRating: number;
  totalRatings: number;
  myRating: number;
  breakdown: Array<{
    stars: number;
    count: number;
    percentage: number;
  }>;
}

// Interface for branch data
interface BranchData {
  id: string;
  title: string;
  titleAr: string;
  address: string;
  addressAr: string;
  phone: string;
  rating: number;
  distance: number;
  enableDelivery: boolean;
  isActive: boolean;
}

// Props interface
interface RestaurantInfoProps {
  restaurant: Restaurant;
  rating: RatingData | null;
  branches: BranchData[] | null;
}

// Utility functions
const formatRating = (rating?: number): string => {
  if (!rating || rating === 0) return "جديد";
  return Number(rating).toFixed(1);
};

const formatDistance = (distance?: number): string => {
  if (!distance) return "";
  return `${distance.toFixed(2)} كم`;
};

// Star Rating Display Component
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} className="h-4 w-4 text-[#FFAA01] fill-current" />
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <Star
          key={i}
          className="h-4 w-4 text-[#FFAA01] fill-current opacity-50"
        />
      );
    } else {
      stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
};

// Action Button Component
const ActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ icon, label, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
      disabled
        ? "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200"
        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
    }`}
  >
    {icon}
    <span className="text-center leading-tight">{label}</span>
  </button>
);

// Main Restaurant Info Component
const RestaurantInfo: React.FC<RestaurantInfoProps> = ({
  restaurant,
  rating,
  branches,
}) => {
  const handleDirections = () => {
    console.log("Directions clicked");
  };

  const handleCall = () => {
    if (restaurant.phone) {
      window.open(`tel:${restaurant.phone}`, "_self");
    }
  };

  const handleWebsite = () => {
    if (restaurant.website) {
      window.open(restaurant.website, "_blank");
    }
  };

  const averageRating = rating?.averageRating || 0;
  const totalRatings = rating?.totalRatings || 0;

  // Debug: Log the actual category name to see what's being received
  console.log("Category name:", restaurant.category_name);
  console.log("Place category name:", restaurant.place_category?.name);

  // Get category name with proper fallback
  const getCategoryName = () => {
    // Try multiple sources for category name
    const categoryName =
      restaurant.category_name ||
      restaurant.place_category?.name ||
      "وجبات سريعه";

    // Ensure it's properly decoded and displayed
    return categoryName;
  };

  return (
    <div className="w-full max-w-none sm:max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto">
      <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
        <CardContent className="p-4 space-y-3">
          {/* Top Row - Restaurant Name, Stars, Rating, Count - All in One Line */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h1 className="text-xl font-bold text-yellow-400 truncate">
                {restaurant.merchant_name}
              </h1>
              {restaurant.is_favor && (
                <Heart className="h-4 w-4 text-red-500 fill-current flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-bold text-[#1a1a1a]">
                {formatRating(averageRating)}
              </span>
              <StarRating rating={averageRating} />

              <span className="text-xs text-black font-semibold">
                ({totalRatings})
              </span>
            </div>
          </div>

          {/* Cuisine Type - Fixed with proper Arabic font and RTL support */}
          <div className="text-sm text-black font-bold">
            {getCategoryName()}
          </div>

          {/* Location & Distance - Single Line */}
          <div className="flex items-center text-sm gap-1 text-black">
            <span className="truncate font-bold">
              {restaurant.taddress || restaurant.merchant_name}
            </span>
            {restaurant.distance && (
              <>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 flex-shrink-0 text-xs font-semibold">
                  {formatDistance(restaurant.distance)}
                </span>
              </>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-2">
            <ActionButton
              icon={<img src="/dir.png" className="h-3 w-3" />}
              label="الاتجاهات"
              onClick={handleDirections}
            />

            <ActionButton
              icon={<img src="/call.png" className="h-3 w-3" />}
              label="الاتصال"
              onClick={handleCall}
              disabled={!restaurant.phone}
            />

            <ActionButton
              icon={<Globe className="h-3 w-3" />}
              label=" الموقع الإلكترونى"
              onClick={handleWebsite}
              disabled={!restaurant.website}
            />
          </div>
        </CardContent>
      </Card>

      {/* Working Hours - Separate Card Below */}
      <Card className="shadow-lg border-0 rounded-xl overflow-hidden mt-4">
        <CardContent className="p-0">
          <WorkingHoursDisplay restaurant={restaurant} />
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantInfo;
