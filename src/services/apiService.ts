// apiService.ts - Fixed with correct API response handling

import axios from "axios";
import { useState } from "react";
import {
  RatingResponse,
  BranchesResponse,
  BackendOrderPayload,
  BackendOrderItem,
  OrderResponse,
  CartItem,
  MenuItem,
  MenuResponse,
  ProcessedPreparedOrder,
  ProcessedRatingData,
  ProcessedBranch,
  MenuItemCategory,
  ApiResponse,
  Restaurant,
  WorkingHour,
  PlaceBranch,
  BackendOptionItem,
  BackendOrder,
} from "../types/types";
import { useAuthStore } from "../stores/useAuthStore";

const BASE_URL = "https://dev-backend.zonak.net/api";

// ===== Axios Configuration =====
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 30000,
});

// ===== Helper Functions =====
const getAuthToken = (): string | null => {
  return useAuthStore.getState().getAuthToken();
};

const getBaseItemId = (cartItemId: string): number => {
  let baseId: string;

  if (cartItemId.includes("-")) {
    baseId = cartItemId.split("-")[0];
  } else {
    baseId = cartItemId;
  }

  const numericId = parseInt(baseId, 10);

  if (isNaN(numericId) || numericId <= 0) {
    console.error("Invalid item ID:", cartItemId, "parsed as:", numericId);
    throw new Error(`Invalid item ID format: ${cartItemId}`);
  }

  return numericId;
};

// ===== API Response Interfaces =====
interface CurrentOrdersApiResponse {
  message: string;
  data: BackendOrder[];
}

// ===== API Service =====
export const apiService = {
  // PUBLIC ENDPOINTS - No authentication required

  fetchPreparedOrders: async (
    longitude = 31.2357,
    latitude = 30.0444,
    page = 1
  ): Promise<ApiResponse<unknown>> => {
    const response = await axiosInstance.get("/places/all/prepared/orders", {
      params: { lang: longitude, lat: latitude, page },
    });
    return response.data;
  },

  fetchRestaurantDetails: async (
    user_id: string | number,
    latitude = 30.0444,
    longitude = 31.2357
  ): Promise<ApiResponse<Restaurant>> => {
    const response = await axiosInstance.get(`/places/details/${user_id}`, {
      params: {
        type: "android",
        uuid: "fffb4918-216e-4028-ae35-6f982b2be4cb",
        lat: latitude,
        lang: longitude,
      },
    });
    return response.data;
  },

  fetchMenuItems: async (
    userId: string | number,
    placeId?: string | number
  ): Promise<MenuResponse> => {
    const params: Record<string, string | number> = {};
    if (placeId) {
      params.place_id = placeId;
    }

    const response = await axiosInstance.get(`/menu/items/${userId}`, {
      params,
    });
    return response.data;
  },

  fetchMenuItemsAlt: async (
    merchantId: string | number,
    latitude = 30.0444,
    longitude = 31.2357
  ): Promise<MenuResponse> => {
    const response = await axiosInstance.get(`/merchants/${merchantId}/menu`, {
      params: { lat: latitude, lang: longitude },
    });
    return response.data;
  },

  getSingleMenuItemFromAll: async (
    itemId: string | number,
    userId: string,
    placeId?: string | number
  ): Promise<ApiResponse<MenuItem>> => {
    try {
      const menuData = await apiService.fetchMenuItems(userId, placeId);

      if (!menuData?.data?.items) {
        throw new Error("No menu items found");
      }

      const item = menuData.data.items.find(
        (item) => item.id.toString() === itemId.toString()
      );

      if (!item) {
        throw new Error(`Item with ID ${itemId} not found`);
      }

      return {
        success: true,
        message: "Item found successfully",
        data: item,
      };
    } catch (error) {
      console.error("Error fetching single menu item:", error);
      throw error;
    }
  },

  fetchMostOrderedItems: async (
    userId: string | number,
    placeId: string | number
  ): Promise<ApiResponse<MenuItem[]>> => {
    const response = await axiosInstance.get(`/place/most_order/${userId}`, {
      params: { place_id: placeId },
    });
    return response.data;
  },

  fetchPlaceRating: async (placeId: number): Promise<RatingResponse> => {
    const response = await axiosInstance.get(`/places/rating/${placeId}`);
    return response.data;
  },

  fetchPlaceBranches: async (
    placeId: number,
    latitude = 30.0444,
    longitude = 31.2357
  ): Promise<BranchesResponse> => {
    const response = await axiosInstance.get(`/places/branches/${placeId}`, {
      params: { lat: latitude, lang: longitude },
    });
    return response.data;
  },

  // AUTHENTICATED ENDPOINTS - Require token

  // Enhanced fetchCurrentOrders function for apiService.ts

  fetchCurrentOrders: async (): Promise<CurrentOrdersApiResponse> => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication token not found");
    }

    try {
      console.log("🔍 Fetching current orders...", {
        timestamp: new Date().toISOString(),
        tokenExists: !!token,
        tokenLength: token.length,
        tokenStart: token.substring(0, 20) + "...",
      });

      const response = await axiosInstance.get("/get/current/orders", {
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 API Response Details:", {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        timestamp: new Date().toISOString(),
      });

      // Enhanced logging for response structure
      if (response.data) {
        console.log("📊 Response Analysis:", {
          message: response.data.message,
          hasData: !!response.data.data,
          dataType: Array.isArray(response.data.data)
            ? "array"
            : typeof response.data.data,
          dataLength: Array.isArray(response.data.data)
            ? response.data.data.length
            : "N/A",
          dataKeys:
            response.data.data && typeof response.data.data === "object"
              ? Object.keys(response.data.data)
              : "N/A",
        });

        // If we have orders, log the first one in detail
        if (
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const firstOrder = response.data.data[0];
          console.log("📋 First Order Details:", {
            id: firstOrder.id,
            user_id: firstOrder.user_id,
            status: firstOrder.status,
            total_price: firstOrder.total_price,
            created_at: firstOrder.created_at,
            place_title: firstOrder.place?.title,
            merchant_id: firstOrder.merchant_id,
            place_id: firstOrder.place_id,
            orderitemsCount: firstOrder.orderitems?.length || 0,
          });
        }
      }

      return response.data;
    } catch (error) {
      console.error("❌ fetchCurrentOrders error:", error);

      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        console.error("🚨 Detailed API Error:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: errorData,
          message: errorData?.message,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
          timestamp: new Date().toISOString(),
        });

        throw new Error(errorData?.message || "Failed to fetch current orders");
      }

      throw error;
    }
  },

  submitOrder: async (
    orderData: BackendOrderPayload
  ): Promise<OrderResponse> => {
    const token = getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى",
      };
    }

    try {
      const response = await axiosInstance.post("/order/store", orderData, {
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      });

      return {
        success: true,
        data: response.data,
        order_id: response.data?.order_id || response.data?.id,
        message: response.data?.message || "تم إنشاء الطلب بنجاح",
      };
    } catch (error: unknown) {
      console.error("Order submission failed:", error);

      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        return {
          success: false,
          message: errorData?.message || "فشل في إنشاء الطلب",
          data: errorData,
        };
      } else if (error instanceof Error) {
        return {
          success: false,
          message: "حدث خطأ غير متوقع",
        };
      } else {
        return {
          success: false,
          message: "حدث خطأ غير معروف",
        };
      }
    }
  },
};

// ===== Transform Functions =====
export const transformCartItemsToBackend = (
  cartItems: CartItem[]
): BackendOrderItem[] => {
  return cartItems.map((item, index) => {
    if (!item.id) {
      throw new Error(`Item at index ${index} has no ID`);
    }

    if (!item.categoryId || item.categoryId === 0) {
      console.error("Item missing categoryId:", {
        index,
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        productId: item.productId,
      });
      throw new Error(
        `Item ${item.name} has invalid categoryId: ${item.categoryId}`
      );
    }

    if (!item.price || isNaN(item.price) || item.price < 0) {
      throw new Error(`Item ${item.name} has invalid price: ${item.price}`);
    }

    if (
      !item.totalPriceWithModifiers ||
      isNaN(item.totalPriceWithModifiers) ||
      item.totalPriceWithModifiers < 0
    ) {
      throw new Error(
        `Item ${item.name} has invalid totalPriceWithModifiers: ${item.totalPriceWithModifiers}`
      );
    }

    if (!item.quantity || item.quantity <= 0) {
      throw new Error(
        `Item ${item.name} has invalid quantity: ${item.quantity}`
      );
    }

    const options: BackendOptionItem[] = [];

    if (item.selectedOptions?.requiredOptions) {
      Object.values(item.selectedOptions.requiredOptions).forEach(
        (optionId) => {
          if (
            typeof optionId === "number" &&
            !isNaN(optionId) &&
            optionId > 0
          ) {
            options.push({
              option_id: optionId,
              price_option: 0,
              quantity_option: 1,
              subitem_id: -1,
              type_option_id: 1,
            });
          }
        }
      );
    }

    if (item.selectedOptions?.optionalOptions) {
      item.selectedOptions.optionalOptions.forEach((optionId) => {
        if (typeof optionId === "number" && !isNaN(optionId) && optionId > 0) {
          options.push({
            option_id: optionId,
            price_option: 0,
            quantity_option: 1,
            subitem_id: -1,
            type_option_id: 5,
          });
        }
      });
    }

    const baseItemId = getBaseItemId(item.id);

    return {
      id: baseItemId,
      options,
      price: Math.round(item.price * 100) / 100,
      quantity: item.quantity,
      note: item.selectedOptions?.notes?.trim() || null,
      category_id: item.categoryId,
      price_with_option: Math.round(item.totalPriceWithModifiers * 100) / 100,
      is_winner: false,
    };
  });
};

export const buildOrderPayload = (
  cartItems: CartItem[],
  placeId: number,
  merchantId: number,
  totalPrice: number,
  discountAmount = 0
): BackendOrderPayload => {
  try {
    if (!cartItems || cartItems.length === 0) {
      throw new Error("No cart items provided");
    }

    if (!placeId || placeId <= 0) {
      throw new Error("Invalid place ID");
    }

    if (!merchantId || merchantId <= 0) {
      throw new Error("Invalid merchant ID");
    }

    const backendItems = transformCartItemsToBackend(cartItems);

    const cartPrice = cartItems.reduce(
      (sum, item) => sum + item.totalPriceWithModifiers * item.quantity,
      0
    );

    const cashbackRate = 0.07;
    const cashbackValue = Math.round(totalPrice * cashbackRate * 100) / 100;

    const payload: BackendOrderPayload = {
      cart_price: Math.round(cartPrice * 100) / 100,
      discount:
        discountAmount > 0 ? -Math.round(discountAmount * 100) / 100 : 0,
      is_zonak_account_used: false,
      items_id: backendItems,
      merchant_id: merchantId,
      place_id: placeId,
      total_price: Math.round(totalPrice * 100) / 100,
      zonak_discount: 0,
      type: 0,
      cashback_value: cashbackValue,
      is_new: true,
      is_delivery: 0,
      cashback_from_coupons: 0,
      discount_from_coupons: Math.round(discountAmount * 100) / 100,
      max_coupoun_discount: Math.round(discountAmount * 100) / 100,
      is_delivery_zonak: 0,
    };

    return payload;
  } catch (error) {
    console.error("Error building order payload:", error);
    throw new Error(
      `Failed to build order payload: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// ===== API Integration Helper =====
const fetchCurrentOrdersFromAPI = async (): Promise<BackendOrder[]> => {
  try {
    const response = await apiService.fetchCurrentOrders();

    console.log("🔍 API Response structure:", {
      message: response.message,
      hasData: !!response.data,
      dataLength: response.data?.length || 0,
    });

    if (response.message === "Success" && response.data) {
      console.log("✅ Orders fetched successfully:", response.data.length);

      // Log first order for debugging
      if (response.data.length > 0) {
        console.log("📋 Sample order:", {
          id: response.data[0].id,
          status: response.data[0].status,
          user_id: response.data[0].user_id,
          total_price: response.data[0].total_price,
          place: response.data[0].place?.title,
        });
      }

      return response.data;
    } else {
      console.log(
        "ℹ️ No orders found or unsuccessful response. Message:",
        response.message
      );
      return [];
    }
  } catch (error) {
    console.error("❌ Failed to fetch orders from API:", error);
    throw error;
  }
};

// ===== Custom Hook =====
export const useApiService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = async <T>(
    apiFunction: (...args: unknown[]) => Promise<T>,
    ...args: unknown[]
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, callApi };
};

// ===== Data Processing Helpers =====
export const dataHelpers = {
  processPreparedOrders: (
    ordersData: ApiResponse
  ): ProcessedPreparedOrder[] => {
    if (!ordersData?.data || !Array.isArray(ordersData.data)) return [];

    return ordersData.data.map((order: Record<string, unknown>) => ({
      id: Number(order.id),
      merchantName: String(order.merchant_name || ""),
      userId: Number(order.user_id),
      isBusy: Boolean(order.is_busy),
      enableDelivery: Boolean(order.enable_delivery),
      profileImage: String(order.profile_image || ""),
      distance:
        order.place && typeof order.place === "object"
          ? Number((order.place as Record<string, unknown>).distance)
          : undefined,
      rating:
        order.place && typeof order.place === "object"
          ? Number((order.place as Record<string, unknown>).review_average)
          : undefined,
      address:
        order.place && typeof order.place === "object"
          ? String((order.place as Record<string, unknown>).taddress)
          : undefined,
      workingHours:
        order.place && typeof order.place === "object"
          ? ((order.place as Record<string, unknown>)
              .working_hours as WorkingHour[])
          : undefined,
      isExclusivePartner:
        order.user && typeof order.user === "object"
          ? Boolean(
              (order.user as Record<string, unknown>).is_exclusive_partner
            )
          : undefined,
    }));
  },

  processMenuItems: (menuData: MenuResponse): MenuItem[] => {
    if (!menuData?.data?.items) return [];

    return menuData.data.items.map((item) => {
      let categoryId: number;

      if (item.categories) {
        if (Array.isArray(item.categories) && item.categories.length > 0) {
          categoryId = item.categories[0]?.id;
        } else if (
          typeof item.categories === "object" &&
          "id" in item.categories
        ) {
          categoryId = (item.categories as MenuItemCategory).id;
        } else {
          console.warn("Unable to extract categoryId from item:", item);
          categoryId = 0;
        }
      } else {
        console.warn("Item missing categories field:", item);
        categoryId = 0;
      }

      return {
        ...item,
        categoryId,
      };
    });
  },

  filterAvailableItems: (items: MenuItem[]): MenuItem[] =>
    items.filter((item) => item.is_available),

  groupItemsByCategory: (items: MenuItem[]): Record<string, MenuItem[]> => {
    const grouped: Record<string, MenuItem[]> = {};

    items.forEach((item) => {
      if (Array.isArray(item.categories)) {
        item.categories.forEach((category) => {
          if (!grouped[category.name]) {
            grouped[category.name] = [];
          }
          grouped[category.name].push(item);
        });
      } else if (
        item.categories &&
        typeof item.categories === "object" &&
        "name" in item.categories
      ) {
        const categoryName = (item.categories as MenuItemCategory).name;
        if (!grouped[categoryName]) {
          grouped[categoryName] = [];
        }
        grouped[categoryName].push(item);
      }
    });

    return grouped;
  },

  processRatingData: (
    ratingData: RatingResponse
  ): ProcessedRatingData | null => {
    if (!ratingData?.data) return null;

    const data = ratingData.data;
    const totalRatings = data.total_rate;
    const rate5Count = Math.round(totalRatings * data.rate_5);
    const rate4Count = Math.round(totalRatings * data.rate_4);
    const rate3Count = Math.round(totalRatings * data.rate_3);
    const rate2Count = Math.round(totalRatings * data.rate_2);
    const rate1Count = Math.round(totalRatings * data.rate_1);

    return {
      averageRating: data.rate_of_place,
      totalRatings: data.total_rate,
      myRating: data.my_rate,
      breakdown: [
        { stars: 5, count: rate5Count, percentage: data.rate_5 * 100 },
        { stars: 4, count: rate4Count, percentage: data.rate_4 * 100 },
        { stars: 3, count: rate3Count, percentage: data.rate_3 * 100 },
        { stars: 2, count: rate2Count, percentage: data.rate_2 * 100 },
        { stars: 1, count: rate1Count, percentage: data.rate_1 * 100 },
      ],
    };
  },

  processBranchesData: (branchesData: PlaceBranch[]): ProcessedBranch[] => {
    if (!branchesData || !Array.isArray(branchesData)) return [];

    return branchesData.map((branch) => ({
      id: branch.id,
      title: branch.title,
      titleAr: branch.title_ar,
      address: branch.address,
      addressAr: branch.address_ar,
      phone: branch.phone,
      whatsapp: branch.whatsapp,
      latitude: parseFloat(branch.latitude) || 0,
      longitude: parseFloat(branch.longitude) || 0,
      distance: branch.distance || 0,
      rating: branch.reviews_average || 0,
      merchantName: branch.merchant_name,
      categoryName: branch.category_name,
      workingHours: branch.working_hours || [],
      enableDelivery: branch.enable_delivery_car === 1,
      isActive: branch.active === 1,
      logo: branch.logo,
    }));
  },
};

// Export the fixed API integration helper
export { fetchCurrentOrdersFromAPI };
