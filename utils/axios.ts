// utils/axios.ts
import { API_URL } from "@/constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 errors (unauthorized/token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (!refreshToken) {
          console.warn("No refresh token available, logging out");
          // No refresh token, redirect to login
          await handleLogout();
          return Promise.reject(error);
        }

        console.log("Attempting to refresh access token");
        // Try to refresh the token
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Save new tokens
        const tokensToSet: Array<[string, string]> = [
          ["accessToken", accessToken],
        ];
        if (newRefreshToken) {
          tokensToSet.push(["refreshToken", newRefreshToken]);
        }
        await AsyncStorage.multiSet(tokensToSet);

        console.log("Access token refreshed successfully");
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        // Refresh failed, logout user
        console.error("Token refresh failed:", refreshError.message);
        await handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Helper function to handle logout
async function handleLogout() {
  try {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
    console.log("User logged out and tokens cleared");

    // Redirect to login
    router.replace("/auth/login");
  } catch (error) {
    console.error("Error during logout:", error);
  }
}

export default axiosInstance;
