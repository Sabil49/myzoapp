// utils/authDebug.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Utility functions for debugging auth token issues
 * Useful for troubleshooting 401 errors in development
 */

export const authDebug = {
  /**
   * Check if tokens are properly stored in AsyncStorage
   */
  async checkStoredTokens() {
    try {
      const tokens = await AsyncStorage.multiGet([
        "accessToken",
        "refreshToken",
        "user",
      ]);

      return {
        accessToken: tokens[0][1] ? "✓ Exists" : "✗ Missing",
        refreshToken: tokens[1][1] ? "✓ Exists" : "✗ Missing",
        user: tokens[2][1] ? "✓ Exists" : "✗ Missing",
        rawValues: {
          accessToken: tokens[0][1]?.substring(0, 20) + "...",
          refreshToken: tokens[1][1]?.substring(0, 20) + "...",
          user: tokens[2][1],
        },
      };
    } catch (error) {
      return { error: "Failed to check tokens", details: error };
    }
  },

  /**
   * Clear all auth tokens from AsyncStorage
   */
  async clearTokens() {
    try {
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "user",
        "persist:auth",
      ]);
      return { success: true, message: "All auth tokens cleared" };
    } catch (error) {
      return { success: false, error };
    }
  },

  /**
   * Manually set dev tokens for testing
   */
  async setDevTokens(accessToken: string, refreshToken: string) {
    try {
      await AsyncStorage.multiSet([
        ["accessToken", accessToken],
        ["refreshToken", refreshToken],
      ]);
      return { success: true, message: "Dev tokens set" };
    } catch (error) {
      return { success: false, error };
    }
  },

  /**
   * Log current AsyncStorage state (auth only)
   */
  async logAuthStorage() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const authKeys = allKeys.filter(
        (key) =>
          key.includes("auth") || key.includes("Token") || key.includes("user"),
      );

      const values = await AsyncStorage.multiGet(authKeys);
      console.log("=== Auth Storage Debug ===");
      values.forEach(([key, value]) => {
        console.log(
          `${key}: ${value ? value.substring(0, 50) + "..." : "null"}`,
        );
      });
      console.log("========================");
    } catch (error) {
      console.error("Error logging auth storage:", error);
    }
  },
};

// Optionally expose in development
if (__DEV__) {
  (global as any).authDebug = authDebug;
}
