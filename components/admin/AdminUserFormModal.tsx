// components/admin/AdminUserFormModal.tsx

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import { storage } from "@/services/storage";
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
  user?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminUserFormModal({ user, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    email: user?.email || "",
    password: "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    role: user?.role || "CUSTOMER",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!user && !formData.password) {
      Alert.alert("Error", "Password is required for new users");
      return;
    }

    setLoading(true);
    try {
      const token = await storage.getItem("authToken");

      if (user) {
        // Update existing user
        await api.put(`/api/admin/users/${user.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        });
        Alert.alert("Success", "User updated successfully");
      } else {
        // Create new user
        await api.post("/api/admin/users", formData);
        Alert.alert("Success", "User created successfully");
      }

      onSuccess();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to save user",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h3">
            {user ? "Edit User" : "Create User"}
          </Typography>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.espresso[500]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.form}>
          <Input
            label="Email *"
            value={formData.email}
            onChangeText={(email) => setFormData({ ...formData, email })}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="user@example.com"
            editable={!user} // Can't change email for existing users
          />

          {!user && (
            <Input
              label="Password *"
              value={formData.password}
              onChangeText={(password) =>
                setFormData({ ...formData, password })
              }
              secureTextEntry
              placeholder="••••••••"
            />
          )}

          <View style={styles.row}>
            <Input
              label="First Name *"
              value={formData.firstName}
              onChangeText={(firstName) =>
                setFormData({ ...formData, firstName })
              }
              placeholder="John"
              containerStyle={styles.halfWidth}
            />

            <Input
              label="Last Name *"
              value={formData.lastName}
              onChangeText={(lastName) =>
                setFormData({ ...formData, lastName })
              }
              placeholder="Doe"
              containerStyle={styles.halfWidth}
            />
          </View>

          <View>
            <Typography
              variant="caption"
              color={COLORS.text.muted}
              style={styles.label}
            >
              Role *
            </Typography>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.role}
                onValueChange={(role) => setFormData({ ...formData, role })}
                style={styles.picker}
              >
                <Picker.Item label="Customer" value="CUSTOMER" />
                <Picker.Item label="Admin" value="ADMIN" />
              </Picker>
            </View>
          </View>

          {formData.role === "ADMIN" && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={COLORS.error} />
              <Typography variant="caption" color={COLORS.error}>
                Admin users have full access to the admin panel and can manage
                all data.
              </Typography>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button variant="ghost" onPress={onClose} style={styles.button}>
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            loading={loading}
            style={styles.button}
          >
            {user ? "Update" : "Create"}
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
  label: {
    marginBottom: SPACING.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  warningBox: {
    flexDirection: "row",
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
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
