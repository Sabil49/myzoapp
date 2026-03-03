// components/products/ProductCard.tsx

import { COLORS, SPACING } from "@/constants/theme";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Typography } from "../ui/Typography";

interface Product {
  id: string;
  name: string;
  styleCode: string;
  price: number;
  images: string[];
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
}) => {
  // Get first image or use placeholder
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/400x500/E8DED2/6B4E3D?text=No+Image";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {product.isFeatured && (
          <View style={styles.featuredBadge}>
            <Typography variant="caption" color={COLORS.cream[100]}>
              Featured
            </Typography>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Typography variant="body" numberOfLines={2} style={styles.name}>
          {product.name}
        </Typography>
        <Typography variant="caption" color={COLORS.text.muted}>
          {product.styleCode}
        </Typography>
        <Typography
          variant="h3"
          color={COLORS.espresso[500]}
          style={styles.price}
        >
          ${Number(product.price).toLocaleString()}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: SPACING.lg,
  },
  imageContainer: {
    aspectRatio: 0.8,
    backgroundColor: COLORS.cream[300],
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  featuredBadge: {
    position: "absolute",
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.gold[400],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  info: {
    paddingTop: SPACING.sm,
  },
  name: {
    marginBottom: SPACING.xs,
  },
  price: {
    marginTop: SPACING.xs,
  },
});
