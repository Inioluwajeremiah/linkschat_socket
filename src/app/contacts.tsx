// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   RefreshControl,
// } from "react-native";
// import { useEffect, useState, useCallback } from "react";
// import { useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { Colors, Spacing, BorderRadius } from "../constants";
// import { useTheme } from "../context/ThemeContext";
// import { useToast } from "../context/ToastContext";
// import { userApi, chatApi } from "../services/api";
// import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
// import { addOrUpdateChat } from "../store/slices/chatSlice";
// import { User } from "../types";

// export default function ContactsScreen() {
//   const { colors, isDark } = useTheme();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const onlineUsers = useAppSelector((s) => s.socket.onlineUsers);
//   const [contacts, setContacts] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [search, setSearch] = useState("");

//   const load = useCallback(async () => {
//     try {
//       const res = await userApi.getContacts();
//       if (res.success) setContacts(res.data.contacts as User[]);
//     } catch {
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     load();
//   }, []);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await load();
//     setRefreshing(false);
//   };

//   const startChat = async (userId: string) => {
//     try {
//       const res = await chatApi.createPrivateChat(userId);
//       if (res.success) {
//         dispatch(addOrUpdateChat(res.data.chat));
//         router.push(`/chat/${res.data.chat._id}`);
//       }
//     } catch {}
//   };

//   const filtered = contacts.filter(
//     (c) =>
//       !search ||
//       c.name.toLowerCase().includes(search.toLowerCase()) ||
//       c.email.toLowerCase().includes(search.toLowerCase())
//   );

//   // Group alphabetically
//   const grouped = filtered.reduce<Record<string, User[]>>((acc, c) => {
//     const letter = c.name[0].toUpperCase();
//     if (!acc[letter]) acc[letter] = [];
//     acc[letter].push(c);
//     return acc;
//   }, {});

//   const sections = Object.keys(grouped)
//     .sort()
//     .map((letter) => ({
//       letter,
//       contacts: grouped[letter].sort((a, b) => a.name.localeCompare(b.name)),
//     }));

//   return (
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: colors.background }]}
//     >
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={[
//             styles.backBtn,
//             { backgroundColor: colors.surface, borderColor: colors.border },
//           ]}
//         >
//           <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
//         </TouchableOpacity>
//         <Text style={[styles.title, { color: colors.textPrimary }]}>
//           Contacts
//         </Text>
//         <Text
//           style={[
//             styles.count,
//             { backgroundColor: colors.surface, color: colors.textMuted },
//           ]}
//         >
//           {contacts.length}
//         </Text>
//       </View>

//       <View style={styles.searchWrap}>
//         <View
//           style={[
//             styles.searchBar,
//             { borderColor: colors.border, backgroundColor: colors.surface },
//           ]}
//         >
//           <Ionicons name="search" size={18} color={colors.textMuted} />
//           <TextInput
//             style={[styles.searchInput, { color: colors.textPrimary }]}
//             placeholder="Search contacts..."
//             placeholderTextColor={colors.textMuted}
//             value={search}
//             onChangeText={setSearch}
//           />
//         </View>
//       </View>

//       {loading ? (
//         <View style={styles.centered}>
//           <ActivityIndicator color={colors.primary} size="large" />
//         </View>
//       ) : (
//         <FlatList
//           data={sections}
//           keyExtractor={(s) => s.letter}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor={colors.primary}
//             />
//           }
//           renderItem={({ item: section }) => (
//             <View>
//               <View
//                 style={[
//                   styles.sectionHeader,
//                   { backgroundColor: colors.background },
//                 ]}
//               >
//                 <Text style={styles.sectionLetter}>{section.letter}</Text>
//               </View>
//               {section.contacts.map((contact) => {
//                 const isOnline = onlineUsers.includes(contact._id);
//                 const initials = contact.name
//                   .split(" ")
//                   .map((w) => w[0])
//                   .join("")
//                   .slice(0, 2)
//                   .toUpperCase();
//                 return (
//                   <TouchableOpacity
//                     key={contact._id}
//                     style={styles.contactItem}
//                     onPress={() => startChat(contact._id)}
//                     activeOpacity={0.7}
//                   >
//                     <View style={styles.avatarWrap}>
//                       {contact.avatar ? (
//                         <Image
//                           source={{ uri: contact.avatar }}
//                           style={styles.avatar}
//                           contentFit="cover"
//                         />
//                       ) : (
//                         <LinearGradient
//                           colors={[colors.primary, colors.secondary]}
//                           style={styles.avatarFallback}
//                         >
//                           <Text
//                             style={[styles.initials, { color: colors.surface }]}
//                           >
//                             {initials}
//                           </Text>
//                         </LinearGradient>
//                       )}
//                       {isOnline && <View style={styles.onlineDot} />}
//                     </View>
//                     <View style={styles.contactInfo}>
//                       <Text
//                         style={[
//                           styles.contactName,
//                           { color: colors.textPrimary },
//                         ]}
//                       >
//                         {contact.name}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.contactSub,
//                           { color: colors.textSecondary },
//                         ]}
//                         numberOfLines={1}
//                       >
//                         {isOnline ? "🟢 Online" : contact.bio || contact.email}
//                       </Text>
//                     </View>
//                     <TouchableOpacity
//                       style={[
//                         styles.callBtn,
//                         {
//                           backgroundColor: colors.surface,
//                           borderColor: colors.border,
//                         },
//                       ]}
//                       onPress={() =>
//                         router.push(`/call/${contact._id}?type=audio`)
//                       }
//                     >
//                       <Ionicons
//                         name="call-outline"
//                         size={18}
//                         color={colors.primary}
//                       />
//                     </TouchableOpacity>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           )}
//           contentContainerStyle={[
//             styles.list,
//             sections.length === 0 && styles.listEmpty,
//           ]}
//           ListEmptyComponent={
//             <View style={styles.empty}>
//               <Ionicons
//                 name="people-outline"
//                 size={60}
//                 color={colors.textMuted}
//               />
//               <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
//                 No contacts found
//               </Text>
//               <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
//                 Search and add people to your contacts
//               </Text>
//             </View>
//           }
//           showsVerticalScrollIndicator={false}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: Spacing.base,
//     paddingVertical: Spacing.md,
//     gap: 12,
//   },
//   backBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   title: { flex: 1, fontSize: 20, fontWeight: "700" },
//   count: {
//     fontSize: 14,

//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   searchWrap: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",

//     borderRadius: BorderRadius.full,
//     paddingHorizontal: 14,
//     height: 44,
//     gap: 8,
//     borderWidth: 1,
//   },
//   searchInput: { flex: 1, fontSize: 14 },
//   list: { paddingBottom: 100 },
//   listEmpty: { flex: 1 },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
//   sectionHeader: {
//     paddingHorizontal: Spacing.base,
//     paddingVertical: 6,
//   },
//   sectionLetter: { fontSize: 13, fontWeight: "800", color: Colors.primary },
//   contactItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: Spacing.base,
//     paddingVertical: 10,
//     gap: 12,
//   },
//   avatarWrap: { position: "relative" },
//   avatar: { width: 50, height: 50, borderRadius: 25 },
//   avatarFallback: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   initials: { fontSize: 17, fontWeight: "700" },
//   onlineDot: {
//     position: "absolute",
//     bottom: 1,
//     right: 1,
//     width: 13,
//     height: 13,
//     borderRadius: 7,
//     backgroundColor: Colors.primary,
//     borderWidth: 2,
//     borderColor: Colors.primary,
//   },
//   contactInfo: { flex: 1 },
//   contactName: { fontSize: 15, fontWeight: "700" },
//   contactSub: { fontSize: 13 },
//   callBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,

//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   empty: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingTop: 80,
//     gap: 12,
//   },
//   emptyTitle: { fontSize: 20, fontWeight: "700" },
//   emptySubtitle: { fontSize: 14, textAlign: "center" },
// });

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Modal,
} from "react-native";
import { useEffect, useRef, useState, useCallback } from "react";
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
import { useContactNameResolver } from "@/hooks/useContactName";

export default function ContactsScreen() {
  const { colors, isDark } = useTheme();
  const resolveContact = useContactNameResolver();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const onlineUsers = useAppSelector((s) => s.socket.onlineUsers);
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Ellipsis menu — same bottom sheet pattern as ContactsRow.
  const [menuContact, setMenuContact] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

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

  const openMenu = (contact: User) => {
    setMenuContact(contact);
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
      setMenuContact(null);
      callback?.();
    });
  };

  const handleAction = (action: () => void) => {
    closeMenu(action);
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

  const menuIsOnline = menuContact
    ? onlineUsers.includes(menuContact._id)
    : false;

  const { displayName: menuDisplayName, isContact } = resolveContact(
    menuContact?.phone,
    menuContact?.name
  );

  const menuInitials = menuDisplayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
          renderItem={({ item: section }) => {
            return (
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
                  const { displayName, isContact } = resolveContact(
                    contact?.phone,
                    contact?.name
                  );
                  const isOnline = onlineUsers.includes(contact._id);
                  const initials = displayName
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
                              style={[
                                styles.initials,
                                { color: colors.surface },
                              ]}
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
                          {displayName}
                        </Text>
                        <Text
                          style={[
                            styles.contactSub,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {isOnline
                            ? "🟢 Online"
                            : contact.bio || contact.email}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.menuBtn,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => openMenu(contact)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={18}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          }}
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

      {/* Options menu modal — mirrors ContactsRow's bottom sheet */}
      {showMenu && menuContact && (
        <Modal
          visible={showMenu}
          transparent
          animationType="none"
          onRequestClose={() => closeMenu()}
        >
          <Animated.View style={[styles.menuOverlay, { opacity: overlayAnim }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={() => closeMenu()}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.menuSheet,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View
              style={[styles.sheetHandle, { backgroundColor: colors.border }]}
            />

            <View style={styles.menuContactHeader}>
              <View style={styles.menuAvatarWrap}>
                {menuContact.avatar ? (
                  <Image
                    source={{ uri: menuContact.avatar }}
                    style={styles.menuAvatar}
                    contentFit="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={styles.menuAvatarFallback}
                  >
                    <Text style={styles.menuAvatarInitials}>
                      {menuInitials}
                    </Text>
                  </LinearGradient>
                )}
                {menuIsOnline && (
                  <View
                    style={[
                      styles.menuOnlineDot,
                      { borderColor: colors.surface },
                    ]}
                  />
                )}
              </View>
              <View style={styles.menuContactInfo}>
                <Text
                  style={[
                    styles.menuContactName,
                    { color: colors.textPrimary },
                  ]}
                >
                  {menuDisplayName}
                </Text>
                {menuContact.phone && (
                  <Text
                    style={[
                      styles.menuContactPhone,
                      { color: colors.textMuted },
                    ]}
                  >
                    {menuContact.phone}
                  </Text>
                )}
                <View
                  style={[
                    styles.menuOnlineChip,
                    {
                      backgroundColor: menuIsOnline
                        ? "rgba(0,212,170,0.1)"
                        : "rgba(85,85,119,0.1)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.menuOnlineChipDot,
                      {
                        backgroundColor: menuIsOnline ? "#00d4aa" : "#555577",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.menuOnlineChipText,
                      { color: menuIsOnline ? "#00d4aa" : "#555577" },
                    ]}
                  >
                    {menuIsOnline ? "Active now" : "Offline"}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[styles.menuDivider, { backgroundColor: colors.border }]}
            />

            {[
              {
                icon: "chatbubble-ellipses-outline",
                label: "Send a Message",
                sub: "Start or continue a conversation",
                color: "#00d4aa",
                bg: "rgba(0,212,170,0.1)",
                onPress: () => startChat(menuContact._id),
              },
              {
                icon: "call-outline",
                label: "Voice Call",
                sub: "Start an audio call",
                color: "#5b8dee",
                bg: "rgba(91,141,238,0.1)",
                onPress: () => {
                  router.push(`/call/${menuContact._id}?type=audio` as any);
                },
              },
              {
                icon: "videocam-outline",
                label: "Video Call",
                sub: "Start a video call",
                color: "#ff6b9d",
                bg: "rgba(255,107,157,0.1)",
                onPress: () => {
                  router.push(`/call/${menuContact._id}?type=video` as any);
                },
              },
              {
                icon: "person-outline",
                label: "View Profile",
                sub: "See full contact information",
                color: "#ffc107",
                bg: "rgba(255,193,7,0.1)",
                onPress: () => {
                  router.push(`/profile/${menuContact._id}` as any);
                },
              },
            ].map(({ icon, label, sub, color, bg, onPress }, i, arr) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.menuAction,
                  i < arr.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => handleAction(onPress)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuActionIcon, { backgroundColor: bg }]}>
                  <Ionicons name={icon as any} size={19} color={color} />
                </View>
                <View style={styles.menuActionText}>
                  <Text
                    style={[
                      styles.menuActionLabel,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {label}
                  </Text>
                  <Text
                    style={[styles.menuActionSub, { color: colors.textMuted }]}
                  >
                    {sub}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={15}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.menuCancel}
              onPress={() => closeMenu()}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.menuCancelText, { color: colors.textMuted }]}
              >
                Dismiss
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Modal>
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
    paddingBottom: Spacing.md,
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
  menuBtn: {
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
  // ── Options menu modal (mirrors ContactsRow) ──────────────────────────
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10,
  },
  menuSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingBottom: 36,
    zIndex: 11,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
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
  },
  menuContactInfo: { flex: 1, gap: 4 },
  menuContactName: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  menuContactPhone: { fontSize: 13, fontWeight: "500" },
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
  menuDivider: { height: StyleSheet.hairlineWidth, marginBottom: 4 },
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
  menuActionLabel: { fontSize: 15, fontWeight: "700" },
  menuActionSub: { fontSize: 12, marginTop: 2 },
  menuCancel: { alignItems: "center", paddingVertical: 16, marginTop: 4 },
  menuCancelText: { fontSize: 14, fontWeight: "600" },
});
