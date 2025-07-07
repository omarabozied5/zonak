import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSliderProps {
  images: string[];
  restaurantName: string;
  autoSlideInterval?: number;
  className?: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  restaurantName,
  autoSlideInterval = 6000,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Memoize valid images to prevent unnecessary re-renders
  const validImages = useMemo(() => {
    return (
      images?.filter(
        (img, index) => img && img.trim() !== "" && !imageErrors.has(index)
      ) || []
    );
  }, [images, imageErrors]);

  const hasMultipleImages = validImages.length > 1;

  // Auto-slide functionality
  useEffect(() => {
    if (!hasMultipleImages) return;

    const interval = setInterval(() => {
      handleNext();
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [hasMultipleImages, currentIndex, autoSlideInterval]);

  const handleTransition = useCallback(
    (callback: () => void) => {
      if (isTransitioning || !hasMultipleImages) return;

      setIsTransitioning(true);
      callback();
      setTimeout(() => setIsTransitioning(false), 400);
    },
    [isTransitioning, hasMultipleImages]
  );

  const handleNext = useCallback(() => {
    handleTransition(() => {
      setCurrentIndex((prev) =>
        prev === validImages.length - 1 ? 0 : prev + 1
      );
    });
  }, [handleTransition, validImages.length]);

  const handlePrevious = useCallback(() => {
    handleTransition(() => {
      setCurrentIndex((prev) =>
        prev === 0 ? validImages.length - 1 : prev - 1
      );
    });
  }, [handleTransition, validImages.length]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      handleTransition(() => {
        setCurrentIndex(index);
      });
    },
    [currentIndex, handleTransition]
  );

  const handleImageError = useCallback((index: number) => {
    setImageErrors((prev) => new Set([...prev, index]));
  }, []);

  // Fallback UI when no valid images are available
  if (validImages.length === 0) {
    return (
      <div
        className={`relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFAA01] via-[#FFD700] to-[#FFAA01]">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-6 left-6 w-20 h-20 border-2 border-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 right-6 w-16 h-16 border-2 border-white rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full animate-pulse delay-500"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-white text-center px-6">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-4 animate-bounce">
                🏪
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
                {restaurantName}
              </h2>
              <p className="text-sm sm:text-base opacity-90 font-medium">
                مرحباً بكم
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden group bg-gray-100 ${className}`}
    >
      {/* Image container */}
      <div className="relative w-full h-full">
        {validImages.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className={`absolute inset-0 transition-all duration-500 ease-out ${
              index === currentIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <img
              src={image}
              alt={`${restaurantName} - صورة ${index + 1}`}
              className="w-full h-full object-cover"
              onError={() => handleImageError(index)}
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#053468]/80 via-[#053468]/20 to-transparent"></div>
      </div>

      {/* Navigation buttons */}
      {hasMultipleImages && (
        <>
          <button
            onClick={handlePrevious}
            disabled={isTransitioning}
            className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 
                     bg-[#053468]/60 hover:bg-[#053468]/80 text-white 
                     p-2 sm:p-3 rounded-full 
                     opacity-0 group-hover:opacity-100 
                     transition-all duration-300 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     backdrop-blur-sm border border-white/20
                     hover:scale-110 active:scale-95"
            aria-label="الصورة السابقة"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 
                     bg-[#053468]/60 hover:bg-[#053468]/80 text-white 
                     p-2 sm:p-3 rounded-full 
                     opacity-0 group-hover:opacity-100 
                     transition-all duration-300 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     backdrop-blur-sm border border-white/20
                     hover:scale-110 active:scale-95"
            aria-label="الصورة التالية"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </>
      )}

      {/* Restaurant name and counter */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        <div className="flex items-end justify-between mb-3">
          <div className="flex-1">
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-bold text-white 
                         drop-shadow-lg filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
              {restaurantName}
            </h1>
          </div>

          {hasMultipleImages && (
            <div
              className="bg-[#053468]/60 backdrop-blur-sm rounded-full 
                          px-3 sm:px-4 py-1.5 sm:py-2 
                          text-xs sm:text-sm text-white font-medium
                          border border-white/20"
            >
              {currentIndex + 1} / {validImages.length}
            </div>
          )}
        </div>

        {/* Dot indicators - positioned at the very bottom */}
        {hasMultipleImages && (
          <div className="flex justify-center">
            <div
              className="flex space-x-1.5 sm:space-x-2 bg-black/20 rounded-full px-3 py-2 
                          backdrop-blur-sm border border-white/10"
            >
              {validImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isTransitioning}
                  className={`rounded-full transition-all duration-300 
                           hover:scale-125 active:scale-95
                           ${
                             index === currentIndex
                               ? "bg-[#FFAA01] shadow-lg shadow-[#FFAA01]/50 w-6 sm:w-8 h-2 sm:h-2.5"
                               : "bg-white/50 hover:bg-white/70 w-2 sm:w-2.5 h-2 sm:h-2.5"
                           }`}
                  aria-label={`الذهاب للصورة ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSlider;
