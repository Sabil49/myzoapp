// app/(tabs)/bag.tsx
//
// Layout fix:
//   • CartSummary is inline in the scroll (not in a fixed footer)
//   • Only the "Proceed to Checkout" button is pinned at the bottom
//   • useSafeAreaInsets() instead of SafeAreaView edges={["bottom"]} — avoids
//     the Android over-padding bug that creates the empty white strip
//   • Header padding tightened — maximum vertical space for cart items

import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFromCart, updateQuantity } from "@/store/slices/cartSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function BagScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const cartItems = useAppSelector((state) => state.cart.items);
  const isAuthenticated = useAppSelector((state: any) =>
    typeof state?.auth === "object" &&
    state.auth !== null &&
    "isAuthenticated" in state.auth
      ? state.auth.isAuthenticated
      : false,
  );

  // Require authentication for accessing cart
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h2">Shopping Bag</Typography>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={80} color={COLORS.espresso[300]} />
          <Typography variant="h3" style={styles.emptyTitle}>
            Sign in to view your bag
          </Typography>
          <Typography variant="body" style={styles.emptyText}>
            Create an account or sign in to add items to your cart and checkout
          </Typography>
          <Button
            onPress={() => router.push("/auth/login")}
            style={styles.shopButton}
          >
            Sign In
          </Button>
          <Button
            onPress={() => router.push("/auth/register")}
            variant="secondary"
            style={styles.shopButton}
          >
            Create Account
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleRemoveItem = (id: string) => dispatch(removeFromCart(id));
  const handleUpdateQuantity = (id: string, qty: number) => {
    if (qty <= 0) dispatch(removeFromCart(id));
    else dispatch(updateQuantity({ productId: id, quantity: qty }));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  // ── Empty bag ─────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Typography variant="h2">Shopping Bag</Typography>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={80} color={COLORS.espresso[300]} />
          <Typography variant="h3" style={styles.emptyTitle}>
            Your bag is empty
          </Typography>
          <Typography variant="body" style={styles.emptyText}>
            Discover our timeless collection
          </Typography>
          <Button
            onPress={() => router.push("/(tabs)")}
            style={styles.shopButton}
          >
            Continue Shopping
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // ── Filled bag ────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Top safe area (status bar only) */}
      <SafeAreaView
        edges={["top"]}
        style={{ backgroundColor: COLORS.background }}
      >
        <View style={styles.header}>
          <Typography variant="h2">Shopping Bag</Typography>
          <Typography variant="caption" style={styles.itemCount}>
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </Typography>
        </View>
      </SafeAreaView>

      {/* Scroll: items + summary — everything except the CTA button */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cartItems.map((item) => (
          <CartItem
            key={item.productId}
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
          />
        ))}

        {/* Order summary inline so it scrolls with items */}
        <CartSummary subtotal={subtotal} />
      </ScrollView>

      {/* Checkout button — pinned to bottom, uses insets.bottom instead of
          SafeAreaView edges to avoid the Android empty-strip bug */}
      <View
        style={[
          styles.footer,
          {
            // insets.bottom = 0 on most Androids, real value on notched devices
            paddingBottom: Math.max(insets.bottom, SPACING.sm),
          },
        ]}
      >
        <Button
          onPress={() => router.push("/checkout" as any)}
          size="lg"
          fullWidth
        >
          Proceed to Checkout
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md, // tighter than before
    paddingBottom: SPACING.sm, // tighter than before
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  itemCount: { marginTop: 2, color: COLORS.text.muted },

  content: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.sm },

  // Footer: only the button, no extra wrapper padding
  footer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: { marginTop: SPACING.lg, marginBottom: SPACING.sm },
  emptyText: { color: COLORS.text.muted, marginBottom: SPACING.xl },
  shopButton: { minWidth: 200 },
});
