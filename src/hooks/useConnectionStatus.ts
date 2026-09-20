import { useEffect, useState } from "react";
import NetInfo, { NetInfoStateType } from "@react-native-community/netinfo";
import { socketService } from "../services/socket";
import { useAppSelector } from "./useRedux";

export type ConnectionStatus = "ok" | "offline" | "poor";

// A socket that is briefly down (cold start, foregrounding, a quick blip)
// isn't worth a warning; only flag it once it has stayed down this long.
const SOCKET_DOWN_GRACE_MS = 6000;

// "offline" → the device has no usable internet.
// "poor"    → the device thinks it's online, but we're on a 2G link or the
//             realtime socket can't stay connected, so messages will be slow
//             or fail.
export function useConnectionStatus(): ConnectionStatus {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [offline, setOffline] = useState(false);
  const [slowLink, setSlowLink] = useState(false);
  const [socketDown, setSocketDown] = useState(false);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      // isInternetReachable is null while unknown — only treat an explicit
      // `false` as offline, so we don't flash the banner on startup.
      setOffline(
        state.isConnected === false || state.isInternetReachable === false
      );
      setSlowLink(
        state.type === NetInfoStateType.cellular &&
          state.details?.cellularGeneration === "2g"
      );
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setSocketDown(false);
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const evaluate = () => {
      clearTimeout(timer);
      // No socket yet (still starting up) or connected: nothing to warn about.
      if (!socketService.getSocket() || socketService.isConnected()) {
        setSocketDown(false);
        return;
      }
      timer = setTimeout(
        () => setSocketDown(!socketService.isConnected()),
        SOCKET_DOWN_GRACE_MS
      );
    };

    evaluate();
    const unsubscribe = socketService.onStatusChange(evaluate);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [isAuthenticated]);

  if (offline) return "offline";
  if (slowLink || socketDown) return "poor";
  return "ok";
}
