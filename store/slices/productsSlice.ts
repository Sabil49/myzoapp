// store/slices/productsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  styleCode: string;
  categoryId: string;
}

interface ProductsState {
  featured: Product[];
  byCategory: Record<string, Product[]>;
  selectedProduct: Product | null;
}

const initialState: ProductsState = {
  featured: [],
  byCategory: {},
  selectedProduct: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFeaturedProducts: (state, action: PayloadAction<Product[]>) => {
      state.featured = action.payload;
    },
    setProductsByCategory: (
      state,
      action: PayloadAction<{ categoryId: string; products: Product[] }>,
    ) => {
      state.byCategory[action.payload.categoryId] = action.payload.products;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
  },
});

export const {
  setFeaturedProducts,
  setProductsByCategory,
  setSelectedProduct,
} = productsSlice.actions;

export default productsSlice.reducer;
