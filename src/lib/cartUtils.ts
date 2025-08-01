// utils/cartUtils.ts
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

  // Calculate price (prioritize new_price if available and valid)
  const finalPrice =
    item.new_price && typeof item.new_price === "number"
      ? item.new_price
      : item.price;

  // FIX: Always prioritize placeId first for consistency
  // This ensures the same restaurant always gets the same ID regardless of which component adds the item
  const restaurantId = merchantId?.toString() || ""; // Use actual merchant ID
  const actualPlaceId = placeId?.toString() || "";

  return {
    id: uniqueId,
    productId: item.id,
    name: item.name,
    description: item.description || "",
    price: finalPrice,
    originalPrice: item.price,
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
    placeId: actualPlaceId || "",
    isAvailable: item.is_available === 1,
    selectedOptions: undefined,
    totalPrice: finalPrice,
    totalPriceWithModifiers: finalPrice,
    addedAt: new Date(),
    isCustomizable: !!(item.options && item.options.length > 0),
    hasRequiredOptions: false,
  };
};
