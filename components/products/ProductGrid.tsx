// src/components/products/ProductGrid.tsx

import { SPACING } from "@/constants/theme";
import React from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  useWindowDimensions
} from "react-native";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  styleCode: string;
  isWishlisted?: boolean;
}

interface ProductGridProps {
  products: Product[];
  onProductPress: (id: string) => void;
  onWishlistToggle: (id: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductPress,
  onWishlistToggle,
  onRefresh,
  refreshing = false,
  onEndReached,
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = (width - SPACING.lg * 3) / 2;

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          width={cardWidth}
          onPress={() => onProductPress(item.id)}
          onWishlistToggle={() => onWishlistToggle(item.id)}
        />
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    paddingBottom: SPACING["2xl"],
  },
  row: {
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
});
