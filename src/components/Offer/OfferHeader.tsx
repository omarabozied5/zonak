import React, { useState } from "react";
import { ChevronRight, Share2 } from "lucide-react";

interface OfferHeaderProps {
  image: string;
  discount: number | null;
  offerType?: number;
  productName?: string | null;
  oldPrice?: number | null;
  newPrice?: number | null;
  onBack: () => void;
}

const OFFER_TYPES = {
  PRICE_CHANGE: 0,
  DISCOUNT_PERCENTAGE: 1,
  CASHBACK: 3,
} as const;

const OfferHeader: React.FC<OfferHeaderProps> = ({
  image,
  discount,
  offerType,
  productName,
  oldPrice,
  newPrice,
  onBack,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "عرض مميز",
        url: window.location.href,
      });
    }
  };

  const getBadgeContent = () => {
    // If offerType is not provided, default to discount display
    if (offerType === undefined || offerType === null) {
      if (discount) {
        return {
          title: `خصم ${discount}%`,
          subtitle: "على المنتجات",
        };
      }
      return null;
    }

    switch (offerType) {
      case OFFER_TYPES.CASHBACK:
        return {
          title: "كاش باك",
          subtitle: `${discount}% على جميع المنتجات من الكاشير`,
        };

      case OFFER_TYPES.PRICE_CHANGE:
        return {
          title: "كان وصار",
          subtitle: `كان ${oldPrice} جنيه - صار ${newPrice} جنيه`,
        };

      case OFFER_TYPES.DISCOUNT_PERCENTAGE:
        return {
          title: `خصم ${discount}%`,
          subtitle: productName || "على المنتجات المحددة",
        };

      default:
        if (discount) {
          return {
            title: `خصم ${discount}%`,
            subtitle: "على المنتجات",
          };
        }
        return null;
    }
  };

  const badgeContent = getBadgeContent();

  return (
    <div className="relative w-full h-72 bg-gradient-to-br from-yellow-100 to-orange-100 overflow-hidden">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
      >
        <ChevronRight size={24} className="text-gray-800" />
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="absolute top-4 left-4 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
      >
        <Share2 size={20} className="text-gray-800" />
      </button>

      {/* Loading Skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Image */}
      <img
        src={image}
        alt="Offer"
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
        loading="lazy"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Offer Badge - Bottom Center */}
      {badgeContent && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pt-6 pb-4 px-6"
          dir="rtl"
        >
          <div className="text-center">
            <h2 className="text-lg font-bold text-[#FFAA01] mb-2">
              {badgeContent.title}
            </h2>
            <p className="text-gray-600 text-base">{badgeContent.subtitle}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferHeader;
