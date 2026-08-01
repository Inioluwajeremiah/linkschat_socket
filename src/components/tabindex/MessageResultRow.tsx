import { MessageSearchResult } from "@/types";
import { formatDistanceToNow } from "@/utils/date";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import HighlightedText from "./HighlightedText";
import { StyleSheet } from "react-native";
import { Spacing } from "@/constants";

export default function MessageResultRow({
  item,
  query,
  colors,
}: {
  item: MessageSearchResult;
  query: string;
  colors: any;
}) {
  const router = useRouter();
  const name = item.displayName || "Unknown";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Group chats show who sent it; private chats show "You:" only when the
  // match is the current user's own message — matching WhatsApp's convention.
  const prefix =
    item.chatType === "group"
      ? `${item.isMine ? "You" : item.senderName}: `
      : item.isMine
      ? "You: "
      : "";

  // Media messages store any caption in `content` too — the query can match
  // a caption, so show which kind of message it was attached to, same icons
  // ChatItem/ReplyBar already use elsewhere.
  const mediaIcon =
    item.type === "image"
      ? "📷 "
      : item.type === "video"
      ? "🎥 "
      : item.type === "audio"
      ? "🎵 "
      : item.type === "call"
      ? "📞 "
      : "";

  return (
    <TouchableOpacity
      style={styles.chatItem}
      activeOpacity={0.65}
      onPress={() =>
        router.push({
          pathname: `/chat/${item.chatId}` as RelativePathString,
          params: { highlightMessageId: item.messageId },
        })
      }
    >
      <View style={styles.chatAvatarWrap}>
        {item.displayAvatar ? (
          <Image
            source={{ uri: item.displayAvatar }}
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
      </View>
      <View style={[styles.chatContent, { borderBottomColor: colors.divider }]}>
        <View style={styles.chatTop}>
          <Text
            style={[styles.chatName, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text style={[styles.chatTime, { color: colors.textPrimary }]}>
            {formatDistanceToNow(new Date(item.createdAt))}
          </Text>
        </View>
        <HighlightedText
          text={`${prefix}${mediaIcon}${item.content}`}
          query={query}
          style={[styles.lastMessage, { color: colors.textSecondary }]}
          highlightStyle={{ color: "#00d4aa", fontWeight: "800" }}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatItem: { flexDirection: "row", paddingHorizontal: Spacing.base, gap: 12 },
  chatAvatarWrap: { position: "relative", marginTop: 10 },
  chatAvatar: { width: 50, height: 50, borderRadius: 25 },
  chatAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  chatAvatarInitials: { color: "#fff", fontWeight: "700", fontSize: 17 },
  chatContent: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  chatTop: { flexDirection: "row", justifyContent: "space-between" },
  chatName: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
  chatTime: { fontSize: 12 },
  lastMessage: { fontSize: 13 },
});
