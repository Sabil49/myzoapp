// store/slices/authSlice.ts

import { registerPendingPushToken } from "@/services/firebase";
import { storage } from "@/services/storage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "CUSTOMER";
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
      }>,
    ) => {
      console.log("Auth slice - login action:", action.payload.user);
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;

      // Persist to storage
      storage.setItem("authToken", action.payload.token);
      // Also store under accessToken for other axios instances
      storage.setItem("accessToken", action.payload.token);
      storage.setItem("refreshToken", action.payload.refreshToken);
      storage.setItem("user", JSON.stringify(action.payload.user));

      // Register push token after login (only for customers)
      if (action.payload.user.role === "CUSTOMER") {
        registerPendingPushToken().catch((error) => {
          console.error("Failed to register push token:", error);
        });
      }
    },
    logout: (state) => {
      console.log("Auth slice - logout action");
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;

      // Clear storage
      storage.removeItem("authToken");
      storage.removeItem("accessToken");
      storage.removeItem("refreshToken");
      storage.removeItem("user");
    },
    updateToken: (state, action: PayloadAction<string>) => {
      console.log("Auth slice - updateToken action");
      state.token = action.payload;
      storage.setItem("authToken", action.payload);
      storage.setItem("accessToken", action.payload);
    },
    restoreAuth: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
      }>,
    ) => {
      console.log("Auth slice - restoreAuth action:", action.payload.user);
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;

      // Register push token on app restore (only for customers)
      // Persist tokens under both keys for compatibility
      storage.setItem("authToken", action.payload.token);
      storage.setItem("accessToken", action.payload.token);
      storage.setItem("refreshToken", action.payload.refreshToken);
      if (action.payload.user.role === "CUSTOMER") {
        registerPendingPushToken().catch((error) => {
          console.error("Failed to register push token:", error);
        });
      }
    },
  },
});

export const { login, logout, updateToken, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
