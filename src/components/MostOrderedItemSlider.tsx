import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SliderProps {
  children: React.ReactNode[];
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
    large: number;
  };
  gap?: number;
  className?: string;
  showDots?: boolean;
  showProgress?: boolean;
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

const MostOrderedItemSlider: React.FC<SliderProps> = ({
  children,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  gap = 24,
  className = "",
  showDots = true,
  showProgress = true,
  autoSlide = false,
  autoSlideInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsVisible, setItemsVisible] = useState(itemsPerView.mobile);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  const totalItems = children.length;
  const maxSlides = Math.max(1, Math.ceil(totalItems / itemsVisible));
  const canGoNext = currentIndex < maxSlides - 1;
  const canGoPrev = currentIndex > 0;

  const updateItemsPerView = useCallback(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.offsetWidth;
    let newItemsVisible: number;

    if (width >= 1280) newItemsVisible = itemsPerView.large;
    else if (width >= 1024) newItemsVisible = itemsPerView.desktop;
    else if (width >= 768) newItemsVisible = itemsPerView.tablet;
    else newItemsVisible = itemsPerView.mobile;

    newItemsVisible = Math.min(newItemsVisible, totalItems);

    if (newItemsVisible !== itemsVisible) {
      setItemsVisible(newItemsVisible);
      setCurrentIndex(0);
    }
  }, [itemsVisible, itemsPerView, totalItems]);

  const nextSlide = useCallback(() => {
    if (canGoNext) {
      setCurrentIndex((prev) => prev + 1);
    } else if (autoSlide) {
      setCurrentIndex(0);
    }
  }, [canGoNext, autoSlide]);

  const prevSlide = useCallback(() => {
    if (canGoPrev) {
      setCurrentIndex((prev) => prev - 1);
    } else if (autoSlide) {
      setCurrentIndex(maxSlides - 1);
    }
  }, [canGoPrev, autoSlide, maxSlides]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < maxSlides) {
        setCurrentIndex(index);
      }
    },
    [maxSlides]
  );

  // Auto-slide functionality
  useEffect(() => {
    if (autoSlide && !isHovered && maxSlides > 1) {
      autoSlideRef.current = setInterval(nextSlide, autoSlideInterval);
    } else if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [autoSlide, isHovered, maxSlides, nextSlide, autoSlideInterval]);

  // Responsive updates
  useEffect(() => {
    updateItemsPerView();
    const handleResize = () => updateItemsPerView();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateItemsPerView]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") nextSlide();
      if (event.key === "ArrowRight") prevSlide();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Show as responsive grid if all items fit
  if (totalItems <= itemsVisible) {
    return (
      <div
        className={`grid ${className}`}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`,
          gap: `${gap}px`,
        }}
      >
        {children}
      </div>
    );
  }

  const startIndex = currentIndex * itemsVisible;
  const endIndex = Math.min(startIndex + itemsVisible, totalItems);
  const currentItems = children.slice(startIndex, endIndex);

  return (
    <div
      className={`relative group ${className}`}
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slider Container */}
      <div className="overflow-hidden">
        <div
          className="grid transition-all duration-500 ease-out"
          style={{
            gridTemplateColumns: `repeat(${Math.min(
              itemsVisible,
              currentItems.length
            )}, 1fr)`,
            gap: `${gap}px`,
          }}
        >
          {currentItems.map((child, index) => (
            <div key={startIndex + index} className="w-full">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {maxSlides > 1 && (
        <>
          {/* Next Arrow (Left in RTL) */}
          <button
            onClick={nextSlide}
            disabled={!canGoNext && !autoSlide}
            className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/95 hover:bg-white border-2 border-[#FFAA01]/20 shadow-2xl backdrop-blur-md rounded-full h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[#FFAA01]/30 ${
              isHovered || autoSlide
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            } disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#FFAA01]`}
            aria-label="العنصر التالي"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-[#053468] group-hover:text-[#FFAA01] transition-colors" />
          </button>

          {/* Previous Arrow (Right in RTL) */}
          <button
            onClick={prevSlide}
            disabled={!canGoPrev && !autoSlide}
            className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/95 hover:bg-white border-2 border-[#FFAA01]/20 shadow-2xl backdrop-blur-md rounded-full h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[#FFAA01]/30 ${
              isHovered || autoSlide
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            } disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#FFAA01]`}
            aria-label="العنصر السابق"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-[#053468] group-hover:text-[#FFAA01] transition-colors" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && maxSlides > 1 && (
        <div className="flex justify-center mt-6 sm:mt-8 gap-2">
          {Array.from({ length: maxSlides }, (_, index) => (
            <button
              key={index}
              className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FFAA01] focus:ring-offset-2 ${
                index === currentIndex
                  ? "bg-gradient-to-r from-[#FFAA01] to-[#ff8c00] w-8 h-3 sm:w-10 sm:h-3 shadow-lg"
                  : "bg-gray-300 w-3 h-3 sm:w-3 sm:h-3 hover:bg-[#FFAA01]/50 hover:scale-110"
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`الذهاب إلى الشريحة ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Indicator */}
      {showProgress && maxSlides > 1 && (
        <div className="mt-4 sm:mt-6 text-center text-sm text-[#053468]/70 font-medium">
          عرض {startIndex + 1}-{endIndex} من {totalItems}
        </div>
      )}

      {/* Auto-slide Progress Bar */}
      {autoSlide && maxSlides > 1 && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#FFAA01] to-[#ff8c00] h-full rounded-full transition-all duration-300 shadow-sm"
            style={{
              width: `${((currentIndex + 1) / maxSlides) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MostOrderedItemSlider;
