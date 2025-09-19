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
  return `${distance.toFixed(2)} ÙƒÙ…`;
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
  // const handleDirections = () => {
  //   console.log("Directions clicked");
  // };

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

  // Get category name with proper fallback
  const getCategoryName = () => {
    const categoryName =
      restaurant.category_name || restaurant.place_category?.name;
    return categoryName;
  };

  return (
    <div className="w-full h-full bg-white rounded-[16px_16px_0px_0px] shadow-sm overflow-hidden mx-0 px-0 py-4">
      <div className="h-full flex flex-col justify-center px-4">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <div className="flex-1 text-right">
            <h1 className="text-xl sm:text-2xl font-bold text-black truncate">
              {restaurant.merchant_name}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-sm font-bold text-black">
              {formatRating(averageRating)}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => {
                const fullStars = Math.floor(averageRating);
                const hasHalfStar = averageRating % 1 !== 0;

                if (i < fullStars) {
                  return (
                    <Star
                      key={i}
                      className="h-3 w-3 sm:h-4 sm:w-4 text-[#FFAA01] fill-current"
                    />
                  );
                } else if (i === fullStars && hasHalfStar) {
                  return (
                    <Star
                      key={i}
                      className="h-3 w-3 sm:h-4 sm:w-4 text-[#FFAA01] fill-current opacity-50"
                    />
                  );
                } else {
                  return (
                    <Star
                      key={i}
                      className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300"
                    />
                  );
                }
              })}
            </div>
            <span className="text-xs sm:text-sm text-black font-medium">
              ({totalRatings})
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div className="space-y-1 text-right">
          <div className="text-xs sm:text-sm text-black font-medium truncate">
            {getCategoryName()}
          </div>
          <div className="text-m sm:text-sm text-black font-medium truncate">
            {restaurant.taddress}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantInfo;
