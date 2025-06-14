
import React from 'react';
import { Star, Clock } from 'lucide-react';
import { Restaurant } from '../../store/useAppStore';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: (restaurant: Restaurant) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden group"
      onClick={() => onClick(restaurant)}
    >
      {/* Restaurant Image/Logo */}
      <div className="relative h-48 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {restaurant.logo}
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold">{restaurant.rating}</span>
        </div>
      </div>
      
      {/* Restaurant Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors">
          {restaurant.name}
        </h3>
        <p className="text-gray-600 mb-4">{restaurant.category}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{restaurant.deliveryTime}</span>
          </div>
          <div className="bg-yellow-400 text-black px-3 py-1 rounded-full font-medium">
            اطلب الآن
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
