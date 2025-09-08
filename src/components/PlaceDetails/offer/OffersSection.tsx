import React, { useState, useMemo } from "react";
import { ValidOffer } from "../../../types/types";

// Ticket Decoration Component
const TicketDecor: React.FC = () => {
  return (
    <div className="absolute inset-y-0 left-0 right-[70px] overflow-hidden pointer-events-none z-0">
      {/* صورة 1 */}
      <img
        src="/imgs/bg-1.png"
        alt=""
        draggable="false"
        className="absolute select-none"
        style={{
          width: 110,
          top: 0,
          left: 0,
          mixBlendMode: "multiply",
        }}
      />
      {/* صورة 2 */}
      <img
        src="/imgs/bg-2.png"
        alt=""
        draggable="false"
        className="absolute select-none"
        style={{
          width: 130,
          top: -10,
          left: -5,
          transform: "rotate(-12deg)",
          mixBlendMode: "multiply",
        }}
      />
      {/* صورة 3 */}
      <img
        src="/imgs/bg-3.png"
        alt=""
        draggable="false"
        className="absolute select-none"
        style={{
          width: 55,
          bottom: 18,
          left: 8,
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
};

// Offer type constants
const OFFER_TYPES = {
  PRICE_CHANGE: 0, // كان وصار
  DISCOUNT_PERCENTAGE: 1, // نسبة خصم
  CASHBACK: 3, // كاش باك
} as const;

// Helper function to get offer display text based on type
const getOfferDisplayText = (
  offer: ValidOffer
): {
  rightLabelTop: string;
  rightLabelBottom: string;
  title: string;
  validUntil: string;
} => {
  const validUntil = offer.end_date
    ? `ساري حتى ${new Date(offer.end_date).toLocaleDateString("ar-EG")}`
    : "عرض محدود";

  switch (offer.offer_type) {
    case OFFER_TYPES.CASHBACK:
      return {
        rightLabelTop: "كاش",
        rightLabelBottom: "بـــــاك",
        title:
          offer.product_name ||
          offer.offer_details ||
          `كاش باك ${offer.discount}%`,
        validUntil,
      };

    case OFFER_TYPES.PRICE_CHANGE:
      const oldPrice = offer.old_price || 0;
      const newPrice = offer.new_price || 0;
      return {
        rightLabelTop: "كان",
        rightLabelBottom: "وصار",
        title: offer.product_name || `${oldPrice} ج.م → ${newPrice} ج.م`,
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

// Individual Ticket Component
interface TicketProps {
  offer: ValidOffer;
  className?: string;
  onClick?: () => void;
}

const Ticket: React.FC<TicketProps> = ({ offer, className = "", onClick }) => {
  const displayData = useMemo(() => getOfferDisplayText(offer), [offer]);
  const isCashback = offer.offer_type === OFFER_TYPES.CASHBACK;

  return (
    <div
      onClick={onClick}
      className={`relative w-[320px] h-[89px] rounded-[8px] overflow-visible ${className} ${
        isCashback
          ? "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-300"
          : "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-300"
      } cursor-pointer hover:shadow-lg transition-shadow duration-200`}
    >
      {/* ديكور ثابت */}
      <TicketDecor />

      {/* القصّات */}
      <div className="absolute top-0 right-[48px] w-[25px] h-[25px] bg-white rounded-full -translate-y-1/2 z-10" />
      <div className="absolute bottom-0 right-[48px] w-[25px] h-[25px] bg-white rounded-full translate-y-1/2 z-10" />

      {/* الفاصل */}
      <div className="absolute right-[59px] top-3 bottom-3 border-r-2 border-dashed border-gray-600 z-10" />

      {/* العنوان */}
      <div
        className="absolute right-[103px] top-[24px] text-black font-extrabold text-[14.5px] leading-[22px] text-right truncate z-10"
        style={{ maxWidth: "194px", height: "22px" }}
      >
        {displayData.title}
      </div>

      {/* التاريخ */}
      <div
        className="absolute flex items-center gap-2 text-gray-700 text-[11px] leading-[22px] z-10"
        style={{
          top: "65px",
          right: "170px",
          left: "38px",
          height: "22px",
          maxWidth: "112px",
        }}
      >
        <div className="w-[4px] h-[4px] rounded-full bg-gray-700" />
        <div className="text-right truncate w-full">
          {displayData.validUntil}
        </div>
      </div>

      {/* اليمين - نوع العرض */}
      <div className="absolute right-0 top-0 w-[59px] h-full flex items-center justify-center z-10">
        <div
          className="text-center text-black font-extrabold text-[15px] leading-[22px]"
          style={{ height: "44px" }}
        >
          <div>{displayData.rightLabelTop}</div>
          <div>{displayData.rightLabelBottom}</div>
        </div>
      </div>
    </div>
  );
};

// All Offers View Modal/Component
interface AllOffersViewProps {
  offers: ValidOffer[];
  onOfferClick: (offer: ValidOffer) => void;
  onClose: () => void;
}

const AllOffersView: React.FC<AllOffersViewProps> = ({
  offers,
  onOfferClick,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          dir="rtl"
        >
          <h2 className="text-2xl font-bold text-gray-800">جميع العروض</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            {offers.map((offer, index) => (
              <Ticket
                key={`all-offers-${offer.id}-${index}`}
                offer={offer}
                onClick={() => {
                  onOfferClick(offer);
                  onClose();
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Offers Section Component
interface OffersSectionProps {
  offers: ValidOffer[];
  onOfferClick?: (offer: ValidOffer) => void;
  onViewAllClick?: () => void;
  maxDisplayCount?: number;
  showOnlyValid?: boolean;
}

const OffersSection: React.FC<OffersSectionProps> = ({
  offers = [],
  onOfferClick,
  onViewAllClick,
  maxDisplayCount = 3,
  showOnlyValid = true,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [showAllOffersView, setShowAllOffersView] = useState(false);

  // Filter and process offers with cashback priority
  const processedOffers = useMemo(() => {
    let filteredOffers = offers;

    if (showOnlyValid) {
      const now = new Date();
      filteredOffers = offers.filter((offer) => {
        // Check if offer is verified
        const isVerified =
          offer.is_offer_verified === "1" || offer.is_offer_verified === 1;

        // Check if offer is still valid
        let isValidDate = true;
        if (offer.end_date) {
          const validUntil = new Date(offer.end_date);
          isValidDate = validUntil > now;
        }

        return isVerified && isValidDate;
      });
    }

    // Sort offers: Cashback first, then by main_offer status and order
    return filteredOffers.sort((a, b) => {
      // Priority 1: Cashback offers first
      const aCashback = a.offer_type === OFFER_TYPES.CASHBACK;
      const bCashback = b.offer_type === OFFER_TYPES.CASHBACK;

      if (aCashback && !bCashback) return -1;
      if (!aCashback && bCashback) return 1;

      // Priority 2: Main offers
      if (a.main_offer && !b.main_offer) return -1;
      if (!a.main_offer && b.main_offer) return 1;

      // Priority 3: Main offer order
      return a.main_offer_order - b.main_offer_order;
    });
  }, [offers, showOnlyValid]);

  // Don't render if no offers
  if (processedOffers.length === 0) {
    return null;
  }

  const handleOfferClick = (offer: ValidOffer) => {
    if (onOfferClick) {
      onOfferClick(offer);
    }
  };

  const handleShowAllToggle = () => {
    setShowAll(!showAll);
    if (onViewAllClick && !showAll) {
      onViewAllClick();
    }
  };

  const handleViewAllClick = () => {
    setShowAllOffersView(true);
    if (onViewAllClick) {
      onViewAllClick();
    }
  };

  return (
    <>
      <div className="min-h-auto bg-transparent p-0" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800">العروض</h2>
          <button
            onClick={handleViewAllClick}
            className="px-4 py-1 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors"
          >
            عرض الكل
          </button>
        </div>

        {/* Cards */}
        <div className="max-w-7xl mx-auto">
          {/* Desktop - Show all offers on desktop if less than or equal to maxDisplayCount */}
          <div className="hidden xl:grid xl:grid-cols-3 xl:gap-8 xl:place-items-center">
            {processedOffers.slice(0, maxDisplayCount).map((offer, index) => (
              <Ticket
                key={`desktop-${offer.id}-${index}`}
                offer={offer}
                onClick={() => handleOfferClick(offer)}
              />
            ))}
          </div>

          {/* Tablet */}
          <div
            className="hidden md:grid xl:hidden gap-8 place-items-center"
            style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
          >
            {processedOffers
              .slice(
                0,
                showAll ? Math.min(processedOffers.length, maxDisplayCount) : 2
              )
              .map((offer, index) => (
                <Ticket
                  key={`tablet-${offer.id}-${index}`}
                  offer={offer}
                  className={
                    index === 2 && showAll ? "md:col-span-2 mx-auto" : ""
                  }
                  onClick={() => handleOfferClick(offer)}
                />
              ))}
          </div>

          {/* Phone - Prioritize cashback offers */}
          <div className="grid md:hidden grid-cols-1 gap-8 place-items-center">
            {processedOffers
              .slice(
                0,
                showAll ? Math.min(processedOffers.length, maxDisplayCount) : 1
              )
              .map((offer, index) => (
                <Ticket
                  key={`phone-${offer.id}-${index}`}
                  offer={offer}
                  onClick={() => handleOfferClick(offer)}
                />
              ))}
          </div>

          {/* Show more button for mobile/tablet when there are more offers */}
          {processedOffers.length > (window.innerWidth >= 768 ? 2 : 1) && (
            <div className="flex justify-center mt-6 xl:hidden">
              <button
                onClick={handleShowAllToggle}
                className="px-4 py-1 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors"
              >
                {showAll ? "عرض أقل" : "عرض المزيد"}
              </button>
            </div>
          )}

          {/* Show all button for desktop when there are more offers */}
          {processedOffers.length > maxDisplayCount && (
            <div className="hidden xl:flex justify-center mt-6">
              <button
                onClick={handleViewAllClick}
                className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors"
              >
                عرض المزيد من العروض ({processedOffers.length - maxDisplayCount}
                )
              </button>
            </div>
          )}
        </div>
      </div>

      {/* All Offers Modal */}
      {showAllOffersView && (
        <AllOffersView
          offers={processedOffers}
          onOfferClick={handleOfferClick}
          onClose={() => setShowAllOffersView(false)}
        />
      )}
    </>
  );
};

export default OffersSection;
