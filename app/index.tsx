// app/index.tsx

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Redirect } from "expo-router";

export default function Index() {
  const dispatch = useAppDispatch();
  // Defensive selector: some environments may call selector with undefined state
  const authState = useAppSelector((state: any) => {
    if (!state) {
      console.warn("Redux state is undefined in Index selector");
      return null;
    }
    return state.auth;
  });

  const isAuthenticated = authState?.isAuthenticated ?? false;
  const user = authState?.user ?? null;
  // auth restoration moved to layout; index only needs auth state

  console.log("Index - isAuthenticated:", isAuthenticated);
  console.log("Index - user:", user);

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Redirect href="/auth/login" />;
  }

  // Route based on role
  if (user?.role === "ADMIN") {
    console.log("Admin user, redirecting to admin");
    return <Redirect href="/admin" />;
  }

  console.log("Customer user, redirecting to tabs");
  return <Redirect href="/(tabs)" />;
}
