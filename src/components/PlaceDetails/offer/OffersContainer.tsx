// components/OffersContainer.tsx

import React from "react";
import { ValidOffersItem } from "@/types/types";
import OfferCard from "./OfferCard";

interface OffersContainerProps {
  offers: ValidOffersItem[];
  onOfferClick: (offer: ValidOffersItem) => void;
  showViewAll?: boolean;
  onViewAllClick?: () => void;
}

const OffersContainer: React.FC<OffersContainerProps> = ({
  offers,
  onOfferClick,
  showViewAll = true,
  onViewAllClick,
}) => {
  if (!offers || offers.length === 0) {
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
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onClick={onOfferClick} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersContainer;
