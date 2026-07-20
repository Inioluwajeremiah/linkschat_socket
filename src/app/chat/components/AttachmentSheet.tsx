import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

export interface AttachmentResult {
  type: "image" | "video" | "document" | "audio" | "gif";
  uri: string;
  name?: string;
  size?: number;
  mimeType?: string;
  duration?: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onPick: (result: AttachmentResult) => void;
  onRecord: () => void;
  colors: any;
}

const OPTIONS = [
  {
    icon: "image-outline",
    label: "Photo / Video",
    color: "#5b8dee",
    bg: "rgba(91,141,238,0.12)",
    type: "gallery" as const,
  },
  {
    icon: "camera-outline",
    label: "Camera",
    color: "#00d4aa",
    bg: "rgba(0,212,170,0.12)",
    type: "camera" as const,
  },
  {
    icon: "document-outline",
    label: "Document",
    color: "#ffc107",
    bg: "rgba(255,193,7,0.12)",
    type: "document" as const,
  },
  {
    icon: "mic-outline",
    label: "Voice Note",
    color: "#ff6b9d",
    bg: "rgba(255,107,157,0.12)",
    type: "audio" as const,
  },
  {
    icon: "film-outline",
    label: "GIF",
    color: "#ff6b35",
    bg: "rgba(255,107,53,0.12)",
    type: "gif" as const,
  },
];

export default function AttachmentSheet({
  visible,
  onClose,
  onPick,
  onRecord,
  colors,
}: Props) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 200,
          friction: 20,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOption = async (type: (typeof OPTIONS)[number]["type"]) => {
    onClose();
    await new Promise((r) => setTimeout(r, 300)); // wait for sheet to close

    if (type === "gallery") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.85,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        const isVideo = asset.type === "video";
        onPick({
          type: isVideo ? "video" : "image",
          uri: asset.uri,
          name: asset.fileName || (isVideo ? "video.mp4" : "image.jpg"),
          mimeType: isVideo ? "video/mp4" : "image/jpeg",
          duration: asset.duration || undefined,
        });
      }
    } else if (type === "camera") {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) return;
      const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
      if (!result.canceled) {
        const asset = result.assets[0];
        onPick({
          type: "image",
          uri: asset.uri,
          name: "photo.jpg",
          mimeType: "image/jpeg",
        });
      }
    } else if (type === "document") {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        const file = result.assets[0];
        onPick({
          type: "document",
          uri: file.uri,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType || "application/octet-stream",
        });
      }
    } else if (type === "audio") {
      onRecord();
    } else if (type === "gif") {
      // GIF picker — for now pick from gallery (filter animated)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        onPick({
          type: "gif",
          uri: asset.uri,
          name: "animation.gif",
          mimeType: "image/gif",
        });
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: "rgba(0,0,0,0.5)", opacity: overlayAnim },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Share Content
        </Text>

        <View style={styles.grid}>
          {OPTIONS.map(({ icon, label, color, bg, type }) => (
            <TouchableOpacity
              key={type}
              style={styles.option}
              onPress={() => handleOption(type)}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: bg }]}>
                <Ionicons name={icon as any} size={26} color={color} />
              </View>
              <Text
                style={[styles.optionLabel, { color: colors.textSecondary }]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.cancelBtn, { backgroundColor: colors.surface2 }]}
          onPress={onClose}
        >
          <Text style={[styles.cancelText, { color: colors.textMuted }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 18,
  },
  title: { fontSize: 17, fontWeight: "800", marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  option: { width: "18%", alignItems: "center", gap: 8 },
  optionIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  optionLabel: { fontSize: 11, fontWeight: "500", textAlign: "center" },
  cancelBtn: {
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "700" },
});
