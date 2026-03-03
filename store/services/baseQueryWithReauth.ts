import { API_URL } from "@/constants/config";
import type { RootState } from "@/store";
import { logout, updateToken } from "@/store/slices/authSlice";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { router } from "expo-router";

// Factory that returns a baseQuery function which automatically retries
// once after refreshing an expired access token.  If refreshing fails
// or no refresh token exists the user is logged out and redirected to
// the login screen.
export function createBaseQueryWithReauth() {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token =
        state.auth?.token ?? (state.auth as any)?.accessToken ?? null;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  });

  return async (args: any, api: any, extraOptions: any) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      // unauthorized – try refreshing token if we have one
      const refreshToken = (api.getState() as RootState).auth.refreshToken;
      if (refreshToken) {
        const refreshResult = await rawBaseQuery(
          {
            url: "/api/auth/refresh",
            method: "POST",
            body: { refreshToken },
          },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          const newToken = (refreshResult.data as any).accessToken;
          api.dispatch(updateToken(newToken));
          // retry original query with new token
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
          router.replace("/auth/login");
        }
      } else {
        api.dispatch(logout());
        router.replace("/auth/login");
      }
    }

    return result;
  };
}
