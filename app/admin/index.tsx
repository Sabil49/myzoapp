// app/admin/index.tsx

import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Analytics {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
  };
  topProducts: Array<{
    product: {
      id: string;
      name: string;
      styleCode: string;
      images: string[];
    };
    totalSold: number;
    orderCount: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    _count: { status: number };
  }>;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Remove testToken() call - endpoint doesn't exist
    fetchAnalytics();
  }, []);

  // Debug function to test token
  const testToken = async () => {
    try {
      console.log("Testing token verification...");
      const response = await api.get("/api/auth/verify");
      console.log("✅ Token verification successful:", response.data);
    } catch (error: any) {
      console.error(
        "❌ Token verification failed:",
        error.response?.data || error.message,
      );
      Alert.alert(
        "Token Verification Failed",
        JSON.stringify(error.response?.data || error.message),
        [
          {
            text: "OK",
            onPress: () => console.log("User acknowledged token error"),
          },
        ],
      );
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      console.log("Fetching analytics...");
      const response = await api.get("/api/admin/analytics");
      console.log("✅ Analytics fetched successfully");
      setAnalytics(response.data);
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch analytics:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Typography variant="h3">Loading Dashboard...</Typography>
        </View>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Typography variant="h3" color={COLORS.error}>
            Failed to Load Dashboard
          </Typography>
          <Typography
            variant="body"
            color={COLORS.text.muted}
            style={{ marginTop: SPACING.md }}
          >
            Check console for error details
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchAnalytics} />
      }
    >
      <View style={styles.content}>
        <Typography variant="h2" style={styles.title}>
          Dashboard
        </Typography>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Typography variant="caption" color={COLORS.text.muted}>
              Total Revenue
            </Typography>
            <Typography variant="h1" color={COLORS.success}>
              ${analytics.overview.totalRevenue.toLocaleString()}
            </Typography>
          </Card>

          <Card style={styles.statCard}>
            <Typography variant="caption" color={COLORS.text.muted}>
              Total Orders
            </Typography>
            <Typography variant="h1" color={COLORS.espresso[500]}>
              {analytics.overview.totalOrders}
            </Typography>
          </Card>

          <Card style={styles.statCard}>
            <Typography variant="caption" color={COLORS.text.muted}>
              Customers
            </Typography>
            <Typography variant="h1" color={COLORS.gold[400]}>
              {analytics.overview.totalCustomers}
            </Typography>
          </Card>
        </View>

        {/* Top Products */}
        <Card style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Top Selling Products
          </Typography>
          {analytics.topProducts.length > 0 ? (
            analytics.topProducts.map((item, index) => (
              <View key={item.product.id} style={styles.productItem}>
                <View style={styles.productRank}>
                  <Typography variant="label" color={COLORS.gold[400]}>
                    #{index + 1}
                  </Typography>
                </View>
                <View style={styles.productInfo}>
                  <Typography variant="body">{item.product.name}</Typography>
                  <Typography variant="caption" color={COLORS.text.muted}>
                    {item.product.styleCode}
                  </Typography>
                </View>
                <View style={styles.productStats}>
                  <Typography variant="label">{item.totalSold} sold</Typography>
                  <Typography variant="caption" color={COLORS.text.muted}>
                    {item.orderCount} orders
                  </Typography>
                </View>
              </View>
            ))
          ) : (
            <Typography variant="body" color={COLORS.text.muted}>
              No products sold yet
            </Typography>
          )}
        </Card>

        {/* Orders by Status */}
        <Card style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Orders by Status
          </Typography>
          {analytics.ordersByStatus.length > 0 ? (
            analytics.ordersByStatus.map((item) => (
              <View key={item.status} style={styles.statusItem}>
                <Typography variant="body">{item.status}</Typography>
                <Typography variant="label" color={COLORS.espresso[500]}>
                  {item._count.status}
                </Typography>
              </View>
            ))
          ) : (
            <Typography variant="body" color={COLORS.text.muted}>
              No orders yet
            </Typography>
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    minWidth: (width - SPACING.lg * 2 - SPACING.md) / 2,
    padding: SPACING.lg,
    alignItems: "center",
  },
  section: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  productRank: {
    width: 40,
  },
  productInfo: {
    flex: 1,
  },
  productStats: {
    alignItems: "flex-end",
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});
