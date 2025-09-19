// Updated ItemDetails.tsx - Responsive fullscreen modal design with proper RTL and dynamic data

import React, { useState, useEffect, useCallback } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { X } from "lucide-react";
import Navigation from "@/components/Navigation";
import FloatingCart from "@/components/FloatingCart";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useItemDetails } from "@/hooks/useItemDetails";
import { CartItem, SelectedOptionDetails } from "@/types/types";
import { toast } from "sonner";

// Component imports
import LoadingState from "../components/itemDetails/LoadingState";
import ErrorState from "../components/itemDetails/ErrorState";
import EditModeIndicator from "../components/itemDetails/EditModeIndicator";
import ImageSection from "../components/itemDetails/ImageSection";
import ItemInfo from "../components/itemDetails/ItemInfo";
import OptionGroups from "../components/itemDetails/OptionGroups";
import NotesSection from "../components/itemDetails/NotesSection";
import QuantityCartSection from "../components/itemDetails/QuantityCartSection";
import ConfirmationDialog from "@/components/currentOrder/ConfirmationDialog";
import CartSummary from "@/components/itemDetails/CartSummary";
import { it } from "node:test";

const ItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { itemDetails, loading, error } = useItemDetails(itemId);

  // Get Restaurant Context
  const urlPlaceId = searchParams.get("placeId") || "";
  const urlMerchantId = searchParams.get("merchantId") || "";
  const urlRestaurantName = searchParams.get("restaurantName") || "Restaurant";

  // Get current user from auth store
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?.id || null;

  // Get cart store instance for current user
  const cartStore = useCartStore(userId);
  const { addItem, items, updateItem, setEditingItem } = cartStore;

  // Check if we're in edit mode
  const editItemId = searchParams.get("edit");
  const isEditMode = Boolean(editItemId);
  const editingItem = isEditMode
    ? items.find((item) => item.id === editItemId)
    : null;

  // Get final restaurant context - prefer editing item's data over URL params
  const finalPlaceId =
    itemDetails?.placeId ||
    (isEditMode && editingItem ? editingItem.placeId : urlPlaceId);
  const finalMerchantId =
    itemDetails?.merchantId ||
    (isEditMode && editingItem ? editingItem.restaurantId : urlMerchantId);
  const finalRestaurantName =
    itemDetails?.restaurantName ||
    (isEditMode && editingItem
      ? editingItem.restaurantName
      : urlRestaurantName);

  const isItemAvailable =
    itemDetails?.is_available === true || itemDetails?.is_available === 1;

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, number>
  >({});
  const [selectedOptional, setSelectedOptional] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // State for unsaved changes dialog
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null);

  // Initialize state from editing item
  useEffect(() => {
    if (isEditMode && editingItem && itemDetails) {
      setQuantity(editingItem.quantity);
      setNotes(editingItem.selectedOptions?.notes || "");

      // Restore selected options
      if (editingItem.selectedOptions?.requiredOptions) {
        setSelectedOptions(editingItem.selectedOptions.requiredOptions);
      }

      // Restore optional selections
      if (editingItem.selectedOptions?.optionalOptions) {
        setSelectedOptional(editingItem.selectedOptions.optionalOptions);
      }
    }
  }, [isEditMode, editingItem, itemDetails]);

  useEffect(() => {
    if (!loading && !itemDetails && error) {
      toast.error("هذا العنصر غير موجود");
      navigate(-1);
    }
  }, [itemDetails, loading, error, navigate]);

  // Cleanup editing state when component unmounts
  useEffect(() => {
    return () => {
      if (isEditMode) {
        setEditingItem(null);
      }
    };
  }, [isEditMode, setEditingItem]);

  // Check if user has made changes (only for non-edit mode)
  const hasUnsavedChanges = useCallback(() => {
    if (isEditMode) return false;
    if (!itemDetails) return false;

    const hasSelectedOptions = Object.keys(selectedOptions).length > 0;
    const hasSelectedOptional = selectedOptional.length > 0;
    const hasNotes = notes.trim().length > 0;
    const hasChangedQuantity = quantity !== 1;

    return (
      hasSelectedOptions ||
      hasSelectedOptional ||
      hasNotes ||
      hasChangedQuantity
    );
  }, [
    isEditMode,
    itemDetails,
    selectedOptions,
    selectedOptional,
    notes,
    quantity,
  ]);

  // Handle navigation with unsaved changes check
  const handleNavigation = useCallback(
    (navigationFn: () => void) => {
      if (hasUnsavedChanges()) {
        setPendingNavigation(() => navigationFn);
        setShowUnsavedDialog(true);
      } else {
        navigationFn();
      }
    },
    [hasUnsavedChanges]
  );

  // Confirm unsaved changes dialog
  const confirmUnsavedChanges = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  // Cancel unsaved changes dialog
  const cancelUnsavedChanges = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  const navigateImage = (direction: "next" | "prev") => {
    const images = itemDetails?.images || [];
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) =>
      direction === "next"
        ? (prev + 1) % images.length
        : (prev - 1 + images.length) % images.length
    );
  };

  const calculateTotalPrice = () => {
    if (!itemDetails) return 0;
    let total = itemDetails.price;

    Object.values(selectedOptions).forEach((optionId) => {
      const option = itemDetails.optionGroups
        ?.flatMap((group) => group.options)
        .find((opt) => opt.id === optionId);
      if (option) total += option.price;
    });

    selectedOptional.forEach((optionId) => {
      const option = itemDetails.optionGroups
        ?.flatMap((group) => group.options)
        .find((opt) => opt.id === optionId);
      if (option) total += option.price;
    });

    return total * quantity;
  };

  const calculateOptionsTotal = () => {
    if (!itemDetails) return 0;
    let optionsTotal = 0;

    Object.values(selectedOptions).forEach((optionId) => {
      const option = itemDetails.optionGroups
        ?.flatMap((group) => group.options)
        .find((opt) => opt.id === optionId);
      if (option) optionsTotal += option.price;
    });

    selectedOptional.forEach((optionId) => {
      const option = itemDetails.optionGroups
        ?.flatMap((group) => group.options)
        .find((opt) => opt.id === optionId);
      if (option) optionsTotal += option.price;
    });

    return optionsTotal * quantity;
  };

  const canAddToCart = () => {
    if (!itemDetails) return false;
    const requiredGroups =
      itemDetails.optionGroups?.filter((group) => group.type === "pick") || [];
    return requiredGroups.every((group) => selectedOptions[group.id]);
  };

  // Helper function to get option names for storage
  const getOptionNames = () => {
    const requiredOptionNames: Record<string, string> = {};
    const optionalOptionNames: string[] = [];

    if (!itemDetails) return { requiredOptionNames, optionalOptionNames };

    // Get required option names
    Object.entries(selectedOptions).forEach(([groupId, optionId]) => {
      const group = itemDetails.optionGroups?.find(
        (g) => g.id === parseInt(groupId)
      );
      const option = group?.options.find((opt) => opt.id === optionId);
      if (group && option) {
        requiredOptionNames[group.title] = option.name;
      }
    });

    // Get optional option names
    selectedOptional.forEach((optionId) => {
      const option = itemDetails.optionGroups
        ?.flatMap((group) => group.options)
        .find((opt) => opt.id === optionId);
      if (option) {
        optionalOptionNames.push(option.name);
      }
    });

    return { requiredOptionNames, optionalOptionNames };
  };

  const getSelectedOptionDetails = () => {
    const requiredOptionsDetails: Record<string, SelectedOptionDetails> = {};
    const optionalOptionsDetails: SelectedOptionDetails[] = [];

    if (!itemDetails) return { requiredOptionsDetails, optionalOptionsDetails };

    // Get required option details
    Object.entries(selectedOptions).forEach(([groupId, optionId]) => {
      const group = itemDetails.optionGroups?.find(
        (g) => g.id === parseInt(groupId)
      );
      const option = group?.options.find((opt) => opt.id === optionId);
      if (group && option) {
        requiredOptionsDetails[groupId] = {
          id: option.id,
          price: option.price,
          type_option_id: option.type_option_id,
          name: option.name,
        };
      }
    });

    // Get optional option details
    selectedOptional.forEach((optionId) => {
      const option = itemDetails.optionGroups
        ?.flatMap((group) => group.options)
        .find((opt) => opt.id === optionId);
      if (option) {
        optionalOptionsDetails.push({
          id: option.id,
          price: option.price,
          type_option_id: option.type_option_id,
          name: option.name,
        });
      }
    });

    return { requiredOptionsDetails, optionalOptionsDetails };
  };

  const handleAddToCart = () => {
    console.log("🔍 ItemDetails - URL Params:", {
      urlPlaceId: urlPlaceId,
      urlMerchantId: urlMerchantId,
      urlRestaurantName: urlRestaurantName,
      searchParamsRaw: searchParams.toString(),
      finalPlaceId: finalPlaceId,
      finalMerchantId: finalMerchantId,
      finalRestaurantName: finalRestaurantName,
    });
    // Check authentication first
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول لإضافة العناصر إلى السلة");
      return;
    }

    if (!isItemAvailable) {
      toast.error("هذا العنصر غير متوفر حالياً");
      return;
    }

    // Check required options
    if (!canAddToCart()) {
      toast.error("يجب اختيار جميع الخيارات المطلوبة");
      return;
    }

    const { requiredOptionNames, optionalOptionNames } = getOptionNames();
    const { requiredOptionsDetails, optionalOptionsDetails } =
      getSelectedOptionDetails();

    const cleanSelectedOptions = {
      ...(Object.keys(selectedOptions).length > 0 && {
        requiredOptions: selectedOptions,
        requiredOptionNames: requiredOptionNames,
        requiredOptionsDetails: requiredOptionsDetails,
      }),
      ...(selectedOptional.length > 0 && {
        optionalOptions: selectedOptional.sort(),
        optionalOptionNames: optionalOptionNames,
        optionalOptionsDetails: optionalOptionsDetails,
      }),
      ...(notes.trim() && { notes: notes.trim() }),
    };

    const images = itemDetails?.images || [];
    const mainImage =
      images.length > 0 ? images[currentImageIndex]?.image_url : null;

    // Get category ID consistently
    const categoryId = itemDetails!.categories
      ? Array.isArray(itemDetails!.categories)
        ? itemDetails!.categories[0]?.id || 0
        : itemDetails!.categories.id || 0
      : 0;

    // Calculate final price per unit
    const unitPrice = calculateTotalPrice() / quantity;

    const cartItem: CartItem = {
      id: isEditMode
        ? editItemId!
        : `${itemDetails!.id}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
      productId: itemDetails!.id,
      name: itemDetails!.name,
      description: itemDetails!.description || "",
      price: unitPrice,
      originalPrice: itemDetails!.price,
      quantity,
      image: mainImage || "/api/placeholder/400/300",
      images: images.map((img) => img.image_url),
      category: itemDetails!.categories
        ? Array.isArray(itemDetails!.categories)
          ? itemDetails!.categories[0]?.name || ""
          : itemDetails!.categories.name || ""
        : "",
      categoryId: categoryId,
      restaurantId: finalMerchantId,
      restaurantName: finalRestaurantName,
      placeId: finalPlaceId,
      isAvailable: isItemAvailable,
      preparationTime: itemDetails!.minutes,
      selectedOptions:
        Object.keys(cleanSelectedOptions).length > 0
          ? cleanSelectedOptions
          : undefined,
      totalPrice: unitPrice,
      totalPriceWithModifiers: unitPrice,
      addedAt: new Date(),
      isCustomizable: !!(
        itemDetails!.optionGroups && itemDetails!.optionGroups.length > 0
      ),
      hasRequiredOptions: !!itemDetails!.optionGroups?.some(
        (group) => group.type === "pick"
      ),
    };

    if (isEditMode) {
      updateItem(editItemId!, cartItem);
      toast.success(`تم تحديث ${itemDetails!.name} في السلة`);
      navigate("/cart");
    } else {
      addItem(cartItem);
      toast.success(`تم إضافة ${itemDetails!.name} إلى السلة`);
      navigate(-1);
    }
  };

  const handleRequiredOptionChange = (groupId: number, optionId: number) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: optionId }));
  };

  const handleOptionalOptionChange = (optionId: number, checked: boolean) => {
    setSelectedOptional((prev) =>
      checked ? [...prev, optionId] : prev.filter((id) => id !== optionId)
    );
  };

  // Loading State
  if (loading) {
    return <LoadingState />;
  }

  // Error State
  if (error || !itemDetails) {
    return <ErrorState error={error} onGoBack={() => navigate(-1)} />;
  }

  const images = itemDetails.images || [];
  const canAddToCartFinal =
    isAuthenticated && isItemAvailable && canAddToCart();
  const basePrice = itemDetails.price * quantity;
  const optionsPrice = calculateOptionsTotal();
  const totalPrice = calculateTotalPrice();

  console.log("🔍 Complete Debug State:", {
    // Data structure
    optionGroups: itemDetails?.optionGroups,

    // Selection state
    selectedOptions,
    selectedOptional,

    // Validation checks
    requiredGroups: itemDetails?.optionGroups?.filter(
      (group) => group.type === "pick"
    ),
    canAddToCartResult: canAddToCart(),

    // Individual validation pieces
    isAuthenticated,
    isItemAvailable,
    canAddToCartFinal,

    // Check each required group individually
    requiredGroupsValidation: itemDetails?.optionGroups
      ?.filter((group) => group.type === "pick")
      ?.map((group) => ({
        groupId: group.id,
        groupTitle: group.title,
        hasSelection: !!selectedOptions[group.id],
        selectedValue: selectedOptions[group.id],
      })),
  });

  return (
    <>
      {/* Fullscreen Dark Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />

      {/* Main Modal Container - Responsive */}
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        dir="rtl"
      >
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
            <Button
              variant="ghost"
              onClick={() =>
                handleNavigation(() => navigate(isEditMode ? "/cart" : -1))
              }
              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <div className="bg-yellow-400 text-white px-3 py-1 rounded text-sm font-bold">
                {finalRestaurantName}
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-6">
              {/* Edit Mode Indicator */}
              <EditModeIndicator isEditMode={isEditMode} />

              {/* Item Title - Responsive */}
              <div className="flex items-center gap-3 text-right">
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={
                      itemDetails.images[0]?.image_url ||
                      "/api/placeholder/48/48"
                    }
                    alt={itemDetails.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/api/placeholder/48/48";
                    }}
                  />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex-1">
                  {itemDetails.name}
                </h1>
              </div>

              {/* Content Grid - Two columns on larger screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Options and Notes */}
                <div className="space-y-6">
                  {/* Option Groups */}
                  <OptionGroups
                    optionGroups={itemDetails.optionGroups}
                    selectedOptions={selectedOptions}
                    selectedOptional={selectedOptional}
                    handleRequiredOptionChange={handleRequiredOptionChange}
                    handleOptionalOptionChange={handleOptionalOptionChange}
                  />

                  {/* Notes Section */}
                  <NotesSection notes={notes} setNotes={setNotes} />
                </div>

                {/* Right Column - Summary (only on large screens) */}
                <div className="hidden lg:block">
                  <div className="sticky top-0">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 text-right">
                        ملخص الطلب
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">سعر الإضافات</span>
                          <span className="font-bold text-gray-900">
                            {optionsPrice.toFixed(2)} ر.س
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t pt-2">
                          <span className="text-base font-semibold text-gray-900">
                            السعر الإجمالي
                          </span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {totalPrice.toFixed(2)} ر.س
                            </div>
                            <div className="text-sm text-gray-600">
                              {quantity} منتجات
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile-only Quantity Cart Section */}
              <div className="lg:hidden">
                <QuantityCartSection
                  quantity={quantity}
                  setQuantity={setQuantity}
                  optionsPrice={optionsPrice}
                  totalPrice={totalPrice}
                  itemsCount={items.length}
                  isEditMode={isEditMode}
                  canAddToCartFinal={canAddToCartFinal}
                  isItemActive={isItemAvailable}
                  handleAddToCart={handleAddToCart}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          </div>

          {/* Fixed Bottom Cart Section - Desktop */}
          <div className="hidden lg:block border-t border-gray-200 bg-white p-4 sm:p-6">
            <div className="flex items-center gap-4">
              {/* Quantity Controls */}
              <div className="flex items-center bg-gray-100 rounded-full h-12 sm:h-14">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                  className="h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-full bg-transparent hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                  <span className="text-lg">−</span>
                </Button>

                <div className="text-lg font-bold min-w-[2.5rem] text-center text-gray-900 px-2 sm:px-4">
                  {quantity}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-full bg-transparent hover:bg-gray-200 text-gray-700"
                >
                  <span className="text-lg">+</span>
                </Button>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCartFinal}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 sm:py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base sm:text-lg h-12 sm:h-14"
              >
                {isEditMode ? "تحديث العنصر" : "أضف إلى السلة"} (
                {totalPrice.toFixed(2)} ر.س)
              </Button>
            </div>

            {/* Error Messages */}
            {!isAuthenticated && (
              <p className="text-red-500 text-center text-sm mt-3">
                يجب تسجيل الدخول أولاً
              </p>
            )}

            {isAuthenticated && !isItemAvailable && (
              <p className="text-red-500 text-center text-sm mt-3">
                هذا العنصر غير متوفر حالياً
              </p>
            )}

            {isAuthenticated && isItemAvailable && !canAddToCartFinal && (
              <p className="text-red-500 text-center text-sm mt-3">
                يجب اختيار جميع الخيارات المطلوبة
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showUnsavedDialog}
        onConfirm={confirmUnsavedChanges}
        onCancel={cancelUnsavedChanges}
        title="إزالة الطلب"
        message="هل ترغب في المتابعة؟ مغادرة الصفحة ستؤدي إلى حذف التغييرات"
        confirmText="متابعة"
        cancelText="الإلغاء"
        confirmVariant="default"
        showCloseButton={true}
      />
    </>
  );
};

export default ItemDetails;
