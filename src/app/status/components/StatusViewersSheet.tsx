import { useMemo } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppDispatch } from "@/hooks/useRedux";
import { useStartCall } from "@/hooks/useStartCall";
import { useToast } from "@/context/ToastContext";
import { useContactNameResolver } from "@/hooks/useContactName";
import { chatApi } from "@/services/api";
import { addOrUpdateChat } from "@/store/slices/chatSlice";
import { User } from "@/types";
import { formatDistanceToNow } from "@/utils/date";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ASSUMPTION: each view record is a full user object plus when they
// viewed — matches the { user, emoji } shape `reactions` already uses
// elsewhere in StatusViewScreen. Adjust this type (and the render below)
// if the actual API response differs — e.g. bare user IDs instead of
// populated User objects.
export type StatusViewer = {
  user: User;
  viewedAt?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  viewers: StatusViewer[];
  /** userId -> emoji, for viewers who also reacted to the status */
  reactionsByUserId?: Record<string, string>;
};

const SHEET_COLORS = {
  background: "#12121f",
  border: "#222240",
  textMuted: "#8888aa",
  textPrimary: "#fff",
};

export default function StatusViewersSheet({
  visible,
  onClose,
  viewers,
  reactionsByUserId = {},
}: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { startCall } = useStartCall();
  const { error: showError } = useToast();
  const resolveContact = useContactNameResolver();
  const insets = useSafeAreaInsets();

  const sorted = useMemo(
    () =>
      [...viewers].sort((a, b) => {
        const at = a.viewedAt ? new Date(a.viewedAt).getTime() : 0;
        const bt = b.viewedAt ? new Date(b.viewedAt).getTime() : 0;
        return bt - at; // most recent viewer first
      }),
    [viewers]
  );

  const openProfile = (userId: string) => {
    onClose();
    router.push(`/profile/${userId}` as any);
  };

  const message = async (userId: string) => {
    try {
      const res = await chatApi.createPrivateChat(userId);
      if (res.success) {
        dispatch(addOrUpdateChat(res.data.chat));
        onClose();
        router.push(`/chat/${res.data.chat._id}`);
      } else {
        showError("Couldn't start chat", "Try again in a moment.");
      }
    } catch {
      showError("Couldn't start chat", "Try again in a moment.");
    }
  };

  const call = (userId: string, type: "audio" | "video") => {
    onClose();
    startCall(userId, type);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { marginBottom: insets.bottom }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>
              {viewers.length === 0
                ? "No views yet"
                : `Viewed by ${viewers.length}`}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={SHEET_COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={sorted}
            keyExtractor={(item) => item.user._id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons
                  name="eye-outline"
                  size={40}
                  color={SHEET_COLORS.textMuted}
                />
                <Text style={styles.emptyText}>
                  No one has viewed this status yet
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const { displayName } = resolveContact(
                item.user.phone,
                item.user.name
              );
              const initials = (displayName || "?")
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const reactionEmoji = reactionsByUserId[item.user._id];

              return (
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.identity}
                    onPress={() => openProfile(item.user._id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.avatarWrap}>
                      {item.user.avatar ? (
                        <Image
                          source={{ uri: item.user.avatar }}
                          style={styles.avatar}
                          contentFit="cover"
                        />
                      ) : (
                        <LinearGradient
                          colors={["#00d4aa", "#5b8dee"]}
                          style={styles.avatarFallback}
                        >
                          <Text style={styles.avatarInitials}>{initials}</Text>
                        </LinearGradient>
                      )}
                      {reactionEmoji && (
                        <View style={styles.reactionBadge}>
                          <Text style={styles.reactionEmoji}>
                            {reactionEmoji}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.textCol}>
                      <Text style={styles.name} numberOfLines={1}>
                        {displayName}
                      </Text>
                      {item.viewedAt && (
                        <Text style={styles.time}>
                          {formatDistanceToNow(new Date(item.viewedAt))}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => message(item.user._id)}
                      accessibilityLabel={`Message ${displayName}`}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={18}
                        color="#00d4aa"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => call(item.user._id, "audio")}
                      accessibilityLabel={`Voice call ${displayName}`}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="call-outline" size={18} color="#5b8dee" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => call(item.user._id, "video")}
                      accessibilityLabel={`Video call ${displayName}`}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons
                        name="videocam-outline"
                        size={18}
                        color="#ff6b9d"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: SHEET_COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: SHEET_COLORS.border,
    maxHeight: "70%",
    paddingBottom: 24,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2a2a45",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SHEET_COLORS.border,
  },
  title: { fontSize: 16, fontWeight: "800", color: SHEET_COLORS.textPrimary },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    gap: 10,
  },
  identity: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  avatarWrap: { position: "relative" },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: { color: "#fff", fontSize: 15, fontWeight: "700" },
  reactionBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: SHEET_COLORS.background,
    borderWidth: 1,
    borderColor: SHEET_COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  reactionEmoji: { fontSize: 11 },
  textCol: { flex: 1 },
  name: { fontSize: 14, fontWeight: "700", color: SHEET_COLORS.textPrimary },
  time: { fontSize: 12, color: SHEET_COLORS.textMuted, marginTop: 2 },
  actions: { flexDirection: "row", gap: 6 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  empty: { alignItems: "center", paddingTop: 40, gap: 10 },
  emptyText: {
    color: SHEET_COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
});
