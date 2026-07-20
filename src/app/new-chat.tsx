import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Colors, Spacing, BorderRadius } from "../constants";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { userApi, chatApi } from "../services/api";
import { User } from "../types";
import { useAppDispatch } from "../hooks/useRedux";
import { addOrUpdateChat } from "../store/slices/chatSlice";

export default function NewChatScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setUsers([]);
      return;
    }
    setLoading(true);
    try {
      const res = await userApi.searchUsers(q);
      if (res.success) setUsers(res.data.users);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  const startChat = async (userId: string) => {
    setCreating(userId);
    try {
      const res = await chatApi.createPrivateChat(userId);
      if (res.success) {
        dispatch(addOrUpdateChat(res.data.chat));
        router.replace(`/chat/${res.data.chat._id}`);
      }
    } catch {
    } finally {
      setCreating(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backBtn,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          New Chat
        </Text>
        <TouchableOpacity
          style={[
            styles.groupBtn,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          onPress={() => router.push("/new-group")}
        >
          <Ionicons name="people-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <View
          style={[
            styles.searchBar,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search by name or email..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={search}
            autoFocus
          />
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(u) => u._id}
        renderItem={({ item }) => {
          const initials = item.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => startChat(item._id)}
              disabled={creating === item._id}
              activeOpacity={0.7}
            >
              <View style={styles.avatarWrap}>
                {item.avatar ? (
                  <Image
                    source={{ uri: item.avatar }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={styles.avatarFallback}
                  >
                    <Text
                      style={[styles.initials, { color: colors.textInverse }]}
                    >
                      {initials}
                    </Text>
                  </LinearGradient>
                )}
                {item.isOnline && (
                  <View
                    style={[
                      styles.onlineDot,
                      {
                        backgroundColor: colors.tabActive,
                        borderColor: colors.tabActive,
                      },
                    ]}
                  />
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>
                  {item.name}
                </Text>
                <Text
                  style={[styles.userEmail, { color: colors.textSecondary }]}
                >
                  {item.bio || item.email}
                </Text>
              </View>
              {creating === item._id ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons
                  name="chatbubble-outline"
                  size={20}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          query.length >= 2 && !loading ? (
            <View style={styles.empty}>
              <Ionicons
                name="search-outline"
                size={48}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No users found for "{query}"
              </Text>
            </View>
          ) : query.length < 2 ? (
            <View style={styles.hint}>
              <Ionicons
                name="people-outline"
                size={48}
                color={colors.textMuted}
              />
              <Text style={[styles.hintText, { color: colors.textMuted }]}>
                Search for people to chat with
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,

    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  title: { flex: 1, fontSize: 20, fontWeight: "700" },
  groupBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,

    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  searchWrap: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },
  list: { padding: Spacing.sm, paddingBottom: 100 },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 12,
    gap: 12,
    borderRadius: 14,
    marginBottom: 4,
  },
  avatarWrap: { position: "relative" },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: { fontSize: 18, fontWeight: "700" },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,

    borderWidth: 2,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "700" },
  userEmail: { fontSize: 13 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, textAlign: "center" },
  hint: { alignItems: "center", paddingTop: 80, gap: 12 },
  hintText: { fontSize: 15, textAlign: "center" },
});
