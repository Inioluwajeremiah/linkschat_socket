import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Animated,
} from "react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Contacts from "expo-contacts";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { contactsSyncApi, chatApi } from "../services/api";
import { useAppDispatch } from "../hooks/useRedux";
import { addOrUpdateChat } from "../store/slices/chatSlice";
import { User } from "../types";
import { Spacing, BorderRadius, Colors } from "../constants";

interface PhoneContact {
  id: string;
  name: string;
  phoneNumbers: string[];
  thumbnail?: string;
}

interface MatchedContact extends User {
  phoneName: string; // name from phone book
}

function ContactCard({
  item,
  onChat,
  onCall,
  index,
}: {
  item: MatchedContact;
  onChat: () => void;
  onCall: () => void;
  index: number;
}) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 40,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 40,
        useNativeDriver: true,
        tension: 200,
        friction: 20,
      }),
    ]).start();
  }, []);

  const initials = item.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Avatar */}
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
            style={styles.avatarGradient}
          >
            <Text style={[styles.initials, { color: colors.textInverse }]}>
              {initials}
            </Text>
          </LinearGradient>
        )}
        {item.isOnline && (
          <View style={[styles.onlineDot, { borderColor: colors.surface }]} />
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        {/* App name (from LinksChat profile) */}
        <Text
          style={[styles.appName, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        {/* Phone book name if different */}
        {item.phoneName !== item.name && (
          <Text
            style={[styles.phoneName, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            Saved as: {item.phoneName}
          </Text>
        )}
        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Ionicons name="chatbubbles" size={10} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              On LinksChat
            </Text>
          </View>
          {item.isOnline ? (
            <Text style={[styles.status, { color: colors.primary }]}>
              ● Online
            </Text>
          ) : (
            <Text style={[styles.status, { color: colors.textMuted }]}>
              Offline
            </Text>
          )}
        </View>
        {item.bio ? (
          <Text
            style={[styles.bio, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.bio}
          </Text>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#00d4aa18" }]}
          onPress={onChat}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble" size={17} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#5b8dee18" }]}
          onPress={onCall}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={17} color="#5b8dee" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

function EmptyState({
  hasPermission,
  onRequest,
  colors,
}: {
  hasPermission: boolean;
  onRequest: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.emptyWrap}>
      <Animated.View
        style={[styles.emptyIconWrap, { transform: [{ scale: pulse }] }]}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.emptyIconGradient}
        >
          <Ionicons name="people" size={40} color={colors.surface} />
        </LinearGradient>
      </Animated.View>

      {!hasPermission ? (
        <>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Find friends on LinksChat
          </Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Allow access to your contacts so we can show you which of your
            friends are already using LinksChat.
          </Text>
          <TouchableOpacity
            style={styles.allowBtn}
            onPress={onRequest}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.allowGradient}
            >
              <Ionicons
                name="people-outline"
                size={18}
                color={colors.surface}
              />
              <Text style={[styles.allowText, { color: colors.textInverse }]}>
                Allow Contacts Access
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            None of your contacts are on LinksChat yet
          </Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Invite friends so you can chat with them here.
          </Text>
          <TouchableOpacity style={styles.allowBtn} activeOpacity={0.85}>
            <LinearGradient
              colors={["#ff6b9d", "#5b8dee"]}
              style={styles.allowGradient}
            >
              <Ionicons
                name="share-social-outline"
                size={18}
                color={colors.surface}
              />
              <Text style={styles.allowText}>Invite Friends</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

export default function PhoneContactsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const toast = useToast();
  const dispatch = useAppDispatch();

  const [permissionStatus, setPermissionStatus] =
    useState<Contacts.PermissionStatus | null>(null);
  const [matchedContacts, setMatchedContacts] = useState<MatchedContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<MatchedContact[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [totalPhoneContacts, setTotalPhoneContacts] = useState(0);
  const [creatingChat, setCreatingChat] = useState<string | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    checkPermissionAndLoad();
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredContacts(matchedContacts);
    } else {
      const q = search.toLowerCase();
      setFilteredContacts(
        matchedContacts.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.phoneName.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q)
        )
      );
    }
  }, [search, matchedContacts]);

  const checkPermissionAndLoad = async () => {
    const { status } = await Contacts.getPermissionsAsync();
    setPermissionStatus(status);
    if (status === "granted") {
      await loadAndSync();
    }
  };

  const requestPermission = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    setPermissionStatus(status);
    if (status === "granted") {
      await loadAndSync();
    } else {
      toast.error(
        "Permission denied",
        "Contacts access is needed to find friends on LinksChat"
      );
    }
  };

  const loadAndSync = useCallback(async () => {
    setLoading(true);
    setSyncing(true);
    const syncId = toast.loading("Syncing contacts...");
    try {
      // Fetch all phone contacts
      const { data: phoneContacts } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      setTotalPhoneContacts(phoneContacts.length);

      // Collect all phone numbers with contact name mapping
      const phoneToName: Record<string, string> = {};
      const allNumbers: string[] = [];

      for (const contact of phoneContacts) {
        if (!contact.name || !contact.phoneNumbers?.length) continue;
        for (const pn of contact.phoneNumbers) {
          if (pn.number) {
            const num = pn.number.replace(/[\s\-().]/g, "");
            allNumbers.push(num);
            phoneToName[num] = contact.name;
          }
        }
      }

      if (allNumbers.length === 0) {
        toast.dismiss(syncId!);
        toast.info(
          "No phone numbers found",
          "Your contacts have no phone numbers stored"
        );
        setLoading(false);
        setSyncing(false);
        return;
      }

      // Send to backend in chunks of 500
      const chunkSize = 500;
      const allMatched: MatchedContact[] = [];

      for (let i = 0; i < allNumbers.length; i += chunkSize) {
        const chunk = allNumbers.slice(i, i + chunkSize);
        const res = await contactsSyncApi.sync(chunk);
        if (res.success) {
          const mapped: MatchedContact[] = res.data.users.map((u) => {
            // Find which phone number matched
            const matchedNum = allNumbers.find((n) => {
              const userPhone = (u.phone || "").replace(/[\s\-().]/g, "");
              return (
                userPhone.endsWith(n.slice(-9)) ||
                n.endsWith(userPhone.slice(-9))
              );
            });
            const phoneName = matchedNum
              ? phoneToName[matchedNum] || u.name
              : u.name;
            return { ...u, phoneName };
          });
          allMatched.push(...mapped);
        }
      }

      // Deduplicate by _id
      const seen = new Set<string>();
      const unique = allMatched.filter((c) => {
        if (seen.has(c._id)) return false;
        seen.add(c._id);
        return true;
      });

      // Sort: online first, then alphabetically
      unique.sort((a, b) => {
        if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      setMatchedContacts(unique);
      toast.dismiss(syncId!);

      if (unique.length > 0) {
        toast.success(
          `${unique.length} friend${
            unique.length !== 1 ? "s" : ""
          } on LinksChat`,
          `Out of ${phoneContacts.length} contacts`
        );
      } else {
        toast.info(
          "No matches found",
          `None of your ${phoneContacts.length} contacts are on LinksChat yet`
        );
      }
    } catch (err) {
      toast.dismiss(syncId!);
      toast.error("Sync failed", "Could not load contacts. Please try again.");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [toast]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAndSync();
    setRefreshing(false);
  };

  const handleChat = async (userId: string) => {
    setCreatingChat(userId);
    try {
      const res = await chatApi.createPrivateChat(userId);
      if (res.success) {
        dispatch(addOrUpdateChat(res.data.chat));
        router.push(`/chat/${res.data.chat._id}`);
      }
    } catch {
      toast.error("Failed", "Could not open chat");
    } finally {
      setCreatingChat(null);
    }
  };

  const handleCall = (userId: string) => {
    router.push(`/call/${userId}?type=audio`);
  };

  const hasPermission = permissionStatus === "granted";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Decorative gradient orb */}
      <View
        style={[
          styles.orb,
          {
            backgroundColor: isDark ? "#00d4aa" : "#00b090",
            opacity: isDark ? 0.1 : 0.07,
          },
        ]}
      />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { borderBottomColor: colors.border },
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Friends on LinksChat
          </Text>
          {hasPermission && !loading && matchedContacts.length > 0 && (
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>
              {matchedContacts.length} of {totalPhoneContacts} contacts
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.refreshBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={onRefresh}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="refresh" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Search */}
      {hasPermission && matchedContacts.length > 0 && (
        <View style={styles.searchOuter}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="search" size={17} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search your friends..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={17}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Stats banner */}
      {hasPermission && !loading && matchedContacts.length > 0 && (
        <View
          style={[
            styles.statsBanner,
            { backgroundColor: "#00d4aa12", borderColor: "#00d4aa30" },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{matchedContacts.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              On LinksChat
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {matchedContacts.filter((c) => c.isOnline).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Online now
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalPhoneContacts}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total contacts
            </Text>
          </View>
        </View>
      )}

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Scanning your contacts...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContent,
            filteredContacts.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item, index }) => (
            <ContactCard
              item={item}
              index={index}
              onChat={() => {
                if (creatingChat) return;
                handleChat(item._id);
              }}
              onCall={() => handleCall(item._id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              hasPermission={hasPermission}
              onRequest={requestPermission}
              colors={colors}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orb: {
    position: "absolute",
    top: -120,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    gap: 10,
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
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  headerSub: { fontSize: 12, marginTop: 1 },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  searchOuter: {
    paddingHorizontal: Spacing.base,
    paddingTop: 10,
    paddingBottom: 4,
  },
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
  statsBanner: {
    flexDirection: "row",
    marginHorizontal: Spacing.base,
    marginVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 20, fontWeight: "800", color: Colors.primary },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: "500" },
  statDivider: { width: 1, marginVertical: 4 },
  listContent: { padding: Spacing.base, paddingTop: 4, paddingBottom: 110 },
  listEmpty: { flexGrow: 1 },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: { fontSize: 15 },
  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  avatarGradient: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: { fontSize: 19, fontWeight: "800" },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    borderWidth: 2,
  },
  info: { flex: 1, gap: 3 },
  appName: { fontSize: 15, fontWeight: "700" },
  phoneName: { fontSize: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
  },
  badgeText: { fontSize: 10, fontWeight: "700" },
  status: { fontSize: 11, fontWeight: "600" },
  bio: { fontSize: 12, marginTop: 1 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 14,
  },
  emptyIconWrap: { marginBottom: 8 },
  emptyIconGradient: {
    width: 90,
    height: 90,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  allowBtn: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginTop: 8,
  },
  allowGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  allowText: { fontSize: 15, fontWeight: "700" },
});
