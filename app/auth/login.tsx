// app/auth/login.tsx

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import { storage } from "@/services/storage";
import { useAppDispatch } from "@/store/hooks";
import { login } from "@/store/slices/authSlice";
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

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting login...");
      const response = await api.post("/api/auth/login", formData);
      console.log("Login response:", response.data);

      const { user, accessToken, refreshToken } = response.data;

      // Store credentials
      await storage.setItem("authToken", accessToken);
      // Also set accessToken for other axios instances that read that key
      await storage.setItem("accessToken", accessToken);
      await storage.setItem("refreshToken", refreshToken);
      await storage.setItem("user", JSON.stringify(user));

      console.log("Stored tokens, updating Redux...");

      // Update Redux state
      dispatch(login({ user, token: accessToken, refreshToken }));

      console.log("Redux updated, routing based on role:", user.role);

      // Route based on role
      if (user.role === "ADMIN") {
        console.log("Navigating to admin...");
        router.replace("/admin" as any);
      } else {
        console.log("Navigating to tabs...");
        router.replace("/(tabs)");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error || error.message || "Invalid credentials";
        Alert.alert("Login Failed", message);
      } else if (error instanceof Error) {
        Alert.alert("Login Failed", error.message);
      } else {
        Alert.alert("Login Failed", "An unexpected error occurred");
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
              Welcome Back
            </Typography>
            <Typography variant="body" color={COLORS.text.secondary}>
              Sign in to continue
            </Typography>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={formData.email}
              onChangeText={(email) => setFormData({ ...formData, email })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your@email.com"
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(password) =>
                setFormData({ ...formData, password })
              }
              secureTextEntry
              placeholder="••••••••"
            />

            <Button
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
            >
              Sign In
            </Button>

            <Button
              variant="ghost"
              onPress={() => router.push("/auth/register")}
              style={styles.registerButton}
            >
              Don't have an account? Register
            </Button>
          </View>

          <View style={styles.demoCredentials}>
            <Typography
              variant="caption"
              color={COLORS.text.muted}
              style={styles.demoTitle}
            >
              Demo Credentials
            </Typography>
            <View style={styles.demoBox}>
              <Typography variant="caption" color={COLORS.espresso[600]}>
                🔑 Admin Account
              </Typography>
              <Typography variant="caption" color={COLORS.text.secondary}>
                admin@luxurybags.com / Admin@123
              </Typography>
            </View>
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
  button: {
    marginTop: SPACING.md,
  },
  registerButton: {
    marginTop: SPACING.sm,
  },
  demoCredentials: {
    marginTop: SPACING["2xl"],
    padding: SPACING.lg,
    backgroundColor: COLORS.cream[300],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoTitle: {
    textAlign: "center",
    marginBottom: SPACING.md,
    fontWeight: "600",
  },
  demoBox: {
    backgroundColor: COLORS.cream[100],
    padding: SPACING.md,
    borderRadius: 4,
  },
});
