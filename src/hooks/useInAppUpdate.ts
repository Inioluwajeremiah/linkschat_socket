import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import { checkForUpdate, startUpdate } from "expo-in-app-updates";
import { useAppSelector } from "@/hooks/useRedux";

// Don't re-ask Play more than once per this window when the app is
// foregrounded repeatedly (e.g. flipping between apps).
const MIN_CHECK_INTERVAL_MS = 30 * 60 * 1000;

// Google Play in-app updates (Android only). Checks on launch and every
// time the app returns to the foreground, then starts the update.
//
// - Play priority >= 4 (set per release via the Play Developer API) →
//   IMMEDIATE: full-screen, blocks the app until installed.
// - Anything lower → FLEXIBLE: downloads in the background. The native
//   module calls completeUpdate() as soon as the download finishes, which
//   restarts the app — so we never start one while the user is in a call.
//
// Only works for builds installed from Google Play (internal testing
// track counts); sideloaded / dev builds report "no update available".
export function useInAppUpdate() {
  const inCall = useAppSelector((s) => !!s.myCall.active);
  const inCallRef = useRef(inCall);
  inCallRef.current = inCall;

  const lastCheckRef = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "android" || __DEV__) return;

    const run = async () => {
      if (busyRef.current || inCallRef.current) return;
      if (Date.now() - lastCheckRef.current < MIN_CHECK_INTERVAL_MS) return;

      busyRef.current = true;
      try {
        const info = await checkForUpdate();
        lastCheckRef.current = Date.now();

        // An immediate update already in progress must be resumed,
        // otherwise Play leaves the app half-updated.
        if (info.updateInProgress) {
          await startUpdate(true);
          return;
        }
        if (!info.updateAvailable) return;

        await startUpdate(info.serverUpdateType === "IMMEDIATE");
      } catch (e) {
        console.warn("[InAppUpdate] check/start failed:", e);
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
