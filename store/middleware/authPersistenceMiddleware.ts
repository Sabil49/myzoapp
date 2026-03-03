// store/middleware/authPersistenceMiddleware.ts
import { storage } from "@/services/storage";
import { createListenerMiddleware } from "@reduxjs/toolkit";
import { login, logout, updateToken } from "../slices/authSlice";

export const authPersistenceMiddleware = createListenerMiddleware();

// Persist auth data when login action is dispatched
authPersistenceMiddleware.startListening({
  actionCreator: login,
  effect: async (action) => {
    try {
      await storage.setItem("authToken", action.payload.token);
      await storage.setItem("refreshToken", action.payload.refreshToken);
      await storage.setItem("user", JSON.stringify(action.payload.user));
    } catch (error) {
      console.error("Failed to persist auth data:", error);
    }
  },
});

// Clear auth data when logout action is dispatched
authPersistenceMiddleware.startListening({
  actionCreator: logout,
  effect: async () => {
    try {
      await storage.removeItem("authToken");
      await storage.removeItem("refreshToken");
      await storage.removeItem("user");
    } catch (error) {
      console.error("Failed to clear auth data:", error);
    }
  },
});

// Persist updated token when updateToken action is dispatched
authPersistenceMiddleware.startListening({
  actionCreator: updateToken,
  effect: async (action) => {
    try {
      await storage.setItem("authToken", action.payload);
    } catch (error) {
      console.error("Failed to persist auth token:", error);
    }
  },
});
