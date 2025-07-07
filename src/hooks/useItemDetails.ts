import { useState, useEffect } from "react";
import { itemService, ItemDetails } from "@/services/itemService";

export const useItemDetails = (itemId: string | undefined) => {
  const [itemDetails, setItemDetails] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setItemDetails(details);
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
