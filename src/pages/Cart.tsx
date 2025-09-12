// Updated Cart.tsx with integrated Restaurant Badge Dropdown
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore, CartItem as StoreCartItem } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartValidation } from "@/hooks/useCartValidation";
import { useCartSummary } from "@/hooks/useCartSummary";
import { toast } from "sonner";

// Import cart components
import CartCheckoutHeader from "@/components/Cart/CartHeader";
import CartPriceBreakdown from "@/components/Cart/CartPriceBreakdown";
import CartCTAButton from "@/components/Cart/CartCTAButton";
import CartEmptyState from "@/components/Cart/EmptyCartState";
import CartRestaurantDropdown from "@/components/Cart/CartResturantDropDown";

import { CartItem, Restaurant } from "../types/types";
import { apiService } from "@/services/apiService";

// Import utility functions
import {
  calculateTotalItemDiscounts,
  calculateOriginalTotal,
} from "@/lib/cartUtils";

const Cart = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // Pass user ID to cart store for proper user-specific data
  const cartStore = useCartStore(user?.id || null);
  const {
    items,
    totalPrice,
    updateQuantity,
    removeItem,
    hasCustomizations,
    setEditingItem,
  } = cartStore;

  // Convert store items to component items format
  const convertedItems: CartItem[] = items.map((item: StoreCartItem) => ({
    ...item,
    selectedOptions: item.selectedOptions
      ? {
          ...item.selectedOptions,
          optionalOptions:
            item.selectedOptions.optionalOptions?.map(String) || [],
        }
      : undefined,
  }));

  // Get cart summary and validation
  const cartSummary = useCartSummary(convertedItems);
  const cartValidation = useCartValidation(convertedItems);

  // Calculate discount information using utility functions
  const totalItemDiscounts = calculateTotalItemDiscounts(convertedItems);
  const originalTotalPrice = calculateOriginalTotal(convertedItems);

  // Restaurant state for header
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  // Fetch restaurant details for header
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (items.length > 0 && items[0].placeId) {
        try {
          const response = await apiService.fetchRestaurantDetails(
            items[0].placeId
          );
          if (response.message === "success" && response.data) {
            setRestaurant(response.data);
          }
        } catch (error) {
          console.error("Error fetching restaurant details:", error);
        }
      }
    };

    fetchRestaurantDetails();
  }, [items]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول لعرض السلة");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleGoBack = (): void => {
    navigate(-1);
  };

  const handleExploreRestaurants = (): void => {
    navigate("/");
  };

  // Navigate to add more items from the same restaurant
  const handleAddMoreItems = (): void => {
    if (items.length > 0) {
      navigate(`/restaurant/${items[0].placeId}`);
    }
  };

  // Fixed edit item handler with proper customization check
  const handleEditItem = (item: CartItem): void => {
    try {
      // Check if item can be edited (has customizations)
      if (!itemHasCustomizations(item)) {
        toast.error("هذا العنصر لا يحتوي على خيارات قابلة للتعديل");
        return;
      }

      const baseItemId = item.productId || item.id.split("-")[0];
      setEditingItem(item.id);

      // Preserve restaurant information in edit navigation
      const editUrl = new URL(`/item/${baseItemId}`, window.location.origin);
      editUrl.searchParams.set("edit", item.id);
      editUrl.searchParams.set("placeId", item.placeId || "");
      editUrl.searchParams.set("merchantId", item.restaurantId || "");
      editUrl.searchParams.set("restaurantName", item.restaurantName || "");

      navigate(editUrl.pathname + editUrl.search);
    } catch (error) {
      console.error("Error editing item:", error);
      toast.error("حدث خطأ أثناء تعديل الصنف");
    }
  };

  // Helper function to check if item has customizations
  const itemHasCustomizations = (item: CartItem): boolean => {
    // Check if item is marked as customizable
    if (item.isCustomizable) return true;

    // Check if item has any selected options that make it customizable
    if (item.selectedOptions) {
      const hasRequiredOptions =
        item.selectedOptions.requiredOptions &&
        Object.keys(item.selectedOptions.requiredOptions).length > 0;
      const hasOptionalOptions =
        item.selectedOptions.optionalOptions &&
        item.selectedOptions.optionalOptions.length > 0;
      const hasNotes =
        item.selectedOptions.notes &&
        item.selectedOptions.notes.trim().length > 0;
      const hasSize = item.selectedOptions.size;

      return !!(
        hasRequiredOptions ||
        hasOptionalOptions ||
        hasNotes ||
        hasSize
      );
    }

    // Fallback to store's hasCustomizations function
    return hasCustomizations(item);
  };

  const handleQuantityUpdate = (itemId: string, newQuantity: number): void => {
    try {
      if (newQuantity < 0) return;

      if (newQuantity === 0) {
        handleRemoveItem(itemId);
        return;
      }

      updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("حدث خطأ أثناء تحديث الكمية");
    }
  };

  const handleRemoveItem = (itemId: string): void => {
    try {
      removeItem(itemId);
      toast.success("تم حذف الصنف من السلة");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("حدث خطأ أثناء حذف الصنف");
    }
  };

  const handleProceedToCheckout = (): void => {
    try {
      if (!cartValidation.canProceedToCheckout) {
        const firstError = cartValidation.validationErrors[0];
        toast.error(firstError);
        return;
      }

      // Navigate to checkout
      navigate("/checkout");
    } catch (error) {
      console.error("Error proceeding to checkout:", error);
      toast.error("حدث خطأ أثناء المتابعة للدفع");
    }
  };

  // Check if checkout should be disabled
  const isCheckoutDisabled = cartValidation.isCheckoutDisabled;

  // Log discount information for debugging
  React.useEffect(() => {
    if (totalItemDiscounts > 0) {
      console.log("Cart discount summary:", {
        originalTotal: originalTotalPrice,
        currentTotal: totalPrice,
        itemDiscounts: totalItemDiscounts,
        savings: totalItemDiscounts,
      });
    }
  }, [totalItemDiscounts, originalTotalPrice, totalPrice]);

  // If cart is empty, show empty state
  if (cartSummary.isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="max-w-sm mx-auto bg-gray-50">
          <CartCheckoutHeader onBack={handleGoBack} />
          <CartEmptyState onExploreRestaurants={handleExploreRestaurants} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-sm mx-auto bg-gray-50">
        <CartCheckoutHeader onBack={handleGoBack} />

        <div className=" py-6 space-y-6 pb-18">
          {/* Restaurant Badge with Cart Items Dropdown */}
          {items.length > 0 && (
            <CartRestaurantDropdown
              merchantId={items[0].restaurantId || ""}
              restaurantName={items[0].restaurantName || ""}
              placeId={items[0].placeId || ""}
              restaurant={restaurant}
              items={convertedItems}
              totalPrice={totalPrice}
              totalItemDiscounts={totalItemDiscounts}
              onQuantityUpdate={handleQuantityUpdate}
              onRemoveItem={handleRemoveItem}
              onEditItem={handleEditItem}
              hasCustomizations={itemHasCustomizations}
              onAddMoreItems={handleAddMoreItems}
              defaultExpanded={false}
            />
          )}

          {/* Price Breakdown */}
          <CartPriceBreakdown
            totalPrice={totalPrice}
            totalItemDiscounts={totalItemDiscounts}
            itemCount={convertedItems.length}
          />
        </div>

        {/* Fixed Bottom CTA Button */}
        <CartCTAButton
          total={totalPrice}
          isDisabled={isCheckoutDisabled}
          onProceedToCheckout={handleProceedToCheckout}
        />
      </div>
    </div>
  );
};

export default Cart;
