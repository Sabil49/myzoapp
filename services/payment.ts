// services/payment.ts
import { API_URL } from "@/constants/config";
import axios from "axios";

export interface DodoPaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  returnUrl?: string;
}

export interface DodoPaymentResponse {
  payment: {
    id: string;
    paymentUrl: string;
    providerPaymentId: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export interface DodoPaymentVerification {
  paymentId: string;
  providerPaymentId: string;
  status: "success" | "failed";
  transactionId?: string;
}

export interface DodoPaymentVerificationResponse {
  payment: {
    id: string;
    status: string;
    orderId: string;
  };
  message: string;
}

export const paymentApi = {
  initiateDodoPayment: async (
    data: DodoPaymentRequest,
    token: string,
  ): Promise<DodoPaymentResponse> => {
    const response = await axios.post(`${API_URL}/api/payment/dodo`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  verifyDodoPayment: async (
    data: DodoPaymentVerification,
    token: string,
  ): Promise<DodoPaymentVerificationResponse> => {
    const response = await axios.post(
      `${API_URL}/api/payment/dodo/verify`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  },
};
