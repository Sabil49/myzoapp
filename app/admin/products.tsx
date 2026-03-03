// app/admin/products.tsx

import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import { useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface Product {
  id: string;
  name: string;
  styleCode: string;
  price: number;
  stock: number;
  isActive: boolean;
  images: string[];
  category?: { name: string };
}

export default function AdminProducts() {
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
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Check authentication and admin role
    if (!isAuthenticated) {
      setLoading(false);
      router.replace("/auth/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      setLoading(false);
      router.replace("/(tabs)");
      return;
    }

    // Only fetch if authenticated and admin
    fetchProducts();
  }, [isAuthenticated, user]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/admin/products?page=1&limit=50");
      setProducts(response.data.products);
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      setError(error.response?.data?.error || "Failed to load products");

      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        router.replace("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/products/${id}`);
              Alert.alert("Success", "Product deleted successfully");
              fetchProducts();
            } catch (error) {
              Alert.alert("Error", "Failed to delete product");
            }
          },
        },
      ],
    );
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Card style={styles.productCard}>
      <View style={styles.productRow}>
        <Image
          source={{ uri: item.images[0] }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Typography variant="body">{item.name}</Typography>
          <Typography variant="caption" color={COLORS.text.muted}>
            {item.styleCode}
          </Typography>
          <Typography variant="label" color={COLORS.espresso[500]}>
            ${Number(item.price).toLocaleString()}
          </Typography>
          <View style={styles.productMeta}>
            <Typography
              variant="caption"
              color={item.stock > 10 ? COLORS.success : COLORS.error}
            >
              Stock: {item.stock}
            </Typography>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: item.isActive
                    ? COLORS.success
                    : COLORS.text.muted,
                },
              ]}
            >
              <Typography variant="caption" color={COLORS.cream[100]}>
                {item.isActive ? "Active" : "Inactive"}
              </Typography>
            </View>
          </View>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.actionButton}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={COLORS.espresso[500]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  // Show loading while fetching data
  if (loading && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.espresso[500]} />
        <Typography style={{ marginTop: SPACING.md }}>
          Loading products...
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
        <Button onPress={fetchProducts}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2">Products</Typography>
        <Button onPress={handleCreate} size="sm">
          <Ionicons name="add" size={20} color={COLORS.cream[100]} />
          Add Product
        </Button>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchProducts} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Typography color={COLORS.text.muted}>No products found</Typography>
            <Button
              onPress={handleCreate}
              style={{ marginTop: SPACING.md }}
              variant="secondary"
            >
              Create First Product
            </Button>
          </View>
        }
      />

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingProduct(null);
            fetchProducts();
          }}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
  },
  list: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  productCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 100,
    backgroundColor: COLORS.cream[300],
    marginRight: SPACING.md,
  },
  productInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  productMeta: {
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productActions: {
    gap: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.sm,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: "center",
  },
});
