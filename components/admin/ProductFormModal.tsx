// components/admin/ProductFormModal.tsx
// Fixes:
//   • Cancel / Create buttons no longer cropped by home indicator
//   • No extra whitespace below the footer
//   • Category field replaced with a real dropdown (bottom sheet picker)

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import { useGetCategoriesQuery } from "@/store/services/productsApi";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Product {
  id?: string;
  name: string;
  styleCode: string;
  description: string;
  price: number | string;
  stock: number;
  categoryId: string;
  categoryName: string;
  materials: string;
  dimensions: string;
  careInstructions: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
}

interface Props {
  product?: any;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Category Picker Bottom Sheet ─────────────────────────────────────────────

function CategoryPickerModal({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: string;
  onSelect: (id: string, name: string) => void;
  onClose: () => void;
}) {
  const { data: categoriesData, isLoading } = useGetCategoriesQuery({});
  const categories: Array<{ id: string; name: string }> =
    categoriesData?.categories || [];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={picker.backdrop}>
        <SafeAreaView edges={["bottom"]} style={picker.sheet}>
          <View style={picker.header}>
            <Text style={picker.title}>Select Category</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={COLORS.espresso[500]} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={picker.loader}>
              <ActivityIndicator color={COLORS.espresso[500]} />
            </View>
          ) : (
            <ScrollView bounces={false}>
              <TouchableOpacity
                style={[picker.row, !selected && picker.rowActive]}
                onPress={() => {
                  onSelect("", "");
                  onClose();
                }}
              >
                <Text
                  style={[picker.rowText, !selected && picker.rowTextActive]}
                >
                  — None —
                </Text>
                {!selected && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={COLORS.espresso[500]}
                  />
                )}
              </TouchableOpacity>

              {categories.map((cat) => {
                const isActive = selected === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[picker.row, isActive && picker.rowActive]}
                    onPress={() => {
                      onSelect(cat.id, cat.name);
                      onClose();
                    }}
                  >
                    <Text
                      style={[picker.rowText, isActive && picker.rowTextActive]}
                    >
                      {cat.name}
                    </Text>
                    {isActive && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={COLORS.espresso[500]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}

              {categories.length === 0 && (
                <Text style={picker.empty}>No categories found</Text>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function ProductFormModal({ product, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<Product>({
    name: product?.name || "",
    styleCode: product?.styleCode || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    stock: product?.stock || 0,
    categoryId: product?.categoryId || "",
    categoryName: product?.category?.name || "",
    materials: Array.isArray(product?.materials)
      ? product.materials.join(", ")
      : product?.materials || "",
    dimensions: product?.dimensions || "",
    careInstructions: product?.careInstructions || "",
    images: Array.isArray(product?.images) ? product.images : [],
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);

  const pickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need camera roll permissions to upload images",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
      });
      if (!result.canceled && result.assets) {
        if (result.assets.length < 3) {
          Alert.alert("Error", "Please select at least 3 images");
          return;
        }
        await uploadImages(result.assets);
      }
    } catch {
      Alert.alert("Error", "Failed to pick images");
    }
  };

  const uploadImages = async (assets: ImagePicker.ImagePickerAsset[]) => {
    setUploadingImages(true);
    try {
      const fd = new FormData();
      for (const asset of assets) {
        const ext = asset.uri.split(".").pop();
        fd.append("images", {
          uri: asset.uri,
          name: `photo.${ext}`,
          type: `image/${ext}`,
        } as any);
      }
      const response = await api.post("/api/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((p) => ({ ...p, images: response.data.urls }));
      Alert.alert(
        "Success",
        `${response.data.count} images uploaded successfully`,
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to upload images",
      );
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    const imgs = [...formData.images];
    imgs.splice(index, 1);
    setFormData((p) => ({ ...p, images: imgs }));
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.styleCode ||
      !formData.price ||
      !formData.description
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    if (formData.images.length < 3) {
      Alert.alert("Error", "Please upload at least 3 product images");
      return;
    }
    setLoading(true);
    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "put" : "post";
      const payload: any = {
        name: formData.name,
        styleCode: formData.styleCode,
        description: formData.description,
        price: parseFloat(formData.price.toString()),
        stock: formData.stock,
        materials: formData.materials
          ? formData.materials
              .split(",")
              .map((m) => m.trim())
              .filter(Boolean)
          : [],
        dimensions: formData.dimensions,
        careInstructions: formData.careInstructions,
        images: formData.images,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      };
      if (formData.categoryId?.trim())
        payload.categoryId = formData.categoryId.trim();
      await api[method](url, payload);
      Alert.alert(
        "Success",
        `Product ${product ? "updated" : "created"} successfully`,
      );
      onSuccess();
    } catch (error: any) {
      let msg = "Failed to save product";
      const d = error.response?.data;
      if (typeof d?.error === "string") msg = d.error;
      else if (Array.isArray(d?.error))
        msg = d.error
          .map((e: any) => `${e.path?.join(".") || "Field"}: ${e.message}`)
          .join("\n");
      else if (d?.message) msg = d.message;
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Top safe area for status bar */}
        <SafeAreaView edges={["top"]} style={styles.topSafe}>
          <View style={styles.header}>
            <Typography variant="h3">
              {product ? "Edit Product" : "Create Product"}
            </Typography>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={COLORS.espresso[500]} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Scrollable form body */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          {/* Images */}
          <View style={styles.imageSection}>
            <Typography variant="label" style={styles.sectionLabel}>
              Product Images (Min 3 required) *
            </Typography>
            <TouchableOpacity
              onPress={pickImages}
              style={styles.uploadButton}
              disabled={uploadingImages}
            >
              {uploadingImages ? (
                <ActivityIndicator color={COLORS.espresso[500]} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={32}
                    color={COLORS.espresso[500]}
                  />
                  <Typography variant="body" style={{ marginTop: SPACING.sm }}>
                    Tap to upload images
                  </Typography>
                  <Typography variant="caption" color={COLORS.text.muted}>
                    Select 3–10 images (max 5 MB each)
                  </Typography>
                </>
              )}
            </TouchableOpacity>
            {formData.images.length > 0 && (
              <ScrollView horizontal style={styles.imagePreviewContainer}>
                {formData.images.map((url, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Image source={{ uri: url }} style={styles.previewImage} />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color={COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <Input
            label="Product Name *"
            value={formData.name}
            onChangeText={(v) => setFormData((p) => ({ ...p, name: v }))}
            placeholder="Classic Leather Tote"
          />
          <Input
            label="Style Code *"
            value={formData.styleCode}
            onChangeText={(v) => setFormData((p) => ({ ...p, styleCode: v }))}
            placeholder="LH-001"
          />
          <Input
            label="Description *"
            value={formData.description}
            onChangeText={(v) => setFormData((p) => ({ ...p, description: v }))}
            multiline
            numberOfLines={4}
            placeholder="Product description..."
          />

          <View style={styles.row}>
            <Input
              label="Price ($) *"
              value={String(formData.price)}
              onChangeText={(v) => setFormData((p) => ({ ...p, price: v }))}
              keyboardType="decimal-pad"
              placeholder="49.00"
              containerStyle={styles.halfWidth}
            />
            <Input
              label="Stock *"
              value={String(formData.stock)}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, stock: parseInt(v) || 0 }))
              }
              keyboardType="number-pad"
              placeholder="10"
              containerStyle={styles.halfWidth}
            />
          </View>

          {/* Category dropdown */}
          <View>
            <Typography variant="label" style={styles.fieldLabel}>
              Category (optional)
            </Typography>
            <TouchableOpacity
              style={styles.categoryTrigger}
              onPress={() => setCategoryPickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryTriggerText,
                  !formData.categoryId && styles.categoryPlaceholder,
                ]}
              >
                {formData.categoryId
                  ? formData.categoryName || "Category selected"
                  : "Select a category…"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={COLORS.text.muted ?? "#999"}
              />
            </TouchableOpacity>
          </View>

          <Input
            label="Materials (comma-separated)"
            value={formData.materials}
            onChangeText={(v) => setFormData((p) => ({ ...p, materials: v }))}
            placeholder="Leather, Canvas, Gold Hardware"
          />
          <Input
            label="Dimensions"
            value={formData.dimensions}
            onChangeText={(v) => setFormData((p) => ({ ...p, dimensions: v }))}
            placeholder="30cm × 25cm × 15cm"
          />
          <Input
            label="Care Instructions"
            value={formData.careInstructions}
            onChangeText={(v) =>
              setFormData((p) => ({ ...p, careInstructions: v }))
            }
            multiline
            numberOfLines={3}
            placeholder="Clean with a soft, dry cloth…"
          />

          <View style={styles.checkboxes}>
            <TouchableOpacity
              onPress={() =>
                setFormData((p) => ({ ...p, isActive: !p.isActive }))
              }
              style={styles.checkbox}
            >
              <Ionicons
                name={formData.isActive ? "checkbox" : "square-outline"}
                size={24}
                color={COLORS.espresso[500]}
              />
              <Typography variant="body">Active</Typography>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setFormData((p) => ({ ...p, isFeatured: !p.isFeatured }))
              }
              style={styles.checkbox}
            >
              <Ionicons
                name={formData.isFeatured ? "checkbox" : "square-outline"}
                size={24}
                color={COLORS.espresso[500]}
              />
              <Typography variant="body">Featured</Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer — bottom edges ensure buttons clear the home indicator */}
        <SafeAreaView edges={["bottom"]} style={styles.footerSafe}>
          <View style={styles.footer}>
            <Button variant="ghost" onPress={onClose} style={styles.button}>
              Cancel
            </Button>
            <Button
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
              disabled={formData.images.length < 3}
            >
              {product ? "Update" : "Create"}
            </Button>
          </View>
        </SafeAreaView>
      </View>

      <CategoryPickerModal
        visible={categoryPickerVisible}
        selected={formData.categoryId}
        onSelect={(id, name) =>
          setFormData((p) => ({ ...p, categoryId: id, categoryName: name }))
        }
        onClose={() => setCategoryPickerVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topSafe: { backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  content: { flex: 1 },
  form: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xl },
  imageSection: { marginBottom: SPACING.md },
  sectionLabel: { marginBottom: SPACING.sm },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cream[300],
  },
  imagePreviewContainer: { marginTop: SPACING.md },
  imagePreview: { marginRight: SPACING.md, position: "relative" },
  previewImage: { width: 100, height: 100, borderRadius: 8 },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  row: { flexDirection: "row", gap: SPACING.md },
  halfWidth: { flex: 1 },
  fieldLabel: { marginBottom: SPACING.xs },
  categoryTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
  },
  categoryTriggerText: { fontSize: 15, color: COLORS.text.primary, flex: 1 },
  categoryPlaceholder: { color: COLORS.text.muted ?? "#999" },
  checkboxes: { flexDirection: "row", gap: SPACING.xl },
  checkbox: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  footerSafe: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footer: { flexDirection: "row", gap: SPACING.md, padding: SPACING.lg },
  button: { flex: 1 },
});

const picker = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.espresso[500] },
  loader: { paddingVertical: 32, alignItems: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  rowActive: { backgroundColor: COLORS.cream?.[300] ?? "#f5ede4" },
  rowText: { fontSize: 15, color: COLORS.text.primary },
  rowTextActive: { fontWeight: "700", color: COLORS.espresso[500] },
  empty: { textAlign: "center", color: COLORS.text.muted, padding: SPACING.xl },
});
