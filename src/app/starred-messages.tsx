import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { starApi } from "../services/api";
import { Message, User } from "../types";
import { formatDistanceToNow } from "../utils/date";

export default function StarredMessagesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    starApi
      .getStarred()
      .then((res) => {
        if (res.success) setMessages(res.data.messages);
      })
      .catch(() => toast.error("Failed to load starred messages"))
      .finally(() => setLoading(false));
  }, []);

  const unstar = async (msgId: string) => {
    await starApi.starMessage(msgId).catch(() => {});
    setMessages((prev) => prev.filter((m) => m._id !== msgId));
    toast.success("Unstarred");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Starred Messages
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#00d4aa" size="large" />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(m) => m._id}
          contentContainerStyle={[
            styles.list,
            messages.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="star-outline"
                size={60}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No starred messages
              </Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                Long-press a message and tap Star to save it here
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const sender = item.sender as User;
            const initials =
              sender?.name
                ?.split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "?";
            const preview = item.isDeleted
              ? "This message was deleted"
              : item.type === "image"
              ? "📷 Photo"
              : item.type === "video"
              ? "🎥 Video"
              : item.type === "audio"
              ? "🎵 Voice message"
              : item.content;
            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() =>
                  item.chatId && router.push(`/chat/${item.chatId}`)
                }
                activeOpacity={0.75}
              >
                <View style={styles.cardLeft}>
                  {sender?.avatar ? (
                    <Image
                      source={{ uri: sender.avatar }}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={["#00d4aa", "#5b8dee"]}
                      style={styles.avatarFb}
                    >
                      <Text style={styles.avatarInitials}>{initials}</Text>
                    </LinearGradient>
                  )}
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text
                      style={[styles.senderName, { color: colors.textPrimary }]}
                    >
                      {sender?.name || "Unknown"}
                    </Text>
                    <Text style={[styles.msgTime, { color: colors.textMuted }]}>
                      {formatDistanceToNow(new Date(item.createdAt))}
                    </Text>
                  </View>
                  <Text
                    style={[styles.msgContent, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {preview}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => unstar(item._id)}
                  style={styles.starBtn}
                >
                  <Ionicons name="star" size={20} color="#f5c518" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "800" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  listEmpty: { flexGrow: 1 },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingTop: 80,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: { fontSize: 13, textAlign: "center", paddingHorizontal: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
  },
  cardLeft: {},
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cardBody: { flex: 1 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  senderName: { fontSize: 14, fontWeight: "700" },
  msgTime: { fontSize: 11 },
  msgContent: { fontSize: 13, lineHeight: 18 },
  starBtn: { padding: 4 },
});
