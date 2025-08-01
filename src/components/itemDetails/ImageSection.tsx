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
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-white rounded-xl overflow-hidden shadow-lg">
        <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={itemName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-base sm:text-lg">
                لا توجد صورة
              </span>
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => navigateImage("prev")}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => navigateImage("next")}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-2">
            {isCombo && (
              <Badge className="bg-[#FFAA01] text-[#053468] font-semibold text-xs sm:text-sm">
                كومبو
              </Badge>
            )}
            {!isItemActive && (
              <Badge variant="destructive" className="text-xs sm:text-sm">
                غير متوفر
              </Badge>
            )}
          </div>

          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                    index === currentImageIndex ? "bg-[#FFAA01]" : "bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentImageIndex
                  ? "border-[#FFAA01]"
                  : "border-gray-200"
              }`}
            >
              <img
                src={image.image_url}
                alt={`${itemName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSection;
