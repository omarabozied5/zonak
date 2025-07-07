import { useState, useCallback, useRef, useEffect } from "react";
import { apiService } from "@/services/apiService";

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
  user?: {
    user_id: number;
    full_name: string;
    is_exclusive_partner: number;
  };
  place?: {
    id: number;
    distance: number;
    review_average: number;
    taddress: string;
    is_favor: boolean;
  };
}

interface SearchFilters {
  category?: string;
  minRating?: number;
  maxDistance?: number;
  deliveryOnly?: boolean;
}

// Default coordinates for Medina
const DEFAULT_COORDS = {
  lat: 24.455374838891599,
  lng: 39.501528887063987,
};

export const useSearch = () => {
  const [allRestaurants, setAllRestaurants] = useState<SearchResult[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<
    SearchResult[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout>();

  const transformOrderToSearchResult = useCallback(
    (order: any): SearchResult => {
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
        is_busy: order.is_busy || 0,
        enable_delivery: order.enable_delivery || 0,
        user: order.user,
        place: order.place,
      };
    },
    []
  );

  const filterRestaurants = useCallback(
    (
      restaurants: SearchResult[],
      query: string,
      filters: SearchFilters = {}
    ) => {
      if (
        !query.trim() &&
        !filters.category &&
        !filters.minRating &&
        !filters.maxDistance &&
        !filters.deliveryOnly
      ) {
        return restaurants;
      }

      return restaurants.filter((restaurant) => {
        const merchantName = restaurant.merchant_name?.toLowerCase() || "";
        const address = restaurant.taddress?.toLowerCase() || "";
        const categoryName = restaurant.category_name?.toLowerCase() || "";
        const searchTerm = query.toLowerCase();

        // Text search match
        const textMatch =
          !query.trim() ||
          merchantName.includes(searchTerm) ||
          address.includes(searchTerm) ||
          categoryName.includes(searchTerm);

        // Apply filters
        const categoryMatch =
          !filters.category ||
          merchantName.includes(filters.category.toLowerCase()) ||
          categoryName.includes(filters.category.toLowerCase());

        const ratingMatch =
          !filters.minRating || restaurant.review_average >= filters.minRating;
        const distanceMatch =
          !filters.maxDistance || restaurant.distance <= filters.maxDistance;
        const deliveryMatch =
          !filters.deliveryOnly || restaurant.enable_delivery === 1;

        return (
          textMatch &&
          categoryMatch &&
          ratingMatch &&
          distanceMatch &&
          deliveryMatch
        );
      });
    },
    []
  );

  const sortResults = useCallback((results: SearchResult[], query: string) => {
    if (!query.trim()) {
      return results.sort((a, b) => {
        if (a.review_average !== b.review_average) {
          return b.review_average - a.review_average;
        }
        return a.distance - b.distance;
      });
    }

    return results.sort((a, b) => {
      // Prioritize exact name matches
      const aExactMatch = a.merchant_name
        .toLowerCase()
        .includes(query.toLowerCase());
      const bExactMatch = b.merchant_name
        .toLowerCase()
        .includes(query.toLowerCase());

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Then by rating
      if (a.review_average !== b.review_average) {
        return b.review_average - a.review_average;
      }

      // Finally by distance
      return a.distance - b.distance;
    });
  }, []);

  const fetchRestaurants = useCallback(
    async (
      coordinates: { lat: number; lng: number } = DEFAULT_COORDS,
      page: number = 1,
      append: boolean = false
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.fetchPreparedOrders(
          coordinates.lng,
          coordinates.lat,
          page
        );
        const orders = response?.data?.data || [];
        const transformedResults = orders.map(transformOrderToSearchResult);

        if (append) {
          setAllRestaurants((prev) => [...prev, ...transformedResults]);
        } else {
          setAllRestaurants(transformedResults);
          if (!isSearchActive) {
            setFilteredRestaurants(transformedResults);
          }
        }

        return transformedResults;
      } catch (err) {
        console.error("Fetch restaurants error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "فشل في تحميل المطاعم";
        setError(errorMessage);
        if (!append) {
          setAllRestaurants([]);
          setFilteredRestaurants([]);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [transformOrderToSearchResult, isSearchActive]
  );

  const performSearch = useCallback(
    (query: string, filters: SearchFilters = {}) => {
      const hasSearchCriteria =
        query.trim() ||
        filters.category ||
        filters.minRating ||
        filters.maxDistance ||
        filters.deliveryOnly;

      if (!hasSearchCriteria) {
        setIsSearchActive(false);
        setFilteredRestaurants(allRestaurants);
        return allRestaurants;
      }

      setIsSearchActive(true);
      const filtered = filterRestaurants(allRestaurants, query, filters);
      const sorted = sortResults(filtered, query);
      setFilteredRestaurants(sorted);
      setShowResults(true);
      return sorted;
    },
    [allRestaurants, filterRestaurants, sortResults]
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (query.trim()) {
        debounceRef.current = setTimeout(() => {
          performSearch(
            query,
            selectedCategory ? { category: selectedCategory } : {}
          );
        }, 300);
      } else {
        clearSearch();
      }
    },
    [performSearch, selectedCategory]
  );

  const handleSearchSubmit = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (searchQuery.trim()) {
      performSearch(
        searchQuery,
        selectedCategory ? { category: selectedCategory } : {}
      );
    }
  }, [performSearch, searchQuery, selectedCategory]);

  const handleCategoryClick = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      setSearchQuery(category);
      performSearch(category, { category });
    },
    [performSearch]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
    setIsSearchActive(false);
    setShowResults(false);
    setFilteredRestaurants(allRestaurants);
    setError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, [allRestaurants]);

  const handleResultClick = useCallback((result: SearchResult) => {
    console.log("Navigate to restaurant:", result.id);
    setShowResults(false);
    setSearchQuery(result.merchant_name);
  }, []);

  const hideResults = useCallback(() => {
    setShowResults(false);
  }, []);

  // Load initial data
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const displayRestaurants = isSearchActive
    ? filteredRestaurants
    : allRestaurants;

  return {
    // State
    restaurants: displayRestaurants,
    searchResults: filteredRestaurants,
    loading,
    error,
    searchQuery,
    selectedCategory,
    showResults,
    isSearchActive,

    // Actions
    handleSearchChange,
    handleSearchSubmit,
    handleCategoryClick,
    handleResultClick,
    clearSearch,
    hideResults,
    fetchRestaurants,
  };
};
