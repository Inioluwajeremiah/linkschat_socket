import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Colors, Spacing, BorderRadius } from "../constants";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { userApi, chatApi } from "../services/api";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { addOrUpdateChat } from "../store/slices/chatSlice";
import { User } from "../types";

export default function ContactsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const onlineUsers = useAppSelector((s) => s.socket.onlineUsers);
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await userApi.getContacts();
      if (res.success) setContacts(res.data.contacts as User[]);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const startChat = async (userId: string) => {
    try {
      const res = await chatApi.createPrivateChat(userId);
      if (res.success) {
        dispatch(addOrUpdateChat(res.data.chat));
        router.push(`/chat/${res.data.chat._id}`);
      }
    } catch {}
  };

  const filtered = contacts.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  // Group alphabetically
  const grouped = filtered.reduce<Record<string, User[]>>((acc, c) => {
    const letter = c.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(c);
    return acc;
  }, {});

  const sections = Object.keys(grouped)
    .sort()
    .map((letter) => ({
      letter,
      contacts: grouped[letter].sort((a, b) => a.name.localeCompare(b.name)),
    }));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Contacts
        </Text>
        <Text
          style={[
            styles.count,
            { backgroundColor: colors.surface, color: colors.textMuted },
          ]}
        >
          {contacts.length}
        </Text>
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
            placeholder="Search contacts..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(s) => s.letter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item: section }) => (
            <View>
              <View
                style={[
                  styles.sectionHeader,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={styles.sectionLetter}>{section.letter}</Text>
              </View>
              {section.contacts.map((contact) => {
                const isOnline = onlineUsers.includes(contact._id);
                const initials = contact.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <TouchableOpacity
                    key={contact._id}
                    style={styles.contactItem}
                    onPress={() => startChat(contact._id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.avatarWrap}>
                      {contact.avatar ? (
                        <Image
                          source={{ uri: contact.avatar }}
                          style={styles.avatar}
                          contentFit="cover"
                        />
                      ) : (
                        <LinearGradient
                          colors={[colors.primary, colors.secondary]}
                          style={styles.avatarFallback}
                        >
                          <Text
                            style={[styles.initials, { color: colors.surface }]}
                          >
                            {initials}
                          </Text>
                        </LinearGradient>
                      )}
                      {isOnline && <View style={styles.onlineDot} />}
                    </View>
                    <View style={styles.contactInfo}>
                      <Text
                        style={[
                          styles.contactName,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {contact.name}
                      </Text>
                      <Text
                        style={[
                          styles.contactSub,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {isOnline ? "🟢 Online" : contact.bio || contact.email}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.callBtn,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() =>
                        router.push(`/call/${contact._id}?type=audio`)
                      }
                    >
                      <Ionicons
                        name="call-outline"
                        size={18}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          contentContainerStyle={[
            styles.list,
            sections.length === 0 && styles.listEmpty,
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="people-outline"
                size={60}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No contacts found
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Search and add people to your contacts
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
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
  count: {
    fontSize: 14,

    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  searchWrap: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",

    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  list: { paddingBottom: 100 },
  listEmpty: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  sectionHeader: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
  },
  sectionLetter: { fontSize: 13, fontWeight: "800", color: Colors.primary },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    gap: 12,
  },
  avatarWrap: { position: "relative" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: { fontSize: 17, fontWeight: "700" },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: "700" },
  contactSub: { fontSize: 13 },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySubtitle: { fontSize: 14, textAlign: "center" },
});
