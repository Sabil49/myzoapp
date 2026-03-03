// app/_layout.tsx

import { Typography } from "@/components/ui/Typography";
import { COLORS } from "@/constants/theme";
import { initializeFirebase } from "@/services/firebase";
import { storage } from "@/services/storage";
import { store } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { restoreAuth } from "@/store/slices/authSlice";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Provider, useDispatch } from "react-redux";

SplashScreen.preventAutoHideAsync();

// Outer wrapper ensures Redux provider is in place before any hooks run
export default function RootLayout() {
  return (
    <Provider store={store}>
      <InnerRoot />
    </Provider>
  );
}

function InnerRoot() {
  const [fontsLoaded, fontsError] = useFonts({
    "PlayfairDisplay-Regular": require("@/assets/fonts/PlayfairDisplay-Regular.ttf"),
    "PlayfairDisplay-Bold": require("@/assets/fonts/PlayfairDisplay-Bold.ttf"),
    "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("@/assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("@/assets/fonts/Inter-SemiBold.ttf"),
  });

  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const dispatch = useDispatch();
  const authState = useAppSelector((state: any) => state.auth);
  const [authRestored, setAuthRestored] = useState(false);

  // Hide splash screen immediately on mount
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    console.log("[Layout] Init: fonts loading, firebase init, auth restore");

    // initialize firebase separately
    initializeFirebase()
      .then(() => {
        console.log("[Layout] Firebase initialized");
        setFirebaseInitialized(true);
      })
      .catch((error: Error) => {
        console.error("[Layout] Firebase initialization failed:", error);
        setFirebaseInitialized(true);
      });

    // restore auth from storage
    const restore = async () => {
      try {
        const token = await storage.getItem("authToken");
        const refreshToken = await storage.getItem("refreshToken");
        const userJson = await storage.getItem("user");
        console.log(
          "[Layout] Auth restore: token?",
          !!token,
          "refreshToken?",
          !!refreshToken,
        );
        if (token && refreshToken && userJson) {
          const user = JSON.parse(userJson);
          dispatch(restoreAuth({ user, token, refreshToken }));
        }
      } catch (e) {
        console.error("[Layout] Failed to restore auth", e);
      } finally {
        console.log("[Layout] Auth restored");
        setAuthRestored(true);
      }
    };
    restore();
  }, [dispatch]);

  useEffect(() => {
    console.log("[Layout] Fonts loaded?", fontsLoaded, "Error?", !!fontsError);
    if (fontsError) {
      console.error("[Layout] Font loading error:", fontsError);
    }
  }, [fontsLoaded, fontsError]);

  const isLoading =
    (!fontsLoaded && !fontsError) || !firebaseInitialized || !authRestored;
  console.log(
    "[Layout] Render check - isLoading?",
    isLoading,
    "{ fontsLoaded:",
    fontsLoaded,
    "firebaseInitialized:",
    firebaseInitialized,
    "authRestored:",
    authRestored,
    "}",
  );

  // show loader until fonts, firebase and auth restored
  if (isLoading) {
    console.log("[Layout] Showing loader");
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#faf6f1",
          justifyContent: "center",
          alignItems: "center",
        }}
        edges={["top", "bottom", "left", "right"]}
      >
        <ActivityIndicator size="large" color="#2c1f0e" />
      </SafeAreaView>
    );
  }

  console.log("[Layout] Loading complete, showing Stack");

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="checkout/index" />
        <Stack.Screen name="checkout/success" />
        <Stack.Screen name="orders/index" />
        <Stack.Screen name="orders/[id]" />
      </Stack>

      {fontsError && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: COLORS.cream[300],
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
          }}
        >
          <Typography
            variant="caption"
            style={{ textAlign: "center", color: COLORS.text.secondary }}
          >
            Using system fonts (custom fonts unavailable)
          </Typography>
        </View>
      )}
    </>
  );
}
