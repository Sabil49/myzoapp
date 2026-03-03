// store/services/ordersApi.ts
//
// RTK Query service for orders.
// Exports:
//   useGetOrdersQuery      — list all orders for the logged-in user
//   useGetOrderQuery       — fetch a single order by ID  ← was MISSING, fixed here
//   useCreateOrderMutation — create a new order

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithReauth } from "./baseQueryWithReauth";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: createBaseQueryWithReauth(),
  tagTypes: ["Order", "Orders"],
  endpoints: (builder) => ({
    // ── GET /api/orders — list user's orders ─────────────────────────────────
    getOrders: builder.query<{ orders: any[] }, void>({
      query: () => "/api/orders",
      providesTags: ["Orders"],
    }),

    // ── GET /api/orders/:id — single order detail ─────────────────────────────
    // This endpoint was missing — it caused "Failed to load order details."
    getOrder: builder.query<{ order: any }, string>({
      query: (id) => `/api/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),

    // ── POST /api/orders — create new order ───────────────────────────────────
    createOrder: builder.mutation<
      { order: any },
      {
        addressId: string;
        items: Array<{ productId: string; quantity: number }>;
        paymentMethod: string;
      }
    >({
      query: (body) => ({
        url: "/api/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const { useGetOrdersQuery, useGetOrderQuery, useCreateOrderMutation } =
  ordersApi;
