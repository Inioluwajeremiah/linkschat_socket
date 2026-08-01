// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   Pressable,
//   ActivityIndicator,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { useAppDispatch } from "../hooks/useRedux";
// import { useStartCall } from "../hooks/useStartCall";
// import { chatApi } from "../services/api";
// import { addOrUpdateChat } from "../store/slices/chatSlice";
// import { useToast } from "../context/ToastContext";

// interface QuickActionUser {
//   _id: string;
//   name: string;
//   avatar?: string;
// }

// interface Props {
//   user: QuickActionUser | null;
//   onClose: () => void;
//   colors: any;
// }

// // Drop this into any screen that renders a list of users — contacts,
// // search results, the chat list, group member lists — and trigger it via
// // onLongPress={() => setActionSheetUser(user)}. Gives Message/Voice/Video/
// // Profile from anywhere without needing to first open a chat or profile.
// export default function UserActionSheet({ user, onClose, colors }: Props) {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const toast = useToast();
//   const { startCall, callLoading } = useStartCall();

//   if (!user) return null;

//   const initials = user.name
//     .split(" ")
//     .map((w) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   const handleMessage = async () => {
//     try {
//       const res = await chatApi.createPrivateChat(user._id);
//       if (res.success) {
//         dispatch(addOrUpdateChat(res.data.chat));
//         onClose();
//         router.push(`/chat/${res.data.chat._id}`);
//       }
//     } catch {
//       toast.error("Failed to open chat");
//     }
//   };

//   const handleCall = async (type: "audio" | "video") => {
//     await startCall(user._id, type);
//     onClose();
//   };

//   const actions = [
//     {
//       icon: "chatbubble-ellipses-outline" as const,
//       label: "Message",
//       color: "#00d4aa",
//       bg: "rgba(0,212,170,0.1)",
//       onPress: handleMessage,
//       loading: false,
//     },
//     {
//       icon: "call-outline" as const,
//       label: "Voice Call",
//       color: "#5b8dee",
//       bg: "rgba(91,141,238,0.1)",
//       onPress: () => handleCall("audio"),
//       loading: callLoading === "audio",
//     },
//     {
//       icon: "videocam-outline" as const,
//       label: "Video Call",
//       color: "#ff6b9d",
//       bg: "rgba(255,107,157,0.1)",
//       onPress: () => handleCall("video"),
//       loading: callLoading === "video",
//     },
//     {
//       icon: "person-outline" as const,
//       label: "View Profile",
//       color: "#ffc107",
//       bg: "rgba(255,193,7,0.1)",
//       onPress: () => {
//         onClose();
//         router.push(`/profile/${user._id}`);
//       },
//       loading: false,
//     },
//   ];

//   return (
//     <Modal visible transparent animationType="fade" onRequestClose={onClose}>
//       <Pressable style={styles.overlay} onPress={onClose}>
//         <Pressable
//           style={[styles.sheet, { backgroundColor: colors.surface }]}
//           onPress={() => {}}
//         >
//           <View style={[styles.handle, { backgroundColor: colors.border }]} />

//           <View style={styles.header}>
//             {user.avatar ? (
//               <Image
//                 source={{ uri: user.avatar }}
//                 style={styles.avatar}
//                 contentFit="cover"
//               />
//             ) : (
//               <LinearGradient
//                 colors={["#00d4aa", "#5b8dee"]}
//                 style={styles.avatarFallback}
//               >
//                 <Text style={styles.avatarInitials}>{initials}</Text>
//               </LinearGradient>
//             )}
//             <Text style={[styles.name, { color: colors.textPrimary }]}>
//               {user.name}
//             </Text>
//           </View>

//           {actions.map((action, i) => (
//             <TouchableOpacity
//               key={action.label}
//               style={[
//                 styles.row,
//                 i < actions.length - 1 && {
//                   borderBottomWidth: StyleSheet.hairlineWidth,
//                   borderBottomColor: colors.border,
//                 },
//               ]}
//               onPress={action.onPress}
//               disabled={callLoading !== null}
//               activeOpacity={0.7}
//             >
//               <View style={[styles.icon, { backgroundColor: action.bg }]}>
//                 {action.loading ? (
//                   <ActivityIndicator size="small" color={action.color} />
//                 ) : (
//                   <Ionicons name={action.icon} size={19} color={action.color} />
//                 )}
//               </View>
//               <Text style={[styles.label, { color: colors.textPrimary }]}>
//                 {action.label}
//               </Text>
//             </TouchableOpacity>
//           ))}

//           <TouchableOpacity style={styles.cancelRow} onPress={onClose}>
//             <Text style={[styles.cancelText, { color: colors.textMuted }]}>
//               Cancel
//             </Text>
//           </TouchableOpacity>
//         </Pressable>
//       </Pressable>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.55)",
//     justifyContent: "flex-end",
//   },
//   sheet: {
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//     paddingBottom: 36,
//   },
//   handle: {
//     width: 36,
//     height: 4,
//     borderRadius: 2,
//     alignSelf: "center",
//     marginBottom: 16,
//   },
//   header: { alignItems: "center", gap: 10, marginBottom: 14 },
//   avatar: { width: 64, height: 64, borderRadius: 32 },
//   avatarFallback: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarInitials: { color: "#fff", fontSize: 22, fontWeight: "800" },
//   name: { fontSize: 17, fontWeight: "700" },
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 14,
//     paddingVertical: 14,
//   },
//   icon: {
//     width: 38,
//     height: 38,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   label: { fontSize: 15, fontWeight: "600" },
//   cancelRow: { alignItems: "center", paddingVertical: 16, marginTop: 4 },
//   cancelText: { fontSize: 15, fontWeight: "700" },
// });

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useAppDispatch } from "../hooks/useRedux";
import { useStartCall } from "../hooks/useStartCall";
import { chatApi, privacyApi } from "../services/api";
import { addOrUpdateChat } from "../store/slices/chatSlice";
// import { addBlocked, removeBlocked } from "../store/slices/blockedSlice";
import { useToast } from "../context/ToastContext";
import { useIsBlocked } from "@/hooks/useIsBlockedUser";
import { addBlocked, removeBlocked } from "@/store/slices/blockedUserSlice";
import { IconButtonProps } from "@expo/vector-icons/build/createIconSet";

interface QuickActionUser {
  _id: string;
  name: string;
  avatar?: string;
}

interface Props {
  user: QuickActionUser | null;
  onClose: () => void;
  colors: any;
}

// Drop this into any screen that renders a list of users — contacts,
// search results, the chat list, group member lists — and trigger it via
// onLongPress={() => setActionSheetUser(user)}. Gives Message/Voice/Video/
// Profile from anywhere without needing to first open a chat or profile.
export default function UserActionSheet({ user, onClose, colors }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { startCall, callLoading } = useStartCall();
  const isBlocked = useIsBlocked(user?._id);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleMessage = async () => {
    if (isBlocked) {
      toast.error("Unblock this contact to message them");
      return;
    }
    try {
      const res = await chatApi.createPrivateChat(user._id);
      if (res.success) {
        dispatch(addOrUpdateChat(res.data.chat));
        onClose();
        router.push(`/chat/${res.data.chat._id}`);
      }
    } catch {
      toast.error("Failed to open chat");
    }
  };

  const handleCall = async (type: "audio" | "video") => {
    if (isBlocked) {
      toast.error("Unblock this contact to call them");
      return;
    }
    await startCall(user._id, type);
    onClose();
  };

  const handleToggleBlock = async () => {
    try {
      if (isBlocked) {
        await privacyApi.unblockUser(user._id);
        dispatch(removeBlocked(user._id));
        toast.success(`${user.name} unblocked`);
      } else {
        await privacyApi.blockUser(user._id);
        dispatch(addBlocked(user._id));
        toast.success(`${user.name} blocked`);
      }
      onClose();
    } catch {
      toast.error("Action failed");
    }
  };

  const actions = [
    {
      icon: "chatbubble-ellipses-outline" as const,
      label: "Message",
      color: isBlocked ? colors.textMuted : "#00d4aa",
      bg: isBlocked ? colors.surfaceElevated : "rgba(0,212,170,0.1)",
      onPress: handleMessage,
      loading: false,
      disabled: isBlocked,
    },
    {
      icon: "call-outline" as const,
      label: "Voice Call",
      color: isBlocked ? colors.textMuted : "#5b8dee",
      bg: isBlocked ? colors.surfaceElevated : "rgba(91,141,238,0.1)",
      onPress: () => handleCall("audio"),
      loading: callLoading === "audio",
      disabled: isBlocked,
    },
    {
      icon: "videocam-outline" as const,
      label: "Video Call",
      color: isBlocked ? colors.textMuted : "#ff6b9d",
      bg: isBlocked ? colors.surfaceElevated : "rgba(255,107,157,0.1)",
      onPress: () => handleCall("video"),
      loading: callLoading === "video",
      disabled: isBlocked,
    },
    {
      icon: "person-outline" as const,
      label: "View Profile",
      color: "#ffc107",
      bg: "rgba(255,193,7,0.1)",
      onPress: () => {
        onClose();
        router.push(`/profile/${user._id}`);
      },
      loading: false,
      disabled: false,
    },
    {
      icon: (isBlocked ? "checkmark-circle-outline" : "ban-outline") as any,
      label: isBlocked ? "Unblock" : "Block",
      color: "#ff4757",
      bg: "rgba(255,71,87,0.1)",
      onPress: handleToggleBlock,
      loading: false,
      disabled: false,
    },
  ];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.surface }]}
          onPress={() => {}}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <LinearGradient
                colors={["#00d4aa", "#5b8dee"]}
                style={styles.avatarFallback}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
            <Text style={[styles.name, { color: colors.textPrimary }]}>
              {user.name}
            </Text>
          </View>

          {actions.map((action, i) => (
            <TouchableOpacity
              key={action.label}
              style={[
                styles.row,
                i < actions.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
              onPress={action.onPress}
              disabled={callLoading !== null || action.disabled}
              activeOpacity={0.7}
            >
              <View style={[styles.icon, { backgroundColor: action.bg }]}>
                {action.loading ? (
                  <ActivityIndicator size="small" color={action.color} />
                ) : (
                  <Ionicons name={action.icon} size={19} color={action.color} />
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: action.disabled
                      ? colors.textMuted
                      : colors.textPrimary,
                  },
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.cancelRow} onPress={onClose}>
            <Text style={[styles.cancelText, { color: colors.textMuted }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: { alignItems: "center", gap: 10, marginBottom: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: { color: "#fff", fontSize: 22, fontWeight: "800" },
  name: { fontSize: 17, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  label: { fontSize: 15, fontWeight: "600" },
  cancelRow: { alignItems: "center", paddingVertical: 16, marginTop: 4 },
  cancelText: { fontSize: 15, fontWeight: "700" },
});
