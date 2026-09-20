// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   RefreshControl,
//   ActivityIndicator,
// } from "react-native";
// import { memo, useCallback, useEffect, useRef, useState } from "react";
// import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { Colors, Spacing } from "../../constants";
// import { useTheme } from "../../context/ThemeContext";
// import { useToast } from "../../context/ToastContext";
// import { callApi } from "../../services/api";
// import { CallHistory, User } from "../../types";
// import { useAppSelector } from "../../hooks/useRedux";
// import { useStartCall } from "../../hooks/useStartCall";
// import { formatDistanceToNow } from "../../utils/date";
// import { useContactNameResolver } from "@/hooks/useContactName";
// import { socketService } from "../../services/socket";
// import CallDetailsModal, { OngoingInfo } from "@/components/CallDetailsModal"; // adjust path to wherever you place this file relative to CallsScreen

// /** "Missed"/"No Answer"/"Declined"/"Ongoing"/"Incoming"/"Outgoing" per the
//  * four real statuses in the CallHistory schema — distinguishes rejected
//  * from missed instead of collapsing both into "Incoming". */
// function getCallStatusLabel(
//   status: CallHistory["status"],
//   isInitiator: boolean
// ): string {
//   switch (status) {
//     case "missed":
//       return isInitiator ? "No Answer" : "Missed";
//     case "rejected":
//       return "Declined";
//     case "ongoing":
//       return "Ongoing";
//     case "completed":
//     default:
//       return isInitiator ? "Outgoing" : "Incoming";
//   }
// }

// function getCallStatusColor(status: CallHistory["status"]): string {
//   if (status === "missed" || status === "rejected") return Colors.error;
//   return Colors.success;
// }

// const formatDuration = (secs?: number) => {
//   if (!secs) return "";
//   const m = Math.floor(secs / 60);
//   const s = secs % 60;
//   return ` · ${m}:${s.toString().padStart(2, "0")}`;
// };

// // CallHistory has no isGroup field (confirmed against the actual type) —
// // this derives it from participant count instead. A real 1:1 call should
// // have exactly one other participant. Swap this out if isGroup ever gets
// // added to the schema; participants.length is a proxy, not a guarantee.
// function deriveIsGroup(call: CallHistory): boolean {
//   return (call.participants?.length ?? 0) > 1;
// }

// type CallItemProps = {
//   call: CallHistory;
//   myId: string;
//   onPress: (call: CallHistory) => void;
// };

// const CallItem = memo(function CallItem({
//   call,
//   myId,
//   onPress,
// }: CallItemProps) {
//   const { colors } = useTheme();
//   const router = useRouter();
//   const { startCall } = useStartCall();
//   const resolveContact = useContactNameResolver();

//   const chatId = call.chatId;
//   const isGroup = deriveIsGroup(call);

//   const ongoingCall = useAppSelector((s) =>
//     chatId ? s.ongoingCalls.byChatId[chatId] : undefined
//   );
//   const myActiveCall = useAppSelector((s) => s.myCall.active);
//   const alreadyJoined =
//     !!ongoingCall && myActiveCall?.callId === ongoingCall.callId;

//   // initiator/participants can be null if the referenced account was
//   // deleted (a dangling Mongoose ref populates as null) — guard every
//   // access instead of assuming a populated User is always present.
//   const initiator = call.initiator as User | null;
//   const isInitiator = initiator?._id === myId;
//   const other: User | null | undefined = isInitiator
//     ? call.participants.find((p) => p && p._id !== myId) || call.participants[0]
//     : initiator;

//   const { displayName: displayOtherName } = resolveContact(
//     other?.phone,
//     other?.name
//   );
//   const groupLabel = isGroup
//     ? `Group call · ${call.participants.length} people`
//     : null;
//   const initials = (displayOtherName || "?")
//     .split(" ")
//     .map((w) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   const statusLabel = getCallStatusLabel(call.status, isInitiator);
//   const statusColor = getCallStatusColor(call.status);
//   const canCallBack = !!other?._id;

//   const handleCallBack = (e: any) => {
//     e.stopPropagation();
//     if (!other?._id) return;
//     startCall(other._id, call.type);
//   };

//   const handleJoinOngoing = (e: any) => {
//     e.stopPropagation();
//     if (!chatId || !ongoingCall) return;
//     if (!alreadyJoined) {
//       socketService
//         .getSocket()
//         ?.emit("call:join-ongoing", { callId: ongoingCall.callId });
//     }
//     router.push({
//       pathname: "/call/[id]",
//       params: {
//         id: chatId,
//         type: ongoingCall.type,
//         callId: ongoingCall.callId,
//         isIncoming: "1",
//       },
//     });
//   };

//   return (
//     <TouchableOpacity
//       style={styles.callItem}
//       onPress={() => onPress(call)}
//       activeOpacity={0.7}
//     >
//       <View style={styles.avatarWrap}>
//         {other?.avatar ? (
//           <Image
//             source={{ uri: other.avatar }}
//             style={styles.avatar}
//             contentFit="cover"
//           />
//         ) : (
//           <LinearGradient
//             colors={[colors.surfaceHigh, colors.surface]}
//             style={styles.avatarFallback}
//           >
//             <Text style={[styles.initials, { color: colors.textSecondary }]}>
//               {initials}
//             </Text>
//           </LinearGradient>
//         )}
//         <View
//           style={[
//             styles.callTypeBadge,
//             {
//               backgroundColor:
//                 call.type === "video" ? colors.secondary : colors.primary,
//               borderColor: colors.border,
//             },
//           ]}
//         >
//           <Ionicons
//             name={call.type === "video" ? "videocam" : "call"}
//             size={9}
//             color={colors.surface}
//           />
//         </View>
//         {isGroup && (
//           <View
//             style={[styles.groupCorner, { borderColor: colors.background }]}
//           >
//             <Ionicons name="people" size={9} color="#fff" />
//           </View>
//         )}
//       </View>

//       <View style={styles.callInfo}>
//         <Text
//           style={[styles.callerName, { color: colors.textPrimary }]}
//           numberOfLines={1}
//         >
//           {isGroup
//             ? call.initiator.name
//             : !isGroup
//             ? displayOtherName
//             : "Unknown"}
//         </Text>
//         <View style={styles.callMeta}>
//           <Ionicons
//             name={isInitiator ? "arrow-up" : "arrow-down"}
//             size={12}
//             color={statusColor}
//           />
//           <Text style={[styles.callStatus, { color: statusColor }]}>
//             {statusLabel}
//             {formatDuration(call.duration)}
//           </Text>
//           <Text style={[styles.callTime, { color: colors.textMuted }]}>
//             {" "}
//             · {formatDistanceToNow(new Date(call.createdAt))}
//           </Text>
//         </View>
//         {groupLabel && (
//           <Text style={[styles.groupLabel, { color: colors.textMuted }]}>
//             {groupLabel}
//           </Text>
//         )}
//       </View>

//       {ongoingCall ? (
//         <TouchableOpacity
//           style={styles.ongoingBtnWrap}
//           onPress={handleJoinOngoing}
//           activeOpacity={0.85}
//           accessibilityRole="button"
//           accessibilityLabel={
//             alreadyJoined ? "Return to ongoing call" : "Join ongoing call"
//           }
//         >
//           <LinearGradient
//             colors={
//               ongoingCall.type === "video"
//                 ? ["#5b8dee", "#3a6bc9"]
//                 : ["#00d4aa", "#00b090"]
//             }
//             style={styles.ongoingBtn}
//           >
//             <Text style={styles.ongoingBtnText}>
//               {alreadyJoined ? "Return" : "Join"}
//             </Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       ) : (
//         <TouchableOpacity
//           style={[
//             styles.callBackBtn,
//             { borderColor: colors.border, backgroundColor: colors.surface },
//             !canCallBack && styles.callBackBtnDisabled,
//           ]}
//           onPress={handleCallBack}
//           disabled={!canCallBack}
//           accessibilityRole="button"
//           accessibilityLabel={
//             canCallBack
//               ? `Call ${displayOtherName || "back"}`
//               : "Caller unavailable"
//           }
//           hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//         >
//           <Ionicons
//             name={call.type === "video" ? "videocam-outline" : "call-outline"}
//             size={20}
//             color={canCallBack ? colors.primary : colors.textMuted}
//           />
//         </TouchableOpacity>
//       )}
//     </TouchableOpacity>
//   );
// });

// // One card in the top "Ongoing calls" section — sourced directly from
// // ongoingCalls.byChatId, independent of call history entirely, so a call
// // with zero prior history in that chat still shows up immediately.
// function OngoingCallCard({ chatId }: { chatId: string }) {
//   const { colors } = useTheme();
//   const router = useRouter();
//   const call = useAppSelector((s) => s.ongoingCalls.byChatId[chatId]);
//   const myActiveCall = useAppSelector((s) => s.myCall.active);
//   // Chat name/avatar aren't in the ongoing-call payload at all — looked
//   // up locally against the already-loaded chat list instead of adding a
//   // new backend field for this.
//   const chat = useAppSelector((s) =>
//     s.chat.chats.find((c) => c._id === chatId)
//   );

//   if (!call) return null;
//   const alreadyJoined = myActiveCall?.callId === call.callId;
//   const initials = (chat?.name || "Group")
//     .split(" ")
//     .map((w) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   const handlePress = () => {
//     if (!alreadyJoined) {
//       socketService
//         .getSocket()
//         ?.emit("call:join-ongoing", { callId: call.callId });
//     }
//     router.push({
//       pathname: "/call/[id]",
//       params: {
//         id: chatId,
//         type: call.type,
//         callId: call.callId,
//         isIncoming: "1",
//       },
//     });
//   };

//   return (
//     <TouchableOpacity
//       style={[
//         styles.ongoingCard,
//         { backgroundColor: colors.surface, borderColor: colors.border },
//       ]}
//       onPress={handlePress}
//       activeOpacity={0.85}
//     >
//       {chat?.avatar ? (
//         <Image
//           source={{ uri: chat.avatar }}
//           style={styles.ongoingCardAvatar}
//           contentFit="cover"
//         />
//       ) : (
//         <LinearGradient
//           colors={["#00d4aa", "#5b8dee"]}
//           style={styles.ongoingCardAvatarFb}
//         >
//           <Text style={styles.ongoingCardInitials}>{initials}</Text>
//         </LinearGradient>
//       )}
//       <View style={styles.ongoingCardInfo}>
//         <Text
//           style={[styles.ongoingCardName, { color: colors.textPrimary }]}
//           numberOfLines={1}
//         >
//           {chat?.name || "Group"}
//         </Text>
//         <Text style={[styles.ongoingCardMeta, { color: colors.textMuted }]}>
//           {call.type === "video" ? "Video call" : "Voice call"}
//           {call.joinedCount > 0 ? ` · ${call.joinedCount} in call` : ""}
//         </Text>
//       </View>
//       <View
//         style={[
//           styles.ongoingCardBtn,
//           {
//             backgroundColor: alreadyJoined
//               ? colors.surfaceHigh
//               : call.type === "video"
//               ? "#5b8dee"
//               : "#00d4aa",
//           },
//         ]}
//       >
//         <Text
//           style={[
//             styles.ongoingCardBtnText,
//             { color: alreadyJoined ? colors.textPrimary : "#fff" },
//           ]}
//         >
//           {alreadyJoined ? "Return" : "Join"}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// }

// export default function CallsScreen() {
//   const { colors } = useTheme();
//   const router = useRouter();
//   const { error: showError } = useToast();
//   const { user } = useAppSelector((s) => s.auth);
//   const ongoingCallsByChatId = useAppSelector((s) => s.ongoingCalls.byChatId);
//   const [calls, setCalls] = useState<CallHistory[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedCall, setSelectedCall] = useState<CallHistory | null>(null);

//   const isMountedRef = useRef(true);
//   useEffect(() => {
//     return () => {
//       isMountedRef.current = false;
//     };
//   }, []);

//   const loadCalls = useCallback(async () => {
//     try {
//       const res = await callApi.getCallHistory();
//       if (!isMountedRef.current) return;
//       if (res.success) {
//         console.log("loadCalls ==>>> ", res.data.calls[0]);

//         setCalls(res.data.calls);
//       } else {
//         showError("Couldn't load calls", "Try again in a moment.");
//       }
//     } catch {
//       if (isMountedRef.current) {
//         showError("Couldn't load calls", "Try again in a moment.");
//       }
//     } finally {
//       if (isMountedRef.current) setLoading(false);
//     }
//   }, [showError]);

//   useEffect(() => {
//     loadCalls();
//   }, [loadCalls]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadCalls();
//     if (isMountedRef.current) setRefreshing(false);
//   };

//   const keyExtractor = useCallback((c: CallHistory) => c._id, []);

//   // ── Modal wiring ────────────────────────────────────────────────────────
//   const { startCall } = useStartCall();
//   const myActiveCall = useAppSelector((s) => s.myCall.active);

//   const selectedChatId = selectedCall?.chatId;
//   const selectedOngoing = useAppSelector((s) =>
//     selectedChatId ? s.ongoingCalls.byChatId[selectedChatId] : undefined
//   );
//   const selectedOngoingInfo: OngoingInfo | null = selectedOngoing
//     ? {
//         alreadyJoined: myActiveCall?.callId === selectedOngoing.callId,
//         joinedCount: selectedOngoing.joinedCount,
//       }
//     : null;

//   const handleCallBackFromModal = () => {
//     if (!selectedCall) return;
//     const initiator = selectedCall.initiator as User | null;
//     const isInitiator = initiator?._id === user?._id;
//     const other = isInitiator
//       ? selectedCall.participants.find((p) => p && p._id !== user?._id) ||
//         selectedCall.participants[0]
//       : initiator;
//     if (!other?._id) return;
//     setSelectedCall(null);
//     startCall(other._id, selectedCall.type);
//   };

//   const handleJoinFromModal = () => {
//     if (!selectedCall?.chatId || !selectedOngoing) return;
//     const alreadyJoined = myActiveCall?.callId === selectedOngoing.callId;
//     if (!alreadyJoined) {
//       socketService
//         .getSocket()
//         ?.emit("call:join-ongoing", { callId: selectedOngoing.callId });
//     }
//     const chatId = selectedCall.chatId;
//     const type = selectedOngoing.type;
//     const callId = selectedOngoing.callId;
//     setSelectedCall(null);
//     router.push({
//       pathname: "/call/[id]",
//       params: { id: chatId, type, callId, isIncoming: "1" },
//     });
//   };

//   const ongoingChatIds = Object.keys(ongoingCallsByChatId);

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <View style={styles.header}>
//         <Text style={[styles.title, { color: colors.textPrimary }]}>Calls</Text>
//         <TouchableOpacity
//           style={[
//             styles.newCallBtn,
//             { borderColor: colors.border, backgroundColor: colors.surface },
//           ]}
//           onPress={() => router.push("/phone-contacts")}
//           accessibilityRole="button"
//           accessibilityLabel="Start a new call"
//           hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//         >
//           <Ionicons name="call-outline" size={20} color={colors.primary} />
//         </TouchableOpacity>
//       </View>

//       {loading ? (
//         <View style={styles.centered}>
//           <ActivityIndicator color={colors.primary} size="large" />
//         </View>
//       ) : (
//         <FlatList
//           data={calls}
//           keyExtractor={keyExtractor}
//           renderItem={({ item }) => (
//             <CallItem
//               call={item}
//               myId={user?._id || ""}
//               onPress={setSelectedCall}
//             />
//           )}
//           ListHeaderComponent={
//             ongoingChatIds.length > 0 ? (
//               <View style={styles.ongoingSection}>
//                 <Text
//                   style={[
//                     styles.ongoingSectionLabel,
//                     { color: colors.textMuted },
//                   ]}
//                 >
//                   ONGOING {ongoingChatIds.length > 1 ? "CALLS" : "CALL"}
//                 </Text>
//                 {ongoingChatIds.map((chatId) => (
//                   <OngoingCallCard key={chatId} chatId={chatId} />
//                 ))}
//               </View>
//             ) : null
//           }
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor={colors.primary}
//             />
//           }
//           contentContainerStyle={[
//             styles.list,
//             calls.length === 0 &&
//               ongoingChatIds.length === 0 &&
//               styles.listEmpty,
//           ]}
//           ListEmptyComponent={
//             ongoingChatIds.length === 0 ? (
//               <View style={styles.empty}>
//                 <Ionicons
//                   name="call-outline"
//                   size={60}
//                   color={colors.textMuted}
//                 />
//                 <Text
//                   style={[styles.emptyTitle, { color: colors.textPrimary }]}
//                 >
//                   No call history
//                 </Text>
//                 <Text
//                   style={[styles.emptySubtitle, { color: colors.textMuted }]}
//                 >
//                   Your calls will appear here
//                 </Text>
//               </View>
//             ) : null
//           }
//           showsVerticalScrollIndicator={false}
//         />
//       )}

//       <CallDetailsModal
//         visible={!!selectedCall}
//         call={selectedCall}
//         myId={user?._id || ""}
//         isGroup={selectedCall ? deriveIsGroup(selectedCall) : false}
//         ongoingInfo={selectedOngoingInfo}
//         onClose={() => setSelectedCall(null)}
//         onCallBack={handleCallBackFromModal}
//         onJoinOngoing={handleJoinFromModal}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: Spacing.base,
//     paddingVertical: Spacing.md,
//   },
//   title: { fontSize: 28, fontWeight: "800" },
//   newCallBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   list: { paddingBottom: 100 },
//   listEmpty: { flex: 1 },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
//   // Ongoing calls section (top of list)
//   ongoingSection: { paddingHorizontal: Spacing.base, marginBottom: 8, gap: 8 },
//   ongoingSectionLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     letterSpacing: 1,
//     marginBottom: 2,
//   },
//   ongoingCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     padding: 12,
//     borderRadius: 14,
//     borderWidth: 1,
//   },
//   ongoingCardAvatar: { width: 44, height: 44, borderRadius: 22 },
//   ongoingCardAvatarFb: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   ongoingCardInitials: { color: "#fff", fontSize: 15, fontWeight: "700" },
//   ongoingCardInfo: { flex: 1, gap: 2 },
//   ongoingCardName: { fontSize: 14, fontWeight: "700" },
//   ongoingCardMeta: { fontSize: 12 },
//   ongoingCardBtn: {
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//   },
//   ongoingCardBtnText: { fontSize: 13, fontWeight: "800" },
//   // History rows
//   callItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: Spacing.base,
//     paddingVertical: 12,
//     gap: 12,
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
//   callTypeBadge: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//   },
//   groupCorner: {
//     position: "absolute",
//     top: -2,
//     left: -2,
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: "#5b8dee",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1.5,
//   },
//   callInfo: { flex: 1, gap: 4 },
//   callerName: { fontSize: 15, fontWeight: "700" },
//   callMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
//   callStatus: { fontSize: 13 },
//   callTime: { fontSize: 12 },
//   groupLabel: { fontSize: 11, marginTop: 1 },
//   callBackBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//   },
//   callBackBtnDisabled: { opacity: 0.4 },
//   ongoingBtnWrap: { borderRadius: 14, overflow: "hidden" },
//   ongoingBtn: { paddingHorizontal: 14, paddingVertical: 9 },
//   ongoingBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
//   empty: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingTop: 80,
//     gap: 12,
//   },
//   emptyTitle: { fontSize: 20, fontWeight: "700" },
//   emptySubtitle: { fontSize: 14 },
// });

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Colors, Spacing } from "../../constants";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { callApi } from "../../services/api";
import { CallHistory, User } from "../../types";
import { useAppSelector } from "../../hooks/useRedux";
import { useStartCall } from "../../hooks/useStartCall";
import { formatDistanceToNow } from "../../utils/date";
import { useContactNameResolver } from "@/hooks/useContactName";
import { socketService } from "../../services/socket";
import CallDetailsModal, { OngoingInfo } from "@/components/CallDetailsModal";

/** "Missed"/"No Answer"/"Declined"/"Ongoing"/"Incoming"/"Outgoing" per the
 * four real statuses in the CallHistory schema — distinguishes rejected
 * from missed instead of collapsing both into "Incoming". */
function getCallStatusLabel(
  status: CallHistory["status"],
  isInitiator: boolean
): string {
  switch (status) {
    case "missed":
      return isInitiator ? "No Answer" : "Missed";
    case "rejected":
      return "Declined";
    case "ongoing":
      return "Ongoing";
    case "completed":
    default:
      return isInitiator ? "Outgoing" : "Incoming";
  }
}

function getCallStatusColor(status: CallHistory["status"]): string {
  if (status === "missed" || status === "rejected") return Colors.error;
  return Colors.success;
}

const formatDuration = (secs?: number) => {
  if (!secs) return "";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return ` · ${m}:${s.toString().padStart(2, "0")}`;
};

// isGroup is always accurate — every record is created through the
// current saveCallHistory, which derives it server-side from the actual
// Chat document, and the database has no legacy rows predating this
// field. No fallback needed.
function deriveIsGroup(call: CallHistory): boolean {
  return !!call.isGroup;
}

type CallItemProps = {
  call: CallHistory;
  myId: string;
  onPress: (call: CallHistory) => void;
};

const CallItem = memo(function CallItem({
  call,
  myId,
  onPress,
}: CallItemProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { startCall } = useStartCall();
  const resolveContact = useContactNameResolver();

  const chatId = call.chatId;
  const isGroup = deriveIsGroup(call);

  const ongoingCall = useAppSelector((s) =>
    chatId ? s.ongoingCalls.byChatId[chatId] : undefined
  );
  const myActiveCall = useAppSelector((s) => s.myCall.active);
  const alreadyJoined =
    !!ongoingCall && myActiveCall?.callId === ongoingCall.callId;

  // initiator/participants can be null if the referenced account was
  // deleted (a dangling Mongoose ref populates as null) — guard every
  // access instead of assuming a populated User is always present.
  const initiator = call.initiator as User | null;
  const isInitiator = initiator?._id === myId;
  const other: User | null | undefined = isInitiator
    ? call.participants.find((p) => p && p._id !== myId) || call.participants[0]
    : initiator;

  const { displayName: resolvedOtherName } = resolveContact(
    other?.phone,
    other?.name
  );
  // Group calls show the group's own live name/avatar (via the `chat`
  // virtual populate) — showing one random other participant instead
  // (the old behavior) was misleading for a group call.
  const displayOtherName = isGroup
    ? call.chat?.name || "Group"
    : resolvedOtherName;
  const displayAvatar = isGroup ? call.chat?.avatar : other?.avatar;
  const groupLabel = isGroup
    ? `Group call · ${call.participants.length} people`
    : null;
  const initials = (displayOtherName || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statusLabel = getCallStatusLabel(call.status, isInitiator);
  const statusColor = getCallStatusColor(call.status);
  const canCallBack = !!other?._id;

  const handleCallBack = (e: any) => {
    e.stopPropagation();
    if (!other?._id) return;
    startCall(other._id, call.type);
  };

  const handleJoinOngoing = (e: any) => {
    e.stopPropagation();
    if (!chatId || !ongoingCall) return;
    if (!alreadyJoined) {
      socketService
        .getSocket()
        ?.emit("call:join-ongoing", { callId: ongoingCall.callId });
    }
    router.push({
      pathname: "/call/[id]",
      params: {
        id: chatId,
        type: ongoingCall.type,
        callId: ongoingCall.callId,
        isIncoming: "1",
      },
    });
  };

  return (
    <TouchableOpacity
      style={styles.callItem}
      onPress={() => onPress(call)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarWrap}>
        {displayAvatar ? (
          <Image
            source={{ uri: displayAvatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <LinearGradient
            colors={[colors.surfaceHigh, colors.surface]}
            style={styles.avatarFallback}
          >
            <Text style={[styles.initials, { color: colors.textSecondary }]}>
              {initials}
            </Text>
          </LinearGradient>
        )}
        <View
          style={[
            styles.callTypeBadge,
            {
              backgroundColor:
                call.type === "video" ? colors.secondary : colors.primary,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name={call.type === "video" ? "videocam" : "call"}
            size={9}
            color={colors.surface}
          />
        </View>
        {isGroup && (
          <View
            style={[styles.groupCorner, { borderColor: colors.background }]}
          >
            <Ionicons name="people" size={9} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.callInfo}>
        <Text
          style={[styles.callerName, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {displayOtherName || "Unknown"}
        </Text>
        <View style={styles.callMeta}>
          <Ionicons
            name={isInitiator ? "arrow-up" : "arrow-down"}
            size={12}
            color={statusColor}
          />
          <Text style={[styles.callStatus, { color: statusColor }]}>
            {statusLabel}
            {formatDuration(call.duration)}
          </Text>
          <Text style={[styles.callTime, { color: colors.textMuted }]}>
            {" "}
            · {formatDistanceToNow(new Date(call.createdAt))}
          </Text>
        </View>
        {groupLabel && (
          <Text style={[styles.groupLabel, { color: colors.textMuted }]}>
            {groupLabel}
          </Text>
        )}
      </View>

      {ongoingCall ? (
        <TouchableOpacity
          style={styles.ongoingBtnWrap}
          onPress={handleJoinOngoing}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={
            alreadyJoined ? "Return to ongoing call" : "Join ongoing call"
          }
        >
          <LinearGradient
            colors={
              ongoingCall.type === "video"
                ? ["#5b8dee", "#3a6bc9"]
                : ["#00d4aa", "#00b090"]
            }
            style={styles.ongoingBtn}
          >
            <Text style={styles.ongoingBtnText}>
              {alreadyJoined ? "Return" : "Join"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.callBackBtn,
            { borderColor: colors.border, backgroundColor: colors.surface },
            !canCallBack && styles.callBackBtnDisabled,
          ]}
          onPress={handleCallBack}
          disabled={!canCallBack}
          accessibilityRole="button"
          accessibilityLabel={
            canCallBack
              ? `Call ${displayOtherName || "back"}`
              : "Caller unavailable"
          }
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={call.type === "video" ? "videocam-outline" : "call-outline"}
            size={20}
            color={canCallBack ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
});

// One card in the top "Ongoing calls" section — sourced directly from
// ongoingCalls.byChatId, independent of call history entirely, so a call
// with zero prior history in that chat still shows up immediately.
function OngoingCallCard({ chatId }: { chatId: string }) {
  const { colors } = useTheme();
  const router = useRouter();
  const call = useAppSelector((s) => s.ongoingCalls.byChatId[chatId]);
  const myActiveCall = useAppSelector((s) => s.myCall.active);
  // Chat name/avatar aren't in the ongoing-call payload at all — looked
  // up locally against the already-loaded chat list instead of adding a
  // new backend field for this.
  const chat = useAppSelector((s) =>
    s.chat.chats.find((c) => c._id === chatId)
  );

  if (!call) return null;
  const alreadyJoined = myActiveCall?.callId === call.callId;
  const initials = (chat?.name || "Group")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handlePress = () => {
    if (!alreadyJoined) {
      socketService
        .getSocket()
        ?.emit("call:join-ongoing", { callId: call.callId });
    }
    router.push({
      pathname: "/call/[id]",
      params: {
        id: chatId,
        type: call.type,
        callId: call.callId,
        isIncoming: "1",
      },
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.ongoingCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {chat?.avatar ? (
        <Image
          source={{ uri: chat.avatar }}
          style={styles.ongoingCardAvatar}
          contentFit="cover"
        />
      ) : (
        <LinearGradient
          colors={["#00d4aa", "#5b8dee"]}
          style={styles.ongoingCardAvatarFb}
        >
          <Text style={styles.ongoingCardInitials}>{initials}</Text>
        </LinearGradient>
      )}
      <View style={styles.ongoingCardInfo}>
        <Text
          style={[styles.ongoingCardName, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {chat?.name || "Group"}
        </Text>
        <Text style={[styles.ongoingCardMeta, { color: colors.textMuted }]}>
          {call.type === "video" ? "Video call" : "Voice call"}
          {call.joinedCount > 0 ? ` · ${call.joinedCount} in call` : ""}
        </Text>
      </View>
      <View
        style={[
          styles.ongoingCardBtn,
          {
            backgroundColor: alreadyJoined
              ? colors.surfaceHigh
              : call.type === "video"
              ? "#5b8dee"
              : "#00d4aa",
          },
        ]}
      >
        <Text
          style={[
            styles.ongoingCardBtnText,
            { color: alreadyJoined ? colors.textPrimary : "#fff" },
          ]}
        >
          {alreadyJoined ? "Return" : "Join"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CallsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { error: showError } = useToast();
  const { user } = useAppSelector((s) => s.auth);
  const ongoingCallsByChatId = useAppSelector((s) => s.ongoingCalls.byChatId);
  const [calls, setCalls] = useState<CallHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallHistory | null>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCalls = useCallback(async () => {
    try {
      const res = await callApi.getCallHistory();
      if (!isMountedRef.current) return;
      if (res.success) {
        setCalls(res.data.calls);
      } else {
        showError("Couldn't load calls", "Try again in a moment.");
      }
    } catch {
      if (isMountedRef.current) {
        showError("Couldn't load calls", "Try again in a moment.");
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCalls();
    if (isMountedRef.current) setRefreshing(false);
  };

  const keyExtractor = useCallback((c: CallHistory) => c._id, []);

  // ── Modal wiring ────────────────────────────────────────────────────────
  const { startCall } = useStartCall();
  const myActiveCall = useAppSelector((s) => s.myCall.active);

  const selectedChatId = selectedCall?.chatId;
  const selectedOngoing = useAppSelector((s) =>
    selectedChatId ? s.ongoingCalls.byChatId[selectedChatId] : undefined
  );
  const selectedOngoingInfo: OngoingInfo | null = selectedOngoing
    ? {
        alreadyJoined: myActiveCall?.callId === selectedOngoing.callId,
        joinedCount: selectedOngoing.joinedCount,
      }
    : null;

  const handleCallBackFromModal = () => {
    if (!selectedCall) return;
    const initiator = selectedCall.initiator as User | null;
    const isInitiator = initiator?._id === user?._id;
    const other = isInitiator
      ? selectedCall.participants.find((p) => p && p._id !== user?._id) ||
        selectedCall.participants[0]
      : initiator;
    if (!other?._id) return;
    setSelectedCall(null);
    startCall(other._id, selectedCall.type);
  };

  const handleJoinFromModal = () => {
    if (!selectedCall?.chatId || !selectedOngoing) return;
    const alreadyJoined = myActiveCall?.callId === selectedOngoing.callId;
    if (!alreadyJoined) {
      socketService
        .getSocket()
        ?.emit("call:join-ongoing", { callId: selectedOngoing.callId });
    }
    const chatId = selectedCall.chatId;
    const type = selectedOngoing.type;
    const callId = selectedOngoing.callId;
    setSelectedCall(null);
    router.push({
      pathname: "/call/[id]",
      params: { id: chatId, type, callId, isIncoming: "1" },
    });
  };

  const ongoingChatIds = Object.keys(ongoingCallsByChatId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Calls</Text>
        <TouchableOpacity
          style={[
            styles.newCallBtn,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          onPress={() => router.push("/phone-contacts")}
          accessibilityRole="button"
          accessibilityLabel="Start a new call"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="call-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={calls}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => (
            <CallItem
              call={item}
              myId={user?._id || ""}
              onPress={setSelectedCall}
            />
          )}
          ListHeaderComponent={
            ongoingChatIds.length > 0 ? (
              <View style={styles.ongoingSection}>
                <Text
                  style={[
                    styles.ongoingSectionLabel,
                    { color: colors.textMuted },
                  ]}
                >
                  ONGOING {ongoingChatIds.length > 1 ? "CALLS" : "CALL"}
                </Text>
                {ongoingChatIds.map((chatId) => (
                  <OngoingCallCard key={chatId} chatId={chatId} />
                ))}
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={[
            styles.list,
            calls.length === 0 &&
              ongoingChatIds.length === 0 &&
              styles.listEmpty,
          ]}
          ListEmptyComponent={
            ongoingChatIds.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons
                  name="call-outline"
                  size={60}
                  color={colors.textMuted}
                />
                <Text
                  style={[styles.emptyTitle, { color: colors.textPrimary }]}
                >
                  No call history
                </Text>
                <Text
                  style={[styles.emptySubtitle, { color: colors.textMuted }]}
                >
                  Your calls will appear here
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <CallDetailsModal
        visible={!!selectedCall}
        call={selectedCall}
        myId={user?._id || ""}
        isGroup={selectedCall ? deriveIsGroup(selectedCall) : false}
        ongoingInfo={selectedOngoingInfo}
        onClose={() => setSelectedCall(null)}
        onCallBack={handleCallBackFromModal}
        onJoinOngoing={handleJoinFromModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: 28, fontWeight: "800" },
  newCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  list: { paddingBottom: 100 },
  listEmpty: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  // Ongoing calls section (top of list)
  ongoingSection: { paddingHorizontal: Spacing.base, marginBottom: 8, gap: 8 },
  ongoingSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
  },
  ongoingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  ongoingCardAvatar: { width: 44, height: 44, borderRadius: 22 },
  ongoingCardAvatarFb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  ongoingCardInitials: { color: "#fff", fontSize: 15, fontWeight: "700" },
  ongoingCardInfo: { flex: 1, gap: 2 },
  ongoingCardName: { fontSize: 14, fontWeight: "700" },
  ongoingCardMeta: { fontSize: 12 },
  ongoingCardBtn: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ongoingCardBtnText: { fontSize: 13, fontWeight: "800" },
  // History rows
  callItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    gap: 12,
  },
  avatarWrap: { position: "relative" },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: { fontSize: 18, fontWeight: "700" },
  callTypeBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  groupCorner: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#5b8dee",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  callInfo: { flex: 1, gap: 4 },
  callerName: { fontSize: 15, fontWeight: "700" },
  callMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  callStatus: { fontSize: 13 },
  callTime: { fontSize: 12 },
  groupLabel: { fontSize: 11, marginTop: 1 },
  callBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  callBackBtnDisabled: { opacity: 0.4 },
  ongoingBtnWrap: { borderRadius: 14, overflow: "hidden" },
  ongoingBtn: { paddingHorizontal: 14, paddingVertical: 9 },
  ongoingBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySubtitle: { fontSize: 14 },
});
