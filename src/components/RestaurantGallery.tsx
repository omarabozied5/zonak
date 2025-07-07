import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface RestaurantGalleryProps {
  restaurant: any;
}

const RestaurantGallery = ({ restaurant }: RestaurantGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (!restaurant.slider_images || restaurant.slider_images.length <= 1) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % restaurant.slider_images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(
        selectedImage === 0
          ? restaurant.slider_images.length - 1
          : selectedImage - 1
      );
    }
  };

  return (
    <>
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">صور المطعم</h2>
          <div className="text-sm text-gray-500">
            {restaurant.slider_images.length} صورة
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {restaurant.slider_images
            .slice(0, 8)
            .map((image: string, index: number) => (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer bg-gray-100"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image}
                  alt={`${restaurant.merchant_name} ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2">
                    <svg
                      className="w-6 h-6 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Image counter overlay */}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {index + 1}
                </div>
              </div>
            ))}
        </div>

        {restaurant.slider_images.length > 8 && (
          <div className="text-center mt-4">
            <button className="text-arabic-orange hover:text-arabic-gold font-medium text-sm">
              عرض جميع الصور ({restaurant.slider_images.length})
            </button>
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={restaurant.slider_images[selectedImage]}
              alt={`${restaurant.merchant_name} ${selectedImage + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {restaurant.slider_images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              {selectedImage + 1} من {restaurant.slider_images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantGallery;
