// app/admin/orders.tsx

import { OrderDetailModal } from "@/components/admin/OrderDetailModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

const STATUS_COLORS: Record<string, string> = {
  PLACED: COLORS.gold[400],
  CONFIRMED: COLORS.espresso[400],
  PROCESSING: COLORS.espresso[500],
  SHIPPED: COLORS.espresso[600],
  DELIVERED: COLORS.success,
  CANCELLED: COLORS.text.muted,
  REFUNDED: COLORS.text.muted,
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: Array<{
    product: { name: string; styleCode: string };
    quantity: number;
    price: number;
  }>;
}

export default function AdminOrders() {
  const user = useAppSelector((state: any) =>
    typeof state?.auth === "object" &&
    state.auth !== null &&
    "user" in state.auth
      ? state.auth.user
      : null,
  );

  const isAuthenticated = useAppSelector((state: any) =>
    typeof state?.auth === "object" &&
    state.auth !== null &&
    "isAuthenticated" in state.auth
      ? state.auth.isAuthenticated
      : false,
  );

  const authLoading = useAppSelector((state: any) =>
    typeof state?.auth === "object" &&
    state.auth !== null &&
    "loading" in state.auth
      ? state.auth.loading
      : false,
  );
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Check authentication and admin role
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      router.replace("/(tabs)");
      return;
    }

    // Only fetch if authenticated and admin
    fetchOrders();
  }, [isAuthenticated, user, authLoading, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/admin/orders${statusFilter ? `?status=${statusFilter}` : ""}`;
      const response = await api.get(url);
      setOrders(response.data.orders);
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      setError(error.response?.data?.error || "Failed to load orders");

      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        router.replace("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity onPress={() => setSelectedOrder(item)}>
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Typography variant="label">{item.orderNumber}</Typography>
            <Typography variant="caption" color={COLORS.text.muted}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Typography>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_COLORS[item.status] },
            ]}
          >
            <Typography variant="caption" color={COLORS.cream[100]}>
              {item.status}
            </Typography>
          </View>
        </View>

        <View style={styles.orderContent}>
          <Typography variant="body">
            {item.user.firstName} {item.user.lastName}
          </Typography>
          <Typography variant="caption" color={COLORS.text.muted}>
            {item.user.email}
          </Typography>
          <Typography variant="caption" color={COLORS.text.muted}>
            {item.items.length} items
          </Typography>
        </View>

        <Typography variant="label" color={COLORS.espresso[500]}>
          ${Number(item.total).toFixed(2)}
        </Typography>
      </Card>
    </TouchableOpacity>
  );

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.espresso[500]} />
        <Typography style={{ marginTop: SPACING.md }}>
          Checking authentication...
        </Typography>
      </View>
    );
  }

  // Show loading while fetching data
  if (loading && orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.espresso[500]} />
        <Typography style={{ marginTop: SPACING.md }}>
          Loading orders...
        </Typography>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Typography color={COLORS.error} style={{ marginBottom: SPACING.md }}>
          {error}
        </Typography>
        <Button onPress={fetchOrders}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2">Orders</Typography>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchOrders} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Typography color={COLORS.text.muted}>No orders found</Typography>
          </View>
        }
      />

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={fetchOrders}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  header: {
    padding: SPACING.lg,
  },
  list: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  orderCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  orderHeader: {
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
  orderContent: {
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: "center",
  },
});
