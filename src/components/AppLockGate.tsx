import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAppSelector } from "../hooks/useRedux";
import {
  authenticateOwner,
  canUseAppLock,
  isAppLockEnabled,
  onAppLockChange,
} from "../services/appLock";

// Leaving the app briefly (camera, file picker, share sheet, answering a
// notification) shouldn't demand unlocking again.
const RELOCK_AFTER_MS = 30_000;

// Covers the whole app with a lock screen when App Lock is on: at launch,
// and when returning after more than RELOCK_AFTER_MS in the background.
export default function AppLockGate() {
  const { colors } = useTheme();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [locked, setLocked] = useState(false);
  const enabledRef = useRef(false);
  const backgroundedAt = useRef<number | null>(null);
  const authenticating = useRef(false);

  const unlock = useCallback(async () => {
    if (authenticating.current) return;
    authenticating.current = true;
    try {
      // Security removed from the device since enabling: don't lock out.
      if (!(await canUseAppLock())) {
        setLocked(false);
        return;
      }
      if (await authenticateOwner("Unlock LinksChat")) setLocked(false);
    } finally {
      authenticating.current = false;
    }
  }, []);

  const lockIfEnabled = useCallback(async () => {
    if (!enabledRef.current || !(await canUseAppLock())) return;
    setLocked(true);
  }, []);

  // Launch (and sign-in): read the setting, lock if on.
  useEffect(() => {
    if (!isAuthenticated) {
      setLocked(false);
      return;
    }
    let cancelled = false;
    isAppLockEnabled().then((enabled) => {
      if (cancelled) return;
      enabledRef.current = enabled;
      lockIfEnabled();
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, lockIfEnabled]);

  // Toggled in settings: takes effect from now on, without locking the
  // user out of the screen they're on.
  useEffect(
    () =>
      onAppLockChange((enabled) => {
        enabledRef.current = enabled;
        if (!enabled) setLocked(false);
      }),
    []
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "background") {
        backgroundedAt.current = Date.now();
      } else if (state === "active" && backgroundedAt.current !== null) {
        const away = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        if (isAuthenticated && away > RELOCK_AFTER_MS) lockIfEnabled();
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, lockIfEnabled]);

  // Prompt straight away when the lock screen appears.
  useEffect(() => {
    if (locked && AppState.currentState === "active") unlock();
  }, [locked, unlock]);

  if (!locked) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: colors.background }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}18` }]}>
        <Ionicons name="lock-closed" size={40} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        LinksChat is locked
      </Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Unlock with Face ID, fingerprint or your passcode
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={unlock}
        activeOpacity={0.85}
      >
        <Ionicons name="finger-print" size={18} color={colors.textInverse} />
        <Text style={[styles.buttonText, { color: colors.textInverse }]}>
          Unlock
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 9999,
    elevation: 9999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  sub: { fontSize: 14, textAlign: "center", marginBottom: 28 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
  },
  buttonText: { fontSize: 15, fontWeight: "700" },
});
