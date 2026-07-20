// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   Pressable,
// } from "react-native";
// import { useEffect, useState } from "react";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { Spacing } from "../../constants";
// import { useTheme } from "../../context/ThemeContext";
// import { toast, useToast } from "../../context/ToastContext";
// import { userApi, chatApi, privacyApi } from "../../services/api";
// import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
// import { addOrUpdateChat } from "../../store/slices/chatSlice";
// import { User } from "../../types";

// export default function ProfileViewScreen() {
//   const { colors } = useTheme();
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { user: me } = useAppSelector((s) => s.auth);
//   const onlineUsers = useAppSelector((s) => s.socket.onlineUsers);
//   const [profile, setProfile] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [chatLoading, setChatLoading] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [isBlocked, setIsBlocked] = useState(false);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const res = await userApi.getUserProfile(id);
//         if (res.success) setProfile(res.data.user);
//       } catch {
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [id]);

//   const startChat = async () => {
//     setChatLoading(true);
//     try {
//       const res = await chatApi.createPrivateChat(id);
//       if (res.success) {
//         dispatch(addOrUpdateChat(res.data.chat));
//         router.replace(`/chat/${res.data.chat._id}`);
//       }
//     } catch {
//     } finally {
//       setChatLoading(false);
//     }
//   };

//   const handleBlock = () => {
//     Alert.alert(
//       isBlocked ? "Unblock User" : "Block User",
//       isBlocked
//         ? `Unblock ${profile?.name}? They will be able to message you again.`
//         : `Block ${profile?.name}? They won't be able to message you and you won't see their content.`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: isBlocked ? "Unblock" : "Block",
//           style: isBlocked ? "default" : "destructive",
//           onPress: async () => {
//             try {
//               if (isBlocked) {
//                 await privacyApi.unblockUser(id);
//                 setIsBlocked(false);
//                 toast.success(`${profile?.name} unblocked`);
//               } else {
//                 await privacyApi.blockUser(id);
//                 setIsBlocked(true);
//                 toast.success(`${profile?.name} blocked`);
//               }
//             } catch {
//               toast.error("Action failed");
//             }
//             setShowMenu(false);
//           },
//         },
//       ]
//     );
//   };

//   const handleReport = () => {
//     setShowMenu(false);
//     Alert.alert(
//       "Report User",
//       `Report ${profile?.name} for inappropriate behavior?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         { text: "Spam", onPress: () => submitReport("spam") },
//         { text: "Harassment", onPress: () => submitReport("harassment") },
//         { text: "Fake account", onPress: () => submitReport("fake_account") },
//       ]
//     );
//   };

//   const submitReport = async (reason: string) => {
//     try {
//       await privacyApi.reportUser(id, reason);
//       toast.success("Reported. Our team will review.");
//     } catch {
//       toast.error("Failed to report");
//     }
//   };

//   const isOnline = onlineUsers.includes(id);
//   const initials =
//     profile?.name
//       .split(" ")
//       .map((w) => w[0])
//       .join("")
//       .slice(0, 2)
//       .toUpperCase() || "?";
//   const isMe = id === me?._id;

//   const styles = StyleSheet.create({
//     container: { flex: 1 },
//     header: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: Spacing.base,
//       paddingVertical: Spacing.md,
//       gap: 12,
//     },
//     backBtn: {
//       width: 40,
//       height: 40,
//       borderRadius: 20,
//       backgroundColor: colors.surfaceElevated,
//       justifyContent: "center",
//       alignItems: "center",
//       borderWidth: 1,
//       borderColor: colors.border,
//     },
//     title: {
//       flex: 1,
//       fontSize: 20,
//       fontWeight: "700",
//       color: colors.textPrimary,
//     },
//     editBtn: {
//       width: 40,
//       height: 40,
//       borderRadius: 20,
//       backgroundColor: colors.surface,
//       justifyContent: "center",
//       alignItems: "center",
//       borderWidth: 1,
//       borderColor: colors.border,
//     },
//     heroCard: {
//       marginHorizontal: Spacing.base,
//       borderRadius: 24,
//       overflow: "hidden",
//       alignItems: "center",
//       padding: 32,
//       marginBottom: 16,
//       borderWidth: 1,
//       borderColor: colors.border,
//     },
//     avatarWrap: { position: "relative", marginBottom: 16 },
//     avatar: {
//       width: 100,
//       height: 100,
//       borderRadius: 50,
//       borderWidth: 3,
//       borderColor: colors.tabActive,
//     },
//     avatarFallback: {
//       width: 100,
//       height: 100,
//       borderRadius: 50,
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     avatarInitials: { fontSize: 36, fontWeight: "800", color: "#fff" },
//     onlineIndicator: {
//       position: "absolute",
//       bottom: 4,
//       right: 4,
//       width: 16,
//       height: 16,
//       borderRadius: 8,
//       borderWidth: 3,
//       borderColor: colors.background,
//     },
//     name: {
//       fontSize: 24,
//       fontWeight: "800",
//       color: colors.textPrimary,
//       marginBottom: 4,
//     },
//     onlineText: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
//     bio: {
//       fontSize: 14,
//       color: colors.textSecondary,
//       textAlign: "center",
//       lineHeight: 22,
//     },
//     section: {
//       marginHorizontal: Spacing.base,
//       backgroundColor: colors.surface,
//       borderRadius: 16,
//       borderWidth: 1,
//       borderColor: colors.border,
//       overflow: "hidden",
//       marginBottom: 16,
//     },
//     infoRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       padding: 16,
//       gap: 14,
//     },
//     infoIcon: {
//       width: 38,
//       height: 38,
//       borderRadius: 12,
//       backgroundColor: colors.surfaceElevated,
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     infoLabel: { fontSize: 12, color: colors.textMuted, fontWeight: "500" },
//     infoValue: {
//       fontSize: 15,
//       color: colors.textPrimary,
//       fontWeight: "600",
//       marginTop: 1,
//     },
//     divider: { height: 1, backgroundColor: colors.divider, marginLeft: 68 },
//     actionsRow: {
//       flexDirection: "row",
//       paddingHorizontal: Spacing.base,
//       gap: 10,
//     },
//     actionBtn: { flex: 1, borderRadius: 14, overflow: "hidden" },
//     actionGradient: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: 8,
//       paddingVertical: 14,
//     },
//     actionBtnSecondary: {
//       flex: 1,
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: 6,
//       backgroundColor: colors.surface,
//       borderRadius: 14,
//       paddingVertical: 14,
//       borderWidth: 1,
//       borderColor: colors.border,
//     },
//     actionText: { color: colors.textPrimary, fontSize: 14, fontWeight: "700" },
//     modalOverlay: {
//       flex: 1,
//       backgroundColor: "rgba(0,0,0,0.55)",
//       justifyContent: "flex-end",
//     },
//     menuSheet: {
//       backgroundColor: colors.surface,
//       borderTopLeftRadius: 24,
//       borderTopRightRadius: 24,
//       padding: 20,
//       paddingBottom: 36,
//       borderTopWidth: 1,
//       borderColor: colors.border,
//     },
//     sheetHandle: {
//       width: 36,
//       height: 4,
//       borderRadius: 2,
//       backgroundColor: colors.surface,
//       alignSelf: "center",
//       marginBottom: 20,
//     },
//     menuRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 14,
//       paddingVertical: 14,
//       borderBottomWidth: StyleSheet.hairlineWidth,
//       borderBottomColor: colors.bubbleOther,
//     },
//     menuIcon: {
//       width: 38,
//       height: 38,
//       borderRadius: 12,
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     menuLabel: { fontSize: 15, fontWeight: "600" },
//     cancelRow: { borderBottomWidth: 0, justifyContent: "center", marginTop: 4 },
//     cancelText: {
//       fontSize: 15,
//       fontWeight: "700",
//       color: colors.textSecondary,
//     },
//   });

//   if (loading) {
//     return (
//       <View
//         style={[
//           styles.container,
//           { justifyContent: "center", alignItems: "center" },
//         ]}
//       >
//         <ActivityIndicator color={colors.primary} size="large" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: colors.background }]}
//       edges={["top"]}
//     >
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
//         </TouchableOpacity>
//         <Text style={styles.title}>Profile</Text>
//         {isMe ? (
//           <TouchableOpacity
//             style={styles.editBtn}
//             onPress={() => router.push("/profile/edit")}
//           >
//             <Ionicons name="create-outline" size={20} color={colors.primary} />
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity
//             style={styles.editBtn}
//             onPress={() => setShowMenu(true)}
//           >
//             <Ionicons
//               name="ellipsis-vertical"
//               size={20}
//               color={colors.textPrimary}
//             />
//           </TouchableOpacity>
//         )}
//       </View>

//       <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
//         {/* Hero card */}
//         <View style={styles.heroCard}>
//           <LinearGradient
//             colors={[colors.surface, colors.background]}
//             style={StyleSheet.absoluteFillObject}
//           />
//           <View style={styles.avatarWrap}>
//             {profile?.avatar ? (
//               <Image
//                 source={{ uri: profile.avatar }}
//                 style={styles.avatar}
//                 contentFit="cover"
//               />
//             ) : (
//               <LinearGradient
//                 colors={[colors.primary, colors.secondary]}
//                 style={styles.avatarFallback}
//               >
//                 <Text style={styles.avatarInitials}>{initials}</Text>
//               </LinearGradient>
//             )}
//             <View
//               style={[
//                 styles.onlineIndicator,
//                 { backgroundColor: isOnline ? colors.online : colors.offline },
//               ]}
//             />
//           </View>
//           <Text style={styles.name}>{profile?.name}</Text>
//           <Text style={styles.onlineText}>
//             {isOnline ? "Online" : "Offline"}
//           </Text>
//           <Text style={styles.bio}>
//             {profile?.bio || "Hey there! I am using LinksChat."}
//           </Text>
//         </View>

//         {/* Info rows */}
//         <View style={styles.section}>
//           {profile?.email && (
//             <View style={styles.infoRow}>
//               <View style={styles.infoIcon}>
//                 <Ionicons
//                   name="mail-outline"
//                   size={18}
//                   color={colors.primary}
//                 />
//               </View>
//               <View>
//                 <Text style={styles.infoLabel}>Email</Text>
//                 <Text style={styles.infoValue}>{profile.email}</Text>
//               </View>
//             </View>
//           )}
//           {profile?.phone && (
//             <>
//               <View style={styles.divider} />
//               <View style={styles.infoRow}>
//                 <View style={styles.infoIcon}>
//                   <Ionicons
//                     name="call-outline"
//                     size={18}
//                     color={colors.primary}
//                   />
//                 </View>
//                 <View>
//                   <Text style={styles.infoLabel}>Phone</Text>
//                   <Text style={styles.infoValue}>{profile.phone}</Text>
//                 </View>
//               </View>
//             </>
//           )}
//         </View>

//         {/* Actions */}
//         {!isMe && (
//           <View style={styles.actionsRow}>
//             <TouchableOpacity
//               style={styles.actionBtn}
//               onPress={startChat}
//               disabled={chatLoading}
//               activeOpacity={0.8}
//             >
//               <LinearGradient
//                 colors={[colors.primary, colors.primaryDark]}
//                 style={styles.actionGradient}
//               >
//                 {chatLoading ? (
//                   <ActivityIndicator color={colors.textPrimary} size="small" />
//                 ) : (
//                   <>
//                     <Ionicons
//                       name="chatbubble-outline"
//                       size={20}
//                       color={colors.textPrimary}
//                     />
//                     <Text style={styles.actionText}>Message</Text>
//                   </>
//                 )}
//               </LinearGradient>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.actionBtnSecondary}
//               onPress={() => router.push(`/call/${id}?type=audio`)}
//               activeOpacity={0.8}
//             >
//               <Ionicons name="call-outline" size={20} color={colors.primary} />
//               <Text style={[styles.actionText, { color: colors.primary }]}>
//                 Voice Call
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.actionBtnSecondary}
//               onPress={() => router.push(`/call/${id}?type=video`)}
//               activeOpacity={0.8}
//             >
//               <Ionicons
//                 name="videocam-outline"
//                 size={20}
//                 color={colors.secondary}
//               />
//               <Text style={[styles.actionText, { color: colors.secondary }]}>
//                 Video Call
//               </Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>

//       {/* Block / Report action sheet */}
//       <Modal
//         visible={showMenu}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowMenu(false)}
//       >
//         <Pressable
//           style={styles.modalOverlay}
//           onPress={() => setShowMenu(false)}
//         >
//           <Pressable style={styles.menuSheet} onPress={() => {}}>
//             <View style={styles.sheetHandle} />
//             {[
//               {
//                 icon: isBlocked ? "ban" : "ban-outline",
//                 label: isBlocked
//                   ? `Unblock ${profile?.name}`
//                   : `Block ${profile?.name}`,
//                 color: "#ff4757",
//                 onPress: handleBlock,
//               },
//               {
//                 icon: "flag-outline",
//                 label: `Report ${profile?.name}`,
//                 color: "#ffc107",
//                 onPress: handleReport,
//               },
//             ].map(({ icon, label, color, onPress }) => (
//               <TouchableOpacity
//                 key={label}
//                 style={styles.menuRow}
//                 onPress={onPress}
//                 activeOpacity={0.7}
//               >
//                 <View
//                   style={[styles.menuIcon, { backgroundColor: color + "18" }]}
//                 >
//                   <Ionicons name={icon as any} size={18} color={color} />
//                 </View>
//                 <Text style={[styles.menuLabel, { color }]}>{label}</Text>
//               </TouchableOpacity>
//             ))}
//             <TouchableOpacity
//               style={[styles.menuRow, styles.cancelRow]}
//               onPress={() => setShowMenu(false)}
//             >
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>
//           </Pressable>
//         </Pressable>
//       </Modal>
//       {/* </ScrollView> */}
//     </SafeAreaView>
//   );
// }

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as Contacts from "expo-contacts";
import { Spacing } from "../../constants";
import { useTheme } from "../../context/ThemeContext";
import { toast, useToast } from "../../context/ToastContext";
import { userApi, chatApi, privacyApi } from "../../services/api";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { addOrUpdateChat } from "../../store/slices/chatSlice";
import { User } from "../../types";

export default function ProfileViewScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: me } = useAppSelector((s) => s.auth);
  const onlineUsers = useAppSelector((s) => s.socket.onlineUsers);

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Contact resolution
  const [contactName, setContactName] = useState<string | null>(null);
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [isInContacts, setIsInContacts] = useState(false);
  const [contactResolved, setContactResolved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await userApi.getUserProfile(id);
        if (res.success) {
          setProfile(res.data.user);
          // Resolve contact name after profile loads
          await resolveContact(res.data.user);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Look up this user in device contacts by phone number ──────────────────
  const resolveContact = async (user: User) => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        setContactResolved(true);
        return;
      }

      if (!user.phone) {
        setContactResolved(true);
        return;
      }

      // Normalize the stored phone — strip non-digits for comparison
      const normalize = (p: string) => p.replace(/\D/g, "");
      const userPhone = normalize(user.phone);
      // Match on last 9 digits to handle country code variations
      const userPhoneSuffix = userPhone.slice(-9);

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      let found: Contacts.Contact | null = null;
      for (const contact of data) {
        if (!contact.phoneNumbers) continue;
        for (const pn of contact.phoneNumbers) {
          const normalized = normalize(pn.number || "");
          if (
            normalized.slice(-9) === userPhoneSuffix &&
            normalized.length >= 7
          ) {
            found = contact;
            break;
          }
        }
        if (found) break;
      }

      if (found) {
        setContactName(found.name || null);
        // Use the phone number as stored on device
        setContactPhone(found.phoneNumbers?.[0]?.number || user.phone || null);
        setIsInContacts(true);
      } else {
        setContactPhone(user.phone || null);
        setIsInContacts(false);
      }
    } catch {
      setIsInContacts(false);
    } finally {
      setContactResolved(true);
    }
  };

  const startChat = async () => {
    setChatLoading(true);
    try {
      const res = await chatApi.createPrivateChat(id);
      if (res.success) {
        dispatch(addOrUpdateChat(res.data.chat));
        router.replace(`/chat/${res.data.chat._id}`);
      }
    } catch {
    } finally {
      setChatLoading(false);
    }
  };

  const handleBlock = () => {
    Alert.alert(
      isBlocked ? "Unblock User" : "Block User",
      isBlocked
        ? `Unblock ${displayName}? They will be able to message you again.`
        : `Block ${displayName}? They won't be able to message you.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isBlocked ? "Unblock" : "Block",
          style: isBlocked ? "default" : "destructive",
          onPress: async () => {
            try {
              if (isBlocked) {
                await privacyApi.unblockUser(id);
                setIsBlocked(false);
                toast.success(`${displayName} unblocked`);
              } else {
                await privacyApi.blockUser(id);
                setIsBlocked(true);
                toast.success(`${displayName} blocked`);
              }
            } catch {
              toast.error("Action failed");
            }
            setShowMenu(false);
          },
        },
      ]
    );
  };

  const handleReport = () => {
    setShowMenu(false);
    Alert.alert(
      "Report User",
      `Report ${displayName} for inappropriate behavior?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Spam", onPress: () => submitReport("spam") },
        { text: "Harassment", onPress: () => submitReport("harassment") },
        { text: "Fake account", onPress: () => submitReport("fake_account") },
      ]
    );
  };

  const submitReport = async (reason: string) => {
    try {
      await privacyApi.reportUser(id, reason);
      toast.success("Reported. Our team will review.");
    } catch {
      toast.error("Failed to report");
    }
  };

  const isOnline = onlineUsers.includes(id);
  const isMe = id === me?._id;

  // Name to display — prefer saved contact name, fall back to profile name
  const displayName = contactName || profile?.name || "Unknown";
  // If contact name differs from profile name, show profile name as username
  const showProfileAlias =
    contactName && contactName !== profile?.name && profile?.name;

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
      backgroundColor: colors.surfaceElevated,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      flex: 1,
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    editBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroCard: {
      marginHorizontal: Spacing.base,
      borderRadius: 24,
      overflow: "hidden",
      alignItems: "center",
      padding: 32,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarWrap: { position: "relative", marginBottom: 16 },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: colors.tabActive,
    },
    avatarFallback: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarInitials: { fontSize: 36, fontWeight: "800", color: "#fff" },
    onlineIndicator: {
      position: "absolute",
      bottom: 4,
      right: 4,
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 3,
      borderColor: colors.background,
    },
    name: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 4,
      textAlign: "center",
    },
    // Profile alias shown below contact name
    profileAlias: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 6,
      textAlign: "center",
    },
    onlineText: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 12,
    },
    // "Not in contacts" badge
    notInContactsBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(255,193,7,0.1)",
      borderWidth: 1,
      borderColor: "rgba(255,193,7,0.25)",
      borderRadius: 99,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginBottom: 12,
    },
    notInContactsText: {
      fontSize: 12,
      color: "#ffc107",
      fontWeight: "600",
    },
    // "Saved contact" badge
    inContactsBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(0,212,170,0.08)",
      borderWidth: 1,
      borderColor: "rgba(0,212,170,0.2)",
      borderRadius: 99,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginBottom: 12,
    },
    inContactsText: {
      fontSize: 12,
      color: "#00d4aa",
      fontWeight: "600",
    },
    bio: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    section: {
      marginHorizontal: Spacing.base,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 14,
    },
    infoIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.surfaceElevated,
      justifyContent: "center",
      alignItems: "center",
    },
    infoLabel: { fontSize: 12, color: colors.textMuted, fontWeight: "500" },
    infoValue: {
      fontSize: 15,
      color: colors.textPrimary,
      fontWeight: "600",
      marginTop: 1,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginLeft: 68,
    },
    actionsRow: {
      flexDirection: "row",
      paddingHorizontal: Spacing.base,
      gap: 10,
    },
    actionBtn: { flex: 1, borderRadius: 14, overflow: "hidden" },
    actionGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
    },
    actionBtnSecondary: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "flex-end",
    },
    menuSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: 36,
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    sheetHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 20,
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    menuIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    menuLabel: { fontSize: 15, fontWeight: "600" },
    cancelRow: {
      borderBottomWidth: 0,
      justifyContent: "center",
      marginTop: 4,
    },
    cancelText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.textSecondary,
    },
  });

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
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      // edges={["top"]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        {isMe ? (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push("/profile/edit")}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setShowMenu(true)}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={[colors.surface, colors.background]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.avatarWrap}>
            {profile?.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.avatarFallback}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
            <View
              style={[
                styles.onlineIndicator,
                {
                  backgroundColor: isOnline ? colors.online : colors.offline,
                },
              ]}
            />
          </View>

          {/* Display name — contact name or profile name */}
          <Text style={styles.name}>{displayName}</Text>

          {/* If using contact name, show profile username below */}
          {showProfileAlias && (
            <Text style={styles.profileAlias}>@{profile?.name}</Text>
          )}

          {/* Contact status badge */}
          {!isMe &&
            contactResolved &&
            (isInContacts ? (
              <View style={styles.inContactsBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#00d4aa" />
                <Text style={styles.inContactsText}>
                  Saved in your contacts
                </Text>
              </View>
            ) : (
              <View style={styles.notInContactsBadge}>
                <Ionicons name="person-add-outline" size={13} color="#ffc107" />
                <Text style={styles.notInContactsText}>
                  Not in your contacts
                </Text>
              </View>
            ))}

          <Text style={styles.onlineText}>
            {isOnline ? "🟢 Online" : "⚫ Offline"}
          </Text>

          <Text style={styles.bio}>
            {profile?.bio || "Hey there! I am using LinksChat."}
          </Text>
        </View>

        {/* Info rows */}
        <View style={styles.section}>
          {profile?.email && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
            </View>
          )}

          {/* Phone — prefer device contact phone, fall back to profile phone */}
          {(contactPhone || profile?.phone) && (
            <>
              {profile?.email && <View style={styles.divider} />}
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="call-outline"
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>
                    {isInContacts ? "Mobile" : "Phone"}
                  </Text>
                  <Text style={styles.infoValue}>
                    {contactPhone || profile?.phone}
                  </Text>
                </View>
                {/* If not saved, show add to contacts hint */}
                {!isInContacts && !isMe && (
                  <View
                    style={{
                      backgroundColor: "rgba(255,193,7,0.1)",
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderWidth: 1,
                      borderColor: "rgba(255,193,7,0.25)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#ffc107",
                        fontWeight: "700",
                      }}
                    >
                      Unsaved
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        {/* Actions */}
        {!isMe && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={startChat}
              disabled={chatLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.actionGradient}
              >
                {chatLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={[styles.actionText, { color: "#fff" }]}>
                      Message
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => router.push(`/call/${id}?type=audio`)}
              activeOpacity={0.8}
            >
              <Ionicons name="call-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>
                Voice
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => router.push(`/call/${id}?type=video`)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="videocam-outline"
                size={20}
                color={colors.secondary}
              />
              <Text style={[styles.actionText, { color: colors.secondary }]}>
                Video
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Block / Report action sheet */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <Pressable style={styles.menuSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            {[
              {
                icon: isBlocked ? "ban" : "ban-outline",
                label: isBlocked
                  ? `Unblock ${displayName}`
                  : `Block ${displayName}`,
                color: "#ff4757",
                onPress: handleBlock,
              },
              {
                icon: "flag-outline",
                label: `Report ${displayName}`,
                color: "#ffc107",
                onPress: handleReport,
              },
            ].map(({ icon, label, color, onPress }) => (
              <TouchableOpacity
                key={label}
                style={styles.menuRow}
                onPress={onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.menuIcon, { backgroundColor: color + "18" }]}
                >
                  <Ionicons name={icon as any} size={18} color={color} />
                </View>
                <Text style={[styles.menuLabel, { color }]}>{label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.menuRow, styles.cancelRow]}
              onPress={() => setShowMenu(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
