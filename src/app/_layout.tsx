import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Provider, useDispatch } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppDispatch, store } from "../store";
import { setCredentials } from "../store/slices/authSlice";
import { authApi } from "../services/api";
import { useSocket } from "../hooks/useSocket";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { ToastProvider, ToastRefWirer } from "../context/ToastContext";
import { loadOnboardingState } from "@/store/slices/onboardingslice";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { loadDeviceContacts } from "@/store/slices/contactsSlice";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";

function SocketInitializer() {
  useSocket();
  return null;
}

function PushInitializer() {
  usePushNotifications();
  return null;
}
function BlockedUsersInitializer() {
  useBlockedUsers();
  return null;
}
function ContactsLoader() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const { loaded, loading } = useAppSelector((s) => s.contacts);

  useEffect(() => {
    // Only fire once — after auth is confirmed and we haven't loaded/aren't loading
    if (isAuthenticated && !loaded && !loading) {
      dispatch(loadDeviceContacts());
    }
  }, [isAuthenticated, loaded, loading]);

  return null;
}

// export const loadOnboardingState = async (): Promise<boolean> => {
//   try {
//     const stored = await AsyncStorage.getItem("isCompleteOnboarding");

//     console.log("isCompleteOnboarding at loadOnboardingState ==>>> ", stored);

//     if (stored !== null) {
//       return JSON.parse(stored);
//     }

//     return false;
//   } catch (e) {
//     console.warn("Failed to load onboarding state:", e);
//     return false;
//   }
// };

function AppNavigator() {
  const { colors } = useTheme();

  return (
    <>
      <KeyboardProvider>
        <ContactsLoader />
        <SocketInitializer />
        <PushInitializer />
        <ToastRefWirer />
        <BlockedUsersInitializer />
        <StatusBar style={colors.statusBar} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          {/* ─── Onboarding group ─── */}
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: false, animation: "none" }}
          />

          {/* ─── Auth group ─── */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />

          {/* ─── Main app tabs ─── */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* ─── Feature screens ─── */}
          <Stack.Screen
            name="chat/[id]"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="call/[id]"
            options={{
              headerShown: false,
              animation: "slide_from_bottom",
              presentation: "fullScreenModal",
            }}
          />
          <Stack.Screen
            name="call/incoming"
            options={{
              headerShown: false,
              animation: "fade",
              presentation: "fullScreenModal",
            }}
          />
          <Stack.Screen
            name="status/view"
            options={{
              headerShown: false,
              animation: "fade",
              presentation: "fullScreenModal",
            }}
          />
          <Stack.Screen
            name="status/create"
            options={{
              headerShown: false,
              animation: "slide_from_bottom",
              presentation: "fullScreenModal",
            }}
          />
          <Stack.Screen
            name="profile/[id]"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="profile/edit"
            options={{
              headerShown: false,
              animation: "slide_from_bottom",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="new-chat"
            options={{
              headerShown: false,
              animation: "slide_from_bottom",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="new-group"
            options={{
              headerShown: false,
              animation: "slide_from_bottom",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="contacts"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="phone-contacts"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="starred-messages"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="privacy"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="group-info/[id]"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="reels/create"
            options={{
              headerShown: false,
              animation: "slide_from_bottom",
              presentation: "fullScreenModal",
            }}
          />
          <Stack.Screen
            name="blocked-users"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
        </Stack>
      </KeyboardProvider>
    </>
  );
}

function AppWithStore() {
  const [isReady, setIsReady] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loadOnboardingState());
  }, []);
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        const streamToken = await AsyncStorage.getItem("streamToken");
        if (accessToken) {
          const res = await authApi.getMe();
          if (res.success) {
            store.dispatch(
              setCredentials({
                user: res.data.user,
                accessToken,
                refreshToken: refreshToken || "",
                streamToken: res.data.streamToken || streamToken || "",
              })
            );
          }
        }
      } catch {
        /* session expired */
      } finally {
        setIsReady(true);
      }
    };
    restoreSession();
  }, []);

  if (!isReady) return null;
  return <AppNavigator />;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <SafeAreaView style={{ flex: 1 }}>
                <AppWithStore />
              </SafeAreaView>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
}
