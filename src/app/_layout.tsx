// import { useEffect, useState } from "react";
// import { Stack } from "expo-router";
// import { Provider, useDispatch } from "react-redux";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// import { StatusBar } from "expo-status-bar";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { AppDispatch, store } from "../store";
// import { setCredentials } from "../store/slices/authSlice";
// import { authApi } from "../services/api";
// import { useSocket } from "../hooks/useSocket";
// import { usePushNotifications } from "../hooks/usePushNotifications";
// import { ThemeProvider, useTheme } from "../context/ThemeContext";
// import { ToastProvider, ToastRefWirer } from "../context/ToastContext";
// import { loadOnboardingState } from "@/store/slices/onboardingslice";
// import { KeyboardProvider } from "react-native-keyboard-controller";
// import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
// import { loadDeviceContacts } from "@/store/slices/contactsSlice";
// import { useBlockedUsers } from "@/hooks/useBlockedUsers";

// function SocketInitializer() {
//   useSocket();
//   return null;
// }

// function PushInitializer() {
//   usePushNotifications();
//   return null;
// }
// function BlockedUsersInitializer() {
//   useBlockedUsers();
//   return null;
// }
// function ContactsLoader() {
//   const dispatch = useAppDispatch();
//   const { isAuthenticated } = useAppSelector((s) => s.auth);
//   const { loaded, loading } = useAppSelector((s) => s.contacts);

//   useEffect(() => {
//     // Only fire once — after auth is confirmed and we haven't loaded/aren't loading
//     if (isAuthenticated && !loaded && !loading) {
//       dispatch(loadDeviceContacts());
//     }
//   }, [isAuthenticated, loaded, loading]);

//   return null;
// }

// // export const loadOnboardingState = async (): Promise<boolean> => {
// //   try {
// //     const stored = await AsyncStorage.getItem("isCompleteOnboarding");

// //     console.log("isCompleteOnboarding at loadOnboardingState ==>>> ", stored);

// //     if (stored !== null) {
// //       return JSON.parse(stored);
// //     }

// //     return false;
// //   } catch (e) {
// //     console.warn("Failed to load onboarding state:", e);
// //     return false;
// //   }
// // };

// function AppNavigator() {
//   const { colors } = useTheme();

//   return (
//     <>
//       <KeyboardProvider>
//         <ContactsLoader />
//         <SocketInitializer />
//         <PushInitializer />
//         <ToastRefWirer />
//         <BlockedUsersInitializer />
//         <StatusBar style={colors.statusBar} />
//         <Stack
//           screenOptions={{
//             headerShown: false,
//             animation: "fade",
//             contentStyle: { backgroundColor: colors.background },
//           }}
//         >
//           {/* ─── Onboarding group ─── */}
//           <Stack.Screen
//             name="onboarding"
//             options={{ headerShown: false, animation: "none" }}
//           />

//           {/* ─── Auth group ─── */}
//           <Stack.Screen name="(auth)" options={{ headerShown: false }} />

//           {/* ─── Main app tabs ─── */}
//           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

//           {/* ─── Feature screens ─── */}
//           <Stack.Screen
//             name="chat/[id]"
//             options={{ headerShown: false, animation: "slide_from_right" }}
//           />
//           <Stack.Screen
//             name="call/[id]"
//             options={{
//               headerShown: false,
//               animation: "slide_from_bottom",
//               presentation: "fullScreenModal",
//             }}
//           />
//           <Stack.Screen
//             name="call/incoming"
//             options={{
//               headerShown: false,
//               animation: "fade",
//               presentation: "fullScreenModal",
//             }}
//           />
//           <Stack.Screen
//             name="status/view"
//             options={{
//               headerShown: false,
//               animation: "fade",
//               presentation: "fullScreenModal",
//             }}
//           />
//           <Stack.Screen
//             name="status/create"
//             options={{
//               headerShown: false,
//               animation: "slide_from_bottom",
//               presentation: "fullScreenModal",
//             }}
//           />
//           <Stack.Screen
//             name="profile/[id]"
//             options={{ headerShown: false, animation: "slide_from_right" }}
//           />
//           <Stack.Screen
//             name="profile/edit"
//             options={{
//               headerShown: false,
//               animation: "slide_from_bottom",
//               presentation: "modal",
//             }}
//           />
//           <Stack.Screen
//             name="new-chat"
//             options={{
//               headerShown: false,
//               animation: "slide_from_bottom",
//               presentation: "modal",
//             }}
//           />
//           <Stack.Screen
//             name="new-group"
//             options={{
//               headerShown: false,
//               animation: "slide_from_bottom",
//               presentation: "modal",
//             }}
//           />
//           <Stack.Screen
//             name="contacts"
//             options={{ headerShown: false, animation: "slide_from_right" }}
//           />
//           <Stack.Screen
//             name="phone-contacts"
//             options={{ headerShown: false, animation: "slide_from_right" }}
//           />
//           <Stack.Screen
//             name="starred-messages"
//             options={{ headerShown: false, animation: "slide_from_right" }}
//           />
//           <Stack.Screen
//             name="privacy"
//             options={{ headerShown: false, animation: "slide_from_right" }}
//           />
//           <Stack.Screen
//             name="group-info/[id]"
//             options={{ headerShown: false, animation: "slide_from_right" }}
//           />
//           <Stack.Screen
//             name="reels/create"
//             options={{
//               headerShown: false,
//               animation: "slide_from_bottom",
//               presentation: "fullScreenModal",
//             }}
//           />
//           <Stack.Screen
//             name="blocked-users"
//             options={{ headerShown: false, animation: "slide_from_right" }}
//           />
//         </Stack>
//       </KeyboardProvider>
//     </>
//   );
// }

// function AppWithStore() {
//   const [isReady, setIsReady] = useState(false);
//   const dispatch = useDispatch<AppDispatch>();

//   useEffect(() => {
//     dispatch(loadOnboardingState());
//   }, []);
//   useEffect(() => {
//     const restoreSession = async () => {
//       try {
//         const accessToken = await AsyncStorage.getItem("accessToken");
//         const refreshToken = await AsyncStorage.getItem("refreshToken");
//         const streamToken = await AsyncStorage.getItem("streamToken");
//         if (accessToken) {
//           const res = await authApi.getMe();
//           if (res.success) {
//             store.dispatch(
//               setCredentials({
//                 user: res.data.user,
//                 accessToken,
//                 refreshToken: refreshToken || "",
//                 streamToken: res.data.streamToken || streamToken || "",
//               })
//             );
//           }
//         }
//       } catch {
//         /* session expired */
//       } finally {
//         setIsReady(true);
//       }
//     };
//     restoreSession();
//   }, []);

//   if (!isReady) return null;
//   return <AppNavigator />;
// }

// export default function RootLayout() {
//   return (
//     <Provider store={store}>
//       <ThemeProvider>
//         <ToastProvider>
//           <GestureHandlerRootView style={{ flex: 1 }}>
//             <SafeAreaProvider>
//               <SafeAreaView style={{ flex: 1 }}>
//                 <AppWithStore />
//               </SafeAreaView>
//             </SafeAreaProvider>
//           </GestureHandlerRootView>
//         </ToastProvider>
//       </ThemeProvider>
//     </Provider>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { View, Image, StyleSheet } from "react-native";

import { Provider, useDispatch } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppDispatch, store } from "../store";
import { restoreSession, startSessionPersistence } from "../services/session";
import { configureAudio } from "../services/audioMode";
import { useSocket } from "../hooks/useSocket";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { ToastProvider, ToastRefWirer } from "../context/ToastContext";
import { loadOnboardingState } from "@/store/slices/onboardingslice";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { loadDeviceContacts } from "@/store/slices/contactsSlice";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { useInAppUpdate } from "@/hooks/useInAppUpdate";
import { useOtaUpdate } from "@/hooks/useOtaUpdate";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import NetworkBanner from "@/components/NetworkBanner";
import AppLockGate from "@/components/AppLockGate";

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
function InAppUpdateInitializer() {
  useInAppUpdate();
  useOtaUpdate();
  return null;
}
function OfflineSyncInitializer() {
  useOfflineSync();
  return null;
}
// The app now opens from a saved session and verifies it in the background.
// If the server then definitively rejects it (revoked/expired, suspended
// account), the session is cleared — this is what actually moves the user to
// the login screen instead of leaving them stranded in the tabs.
function AuthGuard() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const router = useRouter();
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, router]);

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
        <InAppUpdateInitializer />
        <OfflineSyncInitializer />
        <AuthGuard />
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
        <NetworkBanner />
        <AppLockGate />
      </KeyboardProvider>
    </>
  );
}

function AppLoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <Image
        source={require("../../assets/icons/splash-icon-dark.png")}
        style={loadingStyles.icon}
      />
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 140,
    height: 140,
  },
});

function AppWithStore() {
  const [isReady, setIsReady] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loadOnboardingState());
    // Once, at launch — never during a call (see services/audioMode.ts).
    configureAudio();
  }, []);

  useEffect(() => {
    // Opens straight from the cached session (so bad/no network can't bounce
    // a signed-in user to the login screen) and verifies with the server in
    // the background. See services/session.ts.
    startSessionPersistence();
    restoreSession()
      .catch(() => {})
      .finally(() => setIsReady(true));
  }, []);

  if (!isReady) return <AppLoadingScreen />;
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
