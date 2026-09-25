import { useCallback } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "@/services/api";
import { socketService } from "@/services/socket";
import { clearSession } from "@/services/session";
import { getPendingCount } from "@/services/outbox";
import { logout } from "@/store/slices/authSlice";
import { useAppDispatch } from "./useRedux";

// Confirms, then signs the user out of this device.
export function useSignOut() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return useCallback(() => {
    // Signing out discards the send queue (it belongs to this account), so
    // say so if anything hasn't gone out yet.
    const unsent = getPendingCount();
    Alert.alert(
      "Sign Out",
      unsent > 0
        ? `You have ${unsent} unsent message${
            unsent === 1 ? "" : "s"
          }. They will be lost if you sign out. Continue?`
        : "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            // Tell the server to stop pushing to THIS device. Best effort and
            // capped at a few seconds: signing out has to work offline too.
            const pushToken = await AsyncStorage.getItem("pushToken");
            await Promise.race([
              authApi.logout(pushToken ?? undefined).catch(() => {}),
              new Promise((resolve) => setTimeout(resolve, 4000)),
            ]);
            socketService.disconnect();
            await clearSession();
            dispatch(logout());
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  }, [dispatch, router]);
}
