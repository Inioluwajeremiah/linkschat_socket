import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "./ThemeContext";

const { width } = Dimensions.get("window");

type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: { label: string; onPress: () => void };
}

interface ToastContextType {
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  loading: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  promise: <T>(
    prom: Promise<T>,
    opts: { loading: string; success: string; error: string }
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextType>({} as ToastContextType);

const CONFIG: Record<
  ToastType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bg: string;
    lightBg: string;
  }
> = {
  success: {
    icon: "checkmark-circle",
    color: "#00d4aa",
    bg: "#0a2420",
    lightBg: "#f0fdf9",
  },
  error: {
    icon: "close-circle",
    color: "#ff4757",
    bg: "#2a0a0a",
    lightBg: "#fff5f5",
  },
  warning: {
    icon: "warning",
    color: "#ffc107",
    bg: "#2a1e00",
    lightBg: "#fffbeb",
  },
  info: {
    icon: "information-circle",
    color: "#5b8dee",
    bg: "#0a1528",
    lightBg: "#eff6ff",
  },
  loading: {
    icon: "sync",
    color: "#8888aa",
    bg: "#12121f",
    lightBg: "#f9fafb",
  },
};

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const { colors, isDark } = useTheme();
  const cfg = CONFIG[item.type];
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 260,
        friction: 22,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 260,
        friction: 22,
      }),
    ]).start();

    if (item.type === "loading") {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        })
      ).start();
    }

    if (item.duration && item.duration > 0) {
      const timer = setTimeout(onDismiss, item.duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const bgColor = isDark ? cfg.bg : cfg.lightBg;
  const borderColor = cfg.color + (isDark ? "40" : "30");

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: bgColor,
          borderColor,
          transform: [{ translateY }, { scale }],
          opacity,
        },
        isDark ? styles.toastShadowDark : styles.toastShadowLight,
      ]}
    >
      <Animated.View
        style={[
          styles.iconWrap,
          { backgroundColor: cfg.color + "20" },
          item.type === "loading" && { transform: [{ rotate: spin }] },
        ]}
      >
        <Ionicons name={cfg.icon} size={20} color={cfg.color} />
      </Animated.View>

      <View style={styles.toastContent}>
        <Text
          style={[styles.toastTitle, { color: colors.textPrimary }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        {item.description && (
          <Text
            style={[styles.toastDesc, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}
        {item.action && (
          <TouchableOpacity
            onPress={item.action.onPress}
            style={styles.actionBtn}
          >
            <Text style={[styles.actionText, { color: cfg.color }]}>
              {item.action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={onDismiss}
        style={styles.closeBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();
  const idRef = useRef(0);

  const add = useCallback(
    (
      type: ToastType,
      title: string,
      description?: string,
      duration = 4000
    ): string => {
      const id = `toast_${++idRef.current}`;
      setToasts((prev) => {
        const next = [{ id, type, title, description, duration }, ...prev];
        return next.slice(0, 4); // max 4 toasts
      });
      return id;
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  const ctx: ToastContextType = {
    success: (t, d) => add("success", t, d),
    error: (t, d) => add("error", t, d, 5000),
    warning: (t, d) => add("warning", t, d),
    info: (t, d) => add("info", t, d),
    loading: (t, d) => add("loading", t, d, 0),
    dismiss,
    dismissAll,
    promise: async (prom, opts) => {
      const id = add("loading", opts.loading, undefined, 0);
      try {
        const result = await prom;
        dismiss(id);
        add("success", opts.success);
        return result;
      } catch (err) {
        dismiss(id);
        add("error", opts.error);
        throw err;
      }
    },
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <View
        style={[
          styles.container,
          { top: insets.top + (Platform.OS === "ios" ? 8 : 12) },
        ]}
        pointerEvents="box-none"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// Standalone imperative API (for use outside components)
let _toast: ToastContextType | null = null;
export const setToastRef = (ref: ToastContextType) => {
  _toast = ref;
};

export const toast = {
  success: (t: string, d?: string) => _toast?.success(t, d),
  error: (t: string, d?: string) => _toast?.error(t, d),
  warning: (t: string, d?: string) => _toast?.warning(t, d),
  info: (t: string, d?: string) => _toast?.info(t, d),
  loading: (t: string, d?: string) => _toast?.loading(t, d),
  dismiss: (id: string) => _toast?.dismiss(id),
  promise: <T,>(
    p: Promise<T>,
    o: { loading: string; success: string; error: string }
  ) => _toast?.promise(p, o),
};

// Component to wire imperative ref
export function ToastRefWirer() {
  const ctx = useContext(ToastContext);
  useEffect(() => {
    setToastRef(ctx);
  }, [ctx]);
  return null;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
  },
  toastShadowDark: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  toastShadowLight: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  toastContent: { flex: 1, gap: 2 },
  toastTitle: { fontSize: 14, fontWeight: "700", lineHeight: 19 },
  toastDesc: { fontSize: 13, lineHeight: 18 },
  actionBtn: { marginTop: 4 },
  actionText: { fontSize: 13, fontWeight: "700" },
  closeBtn: { padding: 2, marginLeft: 4 },
});
