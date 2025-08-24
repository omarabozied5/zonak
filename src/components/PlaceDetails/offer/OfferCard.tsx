// components/OfferCard.tsx

import React from "react";
import {
  ValidOffersItem,
  OFFER_CASHBACK,
  OFFER_TYPE_PRICE,
  OFFER_TYPE_DISCOUNT,
  OFFER_TYPE_OFFER,
} from "../../../types/types";
import { getOfferText, formatOfferDate } from "../../../lib/offerUtils";

interface OfferCardProps {
  offer: ValidOffersItem;
  onClick: (offer: ValidOffersItem) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, onClick }) => {
  const handleClick = () => {
    onClick(offer);
  };

  const offerText = getOfferText(offer);
  const isMainOffer = offer.main_offer;
  const isCashback = offer.offer_type === OFFER_CASHBACK;

  // Get the right background based on offer type
  const getBackgroundColor = () => {
    if (isCashback) {
      return "cashback-bg";
    }
    return "offer-bg";
  };

  // Get offer type text for left section
  const getOfferTypeText = () => {
    switch (offer.offer_type) {
      case OFFER_TYPE_PRICE:
        return {
          top: "كان",
          middle: "و",
          bottom: "صار",
        };
      case OFFER_TYPE_DISCOUNT:
        return {
          top: "خصم",
          middle: "%",
          bottom: "بالمائة",
        };
      case OFFER_TYPE_OFFER:
        return {
          top: "خصم",
          middle: "اشتري",
          bottom: "احصل على عرض",
        };
      case OFFER_CASHBACK:
        return {
          top: "كاش",
          middle: "",
          bottom: "باك",
        };
      default:
        return {
          top: "عرض",
          middle: "",
          bottom: "خاص",
        };
    }
  };

  const typeText = getOfferTypeText();

  return (
    <div
      className="flex-shrink-0 w-80 sm:w-72 offer-card-mobile relative cursor-pointer transition-all duration-300 "
      onClick={handleClick}
    >
      {/* Main container with ticket style */}
      <div
        className={`h-24 relative rounded-2xl ${getBackgroundColor()} border border-gray-200 overflow-visible`}
      >
        {/* Cashback background pattern - only for cashback offers */}
        {isCashback && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div
              className="w-full h-full opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-8.837-7.163-16-16-16v16h16zm0 0c0 8.837 7.163 16 16 16V20H20z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "40px 40px",
              }}
            />
          </div>
        )}

        {/* Top circular cutout */}
        <div className="absolute -top-4 right-16 sm:right-20 z-20">
          <div className="w-8 h-8 bg-white rounded-full border border-gray-200 shadow-sm" />
        </div>

        {/* Bottom circular cutout */}
        <div className="absolute -bottom-4 right-16 sm:right-20 z-20">
          <div className="w-8 h-8 bg-white rounded-full border border-gray-200 shadow-sm" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center" dir="rtl">
          {/* Right section - Date */}
          <div className="flex-shrink-0 w-14 sm:w-16 text-center px-1 sm:px-2">
            <div className="text-black">
              {isCashback ? (
                <div className="space-y-0">
                  <div className="text-base sm:text-lg font-bold leading-none">
                    {typeText.top}
                  </div>
                  <div className="text-sm font-bold leading-none">
                    {typeText.bottom}
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  <div className="text-sm font-bold leading-none">
                    {typeText.top}
                  </div>
                  {typeText.middle && (
                    <div className="text-xs font-medium leading-none">
                      {typeText.middle}
                    </div>
                  )}
                  <div className="text-xs leading-none">{typeText.bottom}</div>
                </div>
              )}
            </div>
          </div>

          <div className="h-16 w-px mx-1 sm:mx-2 dashed-divider" />

          {/* Main content */}
          <div className="flex-1 px-2 sm:px-3 min-w-0">
            {!isCashback && offer.offer_details && (
              <div className="mb-1">
                <h3 className="text-sm font-bold text-orange-500 leading-tight truncate text-right">
                  {offer.offer_details}
                </h3>
              </div>
            )}

            <div
              className={`${
                isCashback ? "flex items-center h-full justify-center" : ""
              }`}
            >
              <p
                className={`text-xs leading-tight text-right ${
                  isCashback
                    ? "text-black font-bold text-center"
                    : "text-gray-700"
                }`}
              >
                {isCashback
                  ? "استرداد نقدي"
                  : offer.product_name || "منتجات مختارة"}
              </p>
            </div>
          </div>

          {/* Dashed vertical divider */}

          {/* Left section - Offer type text */}
          <div className="flex-shrink-0 text-right px-2 sm:px-3">
            <div
              className={`text-xs ${
                isCashback ? "text-black" : "text-gray-700"
              }`}
            >
              <div className="opacity-75 mb-1 font-bold leading-tight">
                صالح حتى
              </div>
              <div className="font-bold text-xs leading-tight">
                {formatOfferDate(offer.end_date)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;
