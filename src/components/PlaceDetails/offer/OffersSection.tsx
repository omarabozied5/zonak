// components/OffersSection.tsx

import React from "react";
import { ValidOffersItem } from "@/types/types";
import OffersContainer from "./OffersContainer";
import { isValidOffer } from "@/lib/offerUtils";

interface OffersSectionProps {
  offers: ValidOffersItem[];
  onOfferClick?: (offer: ValidOffersItem) => void;
  onViewAllClick?: () => void;
  maxDisplayCount?: number;
  showOnlyValid?: boolean;
}

const OffersSection: React.FC<OffersSectionProps> = ({
  offers,
  onOfferClick,
  onViewAllClick,
  maxDisplayCount,
  showOnlyValid = true,
}) => {
  const handleOfferClick = (offer: ValidOffersItem) => {
    if (onOfferClick) {
      onOfferClick(offer);
    } else {
      // Default handler
      console.log("Offer clicked:", offer);
    }
  };

  const handleViewAllClick = () => {
    if (onViewAllClick) {
      onViewAllClick();
    } else {
      // Default handler
      console.log("View all offers clicked");
    }
  };

  // Filter offers if needed
  let displayOffers = offers || [];

  if (showOnlyValid) {
    displayOffers = displayOffers.filter(isValidOffer);
  }

  if (maxDisplayCount && maxDisplayCount > 0) {
    displayOffers = displayOffers.slice(0, maxDisplayCount);
  }

  // Don't render if no offers
  if (displayOffers.length === 0) {
    return null;
  }

  return (
    <OffersContainer
      offers={displayOffers}
      onOfferClick={handleOfferClick}
      onViewAllClick={handleViewAllClick}
      showViewAll={!!onViewAllClick}
    />
  );
};

export default OffersSection;
