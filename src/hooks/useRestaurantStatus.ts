import { useMemo } from "react";
import { Restaurant, WorkingHour } from "../types/types";

interface RestaurantStatus {
  isOpen: boolean;
  isBusy: boolean;
  canOrder: boolean;
  statusMessage: string;
  statusColor: string;
  reasonClosed: "busy" | "outside_hours" | "closed_today" | null;
}

export const useRestaurantStatus = (
  restaurant: Restaurant
): RestaurantStatus => {
  return useMemo(() => {
    if (!restaurant) {
      return {
        isOpen: false,
        isBusy: false,
        canOrder: false,
        statusMessage: "غير متاح",
        statusColor: "text-gray-500",
        reasonClosed: null,
      };
    }

    // Check if restaurant is busy first (highest priority)
    // is_busy: 1 means available, is_busy: 0 means busy
    const isBusy = restaurant.is_busy?.is_busy === 0;
    if (isBusy) {
      return {
        isOpen: false,
        isBusy: true,
        canOrder: false,
        statusMessage: "المطعم مشغول حالياً",
        statusColor: "text-amber-600",
        reasonClosed: "busy",
      };
    }

    // Get current day (0 = Sunday, 1 = Monday, etc.)
    const today = new Date().getDay();
    const currentTime = new Date();

    // Convert JS day (0=Sunday) to API day format (7=Sunday, 1=Monday, etc.)
    const convertJSDayToAPIDay = (jsDay: number): number => {
      const mapping = [2, 3, 4, 5, 6, 7, 1]; // Index by JS day, value is API day
      return mapping[jsDay];
    };

    const todayAPIDay = convertJSDayToAPIDay(today);

    // Find today's working hours
    const todayHours = restaurant.working_hours?.find(
      (hour: WorkingHour) => hour.day === todayAPIDay
    );

    if (todayHours.is_24h === true) {
      return {
        isOpen: true,
        isBusy: false,
        canOrder: true,
        statusMessage: "مفتوح 24 ساعة",
        statusColor: "text-green-600",
        reasonClosed: null,
      };
    }

    // Case 2: is_24h is false - check is_closed
    if (todayHours.is_closed === "1" || todayHours.is_closed_bool === true) {
      return {
        isOpen: true,
        isBusy: false,
        canOrder: true,
        statusMessage: "مفتوح 24 ساعة",
        statusColor: "text-green-600",
        reasonClosed: null,
      };
    }

    // Case 2: is_24h is false - check is_closed
    if (todayHours.is_closed === "1" || todayHours.is_closed_bool === true) {
      return {
        isOpen: false,
        isBusy: false,
        canOrder: false,
        statusMessage: "مغلق اليوم",
        statusColor: "text-red-500",
        reasonClosed: "closed_today",
      };
    }

    // Case 3: Check if restaurant has second period (is_second_period = 1)
    if (todayHours.is_second_period === 1) {
      // Use second period times
      if (todayHours.second_open_time && todayHours.second_close_time) {
        const [openHour, openMinute] = todayHours.second_open_time
          .split(":")
          .map(Number);
        const [closeHour, closeMinute] = todayHours.second_close_time
          .split(":")
          .map(Number);

        const openTime = new Date(currentTime);
        openTime.setHours(openHour, openMinute, 0, 0);

        const closeTime = new Date(currentTime);
        closeTime.setHours(closeHour, closeMinute, 0, 0);

        // Handle overnight hours (e.g., 22:00 to 02:00)
        if (closeTime < openTime) {
          closeTime.setDate(closeTime.getDate() + 1);
        }

        const isWithinHours =
          currentTime >= openTime && currentTime <= closeTime;

        if (isWithinHours) {
          return {
            isOpen: true,
            isBusy: false,
            canOrder: true,
            statusMessage: "مفتوح الآن",
            statusColor: "text-green-600",
            reasonClosed: null,
          };
        } else {
          const formatTime = (time: string) => {
            const [hour, minute] = time.split(":");
            const date = new Date();
            date.setHours(+hour, +minute);
            return new Intl.DateTimeFormat("ar-EG", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }).format(date);
          };

          return {
            isOpen: false,
            isBusy: false,
            canOrder: false,
            statusMessage: `مغلق - يفتح ${formatTime(
              todayHours.second_open_time
            )}`,
            statusColor: "text-red-500",
            reasonClosed: "outside_hours",
          };
        }
      }
    } else {
      // Use regular period times
      if (todayHours.open_time && todayHours.close_time) {
        const [openHour, openMinute] = todayHours.open_time
          .split(":")
          .map(Number);
        const [closeHour, closeMinute] = todayHours.close_time
          .split(":")
          .map(Number);

        const openTime = new Date(currentTime);
        openTime.setHours(openHour, openMinute, 0, 0);

        const closeTime = new Date(currentTime);
        closeTime.setHours(closeHour, closeMinute, 0, 0);

        // Handle overnight hours (e.g., 22:00 to 02:00)
        if (closeTime < openTime) {
          closeTime.setDate(closeTime.getDate() + 1);
        }

        const isWithinHours =
          currentTime >= openTime && currentTime <= closeTime;

        if (isWithinHours) {
          return {
            isOpen: true,
            isBusy: false,
            canOrder: true,
            statusMessage: "مفتوح الآن",
            statusColor: "text-green-600",
            reasonClosed: null,
          };
        } else {
          const formatTime = (time: string) => {
            const [hour, minute] = time.split(":");
            const date = new Date();
            date.setHours(+hour, +minute);
            return new Intl.DateTimeFormat("ar-EG", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }).format(date);
          };

          return {
            isOpen: false,
            isBusy: false,
            canOrder: false,
            statusMessage: `مغلق - يفتح ${formatTime(todayHours.open_time)}`,
            statusColor: "text-red-500",
            reasonClosed: "outside_hours",
          };
        }
      }
    }

    // Fallback - closed
    return {
      isOpen: false,
      isBusy: false,
      canOrder: false,
      statusMessage: "مغلق",
      statusColor: "text-red-500",
      reasonClosed: "closed_today",
    };
  }, [restaurant]);
};
