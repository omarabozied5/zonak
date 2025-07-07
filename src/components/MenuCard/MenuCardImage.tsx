import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface MenuCardImageProps {
  src: string;
  alt: string;
  isCombo: boolean;
  isAvailable: boolean;
  className?: string;
}

const MenuCardImage = ({
  src,
  alt,
  isCombo,
  isAvailable,
  className = "",
}: MenuCardImageProps) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        className="
          w-full h-full object-cover 
          transition-all duration-700 ease-out
          group-hover:scale-110 group-hover:rotate-1
          filter group-hover:brightness-110
        "
        loading="lazy"
      />

      {/* Gradient Overlay */}
      <div
        className="
        absolute inset-0 
        bg-gradient-to-t from-black/20 via-transparent to-transparent
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-500
      "
      />

      {/* Combo Badge */}
      {isCombo && (
        <Badge
          className="
          absolute top-3 right-3 
          bg-gradient-to-r from-[#FFAA01] to-[#FF8A00] 
          text-white font-semibold text-xs
          shadow-lg hover:shadow-xl
          transition-all duration-300
          hover:scale-110 cursor-default
          flex items-center gap-1
          px-3 py-1.5 rounded-full
          backdrop-blur-sm border border-white/20
        "
        >
          <Star className="h-3 w-3" />
          كومبو
        </Badge>
      )}

      {/* Unavailable Overlay */}
      {!isAvailable && (
        <div
          className="
          absolute inset-0 
          bg-gradient-to-br from-black/60 via-black/50 to-black/40
          backdrop-blur-sm
          flex items-center justify-center 
          rounded-lg
        "
        >
          <div className="text-center space-y-2">
            <Badge
              variant="destructive"
              className="
                text-sm font-semibold px-4 py-2
                bg-red-500/90 text-white
                shadow-lg border border-red-400/30
                backdrop-blur-sm
              "
            >
              غير متوفر
            </Badge>
            <p className="text-white text-xs opacity-90">مؤقتاً</p>
          </div>
        </div>
      )}

      {/* Shine Effect */}
      <div
        className="
        absolute inset-0 
        bg-gradient-to-r from-transparent via-white/20 to-transparent
        -translate-x-full group-hover:translate-x-full
        transition-transform duration-1000 ease-out
        pointer-events-none
      "
      />
    </div>
  );
};

export default MenuCardImage;
