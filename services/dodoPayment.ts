// services/dodoPayment.ts
import api from "./api";

export interface DodoPaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  email: string;
  phone: string;
}

export interface DodoPaymentResponse {
  success: boolean;
  transactionId: string;
  status: "completed" | "pending" | "failed";
  message: string;
}

export const dodoPaymentService = {
  // Process payment through Dodo
  async processPayment(
    paymentData: DodoPaymentRequest,
  ): Promise<DodoPaymentResponse> {
    try {
      const response = await api.post("/api/payments/dodo/process", {
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        cardNumberLast4: paymentData.cardNumber.slice(-4),
        expiryMonth: paymentData.expiryMonth,
        expiryYear: paymentData.expiryYear,
        cardholderName: paymentData.cardholderName,
        email: paymentData.email,
        phone: paymentData.phone,
      });

      return response.data;
    } catch (error: any) {
      console.error("Dodo payment error:", error);
      throw {
        success: false,
        status: "failed",
        message: error.response?.data?.error || "Payment processing failed",
      };
    }
  },

  // Validate card details format
  validateCardDetails(cardData: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName: string;
  }): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate card number (16 digits)
    if (!cardData.cardNumber.replace(/\s/g, "").match(/^\d{16}$/)) {
      errors.push("Card number must be 16 digits");
    }

    // Validate expiry month (01-12)
    if (!cardData.expiryMonth.match(/^(0[1-9]|1[0-2])$/)) {
      errors.push("Month must be 01-12");
    }

    // Validate expiry year
    if (!cardData.expiryYear.match(/^\d{2,4}$/)) {
      errors.push("Invalid year format");
    }

    // Check if card is expired
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const year =
      cardData.expiryYear.length === 2
        ? 2000 + parseInt(cardData.expiryYear)
        : parseInt(cardData.expiryYear);
    const month = parseInt(cardData.expiryMonth);

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.push("Card has expired");
    }

    // Validate CVV (3-4 digits)
    if (!cardData.cvv.match(/^\d{3,4}$/)) {
      errors.push("CVV must be 3-4 digits");
    }

    // Validate cardholder name
    if (!cardData.cardholderName.trim() || cardData.cardholderName.length < 3) {
      errors.push("Cardholder name is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Format card number with spaces
  formatCardNumber(value: string): string {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  },
};
