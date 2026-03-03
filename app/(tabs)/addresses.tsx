// app/(tabs)/addresses.tsx
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await api.get("/api/addresses");
      setAddresses(response.data.addresses || []);
    } catch (error: any) {
      console.error("Failed to fetch addresses:", error);
      if (error.response?.status !== 404) {
        Alert.alert("Error", "Failed to load addresses. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAddresses();
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/api/addresses/${id}/default`);
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        })),
      );
    } catch (error) {
      console.error("Failed to set default address:", error);
      Alert.alert("Error", "Failed to set default address. Please try again.");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/address/edit/${id}` as any);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/addresses/${id}`);
              setAddresses(addresses.filter((addr) => addr.id !== id));
            } catch (error) {
              console.error("Failed to delete address:", error);
              Alert.alert(
                "Error",
                "Failed to delete address. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const handleAddNew = () => {
    router.push("/address/add" as any);
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
            Addresses
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
          Addresses
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.espresso[500]}
          />
        }
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="location-outline"
              size={80}
              color={COLORS.espresso[300]}
            />
            <Typography variant="h3" style={styles.emptyTitle}>
              No addresses saved
            </Typography>
            <Typography variant="body" style={styles.emptyText}>
              Add an address for faster checkout
            </Typography>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map((address) => (
              <View key={address.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressTitleRow}>
                    <Typography variant="h3">{address.fullName}</Typography>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Typography variant="caption" color={COLORS.cream[100]}>
                          Default
                        </Typography>
                      </View>
                    )}
                  </View>

                  <View style={styles.addressActions}>
                    <TouchableOpacity
                      onPress={() => handleEdit(address.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={COLORS.espresso[500]}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(address.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.addressDetails}>
                  <Typography variant="body" style={styles.addressLine}>
                    {address.addressLine1}
                  </Typography>
                  {address.addressLine2 && (
                    <Typography variant="body" style={styles.addressLine}>
                      {address.addressLine2}
                    </Typography>
                  )}
                  <Typography variant="body" style={styles.addressLine}>
                    {address.city}, {address.state} {address.zipCode}
                  </Typography>
                  <Typography variant="body" style={styles.addressLine}>
                    {address.country}
                  </Typography>
                  <Typography variant="body" style={styles.addressLine}>
                    {address.phone}
                  </Typography>
                </View>

                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    onPress={() => handleSetDefault(address.id)}
                    style={styles.setDefaultButton}
                  >
                    Set as Default
                  </Button>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button onPress={handleAddNew} size="lg" fullWidth>
          Add New Address
        </Button>
      </View>
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
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING["2xl"],
    minHeight: 400,
  },
  emptyTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    color: COLORS.text.muted,
    textAlign: "center",
  },
  addressList: {
    padding: SPACING.lg,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: COLORS.espresso[500],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addressActions: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  actionButton: {
    padding: SPACING.xs,
  },
  addressDetails: {
    gap: SPACING.xs,
  },
  addressLine: {
    color: COLORS.text.secondary,
  },
  setDefaultButton: {
    marginTop: SPACING.md,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
});
