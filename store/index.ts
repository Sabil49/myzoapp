// store/index.ts

import { configureStore } from "@reduxjs/toolkit";
import { wishlistPersistenceMiddleware } from "./middleware/wishlistPersistenceMiddleware";
import { addressesApi } from "./services/addressesApi";
import { ordersApi } from "./services/ordersApi";
import { paymentsApi } from "./services/paymentsApi";
import { productsApi } from "./services/productsApi";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import ordersReducer from "./slices/ordersSlice";
import productsReducer from "./slices/productsSlice";
import wishlistReducer from "./slices/wishlistSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: ordersReducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [addressesApi.reducerPath]: addressesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      productsApi.middleware,
      ordersApi.middleware,
      paymentsApi.middleware,
      addressesApi.middleware,
      wishlistPersistenceMiddleware.middleware,
    ]),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
