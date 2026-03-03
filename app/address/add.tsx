// app/address/add.tsx
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddAddressScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/addresses", formData);
      Alert.alert("Success", "Address added successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Failed to add address:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error ||
          "Failed to add address. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

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
          Add Address
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Typography
                variant="body"
                style={StyleSheet.flatten([
                  styles.label,
                  { fontFamily: "Inter-SemiBold" },
                ])}
              >
                Full Name *
              </Typography>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                value={formData.fullName}
                onChangeText={(text) => {
                  setFormData({ ...formData, fullName: text });
                  if (errors.fullName) {
                    setErrors({ ...errors, fullName: "" });
                  }
                }}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.text.muted}
              />
              {errors.fullName && (
                <Typography variant="caption" color={COLORS.error}>
                  {errors.fullName}
                </Typography>
              )}
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Typography
                variant="body"
                style={StyleSheet.flatten([
                  styles.label,
                  { fontFamily: "Inter-SemiBold" },
                ])}
              >
                Phone Number *
              </Typography>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={formData.phone}
                onChangeText={(text) => {
                  setFormData({ ...formData, phone: text });
                  if (errors.phone) {
                    setErrors({ ...errors, phone: "" });
                  }
                }}
                placeholder="Enter phone number"
                placeholderTextColor={COLORS.text.muted}
                keyboardType="phone-pad"
              />
              {errors.phone && (
                <Typography variant="caption" color={COLORS.error}>
                  {errors.phone}
                </Typography>
              )}
            </View>

            {/* Address Line 1 */}
            <View style={styles.inputGroup}>
              <Typography
                variant="body"
                style={StyleSheet.flatten([
                  styles.label,
                  { fontFamily: "Inter-SemiBold" },
                ])}
              >
                Address Line 1 *
              </Typography>
              <TextInput
                style={[styles.input, errors.addressLine1 && styles.inputError]}
                value={formData.addressLine1}
                onChangeText={(text) => {
                  setFormData({ ...formData, addressLine1: text });
                  if (errors.addressLine1) {
                    setErrors({ ...errors, addressLine1: "" });
                  }
                }}
                placeholder="Street address, P.O. box"
                placeholderTextColor={COLORS.text.muted}
              />
              {errors.addressLine1 && (
                <Typography variant="caption" color={COLORS.error}>
                  {errors.addressLine1}
                </Typography>
              )}
            </View>

            {/* Address Line 2 */}
            <View style={styles.inputGroup}>
              <Typography
                variant="body"
                style={StyleSheet.flatten([
                  styles.label,
                  { fontFamily: "Inter-SemiBold" },
                ])}
              >
                Address Line 2
              </Typography>
              <TextInput
                style={styles.input}
                value={formData.addressLine2}
                onChangeText={(text) =>
                  setFormData({ ...formData, addressLine2: text })
                }
                placeholder="Apartment, suite, unit, building, floor, etc."
                placeholderTextColor={COLORS.text.muted}
              />
            </View>

            {/* City */}
            <View style={styles.inputGroup}>
              <Typography
                variant="body"
                style={StyleSheet.flatten([
                  styles.label,
                  { fontFamily: "Inter-SemiBold" },
                ])}
              >
                City *
              </Typography>
              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                value={formData.city}
                onChangeText={(text) => {
                  setFormData({ ...formData, city: text });
                  if (errors.city) {
                    setErrors({ ...errors, city: "" });
                  }
                }}
                placeholder="Enter city"
                placeholderTextColor={COLORS.text.muted}
              />
              {errors.city && (
                <Typography variant="caption" color={COLORS.error}>
                  {errors.city}
                </Typography>
              )}
            </View>

            {/* State and Zip Code */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Typography
                  variant="body"
                  style={StyleSheet.flatten([
                    styles.label,
                    { fontFamily: "Inter-SemiBold" },
                  ])}
                >
                  State *
                </Typography>
                <TextInput
                  style={[styles.input, errors.state && styles.inputError]}
                  value={formData.state}
                  onChangeText={(text) => {
                    setFormData({ ...formData, state: text });
                    if (errors.state) {
                      setErrors({ ...errors, state: "" });
                    }
                  }}
                  placeholder="State"
                  placeholderTextColor={COLORS.text.muted}
                />
                {errors.state && (
                  <Typography variant="caption" color={COLORS.error}>
                    {errors.state}
                  </Typography>
                )}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Typography
                  variant="body"
                  style={StyleSheet.flatten([
                    styles.label,
                    { fontFamily: "Inter-SemiBold" },
                  ])}
                >
                  Zip Code *
                </Typography>
                <TextInput
                  style={[styles.input, errors.zipCode && styles.inputError]}
                  value={formData.zipCode}
                  onChangeText={(text) => {
                    setFormData({ ...formData, zipCode: text });
                    if (errors.zipCode) {
                      setErrors({ ...errors, zipCode: "" });
                    }
                  }}
                  placeholder="Zip"
                  placeholderTextColor={COLORS.text.muted}
                  keyboardType="number-pad"
                />
                {errors.zipCode && (
                  <Typography variant="caption" color={COLORS.error}>
                    {errors.zipCode}
                  </Typography>
                )}
              </View>
            </View>

            {/* Country */}
            <View style={styles.inputGroup}>
              <Typography
                variant="body"
                style={StyleSheet.flatten([
                  styles.label,
                  { fontFamily: "Inter-SemiBold" },
                ])}
              >
                Country
              </Typography>
              <TextInput
                style={styles.input}
                value={formData.country}
                onChangeText={(text) =>
                  setFormData({ ...formData, country: text })
                }
                placeholder="Country"
                placeholderTextColor={COLORS.text.muted}
              />
            </View>

            {/* Set as Default */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                setFormData({ ...formData, isDefault: !formData.isDefault })
              }
            >
              <View
                style={[
                  styles.checkbox,
                  formData.isDefault && styles.checkboxChecked,
                ]}
              >
                {formData.isDefault && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={COLORS.cream[100]}
                  />
                )}
              </View>
              <Typography variant="body" style={styles.checkboxLabel}>
                Set as default address
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button onPress={handleSubmit} size="lg" fullWidth disabled={loading}>
            {loading ? "Saving..." : "Save Address"}
          </Button>
        </View>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
  },
  form: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.text.primary,
    backgroundColor: COLORS.surface,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginRight: SPACING.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.espresso[500],
    borderColor: COLORS.espresso[500],
  },
  checkboxLabel: {
    flex: 1,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
});
