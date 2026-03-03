// services/adminApi.ts

import { API_URL } from "@/constants/config";
import { storage } from "@/services/storage";
import axios from "axios";

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
adminApi.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear admin credentials and redirect to login
      await storage.removeItem("adminToken");
      await storage.removeItem("adminRefreshToken");
      await storage.removeItem("adminUser");
      // Navigation handled in components
    }
    return Promise.reject(error);
  },
);

export default adminApi;
