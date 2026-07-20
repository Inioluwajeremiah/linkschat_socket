// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { useEffect, useState } from "react";
// import { useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { useTheme } from "../context/ThemeContext";
// import { useToast } from "../context/ToastContext";
// import { useAppSelector } from "../hooks/useRedux";
// import { userApi, privacyApi } from "../services/api";
// import { User } from "../types";

// export default function BlockedUsersScreen() {
//   const router = useRouter();
//   const { colors } = useTheme();
//   const toast = useToast();
//   const { user: me } = useAppSelector((s) => s.auth);
//   const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Get blocked users from profile — populate from contacts in full app
//     userApi
//       .getContacts()
//       .then(() => setLoading(false))
//       .catch(() => setLoading(false));
//     // In production: fetch /api/users/blocked endpoint
//     setLoading(false);
//   }, []);

//   const unblock = (u: User) => {
//     Alert.alert("Unblock", `Unblock ${u.name}?`, [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Unblock",
//         onPress: async () => {
//           try {
//             await privacyApi.unblockUser(u._id);
//             setBlockedUsers((prev) => prev.filter((b) => b._id !== u._id));
//             toast.success(`${u.name} unblocked`);
//           } catch {
//             toast.error("Failed to unblock");
//           }
//         },
//       },
//     ]);
//   };

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
//           Blocked Users
//         </Text>
//       </View>

//       {loading ? (
//         <View style={styles.centered}>
//           <ActivityIndicator color="#00d4aa" />
//         </View>
//       ) : (
//         <FlatList
//           data={blockedUsers}
//           keyExtractor={(u) => u._id}
//           contentContainerStyle={[
//             styles.list,
//             blockedUsers.length === 0 && styles.listEmpty,
//           ]}
//           ListEmptyComponent={
//             <View style={styles.empty}>
//               <Ionicons name="ban-outline" size={56} color={colors.textMuted} />
//               <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
//                 No blocked users
//               </Text>
//               <Text style={[styles.emptySub, { color: colors.textMuted }]}>
//                 People you block will appear here
//               </Text>
//             </View>
//           }
//           renderItem={({ item }) => {
//             const initials = item.name
//               .split(" ")
//               .map((w) => w[0])
//               .join("")
//               .slice(0, 2)
//               .toUpperCase();
//             return (
//               <View
//                 style={[
//                   styles.userRow,
//                   {
//                     backgroundColor: colors.surface,
//                     borderColor: colors.border,
//                   },
//                 ]}
//               >
//                 {item.avatar ? (
//                   <Image
//                     source={{ uri: item.avatar }}
//                     style={styles.avatar}
//                     contentFit="cover"
//                   />
//                 ) : (
//                   <LinearGradient
//                     colors={["#555577", "#333355"]}
//                     style={styles.avatarFb}
//                   >
//                     <Text style={styles.avatarInitials}>{initials}</Text>
//                   </LinearGradient>
//                 )}
//                 <View style={styles.userInfo}>
//                   <Text
//                     style={[styles.userName, { color: colors.textPrimary }]}
//                   >
//                     {item.name}
//                   </Text>
//                   <Text style={[styles.userEmail, { color: colors.textMuted }]}>
//                     {item.email}
//                   </Text>
//                 </View>
//                 <TouchableOpacity
//                   style={[styles.unblockBtn, { borderColor: "#00d4aa" }]}
//                   onPress={() => unblock(item)}
//                 >
//                   <Text style={styles.unblockText}>Unblock</Text>
//                 </TouchableOpacity>
//               </View>
//             );
//           }}
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
//   title: { fontSize: 20, fontWeight: "800" },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
//   list: { padding: 16, gap: 10, paddingBottom: 100 },
//   listEmpty: { flexGrow: 1 },
//   empty: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 12,
//     paddingTop: 80,
//   },
//   emptyTitle: { fontSize: 18, fontWeight: "700" },
//   emptySub: { fontSize: 13, textAlign: "center" },
//   userRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: 14,
//     padding: 12,
//     gap: 12,
//     borderWidth: 1,
//   },
//   avatar: { width: 46, height: 46, borderRadius: 23 },
//   avatarFb: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarInitials: { color: "#fff", fontWeight: "700", fontSize: 15 },
//   userInfo: { flex: 1 },
//   userName: { fontSize: 15, fontWeight: "600" },
//   userEmail: { fontSize: 12 },
//   unblockBtn: {
//     borderWidth: 1.5,
//     borderRadius: 99,
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//   },
//   unblockText: { color: "#00d4aa", fontSize: 13, fontWeight: "700" },
// });

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { blockedUsersApi, privacyApi } from "../services/api";
import { User } from "../types";

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blockedUsersApi
      .getBlockedUsers()
      .then((res) => {
        if (res.success) setUsers(res.data.users);
      })
      .catch(() => toast.error("Failed to load blocked users"))
      .finally(() => setLoading(false));
  }, []);

  const handleUnblock = (u: User) => {
    Alert.alert(
      "Unblock User",
      `Unblock ${u.name}? They will be able to message you again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          onPress: async () => {
            try {
              await privacyApi.unblockUser(u._id);
              setUsers((prev) => prev.filter((b) => b._id !== u._id));
              toast.success(`${u.name} unblocked`);
            } catch {
              toast.error("Failed to unblock");
            }
          },
        },
      ]
    );
  };

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
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Blocked Users
          </Text>
          {users.length > 0 && (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {users.length} blocked
            </Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#00d4aa" size="large" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u._id}
          contentContainerStyle={[
            styles.list,
            users.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            users.length > 0 ? (
              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={colors.textMuted}
                />
                <Text style={[styles.infoText, { color: colors.textMuted }]}>
                  Blocked users cannot message you and won't see your status or
                  last seen.
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View
                style={[
                  styles.emptyIconWrap,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Ionicons
                  name="ban-outline"
                  size={44}
                  color={colors.textMuted}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No blocked users
              </Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                Block users from their profile or from the chat header menu.
              </Text>
            </View>
          }
          renderItem={({ item: u }) => {
            const initials = u.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <View
                style={[
                  styles.userRow,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.avatarWrap}>
                  {u.avatar ? (
                    <Image
                      source={{ uri: u.avatar }}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={["#333355", "#222240"]}
                      style={styles.avatarFb}
                    >
                      <Text style={styles.avatarInitials}>{initials}</Text>
                    </LinearGradient>
                  )}
                  {/* Blocked badge */}
                  <View style={styles.blockedBadge}>
                    <Ionicons name="ban" size={10} color="#fff" />
                  </View>
                </View>

                <View style={styles.userInfo}>
                  <Text
                    style={[styles.userName, { color: colors.textPrimary }]}
                  >
                    {u.name}
                  </Text>
                  <Text style={[styles.userSub, { color: colors.textMuted }]}>
                    {u.phone || u.email}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.unblockBtn, { borderColor: "#00d4aa" }]}
                  onPress={() => handleUnblock(u)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.unblockText}>Unblock</Text>
                </TouchableOpacity>
              </View>
            );
          }}
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
  subtitle: { fontSize: 12, marginTop: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  listEmpty: { flexGrow: 1 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  infoText: { fontSize: 12, flex: 1, lineHeight: 18 },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  emptySub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
  },
  avatarWrap: { position: "relative" },
  avatar: { width: 48, height: 48, borderRadius: 24, opacity: 0.6 },
  avatarFb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    color: "rgba(255,255,255,0.5)",
    fontWeight: "700",
    fontSize: 15,
  },
  blockedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ff4757",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#12121f",
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "600" },
  userSub: { fontSize: 12, marginTop: 2 },
  unblockBtn: {
    borderWidth: 1.5,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  unblockText: { color: "#00d4aa", fontSize: 13, fontWeight: "700" },
});
