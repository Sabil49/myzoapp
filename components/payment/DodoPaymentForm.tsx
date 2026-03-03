// components/payment/DodoPaymentForm.tsx
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import { dodoPaymentService } from "@/services/dodoPayment";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface DodoPaymentFormProps {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

export const DodoPaymentForm: React.FC<DodoPaymentFormProps> = ({
  orderId,
  amount,
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleCardNumberChange = (value: string) => {
    const formatted = dodoPaymentService.formatCardNumber(value);
    setFormData({ ...formData, cardNumber: formatted });
    if (errors.cardNumber) {
      setErrors({ ...errors, cardNumber: "" });
    }
  };

  const handleExpiryChange = (value: string, field: "month" | "year") => {
    if (field === "month") {
      const numValue = value.slice(-2);
      setFormData({ ...formData, expiryMonth: numValue });
    } else {
      const numValue = value.slice(-2);
      setFormData({ ...formData, expiryYear: numValue });
    }
  };

  const handleCVVChange = (value: string) => {
    const numValue = value.replace(/\D/g, "").slice(0, 4);
    setFormData({ ...formData, cvv: numValue });
  };

  const handleSubmit = async () => {
    // Validate form
    const validation = dodoPaymentService.validateCardDetails(formData);
    if (!validation.valid) {
      const newErrors: { [key: string]: string } = {};
      validation.errors.forEach((error) => {
        if (error.includes("Card number")) newErrors.cardNumber = error;
        if (error.includes("Month")) newErrors.expiryMonth = error;
        if (error.includes("year")) newErrors.expiryYear = error;
        if (error.includes("CVV")) newErrors.cvv = error;
        if (error.includes("Cardholder")) newErrors.cardholderName = error;
        if (error.includes("expired")) newErrors.expiry = error;
      });
      setErrors(newErrors);
      onError("Please correct the errors below");
      return;
    }

    try {
      const response = await dodoPaymentService.processPayment({
        orderId,
        amount,
        currency: "USD",
        cardNumber: formData.cardNumber.replace(/\s/g, ""),
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cvv: formData.cvv,
        cardholderName: formData.cardholderName,
        email: customerEmail,
        phone: customerPhone,
      });

      if (response.success) {
        onSuccess(response.transactionId);
      } else {
        onError(response.message || "Payment failed");
      }
    } catch (error: any) {
      onError(error.message || "Payment processing failed");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Typography variant="h3" style={styles.title}>
        Card Details
      </Typography>

      <View style={styles.formGroup}>
        <Typography variant="label" style={styles.label}>
          Cardholder Name
        </Typography>
        <Input
          placeholder="John Doe"
          value={formData.cardholderName}
          onChangeText={(text) => {
            setFormData({ ...formData, cardholderName: text });
            if (errors.cardholderName) {
              setErrors({ ...errors, cardholderName: "" });
            }
          }}
          editable={!loading}
        />
        {errors.cardholderName && (
          <Typography
            variant="caption"
            color={COLORS.error}
            style={styles.error}
          >
            {errors.cardholderName}
          </Typography>
        )}
      </View>

      <View style={styles.formGroup}>
        <Typography variant="label" style={styles.label}>
          Card Number
        </Typography>
        <Input
          placeholder="1234 5678 9012 3456"
          value={formData.cardNumber}
          onChangeText={handleCardNumberChange}
          keyboardType="numeric"
          maxLength={19}
          editable={!loading}
        />
        {errors.cardNumber && (
          <Typography
            variant="caption"
            color={COLORS.error}
            style={styles.error}
          >
            {errors.cardNumber}
          </Typography>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, styles.flex1]}>
          <Typography variant="label" style={styles.label}>
            Month
          </Typography>
          <Input
            placeholder="MM"
            value={formData.expiryMonth}
            onChangeText={(text) => handleExpiryChange(text, "month")}
            keyboardType="numeric"
            maxLength={2}
            editable={!loading}
          />
          {errors.expiryMonth && (
            <Typography
              variant="caption"
              color={COLORS.error}
              style={styles.error}
            >
              {errors.expiryMonth}
            </Typography>
          )}
        </View>

        <View style={[styles.formGroup, styles.flex1, styles.marginLeft]}>
          <Typography variant="label" style={styles.label}>
            Year
          </Typography>
          <Input
            placeholder="YY"
            value={formData.expiryYear}
            onChangeText={(text) => handleExpiryChange(text, "year")}
            keyboardType="numeric"
            maxLength={2}
            editable={!loading}
          />
          {errors.expiryYear && (
            <Typography
              variant="caption"
              color={COLORS.error}
              style={styles.error}
            >
              {errors.expiryYear}
            </Typography>
          )}
        </View>

        <View style={[styles.formGroup, styles.flex1, styles.marginLeft]}>
          <Typography variant="label" style={styles.label}>
            CVV
          </Typography>
          <Input
            placeholder="123"
            value={formData.cvv}
            onChangeText={handleCVVChange}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            editable={!loading}
          />
          {errors.cvv && (
            <Typography
              variant="caption"
              color={COLORS.error}
              style={styles.error}
            >
              {errors.cvv}
            </Typography>
          )}
        </View>
      </View>

      {errors.expiry && (
        <Typography variant="caption" color={COLORS.error} style={styles.error}>
          {errors.expiry}
        </Typography>
      )}

      <View style={styles.amountSection}>
        <Typography variant="label" color={COLORS.text.muted}>
          Total Amount
        </Typography>
        <Typography variant="h2" color={COLORS.espresso[500]}>
          ${amount.toFixed(2)}
        </Typography>
      </View>

      <Button
        onPress={handleSubmit}
        disabled={loading}
        style={styles.submitButton}
      >
        {loading ? "Processing..." : "Pay Now"}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },

  title: {
    marginBottom: SPACING.lg,
    color: COLORS.espresso[500],
  },

  formGroup: {
    marginBottom: SPACING.lg,
  },

  label: {
    marginBottom: SPACING.sm,
    color: COLORS.text.secondary,
  },

  error: {
    marginTop: SPACING.xs,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  flex1: {
    flex: 1,
  },

  marginLeft: {
    marginLeft: SPACING.md,
  },

  amountSection: {
    marginVertical: SPACING.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.cream[100],
    borderRadius: 8,
  },

  submitButton: {
    marginBottom: SPACING.lg,
  },
});
