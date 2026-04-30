// app/orders/index.tsx
import { OrderCard } from "@/components/orders/OrderCard";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import { useAppSelector } from "@/store/hooks";
import { useGetOrdersQuery } from "@/store/services/ordersApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

export default function OrdersScreen() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state: any) =>
    typeof state?.auth === "object" &&
    state.auth !== null &&
    "isAuthenticated" in state.auth
      ? state.auth.isAuthenticated
      : false,
  );
  const { data, isFetching, refetch } = useGetOrdersQuery({});

  // Require authentication
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h2">My Orders</Typography>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="receipt-outline"
            size={80}
            color={COLORS.espresso[300]}
          />
          <Typography variant="h3" style={styles.emptyTitle}>
            Sign in to view your orders
          </Typography>
          <Typography variant="body" style={styles.emptyText}>
            Create an account or sign in to access your order history
          </Typography>
          <Button
            onPress={() => router.push("/auth/login")}
            style={styles.authButton}
          >
            Sign In
          </Button>
          <Button
            onPress={() => router.push("/auth/register")}
            variant="secondary"
            style={styles.authButton}
          >
            Create Account
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleOrderPress = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  if (isFetching && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h2">My Orders</Typography>
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.espresso[300]} />
        </View>
      </SafeAreaView>
    );
  }

  if (!data?.orders || data.orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h2">My Orders</Typography>
        </View>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
        >
          <Ionicons
            name="receipt-outline"
            size={80}
            color={COLORS.espresso[300]}
          />
          <Typography variant="h3" style={styles.emptyTitle}>
            No orders yet
          </Typography>
          <Typography variant="body" style={styles.emptyText}>
            Your order history will appear here
          </Typography>
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2">My Orders</Typography>
        <Typography variant="caption" style={styles.orderCount}>
          {data.orders.length} {data.orders.length === 1 ? "order" : "orders"}
        </Typography>
      </View>

      <FlatList
        data={data.orders}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => handleOrderPress(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderCount: {
    marginTop: SPACING.xs,
    color: COLORS.text.muted,
  },
  list: {
    padding: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    color: COLORS.text.muted,
    marginBottom: SPACING.xl,
  },
  authButton: {
    minWidth: 200,
    marginBottom: SPACING.md,
  },
});
