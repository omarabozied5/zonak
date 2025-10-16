import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore, CartItem as StoreCartItem } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartValidation } from "@/hooks/useCartValidation";
import { useCartSummary } from "@/hooks/useCartSummary";
import { toast } from "sonner";

import CartCheckoutHeader from "@/components/Cart/CartHeader";
import CartPriceBreakdown from "@/components/Cart/CartPriceBreakdown";
import CartCTAButton from "@/components/Cart/CartCTAButton";
import CartEmptyState from "@/components/Cart/EmptyCartState";
import CartRestaurantDropdown from "@/components/Cart/CartResturantDropDown";
import CartOfferSection from "@/components/Cart/CartOfferSection";
import MultiRestaurantWarning from "@/components/Cart/MultiRestaurantWarning";

import { CartItem, Restaurant, ValidOffersItem } from "../types/types";
import { apiService } from "@/services/apiService";
import {
  calculateTotalItemDiscounts,
  calculateOriginalTotal,
} from "@/lib/cartUtils";

const Cart = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const cartStore = useCartStore(user?.id || null);
  const {
    items,
    totalPrice,
    updateQuantity,
    removeItem,
    hasCustomizations,
    setEditingItem,
  } = cartStore;

  const convertedItems: CartItem[] = useMemo(
    () =>
      items.map((item: StoreCartItem) => ({
        ...item,
        selectedOptions: item.selectedOptions
          ? {
              ...item.selectedOptions,
              optionalOptions:
                item.selectedOptions.optionalOptions?.map(String) || [],
            }
          : undefined,
      })),
    [items]
  );

  const cartSummary = useCartSummary(convertedItems);
  const cartValidation = useCartValidation(convertedItems);

  const totalItemDiscounts = useMemo(
    () => calculateTotalItemDiscounts(convertedItems),
    [convertedItems]
  );
  const originalTotalPrice = useMemo(
    () => calculateOriginalTotal(convertedItems),
    [convertedItems]
  );

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [offers, setOffers] = useState<ValidOffersItem[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  const firstItem = items[0];
  const shouldFetchData = firstItem?.placeId && firstItem?.restaurantId;

  useEffect(() => {
    if (!shouldFetchData) return;

    let isMounted = true;
    const controller = new AbortController();

    const fetchRestaurantData = async () => {
      try {
        setLoadingOffers(true);

        const [restaurantResponse, offersResponse] = await Promise.all([
          apiService.fetchRestaurantDetails(firstItem.placeId),
          apiService.fetchCartOrderInfo(
            firstItem.restaurantId,
            firstItem.placeId
          ),
        ]);

        if (!isMounted) return;

        if (
          restaurantResponse.message === "success" &&
          restaurantResponse.data
        ) {
          setRestaurant(restaurantResponse.data);
        }

        if (offersResponse.offers && offersResponse.offers.length > 0) {
          setOffers(offersResponse.offers);
        } else {
          setOffers([]);
        }
      } catch (error) {
        if (!isMounted) return;
        setOffers([]);
      } finally {
        if (isMounted) {
          setLoadingOffers(false);
        }
      }
    };

    fetchRestaurantData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [firstItem?.placeId, firstItem?.restaurantId, shouldFetchData]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول لعرض السلة");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleExploreRestaurants = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleAddMoreItems = useCallback(() => {
    if (items.length > 0) {
      navigate(`/restaurant/${items[0].placeId}`);
    }
  }, [items, navigate]);

  const handleOfferClick = useCallback((offer: ValidOffersItem) => {
    // Implement offer application logic
  }, []);

  const itemHasCustomizations = useCallback(
    (item: CartItem): boolean => {
      if (item.isCustomizable) return true;

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

      return hasCustomizations(item);
    },
    [hasCustomizations]
  );

  const handleEditItem = useCallback(
    (item: CartItem) => {
      try {
        if (!itemHasCustomizations(item)) {
          toast.error("هذا العنصر لا يحتوي على خيارات قابلة للتعديل");
          return;
        }

        const baseItemId = item.productId || item.id.split("-")[0];
        setEditingItem(item.id);

        const editUrl = new URL(`/item/${baseItemId}`, window.location.origin);
        editUrl.searchParams.set("edit", item.id);
        editUrl.searchParams.set("placeId", item.placeId || "");
        editUrl.searchParams.set("merchantId", item.restaurantId || "");
        editUrl.searchParams.set("restaurantName", item.restaurantName || "");

        navigate(editUrl.pathname + editUrl.search);
      } catch (error) {
        toast.error("حدث خطأ أثناء تعديل الصنف");
      }
    },
    [itemHasCustomizations, setEditingItem, navigate]
  );

  const handleQuantityUpdate = useCallback(
    (itemId: string, newQuantity: number) => {
      try {
        if (newQuantity < 0) return;

        if (newQuantity === 0) {
          removeItem(itemId);
          toast.success("تم حذف الصنف من السلة");
          return;
        }

        updateQuantity(itemId, newQuantity);
      } catch (error) {
        toast.error("حدث خطأ أثناء تحديث الكمية");
      }
    },
    [updateQuantity, removeItem]
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      try {
        removeItem(itemId);
        toast.success("تم حذف الصنف من السلة");
      } catch (error) {
        toast.error("حدث خطأ أثناء حذف الصنف");
      }
    },
    [removeItem]
  );

  const restaurantGroups = useMemo(() => {
    const groups = new Map<
      string,
      { restaurantId: string; restaurantName: string; itemCount: number }
    >();

    items.forEach((item) => {
      const restaurantId = item.restaurantId || item.placeId || "";
      if (restaurantId) {
        if (groups.has(restaurantId)) {
          const existing = groups.get(restaurantId)!;
          groups.set(restaurantId, {
            ...existing,
            itemCount: existing.itemCount + item.quantity,
          });
        } else {
          groups.set(restaurantId, {
            restaurantId,
            restaurantName: item.restaurantName || "مطعم",
            itemCount: item.quantity,
          });
        }
      }
    });

    return Array.from(groups.values());
  }, [items]);

  const hasMultipleRestaurants = restaurantGroups.length > 1;

  const handleClearOtherRestaurants = useCallback(
    (keepRestaurantId: string) => {
      try {
        const itemsToRemove = items.filter(
          (item) => (item.restaurantId || item.placeId) !== keepRestaurantId
        );

        itemsToRemove.forEach((item) => removeItem(item.id));

        const keptRestaurant = restaurantGroups.find(
          (r) => r.restaurantId === keepRestaurantId
        );
        toast.success(
          `تم الاحتفاظ بعناصر ${keptRestaurant?.restaurantName || "المطعم"} فقط`
        );
      } catch (error) {
        toast.error("حدث خطأ أثناء تحديث السلة");
      }
    },
    [items, removeItem, restaurantGroups]
  );

  const handleProceedToCheckout = useCallback(() => {
    try {
      if (!cartValidation.canProceedToCheckout) {
        const firstError = cartValidation.validationErrors[0];
        toast.error(firstError);
        return;
      }

      if (hasMultipleRestaurants) {
        toast.error("يجب الطلب من مطعم واحد فقط");
        return;
      }

      navigate("/checkout");
    } catch (error) {
      toast.error("حدث خطأ أثناء المتابعة للدفع");
    }
  }, [cartValidation, hasMultipleRestaurants, navigate]);

  const isCheckoutDisabled =
    cartValidation.isCheckoutDisabled || hasMultipleRestaurants;

  if (!isAuthenticated || !user) {
    return null;
  }

  if (cartSummary.isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="w-full max-w-md mx-auto bg-gray-50">
          <CartCheckoutHeader onBack={handleGoBack} />
          <CartEmptyState onExploreRestaurants={handleExploreRestaurants} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="w-full max-w-md mx-auto bg-gray-50 relative">
        <CartCheckoutHeader onBack={handleGoBack} />

        <div className="pt-4 pb-28 space-y-4 px-4">
          {hasMultipleRestaurants && (
            <MultiRestaurantWarning
              restaurants={restaurantGroups}
              onClearOtherRestaurants={handleClearOtherRestaurants}
            />
          )}

          {offers.length > 0 && !loadingOffers && (
            <div className="-mx-4">
              <CartOfferSection
                offers={offers}
                onOfferClick={handleOfferClick}
                className="px-0"
              />
            </div>
          )}

          {items.length > 0 && (
            <div className="-mx-4 px-4">
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
                defaultExpanded={true}
              />
            </div>
          )}

          {loadingOffers && (
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FBD252] mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">جاري التحميل...</p>
            </div>
          )}

          <CartPriceBreakdown
            totalPrice={totalPrice}
            totalItemDiscounts={totalItemDiscounts}
            itemCount={convertedItems.length}
          />
        </div>

        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50">
          <CartCTAButton
            total={totalPrice}
            isDisabled={isCheckoutDisabled}
            onProceedToCheckout={handleProceedToCheckout}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(Cart);
