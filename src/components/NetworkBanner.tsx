import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";

const COPY = {
  offline: {
    icon: "cloud-offline-outline" as const,
    text: "No internet connection",
    bg: "#dc2626",
  },
  poor: {
    icon: "warning-outline" as const,
    text: "Poor connection — messages may be delayed",
    bg: "#d97706",
  },
};

// Floating pill under the status bar. Never blocks touches. Fades out when
// the connection is fine; keeps the last message on screen while fading so
// the text doesn't flicker to something else.
export default function NetworkBanner() {
  const status = useConnectionStatus();
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;
  const [lastBad, setLastBad] = useState<"offline" | "poor">("poor");

  useEffect(() => {
    if (status !== "ok") setLastBad(status);
    Animated.timing(anim, {
      toValue: status === "ok" ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [status, anim]);

  const { icon, text, bg } = COPY[lastBad];

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.pill,
        {
          top: insets.top + 6,
          backgroundColor: bg,
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-12, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Ionicons name={icon} size={14} color="#fff" />
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 9999,
    elevation: 10,
  },
  text: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
