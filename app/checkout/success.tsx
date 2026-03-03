// app/checkout/success.tsx
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import { useGetOrderQuery } from "@/store/services/ordersApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutSuccessScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const {
    data: orderData,
    isLoading,
    error,
  } = useGetOrderQuery(orderId as string, {
    skip: !orderId,
  });

  useEffect(() => {
    console.log("Success screen loaded with orderId:", orderId);
  }, [orderId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.espresso[500]} />
          <Typography variant="body" style={styles.loadingText}>
            Loading order details...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !orderData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="close-circle" size={80} color={COLORS.error} />
          <Typography variant="h2" style={styles.title}>
            Order Not Found
          </Typography>
          <Button
            onPress={() => router.push("/(tabs)" as any)}
            style={styles.button}
          >
            Return to Home
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const order = orderData.order;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color={COLORS.success} />
        </View>

        <Typography variant="h1" style={styles.title}>
          Payment Successful!
        </Typography>

        <Typography variant="body" style={styles.subtitle}>
          Your order has been confirmed
        </Typography>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Typography variant="caption" color={COLORS.text.muted}>
              Order Number
            </Typography>
            <Typography variant="body" style={styles.detailValue}>
              {order.orderNumber}
            </Typography>
          </View>

          <View style={styles.detailRow}>
            <Typography variant="caption" color={COLORS.text.muted}>
              Total Amount
            </Typography>
            <Typography variant="h3" color={COLORS.espresso[500]}>
              {order.totalAmount !== undefined
                ? `$${order.totalAmount.toFixed(2)}`
                : "$0.00"}
            </Typography>
          </View>

          <View style={styles.detailRow}>
            <Typography variant="caption" color={COLORS.text.muted}>
              Payment Status
            </Typography>
            <View style={styles.statusBadge}>
              <Typography variant="caption" style={styles.statusText}>
                {order.paymentStatus}
              </Typography>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle"
            size={24}
            color={COLORS.espresso[500]}
          />
          <Typography variant="caption" style={styles.infoText}>
            You will receive an email confirmation shortly with your order
            details.
          </Typography>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={() => router.push(`/orders/${orderId}` as any)}
            variant="primary"
            style={styles.button}
          >
            View Order Details
          </Button>

          <Button
            onPress={() => router.push("/(tabs)" as any)}
            variant="secondary"
            style={styles.button}
          >
            Continue Shopping
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  subtitle: {
    textAlign: "center",
    color: COLORS.text.muted,
    marginBottom: SPACING.xl,
  },
  orderDetails: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailValue: {
    fontFamily: "Inter-SemiBold",
  },
  statusBadge: {
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  statusText: {
    color: COLORS.success,
    fontFamily: "Inter-SemiBold",
    textTransform: "uppercase",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: COLORS.cream[100],
    padding: SPACING.md,
    borderRadius: 8,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  infoText: {
    flex: 1,
    color: COLORS.text.secondary,
  },
  buttonContainer: {
    width: "100%",
    gap: SPACING.md,
  },
  button: {
    width: "100%",
  },
});
