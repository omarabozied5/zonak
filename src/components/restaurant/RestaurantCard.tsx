
import React from 'react';
import { Star, Clock, MapPin } from 'lucide-react';
import { Restaurant } from '../../store/useAppStore';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: (restaurant: Restaurant) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  return (
    <div 
      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 overflow-hidden group border border-gray-100"
      onClick={() => onClick(restaurant)}
    >
      {/* Restaurant Image/Logo with Gradient Overlay */}
      <div className="relative h-56 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center overflow-hidden">
        <div className="text-7xl group-hover:scale-125 transition-transform duration-500 z-10 drop-shadow-lg">
          {restaurant.logo}
        </div>
        
        {/* Floating Rating Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-gray-800">{restaurant.rating}</span>
        </div>
        
        {/* Overlay Pattern */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      
      {/* Restaurant Info */}
      <div className="p-6 space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
          {restaurant.name}
        </h3>
        
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium">{restaurant.category}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">{restaurant.deliveryTime}</span>
          </div>
          
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:from-orange-500 hover:to-red-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
            اطلب الآن
          </div>
        </div>
      </div>
      
      {/* Bottom Accent Line */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  );
};

export default RestaurantCard;
