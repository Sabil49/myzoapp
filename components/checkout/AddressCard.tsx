// components/checkout/AddressCard.tsx
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import type { Address } from "@/types/order";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onPress: (address: Address) => void;
}

export function AddressCard({
  address,
  isSelected,
  onPress,
}: AddressCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={() => onPress(address)}
      activeOpacity={0.7}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${address.fullName}, ${address.addressLine1}, ${address.city}, ${address.state} ${address.zipCode}${address.isDefault ? ", Default address" : ""}`}
    >
      <View style={styles.radioContainer}>
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
      <View style={styles.content}>
        <Typography variant="body" style={styles.name}>
          {address.fullName}
        </Typography>
        <Typography variant="caption" color={COLORS.text.muted}>
          {address.phone}
        </Typography>
        <Typography
          variant="caption"
          color={COLORS.text.muted}
          style={styles.address}
        >
          {address.addressLine1}
          {address.addressLine2 ? `, ${address.addressLine2}` : ""}
        </Typography>
        <Typography variant="caption" color={COLORS.text.muted}>
          {address.city}, {address.state} {address.zipCode}
        </Typography>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={COLORS.espresso[500]}
            />
            <Typography
              variant="caption"
              style={styles.defaultText}
              color={COLORS.espresso[500]}
            >
              Default
            </Typography>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  containerSelected: {
    borderColor: COLORS.espresso[500],
    backgroundColor: COLORS.cream[300],
  },
  radioContainer: {
    paddingTop: 2,
    marginRight: SPACING.md,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: COLORS.espresso[500],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.espresso[500],
  },
  content: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    marginBottom: 4,
  },
  address: {
    marginTop: SPACING.xs,
  },
  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  defaultText: {
    fontWeight: "500",
    marginLeft: 4,
  },
});
