// utils/offerUtils.ts

import {
  ValidOffersItem,
  OfferTextContent,
  OFFER_TYPE_PRICE,
  OFFER_TYPE_DISCOUNT,
  OFFER_TYPE_OFFER,
  OFFER_CASHBACK,
} from "../types/types";

export const getOfferText = (offer: ValidOffersItem): OfferTextContent => {
  switch (offer.offer_type) {
    case OFFER_TYPE_PRICE:
      return {
        main: `${offer.new_price || 0} ريال`,
        sub: `بدلاً من ${offer.old_price || 0} ريال`,
        badge: "خصم",
      };
    case OFFER_TYPE_DISCOUNT:
      return {
        main: `خصم ${offer.discount || 0}%`,
        sub: "على جميع المنتجات",
        badge: "خصم",
      };
    case OFFER_TYPE_OFFER:
      return {
        main: offer.offer_details || "عرض خاص",
        sub: offer.product_name || "منتجات مختارة",
        badge: "عرض",
      };
    case OFFER_CASHBACK:
      return {
        main: "كاش باك",
        sub: "استرداد نقدي",
        badge: "كاش باك",
      };
    default:
      return {
        main: offer.offer_details || "عرض خاص",
        sub: offer.product_name || "منتجات مختارة",
        badge: "عرض",
      };
  }
};

export const formatOfferDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (e) {
    return dateString.split(" ")[0];
  }
};

export const isValidOffer = (offer: ValidOffersItem): boolean => {
  if (!offer || !offer.id) return false;

  try {
    const endDate = new Date(offer.end_date);
    const now = new Date();
    return endDate > now;
  } catch (e) {
    return true; // If date parsing fails, assume offer is valid
  }
};
