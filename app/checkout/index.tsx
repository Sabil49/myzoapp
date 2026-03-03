// app/checkout/index.tsx
//
// BLANK SCREEN FIX:
//   Root cause: when stock error fires, createOrder() throws BEFORE the cart
//   is cleared (orders/route.ts never calls cart.deleteMany on failure).
//   BUT — RTK Query's createOrder mutation might trigger an optimistic update
//   or the cartSlice listens to the fulfilled action and clears itself.
//   The fix is: catch the RTK error, read cartItems from a ref (not state) so
//   the early-return guard "if (cartItems.length === 0)" never fires while
//   the error is showing. We also add an `errorVisible` flag that prevents
//   the empty-cart render until the user dismisses or navigates away.

import { AddressCard } from "@/components/checkout/AddressCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import type { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { useGetAddressesQuery } from "@/store/services/addressesApi";
import { useCreateOrderMutation } from "@/store/services/ordersApi";
import type { Address } from "@/types/order";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

// helper to parse return URLs from the payment provider (web or custom scheme)
function extractOrderId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const id =
      parsed.searchParams.get("orderId") ?? parsed.searchParams.get("order_id");
    if (id) return id;
  } catch {}
  // Fallback for myzo:// custom scheme URLs
  const match = url.match(/[?&](?:orderId|order_id)=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    v,
  );

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cartItems = useAppSelector((state: RootState) => state.cart.items);

  // Keep a ref copy of cartItems — even if Redux clears them after an error,
  // this ref lets us keep showing the screen instead of the blank empty-cart view.
  const cartItemsRef = useRef(cartItems);
  if (cartItems.length > 0) cartItemsRef.current = cartItems; // only update when non-empty

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [showingError, setShowingError] = useState(false); // prevents blank-screen flash

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const {
    data: addresses = [],
    isLoading: addressesLoading,
    error: addressesError,
  } = useGetAddressesQuery();

  // if the addresses query errors out with 401 we may already be
  // signing the user out in the baseQuery; double-check and redirect
  // (this also catches any other unexpected errors so the user isn't
  // shown "no saved addresses" while the call actually failed).
  React.useEffect(() => {
    if (addressesError) {
      const status = (addressesError as any)?.status;
      if (status === 401) {
        router.replace("/auth/login" as any);
      } else {
        setInlineError("Failed to load addresses. Please try again.");
        setShowingError(true);
      }
    }
  }, [addressesError, router]);

  // Decide which cart items to show — use ref fallback if Redux was cleared
  const displayItems = cartItems.length > 0 ? cartItems : cartItemsRef.current;

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const def =
        (addresses as (Address & { isDefault?: boolean })[]).find(
          (a) => a.isDefault,
        ) ?? addresses[0];
      setSelectedAddress(def);
    }
  }, [addresses]);

  // Deep link handler
  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      console.log("[Checkout] Deep link received:", url);

      if (url.includes("checkout/success") || url.includes("/return")) {
        const orderId = extractOrderId(url);
        console.log("[Checkout] Extracted orderId:", orderId);
        setWebViewUrl(null);

        if (orderId && orderId !== "" && orderId !== "success") {
          // Navigate directly to the order details screen with the real UUID
          router.replace(`/orders/${orderId}` as any);
        } else {
          console.warn("[Checkout] No valid orderId, going to account");
          router.replace("/account" as any);
        }
        return;
      }

      if (url.includes("error=")) {
        setWebViewUrl(null);
        // parse error param manually for custom schemes
        const errorMatch = url.match(/[?&]error=([^&]+)/);
        const errorParam = errorMatch ? decodeURIComponent(errorMatch[1]) : "";
        const messages: Record<string, string> = {
          payment_failed: "Your payment was declined. Please try again.",
          payment_cancelled: "Payment was cancelled.",
          missing_order_id: "Something went wrong. Please contact support.",
          order_not_found: "Order not found. Please try again.",
        };
        Alert.alert(
          "Payment Issue",
          messages[errorParam] ?? "An unexpected error occurred.",
        );
      }
    };
    const sub = Linking.addEventListener("url", handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });
    return () => sub.remove();
  }, [router]);

  const subtotal = displayItems.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0,
  );
  const shipping = subtotal > 500 ? 0 : 25;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const buttonText = useMemo(
    () => `Continue to Payment · ${formatCurrency(total)}`,
    [total],
  );

  // ── Empty cart guard — ONLY shown when no error is active ─────────────────
  if (displayItems.length === 0 && !showingError) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Typography variant="h3">Checkout</Typography>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={64} color={COLORS.espresso[300]} />
          <Typography variant="h3" style={{ marginTop: SPACING.lg }}>
            Your cart is empty
          </Typography>
          <Button
            style={{ marginTop: SPACING.xl, minWidth: 200 }}
            onPress={() => router.push("/(tabs)")}
          >
            Continue Shopping
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // ── Place order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setInlineError(null);
    setShowingError(false);

    if (!selectedAddress) {
      Alert.alert("Address Required", "Please select a delivery address.");
      return;
    }

    try {
      const result = await createOrder({
        addressId: selectedAddress.id,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: "dodo",
      }).unwrap();

      console.log("[Checkout] Order created:", result.order.id);

      const response = await fetch(
        "https://myzobackend.vercel.app/api/payments/dodo/create-checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: result.order.id }),
        },
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error ?? "Failed to create checkout session");

      const checkoutUrl: string | undefined =
        data?.checkoutUrl ?? data?.checkout_url ?? data?.url;
      if (!checkoutUrl) throw new Error("No checkout URL returned from server");

      const canOpen = await Linking.canOpenURL(checkoutUrl);
      if (canOpen) {
        await Linking.openURL(checkoutUrl);
        return;
      }
      setWebViewUrl(checkoutUrl);
    } catch (err: any) {
      console.error("[Checkout] Error:", err);

      const raw: string =
        err?.data?.error ??
        err?.message ??
        "Unable to start payment. Please try again.";

      // Show inline for stock errors — keeps the user on this screen
      const isStock = /stock|insufficient|only has/i.test(raw);
      setInlineError(raw);
      setShowingError(true);

      if (!isStock) {
        // For non-stock errors, also show an alert
        Alert.alert("Payment Error", raw);
      }
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* WebView modal */}
      <Modal
        visible={!!webViewUrl}
        animationType="slide"
        onRequestClose={() => setWebViewUrl(null)}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: COLORS.background }}
          edges={["top", "bottom"]}
        >
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Cancel Payment",
                  "Are you sure you want to cancel?",
                  [
                    { text: "No", style: "cancel" },
                    {
                      text: "Yes, Cancel",
                      style: "destructive",
                      onPress: () => setWebViewUrl(null),
                    },
                  ],
                )
              }
            >
              <Ionicons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Typography variant="h3">Secure Checkout</Typography>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={COLORS.espresso[500]}
            />
          </View>
          <WebView
            source={{ uri: webViewUrl! }}
            style={{ flex: 1 }}
            onNavigationStateChange={(navState) => {
              const url = navState.url;
              if (
                url.startsWith("myzo://") ||
                url.includes("checkout/success") ||
                url.includes("/return")
              ) {
                setWebViewUrl(null);
                const orderId = extractOrderId(url);
                console.log(
                  "[WebView] Intercepted URL:",
                  url,
                  "orderId:",
                  orderId,
                );

                if (orderId && orderId !== "" && orderId !== "success") {
                  router.replace(`/orders/${orderId}` as any);
                } else {
                  router.replace("/account" as any);
                }
              }
            }}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color={COLORS.espresso[500]} />
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Header */}
      <SafeAreaView
        edges={["top"]}
        style={{ backgroundColor: COLORS.background }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Typography variant="h3">Checkout</Typography>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* ── Inline error banner ── */}
        {inlineError && (
          <View style={styles.errorBanner}>
            <View style={styles.errorBannerRow}>
              <Ionicons name="alert-circle" size={18} color="#c0392b" />
              <Text style={styles.errorBannerText}>{inlineError}</Text>
            </View>
            <View style={styles.errorBannerActions}>
              <TouchableOpacity
                style={styles.errorBannerBtnOutline}
                onPress={() => {
                  setInlineError(null);
                  setShowingError(false);
                  router.back();
                }}
              >
                <Text style={styles.errorBannerBtnOutlineText}>
                  ← Go Back to Bag
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Delivery Address */}
        <Card style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Delivery Address
          </Typography>
          {addressesLoading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.espresso[500]}
              style={{ paddingVertical: SPACING.lg }}
            />
          ) : addresses.length > 0 ? (
            addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isSelected={selectedAddress?.id === address.id}
                onPress={() => setSelectedAddress(address)}
              />
            ))
          ) : (
            <Typography
              variant="caption"
              style={{ color: COLORS.text.muted, marginBottom: SPACING.md }}
            >
              No saved addresses yet
            </Typography>
          )}
          <Button
            variant="secondary"
            style={{ marginTop: SPACING.sm }}
            onPress={() => router.push("/address/add" as any)}
          >
            Add New Address
          </Button>
        </Card>

        {/* Order Summary */}
        <Card style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Order Summary
          </Typography>
          {displayItems.map((item) => (
            <View key={item.productId} style={styles.orderItem}>
              <View style={{ flex: 1 }}>
                <Typography variant="body">{item.product.name}</Typography>
                <Typography variant="caption" color={COLORS.text.muted}>
                  Qty: {item.quantity}
                </Typography>
              </View>
              <Typography variant="body">
                {formatCurrency(item.product.price * item.quantity)}
              </Typography>
            </View>
          ))}
          <View style={styles.divider} />
          {[
            ["Subtotal", formatCurrency(subtotal)],
            ["Shipping", shipping === 0 ? "FREE" : formatCurrency(shipping)],
            ["Tax", formatCurrency(tax)],
          ].map(([label, value]) => (
            <View key={label} style={styles.summaryRow}>
              <Typography variant="body">{label}</Typography>
              <Typography variant="body">{value}</Typography>
            </View>
          ))}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Typography variant="h3">Total</Typography>
            <Typography variant="h3" color={COLORS.espresso[500]}>
              {formatCurrency(total)}
            </Typography>
          </View>
        </Card>

        {/* Payment */}
        <Card style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Payment Method
          </Typography>
          <View style={styles.paymentInfo}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color={COLORS.espresso[500]}
            />
            <View style={{ flex: 1, gap: 4 }}>
              <Typography variant="body">Secure Payment with Dodo</Typography>
              <Typography variant="caption" color={COLORS.text.muted}>
                You'll be redirected to complete your payment securely
              </Typography>
            </View>
          </View>
        </Card>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, SPACING.sm) },
        ]}
      >
        <Button
          onPress={handlePlaceOrder}
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading || addressesLoading}
        >
          {buttonText}
        </Button>
      </View>
    </View>
  );
}

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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },

  errorBanner: {
    margin: SPACING.lg,
    marginBottom: 0,
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  errorBannerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  errorBannerText: { flex: 1, fontSize: 13, color: "#c0392b", lineHeight: 18 },
  errorBannerActions: { flexDirection: "row" },
  errorBannerBtnOutline: {
    borderWidth: 1,
    borderColor: "#c0392b",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  errorBannerBtnOutlineText: {
    fontSize: 12,
    color: "#c0392b",
    fontWeight: "600",
  },

  section: { margin: SPACING.lg, padding: SPACING.lg },
  sectionTitle: { marginBottom: SPACING.md },
  orderItem: { flexDirection: "row", paddingVertical: SPACING.sm },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.xs,
  },
  totalRow: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.cream[100],
    borderRadius: 8,
  },

  footer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  webViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  webViewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});
