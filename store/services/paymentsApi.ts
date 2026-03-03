// store/services/paymentsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithReauth } from "./baseQueryWithReauth";

interface AuthState {
  token: string | null;
}

// Razorpay verification payload interface
export interface RazorpayVerificationPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const paymentsApi = createApi({
  reducerPath: "paymentsApi",
  baseQuery: createBaseQueryWithReauth(),
  endpoints: (builder) => ({
    createStripeIntent: builder.mutation({
      query: (orderId: string) => ({
        url: "/api/payments/stripe/intent",
        method: "POST",
        body: { orderId },
      }),
    }),
    createRazorpayOrder: builder.mutation({
      query: (orderId: string) => ({
        url: "/api/payments/razorpay/order",
        method: "POST",
        body: { orderId },
      }),
    }),
    verifyRazorpayPayment: builder.mutation<any, RazorpayVerificationPayload>({
      query: (paymentData) => ({
        url: "/api/payments/razorpay/verify",
        method: "POST",
        body: paymentData,
      }),
    }),
  }),
});

export const {
  useCreateStripeIntentMutation,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} = paymentsApi;
