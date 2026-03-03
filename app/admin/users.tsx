// app/admin/users.tsx

import { AdminUserFormModal } from "@/components/admin/AdminUserFormModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import api from "@/services/api";
import { useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
}

export default function AdminUsers() {
  const currentUser = useAppSelector((state: any) =>
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

  // auth slice does not expose loading by default; assume false when missing
  const authLoading = useAppSelector((state: any) =>
    typeof state?.auth === "object" &&
    state.auth !== null &&
    "loading" in state.auth
      ? state.auth.loading
      : false,
  );
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ADMIN" | "CUSTOMER">("ALL");

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Check authentication and admin role
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    if (currentUser?.role !== "ADMIN") {
      router.replace("/(tabs)");
      return;
    }

    // Only fetch if authenticated and admin
    fetchUsers();
  }, [isAuthenticated, currentUser, authLoading, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/admin/users", {
        params: filter !== "ALL" ? { role: filter } : {},
      });
      setUsers(response.data.users);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      setError(error.response?.data?.error || "Failed to load users");

      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        router.replace("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/admin/users/${id}`);
              Alert.alert("Success", "User deleted successfully");
              fetchUsers();
            } catch (error) {
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ],
    );
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const renderUser = ({ item }: { item: User }) => (
    <Card style={styles.userCard}>
      <View style={styles.userRow}>
        <View style={styles.userAvatar}>
          <Typography variant="h3" color={COLORS.espresso[500]}>
            {item.firstName[0]}
            {item.lastName[0]}
          </Typography>
        </View>

        <View style={styles.userInfo}>
          <Typography variant="body">
            {item.firstName} {item.lastName}
          </Typography>
          <Typography variant="caption" color={COLORS.text.muted}>
            {item.email}
          </Typography>
          <View style={styles.userMeta}>
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    item.role === "ADMIN"
                      ? COLORS.espresso[500]
                      : COLORS.gold[400],
                },
              ]}
            >
              <Typography variant="caption" color={COLORS.cream[100]}>
                {item.role}
              </Typography>
            </View>
            <Typography variant="caption" color={COLORS.text.muted}>
              Joined {new Date(item.createdAt).toLocaleDateString()}
            </Typography>
          </View>
        </View>

        <View style={styles.userActions}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.actionButton}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={COLORS.espresso[500]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.espresso[500]} />
        <Typography style={{ marginTop: SPACING.md }}>
          Checking authentication...
        </Typography>
      </View>
    );
  }

  // Show loading while fetching data
  if (loading && users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.espresso[500]} />
        <Typography style={{ marginTop: SPACING.md }}>
          Loading users...
        </Typography>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Typography color={COLORS.error} style={{ marginBottom: SPACING.md }}>
          {error}
        </Typography>
        <Button onPress={fetchUsers}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2">Users</Typography>
        <Button onPress={handleCreate} size="sm">
          <Ionicons name="add" size={20} color={COLORS.cream[100]} />
          Add User
        </Button>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          onPress={() => setFilter("ALL")}
          style={[styles.filterTab, filter === "ALL" && styles.filterTabActive]}
        >
          <Typography
            variant="label"
            color={filter === "ALL" ? COLORS.espresso[500] : COLORS.text.muted}
          >
            All Users
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter("ADMIN")}
          style={[
            styles.filterTab,
            filter === "ADMIN" && styles.filterTabActive,
          ]}
        >
          <Typography
            variant="label"
            color={
              filter === "ADMIN" ? COLORS.espresso[500] : COLORS.text.muted
            }
          >
            Admins
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter("CUSTOMER")}
          style={[
            styles.filterTab,
            filter === "CUSTOMER" && styles.filterTabActive,
          ]}
        >
          <Typography
            variant="label"
            color={
              filter === "CUSTOMER" ? COLORS.espresso[500] : COLORS.text.muted
            }
          >
            Customers
          </Typography>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchUsers} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Typography color={COLORS.text.muted}>No users found</Typography>
          </View>
        }
      />

      {showModal && (
        <AdminUserFormModal
          user={editingUser}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.espresso[100],
    borderColor: COLORS.espresso[500],
  },
  list: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  userCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.cream[300],
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  userInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  userMeta: {
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "center",
  },
  roleBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  userActions: {
    gap: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.sm,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: "center",
  },
});
