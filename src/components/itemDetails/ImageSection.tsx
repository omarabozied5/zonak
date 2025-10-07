import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MenuItemImage } from "../../types/types";

interface ImageSectionProps {
  images: MenuItemImage[];
  itemName: string;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  navigateImage: (direction: "next" | "prev") => void;
  isCombo: boolean;
  isItemActive: boolean;
}

const ImageSection: React.FC<ImageSectionProps> = ({
  images,
  itemName,
  currentImageIndex,
  setCurrentImageIndex,
  navigateImage,
  isCombo,
  isItemActive,
}) => {
  const mainImage =
    images.length > 0 ? images[currentImageIndex]?.image_url : null;

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {mainImage ? (
          <img
            src={mainImage}
            alt={itemName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm sm:text-base md:text-lg">
              لا توجد صورة
            </span>
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => navigateImage("prev")}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={() => navigateImage("next")}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1.5 sm:gap-2">
          {isCombo && (
            <Badge className="bg-[#E49B0F] text-white font-semibold text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
              كومبو
            </Badge>
          )}
          {!isItemActive && (
            <Badge
              variant="destructive"
              className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5"
            >
              غير متوفر
            </Badge>
          )}
        </div>

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                  index === currentImageIndex ? "bg-[#E49B0F]" : "bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSection;
