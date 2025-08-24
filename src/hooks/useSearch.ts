import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { apiService } from "@/services/apiService";
import { useDebounce } from "./useDebounce";

interface SearchResult {
  id: number;
  user_id: number;
  merchant_name: string;
  taddress: string;
  distance: number;
  review_average: number;
  category_name?: string;
  profile_image?: string;
  is_favor: boolean;
  is_busy: number;
  enable_delivery: number;
  place?: {
    id: number;
    distance: number;
    review_average: number;
    taddress: string;
    is_favor: boolean;
  };
}

const DEFAULT_COORDS = {
  lat: 24.470983061841046,
  lng: 39.603155483668466,
};

export const useSearch = (
  latitude?: number | null,
  longitude?: number | null
) => {
  const [allRestaurants, setAllRestaurants] = useState<SearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Only these states should change after debouncing
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Debounce search query with 300ms delay (reduced from 500ms for better UX)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Track if we're currently debouncing to show appropriate UI feedback
  const isDebouncing =
    searchQuery !== debouncedSearchQuery && searchQuery.length > 0;

  // Transform API response to SearchResult
  const transformToSearchResult = useCallback((order: any): SearchResult => {
    return {
      id: order.id,
      user_id: order.user_id,
      merchant_name: order.merchant_name,
      taddress: order.place?.taddress || "عنوان غير محدد",
      distance: order.place?.distance || 0,
      review_average: order.place?.review_average || 0,
      category_name: order.category_name,
      profile_image: order.profile_image,
      is_favor: order.place?.is_favor || false,
      is_busy: order.is_busy || 1,
      enable_delivery: order.enable_delivery || 0,
      place: order.place,
    };
  }, []);

  // Fetch all restaurants
  const fetchRestaurants = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const coords = {
        lat: latitude || DEFAULT_COORDS.lat,
        lng: longitude || DEFAULT_COORDS.lng,
      };
      console.log("🌍 Location Debug:", {
        userLatitude: latitude,
        userLongitude: longitude,
        finalCoords: coords,
        isUsingUserLocation: !!(latitude && longitude),
        isUsingDefaultCoords: !(latitude && longitude),
      });
      const response = await apiService.fetchPreparedOrders(
        coords.lng,
        coords.lat,
        1
      );

      const orders = response?.data?.data || [];
      const transformedResults = orders.map(transformToSearchResult);

      setAllRestaurants(transformedResults);

      // Only update search results if not actively searching
      if (!isSearchActive) {
        setSearchResults(transformedResults);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في تحميل المطاعم";
      setError(errorMessage);
      setAllRestaurants([]);
      if (!isSearchActive) {
        setSearchResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, [transformToSearchResult, isSearchActive, loading, latitude, longitude]);

  // Memoized search function for better performance
  const searchFunction = useMemo(() => {
    return (query: string, restaurants: SearchResult[]): SearchResult[] => {
      if (!query.trim()) {
        return restaurants;
      }

      const searchTerm = query.toLowerCase().trim();
      const filtered = restaurants.filter((restaurant) => {
        const merchantName = restaurant.merchant_name?.toLowerCase() || "";
        const categoryName = restaurant.category_name?.toLowerCase() || "";
        const address = restaurant.taddress?.toLowerCase() || "";

        return (
          merchantName.includes(searchTerm) ||
          categoryName.includes(searchTerm) ||
          address.includes(searchTerm)
        );
      });

      // Enhanced sorting with multiple criteria
      const sorted = filtered.sort((a, b) => {
        const aName = a.merchant_name.toLowerCase();
        const bName = b.merchant_name.toLowerCase();

        // 1. Exact name matches first
        const aExactMatch = aName === searchTerm;
        const bExactMatch = bName === searchTerm;
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        // 2. Name starts with search term
        const aStartsWith = aName.startsWith(searchTerm);
        const bStartsWith = bName.startsWith(searchTerm);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // 3. Available restaurants before busy ones
        if (a.is_busy !== b.is_busy) {
          return a.is_busy - b.is_busy;
        }

        // 4. Higher rating
        if (Math.abs(a.review_average - b.review_average) > 0.1) {
          return b.review_average - a.review_average;
        }

        // 5. Closer distance
        return a.distance - b.distance;
      });

      return sorted;
    };
  }, []);

  // Filter restaurants based on search query - Only called after debouncing
  const performSearch = useCallback(
    (query: string) => {
      // If empty query, reset everything
      if (!query.trim()) {
        setSearchResults(allRestaurants);
        setIsSearchActive(false);
        setShowResults(false);
        setSearchLoading(false);
        return;
      }

      // Show loading state
      setSearchLoading(true);

      // Perform search
      const filtered = searchFunction(query, allRestaurants);

      // Update all search-related states together
      setSearchResults(filtered);
      setIsSearchActive(true);
      setShowResults(true);
      setSearchLoading(false);
    },
    [allRestaurants, searchFunction]
  );

  // Handle debounced search - This is the ONLY place where search logic runs
  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  // Load restaurants on mount
  useEffect(() => {
    if (allRestaurants.length === 0) {
      fetchRestaurants();
    }
  }, [fetchRestaurants, allRestaurants.length]);

  // OPTIMIZED: Only update search query immediately, defer all other state changes
  const handleSearchChange = useCallback((query: string) => {
    // Only update the search query immediately for input responsiveness
    setSearchQuery(query);

    // Don't update any other states here - let debouncing handle it
    // This prevents cascading re-renders on every character
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim().length >= 1) {
      // Force immediate search on submit (bypass debouncing)
      performSearch(searchQuery);
    }
  }, [searchQuery, performSearch]);

  const handleCategoryClick = useCallback(
    (category: string) => {
      setSearchQuery(category);
      // Perform immediate search for category clicks
      performSearch(category);
    },
    [performSearch]
  );

  const handleResultClick = useCallback((result: SearchResult) => {
    console.log("Navigate to restaurant:", result.user_id);
    setShowResults(false);
    // You can add navigation logic here or return the result to parent
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    // performSearch will be called automatically via useEffect when debouncedSearchQuery updates
  }, []);

  const hideResults = useCallback(() => {
    setShowResults(false);
  }, []);

  // Computed values
  const displayedRestaurants = isSearchActive ? searchResults : allRestaurants;

  // Optimized search status
  const searchStatus = useMemo(() => {
    if (!searchQuery.trim()) return "idle";
    if (isDebouncing) return "debouncing";
    if (searchLoading) return "searching";
    return "completed";
  }, [searchQuery, isDebouncing, searchLoading]);

  return {
    // Data
    restaurants: displayedRestaurants,
    searchResults,
    allRestaurants,

    // States - Only essential ones that should trigger re-renders
    loading,
    error,
    searchQuery, // This updates immediately for input responsiveness

    // These only update after debouncing
    searchLoading,
    showResults,
    isSearchActive,
    searchStatus,

    // Computed values
    hasResults: searchResults.length > 0,
    resultsCount: searchResults.length,
    isDebouncing, // Now properly calculated

    // Actions
    fetchRestaurants,
    handleSearchChange, // Optimized - minimal state updates
    handleSearchSubmit,
    handleCategoryClick,
    handleResultClick,
    clearSearch,
    hideResults,
  };
};
