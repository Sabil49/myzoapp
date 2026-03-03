// app/(tabs)/collections.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ProductGrid } from "@/components/products/ProductGrid";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import type { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  useGetCategoriesQuery,
  useGetProductsQuery,
} from "@/store/services/productsApi";
import { toggleWishlist } from "@/store/slices/wishlistSlice";

export default function CollectionsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery({});

  const {
    data: productsData,
    isLoading: productsLoading,
    isError,
    error,
  } = useGetProductsQuery({
    categoryId: selectedCategory || undefined,
    page: 1,
    limit: 20,
  });

  const wishlist = useAppSelector(
    (state: RootState) => (state.wishlist as { items: string[] }).items,
  );

  const handleProductPress = (id: string) => {
    router.push(`/product/${id}`);
  };

  const handleWishlistToggle = (id: string) => {
    dispatch(toggleWishlist(id));
  };

  const productsWithWishlist = (productsData?.products || []).map(
    (product: any) => ({
      ...product,
      isWishlisted: wishlist.includes(product.id),
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h2">Collections</Typography>
      </View>

      {/* Category Chips */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {/* All */}
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Typography
              variant="label"
              color={
                !selectedCategory ? COLORS.cream[100] : COLORS.text.secondary
              }
            >
              All
            </Typography>
          </TouchableOpacity>

          {!categoriesLoading &&
            (categoriesData?.categories || []).map(
              (category: { id: string; name: string }) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id &&
                      styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Typography
                    variant="label"
                    color={
                      selectedCategory === category.id
                        ? COLORS.cream[100]
                        : COLORS.text.secondary
                    }
                  >
                    {category.name}
                  </Typography>
                </TouchableOpacity>
              ),
            )}
        </ScrollView>
      </View>

      {/* Products Area */}
      <View style={styles.content}>
        {productsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.espresso[500]} />
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <Typography variant="h3" style={styles.errorTitle}>
              Failed to Load Products
            </Typography>
            <Typography
              variant="body"
              color={COLORS.text.muted}
              style={styles.errorMessage}
            >
              {typeof error === "object" && error !== null && "message" in error
                ? (error as any).message
                : "Unable to fetch products. Please try again."}
            </Typography>
          </View>
        ) : productsWithWishlist.length > 0 ? (
          <ProductGrid
            products={productsWithWishlist}
            onProductPress={handleProductPress}
            onWishlistToggle={handleWishlistToggle}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Typography variant="body" color={COLORS.text.muted}>
              No products in this collection
            </Typography>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },

  /* Category Section */
  categoriesWrapper: {
    height: 56, // 🔥 prevents vertical stretching
  },

  categories: {
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
  },

  categoryChip: {
    height: 40,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.espresso[300],
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 0,
  },

  categoryChipActive: {
    backgroundColor: COLORS.espresso[500],
    borderColor: COLORS.espresso[500],
  },

  /* Content */
  content: {
    flex: 1,
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
    paddingHorizontal: SPACING.lg,
  },

  errorTitle: {
    marginBottom: SPACING.md,
    color: COLORS.espresso[500],
  },

  errorMessage: {
    textAlign: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
