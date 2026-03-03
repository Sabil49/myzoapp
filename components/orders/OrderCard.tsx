// components/orders/OrderCard.tsx
import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "../ui/Card";
import { Typography } from "../ui/Typography";

const STATUS_COLORS: Record<string, string> = {
  PLACED: COLORS.gold[400],
  CONFIRMED: COLORS.espresso[400],
  PROCESSING: COLORS.espresso[500],
  SHIPPED: COLORS.espresso[600],
  DELIVERED: COLORS.success,
  CANCELLED: COLORS.text.muted,
  REFUNDED: COLORS.text.muted,
};

const STATUS_LABELS: Record<string, string> = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    items: Array<{
      product: {
        name: string;
        images: string[];
      };
      quantity: number;
    }>;
  };
  onPress: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  if (order.items.length === 0) {
    return null;
  }

  const firstItem = order.items[0];
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View>
            <Typography variant="label">Order {order.orderNumber}</Typography>
            <Typography variant="caption" color={COLORS.text.muted}>
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Typography>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_COLORS[order.status] },
            ]}
          >
            <Typography variant="caption" color={COLORS.cream[100]}>
              {STATUS_LABELS[order.status]}
            </Typography>
          </View>
        </View>

        <View style={styles.content}>
          {firstItem.product.images[0] ? (
            <Image
              source={{ uri: firstItem.product.images[0] }}
              style={styles.productImage}
            />
          ) : (
            <View style={styles.productImage} />
          )}
          <View style={styles.details}>
            <Text style={styles.productName} numberOfLines={2}>
              {firstItem.product.name}
            </Text>
            {order.items.length > 1 && (
              <Typography variant="caption" color={COLORS.text.muted}>
                +{order.items.length - 1} more{" "}
                {order.items.length === 2 ? "item" : "items"}
              </Typography>
            )}
            <Typography variant="caption" color={COLORS.text.muted}>
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Typography>
          </View>

          <Typography variant="body" style={styles.total}>
            ${Number(order.total).toFixed(2)}
          </Typography>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 100,
    backgroundColor: COLORS.cream[300],
    marginRight: SPACING.md,
  },
  details: {
    flex: 1,
    gap: SPACING.xs,
  },
  productName: {
    fontFamily: TYPOGRAPHY.fonts.body,
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: 24,
    color: COLORS.text.primary,
  },
  total: {
    fontFamily: "Inter-SemiBold",
    color: COLORS.espresso[500],
  },
});
