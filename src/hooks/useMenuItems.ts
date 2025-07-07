
import { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";

export interface MenuItem {
  id: number;
  menu_id: number;
  name: string;
  description: string;
  price: number;
  is_active: string;
  is_combo: number;
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
  }[];
  images: {
    id: number;
    menu_item_id: number;
    image_url: string;
  }[];
  new_price?: boolean;
  has_offer?: boolean;
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

export const useMenuItems = (userId: string) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.fetchMenuItems(userId);
      console.log("Menu items response:", response);
      setMenuItems(response.items || []);
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setError("فشل في تحميل قائمة الطعام");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [userId]);

  return { menuItems, loading, error, refetch: fetchMenuItems };
};
