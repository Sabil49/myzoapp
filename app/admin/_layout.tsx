// app/admin/_layout.tsx

import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

export default function AdminLayout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
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

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/auth/login");
      return;
    }

    if (isAuthenticated && user && user.role !== "ADMIN") {
      Alert.alert("Access Denied", "Admin privileges required");
      dispatch(logout());
      router.replace("/auth/login");
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          router.replace("/auth/login");
        },
      },
    ]);
  };

  if (!isAuthenticated || !user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Typography variant="h2" color={COLORS.cream[100]}>
            Admin Panel
          </Typography>
          <Typography variant="caption" color={COLORS.cream[300]}>
            {user.firstName} {user.lastName}
          </Typography>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons
            name="log-out-outline"
            size={24}
            color={COLORS.cream[100]}
          />
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.espresso[500],
          tabBarInactiveTintColor: COLORS.text.muted,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            fontFamily: "Inter-SemiBold",
            marginTop: -2,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="products"
          options={{
            title: "Products",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "cube" : "cube-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: "Orders",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "bag-handle" : "bag-handle-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="users"
          options={{
            title: "Users",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: COLORS.espresso[500],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING["2xl"] + 20,
  },
  logoutButton: {
    padding: SPACING.sm,
  },
});
