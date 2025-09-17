import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Button } from "../components/ui/button";
import LoginModal from "../components/LoginModal";
import Menu from "../components/Menu";
import FloatingCart from "../components/FloatingCart";
import MostOrderedItems from "../components/MostOrderedItems";
import { apiService, dataHelpers } from "../services/apiService";
import { useCartStore } from "../stores/useCartStore";
import { ArrowLeft } from "lucide-react";
import { Restaurant, CartItem } from "../types/types";
import { ErrorState, LoadingState } from "../components/ErrorLoadingStates";
import ImageSlider from "../components/ImageSlider";
import RestaurantInfo from "../components/ResturantInfo";
import { MenuItem } from "../hooks/useMenuItems";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Clock, AlertCircle } from "lucide-react";
import { useRestaurantStatus } from "../hooks/useRestaurantStatus";
import OffersSection from "../components/PlaceDetails/offer/OffersSection";
import { ValidOffersItem } from "../types/types";

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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
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
      // console.error("Error fetching restaurant data:", err);
      setError(
        err instanceof Error ? err.message : "فشل في تحميل تفاصيل المطعم"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Handler for offer click
  const handleOfferClick = useCallback((offer: ValidOffer) => {
    // console.log("تم النقر على العرض:", offer);
    // Handle offer click - you can navigate to a specific page,
    // add to cart, or show offer details modal
    // Example: navigate(`/offer/${offer.id}`);
  }, []);

  // Handler for view all offers
  const handleViewAllOffers = useCallback(() => {
    // console.log("عرض جميع العروض");
    // Navigate to offers page or show offers modal
    // Example: navigate(`/restaurant/${id}/offers`);
  }, [id]);

  useEffect(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);

  const handleRetry = useCallback(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Restaurant Status Banner Component
  const RestaurantStatusBanner = ({
    restaurant,
  }: {
    restaurant: Restaurant;
  }) => {
    const restaurantStatus = useRestaurantStatus(restaurant);

    if (restaurantStatus.canOrder) return null;

    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 mb-4">
        <Alert
          className={`border ${
            restaurantStatus.reasonClosed === "busy"
              ? "border-amber-200 bg-amber-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-2">
            {restaurantStatus.reasonClosed === "busy" ? (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            ) : (
              <Clock className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={`font-medium ${
                restaurantStatus.reasonClosed === "busy"
                  ? "text-amber-800"
                  : "text-red-800"
              }`}
            >
              {restaurantStatus.statusMessage}
            </AlertDescription>
          </div>
        </Alert>
      </div>
    );
  };

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

      {/* Restaurant Information - Pass all data */}
      <div className="">
        <RestaurantInfo
          restaurant={restaurant}
          rating={rating}
          branches={branches}
        />
      </div>

      <RestaurantStatusBanner restaurant={restaurant} />

      {/* Ticket-Style Offers Section */}
      {restaurant.valid_offers && restaurant.valid_offers.length > 0 && (
        <div className="p-3">
          <OffersSection
            offers={restaurant.valid_offers}
            onOfferClick={handleOfferClick}
            onViewAllClick={handleViewAllOffers}
            maxDisplayCount={3} // Show max 3 offers in restaurant details
            showOnlyValid={true} // Only show valid offers
          />
        </div>
      )}

      {/* Most Ordered Items */}
      <div className="mx-0">
        <MostOrderedItems
          userId={restaurant.user_id.toString()}
          placeId={id}
          restaurant={restaurant}
          restaurantName={restaurant.merchant_name}
        />
      </div>

      {/* Menu */}
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 mb-6 sm:mb-8">
        <Menu
          userId={restaurant.user_id.toString()}
          merchantId={restaurant.user_id}
          restaurantName={restaurant.merchant_name}
          restaurant={restaurant}
          placeId={id}
          categoryId={menuItems[0]?.categories?.[0]?.id || 0}
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
