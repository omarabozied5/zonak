// components/OffersContainer.tsx

import React, { useMemo } from "react";
import { ValidOffersItem } from "@/types/types";
import OfferCard from "./OfferCard";

interface OffersContainerProps {
  offers: ValidOffersItem[];
  onOfferClick: (offer: ValidOffersItem) => void;
  showViewAll?: boolean;
  onViewAllClick?: () => void;
  prioritizeCashback?: boolean;
}

const OffersContainer: React.FC<OffersContainerProps> = ({
  offers,
  onOfferClick,
  showViewAll = true,
  onViewAllClick,
  prioritizeCashback = true,
}) => {
  // Sort offers with cashback priority if enabled
  const sortedOffers = useMemo(() => {
    if (!prioritizeCashback) return offers;

    return [...offers].sort((a, b) => {
      // Priority 1: Cashback offers first (offer_type === 3)
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
  }, [offers, prioritizeCashback]);

  if (!sortedOffers || sortedOffers.length === 0) {
    return null;
  }

  const handleViewAllClick = () => {
    if (onViewAllClick) {
      onViewAllClick();
    }
  };

  return (
    <div className="mb-6" dir="rtl">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-m font-bold text-gray-800">العروض</h2>
        {showViewAll && (
          <button
            className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
            onClick={handleViewAllClick}
          >
            عرض الكل
          </button>
        )}
      </div>

      {/* Horizontal Scrolling Offers */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide offers-scroll px-4 pb-2">
          {sortedOffers.map((offer, index) => (
            <OfferCard
              key={`${offer.id}-${index}`}
              offer={offer}
              onClick={onOfferClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersContainer;
