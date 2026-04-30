// app/(tabs)/account.tsx
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
// import selectIsAuthenticated from '@/store/slices/authSlice';
import { Ionicons } from "@expo/vector-icons";

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

const menuItems: MenuItem[] = [
  { icon: "receipt-outline", label: "My Orders", route: "/orders" },
  { icon: "heart-outline", label: "Wishlist", route: "/wishlist" },
  { icon: "location-outline", label: "Addresses", route: "/addresses" },
  { icon: "card-outline", label: "Payment Methods", route: "/payment-methods" },
  {
    icon: "notifications-outline",
    label: "Notifications",
    route: "/notifications",
  },
  { icon: "help-circle-outline", label: "Help & Support", route: "/support" },
];

export default function AccountScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [deleting, setDeleting] = useState(false);
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

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/auth/login");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            confirmDeleteAccount();
          },
          style: "destructive",
        },
      ],
    );
  };

  const confirmDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete("/api/auth/account");
      Alert.alert(
        "Account Deleted",
        "Your account has been successfully deleted.",
      );
      dispatch(logout());
      router.replace("/auth/login");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to delete account. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleMenuPress = (route: string) => {
    router.push(route as any);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthContainer}>
          <Typography variant="h2" style={styles.unauthTitle}>
            Welcome
          </Typography>
          <Typography variant="body" style={styles.unauthText}>
            Sign in to access your account and enjoy a personalized shopping
            experience
          </Typography>
          <Button
            onPress={() => router.push("/auth/login")}
            size="lg"
            style={styles.authButton}
          >
            Sign In
          </Button>
          <Button
            onPress={() => router.push("/auth/register")}
            variant="secondary"
            size="lg"
            style={styles.authButton}
          >
            Create Account
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2">Account</Typography>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Typography variant="h2" color={COLORS.cream[100]}>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Typography>
          </View>
          <Typography variant="h3" style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" style={styles.userEmail}>
            {user?.email}
          </Typography>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={COLORS.espresso[500]}
                />
                <Typography variant="body" style={styles.menuLabel}>
                  {item.label}
                </Typography>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.text.muted}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.logoutSection}>
          <Button onPress={handleLogout} variant="ghost" fullWidth>
            Sign Out
          </Button>
          <Button
            onPress={handleDeleteAccount}
            variant="ghost"
            fullWidth
            disabled={deleting}
            style={styles.deleteButton}
          >
            <Typography variant="body" style={styles.deleteButtonText}>
              Delete Account
            </Typography>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.espresso[500],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  userName: {
    marginBottom: SPACING.xs,
  },
  userEmail: {
    color: COLORS.text.muted,
  },
  menuSection: {
    paddingVertical: SPACING.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  menuLabel: {},
  logoutSection: {
    padding: SPACING.lg,
    marginTop: SPACING.xl,
  },
  deleteButton: {
    marginTop: SPACING.md,
  },
  deleteButtonText: {
    color: "#D32F2F",
  },
  unauthContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  unauthTitle: {
    marginBottom: SPACING.md,
  },
  unauthText: {
    textAlign: "center",
    color: COLORS.text.muted,
    marginBottom: SPACING.xl,
  },
  authButton: {
    minWidth: 250,
    marginBottom: SPACING.md,
  },
});
