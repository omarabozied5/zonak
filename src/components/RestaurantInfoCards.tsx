
import React from 'react';
import { Phone, Globe, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RestaurantInfoCardsProps {
  restaurant: any;
}

const RestaurantInfoCards = ({ restaurant }: RestaurantInfoCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Contact Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">معلومات التواصل</h3>
          <div className="space-y-3">
            {restaurant.phone && (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Phone className="h-4 w-4 text-arabic-gold" />
                <span className="text-sm">{restaurant.phone}</span>
              </div>
            )}
            {restaurant.whatsapp && (
              <div className="flex items-center space-x-2 space-x-reverse">
                <MessageCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{restaurant.whatsapp}</span>
              </div>
            )}
            {restaurant.website && (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{restaurant.website}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      {restaurant.working_hours && restaurant.working_hours.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">ساعات العمل</h3>
            <div className="space-y-2">
              {restaurant.working_hours.slice(0, 3).map((hours: any) => (
                <div key={hours.id} className="flex justify-between text-sm">
                  <span>يوم {hours.day}</span>
                  <span className={hours.is_closed ? 'text-red-500' : 'text-green-500'}>
                    {hours.is_closed ? 'مغلق' : hours.is_24h ? '24 ساعة' : `${hours.open_time} - ${hours.close_time}`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offers */}
      {restaurant.valid_offers && restaurant.valid_offers.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">العروض المتاحة</h3>
            <div className="space-y-2">
              {restaurant.valid_offers.slice(0, 3).map((offer: any) => (
                <Badge key={offer.id} className="bg-arabic-orange text-white">
                  {offer.title || offer.description}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RestaurantInfoCards;
