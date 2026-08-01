// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   Animated,
//   RefreshControl,
//   ActivityIndicator,
//   ScrollView,
// } from "react-native";
// import { useEffect, useRef, useState, useCallback } from "react";
// import { useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import * as Contacts from "expo-contacts";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { Spacing, BorderRadius } from "../../constants";
// import { useTheme } from "../../context/ThemeContext";
// import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
// import { setChats } from "../../store/slices/chatSlice";
// import { chatApi, statusApi, userApi } from "../../services/api";
// import { Chat, Message, User, StatusGroup } from "../../types";
// import { formatDistanceToNow } from "../../utils/date";
// import MenuItems from "@/components/tabindex/MenuItems";
// import ChatItem from "../../components/ChatItem";

// function MyStatusBubble({
//   user,
//   hasStatus,
//   onPress,
//   onAdd,
//   colors,
// }: {
//   user: User;
//   hasStatus: boolean;
//   onPress: () => void;
//   onAdd: () => void;
//   colors: any;
// }) {
//   const initials = user.name
//     .split(" ")
//     .map((w: string) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();
//   return (
//     <TouchableOpacity
//       style={styles.statusBubble}
//       onPress={hasStatus ? onPress : onAdd}
//       activeOpacity={0.8}
//     >
//       <View style={styles.statusRingWrap}>
//         {hasStatus ? (
//           <LinearGradient
//             colors={["#00d4aa", "#5b8dee"]}
//             style={styles.statusRing}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//           />
//         ) : (
//           <View
//             style={[styles.statusRing, { backgroundColor: colors.border }]}
//           />
//         )}
//         {user.avatar ? (
//           <Image
//             source={{ uri: user.avatar }}
//             style={styles.statusAvatarImg}
//             contentFit="cover"
//           />
//         ) : (
//           <LinearGradient
//             colors={["#00d4aa", "#5b8dee"]}
//             style={styles.statusAvatarFallback}
//           >
//             <Text style={styles.statusAvatarInitials}>{initials}</Text>
//           </LinearGradient>
//         )}
//         <TouchableOpacity
//           style={[styles.plusBadge, { borderColor: colors.background }]}
//           onPress={onAdd}
//         >
//           <Ionicons name="add" size={11} color="#fff" />
//         </TouchableOpacity>
//       </View>
//       <Text
//         style={[styles.statusName, { color: colors.textSecondary }]}
//         numberOfLines={1}
//       >
//         My Status
//       </Text>
//     </TouchableOpacity>
//   );
// }

// function StatusBubble({
//   group,
//   allViewed,
//   onPress,
//   colors,
// }: {
//   group: StatusGroup;
//   allViewed: boolean;
//   onPress: () => void;
//   colors: any;
// }) {
//   const initials = group.user.name
//     .split(" ")
//     .map((w: string) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();
//   return (
//     <TouchableOpacity
//       style={styles.statusBubble}
//       onPress={onPress}
//       activeOpacity={0.8}
//     >
//       <View style={styles.statusRingWrap}>
//         {!allViewed ? (
//           <LinearGradient
//             colors={["#00d4aa", "#5b8dee"]}
//             style={styles.statusRing}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//           />
//         ) : (
//           <View
//             style={[styles.statusRing, { backgroundColor: colors.border }]}
//           />
//         )}
//         {group.user.avatar ? (
//           <Image
//             source={{ uri: group.user.avatar }}
//             style={styles.statusAvatarImg}
//             contentFit="cover"
//           />
//         ) : (
//           <LinearGradient
//             colors={["#00d4aa", "#5b8dee"]}
//             style={styles.statusAvatarFallback}
//           >
//             <Text style={styles.statusAvatarInitials}>{initials}</Text>
//           </LinearGradient>
//         )}
//       </View>
//       <Text
//         style={[styles.statusName, { color: colors.textSecondary }]}
//         numberOfLines={1}
//       >
//         {group.user.name.split(" ")[0]}
//       </Text>
//     </TouchableOpacity>
//   );
// }

// function StatusRow({ user, colors }: { user: User; colors: any }) {
//   const router = useRouter();
//   const { myStatus, statuses } = useAppSelector((s) => s.status);
//   // const [myStatus, setMyStatus] = useState<StatusGroup | null>(null);
//   // const [statuses, setStatuses] = useState<StatusGroup[]>([]);

//   // useEffect(() => {
//   //   statusApi
//   //     .getStatuses()
//   //     .then((res) => {
//   //       if (res.success) {
//   //         setMyStatus(res.data.myStatus);
//   //         setStatuses(res.data.statuses);
//   //       }
//   //     })
//   //     .catch(() => {});
//   // }, []);

//   return (
//     <View style={[styles.statusBar, { borderBottomColor: colors.border }]}>
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.statusScroll}
//       >
//         <MyStatusBubble
//           user={user}
//           hasStatus={!!myStatus}
//           colors={colors}
//           onPress={() =>
//             router.push({
//               pathname: "/status/view",
//               params: { userId: user._id },
//             })
//           }
//           onAdd={() => router.push("/status/create")}
//         />
//         {statuses.map((group) => (
//           <StatusBubble
//             key={group.user._id}
//             group={group}
//             colors={colors}
//             allViewed={group.statuses.every((s) => s.viewed)}
//             onPress={() =>
//               router.push({
//                 pathname: "/status/view",
//                 params: { userId: group.user._id },
//               })
//             }
//           />
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

// function ContactsRow({ colors }: { colors: any }) {
//   const router = useRouter();
//   const [contacts, setContacts] = useState<User[]>([]);

//   useEffect(() => {
//     userApi
//       .getContacts()
//       .then((res) => {
//         if (res.success) {
//           const withPhone = (res.data.contacts as User[]).filter(
//             (c) => c.phone
//           );
//           setContacts(withPhone.slice(0, 12));
//         }
//       })
//       .catch(() => {});
//   }, []);

//   if (contacts.length === 0) return null;

//   return (
//     <View style={styles.contactsSection}>
//       <View style={styles.contactsHeader}>
//         <Text style={[styles.contactsLabel, { color: colors.textPrimary }]}>
//           PEOPLE
//         </Text>
//         <TouchableOpacity onPress={() => router.push("/phone-contacts")}>
//           <Text style={styles.seeAll}>See all</Text>
//         </TouchableOpacity>
//       </View>
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.contactsScroll}
//       >
//         {contacts.map((contact) => {
//           const initials = contact.name
//             .split(" ")
//             .map((w: string) => w[0])
//             .join("")
//             .slice(0, 2)
//             .toUpperCase();
//           const startChat = async () => {
//             try {
//               const res = await chatApi.createPrivateChat(contact._id);
//               if (res.success) router.push(`/chat/${res.data.chat._id}`);
//             } catch {}
//           };
//           return (
//             <TouchableOpacity
//               key={contact._id}
//               style={styles.contactChip}
//               onPress={startChat}
//               activeOpacity={0.8}
//             >
//               <View style={styles.contactAvatarWrap}>
//                 {contact.avatar ? (
//                   <Image
//                     source={{ uri: contact.avatar }}
//                     style={styles.contactAvatar}
//                     contentFit="cover"
//                   />
//                 ) : (
//                   <LinearGradient
//                     colors={["#00d4aa", "#5b8dee"]}
//                     style={styles.contactAvatarFallback}
//                   >
//                     <Text style={styles.contactInitials}>{initials}</Text>
//                   </LinearGradient>
//                 )}
//                 {contact.isOnline && (
//                   <View
//                     style={[
//                       styles.contactOnlineDot,
//                       { borderColor: colors.background },
//                     ]}
//                   />
//                 )}
//               </View>
//               <Text
//                 style={[styles.contactName, { color: colors.textSecondary }]}
//                 numberOfLines={1}
//               >
//                 {contact.name.split(" ")[0]}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </ScrollView>
//     </View>
//   );
// }

// // function ChatItem({
// //   chat,
// //   userId,
// //   colors,
// // }: {
// //   chat: Chat;
// //   userId: string;
// //   colors: any;
// // }) {
// //   const router = useRouter();
// //   const fadeAnim = useRef(new Animated.Value(0)).current;

// //   useEffect(() => {
// //     Animated.timing(fadeAnim, {
// //       toValue: 1,
// //       duration: 220,
// //       useNativeDriver: true,
// //     }).start();
// //   }, []);

// //   const otherParticipant =
// //     chat.type === "private"
// //       ? chat.participants.find((p) => p.user._id !== userId)?.user
// //       : null;
// //   const displayName =
// //     chat.type === "group" ? chat.name : otherParticipant?.name;
// //   const displayAvatar =
// //     chat.type === "group" ? chat.avatar : otherParticipant?.avatar;
// //   const isOnline = otherParticipant?.isOnline;
// //   const hasUnread = (chat.unreadCount ?? 0) > 0;

// //   const lastMsg = chat.lastMessage as Message | undefined;
// //   let lastMsgText = "Tap to start chatting";
// //   if (lastMsg) {
// //     if (lastMsg.isDeleted) lastMsgText = "This message was deleted";
// //     else if (lastMsg.type === "image") lastMsgText = "Photo";
// //     else if (lastMsg.type === "video") lastMsgText = "Video";
// //     else if (lastMsg.type === "audio") lastMsgText = "Voice message";
// //     else lastMsgText = lastMsg.content;
// //   }

// //   const initials = (displayName || "?")
// //     .split(" ")
// //     .map((w: string) => w[0])
// //     .join("")
// //     .slice(0, 2)
// //     .toUpperCase();

// //   return (
// //     <Animated.View style={{ opacity: fadeAnim }}>
// //       <TouchableOpacity
// //         style={[styles.chatItem, { backgroundColor: colors.background }]}
// //         onPress={() => router.push(`/chat/${chat._id}`)}
// //         activeOpacity={0.65}
// //       >
// //         <View style={styles.chatAvatarWrap}>
// //           {displayAvatar ? (
// //             <Image
// //               source={{ uri: displayAvatar }}
// //               style={styles.chatAvatar}
// //               contentFit="cover"
// //             />
// //           ) : (
// //             <LinearGradient
// //               colors={["#00d4aa", "#5b8dee"]}
// //               style={styles.chatAvatarFallback}
// //             >
// //               <Text style={styles.chatAvatarInitials}>{initials}</Text>
// //             </LinearGradient>
// //           )}
// //           {isOnline && (
// //             <View
// //               style={[styles.chatOnlineDot, { borderColor: colors.background }]}
// //             />
// //           )}
// //         </View>
// //         <View
// //           style={[styles.chatContent, { borderBottomColor: colors.divider }]}
// //         >
// //           <View style={styles.chatTop}>
// //             <Text
// //               style={[
// //                 styles.chatName,
// //                 {
// //                   color: colors.textPrimary,
// //                   fontWeight: hasUnread ? "800" : "600",
// //                 },
// //               ]}
// //               numberOfLines={1}
// //             >
// //               {displayName || "Unknown"}
// //             </Text>
// //             <Text
// //               style={[
// //                 styles.chatTime,
// //                 { color: hasUnread ? "#00d4aa" : colors.textPrimary },
// //               ]}
// //             >
// //               {chat.lastMessageAt
// //                 ? formatDistanceToNow(new Date(chat.lastMessageAt))
// //                 : ""}
// //             </Text>
// //           </View>
// //           <View style={styles.chatBottom}>
// //             <Text
// //               style={[
// //                 styles.lastMessage,
// //                 {
// //                   color: hasUnread ? colors.textPrimary : colors.textSecondary,
// //                   fontWeight: hasUnread ? "600" : "400",
// //                 },
// //               ]}
// //               numberOfLines={1}
// //             >
// //               {lastMsgText}
// //             </Text>
// //             {hasUnread && (
// //               <View style={styles.unreadBadge}>
// //                 <Text style={styles.unreadText}>{chat.unreadCount}</Text>
// //               </View>
// //             )}
// //           </View>
// //         </View>
// //       </TouchableOpacity>
// //     </Animated.View>
// //   );
// // }

// export default function ChatsScreen() {
//   const { colors } = useTheme();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { chats, isLoading } = useAppSelector((s) => s.chat);
//   const { user } = useAppSelector((s) => s.auth);
//   const [search, setSearch] = useState("");
//   const [refreshing, setRefreshing] = useState(false);
//   const headerAnim = useRef(new Animated.Value(0)).current;
//   const [showHeaderMenu, setShowHeaderMenu] = useState(false);
//   const menuAnim = useRef(new Animated.Value(0)).current;

//   // Add state for device contacts map
//   const [deviceContacts, setDeviceContacts] = useState<Map<string, string>>(
//     new Map()
//   );

//   // Load device contacts once on mount
//   useEffect(() => {
//     const loadContacts = async () => {
//       try {
//         const { status } = await Contacts.requestPermissionsAsync();
//         if (status !== "granted") return;

//         const { data } = await Contacts.getContactsAsync({
//           fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
//         });

//         const map = new Map<string, string>();
//         const normalize = (p: string) => p.replace(/\D/g, "");

//         for (const contact of data) {
//           if (!contact.name || !contact.phoneNumbers) continue;
//           for (const pn of contact.phoneNumbers) {
//             const suffix = normalize(pn.number || "").slice(-9);
//             if (suffix.length >= 7) {
//               map.set(suffix, contact.name);
//             }
//           }
//         }

//         setDeviceContacts(map);
//       } catch {}
//     };
//     loadContacts();
//   }, []);

//   const openHeaderMenu = () => {
//     setShowHeaderMenu(true);
//     Animated.spring(menuAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//       tension: 200,
//       friction: 18,
//     }).start();
//   };

//   const closeHeaderMenu = () => {
//     Animated.timing(menuAnim, {
//       toValue: 0,
//       duration: 180,
//       useNativeDriver: true,
//     }).start(() => setShowHeaderMenu(false));
//   };

//   const loadChats = useCallback(async () => {
//     try {
//       const res = await chatApi.getChats();
//       if (res.success) dispatch(setChats(res.data.chats));
//     } catch {}
//   }, [dispatch]);

//   useEffect(() => {
//     loadChats();
//     Animated.timing(headerAnim, {
//       toValue: 1,
//       duration: 500,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadChats();
//     setRefreshing(false);
//   };

//   const filtered = chats.filter((c) => {
//     if (!search) return true;
//     const name =
//       c.type === "group"
//         ? c.name
//         : c.participants.find((p) => p.user._id !== user?._id)?.user?.name;
//     return name?.toLowerCase().includes(search.toLowerCase());
//   });

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {/* header */}
//       {/* <Animated.View style={[styles.header, { opacity: headerAnim }]}>
//         <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
//           LinksChat
//         </Text>
//         <View style={styles.headerActions}>
//           <TouchableOpacity
//             style={[
//               styles.headerBtn,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//             onPress={() => router.push("/phone-contacts")}
//           >
//             <Ionicons name="people" size={19} color="#00d4aa" />
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               styles.headerBtn,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//             onPress={() => router.push("/new-chat")}
//           >
//             <Ionicons
//               name="create-outline"
//               size={19}
//               color={colors.textPrimary}
//             />
//           </TouchableOpacity>
//         </View>
//       </Animated.View> */}

//       <Animated.View style={[styles.header, { opacity: headerAnim }]}>
//         <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
//           LinksChat
//         </Text>
//         <View style={styles.headerActions}>
//           <TouchableOpacity
//             style={[
//               styles.headerBtn,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//             onPress={() => router.push("/new-chat")}
//           >
//             <Ionicons
//               name="create-outline"
//               size={19}
//               color={colors.textPrimary}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.headerBtn,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//             onPress={showHeaderMenu ? closeHeaderMenu : openHeaderMenu}
//           >
//             <Ionicons name="ellipsis-vertical" size={22} color="#00d4aa" />
//           </TouchableOpacity>
//         </View>
//       </Animated.View>

//       <View style={styles.searchWrap}>
//         <View
//           style={[
//             styles.searchBar,
//             { backgroundColor: colors.surface, borderColor: colors.border },
//           ]}
//         >
//           <Ionicons name="search" size={17} color={colors.textPrimary} />
//           <TextInput
//             style={[styles.searchInput, { color: colors.textPrimary }]}
//             placeholder="Search conversations..."
//             placeholderTextColor={colors.textPrimary}
//             value={search}
//             onChangeText={setSearch}
//           />
//           {search.length > 0 && (
//             <TouchableOpacity onPress={() => setSearch("")}>
//               <Ionicons
//                 name="close-circle"
//                 size={17}
//                 color={colors.textPrimary}
//               />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {isLoading && chats.length === 0 ? (
//         <View style={styles.loadingWrap}>
//           <ActivityIndicator color="#00d4aa" size="large" />
//         </View>
//       ) : (
//         <FlatList
//           data={filtered}
//           keyExtractor={(c) => c._id}
//           renderItem={({ item }) => (
//             <ChatItem
//               deviceContacts={deviceContacts}
//               chat={item}
//               userId={user?._id || ""}
//               colors={colors}
//             />
//           )}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor="#00d4aa"
//             />
//           }
//           contentContainerStyle={[
//             styles.list,
//             filtered.length === 0 && styles.listEmpty,
//           ]}
//           showsVerticalScrollIndicator={false}
//           ListHeaderComponent={
//             user && !search ? (
//               <>
//                 <StatusRow user={user} colors={colors} />
//                 <ContactsRow colors={colors} />
//               </>
//             ) : null
//           }
//           ListEmptyComponent={
//             search ? null : (
//               <View style={styles.emptyWrap}>
//                 <Ionicons
//                   name="chatbubbles-outline"
//                   size={56}
//                   color={colors.textPrimary}
//                 />
//                 <Text
//                   style={[styles.emptyTitle, { color: colors.textPrimary }]}
//                 >
//                   No conversations yet
//                 </Text>
//                 <Text
//                   style={[styles.emptySubtitle, { color: colors.textPrimary }]}
//                 >
//                   Start a chat with your contacts
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.newChatBtn}
//                   onPress={() => router.push("/new-chat")}
//                   activeOpacity={0.85}
//                 >
//                   <LinearGradient
//                     colors={["#00d4aa", "#00b090"]}
//                     style={styles.newChatGradient}
//                   >
//                     <Text style={styles.newChatText}>New Chat</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             )
//           }
//         />
//       )}

//       {/* Dropdown menu */}
//       {showHeaderMenu && (
//         <MenuItems closeHeaderMenu={closeHeaderMenu} menuAnim={menuAnim} />
//       )}

//       {/* floatign button */}
//       <TouchableOpacity
//         style={styles.fab}
//         onPress={() => router.push("/new-chat")}
//         activeOpacity={0.85}
//       >
//         <LinearGradient
//           colors={["#00d4aa", "#00b090"]}
//           style={styles.fabGradient}
//         >
//           <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
//         </LinearGradient>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: Spacing.base,
//     paddingBottom: 10,
//   },
//   headerTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
//   headerActions: { flexDirection: "row", gap: 8 },
//   headerBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   searchWrap: { paddingHorizontal: Spacing.base, marginBottom: 4 },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: BorderRadius.full,
//     paddingHorizontal: 12,
//     height: 40,
//     gap: 8,
//     borderWidth: 1,
//   },
//   searchInput: { flex: 1, fontSize: 14 },
//   list: { paddingBottom: 100 },
//   listEmpty: { flexGrow: 1 },
//   loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
//   statusBar: { borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 2 },
//   statusScroll: {
//     paddingHorizontal: Spacing.base,
//     paddingVertical: 10,
//     gap: 14,
//   },
//   statusBubble: { alignItems: "center", width: 64 },
//   statusRingWrap: { position: "relative", marginBottom: 5 },
//   statusRing: { width: 60, height: 60, borderRadius: 30 },
//   statusAvatarImg: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     position: "absolute",
//     top: 4,
//     left: 4,
//   },
//   statusAvatarFallback: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     justifyContent: "center",
//     alignItems: "center",
//     position: "absolute",
//     top: 4,
//     left: 4,
//   },
//   statusAvatarInitials: { color: "#fff", fontSize: 17, fontWeight: "800" },
//   plusBadge: {
//     position: "absolute",
//     bottom: -1,
//     right: -1,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: "#00d4aa",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//   },
//   statusName: { fontSize: 11, textAlign: "center", fontWeight: "500" },
//   contactsSection: { marginBottom: 4 },
//   contactsHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: Spacing.base,
//     marginBottom: 6,
//   },
//   contactsLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
//   seeAll: { fontSize: 12, color: "#00d4aa", fontWeight: "700" },
//   contactsScroll: {
//     paddingHorizontal: Spacing.base,
//     gap: 14,
//     paddingBottom: 8,
//   },
//   contactChip: { alignItems: "center", width: 52 },
//   contactAvatarWrap: { position: "relative", marginBottom: 4 },
//   contactAvatar: { width: 48, height: 48, borderRadius: 24 },
//   contactAvatarFallback: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   contactInitials: { color: "#fff", fontSize: 15, fontWeight: "700" },
//   contactOnlineDot: {
//     position: "absolute",
//     bottom: 1,
//     right: 1,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: "#00d4aa",
//     borderWidth: 2,
//   },
//   contactName: { fontSize: 11, textAlign: "center" },
//   emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
//   emptyTitle: { fontSize: 18, fontWeight: "700" },
//   emptySubtitle: { fontSize: 13 },
//   newChatBtn: {
//     marginTop: 8,
//     borderRadius: BorderRadius.full,
//     overflow: "hidden",
//   },
//   newChatGradient: { paddingHorizontal: 24, paddingVertical: 11 },
//   newChatText: { color: "#fff", fontWeight: "700", fontSize: 14 },
//   fab: {
//     position: "absolute",
//     bottom: 92,
//     right: 18,
//     borderRadius: 28,
//     overflow: "hidden",
//     shadowColor: "#00d4aa",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.4,
//     shadowRadius: 12,
//     elevation: 10,
//   },
//   fabGradient: {
//     width: 54,
//     height: 54,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// import {
//   View,
//   Text,
//   SectionList,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   Animated,
//   RefreshControl,
//   ActivityIndicator,
// } from "react-native";
// import { useEffect, useRef, useState, useCallback } from "react";
// import { RelativePathString, useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import * as Contacts from "expo-contacts";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { Spacing, BorderRadius } from "../../constants";
// import { useTheme } from "../../context/ThemeContext";
// import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
// import { setChats } from "../../store/slices/chatSlice";
// import { chatApi, searchApi } from "../../services/api";
// import { Chat, User, StatusGroup, MessageSearchResult } from "../../types";
// import { formatDistanceToNow } from "../../utils/date";
// import MenuItems from "@/components/tabindex/MenuItems";
// import ChatItem from "@/components/tabindex/ChatItem";
// import ContactsRow from "../status/components/ContactsRow";
// import { useContactNameResolver } from "@/hooks/useContactName";
// import { fetchStatuses } from "@/store/slices/statusSlice";
// import MessageResultRow from "@/components/tabindex/MessageResultRow";
// import StatusRow from "@/components/tabindex/StatusRow";

// export default function ChatsScreen() {
//   const { colors } = useTheme();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { chats, isLoading } = useAppSelector((s) => s.chat);
//   const { user } = useAppSelector((s) => s.auth);
//   const [search, setSearch] = useState("");
//   const [refreshing, setRefreshing] = useState(false);
//   const headerAnim = useRef(new Animated.Value(0)).current;
//   const [showHeaderMenu, setShowHeaderMenu] = useState(false);
//   const menuAnim = useRef(new Animated.Value(0)).current;

//   const [messageResults, setMessageResults] = useState<MessageSearchResult[]>(
//     []
//   );
//   const [searchingMessages, setSearchingMessages] = useState(false);

//   const [deviceContacts, setDeviceContacts] = useState<Map<string, string>>(
//     new Map()
//   );

//   useEffect(() => {
//     const loadContacts = async () => {
//       try {
//         const { status } = await Contacts.requestPermissionsAsync();
//         if (status !== "granted") return;

//         const { data } = await Contacts.getContactsAsync({
//           fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
//         });

//         const map = new Map<string, string>();
//         const normalize = (p: string) => p.replace(/\D/g, "");

//         for (const contact of data) {
//           if (!contact.name || !contact.phoneNumbers) continue;
//           for (const pn of contact.phoneNumbers) {
//             const suffix = normalize(pn.number || "").slice(-9);
//             if (suffix.length >= 7) {
//               map.set(suffix, contact.name);
//             }
//           }
//         }

//         setDeviceContacts(map);
//       } catch {}
//     };
//     loadContacts();
//   }, []);

//   // Debounced message search — fires ~350ms after typing stops, only for
//   // queries of 2+ chars, and cancels any in-flight timer on each keystroke.
//   useEffect(() => {
//     const q = search.trim();
//     if (q.length < 2) {
//       setMessageResults([]);
//       setSearchingMessages(false);
//       return;
//     }
//     setSearchingMessages(true);
//     const handle = setTimeout(async () => {
//       try {
//         const res = await searchApi.searchMessages(q);
//         if (res.success) setMessageResults(res.data.results);
//       } catch {
//         setMessageResults([]);
//       } finally {
//         setSearchingMessages(false);
//       }
//     }, 350);
//     return () => clearTimeout(handle);
//   }, [search]);

//   const openHeaderMenu = () => {
//     setShowHeaderMenu(true);
//     Animated.spring(menuAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//       tension: 200,
//       friction: 18,
//     }).start();
//   };

//   const closeHeaderMenu = () => {
//     Animated.timing(menuAnim, {
//       toValue: 0,
//       duration: 180,
//       useNativeDriver: true,
//     }).start(() => setShowHeaderMenu(false));
//   };

//   const loadChats = useCallback(async () => {
//     try {
//       const res = await chatApi.getChats();
//       if (res.success) dispatch(setChats(res.data.chats));
//     } catch {}
//   }, [dispatch]);

//   useEffect(() => {
//     loadChats();
//     Animated.timing(headerAnim, {
//       toValue: 1,
//       duration: 500,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadChats();
//     setRefreshing(false);
//   };

//   const isSearching = search.trim().length > 0;

//   const filteredChats = chats.filter((c) => {
//     if (!isSearching) return true;
//     const name =
//       c.type === "group"
//         ? c.name
//         : c.participants.find((p) => p.user._id !== user?._id)?.user?.name;
//     return name?.toLowerCase().includes(search.toLowerCase());
//   });

//   // Two-section layout while searching (chats matched by name, messages
//   // matched by content) — mirrors WhatsApp's search results screen.
//   const sections = isSearching
//     ? [
//         ...(filteredChats.length > 0
//           ? [{ title: "Chats", key: "chats", data: filteredChats as any[] }]
//           : []),
//         ...(messageResults.length > 0
//           ? [
//               {
//                 title: "Messages",
//                 key: "messages",
//                 data: messageResults as any[],
//               },
//             ]
//           : []),
//       ]
//     : filteredChats.length > 0
//     ? [{ title: "", key: "all", data: filteredChats as any[] }]
//     : [];

//   const noResults =
//     isSearching &&
//     !searchingMessages &&
//     filteredChats.length === 0 &&
//     messageResults.length === 0;

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <Animated.View style={[styles.header, { opacity: headerAnim }]}>
//         <Text style={[styles.headerTitle, { color: colors.primary }]}>
//           LinksChat
//         </Text>
//         <View style={styles.headerActions}>
//           <TouchableOpacity
//             style={[
//               styles.headerBtn,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//             onPress={() => router.push("/new-chat")}
//           >
//             <Ionicons
//               name="create-outline"
//               size={19}
//               color={colors.textPrimary}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.headerBtn,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//             onPress={showHeaderMenu ? closeHeaderMenu : openHeaderMenu}
//           >
//             <Ionicons name="ellipsis-vertical" size={22} color="#00d4aa" />
//           </TouchableOpacity>
//         </View>
//       </Animated.View>

//       <View style={styles.searchWrap}>
//         <View
//           style={[
//             styles.searchBar,
//             { backgroundColor: colors.surface, borderColor: colors.border },
//           ]}
//         >
//           <Ionicons name="search" size={17} color={colors.textPrimary} />
//           <TextInput
//             style={[styles.searchInput, { color: colors.textPrimary }]}
//             placeholder="Search conversations and messages..."
//             placeholderTextColor={colors.textPrimary}
//             value={search}
//             onChangeText={setSearch}
//           />
//           {searchingMessages && (
//             <ActivityIndicator size="small" color={colors.textPrimary} />
//           )}
//           {search.length > 0 && !searchingMessages && (
//             <TouchableOpacity onPress={() => setSearch("")}>
//               <Ionicons
//                 name="close-circle"
//                 size={17}
//                 color={colors.textPrimary}
//               />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {isLoading && chats.length === 0 ? (
//         <View style={styles.loadingWrap}>
//           <ActivityIndicator color="#00d4aa" size="large" />
//         </View>
//       ) : (
//         <SectionList
//           sections={sections}
//           keyExtractor={(item, i) =>
//             (item as Chat)._id ||
//             (item as MessageSearchResult).messageId ||
//             String(i)
//           }
//           renderSectionHeader={({ section }) =>
//             section.title ? (
//               <View style={styles.sectionHeaderWrap}>
//                 <Text
//                   style={[
//                     styles.sectionHeaderText,
//                     { color: colors.textPrimary },
//                   ]}
//                 >
//                   {section.title.toUpperCase()}
//                 </Text>
//               </View>
//             ) : null
//           }
//           renderItem={({ item, section }) =>
//             section.key === "messages" ? (
//               <MessageResultRow
//                 item={item as MessageSearchResult}
//                 query={search}
//                 colors={colors}
//               />
//             ) : (
//               <ChatItem
//                 deviceContacts={deviceContacts}
//                 chat={item as Chat}
//                 userId={user?._id || ""}
//                 colors={colors}
//               />
//             )
//           }
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor="#00d4aa"
//             />
//           }
//           contentContainerStyle={[
//             styles.list,
//             (noResults || (!isSearching && filteredChats.length === 0)) &&
//               styles.listEmpty,
//           ]}
//           showsVerticalScrollIndicator={false}
//           stickySectionHeadersEnabled={false}
//           ListHeaderComponent={
//             user && !isSearching ? (
//               <>
//                 <Text
//                   style={[styles.statusTitle, { color: colors.textSecondary }]}
//                   numberOfLines={1}
//                 >
//                   Recent Updates
//                 </Text>
//                 <StatusRow user={user} colors={colors} />

//                 {/* <ContactsRow colors={colors} /> */}
//               </>
//             ) : null
//           }
//           ListEmptyComponent={
//             isSearching ? (
//               searchingMessages ? null : (
//                 <View style={styles.emptyWrap}>
//                   <Ionicons
//                     name="search-outline"
//                     size={56}
//                     color={colors.textPrimary}
//                   />
//                   <Text
//                     style={[styles.emptyTitle, { color: colors.textPrimary }]}
//                   >
//                     No results found
//                   </Text>
//                   <Text
//                     style={[styles.emptySubtitle, { color: colors.textPrimary }]}
//                   >
//                     Try a different search term
//                   </Text>
//                 </View>
//               )
//             ) : (
//               <View style={styles.emptyWrap}>
//                 <Ionicons
//                   name="chatbubbles-outline"
//                   size={56}
//                   color={colors.textPrimary}
//                 />
//                 <Text
//                   style={[styles.emptyTitle, { color: colors.textPrimary }]}
//                 >
//                   No conversations yet
//                 </Text>
//                 <Text
//                   style={[styles.emptySubtitle, { color: colors.textPrimary }]}
//                 >
//                   Start a chat with your contacts
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.newChatBtn}
//                   onPress={() => router.push("/new-chat")}
//                   activeOpacity={0.85}
//                 >
//                   <LinearGradient
//                     colors={[colors.primary, colors.primaryDark]}
//                     style={styles.newChatGradient}
//                   >
//                     <Text style={styles.newChatText}>New Chat</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             )
//           }
//         />
//       )}

//       {showHeaderMenu && (
//         <MenuItems closeHeaderMenu={closeHeaderMenu} menuAnim={menuAnim} />
//       )}
//       {/* floating action button */}
//       <TouchableOpacity
//         style={styles.fab}
//         onPress={() => router.push("/new-chat")}
//         activeOpacity={0.85}
//       >
//         <LinearGradient
//           colors={[colors.primary, colors.primaryDark]}
//           style={styles.fabGradient}
//         >
//           <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
//         </LinearGradient>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: Spacing.base,
//     paddingVertical: 10,
//   },
//   headerTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
//   headerActions: { flexDirection: "row", gap: 8 },
//   headerBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   searchWrap: { paddingHorizontal: Spacing.base, marginBottom: 4 },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: BorderRadius.full,
//     paddingHorizontal: 12,
//     height: 40,
//     gap: 8,
//     borderWidth: 1,
//   },
//   searchInput: { flex: 1, fontSize: 14 },
//   list: { paddingBottom: 100 },
//   listEmpty: { flexGrow: 1 },
//   loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
//   sectionHeaderWrap: { paddingHorizontal: Spacing.base, paddingVertical: 8 },
//   sectionHeaderText: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },

//   statusAvatarInitials: { color: "#fff", fontSize: 17, fontWeight: "800" },
//   plusBadge: {
//     position: "absolute",
//     bottom: -1,
//     right: -1,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: "#00d4aa",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//   },
//   statusTitle: {
//     fontSize: 14,
//     textAlign: "left",
//     fontWeight: "600",
//     paddingHorizontal: Spacing.base,
//     marginTop: 8,
//   },
//   statusName: { fontSize: 11, textAlign: "center", fontWeight: "500" },
//   contactsSection: { marginBottom: 4 },
//   contactsHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: Spacing.base,
//     marginBottom: 6,
//   },
//   contactsLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
//   seeAll: { fontSize: 12, color: "#00d4aa", fontWeight: "700" },
//   contactsScroll: {
//     paddingHorizontal: Spacing.base,
//     gap: 14,
//     paddingBottom: 8,
//   },
//   contactChip: { alignItems: "center", width: 52 },
//   contactAvatarWrap: { position: "relative", marginBottom: 4 },
//   contactAvatar: { width: 48, height: 48, borderRadius: 24 },
//   contactAvatarFallback: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   contactInitials: { color: "#fff", fontSize: 15, fontWeight: "700" },
//   contactOnlineDot: {
//     position: "absolute",
//     bottom: 1,
//     right: 1,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: "#00d4aa",
//     borderWidth: 2,
//   },
//   contactName: { fontSize: 11, textAlign: "center" },
//   // Row layout shared by MessageResultRow (mirrors ChatItem's own styles)
//   chatItem: { flexDirection: "row", paddingHorizontal: Spacing.base, gap: 12 },
//   chatAvatarWrap: { position: "relative", marginTop: 10 },
//   chatAvatar: { width: 50, height: 50, borderRadius: 25 },
//   chatAvatarFallback: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   chatAvatarInitials: { color: "#fff", fontWeight: "700", fontSize: 17 },
//   chatContent: {
//     flex: 1,
//     paddingVertical: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     gap: 4,
//   },
//   chatTop: { flexDirection: "row", justifyContent: "space-between" },
//   chatName: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
//   chatTime: { fontSize: 12 },
//   lastMessage: { fontSize: 13 },
//   emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
//   emptyTitle: { fontSize: 18, fontWeight: "700" },
//   emptySubtitle: { fontSize: 13 },
//   newChatBtn: {
//     marginTop: 8,
//     borderRadius: BorderRadius.full,
//     overflow: "hidden",
//   },
//   newChatGradient: { paddingHorizontal: 24, paddingVertical: 11 },
//   newChatText: { color: "#fff", fontWeight: "700", fontSize: 14 },
//   fab: {
//     position: "absolute",
//     bottom: 92,
//     right: 18,
//     borderRadius: 28,
//     overflow: "hidden",
//     shadowColor: "#00d4aa",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.4,
//     shadowRadius: 12,
//     elevation: 10,
//   },
//   fabGradient: {
//     width: 54,
//     height: 54,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// import {
//   View,
//   Text,
//   SectionList,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   Animated,
//   RefreshControl,
//   ActivityIndicator,
// } from "react-native";
// import { useEffect, useRef, useState, useCallback, useMemo } from "react";
// import { useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import * as Contacts from "expo-contacts";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { Spacing, BorderRadius } from "../../constants";
// import { useTheme } from "../../context/ThemeContext";
// import { useToast } from "../../context/ToastContext";
// import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
// import { setChats } from "../../store/slices/chatSlice";
// import { chatApi, searchApi } from "../../services/api";
// import { Chat, MessageSearchResult } from "../../types";
// import { formatDistanceToNow } from "../../utils/date";
// import MenuItems from "@/components/tabindex/MenuItems";
// import ChatItem from "@/components/tabindex/ChatItem";
// import ContactsRow from "../status/components/ContactsRow";
// import { fetchStatuses } from "@/store/slices/statusSlice";
// import MessageResultRow from "@/components/tabindex/MessageResultRow";
// import StatusRow from "@/components/tabindex/StatusRow";

// export default function ChatsScreen() {
//   const { colors } = useTheme();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { error: showError } = useToast();
//   const { chats, isLoading } = useAppSelector((s) => s.chat);
//   const { user } = useAppSelector((s) => s.auth);
//   const [search, setSearch] = useState("");
//   const [refreshing, setRefreshing] = useState(false);
//   const headerAnim = useRef(new Animated.Value(0)).current;
//   const [showHeaderMenu, setShowHeaderMenu] = useState(false);
//   const menuAnim = useRef(new Animated.Value(0)).current;

//   const [messageResults, setMessageResults] = useState<MessageSearchResult[]>(
//     []
//   );
//   const [searchingMessages, setSearchingMessages] = useState(false);

//   const [deviceContacts, setDeviceContacts] = useState<Map<string, string>>(
//     new Map()
//   );

//   // Guards state updates after this screen has unmounted, so a slow
//   // request can't set state on a screen that's no longer on-screen.
//   const isMountedRef = useRef(true);
//   useEffect(() => {
//     return () => {
//       isMountedRef.current = false;
//     };
//   }, []);

//   useEffect(() => {
//     const loadDeviceContacts = async () => {
//       try {
//         const { status } = await Contacts.requestPermissionsAsync();
//         if (status !== "granted") return;

//         const { data } = await Contacts.getContactsAsync({
//           fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
//         });

//         const map = new Map<string, string>();
//         const normalize = (p: string) => p.replace(/\D/g, "");

//         for (const contact of data) {
//           if (!contact.name || !contact.phoneNumbers) continue;
//           for (const pn of contact.phoneNumbers) {
//             const suffix = normalize(pn.number || "").slice(-9);
//             if (suffix.length >= 7) {
//               map.set(suffix, contact.name);
//             }
//           }
//         }

//         if (isMountedRef.current) setDeviceContacts(map);
//       } catch {
//         // Device contacts are a display nicety (name resolution) — fail
//         // silently rather than interrupting the chat list with a toast.
//       }
//     };
//     loadDeviceContacts();
//   }, []);

//   // Debounced message search — fires ~350ms after typing stops, only for
//   // queries of 2+ chars, and cancels any in-flight timer on each keystroke.
//   useEffect(() => {
//     const q = search.trim();
//     if (q.length < 2) {
//       setMessageResults([]);
//       setSearchingMessages(false);
//       return;
//     }
//     setSearchingMessages(true);
//     const handle = setTimeout(async () => {
//       try {
//         const res = await searchApi.searchMessages(q);
//         if (res.success) setMessageResults(res.data.results);
//       } catch {
//         setMessageResults([]);
//       } finally {
//         setSearchingMessages(false);
//       }
//     }, 350);
//     return () => clearTimeout(handle);
//   }, [search]);

//   const openHeaderMenu = () => {
//     setShowHeaderMenu(true);
//     Animated.spring(menuAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//       tension: 200,
//       friction: 18,
//     }).start();
//   };

//   const closeHeaderMenu = () => {
//     Animated.timing(menuAnim, {
//       toValue: 0,
//       duration: 180,
//       useNativeDriver: true,
//     }).start(() => setShowHeaderMenu(false));
//   };

//   const loadChats = useCallback(async () => {
//     try {
//       const res = await chatApi.getChats();
//       if (!isMountedRef.current) return;
//       if (res.success) {
//         dispatch(setChats(res.data.chats));
//       } else {
//         showError("Couldn't load chats", "Try again in a moment.");
//       }
//     } catch {
//       if (isMountedRef.current) {
//         showError("Couldn't load chats", "Try again in a moment.");
//       }
//     }
//   }, [dispatch, showError]);

//   useEffect(() => {
//     loadChats();
//     Animated.timing(headerAnim, {
//       toValue: 1,
//       duration: 500,
//       useNativeDriver: true,
//     }).start();
//   }, [loadChats]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadChats();
//     if (isMountedRef.current) setRefreshing(false);
//   };

//   const isSearching = search.trim().length > 0;

//   // The other participant's user ID for every private (1:1) chat the
//   // current user is part of — used to sort ContactsRow so people you've
//   // already messaged surface before people you haven't.
//   const chattedUserIds = useMemo(() => {
//     const ids = new Set<string>();
//     for (const c of chats) {
//       if (c.type === "group") continue;
//       const other = c.participants.find((p) => p.user._id !== user?._id);
//       if (other) ids.add(other.user._id);
//     }
//     return ids;
//   }, [chats, user?._id]);

//   const filteredChats = chats.filter((c) => {
//     if (!isSearching) return true;
//     const name =
//       c.type === "group"
//         ? c.name
//         : c.participants.find((p) => p.user._id !== user?._id)?.user?.name;
//     return name?.toLowerCase().includes(search.toLowerCase());
//   });

//   // Two-section layout while searching (chats matched by name, messages
//   // matched by content) — mirrors WhatsApp's search results screen.
//   const sections = isSearching
//     ? [
//         ...(filteredChats.length > 0
//           ? [{ title: "Chats", key: "chats", data: filteredChats as any[] }]
//           : []),
//         ...(messageResults.length > 0
//           ? [
//               {
//                 title: "Messages",
//                 key: "messages",
//                 data: messageResults as any[],
//               },
//             ]
//           : []),
//       ]
//     : filteredChats.length > 0
//     ? [{ title: "", key: "all", data: filteredChats as any[] }]
//     : [];

//   const noResults =
//     isSearching &&
//     !searchingMessages &&
//     filteredChats.length === 0 &&
//     messageResults.length === 0;

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <Animated.View style={[styles.header, { opacity: headerAnim }]}>
//         <Text style={[styles.headerTitle, { color: colors.primary }]}>
//           LinksChat
//         </Text>
//         <View style={styles.headerActions}>
//           <TouchableOpacity
//             style={[
//               styles.headerBtn,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//             onPress={() => router.push("/new-chat")}
//           >
//             <Ionicons
//               name="create-outline"
//               size={19}
//               color={colors.textPrimary}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.headerBtn,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//             onPress={showHeaderMenu ? closeHeaderMenu : openHeaderMenu}
//           >
//             <Ionicons name="ellipsis-vertical" size={22} color="#00d4aa" />
//           </TouchableOpacity>
//         </View>
//       </Animated.View>

//       <View style={styles.searchWrap}>
//         <View
//           style={[
//             styles.searchBar,
//             { backgroundColor: colors.surface, borderColor: colors.border },
//           ]}
//         >
//           <Ionicons name="search" size={17} color={colors.textPrimary} />
//           <TextInput
//             style={[styles.searchInput, { color: colors.textPrimary }]}
//             placeholder="Search conversations and messages..."
//             placeholderTextColor={colors.textPrimary}
//             value={search}
//             onChangeText={setSearch}
//           />
//           {searchingMessages && (
//             <ActivityIndicator size="small" color={colors.textPrimary} />
//           )}
//           {search.length > 0 && !searchingMessages && (
//             <TouchableOpacity onPress={() => setSearch("")}>
//               <Ionicons
//                 name="close-circle"
//                 size={17}
//                 color={colors.textPrimary}
//               />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {isLoading && chats.length === 0 ? (
//         <View style={styles.loadingWrap}>
//           <ActivityIndicator color="#00d4aa" size="large" />
//         </View>
//       ) : (
//         <SectionList
//           sections={sections}
//           keyExtractor={(item, i) =>
//             (item as Chat)._id ||
//             (item as MessageSearchResult).messageId ||
//             String(i)
//           }
//           renderSectionHeader={({ section }) =>
//             section.title ? (
//               <View style={styles.sectionHeaderWrap}>
//                 <Text
//                   style={[
//                     styles.sectionHeaderText,
//                     { color: colors.textPrimary },
//                   ]}
//                 >
//                   {section.title.toUpperCase()}
//                 </Text>
//               </View>
//             ) : null
//           }
//           renderItem={({ item, section }) =>
//             section.key === "messages" ? (
//               <MessageResultRow
//                 item={item as MessageSearchResult}
//                 query={search}
//                 colors={colors}
//               />
//             ) : (
//               <ChatItem
//                 deviceContacts={deviceContacts}
//                 chat={item as Chat}
//                 userId={user?._id || ""}
//                 colors={colors}
//               />
//             )
//           }
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor="#00d4aa"
//             />
//           }
//           contentContainerStyle={[
//             styles.list,
//             (noResults || (!isSearching && filteredChats.length === 0)) &&
//               styles.listEmpty,
//           ]}
//           showsVerticalScrollIndicator={false}
//           stickySectionHeadersEnabled={false}
//           ListHeaderComponent={
//             user && !isSearching ? (
//               <>
//                 <Text
//                   style={[styles.statusTitle, { color: colors.textSecondary }]}
//                   numberOfLines={1}
//                 >
//                   Recent Updates
//                 </Text>
//                 <StatusRow user={user} colors={colors} />

//                 <ContactsRow colors={colors} chattedUserIds={chattedUserIds} />
//               </>
//             ) : null
//           }
//           ListEmptyComponent={
//             isSearching ? (
//               searchingMessages ? null : (
//                 <View style={styles.emptyWrap}>
//                   <Ionicons
//                     name="search-outline"
//                     size={56}
//                     color={colors.textPrimary}
//                   />
//                   <Text
//                     style={[styles.emptyTitle, { color: colors.textPrimary }]}
//                   >
//                     No results found
//                   </Text>
//                   <Text
//                     style={[styles.emptySubtitle, { color: colors.textPrimary }]}
//                   >
//                     Try a different search term
//                   </Text>
//                 </View>
//               )
//             ) : (
//               <View style={styles.emptyWrap}>
//                 <Ionicons
//                   name="chatbubbles-outline"
//                   size={56}
//                   color={colors.textPrimary}
//                 />
//                 <Text
//                   style={[styles.emptyTitle, { color: colors.textPrimary }]}
//                 >
//                   No conversations yet
//                 </Text>
//                 <Text
//                   style={[styles.emptySubtitle, { color: colors.textPrimary }]}
//                 >
//                   Start a chat with your contacts
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.newChatBtn}
//                   onPress={() => router.push("/new-chat")}
//                   activeOpacity={0.85}
//                 >
//                   <LinearGradient
//                     colors={[colors.primary, colors.primaryDark]}
//                     style={styles.newChatGradient}
//                   >
//                     <Text style={styles.newChatText}>New Chat</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             )
//           }
//         />
//       )}

//       {showHeaderMenu && (
//         <MenuItems closeHeaderMenu={closeHeaderMenu} menuAnim={menuAnim} />
//       )}
//       {/* floating action button */}
//       <TouchableOpacity
//         style={styles.fab}
//         onPress={() => router.push("/new-chat")}
//         activeOpacity={0.85}
//       >
//         <LinearGradient
//           colors={[colors.primary, colors.primaryDark]}
//           style={styles.fabGradient}
//         >
//           <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
//         </LinearGradient>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: Spacing.base,
//     paddingVertical: 10,
//   },
//   headerTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
//   headerActions: { flexDirection: "row", gap: 8 },
//   headerBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   searchWrap: { paddingHorizontal: Spacing.base, marginBottom: 4 },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: BorderRadius.full,
//     paddingHorizontal: 12,
//     height: 40,
//     gap: 8,
//     borderWidth: 1,
//   },
//   searchInput: { flex: 1, fontSize: 14 },
//   list: { paddingBottom: 100 },
//   listEmpty: { flexGrow: 1 },
//   loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
//   sectionHeaderWrap: { paddingHorizontal: Spacing.base, paddingVertical: 8 },
//   sectionHeaderText: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },

//   statusAvatarInitials: { color: "#fff", fontSize: 17, fontWeight: "800" },
//   plusBadge: {
//     position: "absolute",
//     bottom: -1,
//     right: -1,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: "#00d4aa",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//   },
//   statusTitle: {
//     fontSize: 14,
//     textAlign: "left",
//     fontWeight: "600",
//     paddingHorizontal: Spacing.base,
//     marginTop: 8,
//   },
//   statusName: { fontSize: 11, textAlign: "center", fontWeight: "500" },
//   contactsSection: { marginBottom: 4 },
//   contactsHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: Spacing.base,
//     marginBottom: 6,
//   },
//   contactsLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
//   seeAll: { fontSize: 12, color: "#00d4aa", fontWeight: "700" },
//   contactsScroll: {
//     paddingHorizontal: Spacing.base,
//     gap: 14,
//     paddingBottom: 8,
//   },
//   contactChip: { alignItems: "center", width: 52 },
//   contactAvatarWrap: { position: "relative", marginBottom: 4 },
//   contactAvatar: { width: 48, height: 48, borderRadius: 24 },
//   contactAvatarFallback: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   contactInitials: { color: "#fff", fontSize: 15, fontWeight: "700" },
//   contactOnlineDot: {
//     position: "absolute",
//     bottom: 1,
//     right: 1,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: "#00d4aa",
//     borderWidth: 2,
//   },
//   contactName: { fontSize: 11, textAlign: "center" },
//   // Row layout shared by MessageResultRow (mirrors ChatItem's own styles)
//   chatItem: { flexDirection: "row", paddingHorizontal: Spacing.base, gap: 12 },
//   chatAvatarWrap: { position: "relative", marginTop: 10 },
//   chatAvatar: { width: 50, height: 50, borderRadius: 25 },
//   chatAvatarFallback: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   chatAvatarInitials: { color: "#fff", fontWeight: "700", fontSize: 17 },
//   chatContent: {
//     flex: 1,
//     paddingVertical: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     gap: 4,
//   },
//   chatTop: { flexDirection: "row", justifyContent: "space-between" },
//   chatName: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
//   chatTime: { fontSize: 12 },
//   lastMessage: { fontSize: 13 },
//   emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
//   emptyTitle: { fontSize: 18, fontWeight: "700" },
//   emptySubtitle: { fontSize: 13 },
//   newChatBtn: {
//     marginTop: 8,
//     borderRadius: BorderRadius.full,
//     overflow: "hidden",
//   },
//   newChatGradient: { paddingHorizontal: 24, paddingVertical: 11 },
//   newChatText: { color: "#fff", fontWeight: "700", fontSize: 14 },
//   fab: {
//     position: "absolute",
//     bottom: 92,
//     right: 18,
//     borderRadius: 28,
//     overflow: "hidden",
//     shadowColor: "#00d4aa",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.4,
//     shadowRadius: 12,
//     elevation: 10,
//   },
//   fabGradient: {
//     width: 54,
//     height: 54,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// import {
//   View,
//   Text,
//   SectionList,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   Animated,
//   RefreshControl,
//   ActivityIndicator,
// } from "react-native";
// import { useEffect, useRef, useState, useCallback, useMemo } from "react";
// import { useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import * as Contacts from "expo-contacts";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { Spacing, BorderRadius } from "../../constants";
// import { useTheme } from "../../context/ThemeContext";
// import { useToast } from "../../context/ToastContext";
// import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
// import { setChats, addOrUpdateChat } from "../../store/slices/chatSlice";
// import { chatApi, searchApi, userApi } from "../../services/api";
// import { Chat, User, MessageSearchResult } from "../../types";
// import ContactSuggestionRow from "@/components/tabindex/ContactSuggestionRow";
// import { formatDistanceToNow } from "../../utils/date";
// import MenuItems from "@/components/tabindex/MenuItems";
// import ChatItem from "@/components/tabindex/ChatItem";
// import { fetchStatuses } from "@/store/slices/statusSlice";
// import MessageResultRow from "@/components/tabindex/MessageResultRow";
// import StatusRow from "@/components/tabindex/StatusRow";
// import ContactsRow from "@/components/tabindex/ContactsRow";

// export default function ChatsScreen() {
//   const { colors } = useTheme();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { error: showError } = useToast();
//   const { chats, isLoading } = useAppSelector((s) => s.chat);
//   const { user } = useAppSelector((s) => s.auth);
//   const [search, setSearch] = useState("");
//   const [refreshing, setRefreshing] = useState(false);
//   const headerAnim = useRef(new Animated.Value(0)).current;
//   const [showHeaderMenu, setShowHeaderMenu] = useState(false);
//   const menuAnim = useRef(new Animated.Value(0)).current;

//   const [messageResults, setMessageResults] = useState<MessageSearchResult[]>(
//     []
//   );
//   const [searchingMessages, setSearchingMessages] = useState(false);

//   const [deviceContacts, setDeviceContacts] = useState<Map<string, string>>(
//     new Map()
//   );

//   // Contacts who are on LinksChat (registered users) — separate from
//   // `deviceContacts` above, which just maps phone numbers to names pulled
//   // from the device address book for display purposes.
//   const [contacts, setContacts] = useState<User[]>([]);
//   const [loadingContacts, setLoadingContacts] = useState(true);
//   const [creatingContactId, setCreatingContactId] = useState<string | null>(
//     null
//   );

//   // Guards state updates after this screen has unmounted, so a slow
//   // request can't set state on a screen that's no longer on-screen.
//   const isMountedRef = useRef(true);
//   useEffect(() => {
//     return () => {
//       isMountedRef.current = false;
//     };
//   }, []);

//   useEffect(() => {
//     const loadDeviceContacts = async () => {
//       try {
//         const { status } = await Contacts.requestPermissionsAsync();
//         if (status !== "granted") return;

//         const { data } = await Contacts.getContactsAsync({
//           fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
//         });

//         const map = new Map<string, string>();
//         const normalize = (p: string) => p.replace(/\D/g, "");

//         for (const contact of data) {
//           if (!contact.name || !contact.phoneNumbers) continue;
//           for (const pn of contact.phoneNumbers) {
//             const suffix = normalize(pn.number || "").slice(-9);
//             if (suffix.length >= 7) {
//               map.set(suffix, contact.name);
//             }
//           }
//         }

//         if (isMountedRef.current) setDeviceContacts(map);
//       } catch {
//         // Device contacts are a display nicety (name resolution) — fail
//         // silently rather than interrupting the chat list with a toast.
//       }
//     };
//     loadDeviceContacts();
//   }, []);

//   // Debounced message search — fires ~350ms after typing stops, only for
//   // queries of 2+ chars, and cancels any in-flight timer on each keystroke.
//   useEffect(() => {
//     const q = search.trim();
//     if (q.length < 2) {
//       setMessageResults([]);
//       setSearchingMessages(false);
//       return;
//     }
//     setSearchingMessages(true);
//     const handle = setTimeout(async () => {
//       try {
//         const res = await searchApi.searchMessages(q);
//         if (res.success) setMessageResults(res.data.results);
//       } catch {
//         setMessageResults([]);
//       } finally {
//         setSearchingMessages(false);
//       }
//     }, 350);
//     return () => clearTimeout(handle);
//   }, [search]);

//   const openHeaderMenu = () => {
//     setShowHeaderMenu(true);
//     Animated.spring(menuAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//       tension: 200,
//       friction: 18,
//     }).start();
//   };

//   const closeHeaderMenu = () => {
//     Animated.timing(menuAnim, {
//       toValue: 0,
//       duration: 180,
//       useNativeDriver: true,
//     }).start(() => setShowHeaderMenu(false));
//   };

//   const loadChats = useCallback(async () => {
//     try {
//       const res = await chatApi.getChats();
//       if (!isMountedRef.current) return;
//       if (res.success) {
//         dispatch(setChats(res.data.chats));
//       } else {
//         showError("Couldn't load chats", "Try again in a moment.");
//       }
//     } catch {
//       if (isMountedRef.current) {
//         showError("Couldn't load chats", "Try again in a moment.");
//       }
//     }
//   }, [dispatch, showError]);

//   const loadContacts = useCallback(async () => {
//     setLoadingContacts(true);
//     try {
//       const res = await userApi.getContacts();
//       if (!isMountedRef.current) return;
//       if (res.success) {
//         setContacts(res.data.contacts as User[]);
//       } else {
//         showError("Couldn't load contacts", "Try again in a moment.");
//       }
//     } catch {
//       if (isMountedRef.current) {
//         showError("Couldn't load contacts", "Try again in a moment.");
//       }
//     } finally {
//       if (isMountedRef.current) setLoadingContacts(false);
//     }
//   }, [showError]);

//   useEffect(() => {
//     loadChats();
//     loadContacts();
//     Animated.timing(headerAnim, {
//       toValue: 1,
//       duration: 500,
//       useNativeDriver: true,
//     }).start();
//   }, [loadChats, loadContacts]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await Promise.all([loadChats(), loadContacts()]);
//     if (isMountedRef.current) setRefreshing(false);
//   };

//   // Starts a private chat from a not-yet-chatted-with contact suggestion,
//   // then hands off to the normal chat list (the new chat lands in Redux
//   // via addOrUpdateChat, so on the next render it's a real ChatItem and
//   // this contact drops out of the "suggested" section on its own).
//   const startChatWithContact = useCallback(
//     async (contact: User) => {
//       if (creatingContactId) return;
//       setCreatingContactId(contact._id);
//       try {
//         const res = await chatApi.createPrivateChat(contact._id);
//         if (res.success) {
//           dispatch(addOrUpdateChat(res.data.chat));
//           router.push(`/chat/${res.data.chat._id}`);
//         } else {
//           showError("Couldn't start chat", "Try again in a moment.");
//         }
//       } catch {
//         showError("Couldn't start chat", "Try again in a moment.");
//       } finally {
//         if (isMountedRef.current) setCreatingContactId(null);
//       }
//     },
//     [creatingContactId, dispatch, router, showError]
//   );

//   const isSearching = search.trim().length > 0;

//   // The other participant's user ID for every private (1:1) chat the
//   // current user is part of — used to sort ContactsRow so people you've
//   // already messaged surface before people you haven't.
//   const chattedUserIds = useMemo(() => {
//     const ids = new Set<string>();
//     for (const c of chats) {
//       if (c.type === "group") continue;
//       const other = c.participants.find((p) => p.user._id !== user?._id);
//       if (other) ids.add(other.user._id);
//     }
//     return ids;
//   }, [chats, user?._id]);

//   const filteredChats = chats.filter((c) => {
//     if (!isSearching) return true;
//     const name =
//       c.type === "group"
//         ? c.name
//         : c.participants.find((p) => p.user._id !== user?._id)?.user?.name;
//     return name?.toLowerCase().includes(search.toLowerCase());
//   });

//   // Contacts on LinksChat you haven't started a conversation with yet.
//   const unchattedContacts = contacts.filter((c) => {
//     if (chattedUserIds.has(c._id)) return false;
//     if (!isSearching) return true;
//     return c.name?.toLowerCase().includes(search.toLowerCase());
//   });

//   // Two-section layout while searching (chats matched by name, messages
//   // matched by content) — mirrors WhatsApp's search results screen.
//   const sections = isSearching
//     ? [
//         ...(filteredChats.length > 0
//           ? [{ title: "Chats", key: "chats", data: filteredChats as any[] }]
//           : []),
//         ...(messageResults.length > 0
//           ? [
//               {
//                 title: "Messages",
//                 key: "messages",
//                 data: messageResults as any[],
//               },
//             ]
//           : []),
//         ...(unchattedContacts.length > 0
//           ? [
//               {
//                 title: "Contacts on LinksChat",
//                 key: "contacts",
//                 data: unchattedContacts as any[],
//               },
//             ]
//           : []),
//       ]
//     : [
//         ...(filteredChats.length > 0
//           ? [{ title: "", key: "chats", data: filteredChats as any[] }]
//           : []),
//         ...(unchattedContacts.length > 0
//           ? [
//               {
//                 title: "Contacts on LinksChat",
//                 key: "contacts",
//                 data: unchattedContacts as any[],
//               },
//             ]
//           : []),
//       ];

//   const noResults =
//     isSearching &&
//     !searchingMessages &&
//     filteredChats.length === 0 &&
//     messageResults.length === 0 &&
//     unchattedContacts.length === 0;

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {/* header */}
//       <Animated.View style={[styles.header, { opacity: headerAnim }]}>
//         <Text style={[styles.headerTitle, { color: colors.primary }]}>
//           LinksChat
//         </Text>
//         <View style={styles.headerActions}>
//           <TouchableOpacity
//             style={[
//               styles.headerBtn,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//             onPress={() => router.push("/new-chat")}
//           >
//             <Ionicons
//               name="create-outline"
//               size={19}
//               color={colors.textPrimary}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.headerBtn,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//             onPress={showHeaderMenu ? closeHeaderMenu : openHeaderMenu}
//           >
//             <Ionicons name="ellipsis-vertical" size={22} color="#00d4aa" />
//           </TouchableOpacity>
//         </View>
//       </Animated.View>

//       <View style={styles.searchWrap}>
//         <View
//           style={[
//             styles.searchBar,
//             { backgroundColor: colors.surface, borderColor: colors.border },
//           ]}
//         >
//           <Ionicons name="search" size={17} color={colors.textPrimary} />
//           <TextInput
//             style={[styles.searchInput, { color: colors.textPrimary }]}
//             placeholder="Search conversations and messages..."
//             placeholderTextColor={colors.textPrimary}
//             value={search}
//             onChangeText={setSearch}
//           />
//           {searchingMessages && (
//             <ActivityIndicator size="small" color={colors.textPrimary} />
//           )}
//           {search.length > 0 && !searchingMessages && (
//             <TouchableOpacity onPress={() => setSearch("")}>
//               <Ionicons
//                 name="close-circle"
//                 size={17}
//                 color={colors.textPrimary}
//               />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {isLoading && chats.length === 0 ? (
//         <View style={styles.loadingWrap}>
//           <ActivityIndicator color="#00d4aa" size="large" />
//         </View>
//       ) : (
//         <SectionList
//           sections={sections}
//           keyExtractor={(item, i) =>
//             (item as Chat)._id ||
//             (item as MessageSearchResult).messageId ||
//             String(i)
//           }
//           renderSectionHeader={({ section }) =>
//             section.title ? (
//               <View style={styles.sectionHeaderWrap}>
//                 <Text
//                   style={[
//                     styles.sectionHeaderText,
//                     { color: colors.textPrimary },
//                   ]}
//                 >
//                   {section.title.toUpperCase()}
//                 </Text>
//               </View>
//             ) : null
//           }
//           renderItem={({ item, section }) =>
//             section.key === "messages" ? (
//               <MessageResultRow
//                 item={item as MessageSearchResult}
//                 query={search}
//                 colors={colors}
//               />
//             ) : section.key === "contacts" ? (
//               <ContactSuggestionRow
//                 contact={item as User}
//                 colors={colors}
//                 isCreating={creatingContactId === (item as User)._id}
//                 onPress={startChatWithContact}
//               />
//             ) : (
//               <ChatItem
//                 deviceContacts={deviceContacts}
//                 chat={item as Chat}
//                 userId={user?._id || ""}
//                 colors={colors}
//               />
//             )
//           }
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor="#00d4aa"
//             />
//           }
//           contentContainerStyle={[
//             styles.list,
//             sections.length === 0 && styles.listEmpty,
//           ]}
//           showsVerticalScrollIndicator={false}
//           stickySectionHeadersEnabled={false}
//           ListHeaderComponent={
//             user && !isSearching ? (
//               <>
//                 <Text
//                   style={[styles.statusTitle, { color: colors.textSecondary }]}
//                   numberOfLines={1}
//                 >
//                   Recent Updates
//                 </Text>
//                 <StatusRow user={user} colors={colors} />
//               </>
//             ) : null
//           }
//           ListEmptyComponent={
//             isSearching ? (
//               searchingMessages ? null : (
//                 <View style={styles.emptyWrap}>
//                   <Ionicons
//                     name="search-outline"
//                     size={56}
//                     color={colors.textPrimary}
//                   />
//                   <Text
//                     style={[styles.emptyTitle, { color: colors.textPrimary }]}
//                   >
//                     No results found
//                   </Text>
//                   <Text
//                     style={[
//                       styles.emptySubtitle,
//                       { color: colors.textPrimary },
//                     ]}
//                   >
//                     Try a different search term
//                   </Text>
//                 </View>
//               )
//             ) : (
//               <View style={styles.emptyWrap}>
//                 <Ionicons
//                   name="chatbubbles-outline"
//                   size={56}
//                   color={colors.textPrimary}
//                 />
//                 <Text
//                   style={[styles.emptyTitle, { color: colors.textPrimary }]}
//                 >
//                   No conversations yet
//                 </Text>
//                 <Text
//                   style={[styles.emptySubtitle, { color: colors.textPrimary }]}
//                 >
//                   Start a chat with your contacts
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.newChatBtn}
//                   onPress={() => router.push("/new-chat")}
//                   activeOpacity={0.85}
//                 >
//                   <LinearGradient
//                     colors={[colors.primary, colors.primaryDark]}
//                     style={styles.newChatGradient}
//                   >
//                     <Text style={styles.newChatText}>New Chat</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             )
//           }
//         />
//       )}

//       {showHeaderMenu && (
//         <MenuItems closeHeaderMenu={closeHeaderMenu} menuAnim={menuAnim} />
//       )}
//       {/* floating action button */}
//       <TouchableOpacity
//         style={styles.fab}
//         onPress={() => router.push("/new-chat")}
//         activeOpacity={0.85}
//       >
//         <LinearGradient
//           colors={[colors.primary, colors.primaryDark]}
//           style={styles.fabGradient}
//         >
//           <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
//         </LinearGradient>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: Spacing.base,
//     paddingVertical: 10,
//   },
//   headerTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
//   headerActions: { flexDirection: "row", gap: 8 },
//   headerBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   searchWrap: { paddingHorizontal: Spacing.base, marginBottom: 4 },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: BorderRadius.full,
//     paddingHorizontal: 12,
//     height: 40,
//     gap: 8,
//     borderWidth: 1,
//   },
//   searchInput: { flex: 1, fontSize: 14 },
//   list: { paddingBottom: 100 },
//   listEmpty: { flexGrow: 1 },
//   loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
//   sectionHeaderWrap: { paddingHorizontal: Spacing.base, paddingVertical: 8 },
//   sectionHeaderText: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },

//   statusAvatarInitials: { color: "#fff", fontSize: 17, fontWeight: "800" },
//   plusBadge: {
//     position: "absolute",
//     bottom: -1,
//     right: -1,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: "#00d4aa",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//   },
//   statusTitle: {
//     fontSize: 14,
//     textAlign: "left",
//     fontWeight: "600",
//     paddingHorizontal: Spacing.base,
//     marginTop: 8,
//   },
//   statusName: { fontSize: 11, textAlign: "center", fontWeight: "500" },
//   contactsSection: { marginBottom: 4 },
//   contactsHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: Spacing.base,
//     marginBottom: 6,
//   },
//   contactsLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
//   seeAll: { fontSize: 12, color: "#00d4aa", fontWeight: "700" },
//   contactsScroll: {
//     paddingHorizontal: Spacing.base,
//     gap: 14,
//     paddingBottom: 8,
//   },
//   contactChip: { alignItems: "center", width: 52 },
//   contactAvatarWrap: { position: "relative", marginBottom: 4 },
//   contactAvatar: { width: 48, height: 48, borderRadius: 24 },
//   contactAvatarFallback: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   contactInitials: { color: "#fff", fontSize: 15, fontWeight: "700" },
//   contactOnlineDot: {
//     position: "absolute",
//     bottom: 1,
//     right: 1,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: "#00d4aa",
//     borderWidth: 2,
//   },
//   contactName: { fontSize: 11, textAlign: "center" },
//   // Row layout shared by MessageResultRow (mirrors ChatItem's own styles)
//   chatItem: { flexDirection: "row", paddingHorizontal: Spacing.base, gap: 12 },
//   chatAvatarWrap: { position: "relative", marginTop: 10 },
//   chatAvatar: { width: 50, height: 50, borderRadius: 25 },
//   chatAvatarFallback: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   chatAvatarInitials: { color: "#fff", fontWeight: "700", fontSize: 17 },
//   chatContent: {
//     flex: 1,
//     paddingVertical: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     gap: 4,
//   },
//   chatTop: { flexDirection: "row", justifyContent: "space-between" },
//   chatName: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
//   chatTime: { fontSize: 12 },
//   lastMessage: { fontSize: 13 },
//   emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
//   emptyTitle: { fontSize: 18, fontWeight: "700" },
//   emptySubtitle: { fontSize: 13 },
//   newChatBtn: {
//     marginTop: 8,
//     borderRadius: BorderRadius.full,
//     overflow: "hidden",
//   },
//   newChatGradient: { paddingHorizontal: 24, paddingVertical: 11 },
//   newChatText: { color: "#fff", fontWeight: "700", fontSize: 14 },
//   fab: {
//     position: "absolute",
//     bottom: 92,
//     right: 18,
//     borderRadius: 28,
//     overflow: "hidden",
//     shadowColor: "#00d4aa",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.4,
//     shadowRadius: 12,
//     elevation: 10,
//   },
//   fabGradient: {
//     width: 54,
//     height: 54,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// import {
//   View,
//   Text,
//   SectionList,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   Animated,
//   RefreshControl,
//   ActivityIndicator,
// } from "react-native";
// import { useEffect, useRef, useState, useCallback, useMemo } from "react";
// import { useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import * as Contacts from "expo-contacts";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { Spacing, BorderRadius } from "../../constants";
// import { useTheme } from "../../context/ThemeContext";
// import { useToast } from "../../context/ToastContext";
// import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
// import { setChats, addOrUpdateChat } from "../../store/slices/chatSlice";
// import { chatApi, searchApi, userApi } from "../../services/api";
// import { Chat, User, MessageSearchResult } from "../../types";
// import ContactSuggestionRow from "@/components/tabindex/ContactSuggestionRow";
// import { formatDistanceToNow } from "../../utils/date";
// import MenuItems from "@/components/tabindex/MenuItems";
// import ChatItem from "@/components/tabindex/ChatItem";
// import { fetchStatuses } from "@/store/slices/statusSlice";
// import MessageResultRow from "@/components/tabindex/MessageResultRow";
// import StatusRow from "@/components/tabindex/StatusRow";
// import ContactsRow from "@/components/tabindex/ContactsRow";

// export default function ChatsScreen() {
//   const { colors } = useTheme();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { error: showError } = useToast();
//   const { chats } = useAppSelector((s) => s.chat);
//   const { user } = useAppSelector((s) => s.auth);
//   const [search, setSearch] = useState("");
//   const [refreshing, setRefreshing] = useState(false);
//   const headerAnim = useRef(new Animated.Value(0)).current;
//   const [showHeaderMenu, setShowHeaderMenu] = useState(false);
//   const menuAnim = useRef(new Animated.Value(0)).current;

//   const [messageResults, setMessageResults] = useState<MessageSearchResult[]>(
//     []
//   );
//   const [searchingMessages, setSearchingMessages] = useState(false);

//   const [deviceContacts, setDeviceContacts] = useState<Map<string, string>>(
//     new Map()
//   );

//   // Contacts who are on LinksChat (registered users) — separate from
//   // `deviceContacts` above, which just maps phone numbers to names pulled
//   // from the device address book for display purposes.
//   const [contacts, setContacts] = useState<User[]>([]);
//   const [loadingContacts, setLoadingContacts] = useState(true);
//   const [creatingContactId, setCreatingContactId] = useState<string | null>(
//     null
//   );

//   // Tracks whether the very first load of chats + contacts has finished
//   // (success or failure) — drives the full-screen spinner below. Doesn't
//   // reset on pull-to-refresh, so refreshing never blanks the whole screen.
//   const [initialLoadComplete, setInitialLoadComplete] = useState(false);

//   // Guards state updates after this screen has unmounted, so a slow
//   // request can't set state on a screen that's no longer on-screen.
//   const isMountedRef = useRef(true);
//   useEffect(() => {
//     return () => {
//       isMountedRef.current = false;
//     };
//   }, []);

//   useEffect(() => {
//     const loadDeviceContacts = async () => {
//       try {
//         const { status } = await Contacts.requestPermissionsAsync();
//         if (status !== "granted") return;

//         const { data } = await Contacts.getContactsAsync({
//           fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
//         });

//         const map = new Map<string, string>();
//         const normalize = (p: string) => p.replace(/\D/g, "");

//         for (const contact of data) {
//           if (!contact.name || !contact.phoneNumbers) continue;
//           for (const pn of contact.phoneNumbers) {
//             const suffix = normalize(pn.number || "").slice(-9);
//             if (suffix.length >= 7) {
//               map.set(suffix, contact.name);
//             }
//           }
//         }

//         if (isMountedRef.current) setDeviceContacts(map);
//       } catch {
//         // Device contacts are a display nicety (name resolution) — fail
//         // silently rather than interrupting the chat list with a toast.
//       }
//     };
//     loadDeviceContacts();
//   }, []);

//   // Debounced message search — fires ~350ms after typing stops, only for
//   // queries of 2+ chars, and cancels any in-flight timer on each keystroke.
//   useEffect(() => {
//     const q = search.trim();
//     if (q.length < 2) {
//       setMessageResults([]);
//       setSearchingMessages(false);
//       return;
//     }
//     setSearchingMessages(true);
//     const handle = setTimeout(async () => {
//       try {
//         const res = await searchApi.searchMessages(q);
//         if (res.success) setMessageResults(res.data.results);
//       } catch {
//         setMessageResults([]);
//       } finally {
//         setSearchingMessages(false);
//       }
//     }, 350);
//     return () => clearTimeout(handle);
//   }, [search]);

//   const openHeaderMenu = () => {
//     setShowHeaderMenu(true);
//     Animated.spring(menuAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//       tension: 200,
//       friction: 18,
//     }).start();
//   };

//   const closeHeaderMenu = () => {
//     Animated.timing(menuAnim, {
//       toValue: 0,
//       duration: 180,
//       useNativeDriver: true,
//     }).start(() => setShowHeaderMenu(false));
//   };

//   const loadChats = useCallback(async () => {
//     try {
//       const res = await chatApi.getChats();
//       if (!isMountedRef.current) return;
//       if (res.success) {
//         dispatch(setChats(res.data.chats));
//       } else {
//         showError("Couldn't load chats", "Try again in a moment.");
//       }
//     } catch {
//       if (isMountedRef.current) {
//         showError("Couldn't load chats", "Try again in a moment.");
//       }
//     }
//   }, [dispatch, showError]);

//   const loadContacts = useCallback(async () => {
//     setLoadingContacts(true);
//     try {
//       const res = await userApi.getContacts();
//       if (!isMountedRef.current) return;
//       if (res.success) {
//         setContacts(res.data.contacts as User[]);
//       } else {
//         showError("Couldn't load contacts", "Try again in a moment.");
//       }
//     } catch {
//       if (isMountedRef.current) {
//         showError("Couldn't load contacts", "Try again in a moment.");
//       }
//     } finally {
//       if (isMountedRef.current) setLoadingContacts(false);
//     }
//   }, [showError]);

//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       // Wait for both to settle (success or failure) before dropping the
//       // full-screen spinner — Promise.allSettled so one failing doesn't
//       // leave the other's result stuck behind an unresolved Promise.all.
//       await Promise.allSettled([loadChats(), loadContacts()]);
//       if (!cancelled && isMountedRef.current) setInitialLoadComplete(true);
//     })();

//     Animated.timing(headerAnim, {
//       toValue: 1,
//       duration: 500,
//       useNativeDriver: true,
//     }).start();

//     return () => {
//       cancelled = true;
//     };
//   }, [loadChats, loadContacts]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await Promise.all([loadChats(), loadContacts()]);
//     if (isMountedRef.current) setRefreshing(false);
//   };

//   // Starts a private chat from a not-yet-chatted-with contact suggestion,
//   // then hands off to the normal chat list (the new chat lands in Redux
//   // via addOrUpdateChat, so on the next render it's a real ChatItem and
//   // this contact drops out of the "suggested" section on its own).
//   const startChatWithContact = useCallback(
//     async (contact: User) => {
//       if (creatingContactId) return;
//       setCreatingContactId(contact._id);
//       try {
//         const res = await chatApi.createPrivateChat(contact._id);
//         if (res.success) {
//           dispatch(addOrUpdateChat(res.data.chat));
//           router.push(`/chat/${res.data.chat._id}`);
//         } else {
//           showError("Couldn't start chat", "Try again in a moment.");
//         }
//       } catch {
//         showError("Couldn't start chat", "Try again in a moment.");
//       } finally {
//         if (isMountedRef.current) setCreatingContactId(null);
//       }
//     },
//     [creatingContactId, dispatch, router, showError]
//   );

//   const isSearching = search.trim().length > 0;

//   // The other participant's user ID for every private (1:1) chat the
//   // current user is part of — used to sort ContactsRow so people you've
//   // already messaged surface before people you haven't.
//   const chattedUserIds = useMemo(() => {
//     const ids = new Set<string>();
//     for (const c of chats) {
//       if (c.type === "group") continue;
//       const other = c.participants.find((p) => p.user._id !== user?._id);
//       if (other) ids.add(other.user._id);
//     }
//     return ids;
//   }, [chats, user?._id]);

//   const filteredChats = chats.filter((c) => {
//     if (!isSearching) return true;
//     const name =
//       c.type === "group"
//         ? c.name
//         : c.participants.find((p) => p.user._id !== user?._id)?.user?.name;
//     return name?.toLowerCase().includes(search.toLowerCase());
//   });

//   // Contacts on LinksChat you haven't started a conversation with yet.
//   const unchattedContacts = contacts.filter((c) => {
//     if (chattedUserIds.has(c._id)) return false;
//     if (!isSearching) return true;
//     return c.name?.toLowerCase().includes(search.toLowerCase());
//   });

//   // Two-section layout while searching (chats matched by name, messages
//   // matched by content) — mirrors WhatsApp's search results screen.
//   const sections = isSearching
//     ? [
//         ...(filteredChats.length > 0
//           ? [{ title: "Chats", key: "chats", data: filteredChats as any[] }]
//           : []),
//         ...(messageResults.length > 0
//           ? [
//               {
//                 title: "Messages",
//                 key: "messages",
//                 data: messageResults as any[],
//               },
//             ]
//           : []),
//         ...(unchattedContacts.length > 0
//           ? [
//               {
//                 title: "Contacts on LinksChat",
//                 key: "contacts",
//                 data: unchattedContacts as any[],
//               },
//             ]
//           : []),
//       ]
//     : [
//         ...(filteredChats.length > 0
//           ? [{ title: "", key: "chats", data: filteredChats as any[] }]
//           : []),
//         ...(unchattedContacts.length > 0
//           ? [
//               {
//                 title: "Contacts on LinksChat",
//                 key: "contacts",
//                 data: unchattedContacts as any[],
//               },
//             ]
//           : []),
//       ];

//   const noResults =
//     isSearching &&
//     !searchingMessages &&
//     filteredChats.length === 0 &&
//     messageResults.length === 0 &&
//     unchattedContacts.length === 0;

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {/* header */}
//       <Animated.View style={[styles.header, { opacity: headerAnim }]}>
//         <Text style={[styles.headerTitle, { color: colors.primary }]}>
//           LinksChat
//         </Text>
//         <View style={styles.headerActions}>
//           <TouchableOpacity
//             style={[
//               styles.headerBtn,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//             onPress={() => router.push("/new-chat")}
//           >
//             <Ionicons
//               name="create-outline"
//               size={19}
//               color={colors.textPrimary}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.headerBtn,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//             onPress={showHeaderMenu ? closeHeaderMenu : openHeaderMenu}
//           >
//             <Ionicons name="ellipsis-vertical" size={22} color="#00d4aa" />
//           </TouchableOpacity>
//         </View>
//       </Animated.View>

//       <View style={styles.searchWrap}>
//         <View
//           style={[
//             styles.searchBar,
//             { backgroundColor: colors.surface, borderColor: colors.border },
//           ]}
//         >
//           <Ionicons name="search" size={17} color={colors.textPrimary} />
//           <TextInput
//             style={[styles.searchInput, { color: colors.textPrimary }]}
//             placeholder="Search conversations and messages..."
//             placeholderTextColor={colors.textPrimary}
//             value={search}
//             onChangeText={setSearch}
//           />
//           {searchingMessages && (
//             <ActivityIndicator size="small" color={colors.textPrimary} />
//           )}
//           {search.length > 0 && !searchingMessages && (
//             <TouchableOpacity onPress={() => setSearch("")}>
//               <Ionicons
//                 name="close-circle"
//                 size={17}
//                 color={colors.textPrimary}
//               />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {!initialLoadComplete ? (
//         <View style={styles.loadingWrap}>
//           <ActivityIndicator color="#00d4aa" size="large" />
//         </View>
//       ) : (
//         <SectionList
//           sections={sections}
//           keyExtractor={(item, i) =>
//             (item as Chat)._id ||
//             (item as MessageSearchResult).messageId ||
//             String(i)
//           }
//           renderSectionHeader={({ section }) =>
//             section.title ? (
//               <View style={styles.sectionHeaderWrap}>
//                 <Text
//                   style={[
//                     styles.sectionHeaderText,
//                     { color: colors.textPrimary },
//                   ]}
//                 >
//                   {section.title.toUpperCase()}
//                 </Text>
//               </View>
//             ) : null
//           }
//           renderItem={({ item, section }) =>
//             section.key === "messages" ? (
//               <MessageResultRow
//                 item={item as MessageSearchResult}
//                 query={search}
//                 colors={colors}
//               />
//             ) : section.key === "contacts" ? (
//               <ContactSuggestionRow
//                 contact={item as User}
//                 colors={colors}
//                 isCreating={creatingContactId === (item as User)._id}
//                 onPress={startChatWithContact}
//               />
//             ) : (
//               <ChatItem
//                 deviceContacts={deviceContacts}
//                 chat={item as Chat}
//                 userId={user?._id || ""}
//                 colors={colors}
//               />
//             )
//           }
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor="#00d4aa"
//             />
//           }
//           contentContainerStyle={[
//             styles.list,
//             sections.length === 0 && styles.listEmpty,
//           ]}
//           showsVerticalScrollIndicator={false}
//           stickySectionHeadersEnabled={false}
//           ListHeaderComponent={
//             user && !isSearching ? (
//               <>
//                 <Text
//                   style={[styles.statusTitle, { color: colors.textSecondary }]}
//                   numberOfLines={1}
//                 >
//                   Recent Updates
//                 </Text>
//                 <StatusRow user={user} colors={colors} />
//               </>
//             ) : null
//           }
//           ListEmptyComponent={
//             isSearching ? (
//               searchingMessages ? null : (
//                 <View style={styles.emptyWrap}>
//                   <Ionicons
//                     name="search-outline"
//                     size={56}
//                     color={colors.textPrimary}
//                   />
//                   <Text
//                     style={[styles.emptyTitle, { color: colors.textPrimary }]}
//                   >
//                     No results found
//                   </Text>
//                   <Text
//                     style={[
//                       styles.emptySubtitle,
//                       { color: colors.textPrimary },
//                     ]}
//                   >
//                     Try a different search term
//                   </Text>
//                 </View>
//               )
//             ) : (
//               <View style={styles.emptyWrap}>
//                 <Ionicons
//                   name="chatbubbles-outline"
//                   size={56}
//                   color={colors.textPrimary}
//                 />
//                 <Text
//                   style={[styles.emptyTitle, { color: colors.textPrimary }]}
//                 >
//                   No conversations yet
//                 </Text>
//                 <Text
//                   style={[styles.emptySubtitle, { color: colors.textPrimary }]}
//                 >
//                   Start a chat with your contacts
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.newChatBtn}
//                   onPress={() => router.push("/new-chat")}
//                   activeOpacity={0.85}
//                 >
//                   <LinearGradient
//                     colors={[colors.primary, colors.primaryDark]}
//                     style={styles.newChatGradient}
//                   >
//                     <Text style={styles.newChatText}>New Chat</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             )
//           }
//         />
//       )}

//       {showHeaderMenu && (
//         <MenuItems closeHeaderMenu={closeHeaderMenu} menuAnim={menuAnim} />
//       )}
//       {/* floating action button */}
//       <TouchableOpacity
//         style={styles.fab}
//         onPress={() => router.push("/new-chat")}
//         activeOpacity={0.85}
//       >
//         <LinearGradient
//           colors={[colors.primary, colors.primaryDark]}
//           style={styles.fabGradient}
//         >
//           <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
//         </LinearGradient>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: Spacing.base,
//     paddingVertical: 10,
//   },
//   headerTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
//   headerActions: { flexDirection: "row", gap: 8 },
//   headerBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   searchWrap: { paddingHorizontal: Spacing.base, marginBottom: 4 },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: BorderRadius.full,
//     paddingHorizontal: 12,
//     height: 40,
//     gap: 8,
//     borderWidth: 1,
//   },
//   searchInput: { flex: 1, fontSize: 14 },
//   list: { paddingBottom: 100 },
//   listEmpty: { flexGrow: 1 },
//   loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
//   sectionHeaderWrap: { paddingHorizontal: Spacing.base, paddingVertical: 8 },
//   sectionHeaderText: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },

//   statusAvatarInitials: { color: "#fff", fontSize: 17, fontWeight: "800" },
//   plusBadge: {
//     position: "absolute",
//     bottom: -1,
//     right: -1,
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: "#00d4aa",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//   },
//   statusTitle: {
//     fontSize: 14,
//     textAlign: "left",
//     fontWeight: "600",
//     paddingHorizontal: Spacing.base,
//     marginTop: 8,
//   },
//   statusName: { fontSize: 11, textAlign: "center", fontWeight: "500" },
//   contactsSection: { marginBottom: 4 },
//   contactsHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: Spacing.base,
//     marginBottom: 6,
//   },
//   contactsLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
//   seeAll: { fontSize: 12, color: "#00d4aa", fontWeight: "700" },
//   contactsScroll: {
//     paddingHorizontal: Spacing.base,
//     gap: 14,
//     paddingBottom: 8,
//   },
//   contactChip: { alignItems: "center", width: 52 },
//   contactAvatarWrap: { position: "relative", marginBottom: 4 },
//   contactAvatar: { width: 48, height: 48, borderRadius: 24 },
//   contactAvatarFallback: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   contactInitials: { color: "#fff", fontSize: 15, fontWeight: "700" },
//   contactOnlineDot: {
//     position: "absolute",
//     bottom: 1,
//     right: 1,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: "#00d4aa",
//     borderWidth: 2,
//   },
//   contactName: { fontSize: 11, textAlign: "center" },
//   // Row layout shared by MessageResultRow (mirrors ChatItem's own styles)
//   chatItem: { flexDirection: "row", paddingHorizontal: Spacing.base, gap: 12 },
//   chatAvatarWrap: { position: "relative", marginTop: 10 },
//   chatAvatar: { width: 50, height: 50, borderRadius: 25 },
//   chatAvatarFallback: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   chatAvatarInitials: { color: "#fff", fontWeight: "700", fontSize: 17 },
//   chatContent: {
//     flex: 1,
//     paddingVertical: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     gap: 4,
//   },
//   chatTop: { flexDirection: "row", justifyContent: "space-between" },
//   chatName: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
//   chatTime: { fontSize: 12 },
//   lastMessage: { fontSize: 13 },
//   emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
//   emptyTitle: { fontSize: 18, fontWeight: "700" },
//   emptySubtitle: { fontSize: 13 },
//   newChatBtn: {
//     marginTop: 8,
//     borderRadius: BorderRadius.full,
//     overflow: "hidden",
//   },
//   newChatGradient: { paddingHorizontal: 24, paddingVertical: 11 },
//   newChatText: { color: "#fff", fontWeight: "700", fontSize: 14 },
//   fab: {
//     position: "absolute",
//     bottom: 92,
//     right: 18,
//     borderRadius: 28,
//     overflow: "hidden",
//     shadowColor: "#00d4aa",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.4,
//     shadowRadius: 12,
//     elevation: 10,
//   },
//   fabGradient: {
//     width: 54,
//     height: 54,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
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
      if (!cancelled && isMountedRef.current && loading)
        setInitialLoadComplete(true);
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
            <Ionicons name="ellipsis-vertical" size={22} color="#00d4aa" />
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
