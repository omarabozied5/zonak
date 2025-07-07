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
  gap = 16,
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

    // Ensure we don't show more items than available
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
      setCurrentIndex(0); // Loop back to start
    }
  }, [canGoNext, autoSlide]);

  const prevSlide = useCallback(() => {
    if (canGoPrev) {
      setCurrentIndex((prev) => prev - 1);
    } else if (autoSlide) {
      setCurrentIndex(maxSlides - 1); // Loop to end
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
    const observer = new ResizeObserver(handleResize);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
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

  // If all items fit in one view, show as responsive grid
  if (totalItems <= itemsVisible) {
    return (
      <div
        className={`grid gap-${gap / 4} ${className}`}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
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
          className="grid transition-all duration-300 ease-out"
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
            className={`absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 bg-white/95 hover:bg-white border border-gray-200 shadow-xl backdrop-blur-md rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
              isHovered || autoSlide
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="العنصر التالي"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-700" />
          </button>

          {/* Previous Arrow (Right in RTL) */}
          <button
            onClick={prevSlide}
            disabled={!canGoPrev && !autoSlide}
            className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 bg-white/95 hover:bg-white border border-gray-200 shadow-xl backdrop-blur-md rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
              isHovered || autoSlide
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="العنصر السابق"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-700" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && maxSlides > 1 && (
        <div className="flex justify-center mt-4 sm:mt-6 gap-1 sm:gap-2">
          {Array.from({ length: maxSlides }, (_, index) => (
            <button
              key={index}
              className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                index === currentIndex
                  ? "bg-gradient-to-r from-orange-500 to-red-500 w-6 h-2 sm:w-8 sm:h-3 shadow-lg"
                  : "bg-gray-300 w-2 h-2 sm:w-3 sm:h-3 hover:bg-gray-400 hover:scale-110"
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`الذهاب إلى الشريحة ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Indicator */}
      {showProgress && maxSlides > 1 && (
        <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-500">
          عرض {startIndex + 1}-{endIndex} من {totalItems}
        </div>
      )}

      {/* Progress Bar */}
      {autoSlide && maxSlides > 1 && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-gradient-to-r from-orange-500 to-red-500 h-1 rounded-full transition-all duration-300"
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
