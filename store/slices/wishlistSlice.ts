// store/slices/wishlistSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WishlistState {
  items: string[]; // Product IDs
  synced: boolean;
}

const initialState: WishlistState = {
  items: [],
  synced: false,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
      state.synced = true;
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const index = state.items.indexOf(action.payload);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
      state.synced = false;
    },
    clearWishlist: (state) => {
      state.items = [];
      state.synced = false;
    },
    markSynced: (state) => {
      state.synced = true;
    },
  },
});

export const { setWishlist, toggleWishlist, clearWishlist, markSynced } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
