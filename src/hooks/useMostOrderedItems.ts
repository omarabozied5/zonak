import { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";

export interface MostOrderedItem {
  id: number;
  menu_id: number;
  name: string;
  description: string;
  price: number;
  is_active: string;
  is_combo: number;
  created_at: string;
  updated_at: string;
  order: number;
  minutes?: number;
  categories: {
    id: number;
    name: string;
    order: number;
  }[];
  subitems: {
    id: number;
    name: string;
    options_count: number;
    laravel_through_key: number;
  }[];
  images: {
    id: number;
    menu_item_id: number;
    image_url: string;
  }[];
  order_count: number;
  new_price?: number | null;
  has_offer: number | null;
  is_available: number;
  options: {
    id: number;
    menu_item_id: number;
    menu_item_option_id: number;
    price: number;
    type_option_id: number;
    created_at: string;
    updated_at: string;
  }[];
}

export const useMostOrderedItems = (
  userId: string,
  placeId: string | number
) => {
  const [mostOrderedItems, setMostOrderedItems] = useState<MostOrderedItem[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMostOrderedItems = async () => {
    if (!userId || !placeId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.fetchMostOrderedItems(userId, placeId);
      // console.log("Most ordered items response:", response);

      // Ensure we're getting the items array and it's valid
      const items = response?.items || response?.data?.items || [];
      const validItems = Array.isArray(items) ? items : [];

      // Limit to only the first 5 most ordered items
      const limitedItems = validItems.slice(0, 5);

      setMostOrderedItems(limitedItems);
    } catch (err) {
      console.error("Error fetching most ordered items:", err);
      setError("فشل في تحميل الأصناف الأكثر طلباً");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMostOrderedItems();
  }, [userId, placeId]);

  return { mostOrderedItems, loading, error, refetch: fetchMostOrderedItems };
};
