import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Mock data for demonstration
const mockOffers = [
  {
    id: 1,
    offer_type: 3,
    offer_details: "كاش باك على المنتجات المختارة",
    end_date: "2024-12-31",
    main_offer: true,
    main_offer_order: 1,
  },
  {
    id: 2,
    offer_type: 1,
    discount: 20,
    product_name: "منتجات العناية",
    end_date: "2024-11-30",
    main_offer: false,
    main_offer_order: 2,
  },
  {
    id: 3,
    offer_type: 0,
    offer_details: "عرض خاص على الإلكترونيات",
    end_date: "2024-12-15",
    main_offer: false,
    main_offer_order: 3,
  },
];

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

// Updated offer card for cart with horizontal layout
const CartOfferCard = ({ offer, onClick, isFocused = false }) => {
  const isCashback = offer.offer_type === 3;
  const displayData = getOfferDisplayText(offer);

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

  return (
    <div
      onClick={onClick}
      className={`relative w-5/6 h-16 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm bg-gray-100 shadow-sm ${
        isFocused
          ? " border border-[#FBD252] bg-[#FBD252]/15"
          : "border border-gray-200"
      }`}
      dir="rtl"
      style={{ overflow: "visible" }}
    >
      {/* Top semicircle cutout - only show the bottom half */}
      <div
        className={`absolute w-5 h-2.5 bg-gray-50 rounded-b-full z-10 ${
          isFocused
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
          isFocused
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
          <div className="text-gray-800 font-medium text-lg leading-tight">
            {getOfferText()}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 px-2 min-w-0">
          <p className="text-gray-800 font-medium text-xs truncate">
            {displayData.title}
          </p>
          <p className="text-gray-600 text-xs">{displayData.validUntil}</p>
        </div>

        {/* Left arrow */}
        {/* <div className="flex-shrink-0 text-gray-600">
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
        </div> */}
      </div>
    </div>
  );
};

const CartOffersSection = ({
  offers = mockOffers,
  onOfferClick = () => {},
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [focusedOfferId, setFocusedOfferId] = useState(null);

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
      // Priority 1: Cashback first (offer_type === 3)
      const aCashback = a.offer_type === 3;
      const bCashback = b.offer_type === 3;
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
    : processedOffers.slice(0, 3);
  const hasMoreOffers = processedOffers.length > 2;

  const handleOfferClick = (offer) => {
    setFocusedOfferId(offer.id);
    onOfferClick(offer);
  };

  return (
    <div className={`space-y-2 ${className}`} dir="rtl">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4">
        <h3 className="text-base font-medium text-gray-900">العروض المتاحة</h3>
        {/* {hasMoreOffers && (
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
        )} */}
      </div>

      {/* Offers List - Horizontal Layout */}
      <div className="px-4">
        <div
          className="flex  overflow-x-auto pb-2"
          style={{ paddingTop: "8px", paddingBottom: "8px" }}
        >
          {displayOffers.map((offer, index) => (
            <div
              key={`cart-offer-${offer.id}-${index}`}
              className="flex-shrink-0 w-72"
            >
              <CartOfferCard
                offer={offer}
                onClick={() => handleOfferClick(offer)}
                isFocused={focusedOfferId === offer.id}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Offer Info */}
      {/* {processedOffers.length > 0 && (
        <div className="px-4">
          <p className="text-xs text-gray-500 text-center">
            اضغط على أي عرض لتطبيقه على طلبك
          </p>
        </div>
      )} */}
    </div>
  );
};

export default CartOffersSection;
