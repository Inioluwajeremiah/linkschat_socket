import { Alert } from "react-native";

// ─── Semantic palette (same hues, adapts per mode) ──────────────────────────
const palette = {
  // primary: "#00d4aa",
  // primaryDark: "#00b090",
  primary: "#5bbbdf",
  primaryDark: "#4299BB",
  primaryLight: "#4de8c8",
  secondary: "#5b8dee",
  accent: "#ff6b9d",
  success: "#00d4aa",
  error: "#ff4757",
  warning: "#ffc107",
  info: "#5b8dee",
  online: "#00d4aa",
  away: "#ffc107",
  offline: "#9ca3af",
};

export const DarkColors = {
  ...palette,
  background: "#0a0a14",
  chatBackground: "#202C33",
  ownerChatBackground: "#005C4B",
  sentCheckMarkColor: "#8696A0",
  deliveredCheckMarkColor: "#8696A0",
  readCheckMarkColor: "#53BDEB",
  surface: "#12121f",
  surfaceElevated: "#1a1a2e",
  surfaceHigh: "#22223a",
  overlay: "rgba(0,0,0,0.6)",
  textPrimary: "#f0f0ff",
  textSecondary: "#8888aa",
  textMuted: "#555577",
  textInverse: "#0a0a14",
  bubbleOwn: "#00b090",
  bubbleOther: "#1a1a2e",
  bubbleOwnText: "#ffffff",
  bubbleOtherText: "#f0f0ff",
  border: "#222240",
  borderLight: "#2a2a45",
  inputBg: "#16162a",
  divider: "#1a1a30",
  tabActive: "#5bbbdf",
  tabInactive: "#444466",
  tabBackground: "#0f0f1e",
  gradientPrimary: ["#5bbbdf", "#5b8dee"] as [string, string],
  gradientDark: ["#0f0f1e", "#1a1a35"] as [string, string],
  gradientAccent: ["#ff6b9d", "#5b8dee"] as [string, string],
  cardShadow: "rgba(0,0,0,0.4)",
  statusBar: "light" as "light" | "dark",
};

export const LightColors = {
  ...palette,
  background: "#f5f7fa",
  chatBackground: "#f5f7fa",
  ownerChatBackground: "#DCF8C6",
  sentCheckMarkColor: "#8696A0",
  deliveredCheckMarkColor: "#8696A0",
  readCheckMarkColor: "#53BDEB",
  surface: "#ffffff",
  surfaceElevated: "#f0f2f8",
  surfaceHigh: "#e8eaf2",
  overlay: "rgba(0,0,0,0.35)",
  textPrimary: "#0d0d1a",
  textSecondary: "#4b5563",
  textMuted: "#9ca3af",
  textInverse: "#ffffff",
  bubbleOwn: "#00b090",
  bubbleOther: "#f0f2f8",
  bubbleOwnText: "#ffffff",
  bubbleOtherText: "#0d0d1a",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  inputBg: "#f3f4f6",
  divider: "#f3f4f6",
  tabActive: "#5bbbdf",
  tabInactive: "#9ca3af",
  tabBackground: "#ffffff",
  gradientPrimary: ["#5bbbdf", "#5b8dee"] as [string, string],
  gradientDark: ["#f0f2f8", "#e8eaf2"] as [string, string],
  gradientAccent: ["#ff6b9d", "#5b8dee"] as [string, string],
  cardShadow: "rgba(0,0,0,0.08)",
  statusBar: "dark" as "light" | "dark",
};

// Default export (dark — kept for backward compat, screens use useTheme())
export const Colors = DarkColors;

export const Fonts = {
  regular: "System",
  medium: "System",
  bold: "System",
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const API_BASE_URL = "https://api.linkschat.com/api";
// "http://172.27.57.108:5000/api";
// "https://linkschat-backend-with-dashboard.onrender.com/api";
//  "http://172.27.57.108:5000/api";
// "https://linkschat-backend.onrender.com/api";
// process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

export const SOCKET_URL = "https://api.linkschat.com";
//  "http://172.27.57.108:5000";
// "https://linkschat-backend-with-dashboard.onrender.com";
// "http://172.27.57.108:5000";
//  "https://linkschat-backend.onrender.com";
// process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:5000";
// export const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || "wwzvk9atm57g";
export const STREAM_API_KEY = "wwzvk9atm57g";
export const EMOJI_REACTIONS = ["❤️", "😂", "😮", "😢", "👏", "🔥"];
export const STATUS_COLORS = [
  "#1a1a2e",
  "#16213e",
  "#0f3460",
  "#533483",
  "#e94560",
  "#2d6a4f",
  "#1b4332",
  "#6a0572",
  "#000814",
  "#03071e",
  "#370617",
  "#6a4c93",
];
