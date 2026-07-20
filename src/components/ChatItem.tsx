import { Spacing } from "@/constants";
import { Chat, Message, User } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Animated, TouchableOpacity } from "react-native";

export default function ChatItem({
  chat,
  userId,
  colors,
  deviceContacts,
}: {
  chat: Chat;
  userId: string;
  colors: any;
  deviceContacts: Map<string, string>; // phone → contact name
}) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, []);

  const otherParticipant =
    chat.type === "private"
      ? (chat.participants.find((p) => p.user._id !== userId)?.user as User)
      : null;

  // ── Privacy checks ──────────────────────────────────────────────────────
  const privacySettings = (otherParticipant as any)?.privacySettings;
  const hideOnlineStatus = privacySettings?.hideOnlineStatus ?? false;
  const hideLastSeen = privacySettings?.hideLastSeen ?? false;

  console.log(" otherParticipant in chat item ==>> ", otherParticipant);

  // Only show online dot if user hasn't hidden online status
  const isOnline = !hideOnlineStatus && otherParticipant?.isOnline;

  // ── Contact name resolution ──────────────────────────────────────────────
  const resolvedContactName = (() => {
    if (chat.type === "group" || !otherParticipant?.phone) return null;
    const normalize = (p: string) => p.replace(/\D/g, "");
    const suffix = normalize(otherParticipant.phone).slice(-9);
    return deviceContacts.get(suffix) ?? null;
  })();

  const displayName =
    chat.type === "group"
      ? chat.name
      : resolvedContactName || otherParticipant?.name || "Unknown";

  const isContactSaved = !!resolvedContactName;

  const displayAvatar =
    chat.type === "group" ? chat.avatar : otherParticipant?.avatar;

  const hasUnread = (chat.unreadCount ?? 0) > 0;

  // ── Last message preview ─────────────────────────────────────────────────
  const lastMsg = chat.lastMessage as Message | undefined;
  let lastMsgText = "Tap to start chatting";
  let lastMsgIcon: string | null = null;

  if (lastMsg) {
    if (lastMsg.isDeleted) {
      lastMsgText = "This message was deleted";
      lastMsgIcon = "ban-outline";
    } else if (lastMsg.type === "image") {
      lastMsgText = "Photo";
      lastMsgIcon = "image-outline";
    } else if (lastMsg.type === "video") {
      lastMsgText = "Video";
      lastMsgIcon = "videocam-outline";
    } else if (lastMsg.type === "audio") {
      lastMsgText = "Voice message";
      lastMsgIcon = "mic-outline";
    } else if (lastMsg.type === "document") {
      lastMsgText = lastMsg.mediaName || "Document";
      lastMsgIcon = "document-outline";
    } else if (lastMsg.type === "gif") {
      lastMsgText = "GIF";
      lastMsgIcon = "film-outline";
    } else if (lastMsg.type === "sticker") {
      lastMsgText = "Sticker";
      lastMsgIcon = "happy-outline"; // or "sparkles-outline"
    } else {
      lastMsgText = lastMsg.content;
    }
  }

  // ── Last message time formatting ─────────────────────────────────────────
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Today — show time
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      // This week — show day name
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      // Older — show date
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const initials = (displayName || "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={[styles.chatItem, { backgroundColor: colors.background }]}
        onPress={() => router.push(`/chat/${chat._id}`)}
        activeOpacity={0.65}
      >
        {/* ── Avatar + online dot ── */}
        <View style={styles.chatAvatarWrap}>
          {displayAvatar ? (
            <Image
              source={{ uri: displayAvatar }}
              style={styles.chatAvatar}
              contentFit="cover"
            />
          ) : (
            <LinearGradient
              colors={["#00d4aa", "#5b8dee"]}
              style={styles.chatAvatarFallback}
            >
              <Text style={styles.chatAvatarInitials}>{initials}</Text>
            </LinearGradient>
          )}

          {/* Online dot — only for private chats where privacy allows */}
          {chat.type === "private" && isOnline && (
            <View
              style={[styles.chatOnlineDot, { borderColor: colors.background }]}
            />
          )}

          {/* Group indicator badge */}
          {chat.type === "group" && (
            <View
              style={[
                styles.groupBadge,
                { borderColor: colors.background, backgroundColor: "#5b8dee" },
              ]}
            >
              <Ionicons name="people" size={8} color="#fff" />
            </View>
          )}
        </View>

        {/* ── Content ── */}
        <View
          style={[styles.chatContent, { borderBottomColor: colors.divider }]}
        >
          {/* Top row: name + time */}
          <View style={styles.chatTop}>
            <View style={styles.chatNameRow}>
              <Text
                style={[
                  styles.chatName,
                  {
                    color: colors.textPrimary,
                    fontWeight: hasUnread ? "800" : "600",
                  },
                ]}
                numberOfLines={1}
              >
                {displayName}
              </Text>

              {/* Not saved indicator — only for private chats */}
              {chat.type === "private" &&
                !isContactSaved &&
                otherParticipant?.phone && (
                  <View style={styles.unsavedDot}>
                    <Ionicons
                      name="person-add-outline"
                      size={9}
                      color="#ffc107"
                    />
                  </View>
                )}
            </View>

            <Text
              style={[
                styles.chatTime,
                { color: hasUnread ? "#00d4aa" : colors.textMuted },
              ]}
            >
              {chat.lastMessageAt
                ? formatTime(new Date(chat.lastMessageAt))
                : ""}
            </Text>
          </View>

          {/* Bottom row: last message + unread badge */}
          <View style={styles.chatBottom}>
            <View style={styles.lastMsgRow}>
              {/* Message type icon */}
              {lastMsgIcon && !lastMsg?.isDeleted && (
                <Ionicons
                  name={lastMsgIcon as any}
                  size={13}
                  color={hasUnread ? colors.textPrimary : colors.textMuted}
                  style={{ marginRight: 3 }}
                />
              )}

              <Text
                style={[
                  styles.lastMessage,
                  {
                    color: lastMsg?.isDeleted
                      ? colors.textMuted
                      : hasUnread
                      ? colors.textPrimary
                      : colors.textSecondary,
                    fontWeight: hasUnread ? "600" : "400",
                    fontStyle: lastMsg?.isDeleted ? "italic" : "normal",
                  },
                ]}
                numberOfLines={1}
              >
                {lastMsgText}
              </Text>
            </View>

            <View style={styles.chatBadgesRow}>
              {/* Unread count */}
              {hasUnread && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {(chat.unreadCount ?? 0) > 99 ? "99+" : chat.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: Spacing.base,
  },
  chatAvatarWrap: { position: "relative", flexShrink: 0, paddingVertical: 10 },
  chatAvatar: { width: 52, height: 52, borderRadius: 26 },
  chatAvatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  chatAvatarInitials: { color: "#fff", fontSize: 17, fontWeight: "700" },
  chatOnlineDot: {
    position: "absolute",
    bottom: 11,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#00d4aa",
    borderWidth: 2,
  },
  chatContent: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingRight: Spacing.base,
    paddingVertical: 10,
    paddingLeft: 12,
    gap: 3,
  },
  chatTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatName: { fontSize: 15, flex: 1, marginRight: 8 },
  chatTime: { fontSize: 11 },
  chatBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: { fontSize: 13, flex: 1, marginRight: 8 },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#00d4aa",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  chatNameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginRight: 8,
  },
  unsavedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,193,7,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,193,7,0.3)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  groupBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  lastMsgRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  chatBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
