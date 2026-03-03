// store/services/addressesApi.ts
import type { Address } from "@/types/order";
import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithReauth } from "./baseQueryWithReauth";

interface AuthState {
  token: string | null;
}

export const addressesApi = createApi({
  reducerPath: "addressesApi",
  baseQuery: createBaseQueryWithReauth(),
  tagTypes: ["Addresses"],
  endpoints: (builder) => ({
    getAddresses: builder.query<Address[], void>({
      query: () => "/api/addresses",
      transformResponse: (response: { addresses: Address[] }) =>
        response.addresses,
      providesTags: ["Addresses"],
    }),
    createAddress: builder.mutation({
      query: (addressData: any) => ({
        url: "/api/addresses",
        method: "POST",
        body: addressData,
      }),
      invalidatesTags: ["Addresses"],
    }),
    updateAddress: builder.mutation({
      query: ({ id, ...data }: any) => ({
        url: `/api/addresses/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Addresses"],
    }),
    deleteAddress: builder.mutation({
      query: (id: string) => ({
        url: `/api/addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Addresses"],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressesApi;
