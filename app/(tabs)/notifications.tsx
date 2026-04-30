// app/(tabs)/notifications.tsx
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import { useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from "react-native";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: string;
  category: "orders" | "marketing" | "products" | "account";
}

export default function NotificationsScreen() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state: any) =>
    typeof state?.auth === "object" &&
    state.auth !== null &&
    "isAuthenticated" in state.auth
      ? state.auth.isAuthenticated
      : false,
  );
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "order_status",
      title: "Order Status Updates",
      description:
        "Get notified when your order is confirmed, shipped, and delivered",
      enabled: true,
      icon: "cube-outline",
      category: "orders",
    },
    {
      id: "order_reminders",
      title: "Order Reminders",
      description: "Reminders about pending orders and delivery schedules",
      enabled: true,
      icon: "notifications-outline",
      category: "orders",
    },
    {
      id: "promotions",
      title: "Exclusive Offers",
      description:
        "Receive notifications about special promotions and limited-time deals",
      enabled: true,
      icon: "pricetag-outline",
      category: "marketing",
    },
    {
      id: "new_arrivals",
      title: "New Collection Alerts",
      description: "Be the first to know when new luxury bags arrive",
      enabled: false,
      icon: "sparkles-outline",
      category: "products",
    },
    {
      id: "price_drops",
      title: "Wishlist Price Alerts",
      description: "Get notified when items in your wishlist go on sale",
      enabled: true,
      icon: "trending-down-outline",
      category: "products",
    },
    {
      id: "back_in_stock",
      title: "Back in Stock",
      description: "Notify when out-of-stock items you viewed become available",
      enabled: false,
      icon: "refresh-outline",
      category: "products",
    },
    {
      id: "cart_reminders",
      title: "Cart Reminders",
      description: "Gentle reminders about items left in your shopping bag",
      enabled: true,
      icon: "bag-outline",
      category: "account",
    },
    {
      id: "account_security",
      title: "Account Security",
      description:
        "Important notifications about your account security (Cannot be disabled)",
      enabled: true,
      icon: "shield-checkmark-outline",
      category: "account",
    },
  ]);

  useEffect(() => {
    // TODO: Fetch user's notification preferences from API
    // For now, using local state
    setLoading(false);
  }, []);

  const toggleSetting = useCallback(
    async (id: string) => {
      // Don't allow disabling account security notifications
      const setting = settings.find((s) => s.id === id);
      if (setting?.id === "account_security") {
        Alert.alert(
          "Cannot Disable",
          "Account security notifications cannot be disabled for your protection.",
        );
        return;
      }

      try {
        // TODO: Save preference to backend
        // await api.patch('/api/user/notification-preferences', { [id]: !setting?.enabled });

        setSettings((prev) =>
          prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
        );
      } catch (error) {
        console.error("Failed to update notification preference:", error);
        Alert.alert(
          "Error",
          "Failed to update notification preference. Please try again.",
        );
      }
    },
    [settings],
  );

  const openDeviceSettings = () => {
    Alert.alert(
      "Push Notification Settings",
      "To enable or disable push notifications, please update your device settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => Linking.openSettings(),
        },
      ],
    );
  };

  const enabledCount = settings.filter((s) => s.enabled).length;

  // Require authentication
  if (!isAuthenticated) {
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
            Notifications
          </Typography>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="notifications-outline"
            size={80}
            color={COLORS.espresso[300]}
          />
          <Typography variant="h3" style={styles.emptyTitle}>
            Sign in to manage notifications
          </Typography>
          <Typography variant="body" style={styles.emptyText}>
            Create an account or sign in to customize your notification
            preferences
          </Typography>
          <Button
            onPress={() => router.push("/auth/login")}
            style={styles.authButton}
          >
            Sign In
          </Button>
          <Button
            onPress={() => router.push("/auth/register")}
            variant="secondary"
            style={styles.authButton}
          >
            Create Account
          </Button>
        </View>
      </SafeAreaView>
    );
  }

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
            Notifications
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
          Notifications
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <View style={styles.summaryContent}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={COLORS.espresso[500]}
            />
            <View style={styles.summaryText}>
              <Typography variant="body">
                {enabledCount} of {settings.length} notifications enabled
              </Typography>
              <Typography variant="caption" color={COLORS.text.muted}>
                Manage your notification preferences for Myzo
              </Typography>
            </View>
          </View>
        </View>

        {/* Order Notifications */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Order Notifications
          </Typography>
          <View style={styles.settingsList}>
            {settings
              .filter((s) => s.category === "orders")
              .map((setting, index, arr) => (
                <View
                  key={setting.id}
                  style={[
                    styles.settingItem,
                    index === arr.length - 1 && styles.settingItemLast,
                  ]}
                >
                  <View style={styles.settingIcon}>
                    <Ionicons
                      name={setting.icon as any}
                      size={24}
                      color={COLORS.espresso[500]}
                    />
                  </View>

                  <View style={styles.settingContent}>
                    <Typography variant="body" style={styles.settingTitle}>
                      {setting.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={COLORS.text.muted}
                      style={styles.settingDescription}
                    >
                      {setting.description}
                    </Typography>
                  </View>

                  <Switch
                    value={setting.enabled}
                    onValueChange={() => toggleSetting(setting.id)}
                    trackColor={{
                      false: COLORS.border,
                      true: COLORS.espresso[300],
                    }}
                    thumbColor={
                      setting.enabled ? COLORS.espresso[500] : COLORS.cream[100]
                    }
                    ios_backgroundColor={COLORS.border}
                  />
                </View>
              ))}
          </View>
        </View>

        {/* Marketing Notifications */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Marketing & Promotions
          </Typography>
          <View style={styles.settingsList}>
            {settings
              .filter((s) => s.category === "marketing")
              .map((setting, index, arr) => (
                <View
                  key={setting.id}
                  style={[
                    styles.settingItem,
                    index === arr.length - 1 && styles.settingItemLast,
                  ]}
                >
                  <View style={styles.settingIcon}>
                    <Ionicons
                      name={setting.icon as any}
                      size={24}
                      color={COLORS.espresso[500]}
                    />
                  </View>

                  <View style={styles.settingContent}>
                    <Typography variant="body" style={styles.settingTitle}>
                      {setting.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={COLORS.text.muted}
                      style={styles.settingDescription}
                    >
                      {setting.description}
                    </Typography>
                  </View>

                  <Switch
                    value={setting.enabled}
                    onValueChange={() => toggleSetting(setting.id)}
                    trackColor={{
                      false: COLORS.border,
                      true: COLORS.espresso[300],
                    }}
                    thumbColor={
                      setting.enabled ? COLORS.espresso[500] : COLORS.cream[100]
                    }
                    ios_backgroundColor={COLORS.border}
                  />
                </View>
              ))}
          </View>
        </View>

        {/* Product Notifications */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Product Updates
          </Typography>
          <View style={styles.settingsList}>
            {settings
              .filter((s) => s.category === "products")
              .map((setting, index, arr) => (
                <View
                  key={setting.id}
                  style={[
                    styles.settingItem,
                    index === arr.length - 1 && styles.settingItemLast,
                  ]}
                >
                  <View style={styles.settingIcon}>
                    <Ionicons
                      name={setting.icon as any}
                      size={24}
                      color={COLORS.espresso[500]}
                    />
                  </View>

                  <View style={styles.settingContent}>
                    <Typography variant="body" style={styles.settingTitle}>
                      {setting.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={COLORS.text.muted}
                      style={styles.settingDescription}
                    >
                      {setting.description}
                    </Typography>
                  </View>

                  <Switch
                    value={setting.enabled}
                    onValueChange={() => toggleSetting(setting.id)}
                    trackColor={{
                      false: COLORS.border,
                      true: COLORS.espresso[300],
                    }}
                    thumbColor={
                      setting.enabled ? COLORS.espresso[500] : COLORS.cream[100]
                    }
                    ios_backgroundColor={COLORS.border}
                  />
                </View>
              ))}
          </View>
        </View>

        {/* Account Notifications */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Account & Security
          </Typography>
          <View style={styles.settingsList}>
            {settings
              .filter((s) => s.category === "account")
              .map((setting, index, arr) => (
                <View
                  key={setting.id}
                  style={[
                    styles.settingItem,
                    index === arr.length - 1 && styles.settingItemLast,
                  ]}
                >
                  <View style={styles.settingIcon}>
                    <Ionicons
                      name={setting.icon as any}
                      size={24}
                      color={COLORS.espresso[500]}
                    />
                  </View>

                  <View style={styles.settingContent}>
                    <Typography variant="body" style={styles.settingTitle}>
                      {setting.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={COLORS.text.muted}
                      style={styles.settingDescription}
                    >
                      {setting.description}
                    </Typography>
                  </View>

                  <Switch
                    value={setting.enabled}
                    onValueChange={() => toggleSetting(setting.id)}
                    trackColor={{
                      false: COLORS.border,
                      true: COLORS.espresso[300],
                    }}
                    thumbColor={
                      setting.enabled ? COLORS.espresso[500] : COLORS.cream[100]
                    }
                    ios_backgroundColor={COLORS.border}
                    disabled={setting.id === "account_security"}
                  />
                </View>
              ))}
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.espresso[500]}
            />
            <View style={styles.infoText}>
              <Typography variant="caption" color={COLORS.text.secondary}>
                Notification settings can be changed at any time. Order status
                and account security notifications are essential and cannot be
                disabled.
              </Typography>
            </View>
          </View>
        </View>

        <View style={styles.pushNotificationsSection}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Device Settings
          </Typography>
          <TouchableOpacity
            style={styles.deviceSettingItem}
            onPress={openDeviceSettings}
          >
            <View style={styles.deviceSettingContent}>
              <Ionicons
                name="phone-portrait-outline"
                size={24}
                color={COLORS.espresso[500]}
              />
              <View style={styles.deviceSettingText}>
                <Typography variant="body">
                  Push Notification Permissions
                </Typography>
                <Typography variant="caption" color={COLORS.text.muted}>
                  Manage push notifications in device settings
                </Typography>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.text.muted}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
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
  summary: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  summaryText: {
    flex: 1,
    gap: SPACING.xs,
  },
  section: {
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  settingsList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  settingTitle: {
    marginBottom: 2,
  },
  settingDescription: {
    lineHeight: 18,
  },
  infoSection: {
    padding: SPACING.lg,
  },
  infoCard: {
    flexDirection: "row",
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.cream[100],
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
  },
  pushNotificationsSection: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  deviceSettingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  deviceSettingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    flex: 1,
  },
  deviceSettingText: {
    flex: 1,
    gap: SPACING.xs,
  },
  bottomSpacer: {
    height: SPACING["2xl"],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING["2xl"],
  },
  emptyTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    color: COLORS.text.muted,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  authButton: {
    minWidth: 200,
    marginBottom: SPACING.md,
  },
});
