import { useMediaDownload } from "@/utils/mediaCache.ts";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import * as Sharing from "expo-sharing";

export default function DocMessage({
  id,
  name,
  size,
  url,
  isOwn,
}: {
  id: string;
  name?: string;
  size?: number;
  url: string;
  isOwn: boolean;
}) {
  const fallbackExt = (name || "").split(".").pop()?.toLowerCase() || "pdf";
  const { status, progress, localUri, startDownload } = useMediaDownload(
    id,
    url,
    fallbackExt
  );

  const ext = (name || "").split(".").pop()?.toUpperCase() || "DOC";
  const sizeStr = size
    ? size > 1024 * 1024
      ? `${(size / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(size / 1024)} KB`
    : "";

  const handlePress = async () => {
    if (status === "downloaded" && localUri) {
      // Already have it locally — open/share it
      try {
        // const Sharing = await import("expo-sharing");
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(localUri);
        }
      } catch (e) {
        console.warn("Failed to open document", e);
      }
      return;
    }
    startDownload();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={docStyles.wrap}>
        <View
          style={[
            docStyles.icon,
            {
              backgroundColor: isOwn
                ? "rgba(255,255,255,0.15)"
                : "rgba(0,212,170,0.1)",
            },
          ]}
        >
          <Text style={docStyles.ext}>{ext}</Text>
        </View>
        <View style={docStyles.info}>
          <Text
            style={[docStyles.name, { color: isOwn ? "#fff" : "#8888aa" }]}
            numberOfLines={1}
          >
            {name || "Document"}
          </Text>
          <Text style={docStyles.size}>
            {status === "downloaded"
              ? `${sizeStr} · Tap to open`
              : status === "downloading"
              ? `${Math.round(progress * 100)}% downloading…`
              : `${sizeStr} · Tap to download`}
          </Text>
        </View>
        {status === "downloading" ? (
          <ActivityIndicator size="small" color={isOwn ? "#fff" : "#00d4aa"} />
        ) : status === "downloaded" ? (
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={isOwn ? "#fff" : "#00d4aa"}
          />
        ) : (
          <Ionicons
            name="download-outline"
            size={18}
            color={isOwn ? "rgba(255,255,255,0.6)" : "#00d4aa"}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

export const docStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 200 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  ext: { fontSize: 10, fontWeight: "900", color: "#00d4aa" },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: "600" },
  size: { fontSize: 11, color: "#8888aa", marginTop: 2 },
});
