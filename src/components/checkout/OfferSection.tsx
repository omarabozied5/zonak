import React, { useState } from "react";
import { Info } from "lucide-react";

// Define the props interface
interface OffersSectionProps {
  offers?: any[];
  loading?: boolean;
}

// Offer type constants
const OFFER_TYPES = {
  PRICE_CHANGE: 0, // كان وصار
  DISCOUNT_PERCENTAGE: 1, // نسبة خصم
  CASHBACK: 3, // كاش باك
} as const;

// Helper function to get offer display text based on type
const getOfferDisplayText = (offer) => {
  const validUntil = offer.end_date
    ? `ساري حتى ${new Date(offer.end_date).toLocaleDateString("ar-EG")}`
    : "عرض محدود";

  switch (offer.offer_type) {
    case OFFER_TYPES.CASHBACK:
      return {
        rightLabelTop: "كاش",
        rightLabelBottom: "بـــــاك",
        title: `كاش باك ${offer.discount}% علي جميع المنتجات من الكاشير`,
        validUntil,
      };

    case OFFER_TYPES.PRICE_CHANGE:
      const oldPrice = offer.old_price || 0;
      const newPrice = offer.new_price || 0;
      return {
        rightLabelTop: "كان",
        rightLabelBottom: "وصار",
        title: `كان ب ${oldPrice} ج.م و صار ${newPrice} ج.م`,
        validUntil,
      };

    case OFFER_TYPES.DISCOUNT_PERCENTAGE:
      return {
        rightLabelTop: `${offer.discount}%`,
        rightLabelBottom: "خصم",
        title:
          offer.product_name || offer.offer_details || `خصم ${offer.discount}%`,
        validUntil,
      };

    default:
      return {
        rightLabelTop: "عرض",
        rightLabelBottom: "خاص",
        title: offer.product_name || offer.offer_details || "عرض خاص",
        validUntil,
      };
  }
};

// Updated offer card to match CartOfferSection UI
const OfferCard = ({ offer, isActive = false, onClick }) => {
  const displayData = getOfferDisplayText(offer);

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

  return (
    <div
      onClick={() => onClick(offer)}
      className={`relative w-full h-16 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm bg-gray-100 shadow-sm ${
        isActive
          ? "bg-[#FBD252]/15 border border-[#FBD252] "
          : "border border-gray-200"
      }`}
      dir="rtl"
      style={{ overflow: "visible" }}
    >
      {/* Top semicircle cutout - only show the bottom half */}
      <div
        className={`absolute w-5 h-2.5 bg-gray-50 rounded-b-full z-10 ${
          isActive
            ? "border-b border-l border-r border-[#FBD252]"
            : "border-b border-l border-r border-gray-200"
        }`}
        style={{
          top: "-2.5px",
          right: "48px",
        }}
      />
      {/* Bottom semicircle cutout - only show the top half */}
      <div
        className={`absolute w-5 h-2.5 bg-gray-50 rounded-t-full z-10 ${
          isActive
            ? "border-t border-l border-r border-[#FBD252]"
            : "border-t border-l border-r border-gray-200"
        }`}
        style={{
          bottom: "-2.5px",
          right: "48px",
        }}
      />

      {/* Dashed divider */}
      <div className="absolute right-14 top-2 bottom-2 border-r-2 border-dashed border-gray-300" />

      {/* Content */}
      <div className="flex items-center h-full px-2">
        {/* Right section - Offer type */}
        <div className="flex-shrink-0 w-12 text-right">
          <div className="text-gray-800 font-bold text-md leading-tight">
            {getOfferText()}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 px-2 min-w-0">
          <p className="text-gray-800 font-medium text-xs truncate">
            {displayData.title}
          </p>
          <p className="text-xs">{displayData.validUntil}</p>
        </div>
      </div>
    </div>
  );
};

const OffersSection: React.FC<OffersSectionProps> = ({
  offers = [],
  loading = false,
}) => {
  const [activeOfferId, setActiveOfferId] = useState<number | null>(null);

  // Filter and sort offers - prioritize main offers and cashback
  const processedOffers = offers
    .filter((offer) => {
      // Only show valid offers
      if (offer.end_date) {
        return new Date(offer.end_date) > new Date();
      }
      return true;
    })
    .sort((a, b) => {
      // Priority 1: Main offers first
      if (a.main_offer && !b.main_offer) return -1;
      if (!a.main_offer && b.main_offer) return 1;

      // Priority 2: Cashback (offer_type === 3)
      const aCashback = a.offer_type === 3;
      const bCashback = b.offer_type === 3;
      if (aCashback && !bCashback) return -1;
      if (!aCashback && bCashback) return 1;

      // Priority 3: Main offer order
      const aOrder = a.main_offer_order || 999;
      const bOrder = b.main_offer_order || 999;
      return aOrder - bOrder;
    });

  const handleOfferClick = (offer) => {
    setActiveOfferId(activeOfferId === offer.id ? null : offer.id);
    // Add any additional logic for offer selection here
  };

  // Loading state
  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex justify-end mb-4">
          <h2 className="text-sm font-bold text-foreground">العروض</h2>
        </div>
        <div className="px-4">
          <div
            className="flex overflow-x-auto pb-2"
            style={{ paddingTop: "8px", paddingBottom: "8px" }}
          >
            {[1, 2].map((i) => (
              <div key={i} className="flex-shrink-0 w-72">
                <div className="bg-gray-200 rounded-lg animate-pulse h-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No offers state
  if (!processedOffers || processedOffers.length === 0) {
    return null;
  }

  return (
    <div className="mb-6" dir="rtl">
      {/* Section Title */}
      <div className="flex items-center justify-between px-2 font-bold text-md mb-2 ">
        <span>العروض</span>
      </div>

      {/* Offers List - Horizontal Layout */}
      <div className="px-4 gap-1">
        <div
          className="flex overflow-x-auto pb-2 gap-3 scrollbar-hide"
          style={{ paddingTop: "8px", paddingBottom: "8px" }}
        >
          {processedOffers.map((offer, index) => (
            <div
              key={`offer-${offer.id}-${index}`}
              className="flex-shrink-0 w-72 mb-2"
            >
              <OfferCard
                offer={offer}
                isActive={activeOfferId === offer.id}
                onClick={handleOfferClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersSection;
