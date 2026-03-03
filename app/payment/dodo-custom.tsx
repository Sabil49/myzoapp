// app/payment/dodo-custom.tsx
import { DodoPaymentForm } from "@/components/payment/DodoPaymentForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import { useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PaymentStatus = "ready" | "processing" | "success" | "error";

interface PaymentState {
  status: PaymentStatus;
  transactionId?: string;
  errorMessage?: string;
}

export default function DodoCustomPayment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [paymentState, setPaymentState] = useState<PaymentState>({
    status: "ready",
  });

  const orderId = params.orderId as string;
  const amount = params.amount ? parseFloat(params.amount as string) : 0;

  const user = useAppSelector((state) =>
    typeof state.auth === "object" &&
    state.auth !== null &&
    "user" in state.auth
      ? (state.auth as any).user
      : null,
  );

  const handlePaymentSuccess = (transactionId: string) => {
    setPaymentState({
      status: "success",
      transactionId,
    });

    setTimeout(() => {
      router.replace({
        pathname: "/checkout/success",
        params: { transactionId, orderId },
      });
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setPaymentState({
      status: "error",
      errorMessage: error,
    });
  };

  const handleRetry = () => {
    setPaymentState({ status: "ready" });
  };

  const handleProcessing = () => {
    setPaymentState({ status: "processing" });
  };

  if (!orderId || !amount) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Typography variant="h3">Payment</Typography>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle"
            size={48}
            color={COLORS.error}
            style={styles.errorIcon}
          />
          <Typography variant="h3" color={COLORS.error}>
            Invalid Order
          </Typography>
          <Typography variant="body" color={COLORS.text.muted}>
            Order information is missing
          </Typography>
          <Button onPress={() => router.back()} style={styles.button}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Typography variant="h3">Payment</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {paymentState.status === "ready" && (
          <>
            <Card style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Typography variant="body" color={COLORS.text.muted}>
                  Order ID
                </Typography>
                <Typography variant="body" style={styles.summaryValue}>
                  {orderId}
                </Typography>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowBorder]}>
                <Typography variant="h3">Total Amount</Typography>
                <Typography variant="h3" color={COLORS.espresso[500]}>
                  ${amount.toFixed(2)}
                </Typography>
              </View>
            </Card>

            {paymentState.status === "ready" && (
              <Card style={styles.paymentSection}>
                <DodoPaymentForm
                  orderId={orderId}
                  amount={amount}
                  customerEmail={user?.email || ""}
                  customerPhone={user?.phone || ""}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Card>
            )}

            <View style={styles.securityInfo}>
              <Ionicons
                name="lock-closed"
                size={16}
                color={COLORS.text.muted}
                style={styles.securityIcon}
              />
              <Typography variant="caption" color={COLORS.text.muted}>
                Your payment information is secure and encrypted
              </Typography>
            </View>
          </>
        )}

        {paymentState.status === "processing" && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.espresso[500]} />
            <Typography
              variant="h3"
              style={styles.processingText}
              color={COLORS.espresso[500]}
            >
              Processing Payment...
            </Typography>
          </View>
        )}

        {paymentState.status === "success" && (
          <View style={styles.centerContainer}>
            <View style={styles.successIcon}>
              <Ionicons
                name="checkmark-circle"
                size={64}
                color={COLORS.cream[100]}
              />
            </View>
            <Typography variant="h2" style={styles.successText}>
              Payment Successful
            </Typography>
            <Typography
              variant="body"
              color={COLORS.text.muted}
              style={styles.transactionId}
            >
              Transaction ID: {paymentState.transactionId}
            </Typography>
            <Typography variant="caption" color={COLORS.text.muted}>
              Redirecting to confirmation...
            </Typography>
          </View>
        )}

        {paymentState.status === "error" && (
          <View style={styles.centerContainer}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="close-circle" size={64} color={COLORS.error} />
            </View>
            <Typography
              variant="h2"
              color={COLORS.error}
              style={styles.errorText}
            >
              Payment Failed
            </Typography>
            <Card
              style={StyleSheet.flatten([
                styles.errorMessageCard,
                { borderLeftColor: COLORS.error, borderLeftWidth: 4 } as const,
              ])}
            >
              <Typography variant="body">
                {paymentState.errorMessage}
              </Typography>
            </Card>
            <Button onPress={handleRetry} style={styles.retryButton}>
              Try Again
            </Button>
            <Button
              variant="secondary"
              onPress={() => router.back()}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.espresso[100],
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    padding: SPACING.lg,
  },

  orderSummary: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.md,
  },

  summaryRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.espresso[100],
  },

  summaryValue: {
    fontWeight: "600",
  },

  paymentSection: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },

  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },

  securityIcon: {
    marginRight: SPACING.sm,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },

  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  successText: {
    marginBottom: SPACING.md,
    color: COLORS.espresso[500],
  },

  transactionId: {
    marginBottom: SPACING.lg,
  },

  processingText: {
    marginTop: SPACING.lg,
  },

  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.error}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  errorText: {
    marginBottom: SPACING.lg,
  },

  errorMessageCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: `${COLORS.error}10`,
  },

  retryButton: {
    marginBottom: SPACING.md,
  },

  cancelButton: {
    marginBottom: SPACING.lg,
  },

  button: {
    marginTop: SPACING.lg,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },

  errorIcon: {
    marginBottom: SPACING.lg,
  },
});
