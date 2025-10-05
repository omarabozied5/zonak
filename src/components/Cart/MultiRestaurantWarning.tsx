import React from "react";
import { AlertCircle, Store } from "lucide-react";

interface MultiRestaurantWarningProps {
  restaurants: Array<{
    restaurantId: string;
    restaurantName: string;
    itemCount: number;
  }>;
  onClearOtherRestaurants: (keepRestaurantId: string) => void;
}

const MultiRestaurantWarning: React.FC<MultiRestaurantWarningProps> = ({
  restaurants,
  onClearOtherRestaurants,
}) => {
  if (restaurants.length <= 1) return null;

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      dir="rtl"
    >
      {/* Warning Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 px-4 py-3 border-b border-red-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-red-900 font-bold text-base">
              لا يمكنك الطلب من أكثر من مطعم في نفس الوقت!
            </h3>
            <p className="text-red-700 text-sm mt-0.5">
              اختر مطعماً واحداً للمتابعة
            </p>
          </div>
        </div>
      </div>

      {/* Restaurant Cards */}
      <div className="p-4 space-y-3">
        {restaurants.map((restaurant, index) => (
          <div
            key={restaurant.restaurantId}
            className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:border-[#FBD252] transition-all duration-200"
          >
            <div className="p-3 flex items-center justify-between">
              {/* Restaurant Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 flex-shrink-0">
                  <Store className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {restaurant.restaurantName}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {restaurant.itemCount} منتج
                    {restaurant.itemCount > 1 ? "ات" : ""}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onClearOtherRestaurants(restaurant.restaurantId)}
                className="bg-[#FBD252] hover:bg-[#f9c52b] text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
              >
                اختيار
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-xs font-bold">ℹ</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            عند اختيار مطعم، سيتم حذف جميع المنتجات من المطاعم الأخرى تلقائياً
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultiRestaurantWarning;
