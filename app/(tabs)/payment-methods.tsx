// app/(tabs)/payment-methods.tsx
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const DODO_PAYMENTS_URL =
  "https://test.checkout.dodopayments.com/buy/pdt_0NXlidWhtXLoHiO2PwrTI?quantity=1&redirect_url=https://myzobackend.vercel.app/payment/return";

export default function PaymentMethodsScreen() {
  const router = useRouter();

  const handleAddNew = async () => {
    try {
      // Open Dodo Payments checkout
      const canOpen = await Linking.canOpenURL(DODO_PAYMENTS_URL);
      if (canOpen) {
        await Linking.openURL(DODO_PAYMENTS_URL);
      }
    } catch (error) {
      console.error("Failed to open payment link:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.espresso[500]} />
        </TouchableOpacity>
        <Typography variant="h2" style={styles.headerTitle}>
          Payment Methods
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="card-outline"
            size={80}
            color={COLORS.espresso[300]}
          />
          <Typography variant="h3" style={styles.emptyTitle}>
            Secure Payment with Dodo
          </Typography>
          <Typography variant="body" style={styles.emptyText}>
            Add payment details securely during checkout
          </Typography>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color={COLORS.espresso[500]}
            />
            <View style={styles.infoContent}>
              <Typography
                variant="body"
                style={{ ...styles.infoTitle, fontFamily: "Inter-SemiBold" }}
              >
                Secure Payment Processing
              </Typography>
              <Typography variant="caption" color={COLORS.text.muted}>
                Your payment information is encrypted and secure. We use Dodo
                Payments for safe and reliable payment processing.
              </Typography>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons
              name="lock-closed-outline"
              size={24}
              color={COLORS.espresso[500]}
            />
            <View style={styles.infoContent}>
              <Typography
                variant="body"
                style={{ ...styles.infoTitle, fontFamily: "Inter-SemiBold" }}
              >
                PCI DSS Compliant
              </Typography>
              <Typography variant="caption" color={COLORS.text.muted}>
                All transactions are processed through PCI DSS Level 1 certified
                payment gateways.
              </Typography>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons
              name="card-outline"
              size={24}
              color={COLORS.espresso[500]}
            />
            <View style={styles.infoContent}>
              <Typography
                variant="body"
                style={{ ...styles.infoTitle, fontFamily: "Inter-SemiBold" }}
              >
                Multiple Payment Options
              </Typography>
              <Typography variant="caption" color={COLORS.text.muted}>
                Credit cards, debit cards, and other secure payment methods
                available at checkout.
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button onPress={handleAddNew} size="lg" fullWidth>
          Continue to Checkout
        </Button>
      </View>
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING["2xl"],
  },
  emptyTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptyText: {
    color: COLORS.text.muted,
    textAlign: "center",
  },
  infoSection: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  infoCard: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  infoContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  infoTitle: {},
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
});
