import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  Keyboard,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { chatApi, statusApi, uploadFileToS3 } from "../../services/api";
import { socketService } from "../../services/socket";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { useStartCall } from "../../hooks/useStartCall";
import { addOrUpdateChat } from "../../store/slices/chatSlice";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { StatusGroup, Status, User } from "../../types";
import { formatDistanceToNow } from "../../utils/date";
import * as Contacts from "expo-contacts";
import StickerPicker from "@/components/StickerPicker";
import { StickerRef, encodeBundledRef } from "@/constants/stickers";
import AttachmentSheet, {
  AttachmentResult,
} from "../chat/components/AttachmentSheet";
import AudioRecorder, {
  RecordedSegment,
} from "../chat/components/AudioRecorder";
import { useContactNameResolver } from "@/hooks/useContactName";

const { width, height } = Dimensions.get("window");
const EMOJI_REACTIONS = [
  "\u2764\ufe0f",
  "\ud83d\ude02",
  "\ud83d\ude2e",
  "\ud83d\ude22",
  "\ud83d\udc4f",
  "\ud83d\udd25",
];

// Status viewer is always a black full-screen overlay regardless of the
// app's light/dark theme, so the sticker picker gets its own fixed dark
// palette instead of pulling from ThemeContext (which could be light and
// clash with the rest of this screen).
const STICKER_PICKER_COLORS = {
  surface: "#12121f",
  background: "#0d0d18",
  border: "#222240",
  textMuted: "#8888aa",
  textPrimary: "#fff",
};

export default function StatusViewScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const { startCall } = useStartCall();
  const { colors } = useTheme();
  const toast = useToast();
  const resolveContact = useContactNameResolver();
  const insets = useSafeAreaInsets();

  const [groups, setGroups] = useState<StatusGroup[]>([]);
  const [groupIdx, setGroupIdx] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [myReactionEmoji, setMyReactionEmoji] = useState<string | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(insets.top);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressRef = useRef<Animated.CompositeAnimation | null>(null);
  const inputRef = useRef<TextInput>(null);
  const [deviceContacts, setDeviceContacts] = useState<Map<string, string>>(
    new Map()
  );

  const [showMenu, setShowMenu] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setShowMenu(true);
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 200,
        friction: 22,
      }),
    ]).start();
  };

  const closeMenu = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowMenu(false);
      callback?.();
    });
  };

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const show = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardOffset(insets.top);
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardOffset(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, [insets.top]);

  // Load contacts once on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status !== "granted") return;

        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

        const map = new Map<string, string>();
        const normalize = (p: string) => p.replace(/\D/g, "");

        for (const contact of data) {
          if (!contact.name || !contact.phoneNumbers) continue;
          for (const pn of contact.phoneNumbers) {
            const suffix = normalize(pn.number || "").slice(-9);
            if (suffix.length >= 7) map.set(suffix, contact.name);
          }
        }
        setDeviceContacts(map);
      } catch {}
    };
    loadContacts();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await statusApi.getStatuses();
        if (res.success) {
          const all: StatusGroup[] = [];
          if (res.data.myStatus) all.push(res.data.myStatus);
          all.push(...res.data.statuses);
          setGroups(all);
          const startIdx = userId
            ? Math.max(
                0,
                all.findIndex((g) => g.user._id === userId)
              )
            : 0;
          setGroupIdx(startIdx);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // const resolveDisplayName = (
  //   user: User
  // ): { name: string; isContact: boolean } => {
  //   if (!user.phone) return { name: user.name, isContact: false };
  //   const normalize = (p: string) => p.replace(/\D/g, "");
  //   const suffix = normalize(user.phone).slice(-9);
  //   const contactName = deviceContacts.get(suffix);
  //   return {
  //     name: contactName || user.name,
  //     isContact: !!contactName,
  //   };
  // };

  const currentGroup = groups[groupIdx];
  const currentStatus: Status | undefined = currentGroup?.statuses[statusIdx];

  const videoSource =
    currentStatus?.type === "video" ? currentStatus.mediaUrl ?? null : null;
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = false;
  });

  const privacySettings = (currentGroup?.user as any)?.privacySettings;
  const hideOnlineStatus = privacySettings?.hideOnlineStatus ?? false;
  const hideLastSeen = privacySettings?.hideLastSeen ?? false;

  // Reflect whatever reaction *this* user already left on the current
  // status (if any) so the heart button and emoji row show the right state
  // when navigating between statuses, not just after a fresh tap.
  useEffect(() => {
    if (!currentStatus || !user) {
      setMyReactionEmoji(null);
      return;
    }
    const mine = (currentStatus as any).reactions?.find((r: any) => {
      const uid = typeof r.user === "string" ? r.user : r.user?._id;
      return uid === user._id;
    });
    setMyReactionEmoji(mine ? mine.emoji : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStatus?._id, user?._id]);

  const startProgress = (durationSec: number) => {
    progressAnim.setValue(0);
    if (progressRef.current) progressRef.current.stop();
    progressRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: durationSec * 1000,
      useNativeDriver: false,
    });
    progressRef.current.start(({ finished }) => {
      if (finished) advance();
    });
  };

  useEffect(() => {
    if (!currentStatus || loading || paused) return;

    if (currentStatus.type === "video") {
      const start = currentStatus.trimStart || 0;
      const end =
        currentStatus.trimEnd ||
        start + (currentStatus.mediaDuration || currentStatus.duration || 15);

      progressAnim.setValue(0);
      player.currentTime = start;
      player.play();

      const sub = player.addListener("timeUpdate", (payload) => {
        const t = payload.currentTime;
        const span = end - start || 1;
        const fraction = Math.min(1, Math.max(0, (t - start) / span));
        progressAnim.setValue(fraction);
        if (t >= end) {
          player.pause();
          advance();
        }
      });

      statusApi.viewStatus(currentStatus._id).catch(() => {});
      return () => {
        sub?.remove();
        player.pause();
      };
    }

    startProgress(currentStatus.duration || 5);
    statusApi.viewStatus(currentStatus._id).catch(() => {});
    return () => {
      if (progressRef.current) progressRef.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusIdx, groupIdx, paused, loading]);

  const advance = () => {
    if (!currentGroup) return;
    if (statusIdx < currentGroup.statuses.length - 1) {
      setStatusIdx((i) => i + 1);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx((i) => i + 1);
      setStatusIdx(0);
    } else {
      router.back();
    }
  };

  const goBack = () => {
    if (statusIdx > 0) {
      setStatusIdx((i) => i - 1);
    } else if (groupIdx > 0) {
      const prev = groups[groupIdx - 1];
      setGroupIdx((i) => i - 1);
      setStatusIdx(prev.statuses.length - 1);
    }
  };

  const pauseProgress = () => {
    if (currentStatus?.type === "video") {
      player.pause();
    } else if (progressRef.current) {
      progressRef.current.stop();
    }
    setPaused(true);
  };

  const resumeProgress = () => {
    setPaused(false);
    if (currentStatus?.type === "video") {
      player.play();
    } else if (currentStatus) {
      startProgress(currentStatus.duration || 5);
    }
  };

  // Reactions get their own lightweight notice — separate from
  // sendStatusReply — because we don't want the "Sent to X" toast or the
  // sendingReply spinner firing every time someone taps a reaction emoji.
  // It reuses the exact same createPrivateChat + message:send pipeline so
  // it benefits from the same real-time delivery, offline push, and chat
  // list update behavior replies already get.
  const notifyStatusReaction = async (emoji: string) => {
    if (!currentGroup) return;
    try {
      const chatRes = await chatApi.createPrivateChat(currentGroup.user._id);
      if (!chatRes.success) return;
      dispatch(addOrUpdateChat(chatRes.data.chat));
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      socketService.emit("message:send", {
        chatId: chatRes.data.chat._id,
        content: `${emoji} Reacted to your status`,
        type: "text",
        tempId,
      });
    } catch {
      // Silent on purpose — the reaction itself already succeeded via
      // reactToStatus; failing to notify shouldn't surface an error to
      // the person who just reacted.
    }
  };

  // ── Reactions (heart button + emoji row both funnel through this) ────────
  const handleReact = async (emoji: string) => {
    if (!currentStatus) return;
    setShowEmoji(false);
    const previous = myReactionEmoji;
    const isRemoving = previous === emoji;
    setMyReactionEmoji(isRemoving ? null : emoji); // optimistic
    try {
      await statusApi.reactToStatus(currentStatus._id, emoji);
      if (!isRemoving) {
        notifyStatusReaction(emoji); // don't await — fire and forget
      }
    } catch {
      setMyReactionEmoji(previous); // revert on failure
      toast.error("Failed to react");
    }
  };

  // ── Reply (text / sticker) — sent as a real DM to the status owner,
  // same as WhatsApp: there's no separate "comments" system, a status
  // reply just opens/continues a private chat with that person. ───────────
  const sendStatusReply = async (payload: {
    content?: string;
    type: string;
    mediaUrl?: string;
    mediaName?: string;
    mediaSize?: number;
    mediaDuration?: number;
  }) => {
    if (!currentGroup) return;
    setSendingReply(true);
    try {
      const chatRes = await chatApi.createPrivateChat(currentGroup.user._id);
      if (!chatRes.success) throw new Error("Failed to open chat");
      dispatch(addOrUpdateChat(chatRes.data.chat));

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      socketService.emit("message:send", {
        chatId: chatRes.data.chat._id,
        content: payload.content || "",
        type: payload.type,
        mediaUrl: payload.mediaUrl,
        mediaName: payload.mediaName,
        mediaSize: payload.mediaSize,
        mediaDuration: payload.mediaDuration,
        tempId,
      });

      toast.success(
        `Sent to ${
          resolveContact(currentGroup.user.phone, currentGroup.user.name)
            .displayName
        }`
      );
    } catch (err) {
      console.log(" status reply text err ==>> ", err);

      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleSendTextReply = () => {
    const content = replyText.trim();
    if (!content) return;
    setReplyText("");
    inputRef.current?.blur();
    resumeProgress();
    sendStatusReply({ content, type: "text" });
  };

  const handleStickerPick = async (ref: StickerRef) => {
    setShowStickers(false);
    resumeProgress();
    if (ref.kind === "bundled") {
      await sendStatusReply({
        type: "sticker",
        mediaUrl: encodeBundledRef(ref.packId, ref.stickerId),
      });
      return;
    }
    try {
      const publicUrl = await uploadFileToS3(
        ref.localUri,
        "sticker.jpg",
        "image/jpeg",
        "image"
      );
      await sendStatusReply({ type: "sticker", mediaUrl: publicUrl });
    } catch {
      toast.error("Failed to send sticker");
    }
  };

  const handleAttachmentReply = async (result: AttachmentResult) => {
    setShowAttachment(false);
    try {
      const mimeType = result.mimeType || "application/octet-stream";
      const publicUrl = await uploadFileToS3(
        result.uri,
        result.name || "file",
        mimeType,
        result.type
      );
      const caption = replyText.trim();
      await sendStatusReply({
        type: result.type,
        mediaUrl: publicUrl,
        mediaName: result?.name || "",
        mediaSize: result?.size || 0,
        mediaDuration: result?.duration || 0,
        content: caption || undefined,
      });
      setReplyText("");
    } catch {
      toast.error("Failed to send file");
    } finally {
      resumeProgress();
    }
  };

  const handleVoiceNoteReply = async (
    segments: RecordedSegment[],
    totalDurationSeconds: number
  ) => {
    setShowRecorder(false);
    if (segments.length === 0) {
      resumeProgress();
      return;
    }
    try {
      for (const segment of segments) {
        const publicUrl = await uploadFileToS3(
          segment.uri,
          "voice.m4a",
          "audio/mp4",
          "audio"
        );
        await sendStatusReply({
          type: "audio",
          mediaUrl: publicUrl,
          mediaDuration: Math.round(segment.durationMs / 1000),
        });
      }
    } catch {
      toast.error("Failed to send voice note");
    } finally {
      resumeProgress();
    }
  };

  const handleReplyFocus = () => {
    pauseProgress();
  };

  const handleReplyBlur = () => {
    if (!replyText) resumeProgress();
  };

  if (loading || !currentGroup || !currentStatus) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <StatusBar style="light" />
      </View>
    );
  }

  const isMyStatus = currentGroup.user._id === user?._id;
  const isMediaStatus =
    currentStatus.type === "image" || currentStatus.type === "video";
  const isLiked = myReactionEmoji === "\u2764\ufe0f";

  return (
    // <View style={styles.container}>
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : keyboardOffset}
    >
      {/* Background */}
      {currentStatus.type === "video" && currentStatus.mediaUrl ? (
        <VideoView
          style={StyleSheet.absoluteFillObject}
          player={player}
          nativeControls={false}
          contentFit="cover"
        />
      ) : currentStatus.type === "image" && currentStatus.mediaUrl ? (
        <Image
          source={{ uri: currentStatus.mediaUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: currentStatus.backgroundColor || "#1a1a2e" },
          ]}
        />
      )}

      {/* Dark gradients top + bottom */}
      <LinearGradient
        colors={["rgba(0,0,0,0.65)", "transparent"]}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* ── Progress bars ── */}
      <View style={styles.topArea}>
        <View style={styles.progressRow}>
          {currentGroup.statuses.map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width:
                      i < statusIdx
                        ? "100%"
                        : i === statusIdx
                        ? progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          })
                        : "0%",
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* ── Header row ── */}
        <View style={styles.headerRow}>
          <View style={styles.userRow}>
            {currentGroup.user.avatar ? (
              <Image
                source={{ uri: currentGroup.user.avatar }}
                style={styles.headerAvatar}
                contentFit="cover"
              />
            ) : (
              <LinearGradient
                colors={["#00d4aa", "#5b8dee"]}
                style={styles.headerAvatarFallback}
              >
                <Text style={styles.headerAvatarInitials}>
                  {resolveContact(
                    currentGroup.user.phone,
                    currentGroup.user.name
                  )
                    .displayName.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </LinearGradient>
            )}

            <View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text style={styles.headerName}>
                  {
                    resolveContact(
                      currentGroup.user.phone,
                      currentGroup.user.name
                    ).displayName
                  }
                </Text>
                {!resolveContact(
                  currentGroup.user.phone,
                  currentGroup.user.name
                ).isContact &&
                  // {!resolveDisplayName(currentGroup.user as User).isContact &&
                  !isMyStatus && (
                    <View style={styles.notSavedChip}>
                      <Ionicons
                        name="person-add-outline"
                        size={9}
                        color="#ffc107"
                      />
                    </View>
                  )}
              </View>

              {!hideLastSeen && (
                <Text style={styles.headerTime}>
                  {formatDistanceToNow(new Date(currentStatus.createdAt))}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.headerRight}>
            {currentGroup.statuses.length > 1 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {statusIdx + 1}/{currentGroup.statuses.length}
                </Text>
              </View>
            )}
            {!isMyStatus && (
              <TouchableOpacity
                onPress={() => {
                  pauseProgress();
                  openMenu();
                }}
                style={styles.menuTriggerBtn}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Tap zones: left = back, right = advance ── */}
      <View style={styles.tapZones} pointerEvents="box-none">
        <Pressable
          style={styles.tapLeft}
          onPress={goBack}
          onLongPress={pauseProgress}
          onPressOut={() => {
            if (paused) resumeProgress();
          }}
        />
        <Pressable
          style={styles.tapRight}
          onPress={advance}
          onLongPress={pauseProgress}
          onPressOut={() => {
            if (paused) resumeProgress();
          }}
        />
      </View>

      {/* ── Text-only status content ── */}
      {currentStatus.type === "text" && currentStatus.content && (
        <View style={styles.textContent} pointerEvents="none">
          <Text
            style={[
              styles.statusText,
              { color: currentStatus.textColor || "#fff" },
            ]}
          >
            {currentStatus.content}
          </Text>
        </View>
      )}

      {/* ── Caption overlay for photo/video statuses ── */}
      {isMediaStatus && currentStatus.content && (
        <View style={styles.captionOverlay} pointerEvents="none">
          <Text style={styles.captionOverlayText}>{currentStatus.content}</Text>
        </View>
      )}

      {/* ── Views + reactions (my status only) ── */}
      {isMyStatus &&
        (currentStatus.views.length > 0 ||
          ((currentStatus as any).reactions?.length ?? 0) > 0) && (
          <View style={styles.viewsRow} pointerEvents="none">
            <Ionicons
              name="eye-outline"
              size={14}
              color="rgba(255,255,255,0.7)"
            />
            <Text style={styles.viewsText}>
              {currentStatus.views.length} view
              {currentStatus.views.length !== 1 ? "s" : ""}
            </Text>
            {((currentStatus as any).reactions?.length ?? 0) > 0 && (
              <>
                <Text style={styles.viewsDot}>·</Text>
                <Ionicons name="heart" size={12} color="#ff4757" />
                <Text style={styles.viewsText}>
                  {(currentStatus as any).reactions.length}
                </Text>
              </>
            )}
          </View>
        )}

      {/* ── Bottom actions ── */}
      {!isMyStatus && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.bottomArea}
        >
          {/* Emoji reactions */}
          {showEmoji && (
            <View style={styles.emojiRow}>
              {EMOJI_REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => handleReact(emoji)}
                  style={[
                    styles.emojiBtn,
                    myReactionEmoji === emoji && styles.emojiBtnActive,
                  ]}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Reply + emoji + sticker row */}
          <View style={styles.replyRow}>
            <TouchableOpacity
              style={styles.emojiToggleBtn}
              onPress={() => {
                setShowEmoji((v) => !v);
                setShowStickers(false);
                if (!showEmoji) pauseProgress();
                else resumeProgress();
              }}
            >
              <Ionicons
                name="happy-outline"
                size={24}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.emojiToggleBtn}
              onPress={() => {
                setShowStickers((v) => !v);
                setShowEmoji(false);
                if (!showStickers) pauseProgress();
                else resumeProgress();
              }}
            >
              <MaterialCommunityIcons
                name="sticker-emoji"
                size={22}
                color={showStickers ? "#00d4aa" : "rgba(255,255,255,0.8)"}
              />
            </TouchableOpacity>

            <View style={styles.replyInputWrap}>
              <TextInput
                ref={inputRef}
                style={styles.replyInput}
                placeholder="Reply..."
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={replyText}
                onChangeText={setReplyText}
                onFocus={handleReplyFocus}
                onBlur={handleReplyBlur}
                editable={!sendingReply}
              />
            </View>

            {replyText.length > 0 ? (
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={handleSendTextReply}
                disabled={sendingReply}
              >
                <LinearGradient
                  colors={["#00d4aa", "#00b090"]}
                  style={styles.sendGradient}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.emojiToggleBtn}
                  onPress={() => {
                    pauseProgress();
                    setShowAttachment(true);
                  }}
                >
                  <Ionicons
                    name="attach-outline"
                    size={22}
                    color="rgba(255,255,255,0.8)"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.emojiToggleBtn}
                  onPress={() => {
                    pauseProgress();
                    setShowRecorder(true);
                  }}
                >
                  <Ionicons
                    name="mic-outline"
                    size={22}
                    color="rgba(255,255,255,0.8)"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.likeBtn}
                  onPress={() => handleReact("\u2764\ufe0f")}
                >
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={24}
                    color={isLiked ? "#ff4757" : "rgba(255,255,255,0.8)"}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Sticker picker */}
      <View style={styles.overlayLayer} pointerEvents="box-none">
        <StickerPicker
          visible={showStickers}
          onPick={handleStickerPick}
          colors={STICKER_PICKER_COLORS}
        />
      </View>

      {/* Attachment sheet */}
      <AttachmentSheet
        visible={showAttachment}
        onClose={() => {
          setShowAttachment(false);
          resumeProgress();
        }}
        onPick={handleAttachmentReply}
        onRecord={() => {
          setShowAttachment(false);
          setShowRecorder(true);
        }}
        colors={STICKER_PICKER_COLORS}
      />

      {/* Voice recorder */}
      {showRecorder && (
        <View style={styles.overlayLayer} pointerEvents="box-none">
          <AudioRecorder
            visible={showRecorder}
            onSend={handleVoiceNoteReply}
            onCancel={() => {
              setShowRecorder(false);
              resumeProgress();
            }}
            colors={STICKER_PICKER_COLORS}
          />
        </View>
      )}

      {/* Options menu */}
      {showMenu && currentGroup && (
        <Modal
          visible={showMenu}
          transparent
          animationType="none"
          onRequestClose={() => closeMenu(() => resumeProgress())}
        >
          {/* Overlay */}
          <Animated.View style={[styles.menuOverlay, { opacity: overlayAnim }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={() => closeMenu(() => resumeProgress())}
            />
          </Animated.View>

          {/* Sheet */}
          <Animated.View
            style={[
              styles.menuSheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sheetHandle} />

            {/* Contact identity header */}
            <View style={styles.menuContactHeader}>
              <View style={styles.menuAvatarWrap}>
                {currentGroup.user.avatar ? (
                  <Image
                    source={{ uri: currentGroup.user.avatar }}
                    style={styles.menuAvatar}
                    contentFit="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={["#00d4aa", "#5b8dee"]}
                    style={styles.menuAvatarFallback}
                  >
                    <Text style={styles.menuAvatarInitials}>
                      {resolveContact(
                        currentGroup.user.phone,
                        currentGroup.user.name
                      )
                        .displayName.split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                  </LinearGradient>
                )}
                {currentGroup.user.isOnline && (
                  <View style={styles.menuOnlineDot} />
                )}
              </View>

              <View style={styles.menuContactInfo}>
                <Text style={styles.menuContactName}>
                  {
                    resolveContact(
                      currentGroup.user.phone,
                      currentGroup.user.name
                    ).displayName
                  }
                </Text>
                {currentGroup.user.phone && (
                  <Text style={styles.menuContactPhone}>
                    {currentGroup.user.phone}
                  </Text>
                )}
                <View
                  style={[
                    styles.menuOnlineChip,
                    {
                      backgroundColor: currentGroup.user.isOnline
                        ? "rgba(0,212,170,0.1)"
                        : "rgba(85,85,119,0.1)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.menuOnlineChipDot,
                      {
                        backgroundColor: currentGroup.user.isOnline
                          ? "#00d4aa"
                          : "#555577",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.menuOnlineChipText,
                      {
                        color: currentGroup.user.isOnline
                          ? "#00d4aa"
                          : "#555577",
                      },
                    ]}
                  >
                    {currentGroup.user.isOnline ? "Active now" : "Offline"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.menuDivider} />

            {/* Actions */}
            {[
              {
                icon: "chatbubble-ellipses-outline",
                label: "Send a Message",
                sub: "Start or continue a conversation",
                color: "#00d4aa",
                bg: "rgba(0,212,170,0.1)",
                onPress: async () => {
                  try {
                    const res = await chatApi.createPrivateChat(
                      currentGroup.user._id
                    );
                    if (res.success) {
                      router.replace(`/chat/${res.data.chat._id}`);
                    }
                  } catch {}
                },
              },
              {
                icon: "call-outline",
                label: "Voice Call",
                sub: "Start an audio call",
                color: "#5b8dee",
                bg: "rgba(91,141,238,0.1)",
                onPress: () => startCall(currentGroup.user._id, "audio"),
              },
              {
                icon: "videocam-outline",
                label: "Video Call",
                sub: "Start a video call",
                color: "#ff6b9d",
                bg: "rgba(255,107,157,0.1)",
                onPress: () => startCall(currentGroup.user._id, "video"),
              },
              {
                icon: "person-outline",
                label: "View Profile",
                sub: "See full contact information",
                color: "#ffc107",
                bg: "rgba(255,193,7,0.1)",
                onPress: () => {
                  router.push(`/profile/${currentGroup.user._id}` as any);
                },
              },
            ].map(({ icon, label, sub, color, bg, onPress }, i, arr) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.menuAction,
                  i < arr.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: "rgba(255,255,255,0.08)",
                  },
                ]}
                onPress={() => closeMenu(onPress)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuActionIcon, { backgroundColor: bg }]}>
                  <Ionicons name={icon as any} size={19} color={color} />
                </View>
                <View style={styles.menuActionText}>
                  <Text style={styles.menuActionLabel}>{label}</Text>
                  <Text style={styles.menuActionSub}>{sub}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={15}
                  color="rgba(255,255,255,0.3)"
                />
              </TouchableOpacity>
            ))}

            {/* Dismiss */}
            <TouchableOpacity
              style={styles.menuCancel}
              onPress={() => closeMenu(() => resumeProgress())}
            >
              <Text style={styles.menuCancelText}>Dismiss</Text>
            </TouchableOpacity>
          </Animated.View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 1,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1,
  },
  topArea: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
  progressRow: {
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  progressTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 2 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
  },
  headerAvatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarInitials: { color: "#fff", fontWeight: "700", fontSize: 15 },
  headerName: { fontSize: 14, fontWeight: "700", color: "#fff" },
  headerTime: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  countBadge: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  tapZones: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    bottom: 120,
    flexDirection: "row",
    zIndex: 5,
  },
  tapLeft: { flex: 1 },
  tapRight: { flex: 1 },
  textContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    zIndex: 2,
  },
  statusText: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 36,
  },
  captionOverlay: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 5,
  },
  notSavedChip: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,193,7,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,193,7,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captionOverlayText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
  },
  viewsRow: {
    position: "absolute",
    bottom: 90,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    zIndex: 10,
  },
  viewsText: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  viewsDot: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginHorizontal: 2,
  },
  bottomArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingBottom: 28,
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  emojiBtnActive: {
    borderWidth: 2,
    borderColor: "#00d4aa",
  },
  emojiText: { fontSize: 22 },
  replyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  emojiToggleBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  replyInputWrap: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  replyInput: { color: "#fff", fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, overflow: "hidden" },
  sendGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  likeBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  menuTriggerBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  menuSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#12121f",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: "#222240",
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2a2a45",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  menuContactHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 14,
  },
  menuAvatarWrap: { position: "relative" },
  menuAvatar: { width: 54, height: 54, borderRadius: 27 },
  menuAvatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  menuAvatarInitials: { color: "#fff", fontSize: 18, fontWeight: "800" },
  menuOnlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#00d4aa",
    borderWidth: 2,
    borderColor: "#12121f",
  },
  menuContactInfo: { flex: 1, gap: 4 },
  menuContactName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  menuContactPhone: { fontSize: 13, color: "#8888aa" },
  menuOnlineChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  menuOnlineChipDot: { width: 6, height: 6, borderRadius: 3 },
  menuOnlineChipText: { fontSize: 11, fontWeight: "700" },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#222240",
    marginBottom: 4,
  },
  menuAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  menuActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  menuActionText: { flex: 1 },
  menuActionLabel: { fontSize: 15, fontWeight: "700", color: "#f0f0ff" },
  menuActionSub: { fontSize: 12, color: "#8888aa", marginTop: 2 },
  menuCancel: { alignItems: "center", paddingVertical: 16, marginTop: 4 },
  menuCancelText: { fontSize: 14, fontWeight: "600", color: "#8888aa" },
  // Add to your styles
  overlayLayer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50, // higher than tapZones (5) and bottomArea (10)
  },
});
