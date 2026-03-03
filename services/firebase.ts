// src/services/firebase.ts

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import api from "./api";
import { storage } from "./storage";

export const initializeFirebase = async () => {
  if (!Device.isDevice) {
    console.log("Push notifications only work on physical devices");
    return;
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification!");
    return;
  }

  // Get Expo projectId
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn("Expo projectId not found - skipping push notifications");
    return;
  }

  // Get Expo push token
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Store token locally for later registration
    await storage.setItem("pendingPushToken", token.data);

    // Try to register immediately if user is logged in
    const authToken = await storage.getItem("authToken");
    if (authToken) {
      await registerPushToken(token.data);
    } else {
      console.log("Push token saved - will register after login");
    }
  } catch (error) {
    console.error("Error getting Expo push token:", error);
  }

  // Configure notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

export const registerPushToken = async (token: string) => {
  try {
    await api.post("/api/notifications/register", {
      token,
      platform: Platform.OS,
    });
    console.log("Push token registered successfully");
    // Clear pending token after successful registration
    await storage.removeItem("pendingPushToken");
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log(
        "Not authenticated - push token will be registered after login",
      );
    } else {
      console.error(
        "Error registering push token:",
        error.response?.data || error.message,
      );
    }
  }
};

// Call this after user logs in
export const registerPendingPushToken = async () => {
  const pendingToken = await storage.getItem("pendingPushToken");
  if (pendingToken) {
    await registerPushToken(pendingToken);
  }
};

export const subscribeToPushNotifications = (
  callback: (notification: any) => void,
) => {
  return Notifications.addNotificationReceivedListener(callback);
};

export const subscribeToNotificationResponse = (
  callback: (response: any) => void,
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};
