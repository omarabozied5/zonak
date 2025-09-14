import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ValidOffersItem } from "../../types/types";

interface CartOffersSectionProps {
  offers: ValidOffersItem[];
  onOfferClick: (offer: ValidOffersItem) => void;
  className?: string;
}

// Simplified offer card for cart
const CartOfferCard: React.FC<{
  offer: ValidOffersItem;
  onClick: () => void;
}> = ({ offer, onClick }) => {
  const isCashback = offer.offer_type === 3;

  // Get offer text based on type
  const getOfferText = () => {
    switch (offer.offer_type) {
      case 0: // Price change
        return "كان وصار";
      case 1: // Discount
        return `خصم ${offer.discount}%`;
      case 3: // Cashback
        return "كاش باك";
      default:
        return "عرض خاص";
    }
  };

  const getOfferDescription = () => {
    if (offer.offer_details) return offer.offer_details;
    if (offer.product_name) return offer.product_name;
    return "منتجات مختارة";
  };

  return (
    <div
      onClick={onClick}
      className={`relative w-3/4 h-20 rounded-xl cursor-pointer transition-all  duration-300 hover:shadow-md overflow-hidden ${
        isCashback ? "bg-gray-100" : "bg-gray-100"
      }`}
      dir="rtl"
    >
      {/* Decorative circles */}
      <div className="absolute -top-2 right-12 w-4 h-4 bg-white rounded-full opacity-20" />
      <div className="absolute -bottom-2 right-12 w-4 h-4 bg-white rounded-full opacity-20" />

      {/* Dashed divider */}
      <div className="absolute right-16 top-2 bottom-2 border-r-2 border-dashed border-black opacity-30" />

      {/* Content */}
      <div className="flex items-center h-full px-4">
        {/* Right section - Offer type */}
        <div className="flex-shrink-0 w-12 text-center">
          <div className="text-black font-bold text-xs leading-tight">
            {getOfferText()}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 px-3 min-w-0">
          <p className="text-black font-semibold text-sm truncate">
            {getOfferDescription()}
          </p>
          <p className="text-black opacity-80 text-xs">
            صالح حتى{" "}
            {offer.end_date
              ? new Date(offer.end_date).toLocaleDateString("ar-EG", {
                  month: "short",
                  day: "numeric",
                })
              : "نهاية الشهر"}
          </p>
        </div>

        {/* Left arrow */}
        <div className="flex-shrink-0 text-black">
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
        </div>
      </div>
    </div>
  );
};

const CartOffersSection: React.FC<CartOffersSectionProps> = ({
  offers,
  onOfferClick,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter and sort offers - prioritize cashback and main offers
  const processedOffers = offers
    .filter((offer) => {
      // Only show valid offers
      if (offer.end_date) {
        return new Date(offer.end_date) > new Date();
      }
      return true;
    })
    .sort((a, b) => {
      // Priority 1: Cashback first (offer_type === 4 based on your constants)
      const aCashback = a.offer_type === 4;
      const bCashback = b.offer_type === 4;
      if (aCashback && !bCashback) return -1;
      if (!aCashback && bCashback) return 1;

      // Priority 2: Main offers
      if (a.main_offer && !b.main_offer) return -1;
      if (!a.main_offer && b.main_offer) return 1;

      // Priority 3: Main offer order
      const aOrder = a.main_offer_order || 999;
      const bOrder = b.main_offer_order || 999;
      return aOrder - bOrder;
    });

  if (!processedOffers || processedOffers.length === 0) {
    return null;
  }

  const displayOffers = isExpanded
    ? processedOffers
    : processedOffers.slice(0, 2);
  const hasMoreOffers = processedOffers.length > 2;

  return (
    <div className={`space-y-3 ${className}`} dir="rtl">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4">
        <h3 className="text-base font-semibold text-gray-900">
          العروض المتاحة
        </h3>
        {hasMoreOffers && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>
              {isExpanded ? "أقل" : `+${processedOffers.length - 2} المزيد`}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Offers List */}
      <div className="px-4 space-y-3">
        {displayOffers.map((offer, index) => (
          <CartOfferCard
            key={`cart-offer-${offer.id}-${index}`}
            offer={offer}
            onClick={() => onOfferClick(offer)}
          />
        ))}
      </div>

      {/* Offer Info */}
      {processedOffers.length > 0 && (
        <div className="px-4">
          <p className="text-xs text-gray-500 text-center">
            اضغط على أي عرض لتطبيقه على طلبك
          </p>
        </div>
      )}
    </div>
  );
};

export default CartOffersSection;
