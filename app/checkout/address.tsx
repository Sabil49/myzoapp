// app/checkout/address.tsx

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

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

  const handleSubmit = async () => {
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.addressLine1 ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/addresses", formData);
      Alert.alert("Success", "Address added successfully");
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to add address",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2">Add New Address</Typography>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.form}>
        <Input
          label="Full Name *"
          value={formData.fullName}
          onChangeText={(fullName) => setFormData({ ...formData, fullName })}
          placeholder="John Doe"
        />

        <Input
          label="Phone *"
          value={formData.phone}
          onChangeText={(phone) => setFormData({ ...formData, phone })}
          placeholder="+1 (555) 123-4567"
          keyboardType="phone-pad"
        />

        <Input
          label="Address Line 1 *"
          value={formData.addressLine1}
          onChangeText={(addressLine1) =>
            setFormData({ ...formData, addressLine1 })
          }
          placeholder="123 Main Street"
        />

        <Input
          label="Address Line 2"
          value={formData.addressLine2}
          onChangeText={(addressLine2) =>
            setFormData({ ...formData, addressLine2 })
          }
          placeholder="Apt 4B"
        />

        <View style={styles.row}>
          <Input
            label="City *"
            value={formData.city}
            onChangeText={(city) => setFormData({ ...formData, city })}
            placeholder="New York"
            containerStyle={styles.halfWidth}
          />

          <Input
            label="State *"
            value={formData.state}
            onChangeText={(state) => setFormData({ ...formData, state })}
            placeholder="NY"
            containerStyle={styles.halfWidth}
          />
        </View>

        <Input
          label="ZIP Code *"
          value={formData.zipCode}
          onChangeText={(zipCode) => setFormData({ ...formData, zipCode })}
          placeholder="10001"
          keyboardType="number-pad"
        />

        <Button
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        >
          Save Address
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});
