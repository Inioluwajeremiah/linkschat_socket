import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Spacing, BorderRadius } from "../../constants";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { setChats, addOrUpdateChat } from "../../store/slices/chatSlice";
import { loadDeviceContacts } from "@/store/slices/contactsSlice";
import { chatApi, searchApi, userApi } from "../../services/api";
import { Chat, User, MessageSearchResult } from "../../types";
import ContactSuggestionRow from "@/components/tabindex/ContactSuggestionRow";
import { formatDistanceToNow } from "../../utils/date";
import MenuItems from "@/components/tabindex/MenuItems";
import ChatItem from "@/components/tabindex/ChatItem";
import { fetchStatuses } from "@/store/slices/statusSlice";
import MessageResultRow from "@/components/tabindex/MessageResultRow";
import StatusRow from "@/components/tabindex/StatusRow";
import ContactsRow from "@/components/tabindex/ContactsRow";

export default function ChatsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, loaded } = useAppSelector((state) => state.contacts);
  const { error: showError } = useToast();
  const { chats } = useAppSelector((s) => s.chat);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const [messageResults, setMessageResults] = useState<MessageSearchResult[]>(
    []
  );
  const [searchingMessages, setSearchingMessages] = useState(false);

  // Contacts who are on LinksChat (registered users) — separate from the
  // Redux `contacts` slice, which maps device phone numbers to saved
  // contact names for display purposes.
  const [contacts, setContacts] = useState<User[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [creatingContactId, setCreatingContactId] = useState<string | null>(
    null
  );

  // Tracks whether the very first load of chats + LinksChat contacts +
  // device contact names has finished (success or failure) — drives the
  // full-screen spinner below. Doesn't reset on pull-to-refresh, so
  // refreshing never blanks the whole screen.
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Guards state updates after this screen has unmounted, so a slow
  // request can't set state on a screen that's no longer on-screen.
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Debounced message search — fires ~350ms after typing stops, only for
  // queries of 2+ chars, and cancels any in-flight timer on each keystroke.
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setMessageResults([]);
      setSearchingMessages(false);
      return;
    }
    setSearchingMessages(true);
    const handle = setTimeout(async () => {
      try {
        const res = await searchApi.searchMessages(q);
        if (res.success) setMessageResults(res.data.results);
      } catch {
        setMessageResults([]);
      } finally {
        setSearchingMessages(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [search]);

  const openHeaderMenu = () => {
    setShowHeaderMenu(true);
    Animated.spring(menuAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 18,
    }).start();
  };

  const closeHeaderMenu = () => {
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setShowHeaderMenu(false));
  };

  const loadChats = useCallback(async () => {
    try {
      const res = await chatApi.getChats();
      if (!isMountedRef.current) return;
      if (res.success) {
        dispatch(setChats(res.data.chats));
      } else {
        showError("Couldn't load chats", "Try again in a moment.");
      }
    } catch {
      if (isMountedRef.current) {
        showError("Couldn't load chats", "Try again in a moment.");
      }
    }
  }, [dispatch, showError]);

  const loadContacts = useCallback(async () => {
    setLoadingContacts(true);
    try {
      const res = await userApi.getContacts();
      if (!isMountedRef.current) return;
      if (res.success) {
        setContacts(res.data.contacts as User[]);
      } else {
        showError("Couldn't load contacts", "Try again in a moment.");
      }
    } catch {
      if (isMountedRef.current) {
        showError("Couldn't load contacts", "Try again in a moment.");
      }
    } finally {
      if (isMountedRef.current) setLoadingContacts(false);
    }
  }, [showError]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Wait for all three to settle (success or failure) before dropping
      // the full-screen spinner — Promise.allSettled so one failing
      // doesn't leave the others' results stuck behind an unresolved
      // Promise.all. loadDeviceContacts is deduped by its own `condition`
      // guard, so dispatching it here is cheap even if it already ran.
      await Promise.allSettled([
        loadChats(),
        loadContacts(),
        dispatch(loadDeviceContacts()),
      ]);
      // if (!cancelled && isMountedRef.current && loading)
      if (!cancelled && isMountedRef.current) setInitialLoadComplete(true);
    })();

    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      cancelled = true;
    };
  }, [loadChats, loadContacts, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadChats(), loadContacts()]);
    if (isMountedRef.current) setRefreshing(false);
  };

  // Starts a private chat from a not-yet-chatted-with contact suggestion,
  // then hands off to the normal chat list (the new chat lands in Redux
  // via addOrUpdateChat, so on the next render it's a real ChatItem and
  // this contact drops out of the "suggested" section on its own).
  const startChatWithContact = useCallback(
    async (contact: User) => {
      if (creatingContactId) return;
      setCreatingContactId(contact._id);
      try {
        const res = await chatApi.createPrivateChat(contact._id);
        if (res.success) {
          dispatch(addOrUpdateChat(res.data.chat));
          router.push(`/chat/${res.data.chat._id}`);
        } else {
          showError("Couldn't start chat", "Try again in a moment.");
        }
      } catch {
        showError("Couldn't start chat", "Try again in a moment.");
      } finally {
        if (isMountedRef.current) setCreatingContactId(null);
      }
    },
    [creatingContactId, dispatch, router, showError]
  );

  const isSearching = search.trim().length > 0;

  // The other participant's user ID for every private (1:1) chat the
  // current user is part of — used to sort ContactsRow so people you've
  // already messaged surface before people you haven't.
  const chattedUserIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of chats) {
      if (c.type === "group") continue;
      const other = c.participants.find((p) => p.user._id !== user?._id);
      if (other) ids.add(other.user._id);
    }
    return ids;
  }, [chats, user?._id]);

  const filteredChats = chats.filter((c) => {
    if (!isSearching) return true;
    const name =
      c.type === "group"
        ? c.name
        : c.participants.find((p) => p.user._id !== user?._id)?.user?.name;
    return name?.toLowerCase().includes(search.toLowerCase());
  });

  // Contacts on LinksChat you haven't started a conversation with yet.
  const unchattedContacts = contacts.filter((c) => {
    if (chattedUserIds.has(c._id)) return false;
    if (!isSearching) return true;
    return c.name?.toLowerCase().includes(search.toLowerCase());
  });

  // Two-section layout while searching (chats matched by name, messages
  // matched by content) — mirrors WhatsApp's search results screen.
  const sections = isSearching
    ? [
        ...(filteredChats.length > 0
          ? [{ title: "Chats", key: "chats", data: filteredChats as any[] }]
          : []),
        ...(messageResults.length > 0
          ? [
              {
                title: "Messages",
                key: "messages",
                data: messageResults as any[],
              },
            ]
          : []),
        ...(unchattedContacts.length > 0
          ? [
              {
                title: "Contacts on LinksChat",
                key: "contacts",
                data: unchattedContacts as any[],
              },
            ]
          : []),
      ]
    : [
        ...(filteredChats.length > 0
          ? [{ title: "", key: "chats", data: filteredChats as any[] }]
          : []),
        ...(unchattedContacts.length > 0
          ? [
              {
                title: "Contacts on LinksChat",
                key: "contacts",
                data: unchattedContacts as any[],
              },
            ]
          : []),
      ];

  const noResults =
    isSearching &&
    !searchingMessages &&
    filteredChats.length === 0 &&
    messageResults.length === 0 &&
    unchattedContacts.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* header */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          LinksChat
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.headerBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push("/new-chat")}
          >
            <Ionicons
              name="create-outline"
              size={19}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.headerBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={showHeaderMenu ? closeHeaderMenu : openHeaderMenu}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={22}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.searchWrap}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={17} color={colors.textPrimary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search conversations and messages..."
            placeholderTextColor={colors.textPrimary}
            value={search}
            onChangeText={setSearch}
          />
          {searchingMessages && (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          )}
          {search.length > 0 && !searchingMessages && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={17}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!initialLoadComplete ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#00d4aa" size="large" />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, i) =>
            (item as Chat)._id ||
            (item as MessageSearchResult).messageId ||
            String(i)
          }
          renderSectionHeader={({ section }) =>
            section.title ? (
              <View style={styles.sectionHeaderWrap}>
                <Text
                  style={[
                    styles.sectionHeaderText,
                    { color: colors.textPrimary },
                  ]}
                >
                  {section.title.toUpperCase()}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item, section }) =>
            section.key === "messages" ? (
              <MessageResultRow
                item={item as MessageSearchResult}
                query={search}
                colors={colors}
              />
            ) : section.key === "contacts" ? (
              <ContactSuggestionRow
                contact={item as User}
                colors={colors}
                isCreating={creatingContactId === (item as User)._id}
                onPress={startChatWithContact}
              />
            ) : (
              <ChatItem
                chat={item as Chat}
                userId={user?._id || ""}
                colors={colors}
              />
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00d4aa"
            />
          }
          contentContainerStyle={[
            styles.list,
            sections.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            user && !isSearching ? (
              <>
                <Text
                  style={[styles.statusTitle, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  Recent Updates
                </Text>
                <StatusRow user={user} colors={colors} />
              </>
            ) : null
          }
          ListEmptyComponent={
            isSearching ? (
              searchingMessages ? null : (
                <View style={styles.emptyWrap}>
                  <Ionicons
                    name="search-outline"
                    size={56}
                    color={colors.textPrimary}
                  />
                  <Text
                    style={[styles.emptyTitle, { color: colors.textPrimary }]}
                  >
                    No results found
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtitle,
                      { color: colors.textPrimary },
                    ]}
                  >
                    Try a different search term
                  </Text>
                </View>
              )
            ) : (
              <View style={styles.emptyWrap}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={56}
                  color={colors.textPrimary}
                />
                <Text
                  style={[styles.emptyTitle, { color: colors.textPrimary }]}
                >
                  No conversations yet
                </Text>
                <Text
                  style={[styles.emptySubtitle, { color: colors.textPrimary }]}
                >
                  Start a chat with your contacts
                </Text>
                <TouchableOpacity
                  style={styles.newChatBtn}
                  onPress={() => router.push("/new-chat")}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.newChatGradient}
                  >
                    <Text style={styles.newChatText}>New Chat</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )
          }
        />
      )}

      {showHeaderMenu && (
        <MenuItems closeHeaderMenu={closeHeaderMenu} menuAnim={menuAnim} />
      )}
      {/* floating action button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/new-chat")}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.fabGradient}
        >
          <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  headerActions: { flexDirection: "row", gap: 8 },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  searchWrap: { paddingHorizontal: Spacing.base, marginBottom: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  list: { paddingBottom: 100 },
  listEmpty: { flexGrow: 1 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  sectionHeaderWrap: { paddingHorizontal: Spacing.base, paddingVertical: 8 },
  sectionHeaderText: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },

  statusAvatarInitials: { color: "#fff", fontSize: 17, fontWeight: "800" },
  plusBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#00d4aa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  statusTitle: {
    fontSize: 14,
    textAlign: "left",
    fontWeight: "600",
    paddingHorizontal: Spacing.base,
    marginTop: 8,
  },
  statusName: { fontSize: 11, textAlign: "center", fontWeight: "500" },
  contactsSection: { marginBottom: 4 },
  contactsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    marginBottom: 6,
  },
  contactsLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  seeAll: { fontSize: 12, color: "#00d4aa", fontWeight: "700" },
  contactsScroll: {
    paddingHorizontal: Spacing.base,
    gap: 14,
    paddingBottom: 8,
  },
  contactChip: { alignItems: "center", width: 52 },
  contactAvatarWrap: { position: "relative", marginBottom: 4 },
  contactAvatar: { width: 48, height: 48, borderRadius: 24 },
  contactAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  contactInitials: { color: "#fff", fontSize: 15, fontWeight: "700" },
  contactOnlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00d4aa",
    borderWidth: 2,
  },
  contactName: { fontSize: 11, textAlign: "center" },
  // Row layout shared by MessageResultRow (mirrors ChatItem's own styles)
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
  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySubtitle: { fontSize: 13 },
  newChatBtn: {
    marginTop: 8,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  newChatGradient: { paddingHorizontal: 24, paddingVertical: 11 },
  newChatText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  fab: {
    position: "absolute",
    bottom: 92,
    right: 18,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#00d4aa",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fabGradient: {
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
});
