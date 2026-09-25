import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { api } from "../services/api";
import { IncomingCallData, setIncomingCall } from "@/store/slices/callSlice";
import { runWhenAppReady } from "@/services/pendingNavigation";

// Notification taps already acted on (by request identifier).
const handledTaps = new Set<string>();

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

  // Pass the EAS project id explicitly; relying on it being inferred is a
  // known way to get no token (or a token for the wrong project) in
  // standalone builds.
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  return token;
}

// export function usePushNotifications() {
//   const { isAuthenticated } = useAppSelector((s) => s.auth);
//   const router = useRouter();
//   // const notificationListener = useRef<Notifications.Subscription>();
//   // const responseListener = useRef<Notifications.Subscription>();
//   const notificationListener = useRef<Notifications.EventSubscription | null>(
//     null
//   );
//   const responseListener = useRef<Notifications.EventSubscription | null>(null);

//   useEffect(() => {
//     if (!isAuthenticated) return;

//     // Register and send token to backend
//     const register = async () => {
//       try {
//         const token = await registerForPushNotifications();
//         if (!token) return;

//         const stored = await AsyncStorage.getItem("pushToken");
//         if (stored !== token) {
//           await AsyncStorage.setItem("pushToken", token);
//           // Update via API – reuse the login FCM flow
//           await api.post("/users/push-token", { token });
//         }
//       } catch (err) {
//         // console.warn("Push registration failed:", err);
//       }
//     };

//     register();

//     // Listen for foreground notifications — we show our own toast instead
//     notificationListener.current =
//       Notifications.addNotificationReceivedListener((notification) => {
//         const data = notification.request.content.data as Record<
//           string,
//           string
//         >;
//         // console.log("📱 Foreground notification:", data?.type);
//         // Handled by socket in-app — no duplicate alert needed
//       });

//     // Handle tap on notification
//     responseListener.current =
//       Notifications.addNotificationResponseReceivedListener((response) => {
//         const data = response.notification.request.content.data as Record<
//           string,
//           string
//         >;
//         switch (data?.type) {
//           case "new_message":
//             if (data.chatId) router.push(`/chat/${data.chatId}`);
//             break;
//           case "missed_call":
//           case "incoming_call":
//             router.push("/call/incoming");
//             break;
//           case "new_status":
//             router.push("/(tabs)/status");
//             break;
//         }
//       });

//     return () => {
//       notificationListener.current?.remove();
//       responseListener.current?.remove();
//     };
//   }, [isAuthenticated]);
// }

type NotificationType =
  | "new_message"
  | "missed_call"
  | "incoming_call"
  | "new_status";

interface PushNotificationData {
  // Type of notification
  type?: NotificationType;

  // Call data
  callId?: string;
  callType?: "audio" | "video";

  callerId?: string;
  callerName?: string;
  callerPhone?: string;
  callerAvatar?: string;

  // Chat data
  chatId?: string;

  // Group call data
  isGroup?: string | boolean;
  groupName?: string;
  groupAvatar?: string;
}

export function usePushNotifications() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const userId = useAppSelector((state) => state.auth.user?._id);

  const router = useRouter();
  const dispatch = useAppDispatch();

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );

  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    /**
     * Register device for push notifications
     * and send the token to the backend.
     */
    let cancelled = false;

    const register = async () => {
      try {
        const token = await registerForPushNotifications();

        if (!token || !userId) return;

        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem("pushToken"),
          AsyncStorage.getItem("pushTokenUser"),
        ]);

        // Skip only if THIS account already registered THIS token. Checking
        // the token alone meant a second account signing in on the same
        // phone was never registered (and it kept the first account's).
        if (storedToken === token && storedUser === userId) return;

        // Record it only AFTER the server accepted it. It used to be saved
        // first, so a failed request (offline at first launch, an expired
        // token mid-refresh) marked the device "registered" forever and
        // push never worked for that user.
        // Retried a few times: right after a cached-session launch the
        // access token may still be getting refreshed in the background.
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await api.post("/users/push-token", { token });
            await AsyncStorage.multiSet([
              ["pushToken", token],
              ["pushTokenUser", userId],
            ]);
            return;
          } catch (err) {
            if (attempt === 3 || cancelled) throw err;
            await new Promise((r) => setTimeout(r, 4000 * attempt));
          }
        }
      } catch (error) {
        console.warn("Push registration failed:", error);
      }
    };

    register();

    /**
     * Handle notifications received while the app
     * is currently open.
     */
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data as PushNotificationData;

        console.log("📱 Foreground notification:", data);

        // Your socket can handle in-app events here,
        // so we avoid duplicate navigation or alerts.
      });

    /**
     * Handle user tapping a notification.
     */
    const handleResponse = (response: Notifications.NotificationResponse) => {
      // The same tap can arrive twice (listener + launch response).
      const tapId = response.notification.request.identifier;
      if (handledTaps.has(tapId)) return;
      handledTaps.add(tapId);
      Notifications.clearLastNotificationResponseAsync().catch(() => {});

        const data = response.notification.request.content
          .data as PushNotificationData;

        console.log("📲 Notification tapped:", data);

        switch (data.type) {
          /**
           * New chat message
           */
          case "new_message": {
            if (data.chatId) {
              const chatId = data.chatId;
              runWhenAppReady(() => router.push(`/chat/${chatId}`));
            }

            break;
          }

          /**
           * Incoming or missed call
           */
          case "incoming_call":
          case "missed_call": {
            // Validate required call data
            if (
              !data.callId ||
              !data.callType ||
              !data.callerId ||
              !data.callerName
            ) {
              console.warn("Invalid incoming call notification data:", data);

              break;
            }

            const incomingCall: IncomingCallData = {
              callId: data.callId,

              // "audio" | "video"
              type: data.callType,

              callerId: data.callerId,

              callerName: data.callerName,

              callerPhone: data.callerPhone
                ? Number(data.callerPhone)
                : undefined,

              callerAvatar: data.callerAvatar,

              chatId: data.chatId,

              // Expo notification data may return strings
              isGroup: data.isGroup === true || data.isGroup === "true",

              groupName: data.groupName,

              groupAvatar: data.groupAvatar,
            };

            dispatch(setIncomingCall(incomingCall));

            runWhenAppReady(() => router.push("/call/incoming"));

            break;
          }

          /**
           * New status
           */
          case "new_status": {
            runWhenAppReady(() => router.push("/(tabs)/status"));

            break;
          }

          default: {
            console.warn("Unknown notification type:", data.type);
          }
        }
    };

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(handleResponse);

    // A tap that launched the app from closed happened before this listener
    // existed (it's only set up once the session is restored) — pick it up.
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response && !cancelled) handleResponse(response);
      })
      .catch(() => {});

    /**
     * Cleanup listeners when component unmounts
     * or authentication state changes.
     */
    return () => {
      cancelled = true;
      notificationListener.current?.remove();
      notificationListener.current = null;

      responseListener.current?.remove();
      responseListener.current = null;
    };
  }, [isAuthenticated, userId, dispatch, router]);
}
