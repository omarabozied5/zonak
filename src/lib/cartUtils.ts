// utils/cartUtils.ts - Fixed with better ID handling
import { MenuItem } from "@/hooks/useMenuItems";
import { MostOrderedItem } from "@/hooks/useMostOrderedItems";
import { CartItem } from "@/types/types";

interface CreateCartItemProps {
  item: MenuItem | MostOrderedItem;
  restaurantName: string;
  placeId?: string | number;
  merchantId?: string | number;
  quantity?: number;
}

export const createCartItem = ({
  item,
  restaurantName,
  placeId,
  merchantId,
  quantity = 1,
}: CreateCartItemProps): CartItem => {
  // Calculate discount information
  const originalPrice = item.price;
  const currentPrice =
    item.new_price && typeof item.new_price === "number" && item.new_price > 0
      ? item.new_price
      : item.price;

  const discountAmount =
    originalPrice > currentPrice ? originalPrice - currentPrice : 0;
  const discountPercentage =
    discountAmount > 0 ? (discountAmount / originalPrice) * 100 : 0;

  // Generate unique ID for cart item
  const uniqueId = `${item.id}-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // Get category ID consistently
  const categoryId = item.categories
    ? Array.isArray(item.categories)
      ? item.categories[0]?.id || 0
      : item.categories.id || 0
    : 0;

  // Get image URL consistently
  const imageUrl = item.images?.[0]?.image_url || "/api/placeholder/400/300";
  const allImages = item.images?.map((img) => img.image_url) || [];

  // FIX: Better ID handling with validation and fallbacks
  const validateAndConvertId = (id?: string | number): string => {
    if (id === null || id === undefined) return "";
    const stringId = id.toString().trim();
    return stringId === "0" || stringId === "" ? "" : stringId;
  };

  const actualPlaceId = validateAndConvertId(placeId);
  const actualMerchantId = validateAndConvertId(merchantId);

  // Ensure we have at least one valid ID
  if (!actualPlaceId && !actualMerchantId) {
    console.warn("Warning: Both placeId and merchantId are missing/invalid:", {
      placeId,
      merchantId,
      item: item.name,
    });
  }

  // Use merchantId as primary restaurant identifier, fallback to placeId
  const restaurantId = actualMerchantId || actualPlaceId;
  const finalPlaceId = actualPlaceId || actualMerchantId;

  const cartItem: CartItem = {
    id: uniqueId,
    productId: item.id,
    name: item.name,
    description: item.description || "",

    // Price information with proper discount handling
    price: currentPrice, // Current effective price (after item discount)
    originalPrice: originalPrice, // Original price before discount
    discountAmount: discountAmount, // Discount amount per item
    discountPercentage: discountPercentage, // Discount percentage

    quantity: quantity,
    image: imageUrl,
    images: allImages,
    category: item.categories
      ? Array.isArray(item.categories)
        ? item.categories[0]?.name || ""
        : item.categories.name || ""
      : "",
    categoryId: categoryId,
    restaurantId: restaurantId,
    restaurantName: restaurantName,
    placeId: finalPlaceId,
    isAvailable: item.is_available === 1,
    selectedOptions: undefined,
    totalPrice: currentPrice * quantity, // Use current price for total
    totalPriceWithModifiers: currentPrice, // Per item price with modifiers
    addedAt: new Date(),
    isCustomizable: !!(item.options && item.options.length > 0),
    hasRequiredOptions: false,
  };

  // Log for debugging when IDs are missing
  if (!restaurantId) {
    console.error("Created cart item with missing restaurant ID:", {
      itemName: item.name,
      providedPlaceId: placeId,
      providedMerchantId: merchantId,
      finalRestaurantId: restaurantId,
      finalPlaceId: finalPlaceId,
    });
  }

  return cartItem;
};

// Helper function to calculate total item discounts in cart
export const calculateTotalItemDiscounts = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.discountAmount || 0) * item.quantity;
  }, 0);
};

// Helper function to calculate original total (before item discounts)
export const calculateOriginalTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const originalPrice = item.originalPrice || item.price;
    return total + originalPrice * item.quantity;
  }, 0);
};
