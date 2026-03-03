// services/api.ts

import { API_URL } from "@/constants/config";
import { storage } from "@/services/storage";
import axios from "axios";
import { router } from "expo-router";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem("authToken");
    console.log("API Request Interceptor - Token exists:", !!token);
    if (token) {
      console.log(
        "API Request Interceptor - Adding token to request:",
        config.url,
      );
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log(
        "API Request Interceptor - No token found for request:",
        config.url,
      );
    }
    return config;
  },
  (error) => {
    console.error("API Request Interceptor - Error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log("API Response Success:", response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error(
      "API Response Error:",
      error.config?.url,
      error.response?.status,
    );

    const originalRequest = error.config;

    // Don't attempt token refresh for auth endpoints
    const isAuthEndpoint = originalRequest?.url?.includes("/api/auth/");

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint
    ) {
      console.log("401 Error - Attempting token refresh");

      if (isRefreshing) {
        console.log("Token refresh already in progress, queuing request");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getItem("refreshToken");
        console.log("Refresh token exists:", !!refreshToken);

        if (!refreshToken) {
          console.log(
            "No refresh token available, clearing auth and rejecting",
          );
          // Clear all auth data immediately and update app state
          await storage.removeItem("authToken");
          await storage.removeItem("refreshToken");
          await storage.removeItem("user");
          try {
            // Lazy import to avoid circular dependency
            const { store } = await import("@/store");
            const { logout } = await import("@/store/slices/authSlice");
            store.dispatch(logout());
          } catch (e) {
            console.error("Failed to dispatch logout:", e);
          }
          try {
            router.replace("/auth/login");
          } catch (e) {
            console.warn("Router replace to login failed:", e);
          }

          const error = new Error("Session expired. Please log in again.");
          processQueue(error, null);
          return Promise.reject(error);
        }

        console.log("Calling refresh token endpoint");
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        console.log("New access token received");

        await storage.setItem("authToken", accessToken);
        await storage.setItem("accessToken", accessToken);

        // Update Redux state with new token
        try {
          const { store } = await import("@/store");
          const { updateToken } = await import("@/store/slices/authSlice");
          store.dispatch(updateToken(accessToken));
        } catch (e) {
          console.error("Failed to update token in Redux:", e);
        }

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Clear all auth data and force logout
        console.log("Clearing auth data due to refresh failure");
        await storage.removeItem("authToken");
        await storage.removeItem("refreshToken");
        await storage.removeItem("user");
        try {
          // Lazy import to avoid circular dependency
          const { store } = await import("@/store");
          const { logout } = await import("@/store/slices/authSlice");
          store.dispatch(logout());
        } catch (e) {
          console.error("Failed to dispatch logout:", e);
        }
        try {
          router.replace("/auth/login");
        } catch (e) {
          console.warn("Router replace to login failed:", e);
        }

        const error = new Error("Session expired. Please log in again.");
        processQueue(error, null);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
