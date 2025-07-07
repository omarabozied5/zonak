import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  phone: string;
  createdAt?: string;
  lastLogin?: string;
  isNewUser?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastLoginAttempt: string | null;

  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  clearAuthData: () => void;

  // Getters
  getUserDisplayName: () => string;
  isUserLoggedIn: () => boolean;
  getAuthToken: () => string | null;
  getUserId: () => string | null;
}

// Helper function to clear all user-specific data from localStorage
const clearAllUserData = (userId: string | null) => {
  if (typeof window === "undefined") return;

  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);

    // Clear user-specific data
    if (userId) {
      keys.forEach((key) => {
        if (key.includes(`-${userId}`)) {
          localStorage.removeItem(key);
          console.log(`Removed: ${key}`);
        }
      });
    }

    // Clear guest data when user logs out
    const guestKeysToRemove = [
      "cart-storage-guest",
      "orders-storage-guest",
      "favorites-storage-guest",
      "addresses-storage-guest",
    ];

    guestKeysToRemove.forEach((key) => {
      if (keys.includes(key)) {
        localStorage.removeItem(key);
        console.log(`Removed guest data: ${key}`);
      }
    });

    console.log(`Cleared all data for user: ${userId || "guest"}`);
  } catch (error) {
    console.error("Error clearing user data:", error);
  }
};

// Helper function to clear in-memory store instances
const clearStoreInstances = (userId: string | null) => {
  if (typeof window === "undefined") return;

  try {
    // Import store cleanup functions dynamically to avoid circular dependencies
    const clearCartInstances = () => {
      // Clear cart store instances
      const cartInstances = (window as any).cartStoreInstances;
      if (cartInstances) {
        const storeKey = userId || "guest";
        cartInstances.delete(storeKey);
        console.log(`Cleared cart instance for: ${storeKey}`);
      }
    };

    const clearOrderInstances = () => {
      // Clear order store instances
      const orderInstances = (window as any).orderStoreInstances;
      if (orderInstances) {
        const storeKey = userId || "guest";
        orderInstances.delete(storeKey);
        console.log(`Cleared order instance for: ${storeKey}`);
      }
    };

    clearCartInstances();
    clearOrderInstances();
  } catch (error) {
    console.error("Error clearing store instances:", error);
  }
};

// Helper function to trigger cleanup events
const triggerCleanupEvents = (userId: string | null) => {
  if (typeof window === "undefined") return;

  try {
    // Clear in-memory store instances
    clearStoreInstances(userId);

    // Dispatch custom events to notify other stores
    window.dispatchEvent(
      new CustomEvent("auth-logout", {
        detail: { userId },
      })
    );

    window.dispatchEvent(
      new CustomEvent("user-data-cleanup", {
        detail: { userId },
      })
    );

    // Force a page reload to ensure all stores are clean (optional)
    // window.location.reload();
  } catch (error) {
    console.error("Error triggering cleanup events:", error);
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      lastLoginAttempt: null,

      login: (user: User, token: string) => {
        const now = new Date().toISOString();
        const enhancedUser = {
          ...user,
          lastLogin: now,
          createdAt: user.createdAt || now,
        };

        set({
          user: enhancedUser,
          token,
          isAuthenticated: true,
          lastLoginAttempt: now,
          isLoading: false,
        });

        console.log(`User logged in: ${user.id}`);
      },

      logout: () => {
        const currentUser = get().user;
        const currentUserId = currentUser?.id || null;

        console.log(`Logging out user: ${currentUserId || "guest"}`);

        // Clear all user-specific data before updating state
        clearAllUserData(currentUserId);

        // Update auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          lastLoginAttempt: null,
        });

        // Trigger cleanup events
        triggerCleanupEvents(currentUserId);
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            ...userData,
          };

          set({ user: updatedUser });
          console.log(`User updated: ${updatedUser.id}`);
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearAuthData: () => {
        const currentUser = get().user;
        const currentUserId = currentUser?.id || null;

        console.log(`Clearing auth data for user: ${currentUserId || "guest"}`);

        // Clear all user-specific data
        clearAllUserData(currentUserId);

        // Update auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          lastLoginAttempt: null,
        });

        // Trigger cleanup events
        triggerCleanupEvents(currentUserId);
      },

      // Getters
      getUserDisplayName: () => {
        const user = get().user;
        if (!user) return "مستخدم";

        // Return first name if full name is provided
        const firstName = user.name.split(" ")[0];
        return firstName || user.name;
      },

      isUserLoggedIn: () => {
        const { user, token, isAuthenticated } = get();
        return !!(user && token && isAuthenticated);
      },

      getAuthToken: () => {
        return get().token;
      },

      getUserId: () => {
        return get().user?.id || null;
      },
    }),
    {
      name: "auth-storage",
      version: 1,
      // Only persist essential data
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        lastLoginAttempt: state.lastLoginAttempt,
      }),
      // Handle rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log(`Auth rehydrated for user: ${state.user?.id || "guest"}`);

          // Validate stored data on app start
          const { user, token, isAuthenticated } = state;
          if (isAuthenticated && (!user || !token)) {
            console.warn("Invalid auth state detected, clearing...");
            state.clearAuthData();
          }
        }
      },
    }
  )
);

// Helper function to get current user ID (useful for other stores)
export const getCurrentUserId = (): string | null => {
  return useAuthStore.getState().getUserId();
};

// Helper function to check if user is logged in
export const isUserAuthenticated = (): boolean => {
  return useAuthStore.getState().isUserLoggedIn();
};

// Add the useAuth hook that HeroSection is trying to import
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    setLoading,
    clearAuthData,
    getUserDisplayName,
    isUserLoggedIn,
    getAuthToken,
    getUserId,
  } = useAuthStore();

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,

    // Actions
    login,
    logout,
    updateUser,
    setLoading,
    clearAuthData,

    // Getters (with more intuitive names)
    getDisplayName: getUserDisplayName,
    isLoggedIn: isUserLoggedIn,
    getToken: getAuthToken,
    getUserId,
  };
};
