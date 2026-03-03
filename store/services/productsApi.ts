// store/services/productsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithReauth } from "./baseQueryWithReauth";

interface AuthState {
  token: string | null;
}

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: createBaseQueryWithReauth(),
  tagTypes: ["Products", "Categories"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params?: {
        page?: number;
        limit?: number;
        categoryId?: string;
        featured?: boolean;
      }) => ({
        url: "/api/products",
        params,
      }),
      providesTags: ["Products"],
    }),
    getProduct: builder.query({
      query: (id: string) => `/api/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Products" as const, id }],
    }),
    getCategories: builder.query({
      query: () => "/api/products/categories",
      providesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
} = productsApi;
