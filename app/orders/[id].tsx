// app/orders/[id].tsx

import { TrackingTimeline } from "@/components/orders/TrackingTimeline";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import { useGetOrderQuery } from "@/store/services/ordersApi";
import type { OrderItem } from "@/types/order";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FALLBACK_IMAGE = "https://via.placeholder.com/80x100?text=No+Image";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PLACED: { label: "Placed", color: "#7a5c38" },
  CONFIRMED: { label: "Confirmed", color: "#2980b9" },
  PROCESSING: { label: "Processing", color: "#8e44ad" },
  SHIPPED: { label: "Shipped", color: "#27ae60" },
  DELIVERED: { label: "Delivered", color: "#1e8449" },
  CANCELLED: { label: "Cancelled", color: "#c0392b" },
  REFUNDED: { label: "Refunded", color: "#7f8c8d" },
  pending: { label: "Pending", color: "#7a5c38" },
  processing: { label: "Processing", color: "#8e44ad" },
  shipped: { label: "Shipped", color: "#27ae60" },
  delivered: { label: "Delivered", color: "#1e8449" },
  cancelled: { label: "Cancelled", color: "#c0392b" },
};

// ─── Shared header component ──────────────────────────────────────────────────

function Header({
  onBack,
  right,
}: {
  onBack: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.headerBtn}>
        <Text style={styles.retryText}>Continue Shopping</Text>
      </TouchableOpacity>
      <Typography variant="h3">Order Details</Typography>
      <View style={styles.headerBtnright}>{right ?? null}</View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigateHome = () => router.push("/(tabs)" as any);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetOrderQuery(id ?? "", {
      skip: !id,
      refetchOnMountOrArgChange: true,
    });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!id || isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Header onBack={navigateHome} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.espresso[500]} />
          <Typography variant="body" style={styles.mutedText}>
            Loading order…
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !data?.order) {
    // Pull the real server error message so we can debug
    const serverMsg: string =
      (error as any)?.data?.error ??
      (error as any)?.error ??
      (error as any)?.message ??
      "Unknown error";

    const httpStatus: number | undefined = (error as any)?.status;

    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Header onBack={navigateHome} />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={52} color="#c0392b" />
          <Typography variant="h3" style={styles.errorTitle}>
            Could Not Load Order
          </Typography>

          {/* Show the real error so it's debuggable */}
          <View style={styles.errorBox}>
            {httpStatus && (
              <Text style={styles.errorCode}>HTTP {httpStatus}</Text>
            )}
            <Text style={styles.errorMsg}>{serverMsg}</Text>
            <Text style={styles.errorId}>Order ID: {id}</Text>
          </View>

          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryText}> Retry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
          >
            <Typography variant="body" color={COLORS.espresso[500]}>
              ← Go Back
            </Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  const order = data.order;
  const status = STATUS_CONFIG[order.status] ?? {
    label: order.status,
    color: "#7a5c38",
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        onBack={navigateHome}
        right={
          isFetching ? (
            <ActivityIndicator size="small" color={COLORS.espresso[500]} />
          ) : undefined
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Order number + status */}
        <Card style={styles.section}>
          <View style={styles.orderHeader}>
            <View style={{ flex: 1 }}>
              <Typography variant="label" style={styles.mutedText}>
                Order Number
              </Typography>
              <Typography variant="h3">{order.orderNumber}</Typography>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: status.color }]}
            >
              <Text style={styles.statusText}>{status.label}</Text>
            </View>
          </View>
          <Typography
            variant="caption"
            color={COLORS.text.muted}
            style={{ marginTop: SPACING.sm }}
          >
            {`Placed on ${new Date(order.createdAt).toLocaleDateString(
              "en-US",
              {
                month: "long",
                day: "numeric",
                year: "numeric",
              },
            )}`}
          </Typography>
        </Card>

        {/* Status timeline */}
        <Card style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Order Status
          </Typography>
          <TrackingTimeline
            statusHistory={order.statusHistory ?? []}
            currentStatus={order.status}
          />
          {order.trackingNumber && (
            <View style={styles.trackingBox}>
              <Typography variant="label">Tracking Number</Typography>
              <Typography variant="body" style={styles.trackingNumber}>
                {order.trackingNumber}
              </Typography>
              {order.carrier && (
                <Typography variant="caption" color={COLORS.text.muted}>
                  {`Carrier: ${order.carrier}`}
                </Typography>
              )}
            </View>
          )}
        </Card>

        {/* Items */}
        <Card style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            {`Items (${order.items?.length ?? 0})`}
          </Typography>
          {(order.items ?? []).map((item: OrderItem) => {
            const imgs = item.product?.images;
            const uri =
              Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : FALLBACK_IMAGE;
            return (
              <View key={item.id} style={styles.orderItem}>
                <Image source={{ uri }} style={styles.productImage} />
                <View style={styles.itemDetails}>
                  <Typography variant="body" style={{ fontWeight: "600" }}>
                    {item.product?.name ?? "Product"}
                  </Typography>
                  {item.product?.styleCode && (
                    <Typography variant="caption" color={COLORS.text.muted}>
                      {item.product.styleCode}
                    </Typography>
                  )}
                  <Typography variant="caption" color={COLORS.text.muted}>
                    {`Qty: ${item.quantity}`}
                  </Typography>
                </View>
                <Typography variant="body">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </Typography>
              </View>
            );
          })}
        </Card>

        {/* Summary */}
        <Card style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Order Summary
          </Typography>
          {(
            [
              ["Subtotal", formatCurrency(Number(order.subtotal))],
              [
                "Shipping",
                Number(order.shippingCost) === 0
                  ? "FREE"
                  : formatCurrency(Number(order.shippingCost)),
              ],
              ["Tax", formatCurrency(Number(order.tax))],
            ] as [string, string][]
          ).map(([label, value]) => (
            <View key={label} style={styles.summaryRow}>
              <Typography variant="body">{label}</Typography>
              <Typography variant="body">{value}</Typography>
            </View>
          ))}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Typography variant="h3">Total</Typography>
            <Typography variant="h3" color={COLORS.espresso[500]}>
              {formatCurrency(Number(order.total))}
            </Typography>
          </View>
        </Card>

        {/* Shipping address */}
        {order.shippingAddress && (
          <Card style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Shipping Address
            </Typography>
            <Typography variant="body">
              {order.shippingAddress.fullName}
            </Typography>
            <Typography variant="body" style={styles.addressLine}>
              {order.shippingAddress.addressLine1}
            </Typography>
            {order.shippingAddress.addressLine2 ? (
              <Typography variant="body" style={styles.addressLine}>
                {order.shippingAddress.addressLine2}
              </Typography>
            ) : null}
            <Typography variant="body" style={styles.addressLine}>
              {`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`}
            </Typography>
            <Typography variant="body" style={styles.addressLine}>
              {order.shippingAddress.country}
            </Typography>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  headerBtnright: {
    width: 80,
  },
  headerBtn: {
    width: 80,
    alignItems: "center",
    backgroundColor: COLORS.espresso[500],
    color: "#fff",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  mutedText: { color: COLORS.text.muted, marginTop: SPACING.sm },
  errorTitle: { textAlign: "center" },
  errorBox: {
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  errorCode: { fontSize: 11, color: "#999", fontFamily: "monospace" },
  errorMsg: {
    fontSize: 13,
    color: "#c0392b",
    textAlign: "center",
    lineHeight: 18,
  },
  errorId: { fontSize: 11, color: "#aaa", fontFamily: "monospace" },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.espresso[500],
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  retryText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  backLink: { marginTop: SPACING.xs },

  section: { margin: SPACING.lg, padding: SPACING.lg },
  sectionTitle: { marginBottom: SPACING.md },

  orderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  trackingBox: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.cream[300],
    borderRadius: 4,
    gap: SPACING.xs,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.espresso[500],
  },

  orderItem: {
    flexDirection: "row",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  productImage: {
    width: 80,
    height: 100,
    borderRadius: 4,
    backgroundColor: COLORS.cream[300],
  },
  itemDetails: { flex: 1, gap: SPACING.xs },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
  },
  totalRow: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  addressLine: { marginTop: SPACING.xs, color: COLORS.text.secondary },
});
