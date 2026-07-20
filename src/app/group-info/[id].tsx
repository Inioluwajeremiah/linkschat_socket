// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   ScrollView,
// } from "react-native";
// import { useEffect, useState } from "react";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { useTheme } from "@/context/ThemeContext";
// import { useToast } from "@/context/ToastContext";
// import { useAppSelector } from "@/hooks/useRedux";
// import { Chat, ChatParticipant, User } from "@/types";
// import { chatApi, groupApi, userApi } from "@/services/api";

// export default function GroupInfoScreen() {
//   const { id: chatId } = useLocalSearchParams<{ id: string }>();
//   const router = useRouter();
//   const { colors } = useTheme();
//   const toast = useToast();
//   const { user: me } = useAppSelector((s) => s.auth);

//   const [chat, setChat] = useState<Chat | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [editing, setEditing] = useState(false);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [searchQ, setSearchQ] = useState("");
//   const [searchResults, setSearchResults] = useState<User[]>([]);
//   const [addingId, setAddingId] = useState<string | null>(null);

//   const load = async () => {
//     try {
//       const res = await chatApi.getChatInfo(chatId);
//       if (res.success) {
//         setChat(res.data.chat);
//         setName(res.data.chat.name || "");
//         setDescription(res.data.chat.description || "");
//       }
//     } catch {
//       toast.error("Failed to load group info");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [chatId]);

//   const myRole = chat?.participants.find((p) => p.user._id === me?._id)?.role;
//   const isAdmin = myRole === "admin" || myRole === "owner";

//   const saveInfo = async () => {
//     if (!name.trim()) {
//       toast.error("Group name required");
//       return;
//     }
//     setSaving(true);
//     try {
//       await groupApi.updateInfo(chatId, {
//         name: name.trim(),
//         description: description.trim(),
//       });
//       toast.success("Group updated");
//       setEditing(false);
//       load();
//     } catch {
//       toast.error("Failed to update");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const search = async (q: string) => {
//     setSearchQ(q);
//     if (q.length < 2) {
//       setSearchResults([]);
//       return;
//     }
//     try {
//       const res = await userApi.searchUsers(q);
//       if (res.success) {
//         const memberIds = chat?.participants.map((p) => p.user._id) || [];
//         setSearchResults(
//           res.data.users.filter((u) => !memberIds.includes(u._id))
//         );
//       }
//     } catch {}
//   };

//   const addMember = async (userId: string) => {
//     setAddingId(userId);
//     try {
//       await groupApi.addMembers(chatId, [userId]);
//       toast.success("Member added");
//       setSearchQ("");
//       setSearchResults([]);
//       load();
//     } catch {
//       toast.error("Failed to add member");
//     } finally {
//       setAddingId(null);
//     }
//   };

//   const removeMember = (p: ChatParticipant) => {
//     Alert.alert("Remove Member", `Remove ${p.user.name} from the group?`, [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Remove",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await groupApi.removeMember(chatId, p.user._id);
//             toast.success("Removed");
//             load();
//           } catch {
//             toast.error("Failed to remove");
//           }
//         },
//       },
//     ]);
//   };

//   const toggleAdmin = async (p: ChatParticipant) => {
//     const makeAdmin = p.role !== "admin";
//     try {
//       await groupApi.toggleAdmin(chatId, p.user._id, makeAdmin);
//       toast.success(
//         makeAdmin ? `${p.user.name} is now an admin` : "Admin removed"
//       );
//       load();
//     } catch {
//       toast.error("Failed to update admin");
//     }
//   };

//   const leaveGroup = () => {
//     Alert.alert("Leave Group", "Are you sure you want to leave?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Leave",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await groupApi.removeMember(chatId, me!._id);
//             router.replace("/(tabs)");
//           } catch {
//             toast.error("Failed to leave");
//           }
//         },
//       },
//     ]);
//   };

//   if (loading) {
//     return (
//       <View
//         style={[
//           styles.container,
//           {
//             backgroundColor: colors.background,
//             justifyContent: "center",
//             alignItems: "center",
//           },
//         ]}
//       >
//         <ActivityIndicator color="#00d4aa" />
//       </View>
//     );
//   }

//   const initials = (chat?.name || "?")
//     .split(" ")
//     .map((w) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   return (
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: colors.background }]}
//       edges={["top"]}
//     >
//       <View style={[styles.header, { borderBottomColor: colors.border }]}>
//         <TouchableOpacity
//           style={[
//             styles.backBtn,
//             { backgroundColor: colors.surface, borderColor: colors.border },
//           ]}
//           onPress={() => router.back()}
//         >
//           <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
//         </TouchableOpacity>
//         <Text style={[styles.title, { color: colors.textPrimary }]}>
//           Group Info
//         </Text>
//         {isAdmin && (
//           <TouchableOpacity
//             onPress={() => (editing ? saveInfo() : setEditing(true))}
//             style={styles.editBtn}
//           >
//             {saving ? (
//               <ActivityIndicator size="small" color="#00d4aa" />
//             ) : (
//               <Text style={styles.editBtnText}>
//                 {editing ? "Save" : "Edit"}
//               </Text>
//             )}
//           </TouchableOpacity>
//         )}
//       </View>

//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 120 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Hero */}
//         <View style={[styles.hero, { borderColor: colors.border }]}>
//           <LinearGradient
//             colors={[colors.surface, colors.background]}
//             style={StyleSheet.absoluteFillObject}
//           />
//           {chat?.avatar ? (
//             <Image
//               source={{ uri: chat.avatar }}
//               style={styles.groupAvatar}
//               contentFit="cover"
//             />
//           ) : (
//             <LinearGradient
//               colors={["#00d4aa", "#5b8dee"]}
//               style={styles.groupAvatarFb}
//             >
//               <Text style={styles.groupInitials}>{initials}</Text>
//             </LinearGradient>
//           )}
//           {editing ? (
//             <>
//               <TextInput
//                 style={[
//                   styles.nameInput,
//                   { color: colors.textPrimary, borderColor: "#00d4aa" },
//                 ]}
//                 value={name}
//                 onChangeText={setName}
//                 placeholder="Group name"
//                 placeholderTextColor={colors.textMuted}
//                 maxLength={100}
//               />
//               <TextInput
//                 style={[
//                   styles.descInput,
//                   { color: colors.textSecondary, borderColor: colors.border },
//                 ]}
//                 value={description}
//                 onChangeText={setDescription}
//                 placeholder="Group description (optional)"
//                 placeholderTextColor={colors.textMuted}
//                 multiline
//                 maxLength={300}
//               />
//             </>
//           ) : (
//             <>
//               <Text style={[styles.groupName, { color: colors.textPrimary }]}>
//                 {chat?.name}
//               </Text>
//               {chat?.description ? (
//                 <Text
//                   style={[styles.groupDesc, { color: colors.textSecondary }]}
//                 >
//                   {chat.description}
//                 </Text>
//               ) : null}
//               <Text style={[styles.memberCount, { color: colors.textMuted }]}>
//                 {chat?.participants.length} members
//               </Text>
//             </>
//           )}
//         </View>

//         {/* Add members */}
//         {isAdmin && (
//           <View style={styles.section}>
//             <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
//               ADD MEMBERS
//             </Text>
//             <View
//               style={[
//                 styles.searchBar,
//                 { backgroundColor: colors.surface, borderColor: colors.border },
//               ]}
//             >
//               <Ionicons name="search" size={16} color={colors.textMuted} />
//               <TextInput
//                 style={[styles.searchInput, { color: colors.textPrimary }]}
//                 placeholder="Search people to add..."
//                 placeholderTextColor={colors.textMuted}
//                 value={searchQ}
//                 onChangeText={search}
//               />
//             </View>
//             {searchResults.slice(0, 5).map((u) => {
//               const init = u.name
//                 .split(" ")
//                 .map((w) => w[0])
//                 .join("")
//                 .slice(0, 2)
//                 .toUpperCase();
//               return (
//                 <View
//                   key={u._id}
//                   style={[
//                     styles.resultRow,
//                     { borderBottomColor: colors.divider },
//                   ]}
//                 >
//                   {u.avatar ? (
//                     <Image
//                       source={{ uri: u.avatar }}
//                       style={styles.resultAvatar}
//                       contentFit="cover"
//                     />
//                   ) : (
//                     <LinearGradient
//                       colors={["#00d4aa", "#5b8dee"]}
//                       style={styles.resultAvatarFb}
//                     >
//                       <Text style={styles.resultInitials}>{init}</Text>
//                     </LinearGradient>
//                   )}
//                   <View style={styles.resultInfo}>
//                     <Text
//                       style={[styles.resultName, { color: colors.textPrimary }]}
//                     >
//                       {u.name}
//                     </Text>
//                     <Text
//                       style={[styles.resultSub, { color: colors.textMuted }]}
//                     >
//                       {u.bio || u.email}
//                     </Text>
//                   </View>
//                   <TouchableOpacity
//                     onPress={() => addMember(u._id)}
//                     disabled={addingId === u._id}
//                     style={styles.addBtnWrap}
//                   >
//                     {addingId === u._id ? (
//                       <ActivityIndicator size="small" color="#00d4aa" />
//                     ) : (
//                       <LinearGradient
//                         colors={["#00d4aa", "#00b090"]}
//                         style={styles.addBtn}
//                       >
//                         <Ionicons name="add" size={18} color="#fff" />
//                       </LinearGradient>
//                     )}
//                   </TouchableOpacity>
//                 </View>
//               );
//             })}
//           </View>
//         )}

//         {/* Members list */}
//         <View style={styles.section}>
//           <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
//             {chat?.participants.length} MEMBERS
//           </Text>
//           <View
//             style={[
//               styles.membersCard,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//           >
//             {chat?.participants.map((p, idx) => {
//               const pUser = p.user;
//               const isMe = pUser._id === me?._id;
//               const canManage = isAdmin && !isMe && p.role !== "owner";
//               const init = pUser.name
//                 .split(" ")
//                 .map((w) => w[0])
//                 .join("")
//                 .slice(0, 2)
//                 .toUpperCase();
//               return (
//                 <View
//                   key={pUser._id}
//                   style={[
//                     styles.memberRow,
//                     idx < chat.participants.length - 1 && {
//                       borderBottomWidth: StyleSheet.hairlineWidth,
//                       borderBottomColor: colors.divider,
//                     },
//                   ]}
//                 >
//                   <View style={styles.memberAvatarWrap}>
//                     {pUser.avatar ? (
//                       <Image
//                         source={{ uri: pUser.avatar }}
//                         style={styles.memberAvatar}
//                         contentFit="cover"
//                       />
//                     ) : (
//                       <LinearGradient
//                         colors={["#00d4aa", "#5b8dee"]}
//                         style={styles.memberAvatarFb}
//                       >
//                         <Text style={styles.memberInitials}>{init}</Text>
//                       </LinearGradient>
//                     )}
//                     {pUser.isOnline && (
//                       <View
//                         style={[
//                           styles.onlineDot,
//                           { borderColor: colors.surface },
//                         ]}
//                       />
//                     )}
//                   </View>
//                   <View style={styles.memberInfo}>
//                     <Text
//                       style={[styles.memberName, { color: colors.textPrimary }]}
//                     >
//                       {isMe ? "You" : pUser.name}
//                     </Text>
//                     {p.role !== "member" && (
//                       <Text style={styles.roleText}>
//                         {p.role === "owner" ? "👑 Owner" : "⭐ Admin"}
//                       </Text>
//                     )}
//                   </View>
//                   {canManage && (
//                     <View style={styles.memberActions}>
//                       <TouchableOpacity
//                         onPress={() => toggleAdmin(p)}
//                         style={[
//                           styles.actionBtn,
//                           { backgroundColor: colors.surfaceElevated },
//                         ]}
//                       >
//                         <Ionicons
//                           name={
//                             p.role === "admin"
//                               ? "remove-circle-outline"
//                               : "shield-checkmark-outline"
//                           }
//                           size={16}
//                           color={p.role === "admin" ? "#ffc107" : "#00d4aa"}
//                         />
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         onPress={() => removeMember(p)}
//                         style={[
//                           styles.actionBtn,
//                           { backgroundColor: "rgba(255,71,87,0.1)" },
//                         ]}
//                       >
//                         <Ionicons
//                           name="close-circle-outline"
//                           size={16}
//                           color="#ff4757"
//                         />
//                       </TouchableOpacity>
//                     </View>
//                   )}
//                 </View>
//               );
//             })}
//           </View>
//         </View>

//         {/* Leave */}
//         <View style={styles.section}>
//           <TouchableOpacity
//             style={[
//               styles.leaveBtn,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//             onPress={leaveGroup}
//           >
//             <Ionicons name="exit-outline" size={20} color="#ff4757" />
//             <Text style={styles.leaveBtnText}>Leave Group</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     gap: 12,
//     borderBottomWidth: 1,
//   },
//   backBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   title: { fontSize: 20, fontWeight: "800", flex: 1 },
//   editBtn: {
//     paddingHorizontal: 14,
//     paddingVertical: 7,
//     borderRadius: 99,
//     backgroundColor: "#00d4aa22",
//   },
//   editBtnText: { color: "#00d4aa", fontWeight: "700", fontSize: 14 },
//   hero: {
//     margin: 16,
//     borderRadius: 20,
//     alignItems: "center",
//     padding: 28,
//     gap: 8,
//     borderWidth: 1,
//     overflow: "hidden",
//   },
//   groupAvatar: { width: 90, height: 90, borderRadius: 45 },
//   groupAvatarFb: {
//     width: 90,
//     height: 90,
//     borderRadius: 45,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   groupInitials: { fontSize: 32, fontWeight: "800", color: "#fff" },
//   groupName: { fontSize: 22, fontWeight: "800" },
//   groupDesc: { fontSize: 13, textAlign: "center" },
//   memberCount: { fontSize: 12 },
//   nameInput: {
//     width: "100%",
//     borderWidth: 1.5,
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     fontSize: 16,
//     fontWeight: "700",
//     textAlign: "center",
//   },
//   descInput: {
//     width: "100%",
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     fontSize: 14,
//     textAlign: "center",
//     marginTop: 4,
//   },
//   section: { paddingHorizontal: 16, marginBottom: 8 },
//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     letterSpacing: 1,
//     marginBottom: 8,
//   },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     height: 44,
//     gap: 8,
//     borderWidth: 1,
//     marginBottom: 8,
//   },
//   searchInput: { flex: 1, fontSize: 14 },
//   resultRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     gap: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   resultAvatar: { width: 40, height: 40, borderRadius: 20 },
//   resultAvatarFb: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   resultInitials: { color: "#fff", fontWeight: "700", fontSize: 14 },
//   resultInfo: { flex: 1 },
//   resultName: { fontSize: 14, fontWeight: "600" },
//   resultSub: { fontSize: 12 },
//   addBtnWrap: { borderRadius: 18, overflow: "hidden" },
//   addBtn: {
//     width: 34,
//     height: 34,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   membersCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
//   memberRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     gap: 12,
//   },
//   memberAvatarWrap: { position: "relative" },
//   memberAvatar: { width: 44, height: 44, borderRadius: 22 },
//   memberAvatarFb: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   memberInitials: { color: "#fff", fontWeight: "700", fontSize: 15 },
//   onlineDot: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: "#00d4aa",
//     borderWidth: 2,
//   },
//   memberInfo: { flex: 1 },
//   memberName: { fontSize: 15, fontWeight: "600" },
//   roleText: { fontSize: 11, fontWeight: "600", color: "#ffc107", marginTop: 2 },
//   memberActions: { flexDirection: "row", gap: 6 },
//   actionBtn: {
//     width: 30,
//     height: 30,
//     borderRadius: 8,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   leaveBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//     paddingVertical: 14,
//     borderRadius: 14,
//     borderWidth: 1,
//   },
//   leaveBtnText: { color: "#ff4757", fontWeight: "700", fontSize: 15 },
// });

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useAppSelector } from "@/hooks/useRedux";
import { Chat, ChatParticipant, User } from "@/types";
import { chatApi, groupApi, userApi, uploadFileToS3 } from "@/services/api";

export default function GroupInfoScreen() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const { user: me } = useAppSelector((s) => s.auth);

  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await chatApi.getChatInfo(chatId);
      if (res.success) {
        setChat(res.data.chat);
        setName(res.data.chat.name || "");
        setDescription(res.data.chat.description || "");
      }
    } catch {
      toast.error("Failed to load group info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [chatId]);

  const myRole = chat?.participants.find((p) => p.user._id === me?._id)?.role;
  const isAdmin = myRole === "admin" || myRole === "owner";

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    setAvatarUri(result.assets[0].uri);
  };

  const saveInfo = async () => {
    if (!name.trim()) {
      toast.error("Group name required");
      return;
    }
    setSaving(true);
    try {
      // Upload the newly picked avatar (if any) before saving. Local file
      // URIs only resolve on this device — every member needs the S3 URL.
      let avatarUrl: string | undefined;
      if (avatarUri) {
        setUploadingAvatar(true);
        avatarUrl = await uploadFileToS3(
          avatarUri,
          "group-avatar.jpg",
          "image/jpeg",
          "image"
        );
        setUploadingAvatar(false);
      }

      await groupApi.updateInfo(chatId, {
        name: name.trim(),
        description: description.trim(),
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      });
      toast.success("Group updated");
      setEditing(false);
      setAvatarUri(null);
      load();
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  const search = async (q: string) => {
    setSearchQ(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await userApi.searchUsers(q);
      if (res.success) {
        const memberIds = chat?.participants.map((p) => p.user._id) || [];
        setSearchResults(
          res.data.users.filter((u) => !memberIds.includes(u._id))
        );
      }
    } catch {}
  };

  const addMember = async (userId: string) => {
    setAddingId(userId);
    try {
      await groupApi.addMembers(chatId, [userId]);
      toast.success("Member added");
      setSearchQ("");
      setSearchResults([]);
      load();
    } catch {
      toast.error("Failed to add member");
    } finally {
      setAddingId(null);
    }
  };

  const removeMember = (p: ChatParticipant) => {
    Alert.alert("Remove Member", `Remove ${p.user.name} from the group?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await groupApi.removeMember(chatId, p.user._id);
            toast.success("Removed");
            load();
          } catch {
            toast.error("Failed to remove");
          }
        },
      },
    ]);
  };

  const toggleAdmin = async (p: ChatParticipant) => {
    const makeAdmin = p.role !== "admin";
    try {
      await groupApi.toggleAdmin(chatId, p.user._id, makeAdmin);
      toast.success(
        makeAdmin ? `${p.user.name} is now an admin` : "Admin removed"
      );
      load();
    } catch {
      toast.error("Failed to update admin");
    }
  };

  const leaveGroup = () => {
    Alert.alert("Leave Group", "Are you sure you want to leave?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            await groupApi.removeMember(chatId, me!._id);
            router.replace("/(tabs)");
          } catch {
            toast.error("Failed to leave");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator color="#00d4aa" />
      </View>
    );
  }

  const initials = (chat?.name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
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
          Group Info
        </Text>
        {isAdmin && (
          <TouchableOpacity
            onPress={() =>
              editing ? saveInfo() : (setEditing(true), setAvatarUri(null))
            }
            style={styles.editBtn}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#00d4aa" />
            ) : (
              <Text style={styles.editBtnText}>
                {editing ? "Save" : "Edit"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { borderColor: colors.border }]}>
          <LinearGradient
            colors={[colors.surface, colors.background]}
            style={StyleSheet.absoluteFillObject}
          />

          {editing ? (
            <TouchableOpacity
              onPress={pickAvatar}
              activeOpacity={0.8}
              style={styles.avatarEditWrap}
            >
              {avatarUri || chat?.avatar ? (
                <Image
                  source={{ uri: avatarUri || chat!.avatar }}
                  style={styles.groupAvatar}
                  contentFit="cover"
                />
              ) : (
                <LinearGradient
                  colors={["#00d4aa", "#5b8dee"]}
                  style={styles.groupAvatarFb}
                >
                  <Text style={styles.groupInitials}>{initials}</Text>
                </LinearGradient>
              )}
              <View
                style={[
                  styles.avatarEditBadge,
                  { borderColor: colors.surface },
                ]}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={14} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          ) : chat?.avatar ? (
            <Image
              source={{ uri: chat.avatar }}
              style={styles.groupAvatar}
              contentFit="cover"
            />
          ) : (
            <LinearGradient
              colors={["#00d4aa", "#5b8dee"]}
              style={styles.groupAvatarFb}
            >
              <Text style={styles.groupInitials}>{initials}</Text>
            </LinearGradient>
          )}

          {editing ? (
            <>
              <TextInput
                style={[
                  styles.nameInput,
                  { color: colors.textPrimary, borderColor: "#00d4aa" },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Group name"
                placeholderTextColor={colors.textMuted}
                maxLength={100}
              />
              <TextInput
                style={[
                  styles.descInput,
                  { color: colors.textSecondary, borderColor: colors.border },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Group description (optional)"
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={300}
              />
            </>
          ) : (
            <>
              <Text style={[styles.groupName, { color: colors.textPrimary }]}>
                {chat?.name}
              </Text>
              {chat?.description ? (
                <Text
                  style={[styles.groupDesc, { color: colors.textSecondary }]}
                >
                  {chat.description}
                </Text>
              ) : null}
              <Text style={[styles.memberCount, { color: colors.textMuted }]}>
                {chat?.participants.length} members
              </Text>
            </>
          )}
        </View>

        {/* Add members */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              ADD MEMBERS
            </Text>
            <View
              style={[
                styles.searchBar,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search people to add..."
                placeholderTextColor={colors.textMuted}
                value={searchQ}
                onChangeText={search}
              />
            </View>
            {searchResults.slice(0, 5).map((u) => {
              const init = u.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <View
                  key={u._id}
                  style={[
                    styles.resultRow,
                    { borderBottomColor: colors.divider },
                  ]}
                >
                  {u.avatar ? (
                    <Image
                      source={{ uri: u.avatar }}
                      style={styles.resultAvatar}
                      contentFit="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={["#00d4aa", "#5b8dee"]}
                      style={styles.resultAvatarFb}
                    >
                      <Text style={styles.resultInitials}>{init}</Text>
                    </LinearGradient>
                  )}
                  <View style={styles.resultInfo}>
                    <Text
                      style={[styles.resultName, { color: colors.textPrimary }]}
                    >
                      {u.name}
                    </Text>
                    <Text
                      style={[styles.resultSub, { color: colors.textMuted }]}
                    >
                      {u.bio || u.email}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => addMember(u._id)}
                    disabled={addingId === u._id}
                    style={styles.addBtnWrap}
                  >
                    {addingId === u._id ? (
                      <ActivityIndicator size="small" color="#00d4aa" />
                    ) : (
                      <LinearGradient
                        colors={["#00d4aa", "#00b090"]}
                        style={styles.addBtn}
                      >
                        <Ionicons name="add" size={18} color="#fff" />
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Members list */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            {chat?.participants.length} MEMBERS
          </Text>
          <View
            style={[
              styles.membersCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {chat?.participants.map((p, idx) => {
              const pUser = p.user;
              const isMe = pUser._id === me?._id;
              const canManage = isAdmin && !isMe && p.role !== "owner";
              const init = pUser.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <View
                  key={pUser._id}
                  style={[
                    styles.memberRow,
                    idx < chat.participants.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.divider,
                    },
                  ]}
                >
                  <View style={styles.memberAvatarWrap}>
                    {pUser.avatar ? (
                      <Image
                        source={{ uri: pUser.avatar }}
                        style={styles.memberAvatar}
                        contentFit="cover"
                      />
                    ) : (
                      <LinearGradient
                        colors={["#00d4aa", "#5b8dee"]}
                        style={styles.memberAvatarFb}
                      >
                        <Text style={styles.memberInitials}>{init}</Text>
                      </LinearGradient>
                    )}
                    {pUser.isOnline && (
                      <View
                        style={[
                          styles.onlineDot,
                          { borderColor: colors.surface },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.memberInfo}>
                    <Text
                      style={[styles.memberName, { color: colors.textPrimary }]}
                    >
                      {isMe ? "You" : pUser.name}
                    </Text>
                    {p.role !== "member" && (
                      <Text style={styles.roleText}>
                        {p.role === "owner" ? "👑 Owner" : "⭐ Admin"}
                      </Text>
                    )}
                  </View>
                  {canManage && (
                    <View style={styles.memberActions}>
                      <TouchableOpacity
                        onPress={() => toggleAdmin(p)}
                        style={[
                          styles.actionBtn,
                          { backgroundColor: colors.surfaceElevated },
                        ]}
                      >
                        <Ionicons
                          name={
                            p.role === "admin"
                              ? "remove-circle-outline"
                              : "shield-checkmark-outline"
                          }
                          size={16}
                          color={p.role === "admin" ? "#ffc107" : "#00d4aa"}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeMember(p)}
                        style={[
                          styles.actionBtn,
                          { backgroundColor: "rgba(255,71,87,0.1)" },
                        ]}
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={16}
                          color="#ff4757"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Leave */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.leaveBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={leaveGroup}
          >
            <Ionicons name="exit-outline" size={20} color="#ff4757" />
            <Text style={styles.leaveBtnText}>Leave Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  title: { fontSize: 20, fontWeight: "800", flex: 1 },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: "#00d4aa22",
  },
  editBtnText: { color: "#00d4aa", fontWeight: "700", fontSize: 14 },
  hero: {
    margin: 16,
    borderRadius: 20,
    alignItems: "center",
    padding: 28,
    gap: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  avatarEditWrap: { position: "relative" },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#00d4aa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  groupAvatar: { width: 90, height: 90, borderRadius: 45 },
  groupAvatarFb: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  groupInitials: { fontSize: 32, fontWeight: "800", color: "#fff" },
  groupName: { fontSize: 22, fontWeight: "800" },
  groupDesc: { fontSize: 13, textAlign: "center" },
  memberCount: { fontSize: 12 },
  nameInput: {
    width: "100%",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  descInput: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultAvatar: { width: 40, height: 40, borderRadius: 20 },
  resultAvatarFb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  resultInitials: { color: "#fff", fontWeight: "700", fontSize: 14 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: "600" },
  resultSub: { fontSize: 12 },
  addBtnWrap: { borderRadius: 18, overflow: "hidden" },
  addBtn: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  membersCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  memberAvatarWrap: { position: "relative" },
  memberAvatar: { width: 44, height: 44, borderRadius: 22 },
  memberAvatarFb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  memberInitials: { color: "#fff", fontWeight: "700", fontSize: 15 },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00d4aa",
    borderWidth: 2,
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: "600" },
  roleText: { fontSize: 11, fontWeight: "600", color: "#ffc107", marginTop: 2 },
  memberActions: { flexDirection: "row", gap: 6 },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  leaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  leaveBtnText: { color: "#ff4757", fontWeight: "700", fontSize: 15 },
});
