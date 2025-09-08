// components/AllOffersView.tsx

import React, { useState, useMemo } from "react";
import { ValidOffersItem } from "@/types/types";
import OfferCard from "./OfferCard";

interface AllOffersViewProps {
  offers: ValidOffersItem[];
  onOfferClick: (offer: ValidOffersItem) => void;
  onClose?: () => void;
  isModal?: boolean;
  title?: string;
}

const AllOffersView: React.FC<AllOffersViewProps> = ({
  offers,
  onOfferClick,
  onClose,
  isModal = false,
  title = "جميع العروض",
}) => {
  const [filterType, setFilterType] = useState<
    "all" | "cashback" | "discount" | "price"
  >("all");

  // Sort and filter offers
  const processedOffers = useMemo(() => {
    let filteredOffers = offers;

    // Filter by type
    if (filterType !== "all") {
      const typeMapping = {
        cashback: 3,
        discount: 1,
        price: 0,
      };
      filteredOffers = offers.filter(
        (offer) => offer.offer_type === typeMapping[filterType]
      );
    }

    // Sort with cashback priority
    return filteredOffers.sort((a, b) => {
      // Priority 1: Cashback offers first
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
  }, [offers, filterType]);

  const handleOfferClick = (offer: ValidOffersItem) => {
    onOfferClick(offer);
    if (isModal && onClose) {
      onClose();
    }
  };

  const filterButtons = [
    { key: "all", label: "الكل", count: offers.length },
    {
      key: "cashback",
      label: "كاش باك",
      count: offers.filter((o) => o.offer_type === 3).length,
    },
    {
      key: "discount",
      label: "خصومات",
      count: offers.filter((o) => o.offer_type === 1).length,
    },
    {
      key: "price",
      label: "كان وصار",
      count: offers.filter((o) => o.offer_type === 0).length,
    },
  ];

  const content = (
    <div className="bg-white" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-white sticky top-0 z-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h2>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold p-2"
            aria-label="إغلاق"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="p-4 sm:p-6 border-b bg-gray-50">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {filterButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => setFilterType(button.key as any)}
              disabled={button.count === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === button.key
                  ? "bg-orange-500 text-white"
                  : button.count === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-orange-100 border border-gray-300"
              }`}
            >
              {button.label} ({button.count})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {processedOffers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              لا توجد عروض متاحة
            </h3>
            <p className="text-gray-500">
              {filterType === "all"
                ? "لا توجد عروض حالياً"
                : "لا توجد عروض من هذا النوع حالياً"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: Vertical scrolling */}
            <div className="block sm:hidden space-y-4">
              {processedOffers.map((offer, index) => (
                <div
                  key={`mobile-${offer.id}-${index}`}
                  className="flex justify-center"
                >
                  <OfferCard offer={offer} onClick={handleOfferClick} />
                </div>
              ))}
            </div>

            {/* Desktop/Tablet: Horizontal scrolling grid */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {processedOffers.map((offer, index) => (
                  <div
                    key={`desktop-${offer.id}-${index}`}
                    className="flex justify-center"
                  >
                    <OfferCard offer={offer} onClick={handleOfferClick} />
                  </div>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="mt-6 text-center text-sm text-gray-500">
              عرض {processedOffers.length} من {offers.length} عروض
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Return as modal or regular component
  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
          <div className="overflow-y-auto max-h-[95vh]">{content}</div>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-gray-50">{content}</div>;
};

export default AllOffersView;
