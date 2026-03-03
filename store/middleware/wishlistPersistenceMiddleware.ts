// store/middleware/wishlistPersistenceMiddleware.ts

import { storage } from "@/services/storage";
import { createListenerMiddleware } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import { clearWishlist, toggleWishlist } from "../slices/wishlistSlice";

// Create the middleware instance
export const wishlistPersistenceMiddleware = createListenerMiddleware();

// Persist wishlist when toggleWishlist action is dispatched
wishlistPersistenceMiddleware.startListening({
  actionCreator: toggleWishlist,
  effect: async (action, listenerApi) => {
    try {
      const state = listenerApi.getState() as RootState;
      await storage.setItem("wishlist", JSON.stringify(state.wishlist.items));
    } catch (error) {
      console.error("Failed to persist wishlist:", error);
    }
  },
});

// Clear wishlist from storage when clearWishlist action is dispatched
wishlistPersistenceMiddleware.startListening({
  actionCreator: clearWishlist,
  effect: async () => {
    try {
      await storage.removeItem("wishlist");
    } catch (error) {
      console.error("Failed to clear wishlist from storage:", error);
    }
  },
});
