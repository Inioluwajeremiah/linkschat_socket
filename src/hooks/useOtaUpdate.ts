import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import * as Updates from "expo-updates";
import { useAppSelector } from "@/hooks/useRedux";

// Don't hit the update server more than once per this window when the app
// is foregrounded repeatedly.
const MIN_CHECK_INTERVAL_MS = 30 * 60 * 1000;

// EAS Update (OTA JS bundle updates). expo-updates already checks on cold
// start (checkAutomatically: ON_LOAD); this also checks every time the app
// returns to the foreground, since chat apps are rarely cold-started.
//
// A downloaded update is applied on the next cold start — we never call
// reloadAsync() here, so a user mid-chat or mid-call is never interrupted.
//
// Only runs in release builds made with `eas build`; dev clients and
// Expo Go report Updates.isEnabled === false.
export function useOtaUpdate() {
  const inCall = useAppSelector((s) => !!s.myCall.active);
  const inCallRef = useRef(inCall);
  inCallRef.current = inCall;

  const lastCheckRef = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    const run = async () => {
      if (busyRef.current || inCallRef.current) return;
      if (Date.now() - lastCheckRef.current < MIN_CHECK_INTERVAL_MS) return;

      busyRef.current = true;
      try {
        const result = await Updates.checkForUpdateAsync();
        lastCheckRef.current = Date.now();
        if (!result.isAvailable) return;

        await Updates.fetchUpdateAsync();
      } catch (e) {
        console.warn("[OtaUpdate] check/fetch failed:", e);
      } finally {
        busyRef.current = false;
      }
    };

    run();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") run();
    });
    return () => sub.remove();
  }, []);
}
