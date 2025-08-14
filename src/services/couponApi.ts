// services/couponApiService.ts - Fixed API service for coupon validation
import axios from "axios";
import { ValidatedCoupon, CouponValidationResponse } from "../lib/couponUtils";
import { useAuthStore } from "../stores/useAuthStore";

const BASE_URL = "https://dev-backend.zonak.net/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 30000,
});

const getAuthToken = (): string | null => {
  return useAuthStore.getState().getAuthToken();
};

// App token from the successful mobile request
const getAppToken = (): string => {
  return "b7dcbb3bee57ed51b8bcc5e4ec8dd62a";
};

export const couponApiService = {
  validateCoupon: async (
    code: string,
    placeId: string | number
  ): Promise<ValidatedCoupon> => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication token not found");
    }

    try {
      const response = await axiosInstance.post(
        "/user/coupoun",
        {},
        {
          params: {
            code: code.trim(),
            place_id: placeId,
          },
          headers: {
            // Authentication headers (matching mobile request exactly)
            "x-auth-token": token,
            "x-auth-app-token": getAppToken(),

            // Request headers (matching mobile request)
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-app-lang": "ar",
            ostype: "Android",
            "x-requested-with": "XMLHttpRequest",

            // Connection headers to match mobile behavior
            Connection: "Keep-Alive",
          },
        }
      );

      const data: CouponValidationResponse = response.data;

      if (!data.data) {
        throw new Error(data.message || "Invalid coupon response");
      }

      // Validate coupon data
      const coupon = data.data;

      // Check if coupon is active
      if (coupon.is_active !== 1) {
        throw new Error("هذا الكوبون غير نشط");
      }

      // Check if coupon has remaining usage
      if (coupon.count_usage <= 0) {
        throw new Error("انتهى عدد استخدامات هذا الكوبون");
      }

      // Check if coupon is valid for this place
      const isValidForPlace = coupon.places.some(
        (place) =>
          place.place_id.toString() === placeId.toString() &&
          place.is_active === 1
      );

      if (!isValidForPlace) {
        throw new Error("هذا الكوبون غير صالح لهذا المطعم");
      }

      return coupon;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;

        // Log the error for debugging
        console.error("Coupon API Error:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: errorData,
          headers: error.response?.headers,
        });

        throw new Error(errorData?.message || "فشل في التحقق من الكوبون");
      }
      throw error;
    }
  },
};
