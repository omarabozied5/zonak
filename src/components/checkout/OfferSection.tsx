import React, { useState } from "react";
import { Info } from "lucide-react";

// Define the props interface
interface OffersSectionProps {
  offers?: any[];
  loading?: boolean;
}

// Mock data for fallback during development
const mockOffers = [
  {
    id: 1,
    offer_type: 3,
    offer_details: "إشتري قهوة اليوم واحصل على تشيز كيك بنصف السعر",
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
];

// Updated offer card to match CartOfferSection UI
const OfferCard = ({ offer, isActive = false, onClick }) => {
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
    if (offer.description_ar) return offer.description_ar;
    if (offer.product_name) return offer.product_name;
    return "منتجات مختارة";
  };

  return (
    <div
      onClick={() => onClick(offer)}
      className={`relative w-26 h-16 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm bg-gray-100 shadow-sm ${
        isActive ? "border border-[#FBD252]" : "border border-gray-200"
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
          <div className="text-gray-800 font-light text-xs leading-tight">
            {getOfferText()}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 px-2 min-w-0">
          <p className="text-gray-800 font-medium text-xs truncate">
            {getOfferDescription()}
          </p>
          <p className="text-gray-600 text-xs">
            صالح حتى{" "}
            {offer.end_date
              ? new Date(offer.end_date).toLocaleDateString("ar-EG", {
                  month: "short",
                  day: "numeric",
                })
              : "نهاية الشهر"}
          </p>
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

  // Use provided offers or fallback to mock data for development
  const offersToProcess = offers.length > 0 ? offers : mockOffers;

  // Filter and sort offers - prioritize main offers and cashback
  const processedOffers = offersToProcess
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
      <div className="flex items-center justify-between px-4">
        <h3 className="text-base font-medium text-gray-900">العروض</h3>
      </div>

      {/* Offers List - Horizontal Layout */}
      <div className="px-4 gap-1">
        <div
          className="flex overflow-x-auto pb-2 gap-3"
          style={{ paddingTop: "8px", paddingBottom: "8px" }}
        >
          {processedOffers.map((offer, index) => (
            <div
              key={`offer-${offer.id}-${index}`}
              className="flex-shrink-0 w-72"
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
