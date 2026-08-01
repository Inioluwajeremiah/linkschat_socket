import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { createVideoPlayer } from "expo-video";
import { Image } from "expo-image";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { reelApi, uploadFileToS3 } from "../../services/api";
import ThumbnailProcessor from "../status/components/ThumbnailProcessor";
import { prependReel } from "@/store/slices/reelSlice";
import { useAppDispatch } from "@/hooks/useRedux";

type Mode = "video" | "image";

export default function CreateReelScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const dispatch = useAppDispatch();

  const [mode, setMode] = useState<Mode>("video");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [thumbSource, setThumbSource] = useState<any>(null);
  const thumbResolveRef = useRef<((uri: string | null) => void) | null>(null);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setMediaUri(null);
    setDurationSec(0);
  };

  const applyAsset = (asset: ImagePicker.ImagePickerAsset) => {
    setMediaUri(asset.uri);
    setDurationSec(mode === "video" ? Math.round(asset.duration || 0) : 0);
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        mode === "video"
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      videoMaxDuration: 60,
    });
    if (result.canceled) return;
    applyAsset(result.assets[0]);
  };

  const captureFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera permission needed",
        "Enable camera access in Settings to record or take a photo for your LinksSwipe."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes:
        mode === "video"
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      videoMaxDuration: 60,
    });
    if (result.canceled) return;
    applyAsset(result.assets[0]);
  };

  const processThumbnail = (source: any): Promise<string | null> => {
    return new Promise((resolve) => {
      thumbResolveRef.current = resolve;
      setThumbSource(source);
    });
  };

  const handlePost = async () => {
    if (!mediaUri) {
      toast.error(
        mode === "video"
          ? "Select or record a video first"
          : "Select or take a photo first"
      );
      return;
    }
    setUploading(true);
    const id = toast.loading(
      mode === "video" ? "Uploading LinksSwipe..." : "Posting photo..."
    );
    try {
      let mediaUrl: string;
      let thumbnailUrl: string | undefined;

      if (mode === "video") {
        // 1. Upload the actual video file to S3 — the local file URI only
        // resolves on this device, so every other user needs the S3 URL.
        mediaUrl = await uploadFileToS3(
          mediaUri,
          "linksswipe.mp4",
          "video/mp4",
          "video"
        );

        // 2. Best-effort thumbnail generation + upload.
        try {
          const thumbPlayer = createVideoPlayer(mediaUri);
          const [thumbnail] = await thumbPlayer.generateThumbnailsAsync([0]);
          thumbPlayer.release();
          if (thumbnail) {
            const savedUri = await processThumbnail(thumbnail);
            if (savedUri) {
              thumbnailUrl = await uploadFileToS3(
                savedUri,
                "linksswipe-thumb.jpg",
                "image/jpeg",
                "image"
              );
            }
          }
        } catch (e) {
          // console.warn("Thumbnail generation failed", e);
        }
      } else {
        // Image reel — the file itself doubles as its own thumbnail, so
        // just upload it once and reuse the URL for both fields.
        mediaUrl = await uploadFileToS3(
          mediaUri,
          "linksswipe.jpg",
          "image/jpeg",
          "image"
        );
        thumbnailUrl = mediaUrl;
      }

      // 3. Create the reel record pointing at the uploaded S3 URL(s).
      const res = await reelApi.createReel({
        type: mode,
        mediaUrl,
        thumbnail: thumbnailUrl,
        caption: caption.trim() || undefined,
        duration: mode === "video" ? durationSec || undefined : undefined,
      });

      toast.dismiss(id!);
      if (res.data.reel) {
        dispatch(prependReel(res.data.reel));
        toast.success(
          mode === "video" ? "LinksSwipe posted!" : "Photo posted!"
        );
        router.back();
      } else {
        toast.error("Failed to post LinksSwipe");
      }
    } catch (err) {
      // console.log("create LinksSwipe err ==>>>", err);
      toast.dismiss(id!);
      toast.error("Failed to post LinksSwipe");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
            disabled={uploading}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            New LinksSwipe
          </Text>
          <TouchableOpacity
            style={[styles.postBtn, !mediaUri && { opacity: 0.5 }]}
            onPress={handlePost}
            disabled={!mediaUri || uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.postBtnText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Mode tabs */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[
              styles.modeTab,
              { borderColor: colors.border },
              mode === "video" && styles.modeTabActive,
            ]}
            onPress={() => switchMode("video")}
            disabled={uploading}
          >
            <Ionicons
              name="videocam"
              size={16}
              color={mode === "video" ? "#fff" : colors.textMuted}
            />
            <Text
              style={[
                styles.modeTabText,
                { color: mode === "video" ? "#fff" : colors.textMuted },
              ]}
            >
              Video
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeTab,
              { borderColor: colors.border },
              mode === "image" && styles.modeTabActive,
            ]}
            onPress={() => switchMode("image")}
            disabled={uploading}
          >
            <Ionicons
              name="image"
              size={16}
              color={mode === "image" ? "#fff" : colors.textMuted}
            />
            <Text
              style={[
                styles.modeTabText,
                { color: mode === "image" ? "#fff" : colors.textMuted },
              ]}
            >
              Photo
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View
            style={[
              styles.picker,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {mediaUri ? (
              mode === "image" ? (
                <Image
                  source={{ uri: mediaUri }}
                  style={StyleSheet.absoluteFillObject}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.pickedState}>
                  <Ionicons name="film" size={48} color="#00d4aa" />
                  <Text
                    style={[styles.pickedTitle, { color: colors.textPrimary }]}
                  >
                    Video selected ✓
                  </Text>
                  <Text style={[styles.pickedSub, { color: colors.textMuted }]}>
                    {durationSec ? `${durationSec}s` : ""}
                  </Text>
                </View>
              )
            ) : (
              <View style={styles.emptyState}>
                <LinearGradient
                  colors={["#00d4aa22", "#5b8dee22"]}
                  style={styles.emptyIcon}
                >
                  <Ionicons
                    name={mode === "video" ? "videocam" : "image"}
                    size={44}
                    color="#00d4aa"
                  />
                </LinearGradient>
                <Text
                  style={[styles.emptyTitle, { color: colors.textPrimary }]}
                >
                  {mode === "video" ? "Add a Video" : "Add a Photo"}
                </Text>
                {mode === "video" && (
                  <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                    Up to 60 seconds
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Source buttons */}
          <View style={styles.sourceRow}>
            <TouchableOpacity
              style={[
                styles.sourceBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={captureFromCamera}
              disabled={uploading}
            >
              <Ionicons
                name="camera-outline"
                size={20}
                color={colors.textPrimary}
              />
              <Text
                style={[styles.sourceBtnText, { color: colors.textPrimary }]}
              >
                {mode === "video" ? "Record" : "Take Photo"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sourceBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={pickFromLibrary}
              disabled={uploading}
            >
              <Ionicons
                name="images-outline"
                size={20}
                color={colors.textPrimary}
              />
              <Text
                style={[styles.sourceBtnText, { color: colors.textPrimary }]}
              >
                Library
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.captionBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.captionInput, { color: colors.textPrimary }]}
              placeholder="Write a caption..."
              placeholderTextColor={colors.textMuted}
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={500}
              editable={!uploading}
            />
            <Text style={[styles.charCount, { color: colors.textMuted }]}>
              {caption.length}/500
            </Text>
          </View>
        </View>

        {thumbSource && (
          <ThumbnailProcessor
            source={thumbSource}
            onDone={(uri) => {
              thumbResolveRef.current?.(uri);
              thumbResolveRef.current = null;
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { flex: 1, fontSize: 18, fontWeight: "800" },
  postBtn: {
    backgroundColor: "#00d4aa",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 99,
  },
  postBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  modeTabs: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  modeTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
  },
  modeTabActive: { backgroundColor: "#00d4aa", borderColor: "#00d4aa" },
  modeTabText: { fontSize: 13, fontWeight: "700" },
  body: { padding: 16, gap: 14 },
  picker: {
    height: 200,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  emptyState: { alignItems: "center", gap: 10 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptySub: { fontSize: 13 },
  pickedState: { alignItems: "center", gap: 8 },
  pickedTitle: { fontSize: 16, fontWeight: "700" },
  pickedSub: { fontSize: 12 },
  sourceRow: { flexDirection: "row", gap: 10 },
  sourceBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  sourceBtnText: { fontSize: 14, fontWeight: "700" },
  captionBox: { borderRadius: 14, borderWidth: 1, padding: 14, minHeight: 90 },
  captionInput: { fontSize: 15, lineHeight: 22, minHeight: 60 },
  charCount: { fontSize: 11, textAlign: "right", marginTop: 4 },
});
