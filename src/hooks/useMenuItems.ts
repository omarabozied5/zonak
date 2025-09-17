import { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";
import { MenuItem } from "@/types/types"; // Import from types.ts instead

export const useMenuItems = (
  userId: string | number,
  placeId?: string | number
) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    if (!userId) {
      setError("معرف المطعم مطلوب");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // console.log("Fetching menu items with:", { userId, placeId });

      const response = await apiService.fetchMenuItems(userId, placeId);
      // console.log("Menu API response:", response);

      // Handle the response structure from MenuResponse
      const items = response.data?.items || response.items || [];

      // Process items to ensure categoryId is set
      const processedItems = items.map((item: MenuItem) => {
        let categoryId = 0;

        if (item.categories) {
          if (Array.isArray(item.categories) && item.categories.length > 0) {
            categoryId = item.categories[0].id;
          } else if (
            typeof item.categories === "object" &&
            "id" in item.categories
          ) {
            categoryId = item.categories.id;
          }
        }

        return {
          ...item,
          categoryId,
          // Ensure boolean fields are properly converted
          is_available: item.is_available === 1 || item.is_available === true,
          has_offer: item.has_offer === 1 || item.has_offer === true,
          is_combo: item.is_combo === 1 || item.is_combo === true,
        };
      });

      // console.log("Processed menu items:", processedItems.length, "items");
      setMenuItems(processedItems);
    } catch (err) {
      console.error("Error fetching menu items:", err);
      const errorMessage =
        err instanceof Error ? err.message : "فشل في تحميل قائمة الطعام";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [userId, placeId]); // Add placeId to dependencies

  return {
    menuItems,
    loading,
    error,
    refetch: fetchMenuItems,
  };
};
