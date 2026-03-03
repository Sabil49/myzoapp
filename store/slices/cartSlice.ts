// src/store/slices/cartSlice.ts
import { API_URL } from "@/constants/config";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  productId: string;
  quantity: number;
  product: {
    stock: undefined;
    id: string;
    name: string;
    price: number;
    images: string[];
    styleCode: string;
  };
}

interface CartState {
  items: CartItem[];
  synced: boolean;
  syncError: string | null;
}

const initialState: CartState = {
  items: [],
  synced: false,
  syncError: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.synced = true;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId,
      );

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter(
          (item) => item.productId !== action.payload.productId,
        );
        state.synced = false;
        return;
      }
      const item = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (item) {
        item.quantity = action.payload.quantity;
        state.synced = false;
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload,
      );
      state.synced = false;
    },
    clearCart: (state) => {
      state.items = [];
      state.synced = false;
    },
    markSynced: (state) => {
      state.synced = true;
      state.syncError = null;
    },
    markSyncFailed: (state, action: PayloadAction<string>) => {
      state.synced = false;
      state.syncError = action.payload;
    },
    clearSyncError: (state) => {
      state.syncError = null;
    },
  },
});

export const {
  setCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  markSynced,
  markSyncFailed,
  clearSyncError,
} = cartSlice.actions;

// Thunk for syncing cart with backend
export const syncCart = () => async (dispatch: any, getState: any) => {
  const { cart, auth } = getState();

  if (!auth.token || cart.synced) return;

  try {
    // Sync with backend
    const response = await fetch(`${API_URL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ items: cart.items }),
    });

    if (response.ok) {
      dispatch(markSynced());
    } else {
      // Handle non-ok HTTP responses
      let errorMessage = `Cart sync failed with status ${response.status}`;

      try {
        // Read response body once as text
        const bodyText = await response.text();

        // Try to parse as JSON
        try {
          const errorData = JSON.parse(bodyText);
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error("Cart sync error response:", {
            status: response.status,
            statusText: response.statusText,
            body: errorData,
          });
        } catch (parseError) {
          // If JSON parse fails, use raw text
          console.error("Cart sync error response (text):", {
            status: response.status,
            statusText: response.statusText,
            body: bodyText,
          });
        }
      } catch (readError) {
        // If body reading fails, log without body
        console.error("Cart sync error response:", {
          status: response.status,
          statusText: response.statusText,
        });
      }

      dispatch(markSyncFailed(errorMessage));
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred during cart sync";
    console.error("Cart sync network error:", {
      error,
      message: errorMessage,
    });
    dispatch(markSyncFailed(errorMessage));
  }
};

export default cartSlice.reducer;
