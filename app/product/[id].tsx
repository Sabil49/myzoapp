// app/product/[id].tsx

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBag = () => {
    if (product) {
      dispatch(
        addToCart({
          productId: product.id,
          product: product,
          quantity: 1,
        }),
      );
      router.push("/(tabs)/bag");
    }
  };

  if (loading || !product) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Typography>Loading...</Typography>
      </SafeAreaView>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["https://via.placeholder.com/800x1000/E8DED2/6B4E3D?text=No+Image"];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.espresso[500]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.wishlistButton}>
            <Ionicons
              name="heart-outline"
              size={24}
              color={COLORS.espresso[500]}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {images.map(
            (imageUrl: string, index: number): React.ReactNode => (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ),
          )}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.imageIndicator}>
            {images.map((_: string, index: number) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        )}

        <View style={styles.info}>
          <Typography variant="h2" style={styles.productName}>
            {product.name}
          </Typography>
          <Typography variant="caption" color={COLORS.text.muted}>
            {product.styleCode}
          </Typography>

          <Typography
            variant="h1"
            color={COLORS.espresso[500]}
            style={styles.price}
          >
            ${Number(product.price).toLocaleString()}
          </Typography>

          <View style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Description
            </Typography>
            <Typography variant="body" color={COLORS.text.secondary}>
              {product.description}
            </Typography>
          </View>

          {product.materials && product.materials.length > 0 && (
            <View style={styles.section}>
              <Typography variant="h3" style={styles.sectionTitle}>
                Materials
              </Typography>
              <Typography variant="body" color={COLORS.text.secondary}>
                {product.materials.join(", ")}
              </Typography>
            </View>
          )}

          {product.dimensions && (
            <View style={styles.section}>
              <Typography variant="h3" style={styles.sectionTitle}>
                Dimensions
              </Typography>
              <Typography variant="body" color={COLORS.text.secondary}>
                {product.dimensions}
              </Typography>
            </View>
          )}

          {product.careInstructions && (
            <View style={styles.section}>
              <Typography variant="h3" style={styles.sectionTitle}>
                Care Instructions
              </Typography>
              <Typography variant="body" color={COLORS.text.secondary}>
                {product.careInstructions}
              </Typography>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <SafeAreaView style={styles.footerContainer} edges={["bottom"]}>
        <View style={styles.footer}>
          <Button onPress={handleAddToBag} size="lg" fullWidth>
            ADD TO BAG
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  wishlistButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  productImage: {
    width: width,
    height: width * 1.25,
    backgroundColor: COLORS.cream[300],
  },
  imageIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  activeDot: {
    backgroundColor: COLORS.espresso[500],
  },
  info: {
    padding: SPACING.lg,
  },
  productName: {
    marginBottom: SPACING.xs,
  },
  price: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  bottomSpacer: {
    height: 20,
  },
  footerContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footer: {
    padding: SPACING.lg,
  },
});
