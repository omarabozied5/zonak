import React from "react";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Utensils,
  Users,
  Clock,
  Heart,
  Navigation,
  Truck,
  AlertCircle,
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
  return `${distance.toFixed(1)} كم`;
};

// Compact Rating Display
const RatingDisplay: React.FC<{ rating: RatingData | null }> = ({ rating }) => {
  if (!rating) {
    return (
      <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
        <Star className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-600">جديد</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-[#FFAA01]/10 px-3 py-1 rounded-full">
        <Star className="h-4 w-4 text-[#FFAA01] fill-current" />
        <span className="text-sm font-bold text-[#053468]">
          {formatRating(rating.averageRating)}
        </span>
      </div>
      <span className="text-sm text-gray-500">({rating.totalRatings})</span>
    </div>
  );
};

// Compact Rating Breakdown
const RatingBreakdown: React.FC<{ rating: RatingData }> = ({ rating }) => (
  <div className="space-y-2">
    {rating.breakdown.map((item) => (
      <div key={item.stars} className="flex items-center gap-2 text-sm">
        <span className="w-8 text-gray-600">{item.stars}⭐</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#FFAA01] h-2 rounded-full transition-all duration-300"
            style={{ width: `${item.percentage}%` }}
          />
        </div>
        <span className="text-gray-500 w-8 text-right">{item.count}</span>
      </div>
    ))}
  </div>
);

// Compact Branches Display
const BranchesDisplay: React.FC<{ branches: BranchData[] | null }> = ({
  branches,
}) => {
  if (!branches || branches.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-[#053468] flex items-center gap-2">
        <Navigation className="h-4 w-4 text-[#FFAA01]" />
        الفروع ({branches.length})
      </h4>

      <div className="space-y-2">
        {branches.map((branch) => (
          <div key={branch.id} className="bg-gray-50 p-3 rounded-lg text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-[#053468] truncate flex-1">
                {branch.titleAr || branch.title || `فرع ${branch.id}`}
              </span>
              <div className="flex items-center gap-2">
                {branch.rating > 0 && (
                  <span className="text-[#FFAA01] text-sm">
                    ⭐{formatRating(branch.rating)}
                  </span>
                )}
                {/* {branch.enableDelivery && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    <Truck className="h-3 w-3 mr-1" />
                    توصيل
                  </Badge>
                )} */}
                {!branch.isActive && (
                  <Badge variant="destructive" className="text-xs px-2 py-1">
                    مغلق
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-start justify-between text-gray-500">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                <span className="text-sm break-words sm:truncate">
                  {branch.addressAr || branch.address}
                </span>
              </div>
              {/* Phone link */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Restaurant Info Component
const RestaurantInfo: React.FC<RestaurantInfoProps> = ({
  restaurant,
  rating,
  branches,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main Restaurant Information */}
      <div className="lg:col-span-2">
        <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
          <CardContent className="p-4 space-y-4">
            {/* Restaurant Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-[#053468]">
                    {restaurant.merchant_name}
                  </h1>
                  {restaurant.is_favor && (
                    <Heart className="h-5 w-5 text-red-500 fill-current" />
                  )}
                </div>
                <RatingDisplay rating={rating} />
              </div>

              {/* Quick Info Bar */}
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {restaurant.distance && (
                  <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">
                      {formatDistance(restaurant.distance)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                  <Utensils className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 font-medium">
                    {restaurant.category_name || "مطعم"}
                  </span>
                </div>
              </div>

              {/* Address */}
              {restaurant.taddress && (
                <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    {restaurant.taddress}
                  </span>
                </div>
              )}
            </div>

            {/* Working Hours */}
            <div className="bg-[#FFAA01]/5 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-[#FFAA01]" />
                <h3 className="font-medium text-[#053468] text-sm">
                  أوقات العمل
                </h3>
              </div>
              <WorkingHoursDisplay restaurant={restaurant} />
            </div>

            {/* Rating Breakdown */}
            {rating && rating.totalRatings > 0 && (
              <div className="bg-[#FFAA01]/5 p-3 rounded-lg">
                <h4 className="font-medium text-[#053468] text-sm mb-2">
                  تفاصيل التقييم
                </h4>
                <RatingBreakdown rating={rating} />
              </div>
            )}

            {/* Branches */}
            {branches && branches.length > 0 && (
              <div className="bg-[#FFAA01]/5 p-3 rounded-lg">
                <BranchesDisplay branches={branches} />
              </div>
            )}

            {/* About Section */}
            {restaurant.title_ar && (
              <div className="border-t border-[#FFAA01]/20 pt-3">
                <h3 className="font-medium text-[#053468] mb-2 flex items-center text-sm">
                  <div className="w-0.5 h-4 bg-[#FFAA01] rounded-full ml-2"></div>
                  عن المطعم
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                  {restaurant.title_ar}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Information Sidebar */}
      <div className="lg:col-span-1">
        <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#FFAA01] to-[#053468] p-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Phone className="h-5 w-5" />
              معلومات الاتصال
            </h3>
          </div>

          <CardContent className="p-4 space-y-3">
            {/* Phone */}
            {restaurant.phone && (
              <div className="flex items-center gap-3 p-3 bg-[#FFAA01]/10 rounded-lg">
                <div className="w-8 h-8 bg-[#FFAA01] rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#053468]">الهاتف</p>
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="text-sm text-[#FFAA01] hover:text-[#053468] transition-colors"
                  >
                    {restaurant.phone}
                  </a>
                </div>
              </div>
            )}

            {/* Website */}
            {restaurant.website && (
              <div className="flex items-center gap-3 p-3 bg-[#FFAA01]/10 rounded-lg">
                <div className="w-8 h-8 bg-[#FFAA01] rounded-lg flex items-center justify-center">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#053468]">الموقع</p>
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#FFAA01] hover:text-[#053468] transition-colors"
                  >
                    زيارة الموقع
                  </a>
                </div>
              </div>
            )}

            {/* Category */}
            <div className="flex items-center gap-3 p-3 bg-[#FFAA01]/10 rounded-lg">
              <div className="w-8 h-8 bg-[#FFAA01] rounded-lg flex items-center justify-center">
                <Utensils className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#053468]">النوع</p>
                <p className="text-sm text-gray-600">
                  {restaurant.category_name || "مطعم"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantInfo;
