import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Order } from "../../hooks/useOrderStore";
import CustomerInfo from "./CustomerInfo";
import OrderSummary from "./OrderSummary";
import OrderItems from "./OrderItems";
import OrderPricing from "./OrderPricing";
import OrderActions from "./OrderActions";
import SliderPickupOrder from "./SliderPickupOrder";
import { Restaurant } from "../../types/types";
import { apiService } from "@/services/apiService";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";

interface OrderCardProps {
  resturant?: Restaurant;
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [imageError, setImageError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, isAuthenticated } = useAuthStore();

  const cartStore = useCartStore(user?.id || null);
  const { items } = cartStore;

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (items.length > 0 && items[0].placeId) {
        try {
          const response = await apiService.fetchRestaurantDetails(
            items[0].placeId
          );
          if (response.message === "success" && response.data) {
            setRestaurant(response.data);
          }
        } catch (error) {
          console.error("Error fetching restaurant details:", error);
        }
      }
    };

    fetchRestaurantDetails();
  }, [items]);

  // Calculate remaining time with live countdown
  const calculateRemainingTime = () => {
    if (order.status !== "preparing") {
      return { minutes: 0, seconds: 0, hasTime: false };
    }

    let targetTime: Date;
    const now = currentTime;

    // Try different time sources
    if (order.time_to_ready && order.preparing_at) {
      // Use time_to_ready from preparing_at
      const preparingTime = new Date(order.preparing_at);
      const minutesToAdd =
        typeof order.time_to_ready === "string"
          ? parseInt(order.time_to_ready)
          : order.time_to_ready;
      targetTime = new Date(preparingTime.getTime() + minutesToAdd * 60 * 1000);
    } else if (order.remaining_time > 0) {
      // Use remaining_time (this might be outdated though)
      targetTime = new Date(now.getTime() + order.remaining_time * 60 * 1000);
    } else {
      return { minutes: 0, seconds: 0, hasTime: false };
    }

    const timeDifference = targetTime.getTime() - now.getTime();

    if (timeDifference <= 0) {
      return { minutes: 0, seconds: 0, hasTime: true };
    }

    const totalSeconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return { minutes, seconds, hasTime: true };
  };

  // Determine delivery type
  const isDelivery = order.delivery_cost > 0 || order.car_delivery_cost > 0;
  const isCarPickup = order.car_delivery_cost > 0;

  const getDeliveryTypeText = () => {
    if (isDelivery) return "توصيل";
    if (isCarPickup) return "إستلام من السيارة";
    return "إستلام من الفرع";
  };

  // Get countdown text
  const getCountdownText = () => {
    const timeData = calculateRemainingTime();

    if (!timeData.hasTime) {
      return "لحظات";
    }

    if (timeData.minutes === 0 && timeData.seconds === 0) {
      return "لحظات";
    }

    return `${timeData.minutes.toString().padStart(2, "0")}:${timeData.seconds
      .toString()
      .padStart(2, "0")} دقيقة`;
  };

  const shouldShowTimer =
    order.status === "preparing" || (isDelivery && order.status === "ready");

  const itemsToShow =
    showAllItems || isExpanded
      ? order.orderitems
      : order.orderitems.slice(0, 3);
  const hasMoreItems = order.orderitems.length > 3;

  // Get the logo URL with fallback priority
  const getLogoUrl = () => {
    // Priority 1: Restaurant data from API fetch
    if (restaurant?.user?.profile_image && !imageError) {
      return restaurant.user.profile_image;
    }

    // Priority 2: Order place logo
    if (order.place?.logo && !imageError) {
      return order.place.logo;
    }

    return null;
  };

  const logoUrl = getLogoUrl();

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="w-full" dir="rtl">
      <Card className="w-full bg-white rounded-[20px] border-0 shadow-none overflow-hidden">
        <CardContent className="p-0">
          {/* Main Content */}
          <div className="px-[35px] pt-[18px] pb-6">
            {/* Header Row - Restaurant Logo and Order Info */}
            <div className="flex items-center mb-4">
              {/* Left Side - Order Info */}
              <div className="flex items-center gap-3 flex-1">
                {/* Order Type and Number */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#1d1e20] font-['Bahij_TheSansArabic']">
                    {getDeliveryTypeText()}
                  </span>
                  <div className="w-px h-[15px] bg-[#d9d9d9]" />
                  <span className="text-[10px] font-medium text-[#1d1e20] font-['Bahij_TheSansArabic']">
                    رقم الطلب # {order.id}
                  </span>
                </div>
              </div>

              {/* Right Side - Restaurant Name and Expand Button */}
              <div className="flex flex-col items-end gap-2">
                {/* <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-[#1d1e20]" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-[#1d1e20]" />
                    )}
                  </div>
                </button> */}

                {/* Restaurant Logo with improved error handling */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border border-gray-300">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={order.place?.merchant_name || "Restaurant"}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                      onLoad={() => setImageError(false)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-600">🏪</span>
                    </div>
                  )}
                </div>

                <span className="text-[11px] font-semibold text-[#1d1e20] font-['Bahij_TheSansArabic']">
                  {order.place?.merchant_name || order.place?.title}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-1 mb-6">
              {itemsToShow.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-start items-center py-0.5"
                >
                  <span className="text-[11px] font-medium text-[#1d1e20] font-['Bahij_TheSansArabic'] ml-3">
                    {item.item_name}
                  </span>
                  <span className="text-[11px] font-medium text-[#6f7274] font-['Bahij_TheSansArabic'] flex-shrink-0">
                    X {item.quantity}
                  </span>
                </div>
              ))}

              {hasMoreItems && !showAllItems && !isExpanded && (
                <button
                  onClick={() => setShowAllItems(true)}
                  className="flex justify-between items-center py-0.5 w-full hover:bg-gray-50"
                >
                  <span className="text-[11px] font-medium text-[#6f7274] font-['Bahij_TheSansArabic']">
                    منتجات أخرى
                  </span>
                  <span className="text-[11px] font-medium text-[#6f7274] font-['Bahij_TheSansArabic']">
                    X {order.orderitems.length - 3}
                  </span>
                </button>
              )}
            </div>

            {/* Progress Slider */}
            <div className="mb-6">
              <SliderPickupOrder status={order.status} />
            </div>

            {/* Timer Section - Now with working countdown */}
            {shouldShowTimer && (
              <div className="text-center mb-[30px]">
                <div className="text-[10px] font-medium font-['Bahij_TheSansArabic'] leading-4">
                  <span className="text-[#fbd252]">
                    {isDelivery ? "متوقع يصل" : "متوقع يجهز"}
                  </span>
                  <span className="text-[#fbd252]"> خلال : </span>
                  <span className="text-[#6f7274]">{getCountdownText()}</span>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="w-full h-px bg-[#d9d9d9] mb-[15px]" />

            {/* Bottom Row - Total Price and Tracking */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium text-[#1d1e20] font-['Bahij_TheSansArabic']">
                  إجمالي الطلب
                </span>
                <span className="text-[11px] font-medium text-[#9b9b9b] font-['Bahij_TheSansArabic']">
                  {order.total_price.toFixed(2)} ريال
                </span>
              </div>

              {(order.status === "on_the_way" ||
                order.status === "waiting_customer") && (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-medium text-[#9b9b9b] font-['Bahij_TheSansArabic']">
                    تتبع الطلب
                  </span>
                  <div className="w-4 h-4 bg-gray-300 rounded" />
                </div>
              )}
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="px-[35px] pb-6 space-y-4 animate-in slide-in-from-top-2 duration-300 border-t border-[#d9d9d9] pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CustomerInfo order={order} />
                <OrderSummary order={order} />
              </div>

              <OrderItems order={order} />
              <OrderPricing order={order} />
              <OrderActions order={order} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderCard;
