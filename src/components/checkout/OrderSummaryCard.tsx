import React from "react";
import { ChevronDown, Plus } from "lucide-react";
import { CartItem } from "../../types/types";

interface OrderSummaryCardProps {
  items: CartItem[];
  restaurant?: {
    title?: string;
    title_ar?: string;
    merchant_name?: string;
    user?: {
      profile_image?: string;
    };
  } | null;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  items,
  restaurant,
}) => {
  console.log("OrderSummaryCard - restaurant prop:", restaurant);
  console.log(
    "OrderSummaryCard - profile_image:",
    restaurant?.user?.profile_image
  );

  const profileImage = restaurant?.user?.profile_image || null;
  console.log("OrderSummaryCard - final profileImage:", profileImage);
  const firstItem = items[0];

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-900 mb-4 text-right">
        ملخص الطلب
      </h2>

      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={firstItem?.restaurantName || "مطعم"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div
                className={`w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold ${
                  profileImage ? "hidden" : ""
                }`}
              >
                {firstItem?.restaurantName?.charAt(0) || "م"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {restaurant?.merchant_name || restaurant?.title_ar || "مطعم"}
              </div>
              <div className="text-xs text-gray-500">{items.length} منتجات</div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* <div className="flex justify-center">
        <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors">
          <Plus className="w-3 h-3 text-gray-700" />
          <span className="text-xs font-medium text-gray-700">
            إضافة منتجات
          </span>
        </div>
      </div> */}
    </div>
  );
};

export default OrderSummaryCard;
