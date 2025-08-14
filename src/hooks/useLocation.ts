import { useState, useEffect } from "react";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export const useLocation = (options: GeolocationOptions = {}) => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
  });

  const defaultOptions: GeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000, // Cache location for 1 minute
    ...options,
  };

  const getCurrentLocation = () => {
    console.log("🌍 Location Service Debug:", {
      geolocationSupported: !!navigator.geolocation,
      isHTTPS: window.location.protocol === "https:",
      isLocalhost: window.location.hostname === "localhost",
      userAgent: navigator.userAgent.substring(0, 50) + "...",
    });

    if (!navigator.geolocation) {
      console.log("❌ Geolocation not supported");
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by this browser",
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));
    console.log("📍 Requesting user location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ Location obtained:", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy + "m",
        });
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
        });
      },
      (error) => {
        console.log("❌ Location error:", {
          code: error.code,
          message: error.message,
        });
        let errorMessage = "Unable to retrieve location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
          default:
            errorMessage = "An unknown error occurred";
            break;
        }

        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      },
      defaultOptions
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    ...location,
    getCurrentLocation,
    isLocationAvailable:
      location.latitude !== null && location.longitude !== null,
  };
};
