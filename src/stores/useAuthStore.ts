// useAuthStore.ts - Updated to match LoginModal implementation
import { create } from "zustand";
import { persist } from "zustand/middleware";

// User interface matching exactly what LoginModal uses
export interface User {
  id: string;
  first_name: string;
  last_name: string;
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

  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;

  // Getters
  getUserDisplayName: () => string;
  getUserFullName: () => string;
  isUserLoggedIn: () => boolean;
  getAuthToken: () => string | null;
  getUserId: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

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
          isLoading: false,
        });

        // console.log(
        //   `✅ User logged in: ${user.id} - ${user.first_name} ${user.last_name}`
        // );
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // console.log("🚪 User logged out");
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            ...userData,
          };

          set({ user: updatedUser });
          // console.log(`📝 User updated: ${updatedUser.id}`);
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Getters - matching the combineName logic from LoginModal
      getUserDisplayName: () => {
        const user = get().user;
        if (!user) return "مستخدم";

        // Return first name for display
        return user.first_name || "مستخدم";
      },

      getUserFullName: () => {
        const user = get().user;
        if (!user) return "مستخدم";

        // Use the same combineName logic as LoginModal
        const fullName = `${user.first_name || ""} ${
          user.last_name || ""
        }`.trim();
        return fullName || "مستخدم";
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
      // Only persist essential data matching LoginModal usage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper functions for external use (matching LoginModal patterns)
export const getCurrentUserId = (): string | null => {
  return useAuthStore.getState().getUserId();
};

export const isUserAuthenticated = (): boolean => {
  return useAuthStore.getState().isUserLoggedIn();
};

export const getUserDisplayName = (): string => {
  return useAuthStore.getState().getUserDisplayName();
};

export const getUserFullName = (): string => {
  return useAuthStore.getState().getUserFullName();
};
