// components/admin/OrderDetailModal.tsx

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  order: any;
  onClose: () => void;
  onUpdate: () => void;
}

export function OrderDetailModal({ order, onClose, onUpdate }: Props) {
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || "",
  );
  const [carrier, setCarrier] = useState(order.carrier || "");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.put(`/api/orders/${order.id}/status`, {
        status,
        trackingNumber,
        carrier,
        notes,
      });

      Alert.alert("Success", "Order status updated");
      onUpdate();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h3">Order {order.orderNumber}</Typography>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.espresso[500]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Customer
            </Typography>
            <Typography variant="body">
              {order.user.firstName} {order.user.lastName}
            </Typography>
            <Typography variant="caption" color={COLORS.text.muted}>
              {order.user.email}
            </Typography>
          </View>

          <View style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Items
            </Typography>
            {order.items.map((item: any, index: number) => (
              <View key={index} style={styles.item}>
                <Typography variant="body">{item.product.name}</Typography>
                <Typography variant="caption" color={COLORS.text.muted}>
                  {item.product.styleCode} • Qty: {item.quantity}
                </Typography>
                <Typography variant="label" color={COLORS.espresso[500]}>
                  ${Number(item.price).toFixed(2)}
                </Typography>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Update Status
            </Typography>

            <View style={styles.pickerContainer}>
              <Typography variant="caption" color={COLORS.text.muted}>
                Status
              </Typography>
              <Picker
                selectedValue={status}
                onValueChange={setStatus}
                style={styles.picker}
              >
                <Picker.Item label="Placed" value="PLACED" />
                <Picker.Item label="Confirmed" value="CONFIRMED" />
                <Picker.Item label="Processing" value="PROCESSING" />
                <Picker.Item label="Shipped" value="SHIPPED" />
                <Picker.Item label="Delivered" value="DELIVERED" />
                <Picker.Item label="Cancelled" value="CANCELLED" />
              </Picker>
            </View>

            {status === "SHIPPED" && (
              <>
                <Input
                  label="Tracking Number"
                  value={trackingNumber}
                  onChangeText={setTrackingNumber}
                  placeholder="Enter tracking number"
                />
                <Input
                  label="Carrier"
                  value={carrier}
                  onChangeText={setCarrier}
                  placeholder="FedEx, UPS, USPS"
                />
              </>
            )}

            <Input
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="Add any notes..."
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button variant="secondary" onPress={onClose} style={styles.button}>
            Cancel
          </Button>
          <Button
            onPress={handleUpdate}
            loading={loading}
            style={styles.button}
          >
            Update Status
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  item: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerContainer: {
    marginBottom: SPACING.lg,
  },
  picker: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    flex: 1,
  },
});
