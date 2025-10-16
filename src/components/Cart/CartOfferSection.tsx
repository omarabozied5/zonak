import React, { useState, useMemo, memo, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const OFFER_TYPES = {
  PRICE_CHANGE: 0,
  DISCOUNT_PERCENTAGE: 1,
  CASHBACK: 3,
} as const;

interface Offer {
  id: number;
  offer_type: number;
  offer_details?: string;
  end_date: string;
  main_offer: boolean;
  main_offer_order?: number;
  discount?: number;
  old_price?: number;
  new_price?: number;
  product_name?: string;
}

const getOfferDisplayText = (offer: Offer) => {
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

const CartOfferCard = memo<{
  offer: Offer;
  onClick: () => void;
  isFocused: boolean;
}>(({ offer, onClick, isFocused }) => {
  const displayData = useMemo(() => getOfferDisplayText(offer), [offer]);

  const getOfferText = useCallback(() => {
    switch (offer.offer_type) {
      case 0:
        return "كان وصار";
      case 1:
        return `خصم ${offer.discount}%`;
      case 3:
        return "كاش باك";
      default:
        return "عرض خاص";
    }
  }, [offer.offer_type, offer.discount]);

  return (
    <div
      onClick={onClick}
      className={`relative w-5/6 h-16 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm bg-gray-100 shadow-sm ${
        isFocused
          ? "border border-[#FBD252] bg-[#FBD252]/20"
          : "border border-gray-200"
      }`}
      dir="rtl"
      style={{ overflow: "visible" }}
    >
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

      <div className="absolute right-14 top-2 bottom-2 border-r-2 border-dashed border-gray-300" />

      <div className="flex items-center h-full px-2">
        <div className="flex-shrink-0 w-12 text-right">
          <div className="text-gray-800 font-medium text-lg leading-tight">
            {getOfferText()}
          </div>
        </div>

        <div className="flex-1 px-2 min-w-0">
          <p className="text-gray-800 font-medium text-xs truncate">
            {displayData.title}
          </p>
          <p className="text-gray-600 text-xs">{displayData.validUntil}</p>
        </div>
      </div>
    </div>
  );
});

CartOfferCard.displayName = "CartOfferCard";

interface CartOffersSectionProps {
  offers: Offer[];
  onOfferClick: (offer: Offer) => void;
  className?: string;
}

const CartOffersSection: React.FC<CartOffersSectionProps> = ({
  offers,
  onOfferClick,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [focusedOfferId, setFocusedOfferId] = useState<number | null>(null);

  const processedOffers = useMemo(() => {
    if (!offers || !Array.isArray(offers)) return [];

    return offers
      .filter((offer) => {
        if (offer.end_date) {
          return new Date(offer.end_date) > new Date();
        }
        return true;
      })
      .sort((a, b) => {
        const aCashback = a.offer_type === 3;
        const bCashback = b.offer_type === 3;
        if (aCashback && !bCashback) return -1;
        if (!aCashback && bCashback) return 1;

        if (a.main_offer && !b.main_offer) return -1;
        if (!a.main_offer && b.main_offer) return 1;

        const aOrder = a.main_offer_order || 999;
        const bOrder = b.main_offer_order || 999;
        return aOrder - bOrder;
      });
  }, [offers]);

  const handleOfferClick = useCallback(
    (offer: Offer) => {
      setFocusedOfferId(offer.id);
      onOfferClick(offer);
    },
    [onOfferClick]
  );

  if (processedOffers.length === 0) {
    return null;
  }

  const displayOffers = isExpanded
    ? processedOffers
    : processedOffers.slice(0, 3);

  return (
    <div className={`space-y-2 ${className}`} dir="rtl">
      <div className="flex items-center justify-between px-4">
        <h3 className="text-base font-medium text-gray-900">العروض المتاحة</h3>
      </div>

      <div className="px-4">
        <div
          className="flex overflow-x-auto pb-2 scrollbar-hide"
          style={{ paddingTop: "8px", paddingBottom: "8px" }}
        >
          {displayOffers.map((offer) => (
            <div key={`cart-offer-${offer.id}`} className="flex-shrink-0 w-72">
              <CartOfferCard
                offer={offer}
                onClick={() => handleOfferClick(offer)}
                isFocused={focusedOfferId === offer.id}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(CartOffersSection);
