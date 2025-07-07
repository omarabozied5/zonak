import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/LoginModal";
import Menu from "@/components/Menu";
import FloatingCart from "@/components/FloatingCart";
import MostOrderedItems from "@/components/MostOrderedItems";
import { apiService, dataHelpers } from "@/services/apiService";
import { useCartStore } from "@/stores/useCartStore";
import { ArrowLeft } from "lucide-react";
import { Restaurant, CartItem } from "../types/types";
import { ErrorState, LoadingState } from "../components/ErrorLoadingStates";
import ImageSlider from "../components/ImageSlider";
import RestaurantInfo from "../components/ResturantInfo";

// Interface for comprehensive restaurant data
interface RestaurantData {
  restaurant: Restaurant;
  rating: {
    averageRating: number;
    totalRatings: number;
    myRating: number;
    breakdown: Array<{
      stars: number;
      count: number;
      percentage: number;
    }>;
  } | null;
  branches: Array<{
    id: string;
    title: string;
    titleAr: string;
    address: string;
    addressAr: string;
    phone: string;
    rating: number;
    distance: number;
    enableDelivery: boolean;
    isActive: boolean;
  }> | null;
}

// Main Component
const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for all restaurant-related data
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { addItem } = useCartStore();

  // Fetch all restaurant data in a single operation
  const fetchRestaurantData = useCallback(async () => {
    if (!id) {
      setError("معرف المطعم غير صحيح");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch restaurant details
      const restaurantResponse = await apiService.fetchRestaurantDetails(id);
      if (!restaurantResponse?.data) {
        throw new Error("لم يتم العثور على بيانات المطعم");
      }

      const restaurant = restaurantResponse.data;

      // Prepare location coordinates for branches
      const latitude = restaurant.latitude
        ? parseFloat(restaurant.latitude)
        : 30.0444;
      const longitude = restaurant.longitude
        ? parseFloat(restaurant.longitude)
        : 31.2357;

      // Fetch rating and branches data in parallel
      const [ratingResponse, branchesResponse] = await Promise.allSettled([
        apiService.fetchPlaceRating(Number(id)),
        apiService.fetchPlaceBranches(Number(id), latitude, longitude),
      ]);

      // Process rating data using the helper function
      let ratingData = null;
      if (ratingResponse.status === "fulfilled" && ratingResponse.value?.data) {
        ratingData = dataHelpers.processRatingData(ratingResponse.value);
      }

      // Process branches data using the helper function
      let branchesData = null;
      if (
        branchesResponse.status === "fulfilled" &&
        branchesResponse.value?.data
      ) {
        branchesData = dataHelpers.processBranchesData(
          branchesResponse.value.data
        );
      }

      // Set combined data
      setRestaurantData({
        restaurant,
        rating: ratingData,
        branches: branchesData,
      });
    } catch (err) {
      console.error("Error fetching restaurant data:", err);
      setError(
        err instanceof Error ? err.message : "فشل في تحميل تفاصيل المطعم"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);

  const handleAddToCart = useCallback(
    (item: CartItem) => {
      if (!restaurantData?.restaurant) return;
      addItem({
        id: item.id,
        name: item.name,
        price: item.new_price || item.price,
        image: item.images?.[0]?.image_url || "",
        restaurantId: restaurantData.restaurant.user_id.toString(),
        restaurantName: restaurantData.restaurant.merchant_name,
        quantity: 1,
      });
    },
    [restaurantData, addItem]
  );

  const handleRetry = useCallback(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC]/10 via-white to-[#FFD700]/5">
        <Navigation />
        <LoadingState />
      </div>
    );
  }

  if (error || !restaurantData?.restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC]/10 via-white to-[#FFD700]/5">
        <Navigation />
        <ErrorState
          error={error || "حدث خطأ أثناء تحميل تفاصيل المطعم"}
          onRetry={handleRetry}
          onBack={handleBack}
        />
      </div>
    );
  }

  const { restaurant, rating, branches } = restaurantData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC]/10 via-white to-[#FFD700]/5">
      <Navigation />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-3 sm:pt-4">
        <Button
          onClick={handleBack}
          variant="outline"
          className="mb-3 sm:mb-4 border-[#FFAA01] text-[#FFAA01] hover:bg-[#FFAA01] hover:text-white text-sm sm:text-base px-3 sm:px-4 py-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة للرئيسية
        </Button>
      </div>

      {/* Restaurant Image Slider */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 mb-6 sm:mb-8">
        <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
          <ImageSlider
            images={restaurant.slider_images || []}
            restaurantName={restaurant.merchant_name}
          />
        </div>
      </div>

      {/* Restaurant Information - Pass all data */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 mb-6 sm:mb-8">
        <RestaurantInfo
          restaurant={restaurant}
          rating={rating}
          branches={branches}
        />
      </div>

      {/* Most Ordered Items */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 mb-6 sm:mb-8">
        <MostOrderedItems userId={restaurant.user_id.toString()} placeId={id} />
      </div>

      {/* Menu */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 mb-6 sm:mb-8">
        <Menu
          restaurantId={restaurant.user_id.toString()}
          restaurantName={restaurant.merchant_name}
        />
      </div>

      {/* Floating Cart */}
      <FloatingCart />

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default RestaurantDetails;
