import axios from "axios";
import { useState } from "react";
import { RatingResponse, BranchesResponse } from "../types/types";

const BASE_URL = "https://dev-backend.zonak.net/api";

export const apiService = {
  fetchPreparedOrders: async (
    longitude = 31.2357,
    latitude = 30.0444,
    page = 1
  ) => {
    const response = await axios.get(`${BASE_URL}/places/all/prepared/orders`, {
      params: { lang: longitude, lat: latitude, page },
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  fetchRestaurantDetails: async (
    placeId,
    latitude = 30.0444,
    longitude = 31.2357
  ) => {
    const response = await axios.get(`${BASE_URL}/places/details/${placeId}`, {
      params: {
        type: "android",
        uuid: "fffb4918-216e-4028-ae35-6f982b2be4cb",
        lat: latitude,
        lang: longitude,
      },
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  fetchMenuItems: async (userId) => {
    const response = await axios.get(`${BASE_URL}/menu/items/${userId}`, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  },

  fetchMenuItemsAlt: async (
    merchantId,
    latitude = 30.0444,
    longitude = 31.2357
  ) => {
    const response = await axios.get(
      `${BASE_URL}/merchants/${merchantId}/menu`,
      {
        params: { lat: latitude, lang: longitude },
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  },

  fetchMostOrderedItems: async (userId, placeId) => {
    const response = await axios.get(`${BASE_URL}/place/most_order/${userId}`, {
      params: { place_id: placeId },
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  fetchPlaceRating: async (placeId: number): Promise<RatingResponse> => {
    const response = await axios.get(`${BASE_URL}/places/rating/${placeId}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  fetchPlaceBranches: async (
    placeId: number,
    latitude = 30.0444,
    longitude = 31.2357
  ): Promise<BranchesResponse> => {
    const response = await axios.get(`${BASE_URL}/places/branches/${placeId}`, {
      params: { lat: latitude, lang: longitude },
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },
};

export const useApiService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, callApi };
};

export const dataHelpers = {
  processPreparedOrders: (ordersData) => {
    if (!ordersData?.data) return [];
    return ordersData.data.map((order) => ({
      id: order.id,
      merchantName: order.merchant_name,
      userId: order.user_id,
      isBusy: order.is_busy,
      enableDelivery: order.enable_delivery,
      profileImage: order.profile_image,
      distance: order.place?.distance,
      rating: order.place?.review_average,
      address: order.place?.taddress,
      workingHours: order.place?.working_hours,
      isExclusivePartner: order.user?.is_exclusive_partner,
    }));
  },

  processMenuItems: (menuData) => {
    if (!menuData?.items) return [];
    return menuData.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      newPrice: item.new_price,
      isCombo: item.is_combo,
      minutes: item.minutes,
      categories: item.categories,
      images: item.images,
      subitems: item.subitems,
      options: item.options,
      isAvailable: item.is_available,
      hasOffer: item.has_offer,
    }));
  },

  filterAvailableItems: (items) => items.filter((item) => item.isAvailable),

  groupItemsByCategory: (items) => {
    const grouped = {};
    items.forEach((item) => {
      item.categories.forEach((category) => {
        if (!grouped[category.name]) {
          grouped[category.name] = [];
        }
        grouped[category.name].push(item);
      });
    });
    return grouped;
  },

  // Updated processRatingData to handle the correct API response format
  processRatingData: (ratingData) => {
    if (!ratingData?.data) return null;

    const data = ratingData.data;

    // Calculate actual counts from total ratings and percentages
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
        {
          stars: 5,
          count: rate5Count,
          percentage: data.rate_5 * 100, // Convert to percentage
        },
        {
          stars: 4,
          count: rate4Count,
          percentage: data.rate_4 * 100,
        },
        {
          stars: 3,
          count: rate3Count,
          percentage: data.rate_3 * 100,
        },
        {
          stars: 2,
          count: rate2Count,
          percentage: data.rate_2 * 100,
        },
        {
          stars: 1,
          count: rate1Count,
          percentage: data.rate_1 * 100,
        },
      ],
    };
  },

  processBranchesData: (branchesData) => {
    if (!branchesData) return [];

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
