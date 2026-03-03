// app/auth/register.tsx

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/register", formData);

      Alert.alert("Success", "Account created successfully! Please login.", [
        {
          text: "OK",
          onPress: () => router.replace("/auth/login"),
        },
      ]);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Alert.alert(
          "Registration Failed",
          error.response?.data?.error || "Failed to create account",
        );
      } else {
        Alert.alert("Registration Failed", "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Typography variant="h1" style={styles.title}>
              Create Account
            </Typography>
            <Typography variant="body" color={COLORS.text.secondary}>
              Join our luxury collection
            </Typography>
          </View>

          <View style={styles.form}>
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

            <Input
              label="Email *"
              value={formData.email}
              onChangeText={(email) => setFormData({ ...formData, email })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your@email.com"
            />

            <Input
              label="Phone (Optional)"
              value={formData.phone}
              onChangeText={(phone) => setFormData({ ...formData, phone })}
              keyboardType="phone-pad"
              placeholder="+1 (555) 123-4567"
            />

            <Input
              label="Password *"
              value={formData.password}
              onChangeText={(password) =>
                setFormData({ ...formData, password })
              }
              secureTextEntry
              placeholder="Minimum 6 characters"
            />

            <Button
              onPress={handleRegister}
              loading={loading}
              style={styles.button}
            >
              Create Account
            </Button>

            <Button
              variant="ghost"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              Already have an account? Sign in
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING.xl,
  },
  content: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING["2xl"],
  },
  title: {
    marginBottom: SPACING.xs,
  },
  form: {
    gap: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  button: {
    marginTop: SPACING.md,
  },
  backButton: {
    marginTop: SPACING.sm,
  },
});
