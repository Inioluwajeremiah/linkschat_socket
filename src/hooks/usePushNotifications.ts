import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppSelector } from "./useRedux";
import { api } from "../services/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    // console.warn("Push notifications require a physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    // console.warn("Push notification permission denied");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("chatapp_default", {
      name: "LinksChat",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: "notification_sound.wav",
      lightColor: "#00d4aa",
    });
    await Notifications.setNotificationChannelAsync("chatapp_calls", {
      name: "Calls",
      importance: Notifications.AndroidImportance.MAX,
      sound: "notification_sound.wav",
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  return token;
}

export function usePushNotifications() {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const router = useRouter();
  // const notificationListener = useRef<Notifications.Subscription>();
  // const responseListener = useRef<Notifications.Subscription>();
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Register and send token to backend
    const register = async () => {
      try {
        const token = await registerForPushNotifications();
        if (!token) return;

        const stored = await AsyncStorage.getItem("pushToken");
        if (stored !== token) {
          await AsyncStorage.setItem("pushToken", token);
          // Update via API – reuse the login FCM flow
          await api.post("/users/push-token", { token });
        }
      } catch (err) {
        // console.warn("Push registration failed:", err);
      }
    };

    register();

    // Listen for foreground notifications — we show our own toast instead
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data as Record<
          string,
          string
        >;
        // console.log("📱 Foreground notification:", data?.type);
        // Handled by socket in-app — no duplicate alert needed
      });

    // Handle tap on notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as Record<
          string,
          string
        >;
        switch (data?.type) {
          case "new_message":
            if (data.chatId) router.push(`/chat/${data.chatId}`);
            break;
          case "missed_call":
          case "incoming_call":
            router.push("/call/incoming");
            break;
          case "new_status":
            router.push("/(tabs)/status");
            break;
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated]);
}
