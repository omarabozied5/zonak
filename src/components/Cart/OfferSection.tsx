import React from "react";
import { Info } from "lucide-react";

interface CartOffer {
  id: string;
  title: string;
  description: string;
  discount: string;
  isActive?: boolean;
  isApplicable?: boolean;
  minimumAmount?: number;
}

interface CartOffersSectionProps {
  offers: CartOffer[];
  selectedOffer?: string;
  onSelectOffer: (offerId: string) => void;
  cartTotal: number;
}

const CartOffersSection: React.FC<CartOffersSectionProps> = ({
  offers,
  selectedOffer,
  onSelectOffer,
  cartTotal,
}) => {
  if (!offers || offers.length === 0) {
    return null;
  }

  const isOfferApplicable = (offer: CartOffer) => {
    if (!offer.minimumAmount) return true;
    return cartTotal >= offer.minimumAmount;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm" dir="rtl">
      {/* Section Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">العروض</h3>
      </div>

      {/* Offers List */}
      <div className="p-4 space-y-3">
        {offers.map((offer) => {
          const applicable = isOfferApplicable(offer);
          const isSelected = selectedOffer === offer.id;

          return (
            <div
              key={offer.id}
              className={`relative p-4 rounded-lg border-2 transition-colors ${
                isSelected
                  ? "border-[#fbd252] bg-[#FBD2520D]/10"
                  : applicable
                  ? "border-gray-200 bg-white hover:border-gray-300 cursor-pointer"
                  : "border-gray-100 bg-gray-50 opacity-60"
              }`}
              onClick={() => applicable && onSelectOffer(offer.id)}
            >
              {/* Offer Content */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-sm font-medium ${
                        applicable ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {offer.title}
                    </span>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <p
                    className={`text-xs ${
                      applicable ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {offer.description}
                  </p>
                  {!applicable && offer.minimumAmount && (
                    <p className="text-xs text-red-500 mt-1">
                      الحد الأدنى: {offer.minimumAmount.toFixed(2)} ر.س
                    </p>
                  )}
                </div>

                {/* Discount Badge */}
                <div className="flex-shrink-0 ml-3">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isSelected
                        ? "bg-[#fbd252] text-white"
                        : applicable
                        ? "bg-gray-100 text-gray-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {offer.discount}
                  </div>
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 left-2">
                  <div className="w-4 h-4 bg-[#fbd252] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartOffersSection;
