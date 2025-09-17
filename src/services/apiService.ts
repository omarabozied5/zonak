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
import { ValidatedCoupon } from "../lib/couponUtils";

const BASE_URL = "https://dev-backend.zonak.net/api";

// ===== New Offer Types =====
interface Offer {
  id: number;
  user_id: number;
  place_id: number;
  is_offer_verified: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  start_date: string;
  end_date: string;
  updatetime: string;
  insertdate: string;
  discount: number | null;
  main_offer: boolean;
  view_count: number;
  offer_type: number;
  old_price: number | null;
  new_price: number | null;
  offer_details: string | null;
  is_zonak: boolean;
  product_name: string;
  offer_terms: string | null;
  main_offer_order: number;
  available_cashback: number;
  max_daily_cashback: number | null;
  text_offer: string | null;
  cashback_delivery: number | null;
  cashback_upon_receipt: number | null;
  places: number[];
  offer_image: string | null;
}

interface CartOrderResponse {
  message: string;
  time_to_ready: string;
  payment: number;
  offers: Offer[];
  balance: number;
  cashback: Offer;
  duration_time: number;
  max: number | null;
  cash: number;
  car: any[];
  is_delivery: any;
  cashback_delivery: number;
  cashback_branch: number;
  have_items: number;
  car_delivery: boolean;
  price_car_delivery: number;
  enable_car_delivery: number;
}

interface PaymentUrlResponse {
  message: string;
  data: string; // The payment URL
}

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
    longitude = 39.603155483668466,
    latitude = 24.470983061841046,
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

    // console.log(`📄 Making API call to /menu/items/${userId}`);
    // console.log(`📋 Parameters:`, params);
    // console.log(
    //   `🪝 Request URL: ${BASE_URL}/menu/items/${userId}${
    //     placeId ? `?place_id=${placeId}` : ""
    //   }`
    // );

    try {
      const response = await axiosInstance.get(`/menu/items/${userId}`, {
        params,
      });

      // console.log(`✅ API Response received:`, {
      //   status: response.status,
      //   dataKeys: Object.keys(response.data),
      //   itemsCount:
      //     response.data?.data?.items?.length ||
      //     response.data?.items?.length ||
      //     0,
      //   hasCategories: !!(
      //     response.data?.data?.categories || response.data?.categories
      //   ),
      // });

      // Validate response structure
      if (!response.data) {
        console.error("❌ No data in response");
        throw new Error("No data received from server");
      }

      const menuData = response.data;

      // // Log structure for debugging
      // if (menuData.data) {
      //   console.log("📊 Response structure: menuData.data exists");
      //   console.log("📊 Items found:", menuData.data.items?.length || 0);
      // } else if (menuData.items) {
      //   console.log("📊 Response structure: menuData.items exists");
      //   console.log("📊 Items found:", menuData.items?.length || 0);
      // } else {
      //   console.warn(
      //     "⚠️ Unexpected response structure:",
      //     Object.keys(menuData)
      //   );
      // }

      return menuData;
    } catch (error) {
      // console.error(`❌ API Error for menu items:`, {
      //   userId,
      //   placeId,
      //   error: error instanceof Error ? error.message : "Unknown error",
      //   status: axios.isAxiosError(error)
      //     ? error.response?.status
      //     : "No status",
      //   responseData: axios.isAxiosError(error)
      //     ? error.response?.data
      //     : "No response data",
      // });

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

  // NEW ENDPOINT - Fetch cart order info with offers
  fetchCartOrderInfo: async (
    merchantId: string | number,
    placeId: string | number
  ): Promise<CartOrderResponse> => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication token not found");
    }

    try {
      const response = await axiosInstance.get("/order/cart", {
        params: {
          merchant_id: merchantId,
          place_id: placeId,
        },
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      });

      // console.log("Cart order info received:", {
      //   offersCount: response.data.offers?.length || 0,
      //   hasCashback: !!response.data.cashback,
      //   balance: response.data.balance,
      // });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        throw new Error(
          errorData?.message || "Failed to fetch cart order info"
        );
      }
      throw error;
    }
  },

  // AUTHENTICATED ENDPOINTS - Require token

  fetchCurrentOrders: async (): Promise<CurrentOrdersApiResponse> => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication token not found");
    }

    try {
      const response = await axiosInstance.get("/get/current/orders", {
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
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

  getPaymentUrl: async (
    orderId: string | number
  ): Promise<PaymentUrlResponse> => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication token not found");
    }

    try {
      const response = await axiosInstance.get("/pay/order/place", {
        params: {
          order_id: orderId,
          device_type: "web",
        },
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        throw new Error(errorData?.message || "Failed to get payment URL");
      }
      throw error;
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
      throw new Error(
        `Item ${item.name} has invalid categoryId: ${item.categoryId}`
      );
    }

    // Use current price (after item discount) for calculations
    const currentPrice = item.price;
    const originalPrice = item.originalPrice || item.price;

    if (!currentPrice || isNaN(currentPrice) || currentPrice < 0) {
      throw new Error(
        `Item ${item.name} has invalid current price: ${currentPrice}`
      );
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
    const itemDiscount = (originalPrice - currentPrice) * item.quantity;
    // if (itemDiscount > 0) {
    //   console.log(
    //     `Item ${
    //       item.name
    //     }: Original ${originalPrice}, Current ${currentPrice}, Discount per item: ${
    //       originalPrice - currentPrice
    //     }, Total discount: ${itemDiscount}`
    //   );
    // }

    return {
      id: baseItemId,
      options,
      price: Math.round(currentPrice * 100) / 100, // Use current price (post-discount)
      quantity: item.quantity,
      note: item.selectedOptions?.notes?.trim() || null,
      category_id: item.categoryId,
      price_with_option: Math.round(item.totalPriceWithModifiers * 100) / 100,
      is_winner: false,
    };
  });
};
// Updated buildOrderPayload function in apiService.ts

export const buildOrderPayload = (
  cartItems: CartItem[],
  placeId: number,
  merchantId: number,
  totalPrice: number,
  paymentType: number,
  appliedCoupon: ValidatedCoupon | null = null,
  couponDiscountAmount = 0
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

    // Calculate cart price using current prices (after item discounts are applied)
    const cartPrice = cartItems.reduce(
      (sum, item) => sum + item.totalPriceWithModifiers * item.quantity,
      0
    );

    // Calculate total item discounts for logging/validation
    const totalItemDiscounts = cartItems.reduce(
      (total, item) =>
        total +
        ((item.originalPrice || item.price) - item.price) * item.quantity,
      0
    );

    // console.log("Order payload discount breakdown:", {
    //   originalSubtotal: cartPrice + totalItemDiscounts,
    //   itemDiscounts: totalItemDiscounts,
    //   subtotalAfterItemDiscounts: cartPrice,
    //   couponDiscount: couponDiscountAmount,
    //   finalTotal: totalPrice,
    //   totalSavings: totalItemDiscounts + couponDiscountAmount,
    // });

    const cashbackRate = 0.07;
    const cashbackValue = Math.round(totalPrice * cashbackRate * 100) / 100;

    // Prepare coupon data for payload
    const coupons = appliedCoupon ? [appliedCoupon.id] : [];

    const payload: BackendOrderPayload = {
      cart_price: Math.round(cartPrice * 100) / 100,
      discount:
        couponDiscountAmount > 0
          ? -Math.round(couponDiscountAmount * 100) / 100
          : 0,
      is_zonak_account_used: false,
      items_id: backendItems,
      merchant_id: merchantId,
      place_id: placeId,
      total_price: Math.round(totalPrice * 100) / 100,
      zonak_discount: 0,
      type: paymentType,
      cashback_value: cashbackValue,
      is_new: true,
      is_delivery: 0,
      coupouns: coupons, // Add coupon IDs array
      cashback_from_coupons: 0,
      discount_from_coupons: Math.round(couponDiscountAmount * 100) / 100,
      max_coupoun_discount: appliedCoupon?.max_coupoun_discount || 0,
      is_delivery_zonak: 0,
      device_type: "web",
    };

    // console.log("Final payload being sent:", JSON.stringify(payload, null, 2));

    // if (appliedCoupon) {
    //   console.log("Coupon details:", {
    //     id: appliedCoupon.id,
    //     code: appliedCoupon.code,
    //     discount_value: appliedCoupon.discount_value,
    //     discount_type: appliedCoupon.discount_type,
    //     calculated_discount: couponDiscountAmount,
    //   });
    // }

    return payload;
  } catch (error) {
    throw new Error(
      `Failed to build order payload: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
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

// ===== Custom Hook for Offers =====
export const useOffers = (
  merchantId: string | number | null,
  placeId: string | number | null
) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [cashback, setCashback] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    if (!merchantId || !placeId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.fetchCartOrderInfo(merchantId, placeId);
      setOffers(response.offers || []);
      setCashback(response.cashback || null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch offers";
      setError(errorMessage);
      console.error("Error fetching offers:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    offers,
    cashback,
    loading,
    error,
    fetchOffers,
  };
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
          categoryId = 0;
        }
      } else {
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

// Export types for use in components
export type { Offer, CartOrderResponse };
