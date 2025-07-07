import { useState } from "react";
import { apiService, dataHelpers } from "../services/apiService";

interface ProcessedRating {
  averageRating: number;
  totalRatings: number;
  myRating: number;
  breakdown: Array<{
    stars: number;
    percentage: number;
    count: number;
  }>;
}

interface ProcessedBranch {
  id: number;
  title: string;
  titleAr: string;
  address: string;
  addressAr: string;
  phone: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  distance: number;
  rating: number;
  merchantName: string;
  categoryName: string;
  workingHours: any[];
  enableDelivery: boolean;
  isActive: boolean;
  logo: string;
}

interface UsePlaceDataReturn {
  rating: ProcessedRating | null;
  branches: ProcessedBranch[];
  loadingRating: boolean;
  loadingBranches: boolean;
  errorRating: string | null;
  errorBranches: string | null;
  fetchRating: (placeId: number) => Promise<void>;
  fetchBranches: (
    placeId: number,
    latitude?: number,
    longitude?: number
  ) => Promise<void>;
  refreshData: (
    placeId: number,
    latitude?: number,
    longitude?: number
  ) => Promise<void>;
  clearData: () => void;
}

export const usePlaceData = (): UsePlaceDataReturn => {
  const [rating, setRating] = useState<ProcessedRating | null>(null);
  const [branches, setBranches] = useState<ProcessedBranch[]>([]);
  const [loadingRating, setLoadingRating] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [errorRating, setErrorRating] = useState<string | null>(null);
  const [errorBranches, setErrorBranches] = useState<string | null>(null);

  const fetchRating = async (placeId: number) => {
    setLoadingRating(true);
    setErrorRating(null);

    try {
      const response = await apiService.fetchPlaceRating(placeId);
      if (response.message === "Success" && response.data) {
        const processedRating = dataHelpers.processRatingData(response.data);
        setRating(processedRating);
      }
    } catch (error: any) {
      setErrorRating(error.message || "Failed to fetch rating");
      console.error("Error fetching place rating:", error);
    } finally {
      setLoadingRating(false);
    }
  };

  const fetchBranches = async (
    placeId: number,
    latitude = 30.0444,
    longitude = 31.2357
  ) => {
    setLoadingBranches(true);
    setErrorBranches(null);

    try {
      const response = await apiService.fetchPlaceBranches(
        placeId,
        latitude,
        longitude
      );
      if (response.message === "Success" && response.data) {
        const processedBranches = dataHelpers.processBranchesData(
          response.data
        );
        setBranches(processedBranches);
      }
    } catch (error: any) {
      setErrorBranches(error.message || "Failed to fetch branches");
      console.error("Error fetching place branches:", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const refreshData = async (
    placeId: number,
    latitude = 30.0444,
    longitude = 31.2357
  ) => {
    await Promise.all([
      fetchRating(placeId),
      fetchBranches(placeId, latitude, longitude),
    ]);
  };

  const clearData = () => {
    setRating(null);
    setBranches([]);
    setErrorRating(null);
    setErrorBranches(null);
  };

  return {
    rating,
    branches,
    loadingRating,
    loadingBranches,
    errorRating,
    errorBranches,
    fetchRating,
    fetchBranches,
    refreshData,
    clearData,
  };
};
