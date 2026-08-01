// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";
// import { useState, useCallback, useEffect } from "react";
// import { useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { Colors, Spacing, BorderRadius } from "../constants";
// import { useTheme } from "../context/ThemeContext";
// import { useToast } from "../context/ToastContext";
// import { userApi, chatApi } from "../services/api";
// import { User } from "../types";
// import { useAppDispatch } from "../hooks/useRedux";
// import { addOrUpdateChat } from "../store/slices/chatSlice";

// export default function NewChatScreen() {
//   const { colors, isDark } = useTheme();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const [query, setQuery] = useState("");
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [creating, setCreating] = useState<string | null>(null);

//   // const search = useCallback(async (q: string) => {
//   //   setQuery(q);
//   //   if (q.length < 2) {
//   //     setUsers([]);
//   //     return;
//   //   }
//   //   setLoading(true);
//   //   try {
//   //     const res = await userApi.searchUsers(q);
//   //     if (res.success) setUsers(res.data.users);
//   //   } catch {
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // }, []);

//   useEffect(() => {
//     const timer = setTimeout(async () => {
//       if (query.length < 2) {
//         setUsers([]);
//         return;
//       }

//       setLoading(true);

//       try {
//         const res = await userApi.searchUsers(query);
//         if (res.success) {
//           setUsers(res.data.users);
//         }
//       } finally {
//         setLoading(false);
//       }
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [query]);

//   const startChat = async (userId: string) => {
//     setCreating(userId);
//     try {
//       const res = await chatApi.createPrivateChat(userId);
//       if (res.success) {
//         dispatch(addOrUpdateChat(res.data.chat));
//         router.replace(`/chat/${res.data.chat._id}`);
//       }
//     } catch {
//     } finally {
//       setCreating(null);
//     }
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={[
//             styles.backBtn,
//             { borderColor: colors.border, backgroundColor: colors.surface },
//           ]}
//         >
//           <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
//         </TouchableOpacity>
//         <Text style={[styles.title, { color: colors.textPrimary }]}>
//           New Chat
//         </Text>
//         <TouchableOpacity
//           style={[
//             styles.groupBtn,
//             { borderColor: colors.border, backgroundColor: colors.surface },
//           ]}
//           onPress={() => router.push("/new-group")}
//         >
//           <Ionicons name="people-outline" size={22} color={colors.primary} />
//         </TouchableOpacity>
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
//             placeholder="Search by name or email..."
//             placeholderTextColor={colors.textMuted}
//             value={query}
//             onChangeText={setQuery}
//             autoFocus
//           />
//           {loading && <ActivityIndicator size="small" color={colors.primary} />}
//         </View>
//       </View>

//       <FlatList
//         data={users}
//         keyExtractor={(u) => u._id}
//         renderItem={({ item }) => {
//           const initials = item.name
//             .split(" ")
//             .map((w) => w[0])
//             .join("")
//             .slice(0, 2)
//             .toUpperCase();
//           return (
//             <TouchableOpacity
//               style={styles.userItem}
//               onPress={() => startChat(item._id)}
//               disabled={creating === item._id}
//               activeOpacity={0.7}
//             >
//               <View style={styles.avatarWrap}>
//                 {item.avatar ? (
//                   <Image
//                     source={{ uri: item.avatar }}
//                     style={styles.avatar}
//                     contentFit="cover"
//                   />
//                 ) : (
//                   <LinearGradient
//                     colors={[colors.primary, colors.secondary]}
//                     style={styles.avatarFallback}
//                   >
//                     <Text
//                       style={[styles.initials, { color: colors.textInverse }]}
//                     >
//                       {initials}
//                     </Text>
//                   </LinearGradient>
//                 )}
//                 {item.isOnline && (
//                   <View
//                     style={[
//                       styles.onlineDot,
//                       {
//                         backgroundColor: colors.tabActive,
//                         borderColor: colors.tabActive,
//                       },
//                     ]}
//                   />
//                 )}
//               </View>
//               <View style={styles.userInfo}>
//                 <Text style={[styles.userName, { color: colors.textPrimary }]}>
//                   {item.name}
//                 </Text>
//                 <Text
//                   style={[styles.userEmail, { color: colors.textSecondary }]}
//                 >
//                   {item.bio || item.email}
//                 </Text>
//               </View>
//               {creating === item._id ? (
//                 <ActivityIndicator size="small" color={colors.primary} />
//               ) : (
//                 <Ionicons
//                   name="chatbubble-outline"
//                   size={20}
//                   color={colors.primary}
//                 />
//               )}
//             </TouchableOpacity>
//           );
//         }}
//         ListEmptyComponent={
//           query.length >= 2 && !loading ? (
//             <View style={styles.empty}>
//               <Ionicons
//                 name="search-outline"
//                 size={48}
//                 color={colors.textMuted}
//               />
//               <Text style={[styles.emptyText, { color: colors.textMuted }]}>
//                 No users found for "{query}"
//               </Text>
//             </View>
//           ) : query.length < 2 ? (
//             <View style={styles.hint}>
//               <Ionicons
//                 name="people-outline"
//                 size={48}
//                 color={colors.textMuted}
//               />
//               <Text style={[styles.hintText, { color: colors.textMuted }]}>
//                 Search for people to chat with
//               </Text>
//             </View>
//           ) : null
//         }
//         contentContainerStyle={styles.list}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
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
//   groupBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,

//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   searchWrap: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: BorderRadius.full,
//     paddingHorizontal: 14,
//     height: 48,
//     gap: 10,
//     borderWidth: 1,
//   },
//   searchInput: { flex: 1, fontSize: 15 },
//   list: { padding: Spacing.sm, paddingBottom: 100 },
//   userItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: Spacing.sm,
//     paddingVertical: 12,
//     gap: 12,
//     borderRadius: 14,
//     marginBottom: 4,
//   },
//   avatarWrap: { position: "relative" },
//   avatar: { width: 52, height: 52, borderRadius: 26 },
//   avatarFallback: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   initials: { fontSize: 18, fontWeight: "700" },
//   onlineDot: {
//     position: "absolute",
//     bottom: 1,
//     right: 1,
//     width: 13,
//     height: 13,
//     borderRadius: 7,

//     borderWidth: 2,
//   },
//   userInfo: { flex: 1 },
//   userName: { fontSize: 16, fontWeight: "700" },
//   userEmail: { fontSize: 13 },
//   empty: { alignItems: "center", paddingTop: 60, gap: 12 },
//   emptyText: { fontSize: 15, textAlign: "center" },
//   hint: { alignItems: "center", paddingTop: 80, gap: 12 },
//   hintText: { fontSize: 15, textAlign: "center" },
// });

// import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   ListRenderItemInfo,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { Spacing, BorderRadius } from "../constants";
// import { useTheme } from "../context/ThemeContext";
// import { useToast } from "../context/ToastContext";
// import { userApi, chatApi } from "../services/api";
// import { User } from "../types";
// import { useAppDispatch } from "../hooks/useRedux";
// import { addOrUpdateChat } from "../store/slices/chatSlice";
// import { useContactNameResolver } from "@/hooks/useContactName";

// type ThemeColors = ReturnType<typeof useTheme>["colors"];

// const SEARCH_DEBOUNCE_MS = 300;
// const MIN_QUERY_LENGTH = 2;
// const AVATAR_SIZE = 52;

// /** "Jane Doe" -> "JD" */
// function getInitials(name: string): string {
//   return name
//     .trim()
//     .split(/\s+/)
//     .map((word) => word[0])
//     .filter(Boolean)
//     .slice(0, 2)
//     .join("")
//     .toUpperCase();
// }

// export default function NewChatScreen() {
//   const { colors } = useTheme();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { error: showError } = useToast();

//   const [query, setQuery] = useState("");
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [contacts, setContacts] = useState<User[]>([]);
//   const [loadingContacts, setLoadingContacts] = useState(true);
//   const [creatingUserId, setCreatingUserId] = useState<string | null>(null);

//   // Guards state updates after the screen has unmounted (e.g. the contacts
//   // fetch resolving after the user has already navigated away).
//   const isMountedRef = useRef(true);
//   useEffect(() => {
//     return () => {
//       isMountedRef.current = false;
//     };
//   }, []);

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
//     loadContacts();
//   }, [loadContacts]);

//   // Debounced search. `cancelled` guards against a slow request resolving
//   // after a newer one has already fired (or after unmount), which would
//   // otherwise clobber fresher results or set state on an unmounted screen.
//   useEffect(() => {
//     const trimmed = query.trim();
//     let cancelled = false;

//     if (trimmed.length < MIN_QUERY_LENGTH) {
//       setUsers([]);
//       setLoading(false);
//       return;
//     }

//     const timer = setTimeout(async () => {
//       setLoading(true);
//       try {
//         const res = await userApi.searchUsers(trimmed);
//         if (cancelled) return;
//         setUsers(res.success ? res.data.users : []);
//       } catch {
//         if (!cancelled) {
//           showError("Search failed", "Couldn't search users. Try again.");
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }, SEARCH_DEBOUNCE_MS);

//     return () => {
//       cancelled = true;
//       clearTimeout(timer);
//     };
//   }, [query, showError]);

//   const startChat = useCallback(
//     async (userId: string) => {
//       // Ignore taps while a chat is already being created.
//       if (creatingUserId) return;

//       setCreatingUserId(userId);
//       try {
//         const res = await chatApi.createPrivateChat(userId);
//         if (res.success) {
//           dispatch(addOrUpdateChat(res.data.chat));
//           router.replace(`/chat/${res.data.chat._id}`);
//         } else {
//           showError("Couldn't start chat", "Try again in a moment.");
//         }
//       } catch {
//         showError("Couldn't start chat", "Try again in a moment.");
//       } finally {
//         setCreatingUserId(null);
//       }
//     },
//     [creatingUserId, dispatch, router, showError]
//   );

//   const keyExtractor = useCallback((item: User) => item._id, []);

//   const renderItem = useCallback(
//     ({ item }: ListRenderItemInfo<User>) => (
//       <UserRow
//         user={item}
//         isCreating={creatingUserId === item._id}
//         disabled={creatingUserId !== null}
//         onPress={startChat}
//         colors={colors}
//       />
//     ),
//     [creatingUserId, startChat, colors]
//   );

//   const trimmedLength = query.trim().length;
//   const isSearching = trimmedLength >= MIN_QUERY_LENGTH;
//   const listData = isSearching ? users : contacts;
//   const listLoading = isSearching ? loading : loadingContacts;

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={[
//             styles.iconBtn,
//             { borderColor: colors.border, backgroundColor: colors.surface },
//           ]}
//           accessibilityRole="button"
//           accessibilityLabel="Go back"
//           hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//         >
//           <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
//         </TouchableOpacity>
//         <Text style={[styles.title, { color: colors.textPrimary }]}>
//           New Chat
//         </Text>
//         <TouchableOpacity
//           style={[
//             styles.iconBtn,
//             { borderColor: colors.border, backgroundColor: colors.surface },
//           ]}
//           onPress={() => router.push("/new-group")}
//           accessibilityRole="button"
//           accessibilityLabel="Create group chat"
//           hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//         >
//           <Ionicons name="people-outline" size={22} color={colors.primary} />
//         </TouchableOpacity>
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
//             placeholder="Search by name or email..."
//             placeholderTextColor={colors.textMuted}
//             value={query}
//             onChangeText={setQuery}
//             // autoFocus
//             autoCorrect={false}
//             autoCapitalize="none"
//             returnKeyType="search"
//             accessibilityLabel="Search users by name or email"
//           />
//           {loading && <ActivityIndicator size="small" color={colors.primary} />}
//           {!loading && query.length > 0 && (
//             <TouchableOpacity
//               onPress={() => setQuery("")}
//               accessibilityRole="button"
//               accessibilityLabel="Clear search"
//               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//             >
//               <Ionicons
//                 name="close-circle"
//                 size={18}
//                 color={colors.textMuted}
//               />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       <FlatList
//         data={listData}
//         keyExtractor={keyExtractor}
//         renderItem={renderItem}
//         keyboardShouldPersistTaps="handled"
//         keyboardDismissMode="on-drag"
//         ListEmptyComponent={
//           listLoading ? (
//             <View style={styles.hint}>
//               <ActivityIndicator size="small" color={colors.primary} />
//             </View>
//           ) : isSearching ? (
//             <EmptyState
//               icon="search-outline"
//               text={`No users found for "${query.trim()}"`}
//               color={colors.textMuted}
//               style={styles.empty}
//             />
//           ) : (
//             <EmptyState
//               icon="people-outline"
//               text="No contacts yet"
//               color={colors.textMuted}
//               style={styles.hint}
//             />
//           )
//         }
//         contentContainerStyle={styles.list}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// }

// type UserRowProps = {
//   user: User;
//   isCreating: boolean;
//   disabled: boolean;
//   onPress: (userId: string) => void;
//   colors: ThemeColors;
// };

// const UserRow = memo(function UserRow({
//   user,
//   isCreating,
//   disabled,
//   onPress,
//   colors,
// }: UserRowProps) {
//   const resolveContact = useContactNameResolver();

//   const { displayName, isContact } = resolveContact(user?.phone, user?.name);

//   const initials = useMemo(() => getInitials(displayName), [displayName]);

//   return (
//     <TouchableOpacity
//       style={styles.userItem}
//       onPress={() => onPress(user._id)}
//       disabled={disabled}
//       activeOpacity={0.7}
//       accessibilityRole="button"
//       accessibilityLabel={`Start chat with ${displayName}`}
//     >
//       <View style={styles.avatarWrap}>
//         {user.avatar ? (
//           <Image
//             source={{ uri: user.avatar }}
//             style={styles.avatar}
//             contentFit="cover"
//           />
//         ) : (
//           <LinearGradient
//             colors={[colors.primary, colors.secondary]}
//             style={styles.avatarFallback}
//           >
//             <Text style={[styles.initials, { color: colors.textInverse }]}>
//               {initials}
//             </Text>
//           </LinearGradient>
//         )}
//         {user.isOnline && (
//           <View
//             style={[
//               styles.onlineDot,
//               {
//                 backgroundColor: colors.tabActive,
//                 borderColor: colors.tabActive,
//               },
//             ]}
//           />
//         )}
//       </View>

//       <View style={styles.userInfo}>
//         <Text
//           style={[styles.userName, { color: colors.textPrimary }]}
//           numberOfLines={1}
//         >
//           {displayName}
//         </Text>
//         <Text
//           style={[styles.userEmail, { color: colors.textSecondary }]}
//           numberOfLines={1}
//         >
//           {user.bio || ""}
//         </Text>
//       </View>

//       {isCreating ? (
//         <ActivityIndicator size="small" color={colors.primary} />
//       ) : (
//         <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
//       )}
//     </TouchableOpacity>
//   );
// });

// type EmptyStateProps = {
//   icon: keyof typeof Ionicons.glyphMap;
//   text: string;
//   color: string;
//   style: object;
// };

// function EmptyState({ icon, text, color, style }: EmptyStateProps) {
//   return (
//     <View style={style}>
//       <Ionicons name={icon} size={48} color={color} />
//       <Text style={[styles.emptyText, { color }]}>{text}</Text>
//     </View>
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
//   iconBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   title: { flex: 1, fontSize: 20, fontWeight: "700" },
//   searchWrap: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: BorderRadius.full,
//     paddingHorizontal: 14,
//     height: 48,
//     gap: 10,
//     borderWidth: 1,
//   },
//   searchInput: { flex: 1, fontSize: 15 },
//   list: { padding: Spacing.sm, paddingBottom: 100, flexGrow: 1 },
//   userItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: Spacing.sm,
//     paddingVertical: 12,
//     gap: 12,
//     borderRadius: 14,
//     marginBottom: 4,
//   },
//   avatarWrap: { position: "relative" },
//   avatar: {
//     width: AVATAR_SIZE,
//     height: AVATAR_SIZE,
//     borderRadius: AVATAR_SIZE / 2,
//   },
//   avatarFallback: {
//     width: AVATAR_SIZE,
//     height: AVATAR_SIZE,
//     borderRadius: AVATAR_SIZE / 2,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   initials: { fontSize: 18, fontWeight: "700" },
//   onlineDot: {
//     position: "absolute",
//     bottom: 1,
//     right: 1,
//     width: 13,
//     height: 13,
//     borderRadius: 7,
//     borderWidth: 2,
//   },
//   userInfo: { flex: 1 },
//   userName: { fontSize: 16, fontWeight: "700" },
//   userEmail: { fontSize: 13 },
//   empty: { alignItems: "center", paddingTop: 60, gap: 12 },
//   emptyText: { fontSize: 15, textAlign: "center" },
//   hint: { alignItems: "center", paddingTop: 80, gap: 12 },
// });

// import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   ListRenderItemInfo,
//   Animated,
//   Modal,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { Spacing, BorderRadius } from "../constants";
// import { useTheme } from "../context/ThemeContext";
// import { useToast } from "../context/ToastContext";
// import { userApi, chatApi } from "../services/api";
// import { User } from "../types";
// import { useAppDispatch } from "../hooks/useRedux";
// import { addOrUpdateChat } from "../store/slices/chatSlice";
// import { useContactNameResolver } from "@/hooks/useContactName";

// type ThemeColors = ReturnType<typeof useTheme>["colors"];

// const SEARCH_DEBOUNCE_MS = 300;
// const MIN_QUERY_LENGTH = 2;
// const AVATAR_SIZE = 52;

// /** "Jane Doe" -> "JD" */
// function getInitials(name: string): string {
//   return name
//     .trim()
//     .split(/\s+/)
//     .map((word) => word[0])
//     .filter(Boolean)
//     .slice(0, 2)
//     .join("")
//     .toUpperCase();
// }

// export default function NewChatScreen() {
//   const { colors } = useTheme();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { error: showError } = useToast();
//   const resolveContact = useContactNameResolver();

//   const [query, setQuery] = useState("");
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [contacts, setContacts] = useState<User[]>([]);
//   const [loadingContacts, setLoadingContacts] = useState(true);
//   const [creatingUserId, setCreatingUserId] = useState<string | null>(null);

//   // Ellipsis menu — same bottom sheet pattern as ContactsRow / ContactsScreen.
//   const [menuUser, setMenuUser] = useState<User | null>(null);
//   const [showMenu, setShowMenu] = useState(false);
//   const slideAnim = useRef(new Animated.Value(300)).current;
//   const overlayAnim = useRef(new Animated.Value(0)).current;

//   // Guards state updates after the screen has unmounted (e.g. the contacts
//   // fetch resolving after the user has already navigated away).
//   const isMountedRef = useRef(true);
//   useEffect(() => {
//     return () => {
//       isMountedRef.current = false;
//     };
//   }, []);

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
//     loadContacts();
//   }, [loadContacts]);

//   // Debounced search. `cancelled` guards against a slow request resolving
//   // after a newer one has already fired (or after unmount), which would
//   // otherwise clobber fresher results or set state on an unmounted screen.
//   useEffect(() => {
//     const trimmed = query.trim();
//     let cancelled = false;

//     if (trimmed.length < MIN_QUERY_LENGTH) {
//       setUsers([]);
//       setLoading(false);
//       return;
//     }

//     const timer = setTimeout(async () => {
//       setLoading(true);
//       try {
//         const res = await userApi.searchUsers(trimmed);
//         if (cancelled) return;
//         setUsers(res.success ? res.data.users : []);
//       } catch {
//         if (!cancelled) {
//           showError("Search failed", "Couldn't search users. Try again.");
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }, SEARCH_DEBOUNCE_MS);

//     return () => {
//       cancelled = true;
//       clearTimeout(timer);
//     };
//   }, [query, showError]);

//   const startChat = useCallback(
//     async (userId: string) => {
//       // Ignore taps while a chat is already being created.
//       if (creatingUserId) return;

//       setCreatingUserId(userId);
//       try {
//         const res = await chatApi.createPrivateChat(userId);
//         if (res.success) {
//           dispatch(addOrUpdateChat(res.data.chat));
//           router.replace(`/chat/${res.data.chat._id}`);
//         } else {
//           showError("Couldn't start chat", "Try again in a moment.");
//         }
//       } catch {
//         showError("Couldn't start chat", "Try again in a moment.");
//       } finally {
//         setCreatingUserId(null);
//       }
//     },
//     [creatingUserId, dispatch, router, showError]
//   );

//   const openMenu = useCallback(
//     (user: User) => {
//       setMenuUser(user);
//       setShowMenu(true);
//       Animated.parallel([
//         Animated.timing(overlayAnim, {
//           toValue: 1,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//         Animated.spring(slideAnim, {
//           toValue: 0,
//           useNativeDriver: true,
//           tension: 200,
//           friction: 22,
//         }),
//       ]).start();
//     },
//     [overlayAnim, slideAnim]
//   );

//   const closeMenu = useCallback(
//     (callback?: () => void) => {
//       Animated.parallel([
//         Animated.timing(overlayAnim, {
//           toValue: 0,
//           duration: 180,
//           useNativeDriver: true,
//         }),
//         Animated.timing(slideAnim, {
//           toValue: 300,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//       ]).start(() => {
//         setShowMenu(false);
//         setMenuUser(null);
//         callback?.();
//       });
//     },
//     [overlayAnim, slideAnim]
//   );

//   const handleAction = useCallback(
//     (action: () => void) => {
//       closeMenu(action);
//     },
//     [closeMenu]
//   );

//   const keyExtractor = useCallback((item: User) => item._id, []);

//   const renderItem = useCallback(
//     ({ item }: ListRenderItemInfo<User>) => (
//       <UserRow
//         user={item}
//         isCreating={creatingUserId === item._id}
//         disabled={creatingUserId !== null}
//         onPress={startChat}
//         onOpenMenu={openMenu}
//         colors={colors}
//       />
//     ),
//     [creatingUserId, startChat, openMenu, colors]
//   );

//   const trimmedLength = query.trim().length;
//   const isSearching = trimmedLength >= MIN_QUERY_LENGTH;
//   const listData = isSearching ? users : contacts;
//   const listLoading = isSearching ? loading : loadingContacts;

//   const { displayName: menuDisplayName } = menuUser
//     ? resolveContact(menuUser.phone, menuUser.name)
//     : { displayName: "" };
//   const menuInitials = menuUser ? getInitials(menuDisplayName) : "";

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={[
//             styles.iconBtn,
//             { borderColor: colors.border, backgroundColor: colors.surface },
//           ]}
//           accessibilityRole="button"
//           accessibilityLabel="Go back"
//           hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//         >
//           <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
//         </TouchableOpacity>
//         <Text style={[styles.title, { color: colors.textPrimary }]}>
//           New Chat
//         </Text>
//         <TouchableOpacity
//           style={[
//             styles.iconBtn,
//             { borderColor: colors.border, backgroundColor: colors.surface },
//           ]}
//           onPress={() => router.push("/new-group")}
//           accessibilityRole="button"
//           accessibilityLabel="Create group chat"
//           hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//         >
//           <Ionicons name="people-outline" size={22} color={colors.primary} />
//         </TouchableOpacity>
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
//             placeholder="Search by name or email..."
//             placeholderTextColor={colors.textMuted}
//             value={query}
//             onChangeText={setQuery}
//             // autoFocus
//             autoCorrect={false}
//             autoCapitalize="none"
//             returnKeyType="search"
//             accessibilityLabel="Search users by name or email"
//           />
//           {loading && <ActivityIndicator size="small" color={colors.primary} />}
//           {!loading && query.length > 0 && (
//             <TouchableOpacity
//               onPress={() => setQuery("")}
//               accessibilityRole="button"
//               accessibilityLabel="Clear search"
//               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//             >
//               <Ionicons
//                 name="close-circle"
//                 size={18}
//                 color={colors.textMuted}
//               />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       <FlatList
//         data={listData}
//         keyExtractor={keyExtractor}
//         renderItem={renderItem}
//         keyboardShouldPersistTaps="handled"
//         keyboardDismissMode="on-drag"
//         ListEmptyComponent={
//           listLoading ? (
//             <View style={styles.hint}>
//               <ActivityIndicator size="small" color={colors.primary} />
//             </View>
//           ) : isSearching ? (
//             <EmptyState
//               icon="search-outline"
//               text={`No users found for "${query.trim()}"`}
//               color={colors.textMuted}
//               style={styles.empty}
//             />
//           ) : (
//             <EmptyState
//               icon="people-outline"
//               text="No contacts yet"
//               color={colors.textMuted}
//               style={styles.hint}
//             />
//           )
//         }
//         contentContainerStyle={styles.list}
//         showsVerticalScrollIndicator={false}
//       />

//       {/* Options menu modal — mirrors ContactsRow / ContactsScreen */}
//       {showMenu && menuUser && (
//         <Modal
//           visible={showMenu}
//           transparent
//           animationType="none"
//           onRequestClose={() => closeMenu()}
//         >
//           <Animated.View style={[styles.menuOverlay, { opacity: overlayAnim }]}>
//             <TouchableOpacity
//               style={StyleSheet.absoluteFillObject}
//               activeOpacity={1}
//               onPress={() => closeMenu()}
//             />
//           </Animated.View>

//           <Animated.View
//             style={[
//               styles.menuSheet,
//               {
//                 backgroundColor: colors.surface,
//                 borderTopColor: colors.border,
//                 transform: [{ translateY: slideAnim }],
//               },
//             ]}
//           >
//             <View
//               style={[styles.sheetHandle, { backgroundColor: colors.border }]}
//             />

//             <View style={styles.menuContactHeader}>
//               <View style={styles.menuAvatarWrap}>
//                 {menuUser.avatar ? (
//                   <Image
//                     source={{ uri: menuUser.avatar }}
//                     style={styles.menuAvatar}
//                     contentFit="cover"
//                   />
//                 ) : (
//                   <LinearGradient
//                     colors={[colors.primary, colors.secondary]}
//                     style={styles.menuAvatarFallback}
//                   >
//                     <Text style={styles.menuAvatarInitials}>
//                       {menuInitials}
//                     </Text>
//                   </LinearGradient>
//                 )}
//                 {menuUser.isOnline && (
//                   <View
//                     style={[
//                       styles.menuOnlineDot,
//                       { borderColor: colors.surface },
//                     ]}
//                   />
//                 )}
//               </View>
//               <View style={styles.menuContactInfo}>
//                 <Text
//                   style={[
//                     styles.menuContactName,
//                     { color: colors.textPrimary },
//                   ]}
//                 >
//                   {menuDisplayName}
//                 </Text>
//                 {menuUser.phone && (
//                   <Text
//                     style={[
//                       styles.menuContactPhone,
//                       { color: colors.textMuted },
//                     ]}
//                   >
//                     {menuUser.phone}
//                   </Text>
//                 )}
//                 <View
//                   style={[
//                     styles.menuOnlineChip,
//                     {
//                       backgroundColor: menuUser.isOnline
//                         ? "rgba(0,212,170,0.1)"
//                         : "rgba(85,85,119,0.1)",
//                     },
//                   ]}
//                 >
//                   <View
//                     style={[
//                       styles.menuOnlineChipDot,
//                       {
//                         backgroundColor: menuUser.isOnline
//                           ? "#00d4aa"
//                           : "#555577",
//                       },
//                     ]}
//                   />
//                   <Text
//                     style={[
//                       styles.menuOnlineChipText,
//                       { color: menuUser.isOnline ? "#00d4aa" : "#555577" },
//                     ]}
//                   >
//                     {menuUser.isOnline ? "Active now" : "Offline"}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             <View
//               style={[styles.menuDivider, { backgroundColor: colors.border }]}
//             />

//             {[
//               {
//                 icon: "chatbubble-ellipses-outline",
//                 label: "Send a Message",
//                 sub: "Start or continue a conversation",
//                 color: "#00d4aa",
//                 bg: "rgba(0,212,170,0.1)",
//                 onPress: () => startChat(menuUser._id),
//               },
//               {
//                 icon: "call-outline",
//                 label: "Voice Call",
//                 sub: "Start an audio call",
//                 color: "#5b8dee",
//                 bg: "rgba(91,141,238,0.1)",
//                 onPress: () => {
//                   router.push(`/call/${menuUser._id}?type=audio` as any);
//                 },
//               },
//               {
//                 icon: "videocam-outline",
//                 label: "Video Call",
//                 sub: "Start a video call",
//                 color: "#ff6b9d",
//                 bg: "rgba(255,107,157,0.1)",
//                 onPress: () => {
//                   router.push(`/call/${menuUser._id}?type=video` as any);
//                 },
//               },
//               {
//                 icon: "person-outline",
//                 label: "View Profile",
//                 sub: "See full contact information",
//                 color: "#ffc107",
//                 bg: "rgba(255,193,7,0.1)",
//                 onPress: () => {
//                   router.push(`/profile/${menuUser._id}` as any);
//                 },
//               },
//             ].map(({ icon, label, sub, color, bg, onPress }, i, arr) => (
//               <TouchableOpacity
//                 key={label}
//                 style={[
//                   styles.menuAction,
//                   i < arr.length - 1 && {
//                     borderBottomWidth: StyleSheet.hairlineWidth,
//                     borderBottomColor: colors.border,
//                   },
//                 ]}
//                 onPress={() => handleAction(onPress)}
//                 activeOpacity={0.7}
//               >
//                 <View style={[styles.menuActionIcon, { backgroundColor: bg }]}>
//                   <Ionicons name={icon as any} size={19} color={color} />
//                 </View>
//                 <View style={styles.menuActionText}>
//                   <Text
//                     style={[
//                       styles.menuActionLabel,
//                       { color: colors.textPrimary },
//                     ]}
//                   >
//                     {label}
//                   </Text>
//                   <Text
//                     style={[styles.menuActionSub, { color: colors.textMuted }]}
//                   >
//                     {sub}
//                   </Text>
//                 </View>
//                 <Ionicons
//                   name="chevron-forward"
//                   size={15}
//                   color={colors.textMuted}
//                 />
//               </TouchableOpacity>
//             ))}

//             <TouchableOpacity
//               style={styles.menuCancel}
//               onPress={() => closeMenu()}
//               activeOpacity={0.7}
//             >
//               <Text
//                 style={[styles.menuCancelText, { color: colors.textMuted }]}
//               >
//                 Dismiss
//               </Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </Modal>
//       )}
//     </View>
//   );
// }

// type UserRowProps = {
//   user: User;
//   isCreating: boolean;
//   disabled: boolean;
//   onPress: (userId: string) => void;
//   onOpenMenu: (user: User) => void;
//   colors: ThemeColors;
// };

// const UserRow = memo(function UserRow({
//   user,
//   isCreating,
//   disabled,
//   onPress,
//   onOpenMenu,
//   colors,
// }: UserRowProps) {
//   const resolveContact = useContactNameResolver();

//   const { displayName, isContact } = resolveContact(user?.phone, user?.name);

//   const initials = useMemo(() => getInitials(displayName), [displayName]);

//   return (
//     <TouchableOpacity
//       style={styles.userItem}
//       onPress={() => onPress(user._id)}
//       disabled={disabled}
//       activeOpacity={0.7}
//       accessibilityRole="button"
//       accessibilityLabel={`Start chat with ${displayName}`}
//     >
//       <View style={styles.avatarWrap}>
//         {user.avatar ? (
//           <Image
//             source={{ uri: user.avatar }}
//             style={styles.avatar}
//             contentFit="cover"
//           />
//         ) : (
//           <LinearGradient
//             colors={[colors.primary, colors.secondary]}
//             style={styles.avatarFallback}
//           >
//             <Text style={[styles.initials, { color: colors.textInverse }]}>
//               {initials}
//             </Text>
//           </LinearGradient>
//         )}
//         {user.isOnline && (
//           <View
//             style={[
//               styles.onlineDot,
//               {
//                 backgroundColor: colors.tabActive,
//                 borderColor: colors.tabActive,
//               },
//             ]}
//           />
//         )}
//       </View>

//       <View style={styles.userInfo}>
//         <Text
//           style={[styles.userName, { color: colors.textPrimary }]}
//           numberOfLines={1}
//         >
//           {displayName}
//         </Text>
//         <Text
//           style={[styles.userEmail, { color: colors.textSecondary }]}
//           numberOfLines={1}
//         >
//           {user.bio || ""}
//         </Text>
//       </View>

//       {isCreating ? (
//         <ActivityIndicator size="small" color={colors.primary} />
//       ) : (
//         <TouchableOpacity
//           style={styles.menuBtn}
//           onPress={() => onOpenMenu(user)}
//           accessibilityRole="button"
//           accessibilityLabel={`More options for ${displayName}`}
//           hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//         >
//           <Ionicons
//             name="ellipsis-vertical"
//             size={18}
//             color={colors.textMuted}
//           />
//         </TouchableOpacity>
//       )}
//     </TouchableOpacity>
//   );
// });

// type EmptyStateProps = {
//   icon: keyof typeof Ionicons.glyphMap;
//   text: string;
//   color: string;
//   style: object;
// };

// function EmptyState({ icon, text, color, style }: EmptyStateProps) {
//   return (
//     <View style={style}>
//       <Ionicons name={icon} size={48} color={color} />
//       <Text style={[styles.emptyText, { color }]}>{text}</Text>
//     </View>
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
//   iconBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   title: { flex: 1, fontSize: 20, fontWeight: "700" },
//   searchWrap: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: BorderRadius.full,
//     paddingHorizontal: 14,
//     height: 48,
//     gap: 10,
//     borderWidth: 1,
//   },
//   searchInput: { flex: 1, fontSize: 15 },
//   list: { padding: Spacing.sm, paddingBottom: 100, flexGrow: 1 },
//   userItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: Spacing.sm,
//     paddingVertical: 12,
//     gap: 12,
//     borderRadius: 14,
//     marginBottom: 4,
//   },
//   avatarWrap: { position: "relative" },
//   avatar: {
//     width: AVATAR_SIZE,
//     height: AVATAR_SIZE,
//     borderRadius: AVATAR_SIZE / 2,
//   },
//   avatarFallback: {
//     width: AVATAR_SIZE,
//     height: AVATAR_SIZE,
//     borderRadius: AVATAR_SIZE / 2,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   initials: { fontSize: 18, fontWeight: "700" },
//   onlineDot: {
//     position: "absolute",
//     bottom: 1,
//     right: 1,
//     width: 13,
//     height: 13,
//     borderRadius: 7,
//     borderWidth: 2,
//   },
//   userInfo: { flex: 1 },
//   userName: { fontSize: 16, fontWeight: "700" },
//   userEmail: { fontSize: 13 },
//   menuBtn: { padding: 6 },
//   empty: { alignItems: "center", paddingTop: 60, gap: 12 },
//   emptyText: { fontSize: 15, textAlign: "center" },
//   hint: { alignItems: "center", paddingTop: 80, gap: 12 },
//   // ── Options menu modal (mirrors ContactsRow / ContactsScreen) ─────────
//   menuOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     zIndex: 10,
//   },
//   menuSheet: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     borderTopWidth: 1,
//     paddingBottom: 36,
//     zIndex: 11,
//   },
//   sheetHandle: {
//     width: 36,
//     height: 4,
//     borderRadius: 2,
//     alignSelf: "center",
//     marginTop: 12,
//     marginBottom: 20,
//   },
//   menuContactHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingBottom: 18,
//     gap: 14,
//   },
//   menuAvatarWrap: { position: "relative" },
//   menuAvatar: { width: 54, height: 54, borderRadius: 27 },
//   menuAvatarFallback: {
//     width: 54,
//     height: 54,
//     borderRadius: 27,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   menuAvatarInitials: { color: "#fff", fontSize: 18, fontWeight: "800" },
//   menuOnlineDot: {
//     position: "absolute",
//     bottom: 1,
//     right: 1,
//     width: 13,
//     height: 13,
//     borderRadius: 7,
//     backgroundColor: "#00d4aa",
//     borderWidth: 2,
//   },
//   menuContactInfo: { flex: 1, gap: 4 },
//   menuContactName: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
//   menuContactPhone: { fontSize: 13, fontWeight: "500" },
//   menuOnlineChip: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//     alignSelf: "flex-start",
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 99,
//   },
//   menuOnlineChipDot: { width: 6, height: 6, borderRadius: 3 },
//   menuOnlineChipText: { fontSize: 11, fontWeight: "700" },
//   menuDivider: { height: StyleSheet.hairlineWidth, marginBottom: 4 },
//   menuAction: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//     gap: 14,
//   },
//   menuActionIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 13,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   menuActionText: { flex: 1 },
//   menuActionLabel: { fontSize: 15, fontWeight: "700" },
//   menuActionSub: { fontSize: 12, marginTop: 2 },
//   menuCancel: { alignItems: "center", paddingVertical: 16, marginTop: 4 },
//   menuCancelText: { fontSize: 14, fontWeight: "600" },
// });

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItemInfo,
  Animated,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Spacing, BorderRadius } from "../constants";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { userApi, chatApi } from "../services/api";
import { User } from "../types";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { addOrUpdateChat } from "../store/slices/chatSlice";
import { loadDeviceContacts } from "@/store/slices/contactsSlice";
import { useContactNameResolver } from "@/hooks/useContactName";

type ThemeColors = ReturnType<typeof useTheme>["colors"];

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const AVATAR_SIZE = 52;

/** "Jane Doe" -> "JD" */
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function NewChatScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { error: showError } = useToast();
  const resolveContact = useContactNameResolver();
  const deviceContactsLoaded = useAppSelector((s) => s.contacts.loaded);

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<User[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [creatingUserId, setCreatingUserId] = useState<string | null>(null);

  // Ellipsis menu — same bottom sheet pattern as ContactsRow / ContactsScreen.
  const [menuUser, setMenuUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // Guards state updates after the screen has unmounted (e.g. the contacts
  // fetch resolving after the user has already navigated away).
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    dispatch(loadDeviceContacts());
  }, [dispatch]);

  // Debounced search. `cancelled` guards against a slow request resolving
  // after a newer one has already fired (or after unmount), which would
  // otherwise clobber fresher results or set state on an unmounted screen.
  useEffect(() => {
    const trimmed = query.trim();
    let cancelled = false;

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await userApi.searchUsers(trimmed);
        if (cancelled) return;
        setUsers(res.success ? res.data.users : []);
      } catch {
        if (!cancelled) {
          showError("Search failed", "Couldn't search users. Try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, showError]);

  const startChat = useCallback(
    async (userId: string) => {
      // Ignore taps while a chat is already being created.
      if (creatingUserId) return;

      setCreatingUserId(userId);
      try {
        const res = await chatApi.createPrivateChat(userId);
        if (res.success) {
          dispatch(addOrUpdateChat(res.data.chat));
          router.replace(`/chat/${res.data.chat._id}`);
        } else {
          showError("Couldn't start chat", "Try again in a moment.");
        }
      } catch {
        showError("Couldn't start chat", "Try again in a moment.");
      } finally {
        setCreatingUserId(null);
      }
    },
    [creatingUserId, dispatch, router, showError]
  );

  const openMenu = useCallback(
    (user: User) => {
      setMenuUser(user);
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
    },
    [overlayAnim, slideAnim]
  );

  const closeMenu = useCallback(
    (callback?: () => void) => {
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
        setMenuUser(null);
        callback?.();
      });
    },
    [overlayAnim, slideAnim]
  );

  const handleAction = useCallback(
    (action: () => void) => {
      closeMenu(action);
    },
    [closeMenu]
  );

  const keyExtractor = useCallback((item: User) => item._id, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<User>) => (
      <UserRow
        user={item}
        isCreating={creatingUserId === item._id}
        disabled={creatingUserId !== null}
        onPress={startChat}
        onOpenMenu={openMenu}
        colors={colors}
      />
    ),
    [creatingUserId, startChat, openMenu, colors]
  );

  const trimmedLength = query.trim().length;
  const isSearching = trimmedLength >= MIN_QUERY_LENGTH;
  const listData = isSearching ? users : contacts;
  const listLoading =
    (isSearching ? loading : loadingContacts) || !deviceContactsLoaded;

  const { displayName: menuDisplayName } = menuUser
    ? resolveContact(menuUser.phone, menuUser.name)
    : { displayName: "" };
  const menuInitials = menuUser ? getInitials(menuDisplayName) : "";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.iconBtn,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          New Chat
        </Text>
        <TouchableOpacity
          style={[
            styles.iconBtn,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          onPress={() => router.push("/new-group")}
          accessibilityRole="button"
          accessibilityLabel="Create group chat"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
            onChangeText={setQuery}
            // autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            accessibilityLabel="Search users by name or email"
          />
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
          {!loading && query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          listLoading ? (
            <View style={styles.hint}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : isSearching ? (
            <EmptyState
              icon="search-outline"
              text={`No users found for "${query.trim()}"`}
              color={colors.textMuted}
              style={styles.empty}
            />
          ) : (
            <EmptyState
              icon="people-outline"
              text="No contacts yet"
              color={colors.textMuted}
              style={styles.hint}
            />
          )
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Options menu modal — mirrors ContactsRow / ContactsScreen */}
      {showMenu && menuUser && (
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
                {menuUser.avatar ? (
                  <Image
                    source={{ uri: menuUser.avatar }}
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
                {menuUser.isOnline && (
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
                {menuUser.phone && (
                  <Text
                    style={[
                      styles.menuContactPhone,
                      { color: colors.textMuted },
                    ]}
                  >
                    {menuUser.phone}
                  </Text>
                )}
                <View
                  style={[
                    styles.menuOnlineChip,
                    {
                      backgroundColor: menuUser.isOnline
                        ? "rgba(0,212,170,0.1)"
                        : "rgba(85,85,119,0.1)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.menuOnlineChipDot,
                      {
                        backgroundColor: menuUser.isOnline
                          ? "#00d4aa"
                          : "#555577",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.menuOnlineChipText,
                      { color: menuUser.isOnline ? "#00d4aa" : "#555577" },
                    ]}
                  >
                    {menuUser.isOnline ? "Active now" : "Offline"}
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
                onPress: () => startChat(menuUser._id),
              },
              {
                icon: "call-outline",
                label: "Voice Call",
                sub: "Start an audio call",
                color: "#5b8dee",
                bg: "rgba(91,141,238,0.1)",
                onPress: () => {
                  router.push(`/call/${menuUser._id}?type=audio` as any);
                },
              },
              {
                icon: "videocam-outline",
                label: "Video Call",
                sub: "Start a video call",
                color: "#ff6b9d",
                bg: "rgba(255,107,157,0.1)",
                onPress: () => {
                  router.push(`/call/${menuUser._id}?type=video` as any);
                },
              },
              {
                icon: "person-outline",
                label: "View Profile",
                sub: "See full contact information",
                color: "#ffc107",
                bg: "rgba(255,193,7,0.1)",
                onPress: () => {
                  router.push(`/profile/${menuUser._id}` as any);
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
    </View>
  );
}

type UserRowProps = {
  user: User;
  isCreating: boolean;
  disabled: boolean;
  onPress: (userId: string) => void;
  onOpenMenu: (user: User) => void;
  colors: ThemeColors;
};

const UserRow = memo(function UserRow({
  user,
  isCreating,
  disabled,
  onPress,
  onOpenMenu,
  colors,
}: UserRowProps) {
  const resolveContact = useContactNameResolver();

  const { displayName, isContact } = resolveContact(user?.phone, user?.name);

  const initials = useMemo(() => getInitials(displayName), [displayName]);

  return (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => onPress(user._id)}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Start chat with ${displayName}`}
    >
      <View style={styles.avatarWrap}>
        {user.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.avatarFallback}
          >
            <Text style={[styles.initials, { color: colors.textInverse }]}>
              {initials}
            </Text>
          </LinearGradient>
        )}
        {user.isOnline && (
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
        <Text
          style={[styles.userName, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {displayName}
        </Text>
        <Text
          style={[styles.userEmail, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {user.bio || ""}
        </Text>
      </View>

      {isCreating ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => onOpenMenu(user)}
          accessibilityRole="button"
          accessibilityLabel={`More options for ${displayName}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
});

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color: string;
  style: object;
};

function EmptyState({ icon, text, color, style }: EmptyStateProps) {
  return (
    <View style={style}>
      <Ionicons name={icon} size={48} color={color} />
      <Text style={[styles.emptyText, { color }]}>{text}</Text>
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  title: { flex: 1, fontSize: 20, fontWeight: "700" },
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
  list: { padding: Spacing.sm, paddingBottom: 100, flexGrow: 1 },
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
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
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
  menuBtn: { padding: 6 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, textAlign: "center" },
  hint: { alignItems: "center", paddingTop: 80, gap: 12 },
  // ── Options menu modal (mirrors ContactsRow / ContactsScreen) ─────────
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
