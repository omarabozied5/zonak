import { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";

interface PreparedOrder {
  id: number;
  user_id: number;
  merchant_name: string;
  profile_image: string;
  place?: {
    id: number;
    distance: number;
    review_average: number;
    taddress: string;
    is_favor: boolean;
  };
  is_busy: number;
  enable_delivery: number;
  user?: {
    user_id: number;
    full_name: string;
    is_exclusive_partner: number;
  };
}

export const usePreparedOrders = () => {
  const [orders, setOrders] = useState<PreparedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (
    lng = 39.501528887063987,
    lat = 24.455374838891599,
    page = 1,
    append = false
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.fetchPreparedOrders(lng, lat, page);
      console.log("API Response:", response);

      // Handle the nested data structure: response.data.data
      const newOrders = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];
      console.log("Processed orders:", newOrders);

      if (append) {
        setOrders((prevOrders) => {
          const currentOrders = Array.isArray(prevOrders) ? prevOrders : [];
          return [...currentOrders, ...newOrders];
        });
      } else {
        setOrders(newOrders);
      }

      return response;
    } catch (err) {
      console.error("Error in fetchOrders:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load orders";
      setError(errorMessage);
      // Ensure orders remains an empty array on error
      if (!append) {
        setOrders([]);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Ensure orders is always an array
  const safeOrders = Array.isArray(orders) ? orders : [];

  return { orders: safeOrders, loading, error, fetchOrders, setOrders };
};
