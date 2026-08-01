import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView, createVideoPlayer } from "expo-video";
import { Colors, STATUS_COLORS } from "../../constants";
import { statusApi, uploadFileToS3 } from "../../services/api";
import { fetchStatuses } from "@/store/slices/statusSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import ThumbnailProcessor from "./components/ThumbnailProcessor";
import { useTheme } from "@/context/ThemeContext";

type Mode = "text" | "image" | "video";

export default function StatusCreateScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [caption, setCaption] = useState("");
  const [bgColor, setBgColor] = useState(STATUS_COLORS[0]);
  const [textColor, setTextColor] = useState("#ffffff");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [thumbSource, setThumbSource] = useState<any>(null);
  const [mediaDurationMs, setMediaDurationMs] = useState(0);
  const thumbResolveRef = useRef<((uri: string | null) => void) | null>(null);
  const [mediaFileName, setMediaFileName] = useState<string>("file");
  const [mediaMimeType, setMediaMimeType] = useState<string>("image/jpeg");

  const player = useVideoPlayer(
    mode === "video" && mediaUri ? mediaUri : null,
    (p) => {
      p.loop = true;
      p.play();
    }
  );

  const processThumbnail = (source: any): Promise<string | null> => {
    return new Promise((resolve) => {
      thumbResolveRef.current = resolve;
      setThumbSource(source);
    });
  };

  // const pickMedia = async () => {
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ["images", "videos"] as ImagePicker.MediaType[],
  //     quality: 0.85,
  //     videoMaxDuration: 60,
  //   });
  //   if (result.canceled) return;

  //   const asset = result.assets[0];
  //   setMediaUri(asset.uri);
  //   setMode(asset.type === "video" ? "video" : "image");
  // };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"] as ImagePicker.MediaType[],
      quality: 0.85,
      videoMaxDuration: 60,
    });
    if (result.canceled) return;

    const asset = result.assets[0];

    // Extract real filename and mime type from the asset
    const filename = asset.fileName || asset.uri.split("/").pop() || "file";
    const mimeType =
      asset.mimeType || (asset.type === "video" ? "video/mp4" : "image/jpeg");

    if (asset.type === "video") {
      const durationSec = asset.duration || 0;
      if (durationSec > 60000) {
        Alert.alert(
          "Video too long",
          "Please select a video that is 60 seconds or less"
        );
        return;
      }
      setMediaDurationMs(durationSec * 1000);
      setMode("video");
    } else {
      setMediaDurationMs(0);
      setMode("image");
    }

    setMediaUri(asset.uri);
    setMediaFileName(filename); // ← store filename
    setMediaMimeType(mimeType); // ← store mimeType
  };

  const handlePost = async () => {
    if (mode === "text" && !text.trim()) {
      Alert.alert("Error", "Please enter some text");
      return;
    }

    if (mode === "text" && text.trim().length > 500) {
      Alert.alert("Error", "Text must be 500 characters or less");
      return;
    }

    if ((mode === "image" || mode === "video") && !mediaUri) {
      Alert.alert("Error", "Please select media");
      return;
    }

    // ── Caption validation ────────────────────────────────────────────────
    if (caption.trim().length > 200) {
      Alert.alert("Error", "Caption must be 200 characters or less");
      return;
    }

    // ── Video duration validation ─────────────────────────────────────────
    if (mode === "video") {
      const durationSec = mediaDurationMs / 1000;
      if (durationSec < 1) {
        Alert.alert("Error", "Video must be at least 1 second long");
        return;
      }
      if (durationSec > 60000) {
        Alert.alert(
          "Video too long",
          "Please select a video that is 60 seconds or less"
        );
        return;
      }
    }

    setUploading(true);
    try {
      let uploadedMediaUrl: string | undefined;
      let uploadedThumbUrl: string | undefined;

      // if (mode === "image" && mediaUri) {
      //   uploadedMediaUrl = await uploadFileToS3(
      //     mediaUri,
      //     "status.jpg",
      //     "image/jpeg",
      //     "image"
      //   );
      // }

      // if (mode === "video" && mediaUri) {
      //   uploadedMediaUrl = await uploadFileToS3(
      //     mediaUri,
      //     "status.mp4",
      //     "video/mp4",
      //     "video"
      //   );

      //   // Generate thumbnail from first frame
      //   try {
      //     const thumbPlayer = createVideoPlayer(mediaUri);
      //     const [thumbnail] = await thumbPlayer.generateThumbnailsAsync([0]);
      //     thumbPlayer.release();
      //     if (thumbnail) {
      //       const savedUri = await processThumbnail(thumbnail);
      //       if (savedUri) {
      //         uploadedThumbUrl = await uploadFileToS3(
      //           savedUri,
      //           "status-thumb.jpg",
      //           "image/jpeg",
      //           "image"
      //         );
      //       }
      //     }
      //   } catch (e) {
      //     console.warn("Thumbnail generation failed", e);
      //   } finally {
      //     setThumbSource(null);
      //   }
      // }
      if (mode === "image" && mediaUri) {
        uploadedMediaUrl = await uploadFileToS3(
          mediaUri,
          mediaFileName,
          mediaMimeType,
          "image"
        );
      }

      if (mode === "video" && mediaUri) {
        uploadedMediaUrl = await uploadFileToS3(
          mediaUri,
          mediaFileName,
          mediaMimeType,
          "video"
        );

        try {
          const thumbPlayer = createVideoPlayer(mediaUri);
          const [thumbnail] = await thumbPlayer.generateThumbnailsAsync([0]);
          thumbPlayer.release();
          if (thumbnail) {
            const savedUri = await processThumbnail(thumbnail);
            if (savedUri) {
              // Thumbnail is always a jpeg — derive name from original filename
              const thumbName =
                mediaFileName.replace(/\.[^/.]+$/, "") + "-thumb.jpg";
              uploadedThumbUrl = await uploadFileToS3(
                savedUri,
                thumbName, // ← e.g. "myvideo-thumb.jpg"
                "image/jpeg",
                "image"
              );
            }
          }
        } catch (e) {
          console.warn("Thumbnail generation failed", e);
        } finally {
          setThumbSource(null);
        }
      }

      const res = await statusApi.createStatus({
        type: mode,
        content: mode === "text" ? text.trim() : caption.trim() || undefined,
        mediaUrl: uploadedMediaUrl,
        thumbnail: uploadedThumbUrl,
        backgroundColor: bgColor,
        textColor,
        duration: mediaDurationMs,
      });

      if (res.success) {
        await dispatch(fetchStatuses());
        router.back();
      }
    } catch (err) {
      console.log("handle post status err ==>>> ", err);
      Alert.alert("Error", "Failed to post status");
    } finally {
      setUploading(false);
    }
  };

  // const resetMedia = () => {
  //   setMediaUri(null);
  //   setMode("text");
  //   setCaption("");
  // };

  // const resetMedia = () => {
  //   setMediaUri(null);
  //   setMediaDurationMs(0); // ← reset here
  //   setMode("text");
  //   setCaption("");
  // };

  const resetMedia = () => {
    setMediaUri(null);
    setMediaDurationMs(0);
    setMediaFileName("file");
    setMediaMimeType("image/jpeg");
    setMode("text");
    setCaption("");
  };
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: mode === "text" ? bgColor : "#000" },
      ]}
    >
      {/* ── Media background ── */}
      {mode === "image" && mediaUri && (
        <Image
          source={{ uri: mediaUri }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
      )}
      {mode === "video" && mediaUri && (
        <VideoView
          style={StyleSheet.absoluteFillObject}
          player={player}
          nativeControls={false}
          contentFit="cover"
        />
      )}

      {/* Dark overlay for media modes */}
      {mode !== "text" && mediaUri && (
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.5)",
            "transparent",
            "transparent",
            "rgba(0,0,0,0.6)",
          ]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      )}

      <View style={styles.safeArea}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <View style={styles.closeBtnBg}>
              <Ionicons name="close" size={22} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, mode === "text" && styles.modeTabActive]}
              onPress={() => {
                setMode("text");
                setMediaUri(null);
              }}
            >
              <Ionicons
                name="text"
                size={14}
                color={mode === "text" ? "#fff" : "rgba(255,255,255,0.6)"}
              />
              <Text
                style={[
                  styles.modeTabText,
                  mode === "text" && styles.modeTabTextActive,
                ]}
              >
                Text
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, mode !== "text" && styles.modeTabActive]}
              onPress={pickMedia}
            >
              <Ionicons
                name="images-outline"
                size={14}
                color={mode !== "text" ? "#fff" : "rgba(255,255,255,0.6)"}
              />
              <Text
                style={[
                  styles.modeTabText,
                  mode !== "text" && styles.modeTabTextActive,
                ]}
              >
                Photo / Video
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handlePost}
            style={styles.postBtn}
            disabled={uploading}
          >
            {uploading ? (
              <View style={styles.postGradient}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            ) : (
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.postGradient}
              >
                <Text style={styles.postText}>Post</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>

        {/* ── TEXT mode ── */}
        {mode === "text" && (
          <>
            <View style={styles.textArea}>
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="What's on your mind?"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={text}
                onChangeText={setText}
                multiline
                maxLength={500}
                autoFocus
                textAlign="center"
              />
            </View>

            {/* Color picker */}
            <View style={styles.colorRow}>
              {STATUS_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    bgColor === color && styles.colorDotActive,
                  ]}
                  onPress={() => setBgColor(color)}
                />
              ))}
            </View>
          </>
        )}

        {/* ── PHOTO / VIDEO: empty state ── */}
        {mode !== "text" && !mediaUri && (
          <TouchableOpacity
            style={styles.pickArea}
            onPress={pickMedia}
            activeOpacity={0.8}
          >
            <View style={styles.pickIconWrap}>
              <LinearGradient
                colors={["rgba(0,212,170,0.15)", "rgba(91,141,238,0.15)"]}
                style={styles.pickIconBg}
              >
                <Ionicons name="images-outline" size={44} color="#00d4aa" />
              </LinearGradient>
            </View>
            <Text style={styles.pickTitle}>Select a Photo or Video</Text>
            <Text style={styles.pickSub}>Up to 60 seconds for videos</Text>
          </TouchableOpacity>
        )}

        {/* ── PHOTO / VIDEO: media selected ── */}
        {mode !== "text" && mediaUri && (
          <>
            {/* Change / remove media row */}
            <View style={styles.mediaActions}>
              <TouchableOpacity
                style={styles.mediaActionBtn}
                onPress={pickMedia}
              >
                <Ionicons name="swap-horizontal" size={16} color="#fff" />
                <Text style={styles.mediaActionText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mediaActionBtn, styles.mediaActionDanger]}
                onPress={resetMedia}
              >
                <Ionicons name="trash-outline" size={16} color="#ff4757" />
                <Text style={[styles.mediaActionText, { color: "#ff4757" }]}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>

            {/* Caption input */}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.captionWrap}
            >
              <View style={styles.captionBox}>
                <Ionicons
                  name="pencil-outline"
                  size={16}
                  color="rgba(255,255,255,0.5)"
                />
                <TextInput
                  style={styles.captionInput}
                  placeholder="Add a caption..."
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  value={caption}
                  onChangeText={setCaption}
                  maxLength={200}
                />
              </View>
              <Text style={styles.captionCount}>{caption.length}/200</Text>
            </KeyboardAvoidingView>
          </>
        )}

        {/* Thumbnail processor (hidden) */}
        {thumbSource && (
          <ThumbnailProcessor
            source={thumbSource}
            onDone={(uri) => {
              thumbResolveRef.current?.(uri);
              thumbResolveRef.current = null;
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {},
  closeBtnBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 22,
    padding: 3,
    gap: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modeTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  modeTabActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  modeTabText: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "600",
    fontSize: 13,
  },
  modeTabTextActive: {
    color: "#fff",
  },
  postBtn: {
    borderRadius: 22,
    overflow: "hidden",
  },
  postGradient: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  postText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },

  // ── Text mode ────────────────────────────────────────────────────────────
  textArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  textInput: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 36,
    width: "100%",
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    padding: 16,
    paddingBottom: 36,
    backgroundColor: "rgba(0,0,0,0.2)",
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#fff",
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },

  // ── Pick area (empty media state) ────────────────────────────────────────
  pickArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  pickIconWrap: {
    marginBottom: 4,
  },
  pickIconBg: {
    width: 110,
    height: 110,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,212,170,0.2)",
  },
  pickTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  pickSub: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
  },

  // ── Media selected state ─────────────────────────────────────────────────
  mediaActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  mediaActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  mediaActionDanger: {
    backgroundColor: "rgba(255,71,87,0.1)",
    borderColor: "rgba(255,71,87,0.3)",
  },
  mediaActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Caption ──────────────────────────────────────────────────────────────
  captionWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    gap: 6,
  },
  captionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  captionInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },
  captionCount: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    textAlign: "right",
  },
});
