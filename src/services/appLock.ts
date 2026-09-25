import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

// Kept on the device (not only on the server) so the lock also works
// offline and at cold start before any request has completed. Cleared with
// the rest of the session on sign-out (see SESSION_KEYS in session.ts).
export const APP_LOCK_KEY = "appLockEnabled";

type Listener = (enabled: boolean) => void;
const listeners = new Set<Listener>();

export async function isAppLockEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(APP_LOCK_KEY)) === "1";
  } catch {
    return false;
  }
}

export async function setAppLockEnabled(enabled: boolean): Promise<void> {
  try {
    if (enabled) await AsyncStorage.setItem(APP_LOCK_KEY, "1");
    else await AsyncStorage.removeItem(APP_LOCK_KEY);
  } catch {}
  listeners.forEach((l) => l(enabled));
}

export function onAppLockChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Any way to verify the owner: Face ID / fingerprint, or the device
// passcode (authenticateAsync falls back to it). With none set up, locking
// would shut the user out of their own app, so the lock is skipped.
export async function canUseAppLock(): Promise<boolean> {
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    return level !== LocalAuthentication.SecurityLevel.NONE;
  } catch {
    return false;
  }
}

export async function authenticateOwner(promptMessage: string) {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Cancel",
    });
    return result.success;
  } catch {
    return false;
  }
}
