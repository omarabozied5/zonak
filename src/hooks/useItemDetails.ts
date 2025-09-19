import { useState, useEffect } from "react";
import { itemService, ItemDetails } from "@/services/itemService";

export const useItemDetails = (itemId: string | undefined) => {
  const [itemDetails, setItemDetails] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // helper function to normalize option group type
  const normalizeOptionType = (type: string): "pick" | "optional" => {
    if (type === "addition" || type === "addition_without_quantity") {
      return "optional";
    }
    return "pick";
  };

  const fetchItemDetails = async () => {
    if (!itemId) return;

    const numericId = parseInt(itemId, 10);
    if (isNaN(numericId)) {
      setError("معرف العنصر غير صحيح");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const details = await itemService.fetchItemDetails(numericId);

      // 🟢 map option_groups → optionGroups
      const normalizedDetails: ItemDetails = {
        ...details,
        optionGroups: details.optionGroups?.map((group: any) => ({
          ...group,
          type: normalizeOptionType(group.type),
        })),
      };

      setItemDetails(normalizedDetails);
    } catch (err) {
      console.error("Error fetching item details:", err);
      setError("فشل في تحميل تفاصيل العنصر");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [itemId]);

  return { itemDetails, loading, error, refetch: fetchItemDetails };
};
