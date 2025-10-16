import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

const BASE_URL = "https://dev-backend.zonak.net/api";

const getAuthHeaders = () => {
  const token = useAuthStore.getState().getAuthToken();

  return {
    "x-auth-token": token || "",
    "x-auth-app-token": "b7dcbb3bee57ed51b8bcc5e4ec8dd62a",
    "x-app-lang": "ar",
    ostype: "ios",
    accept: "application/json",
    "content-type": "application/json",
  };
};

export const offersAPI = {
  async getOfferDetails(
    offerId: string,
    lat: number = 24.470983061841046,
    lng: number = 39.603155483668466
  ) {
    try {
      const response = await axios.get(
        `${BASE_URL}/offers/${offerId}/details`,
        {
          params: {
            lang: lng,
            lat: lat,
            type: "ios",
            uuid: "BAB9D1C9-2843-4E7D-B20A-FFA5D6266D2E",
          },
          headers: getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "فشل في تحميل تفاصيل العرض"
        );
      }
      throw error;
    }
  },

  async useOffer(offerId: string) {
    try {
      const response = await axios.post(
        `${BASE_URL}/offers/${offerId}/use_offer`,
        { type: "offer" },
        {
          headers: getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "فشل في إنشاء رمز QR");
      }
      throw error;
    }
  },
};
