// app/(tabs)/wishlist.tsx
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

interface Product {
  id: string;
  name: string;
  styleCode: string;
  price: number;
  images: string[];
  category?: {
    name: string;
  };
}

export default function WishlistScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state: any) =>
    typeof state?.auth === "object" &&
    state.auth !== null &&
    "isAuthenticated" in state.auth
      ? state.auth.isAuthenticated
      : false,
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Require authentication
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h2">Wishlist</Typography>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="heart-outline"
            size={80}
            color={COLORS.espresso[300]}
          />
          <Typography variant="h3" style={styles.emptyTitle}>
            Sign in to save your favorites
          </Typography>
          <Typography variant="body" style={styles.emptyText}>
            Create an account or sign in to build your wishlist
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

  const fetchWishlist = useCallback(async () => {
    try {
      const response = await api.get("/api/wishlist");
      const wishlistItems = response.data.items || [];
      setProducts(wishlistItems.map((item: any) => item.product));
    } catch (error: any) {
      console.error("Failed to fetch wishlist:", error);
      // Handle 404 or empty wishlist gracefully
      if (error.response?.status === 404 || error.response?.status === 401) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWishlist();
  };

  const handleProductPress = (id: string) => {
    router.push(`/product/${id}` as any);
  };

  const handleWishlistToggle = async (id: string) => {
    try {
      // Optimistically remove from UI
      setProducts((prev) => prev.filter((p) => p.id !== id));

      // Update via API
      await dispatch(toggleWishlist(id));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      // Revert on error
      fetchWishlist();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.espresso[500]}
            />
          </TouchableOpacity>
          <Typography variant="h2" style={styles.headerTitle}>
            Wishlist
          </Typography>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.espresso[500]} />
        </View>
      </SafeAreaView>
    );
  }

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
          Wishlist
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="heart-outline"
            size={80}
            color={COLORS.espresso[300]}
          />
          <Typography variant="h3" style={styles.emptyTitle}>
            Your wishlist is empty
          </Typography>
          <Typography variant="body" style={styles.emptyText}>
            Save your favorite luxury bags for later
          </Typography>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/(tabs)" as any)}
          >
            <Typography variant="body" color={COLORS.espresso[500]}>
              Browse Collections
            </Typography>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={COLORS.espresso[500]}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.itemCount}>
            <Typography variant="caption" color={COLORS.text.muted}>
              {products.length} {products.length === 1 ? "item" : "items"} saved
            </Typography>
          </View>
          <FlatList
            data={products}
            renderItem={({ item }) => (
              <View style={styles.productCardWrapper}>
                <ProductCard
                  product={{ ...item, isWishlisted: true }}
                  onPress={() => handleProductPress(item.id)}
                  onWishlistToggle={() => handleWishlistToggle(item.id)}
                />
              </View>
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.espresso[500]}
              />
            }
          />
        </>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemCount: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    color: COLORS.text.muted,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.espresso[500],
    borderRadius: 8,
  },
  grid: {
    padding: SPACING.md,
  },
  productCardWrapper: {
    flex: 1,
    padding: SPACING.xs,
  },
  authButton: {
    minWidth: 200,
    marginBottom: SPACING.md,
  },
});
