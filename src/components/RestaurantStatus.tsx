
import React from 'react';

interface RestaurantStatusProps {
  restaurant: any;
}

const RestaurantStatus = ({ restaurant }: RestaurantStatusProps) => {
  return (
    <div className="text-center py-8">
      {restaurant.is_busy ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">المطعم مشغول حالياً</p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600">المطعم متاح لاستقبال الطلبات</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantStatus;
