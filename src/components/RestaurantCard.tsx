import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Star, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RestaurantCardProps {
  id: string;
  name: string;
  image: string;
  location: string;
  phone: string;
  rating: number;
  reviewCount: number;
  cuisine: string;
  deliveryTime: string;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  name,
  image,
  location,
  phone,
  rating,
  reviewCount,
  cuisine,
  deliveryTime,
}) => {
  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 bg-white rounded-2xl">
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden rounded-t-2xl">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center space-x-1 space-x-reverse shadow-lg">
          <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
          <span className="text-sm font-bold text-gray-900">{rating}</span>
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>

        {/* Delivery Time Badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-arabic-orange to-arabic-gold text-white rounded-full px-3 py-1.5 shadow-lg">
          <div className="flex items-center space-x-1 space-x-reverse">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">{deliveryTime}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Restaurant Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1 group-hover:text-arabic-orange transition-colors duration-300">
              {name}
            </h3>
            <p className="text-arabic-orange font-medium text-sm">{cuisine}</p>
          </div>

          {/* Location & Phone */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
              <MapPin className="h-4 w-4 text-arabic-gold flex-shrink-0" />
              <span className="text-sm line-clamp-1">{location}</span>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
              <Phone className="h-4 w-4 text-arabic-gold flex-shrink-0" />
              <span className="text-sm" dir="ltr">
                {phone}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 space-x-reverse pt-2">
            <Link to={`/restaurant/${id}`} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-arabic-orange to-arabic-gold text-white hover:from-arabic-gold hover:to-arabic-orange hover:shadow-lg transition-all duration-300 rounded-xl font-semibold py-2.5">
                عرض القائمة
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              className="border-2 border-arabic-gold/30 text-arabic-orange hover:bg-arabic-gold hover:text-white hover:border-arabic-gold transition-all duration-300 rounded-xl w-12 h-11"
              onClick={() =>
                window.open(
                  `https://wa.me/${phone.replace(/\D/g, "")}`,
                  "_blank"
                )
              }
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
