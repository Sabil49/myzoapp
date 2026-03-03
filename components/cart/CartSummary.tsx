// components/cart/CartSummary.tsx
import { COLORS, SPACING } from "@/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Typography } from "../ui/Typography";

interface CartSummaryProps {
  subtotal: number;
}

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 25;
const TAX_RATE = 0.08;

export const CartSummary: React.FC<CartSummaryProps> = ({ subtotal }) => {
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  return (
    <View style={styles.container}>
      {/* Subtotal */}
      <View style={styles.row}>
        <Typography variant="body">Subtotal</Typography>
        <Typography variant="body">{`$${subtotal.toFixed(2)}`}</Typography>
      </View>

      {/* Shipping */}
      <View style={styles.row}>
        <Typography variant="body">Shipping</Typography>
        <Typography variant="body">
          {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
        </Typography>
      </View>

      {/* Free shipping note */}
      {shipping === 0 && (
        <Typography variant="caption" style={styles.freeShippingNote}>
          Complimentary shipping on orders over $500
        </Typography>
      )}

      {/* Tax */}
      <View style={styles.row}>
        <Typography variant="body">Estimated Tax</Typography>
        <Typography variant="body">{`$${tax.toFixed(2)}`}</Typography>
      </View>

      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.row}>
        <Typography variant="h3">Total</Typography>
        <Typography variant="h3" color={COLORS.espresso[500]}>
          {`$${total.toFixed(2)}`}
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  freeShippingNote: {
    color: COLORS.success,
    marginTop: -SPACING.xs,
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
});
