import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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

const ItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { itemDetails, loading, error } = useItemDetails(itemId);

  //Get Resturant Context
  const placeId = searchParams.get("placeId") || "";
  const merchantId = searchParams.get("merchantId") || "";
  const restaurantName = searchParams.get("restaurantName") || "Restaurant";

  // Get current user from auth store
  const { user } = useAuthStore();
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

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, number>
  >({});
  const [selectedOptional, setSelectedOptional] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // Cleanup editing state when component unmounts or navigation occurs
  useEffect(() => {
    return () => {
      if (isEditMode) {
        setEditingItem(null);
      }
    };
  }, [isEditMode, setEditingItem]);

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
      restaurantId: merchantId,
      restaurantName: restaurantName,
      placeId: placeId,
      isAvailable: itemDetails!.is_active === "active",
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
      navigate(-1); // Go back to restaurant details page
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
  const isItemActive = itemDetails.is_active === "active";
  const canAddToCartFinal = isItemActive && canAddToCart();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(isEditMode ? "/cart" : -1)}
          className="mb-4 sm:mb-6 hover:bg-[#FFAA01]/10 text-[#053468] font-medium"
        >
          <ArrowRight className="h-5 w-5 ml-2" />
          {isEditMode ? "العودة للسلة" : "العودة"}
        </Button>

        {/* Edit Mode Indicator */}
        <EditModeIndicator isEditMode={isEditMode} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <ImageSection
              images={images}
              itemName={itemDetails.name}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              navigateImage={navigateImage}
              isCombo={itemDetails.is_combo === 1}
              isItemActive={isItemActive}
            />

            <ItemInfo
              name={itemDetails.name}
              description={itemDetails.description}
              categories={itemDetails.categories}
              price={itemDetails.price}
              newPrice={itemDetails.new_price}
              hasOffer={itemDetails.has_offer}
            />
          </div>

          {/* Options Section */}
          <div className="space-y-4 sm:space-y-6">
            {/* Option Groups */}
            <OptionGroups
              optionGroups={itemDetails.optionGroups}
              selectedOptions={selectedOptions}
              selectedOptional={selectedOptional}
              handleRequiredOptionChange={handleRequiredOptionChange}
              handleOptionalOptionChange={handleOptionalOptionChange}
            />

            {/* Notes */}
            <NotesSection notes={notes} setNotes={setNotes} />

            {/* Quantity and Add to Cart */}
            <QuantityCartSection
              quantity={quantity}
              setQuantity={setQuantity}
              totalPrice={calculateTotalPrice()}
              isEditMode={isEditMode}
              canAddToCartFinal={canAddToCartFinal}
              isItemActive={isItemActive}
              canAddToCart={canAddToCart}
              handleAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </div>

      <FloatingCart />
    </div>
  );
};

export default ItemDetails;
