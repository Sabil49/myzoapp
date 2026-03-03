// app/payment/dodo.tsx
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import { paymentApi } from "@/services/payment";
import { useAppSelector } from "@/store/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function DodoPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { orderId, amount } = params as { orderId: string; amount: string };

  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [providerPaymentId, setProviderPaymentId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const accessToken = useAppSelector((state: any) => {
    const a = state?.auth;
    if (!a || typeof a !== "object") return null;
    // Support both `accessToken` and `token` fields
    return (a as any).accessToken ?? (a as any).token ?? null;
  });

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        router.replace("/auth/login");
        return;
      }

      const response = await paymentApi.initiateDodoPayment(
        {
          orderId,
          amount: parseFloat(amount),
          currency: "USD",
          returnUrl: "myzo://payment/success",
        },
        accessToken,
      );

      setPaymentUrl(response.payment.paymentUrl);
      setPaymentId(response.payment.id);
      setProviderPaymentId(response.payment.providerPaymentId);
      setLoading(false);
    } catch (err: any) {
      console.error("Payment initialization error:", err);
      setError(err.response?.data?.error || "Failed to initialize payment");
      setLoading(false);

      if (err.response?.status === 401) {
        router.replace("/auth/login");
      }
    }
  };

  const handleWebViewNavigationStateChange = async (navState: any) => {
    const { url } = navState;

    // Check for success/failure in URL
    if (url.includes("payment/success") || url.includes("status=success")) {
      await verifyPayment("success");
    } else if (
      url.includes("payment/failed") ||
      url.includes("status=failed")
    ) {
      await verifyPayment("failed");
    }
  };

  const verifyPayment = async (status: "success" | "failed") => {
    try {
      if (!paymentId || !providerPaymentId || !accessToken) {
        throw new Error("Payment information missing");
      }

      const response = await paymentApi.verifyDodoPayment(
        {
          paymentId,
          providerPaymentId,
          status,
          transactionId: `txn_${Date.now()}`,
        },
        accessToken,
      );

      if (status === "success") {
        Alert.alert("Payment Successful", "Your order has been confirmed!", [
          {
            text: "View Order",
            onPress: () => router.replace(`/orders/${orderId}`),
          },
        ]);
      } else {
        Alert.alert(
          "Payment Failed",
          "Your payment could not be processed. Please try again.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ],
        );
      }
    } catch (err: any) {
      console.error("Payment verification error:", err);
      Alert.alert("Error", "Failed to verify payment. Please contact support.");

      if (err.response?.status === 401) {
        router.replace("/auth/login");
      }
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Payment",
      "Are you sure you want to cancel this payment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.espresso[500]} />
          <Typography variant="body" style={styles.loadingText}>
            Initializing payment...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Typography variant="h3" style={styles.errorTitle}>
            Payment Error
          </Typography>
          <Typography variant="body" style={styles.errorText}>
            {error}
          </Typography>
          <Button onPress={() => router.back()} style={styles.errorButton}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h3">Complete Payment</Typography>
        <Button
          variant="ghost"
          onPress={handleCancel}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </View>

      {paymentUrl && (
        <WebView
          source={{ uri: paymentUrl }}
          style={styles.webview}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webviewLoading}>
              <ActivityIndicator size="large" color={COLORS.espresso[500]} />
            </View>
          )}
        />
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelButton: {
    paddingHorizontal: SPACING.sm,
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.text.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  errorTitle: {
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  errorText: {
    marginBottom: SPACING.xl,
    textAlign: "center",
    color: COLORS.text.muted,
  },
  errorButton: {
    minWidth: 150,
  },
});
