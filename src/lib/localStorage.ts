// lib/localStorage.ts
export interface StorageData {
  [key: string]: any;
}

export interface UserStorageKeys {
  cart: string;
  orders: string;
  favorites: string;
  addresses: string;
  preferences: string;
}

export interface GuestStorageKeys {
  cart: string;
  orders: string;
  favorites: string;
  addresses: string;
}

export interface StorageUsage {
  totalSize: number;
  keyCount: number;
  keys: string[];
  sizeByKey: Record<string, number>;
}

class UserStorageUtils {
  private readonly GUEST_KEYS: GuestStorageKeys = {
    cart: "cart-storage-guest",
    orders: "orders-storage-guest",
    favorites: "favorites-storage-guest",
    addresses: "addresses-storage-guest",
  };

  private readonly USER_KEY_PATTERNS = {
    cart: (userId: string) => `cart-storage-${userId}`,
    orders: (userId: string) => `orders-storage-${userId}`,
    favorites: (userId: string) => `favorites-storage-${userId}`,
    addresses: (userId: string) => `addresses-storage-${userId}`,
    preferences: (userId: string) => `preferences-storage-${userId}`,
  };

  // Get storage keys for a specific user
  getUserStorageKeys(
    userId: string | null
  ): UserStorageKeys | GuestStorageKeys {
    if (!userId) {
      return this.GUEST_KEYS;
    }

    return {
      cart: this.USER_KEY_PATTERNS.cart(userId),
      orders: this.USER_KEY_PATTERNS.orders(userId),
      favorites: this.USER_KEY_PATTERNS.favorites(userId),
      addresses: this.USER_KEY_PATTERNS.addresses(userId),
      preferences: this.USER_KEY_PATTERNS.preferences(userId),
    };
  }

  // Check if localStorage is available
  private isLocalStorageAvailable(): boolean {
    try {
      return typeof window !== "undefined" && window.localStorage !== null;
    } catch {
      return false;
    }
  }

  // Get all localStorage keys that belong to a user
  private getAllUserKeys(userId: string | null): string[] {
    if (!this.isLocalStorageAvailable()) return [];

    try {
      const allKeys = Object.keys(localStorage);

      if (!userId) {
        // Return guest keys
        return allKeys.filter((key) =>
          Object.values(this.GUEST_KEYS).includes(key)
        );
      }

      // Return user-specific keys
      return allKeys.filter(
        (key) => key.includes(`-${userId}`) || key.startsWith(`${userId}-`)
      );
    } catch (error) {
      console.error("Error getting user keys:", error);
      return [];
    }
  }

  // Get storage usage for a user
  getUserStorageUsage(userId: string | null): StorageUsage {
    if (!this.isLocalStorageAvailable()) {
      return { totalSize: 0, keyCount: 0, keys: [], sizeByKey: {} };
    }

    try {
      const userKeys = this.getAllUserKeys(userId);
      const sizeByKey: Record<string, number> = {};
      let totalSize = 0;

      userKeys.forEach((key) => {
        try {
          const value = localStorage.getItem(key);
          const size = value ? new Blob([value]).size : 0;
          sizeByKey[key] = size;
          totalSize += size;
        } catch (error) {
          console.error(`Error calculating size for key ${key}:`, error);
          sizeByKey[key] = 0;
        }
      });

      return {
        totalSize,
        keyCount: userKeys.length,
        keys: userKeys,
        sizeByKey,
      };
    } catch (error) {
      console.error("Error calculating storage usage:", error);
      return { totalSize: 0, keyCount: 0, keys: [], sizeByKey: {} };
    }
  }

  // Clear all data for a specific user
  clearUserData(userId: string | null): boolean {
    if (!this.isLocalStorageAvailable()) return false;

    try {
      const userKeys = this.getAllUserKeys(userId);
      let clearedCount = 0;

      userKeys.forEach((key) => {
        try {
          localStorage.removeItem(key);
          clearedCount++;
        } catch (error) {
          console.error(`Error removing key ${key}:`, error);
        }
      });

      console.log(
        `Cleared ${clearedCount} keys for user: ${userId || "guest"}`
      );
      return clearedCount > 0;
    } catch (error) {
      console.error("Error clearing user data:", error);
      return false;
    }
  }

  // Transfer guest data to user account
  transferGuestDataToUser(userId: string): boolean {
    if (!this.isLocalStorageAvailable() || !userId) return false;

    try {
      const guestKeys = this.GUEST_KEYS;
      const userKeys = this.getUserStorageKeys(userId) as UserStorageKeys;
      let transferredCount = 0;

      // Transfer cart data
      const guestCartData = localStorage.getItem(guestKeys.cart);
      if (guestCartData) {
        localStorage.setItem(userKeys.cart, guestCartData);
        localStorage.removeItem(guestKeys.cart);
        transferredCount++;
      }

      // Transfer orders data
      const guestOrdersData = localStorage.getItem(guestKeys.orders);
      if (guestOrdersData) {
        try {
          const orders = JSON.parse(guestOrdersData);
          // Update userId in orders
          if (orders.state?.orders) {
            orders.state.orders = orders.state.orders.map((order: any) => ({
              ...order,
              userId: userId,
            }));
          }
          localStorage.setItem(userKeys.orders, JSON.stringify(orders));
          localStorage.removeItem(guestKeys.orders);
          transferredCount++;
        } catch (error) {
          console.error("Error transferring orders data:", error);
        }
      }

      // Transfer favorites data
      const guestFavoritesData = localStorage.getItem(guestKeys.favorites);
      if (guestFavoritesData) {
        localStorage.setItem(userKeys.favorites, guestFavoritesData);
        localStorage.removeItem(guestKeys.favorites);
        transferredCount++;
      }

      // Transfer addresses data
      const guestAddressesData = localStorage.getItem(guestKeys.addresses);
      if (guestAddressesData) {
        localStorage.setItem(userKeys.addresses, guestAddressesData);
        localStorage.removeItem(guestKeys.addresses);
        transferredCount++;
      }

      console.log(
        `Transferred ${transferredCount} data sets from guest to user: ${userId}`
      );
      return transferredCount > 0;
    } catch (error) {
      console.error("Error transferring guest data:", error);
      return false;
    }
  }

  // Backup user data
  backupUserData(userId: string | null): StorageData | null {
    if (!this.isLocalStorageAvailable()) return null;

    try {
      const userKeys = this.getAllUserKeys(userId);
      const backup: StorageData = {};

      userKeys.forEach((key) => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            backup[key] = JSON.parse(value);
          }
        } catch (error) {
          console.error(`Error backing up key ${key}:`, error);
          // Store as string if JSON parsing fails
          backup[key] = localStorage.getItem(key);
        }
      });

      return Object.keys(backup).length > 0 ? backup : null;
    } catch (error) {
      console.error("Error creating backup:", error);
      return null;
    }
  }

  // Restore user data from backup
  restoreUserData(userId: string | null, backup: StorageData): boolean {
    if (!this.isLocalStorageAvailable() || !backup) return false;

    try {
      let restoredCount = 0;

      Object.entries(backup).forEach(([key, value]) => {
        try {
          const serializedValue =
            typeof value === "string" ? value : JSON.stringify(value);
          localStorage.setItem(key, serializedValue);
          restoredCount++;
        } catch (error) {
          console.error(`Error restoring key ${key}:`, error);
        }
      });

      console.log(
        `Restored ${restoredCount} keys for user: ${userId || "guest"}`
      );
      return restoredCount > 0;
    } catch (error) {
      console.error("Error restoring user data:", error);
      return false;
    }
  }

  // Check if user has any stored data
  hasUserData(userId: string | null): boolean {
    if (!this.isLocalStorageAvailable()) return false;
    return this.getAllUserKeys(userId).length > 0;
  }

  // Get specific data for a user
  getUserData(userId: string | null, dataType: keyof UserStorageKeys): any {
    if (!this.isLocalStorageAvailable()) return null;

    try {
      const keys = this.getUserStorageKeys(userId);
      const key = keys[dataType];
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting ${dataType} data:`, error);
      return null;
    }
  }

  // Set specific data for a user
  setUserData(
    userId: string | null,
    dataType: keyof UserStorageKeys,
    data: any
  ): boolean {
    if (!this.isLocalStorageAvailable()) return false;

    try {
      const keys = this.getUserStorageKeys(userId);
      const key = keys[dataType];
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error setting ${dataType} data:`, error);
      return false;
    }
  }

  // Clean up old or invalid data
  cleanupStorage(): number {
    if (!this.isLocalStorageAvailable()) return 0;

    try {
      const allKeys = Object.keys(localStorage);
      let cleanedCount = 0;

      allKeys.forEach((key) => {
        try {
          const data = localStorage.getItem(key);
          if (!data) {
            localStorage.removeItem(key);
            cleanedCount++;
            return;
          }

          // Try to parse and validate the data
          JSON.parse(data);
        } catch (error) {
          // If data is corrupted, remove it
          console.warn(`Removing corrupted localStorage key: ${key}`);
          localStorage.removeItem(key);
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} invalid localStorage entries`);
      }

      return cleanedCount;
    } catch (error) {
      console.error("Error during storage cleanup:", error);
      return 0;
    }
  }

  // Get storage quota information
  getStorageQuota(): Promise<{ used: number; total: number } | null> {
    return new Promise((resolve) => {
      if (!this.isLocalStorageAvailable()) {
        resolve(null);
        return;
      }

      if ("storage" in navigator && "estimate" in navigator.storage) {
        navigator.storage
          .estimate()
          .then((estimate) => {
            resolve({
              used: estimate.usage || 0,
              total: estimate.quota || 0,
            });
          })
          .catch(() => {
            resolve(null);
          });
      } else {
        resolve(null);
      }
    });
  }
}

// Export singleton instance
export const userStorageUtils = new UserStorageUtils();

// Export utility functions for convenience
export const {
  getUserStorageKeys,
  getUserStorageUsage,
  clearUserData,
  transferGuestDataToUser,
  backupUserData,
  restoreUserData,
  hasUserData,
  getUserData,
  setUserData,
  cleanupStorage,
  getStorageQuota,
} = userStorageUtils;
