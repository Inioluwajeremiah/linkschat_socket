// import {
//     View,
//     Text,
//     StyleSheet,
//     FlatList,
//     TouchableOpacity,
//     TextInput,
//     KeyboardAvoidingView,
//     Platform,
//     Animated,
//     ActivityIndicator,
//     Alert,
//     Keyboard,
//     Dimensions,
//   } from "react-native";
//   import { useEffect, useRef, useState, useMemo } from "react";
//   import { useLocalSearchParams, useRouter } from "expo-router";
//   import { useSafeAreaInsets } from "react-native-safe-area-context";
//   import { Ionicons } from "@expo/vector-icons";
//   import { LinearGradient } from "expo-linear-gradient";
//   import { Image } from "expo-image";
//   import * as Clipboard from "expo-clipboard";
//   import { useTheme } from "../../context/ThemeContext";
//   import { useToast } from "../../context/ToastContext";
//   import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
//   import {
//     setMessages,
//     addMessage,
//     updateMessage,
//     removeMessage,
//     clearUnread,
//   } from "../../store/slices/chatSlice";
//   import { chatApi, messageActionsApi, uploadFileToS3 } from "../../services/api";
//   import { socketService } from "../../services/socket";
//   import { Message, User, Chat, ActivityStatus, UserActivity } from "../../types";
//   import { formatDateSeparator } from "../../utils/date";
//   import MessageBubble from "./components/MessageBubble";
//   import ReactionActionMenu from "./components/ReactionActionMenu";
//   import AttachmentSheet, {
//     AttachmentResult,
//   } from "./components/AttachmentSheet";
//   import AudioRecorder, { RecordedSegment } from "./components/AudioRecorder";
//   import ForwardSheet from "./components/ForwardSheet";
//   import { createSelector } from "@reduxjs/toolkit";
//   import { RootState } from "@/store";
//   import MediaViewerModal from "./components/MediaViewerModal";
//   import { markMessagesRead } from "../../store/slices/chatSlice";
//   import { Spacing } from "@/constants";
//   import EmojiPicker, { EmojiType } from "rn-emoji-keyboard";

//   const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
//   const EMOJI_ROWS = [
//     "😀😂🥰😍🤩😎🥳🤔😅😭",
//     "❤️🔥💯✨🎉👏🙌💪🎯🏆",
//     "😤🤣😊🥺😢😡🤯🥱😏🤗",
//   ];

//   // ─── Date separator ───────────────────────────────────────────────────────────
//   function DateSeparator({ date, colors }: { date: string; colors: any }) {
//     return (
//       <View style={sepStyles.wrap}>
//         <View style={[sepStyles.line, { backgroundColor: colors.border }]} />
//         <Text
//           style={[
//             sepStyles.label,
//             { color: colors.textMuted, backgroundColor: colors.background },
//           ]}
//         >
//           {date}
//         </Text>
//         <View style={[sepStyles.line, { backgroundColor: colors.border }]} />
//       </View>
//     );
//   }
//   const sepStyles = StyleSheet.create({
//     wrap: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: 16,
//       marginVertical: 12,
//       gap: 10,
//     },
//     line: { flex: 1, height: StyleSheet.hairlineWidth },
//     label: {
//       fontSize: 11,
//       fontWeight: "600",
//       paddingHorizontal: 10,
//       paddingVertical: 3,
//       borderRadius: 99,
//     },
//   });

//   // ─── Reply bar ────────────────────────────────────────────────────────────────
//   function ReplyBar({
//     replyTo,
//     onCancel,
//     colors,
//   }: {
//     replyTo: Message;
//     onCancel: () => void;
//     colors: any;
//   }) {
//     const sender = replyTo.sender as User;
//     const preview =
//       replyTo.type === "image"
//         ? "📷 Photo"
//         : replyTo.type === "audio"
//         ? "🎵 Voice note"
//         : replyTo.type === "video"
//         ? "🎥 Video"
//         : replyTo.content?.slice(0, 80) || "";
//     const slideAnim = useRef(new Animated.Value(-60)).current;

//     useEffect(() => {
//       Animated.spring(slideAnim, {
//         toValue: 0,
//         useNativeDriver: true,
//         tension: 280,
//         friction: 22,
//       }).start();
//     }, []);

//     return (
//       <Animated.View
//         style={[
//           replyBarStyles.wrap,
//           {
//             backgroundColor: colors.surface,
//             borderTopColor: colors.border,
//             transform: [{ translateY: slideAnim }],
//           },
//         ]}
//       >
//         <View style={replyBarStyles.indicator} />
//         <View style={replyBarStyles.content}>
//           <Text style={replyBarStyles.name}>{sender?.name || "Unknown"}</Text>
//           <Text
//             style={[replyBarStyles.preview, { color: colors.textSecondary }]}
//             numberOfLines={1}
//           >
//             {preview}
//           </Text>
//         </View>
//         <TouchableOpacity onPress={onCancel} style={replyBarStyles.close}>
//           <Ionicons name="close" size={18} color={colors.textMuted} />
//         </TouchableOpacity>
//       </Animated.View>
//     );
//   }
//   const replyBarStyles = StyleSheet.create({
//     wrap: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: 16,
//       paddingVertical: 10,
//       borderTopWidth: 1,
//       gap: 10,
//     },
//     indicator: {
//       width: 3,
//       height: 36,
//       borderRadius: 2,
//       backgroundColor: "#00d4aa",
//     },
//     content: { flex: 1 },
//     name: { fontSize: 12, fontWeight: "700", color: "#00d4aa" },
//     preview: { fontSize: 13, marginTop: 1 },
//     close: { padding: 4 },
//   });

//   // ─── Emoji panel ──────────────────────────────────────────────────────────────
//   function EmojiPanel({
//     visible,
//     onPick,
//     colors,
//   }: {
//     visible: boolean;
//     onPick: (e: string) => void;
//     colors: any;
//   }) {
//     const slideAnim = useRef(new Animated.Value(300)).current;

//     useEffect(() => {
//       Animated.spring(slideAnim, {
//         toValue: visible ? 0 : 300,
//         useNativeDriver: true,
//         tension: 280,
//         friction: 24,
//       }).start();
//     }, [visible]);

//     if (!visible) return null;

//     return (
//       <Animated.View
//         style={[
//           emojiStyles.panel,
//           {
//             backgroundColor: colors.surface,
//             borderTopColor: colors.border,
//             transform: [{ translateY: slideAnim }],
//           },
//         ]}
//       >
//         {EMOJI_ROWS.map((row, ri) => (
//           <View key={ri} style={emojiStyles.row}>
//             {row
//               .split("")
//               .filter((_, i) => i % 2 === 0)
//               .map((_, ci) => {
//                 const emoji =
//                   Array.from(row)[ci * 2] + (Array.from(row)[ci * 2 + 1] || "");
//                 if (!emoji.trim()) return null;
//                 return (
//                   <TouchableOpacity
//                     key={ci}
//                     onPress={() => onPick(emoji.trim())}
//                     style={emojiStyles.btn}
//                   >
//                     <Text style={emojiStyles.emoji}>{emoji.trim()}</Text>
//                   </TouchableOpacity>
//                 );
//               })}
//           </View>
//         ))}
//       </Animated.View>
//     );
//   }
//   const emojiStyles = StyleSheet.create({
//     panel: { borderTopWidth: 1, paddingVertical: 12, paddingHorizontal: 8 },
//     row: {
//       flexDirection: "row",
//       justifyContent: "space-around",
//       marginBottom: 4,
//     },
//     btn: { padding: 6 },
//     emoji: { fontSize: 26 },
//   });

//   // function TypingIndicator({ names }: { names: string[] }) {
//   //   const dot1 = useRef(new Animated.Value(0)).current;
//   //   const dot2 = useRef(new Animated.Value(0)).current;
//   //   const dot3 = useRef(new Animated.Value(0)).current;

//   //   useEffect(() => {
//   //     const anim = (dot: Animated.Value, delay: number) =>
//   //       Animated.loop(
//   //         Animated.sequence([
//   //           Animated.delay(delay),
//   //           Animated.timing(dot, {
//   //             toValue: -4,
//   //             duration: 300,
//   //             useNativeDriver: true,
//   //           }),
//   //           Animated.timing(dot, {
//   //             toValue: 0,
//   //             duration: 300,
//   //             useNativeDriver: true,
//   //           }),
//   //         ])
//   //       );
//   //     Animated.parallel([
//   //       anim(dot1, 0),
//   //       anim(dot2, 150),
//   //       anim(dot3, 300),
//   //     ]).start();
//   //   }, []);

//   //   return (
//   //     <View style={typingStyles.wrap}>
//   //       <View style={typingStyles.bubble}>
//   //         {[dot1, dot2, dot3].map((d, i) => (
//   //           <Animated.View
//   //             key={i}
//   //             style={[typingStyles.dot, { transform: [{ translateY: d }] }]}
//   //           />
//   //         ))}
//   //       </View>
//   //       <Text style={typingStyles.label}>{names.join(", ")} typing...</Text>
//   //     </View>
//   //   );
//   // }

//   function UserActivityIndicator({
//     activities,
//     colors,
//   }: {
//     activities: UserActivity[];
//     colors: any;
//   }) {
//     // const {colors} = useTheme()
//     const typingStyles = StyleSheet.create({
//       wrap: {
//         flexDirection: "row",
//         alignItems: "center",
//         paddingHorizontal: Spacing.base,
//         paddingBottom: 4,
//         gap: 8,
//       },
//       bubble: {
//         flexDirection: "row",
//         gap: 4,
//         backgroundColor: colors.surface,
//         padding: 10,
//         borderRadius: 14,
//         alignItems: "center",
//       },
//       dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#555577" },
//       label: { fontSize: 12, color: colors.textMuted, fontStyle: "italic" },
//     });

//     if (activities.length === 0) return null;

//     const byStatus: Record<ActivityStatus, string[]> = {
//       typing: [],
//       recording: [],
//       uploading: [],
//     };
//     activities.forEach((a) => byStatus[a.status].push(a.name));

//     const lines: string[] = [];
//     if (byStatus.typing.length)
//       lines.push(`${byStatus.typing.join(", ")} typing…`);
//     if (byStatus.recording.length)
//       lines.push(`${byStatus.recording.join(", ")} recording…`);
//     if (byStatus.uploading.length)
//       lines.push(`${byStatus.uploading.join(", ")} sending a file…`);

//     const dot1 = useRef(new Animated.Value(0)).current;
//     const dot2 = useRef(new Animated.Value(0)).current;
//     const dot3 = useRef(new Animated.Value(0)).current;

//     useEffect(() => {
//       const anim = (dot: Animated.Value, delay: number) =>
//         Animated.loop(
//           Animated.sequence([
//             Animated.delay(delay),
//             Animated.timing(dot, {
//               toValue: -4,
//               duration: 300,
//               useNativeDriver: true,
//             }),
//             Animated.timing(dot, {
//               toValue: 0,
//               duration: 300,
//               useNativeDriver: true,
//             }),
//           ])
//         );
//       Animated.parallel([
//         anim(dot1, 0),
//         anim(dot2, 150),
//         anim(dot3, 300),
//       ]).start();
//     }, []);

//     return (
//       <View style={typingStyles.wrap}>
//         <View style={typingStyles.bubble}>
//           {[dot1, dot2, dot3].map((d, i) => (
//             <Animated.View
//               key={i}
//               style={[typingStyles.dot, { transform: [{ translateY: d }] }]}
//             />
//           ))}
//         </View>
//         <Text style={typingStyles.label}>{lines.join(" · ")}</Text>
//       </View>
//     );
//   }

//   // ─── Upload progress indicator ────────────────────────────────────────────────
//   function UploadingIndicator({ colors }: { colors: any }) {
//     return (
//       <View
//         style={[
//           upStyles.wrap,
//           { backgroundColor: colors.surface, borderColor: colors.border },
//         ]}
//       >
//         <ActivityIndicator color="#00d4aa" size="small" />
//         <Text style={[upStyles.text, { color: colors.textSecondary }]}>
//           Uploading…
//         </Text>
//       </View>
//     );
//   }
//   const upStyles = StyleSheet.create({
//     wrap: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 8,
//       paddingHorizontal: 16,
//       paddingVertical: 10,
//       borderTopWidth: 1,
//     },
//     text: { fontSize: 13 },
//   });

//   const EMPTY_MESSAGES: Message[] = [];

//   const selectMessagesByChat = createSelector(
//     [
//       (state: RootState) => state.chat.messages,
//       (_: RootState, chatId: string) => chatId,
//     ],
//     (messages, chatId) => messages[chatId] ?? EMPTY_MESSAGES
//   );
//   // near selectMessagesByChat
//   const EMPTY_ACTIVITY: Record<string, UserActivity> = {};

//   const selectActivityByChat = createSelector(
//     [
//       (state: RootState) => state.chat.activityUsers,
//       (_: RootState, chatId: string) => chatId,
//     ],
//     (activityUsers, chatId) => activityUsers[chatId] ?? EMPTY_ACTIVITY
//   );

//   // ─── Main screen ──────────────────────────────────────────────────────────────
//   export default function ChatScreen() {
//     const { id: chatId } = useLocalSearchParams<{ id: string }>();

//     // console.log("join chat chatId ==>> ", chatId);
//     const router = useRouter();
//     const { colors } = useTheme();
//     const toast = useToast();
//     const dispatch = useAppDispatch();
//     const { user: me } = useAppSelector((s) => s.auth);
//     // const { typingUsers } = useAppSelector((s) => s.chat);

//     const activityMap = useAppSelector((state) =>
//       selectActivityByChat(state, chatId)
//     );
//     const activityList = useMemo(() => Object.values(activityMap), [activityMap]);

//     const isOtherTyping = activityList.some((a) => a.status === "typing");
//     const messages = useAppSelector((state) =>
//       selectMessagesByChat(state, chatId)
//     );
//     // const typingIds = typingUsers[chatId] || [];
//     const insets = useSafeAreaInsets();

//     const [chatInfo, setChatInfo] = useState<Chat | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [sending, setSending] = useState(false);
//     const [uploading, setUploading] = useState(false);
//     const [text, setText] = useState("");
//     const [replyTo, setReplyTo] = useState<Message | null>(null);
//     const [editingMessage, setEditingMessage] = useState<Message | null>(null);
//     const [showEmoji, setShowEmoji] = useState(false);
//     const [showAttachment, setShowAttachment] = useState(false);
//     const [showRecorder, setShowRecorder] = useState(false);
//     const [forwardMessageId, setForwardMessageId] = useState<string | null>(null);
//     const [menuMessage, setMenuMessage] = useState<Message | null>(null);
//     const [menuAnchor, setMenuAnchor] = useState<any>(null);
//     const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
//     const [isTyping, setIsTyping] = useState(false);
//     // const [otherTyping, setOtherTyping] = useState(false);
//     // ── Pagination state ───────────────────────────────────────────────────────
//     const [currentPage, setCurrentPage] = useState(1);
//     const [hasMore, setHasMore] = useState(true);
//     const [loadingMore, setLoadingMore] = useState(false);

//     // inside the component:
//     const [mediaViewer, setMediaViewer] = useState<{
//       visible: boolean;
//       type: "image" | "video" | null;
//       uri: string | null;
//     }>({ visible: false, type: null, uri: null });

//     const flatListRef = useRef<FlatList>(null);
//     const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
//     const inputRef = useRef<TextInput>(null);

//     const meRef = useRef(me);
//     useEffect(() => {
//       meRef.current = me;
//     }, [me]);

//     const readHandledRef = useRef<Set<string>>(new Set());
//     const pendingReadIdsRef = useRef<Set<string>>(new Set());
//     const readFlushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

//     // ── Load initial data ──────────────────────────────────────────────────────
//     useEffect(() => {
//       readHandledRef.current = new Set();
//       pendingReadIdsRef.current = new Set();
//       const load = async () => {
//         try {
//           const [chatRes, msgRes] = await Promise.all([
//             chatApi.getChatInfo(chatId),
//             chatApi.getMessages(chatId, 1),
//           ]);
//           if (chatRes.success) setChatInfo(chatRes.data.chat);
//           if (msgRes.success) {
//             dispatch(setMessages({ chatId, messages: msgRes.data.messages }));
//             // Use hasNextPage from pagination to know if more pages exist
//             setHasMore(msgRes.data.pagination.hasNextPage);
//             setCurrentPage(msgRes.data.pagination.page);
//           }
//         } catch {
//           toast.error("Failed to load chat");
//         } finally {
//           setLoading(false);
//         }
//       };
//       load();

//       // Mark chat as read
//       dispatch(clearUnread(chatId));
//       messageActionsApi.markChatRead(chatId).catch(() => {});

//       // Join socket room
//       socketService.emit("chat:join", chatId);
//       return () => {
//         socketService.emit("chat:leave", { chatId });
//       };
//     }, [chatId]);

//     // ── Socket listeners ───────────────────────────────────────────────────────
//     useEffect(() => {
//       const socket = socketService.getSocket();
//       if (!socket) return;

//       const onNewMessage = (msg: Message) => {
//         if (msg.chatId !== chatId) return;
//         // const senderId = (msg.sender as User)?._id || msg.sender;
//         // if (senderId === me?._id) return; // already added optimistically — skip
//         dispatch(addMessage({ chatId, message: msg }));
//         messageActionsApi.markChatRead(chatId).catch(() => {});
//         setTimeout(
//           () => flatListRef.current?.scrollToEnd({ animated: true }),
//           100
//         );
//       };

//       const onMessagesRead = (data: {
//         chatId: string;
//         messageIds: string[];
//         userId: string;
//         readAt: string;
//       }) => {
//         if (data.chatId !== chatId) return;
//         dispatch(
//           markMessagesRead({
//             chatId,
//             messageIds: data.messageIds,
//             userId: data.userId,
//             readAt: data.readAt,
//           })
//         );
//       };

//       const onEdited = (data: {
//         message: Message;
//         messageId: string;
//         content: string;
//         editedAt: string;
//       }) => {
//         dispatch(
//           updateMessage({
//             chatId,
//             message: data.message,
//             messageId: data.messageId,
//             changes: {
//               content: data.content,
//               isEdited: true,
//               editedAt: data.editedAt,
//             },
//           })
//         );
//       };

//       const onDeleted = (data: {
//         message: Message;
//         messageId: string;
//         forEveryone: boolean;
//       }) => {
//         if (data.forEveryone) {
//           dispatch(
//             updateMessage({
//               chatId,
//               // message: data.message,
//               messageId: data.messageId,
//               changes: { isDeleted: true, content: "" },
//             })
//           );
//         } else {
//           dispatch(removeMessage({ chatId, messageId: data.messageId }));
//         }
//       };

//       const onReacted = (data: {
//         message: Message;
//         messageId: string;
//         reactions: any[];
//       }) => {
//         dispatch(
//           updateMessage({
//             chatId,
//             message: data.message,
//             messageId: data.messageId,
//             changes: { reactions: data.reactions },
//           })
//         );
//       };

//       // const onTypingStart = (data: { userId: string; chatId: string }) => {
//       //   if (data.chatId === chatId && data.userId !== me?._id)
//       //     setOtherTyping(true);
//       // };

//       // const onTypingStop = (data: { userId: string; chatId: string }) => {
//       //   if (data.chatId === chatId && data.userId !== me?._id)
//       //     setOtherTyping(false);
//       // };

//       socket.on("message:new", onNewMessage);
//       socket.on("message:edited", onEdited);
//       socket.on("message:deleted", onDeleted);
//       socket.on("message:reacted", onReacted);
//       // socket.on("typing:start", onTypingStart);
//       // socket.on("typing:stop", onTypingStop);
//       socket.on("message:read", onMessagesRead);

//       return () => {
//         socket.off("message:new", onNewMessage);
//         socket.off("message:edited", onEdited);
//         socket.off("message:deleted", onDeleted);
//         socket.off("message:reacted", onReacted);
//         // socket.off("typing:start", onTypingStart);
//         // socket.off("typing:stop", onTypingStop);
//         socket.off("message:read", onMessagesRead);
//       };
//     }, [chatId, me?._id]);

//     // handle recording indicator
//     useEffect(() => {
//       socketService.emit(showRecorder ? "activity:start" : "activity:stop", {
//         chatId,
//         status: "recording",
//       });
//     }, [showRecorder]);
//     const flushReadReceipts = () => {
//       if (pendingReadIdsRef.current.size === 0) return;
//       const ids = Array.from(pendingReadIdsRef.current);
//       pendingReadIdsRef.current.clear();
//       socketService.emit("message:read", { chatId, messageIds: ids });
//     };

//     const onViewableItemsChanged = useRef(
//       ({ viewableItems }: { viewableItems: any[] }) => {
//         viewableItems.forEach((v) => {
//           const item = v.item;
//           if (!item || (item as any).type === "separator") return;
//           const msg = item as Message;

//           const senderId = (msg.sender as User)?._id || (msg.sender as any);
//           if (senderId === meRef.current?._id) return; // don't mark your own messages

//           const alreadyRead = msg.readBy?.some(
//             (r: any) => (r.user?._id || r.user) === meRef.current?._id
//           );
//           if (alreadyRead) return;

//           if (readHandledRef.current.has(msg._id)) return;
//           readHandledRef.current.add(msg._id);
//           pendingReadIdsRef.current.add(msg._id);
//         });

//         if (pendingReadIdsRef.current.size > 0) {
//           if (readFlushTimer.current) clearTimeout(readFlushTimer.current);
//           readFlushTimer.current = setTimeout(flushReadReceipts, 600);
//         }
//       }
//     ).current;

//     const viewabilityConfigCallbackPairs = useRef([
//       {
//         viewabilityConfig: { itemVisiblePercentThreshold: 60 },
//         onViewableItemsChanged,
//       },
//     ]).current;
//     // ── Load older messages ────────────────────────────────────────────────────
//     // Strategy: use `before` cursor (oldest message's createdAt) so that
//     // page-based skip stays accurate even when new messages arrive in real-time.
//     const loadMore = async () => {
//       if (!hasMore || loadingMore || messages.length === 0) return;
//       setLoadingMore(true);
//       try {
//         const oldest = messages[0];
//         const nextPage = currentPage + 1;
//         const res = await chatApi.getMessages(
//           chatId,
//           nextPage,
//           oldest.createdAt.toString() // `before` cursor keeps the window stable
//         );
//         if (res.success) {
//           const older = res.data.messages;
//           // Prepend older messages; keep existing ones at the end
//           dispatch(setMessages({ chatId, messages: [...older, ...messages] }));
//           // Update pagination state from server response
//           setHasMore(res.data.pagination.hasNextPage);
//           setCurrentPage(res.data.pagination.page);
//         }
//       } catch {
//         toast.error("Failed to load older messages");
//       } finally {
//         setLoadingMore(false);
//       }
//     };

//     const handleTyping = (val: string) => {
//       setText(val);
//       if (!isTyping) {
//         setIsTyping(true);
//         socketService.emit("activity:start", { chatId, status: "typing" });
//       }
//       if (typingTimeout.current) clearTimeout(typingTimeout.current);
//       typingTimeout.current = setTimeout(() => {
//         setIsTyping(false);
//         socketService.emit("activity:stop", { chatId, status: "typing" });
//       }, 1500);
//     };

//     const emitMessage = (payload: {
//       content: string;
//       type: string;
//       mediaUrl?: string;
//       mediaName?: string;
//       mediaSize?: number;
//       mediaDuration?: number;
//       replyTo?: string;
//       localUri?: string; // for optimistic preview only, not sent to server
//     }) => {
//       const tempId = `temp-${Date.now()}-${Math.random()}`;

//       const optimisticMessage: Message = {
//         _id: tempId,
//         tempId,
//         chatId,
//         sender: me,
//         content: payload.content,
//         type: payload.type,
//         mediaUrl: payload.localUri || payload.mediaUrl,
//         mediaName: payload.mediaName,
//         mediaSize: payload.mediaSize,
//         mediaDuration: payload.mediaDuration,
//         replyTo: replyTo || undefined,
//         createdAt: new Date().toISOString(),
//         readBy: [],
//         _uploading: !!payload.localUri, // optional flag your MessageBubble can use to show a spinner overlay
//       } as any;

//       dispatch(addMessage({ chatId, message: optimisticMessage }));
//       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);

//       socketService.emit("message:send", {
//         chatId,
//         content: payload.content,
//         type: payload.type,
//         mediaUrl: payload.mediaUrl,
//         mediaName: payload.mediaName,
//         mediaSize: payload.mediaSize,
//         mediaDuration: payload.mediaDuration,
//         replyTo,
//         tempId,
//       });

//       setReplyTo(null);
//     };

//     // ── Send text ──────────────────────────────────────────────────────────────
//     const sendText = async () => {
//       const content = text.trim();
//       if (!content && !editingMessage) return;
//       setText("");
//       Keyboard.dismiss();

//       // Editing existing message
//       if (editingMessage) {
//         try {
//           await messageActionsApi.editMessage(editingMessage._id, content);
//           dispatch(
//             updateMessage({
//               chatId,
//               message: editingMessage,
//               messageId: editingMessage._id,
//               changes: { content, isEdited: true },
//             })
//           );
//           socketService.emit("message:edit", {
//             messageId: editingMessage._id,
//             content,
//             chatId,
//           });
//         } catch {
//           toast.error("Failed to edit");
//         }
//         setEditingMessage(null);
//         return;
//       }

//       setSending(true);

//       emitMessage({ content, type: "text" });
//       setSending(false);
//     };

//     // ── Send attachment ────────────────────────────────────────────────────────
//     const handleAttachment = async (result: AttachmentResult) => {
//       setUploading(true);
//       socketService.emit("activity:start", { chatId, status: "uploading" });
//       try {
//         const mimeType = result.mimeType || "application/octet-stream";
//         const publicUrl = await uploadFileToS3(
//           result.uri,
//           result.name || "file",
//           mimeType,
//           result.type
//         );
//         emitMessage({
//           content: text,
//           type: result.type,
//           mediaUrl: publicUrl,
//           mediaName: result?.name || "",
//           mediaSize: result?.size || 0,
//           mediaDuration: result?.duration || 0,
//           localUri: result.uri, // instant local preview
//         });
//       } catch (err) {
//         console.log("handleAttachment error ==>> ", err);

//         toast.error("Failed to send file");
//       } finally {
//         setUploading(false);
//         setReplyTo(null);
//         socketService.emit("activity:stop", { chatId, status: "uploading" });
//       }
//     };

//     const handleVoiceNote = async (
//       segments: RecordedSegment[],
//       totalDurationSeconds: number
//     ) => {
//       setShowRecorder(false);
//       if (segments.length === 0) return;

//       setUploading(true);
//       socketService.emit("activity:start", { chatId, status: "uploading" });
//       try {
//         for (const segment of segments) {
//           const publicUrl = await uploadFileToS3(
//             segment.uri,
//             "voice.m4a",
//             "audio/mp4",
//             "audio"
//           );

//           emitMessage({
//             content: text,
//             type: "audio",
//             mediaUrl: publicUrl,
//             mediaDuration: Math.round(segment.durationMs / 1000),
//             // totalDurationSeconds,
//             localUri: segment.uri,
//           });
//         }
//       } catch (err) {
//         console.log("handleVoiceNote err ===>>> ", err);

//         toast.error("Failed to send voice note");
//       } finally {
//         setUploading(false);
//         setReplyTo(null);
//         socketService.emit("activity:stop", { chatId, status: "uploading" });
//       }
//     };

//     // ── Emoji picked ───────────────────────────────────────────────────────────
//     const handleEmojiPick = (emoji: string) => {
//       setText((t) => t + emoji);
//       setShowEmoji(false);
//       inputRef.current?.focus();
//     };

//     // ── Message actions ────────────────────────────────────────────────────────
//     const handleReact = async (emoji: string) => {
//       if (!menuMessage) return;
//       try {
//         await messageActionsApi.reactToMessage(menuMessage._id, emoji);
//         socketService.emit("message:react", {
//           messageId: menuMessage._id,
//           emoji,
//           chatId,
//           userId: me?._id,
//         });
//       } catch {}
//     };

//     const handleDelete = (forEveryone: boolean) => {
//       if (!menuMessage) return;
//       Alert.alert(
//         forEveryone ? "Delete for everyone" : "Delete for me",
//         forEveryone
//           ? "This message will be removed for all participants."
//           : "This message will be removed only for you.",
//         [
//           { text: "Cancel", style: "cancel" },
//           {
//             text: "Delete",
//             style: "destructive",
//             onPress: async () => {
//               try {
//                 await messageActionsApi.deleteMessage(
//                   menuMessage._id,
//                   forEveryone
//                 );
//                 if (forEveryone) {
//                   dispatch(
//                     updateMessage({
//                       chatId,
//                       // message: menuMessage,
//                       messageId: menuMessage._id,
//                       changes: { isDeleted: true, content: "" },
//                     })
//                   );
//                   socketService.emit("message:delete", {
//                     messageId: menuMessage._id,
//                     chatId,
//                     forEveryone: true,
//                   });
//                 } else {
//                   dispatch(removeMessage({ chatId, messageId: menuMessage._id }));
//                 }
//               } catch {
//                 toast.error("Failed to delete");
//               }
//             },
//           },
//         ]
//       );
//     };

//     const handleStar = async () => {
//       if (!menuMessage) return;
//       try {
//         await messageActionsApi.starMessage(menuMessage._id);
//         setStarredIds((prev) => {
//           const next = new Set(prev);
//           if (next.has(menuMessage._id)) next.delete(menuMessage._id);
//           else next.add(menuMessage._id);
//           return next;
//         });
//         toast.success(starredIds.has(menuMessage._id) ? "Unstarred" : "Starred");
//       } catch {
//         toast.error("Failed");
//       }
//     };

//     const handleCopy = async () => {
//       if (menuMessage?.content) {
//         await Clipboard.setStringAsync(menuMessage.content);
//         toast.success("Copied to clipboard");
//       }
//     };

//     // ── Derived values ─────────────────────────────────────────────────────────
//     const isGroup = chatInfo?.type === "group";
//     const otherParticipant = !isGroup
//       ? chatInfo?.participants.find((p) => p.user._id !== me?._id)
//       : null;
//     const displayName = isGroup ? chatInfo?.name : otherParticipant?.user.name;
//     const displayAvatar = isGroup
//       ? chatInfo?.avatar
//       : (otherParticipant?.user as User)?.avatar;
//     const isOtherOnline = !isGroup && (otherParticipant?.user as User)?.isOnline;
//     const initials = (displayName || "?")
//       .split(" ")
//       .map((w: string) => w[0])
//       .join("")
//       .slice(0, 2)
//       .toUpperCase();

//     // Build flat list data with date separators
//     // const listData: (
//     //   | Message
//     //   | { _id: string; type: "separator"; date: string }
//     // )[] = [];
//     // messages.forEach((msg: any, i: number) => {
//     //   const prev = messages[i - 1];
//     //   if (
//     //     !prev ||
//     //     formatDateSeparator(new Date(msg.createdAt)) !==
//     //       formatDateSeparator(new Date(prev.createdAt))
//     //   ) {
//     //     listData.push({
//     //       _id: `sep-${msg._id}`,
//     //       type: "separator",
//     //       date: formatDateSeparator(new Date(msg.createdAt)),
//     //     });
//     //   }
//     //   listData.push(msg);
//     // });

//     type ListItem =
//       | Message
//       | {
//           _id: string;
//           type: "separator";
//           date: string;
//         };

//     const listData = useMemo(() => {
//       const data: ListItem[] = [];

//       messages.forEach((msg, i) => {
//         const prev = messages[i - 1];

//         if (
//           !prev ||
//           formatDateSeparator(new Date(msg.createdAt)) !==
//             formatDateSeparator(new Date(prev.createdAt))
//         ) {
//           data.push({
//             _id: `sep-${msg._id}`,
//             type: "separator",
//             date: formatDateSeparator(new Date(msg.createdAt)),
//           });
//         }

//         data.push(msg);
//       });

//       return data;
//     }, [messages]);

//     return (
//       <View style={[styles.root, { backgroundColor: colors.background }]}>
//         {/* Header */}

//         <View style={{ backgroundColor: colors.surface }}>
//           <View style={[styles.header, { borderBottomColor: colors.border }]}>
//             <TouchableOpacity
//               onPress={() => router.back()}
//               style={styles.backBtn}
//             >
//               <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.headerInfo}
//               onPress={() =>
//                 isGroup
//                   ? router.push(`/group-info/${chatId}`)
//                   : router.push(`/profile/${otherParticipant?.user._id}`)
//               }
//               activeOpacity={0.75}
//             >
//               <View style={styles.headerAvatarWrap}>
//                 {displayAvatar ? (
//                   <Image
//                     source={{ uri: displayAvatar }}
//                     style={styles.headerAvatar}
//                     contentFit="cover"
//                   />
//                 ) : (
//                   <LinearGradient
//                     colors={["#00d4aa", "#5b8dee"]}
//                     style={styles.headerAvatarFb}
//                   >
//                     <Text style={styles.headerInitials}>{initials}</Text>
//                   </LinearGradient>
//                 )}
//                 {!isGroup && (
//                   <View
//                     style={[
//                       styles.onlineDot,
//                       {
//                         backgroundColor: isOtherOnline ? "#00d4aa" : "#555577",
//                         borderColor: colors.surface,
//                       },
//                     ]}
//                   />
//                 )}
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text
//                   style={[styles.headerName, { color: colors.textPrimary }]}
//                   numberOfLines={1}
//                 >
//                   {displayName || "…"}
//                 </Text>
//                 <Text
//                   style={[
//                     styles.headerStatus,
//                     { color: isOtherTyping ? "#00d4aa" : colors.textMuted },
//                   ]}
//                 >
//                   {isOtherTyping
//                     ? "typing…"
//                     : isGroup
//                     ? `${chatInfo?.participants.length || 0} members`
//                     : isOtherOnline
//                     ? "Online"
//                     : "Offline"}
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             <View style={styles.headerActions}>
//               {!isGroup && (
//                 <>
//                   <TouchableOpacity
//                     style={styles.hBtn}
//                     onPress={() => router.push(`/call/${chatId}?type=audio`)}
//                   >
//                     <Ionicons
//                       name="call-outline"
//                       size={20}
//                       color={colors.textPrimary}
//                     />
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={styles.hBtn}
//                     onPress={() => router.push(`/call/${chatId}?type=video`)}
//                   >
//                     <Ionicons
//                       name="videocam-outline"
//                       size={20}
//                       color={colors.textPrimary}
//                     />
//                   </TouchableOpacity>
//                 </>
//               )}
//               <TouchableOpacity
//                 style={styles.hBtn}
//                 onPress={() =>
//                   isGroup
//                     ? router.push(`/group-info/${chatId}`)
//                     : router.push(`/profile/${otherParticipant?.user._id}`)
//                 }
//               >
//                 <Ionicons
//                   name="ellipsis-vertical"
//                   size={20}
//                   color={colors.textPrimary}
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         {/* Messages list */}
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//         >
//           {loading ? (
//             <View style={styles.loadingWrap}>
//               <ActivityIndicator color="#00d4aa" size="large" />
//             </View>
//           ) : (
//             <FlatList
//               ref={flatListRef}
//               data={listData}
//               keyExtractor={(item) => item._id}
//               contentContainerStyle={[styles.listContent, { paddingBottom: 16 }]}
//               showsVerticalScrollIndicator={false}
//               viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
//               onEndReached={loadMore}
//               onEndReachedThreshold={0.2}
//               ListHeaderComponent={
//                 loadingMore ? (
//                   <ActivityIndicator color="#00d4aa" style={{ margin: 16 }} />
//                 ) : null
//               }
//               ListFooterComponent={
//                 activityList.length > 0 ? (
//                   <UserActivityIndicator
//                     activities={activityList}
//                     colors={colors}
//                   />
//                 ) : null
//               }
//               // ListFooterComponent={
//               //   typingIds.length > 0 ? (
//               //     <TypingIndicator names={typingIds} />
//               //   ) : null
//               // }
//               onContentSizeChange={() =>
//                 flatListRef.current?.scrollToEnd({ animated: false })
//               }
//               renderItem={({ item, index }) => {
//                 if ((item as any).type === "separator") {
//                   return (
//                     <DateSeparator date={(item as any).date} colors={colors} />
//                   );
//                 }
//                 const msg = item as Message;
//                 const isOwn =
//                   (msg.sender as User)?._id === me?._id || msg.sender === me?._id;
//                 const prevMsg = listData[index - 1] as Message | undefined;
//                 const prevSenderId =
//                   prevMsg && !(prevMsg as any).type
//                     ? (prevMsg.sender as User)?._id
//                     : null;
//                 const showAvatar =
//                   !isOwn &&
//                   (prevSenderId !== (msg.sender as User)?._id || !prevMsg);
//                 return (
//                   // <MessageBubble
//                   //   message={msg}
//                   //   isOwn={isOwn}
//                   //   showAvatar={showAvatar}
//                   //   myId={me?._id || ""}
//                   //   colors={colors}
//                   //   onLongPress={(m, anchor) => {
//                   //     setMenuMessage(m);
//                   //     setMenuAnchor(anchor);
//                   //   }}
//                   //   onReplyPress={(m) => setReplyTo(m)}
//                   //   onImagePress={(url) => {
//                   //     /* TODO: full screen viewer */
//                   //   }}
//                   // />
//                   <MessageBubble
//                     message={msg}
//                     isOwn={isOwn}
//                     showAvatar={showAvatar}
//                     myId={me?._id || ""}
//                     colors={colors}
//                     onLongPress={(m, anchor) => {
//                       setMenuMessage(m);
//                       setMenuAnchor(anchor);
//                     }}
//                     onReplyPress={(m) => setReplyTo(m)}
//                     onMediaPress={(uri, type) =>
//                       setMediaViewer({ visible: true, type, uri })
//                     }
//                   />
//                 );
//               }}
//             />
//           )}

//           {/* Upload progress */}
//           {uploading && <UploadingIndicator colors={colors} />}

//           {/* Reply bar */}
//           {replyTo && !editingMessage && (
//             <ReplyBar
//               replyTo={replyTo}
//               onCancel={() => setReplyTo(null)}
//               colors={colors}
//             />
//           )}

//           {/* Edit bar */}
//           {editingMessage && (
//             <View
//               style={[
//                 replyBarStyles.wrap,
//                 {
//                   backgroundColor: colors.surface,
//                   borderTopColor: colors.border,
//                 },
//               ]}
//             >
//               <View
//                 style={[replyBarStyles.indicator, { backgroundColor: "#ffc107" }]}
//               />
//               <View style={replyBarStyles.content}>
//                 <Text style={[replyBarStyles.name, { color: "#ffc107" }]}>
//                   Editing message
//                 </Text>
//                 <Text
//                   style={[
//                     replyBarStyles.preview,
//                     { color: colors.textSecondary },
//                   ]}
//                   numberOfLines={1}
//                 >
//                   {editingMessage.content}
//                 </Text>
//               </View>
//               <TouchableOpacity
//                 onPress={() => {
//                   setEditingMessage(null);
//                   setText("");
//                 }}
//                 style={replyBarStyles.close}
//               >
//                 <Ionicons name="close" size={18} color={colors.textMuted} />
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* Input bar */}
//           <View
//             style={[
//               styles.inputBar,
//               {
//                 backgroundColor: colors.surface,
//                 borderTopColor: colors.border,
//                 paddingBottom: Math.max(insets.bottom, 12),
//               },
//             ]}
//           >
//             <TouchableOpacity
//               style={styles.inputIconBtn}
//               onPress={() => {
//                 setShowEmoji((v) => !v);
//                 if (!showEmoji) Keyboard.dismiss();
//                 else inputRef.current?.focus();
//               }}
//             >
//               <Ionicons
//                 name={showEmoji ? "keypad-outline" : "happy-outline"}
//                 size={24}
//                 color={colors.textMuted}
//               />
//             </TouchableOpacity>

//             <View
//               style={[
//                 styles.inputWrap,
//                 { backgroundColor: colors.surface, borderColor: colors.border },
//               ]}
//             >
//               <TextInput
//                 ref={inputRef}
//                 style={[styles.input, { color: colors.textPrimary }]}
//                 value={text}
//                 onChangeText={handleTyping}
//                 placeholder={editingMessage ? "Edit message…" : "Message…"}
//                 placeholderTextColor={colors.textMuted}
//                 multiline
//                 maxLength={4000}
//                 onFocus={() => setShowEmoji(false)}
//               />
//             </View>

//             {text.trim().length > 0 || editingMessage ? (
//               <TouchableOpacity
//                 style={styles.sendBtn}
//                 onPress={sendText}
//                 disabled={sending}
//               >
//                 <LinearGradient
//                   colors={["#00d4aa", "#00b090"]}
//                   style={styles.sendGradient}
//                 >
//                   {sending ? (
//                     <ActivityIndicator size="small" color="#fff" />
//                   ) : (
//                     <Ionicons
//                       name={editingMessage ? "checkmark" : "send"}
//                       size={18}
//                       color="#fff"
//                     />
//                   )}
//                 </LinearGradient>
//               </TouchableOpacity>
//             ) : (
//               <>
//                 <TouchableOpacity
//                   style={styles.inputIconBtn}
//                   onPress={() => setShowAttachment(true)}
//                 >
//                   <Ionicons
//                     name="attach-outline"
//                     size={24}
//                     color={colors.textMuted}
//                   />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.inputIconBtn}
//                   onPress={() => setShowRecorder(true)}
//                 >
//                   <Ionicons
//                     name="mic-outline"
//                     size={24}
//                     color={colors.textMuted}
//                   />
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>

//           {/* Emoji panel */}
//           {/* <EmojiPanel
//             visible={showEmoji}
//             onPick={handleEmojiPick}
//             colors={colors}
//           /> */}

//           <EmojiPicker
//             onEmojiSelected={(emoji: EmojiType) => handleEmojiPick(emoji.emoji)}
//             open={showEmoji}
//             onClose={() => setShowEmoji(false)}
//           />

//           {/* Audio recorder */}
//           {showRecorder && (
//             <AudioRecorder
//               visible={showRecorder}
//               onSend={handleVoiceNote}
//               onCancel={() => setShowRecorder(false)}
//               colors={colors}
//             />
//           )}
//         </KeyboardAvoidingView>

//         {/* Floating action menu */}
//         <ReactionActionMenu
//           visible={!!menuMessage}
//           message={menuMessage}
//           anchor={menuAnchor}
//           isOwn={(menuMessage?.sender as User)?._id === me?._id}
//           isStarred={starredIds.has(menuMessage?._id || "")}
//           onClose={() => {
//             setMenuMessage(null);
//             setMenuAnchor(null);
//           }}
//           onReact={handleReact}
//           onReply={() => {
//             setReplyTo(menuMessage!);
//           }}
//           onEdit={() => {
//             setEditingMessage(menuMessage!);
//             setText(menuMessage!.content || "");
//             inputRef.current?.focus();
//           }}
//           onCopy={handleCopy}
//           onStar={handleStar}
//           onForward={() => setForwardMessageId(menuMessage!._id)}
//           onDelete={handleDelete}
//           colors={colors}
//         />

//         {/* Attachment sheet */}
//         <AttachmentSheet
//           visible={showAttachment}
//           onClose={() => setShowAttachment(false)}
//           onPick={handleAttachment}
//           onRecord={() => {
//             setShowAttachment(false);
//             setShowRecorder(true);
//           }}
//           colors={colors}
//         />

//         {/* Forward sheet */}
//         <ForwardSheet
//           visible={!!forwardMessageId}
//           messageId={forwardMessageId}
//           onClose={() => setForwardMessageId(null)}
//           colors={colors}
//         />

//         <MediaViewerModal
//           visible={mediaViewer.visible}
//           type={mediaViewer.type}
//           uri={mediaViewer.uri}
//           onClose={() =>
//             setMediaViewer({ visible: false, type: null, uri: null })
//           }
//         />
//       </View>
//     );
//   }

//   const styles = StyleSheet.create({
//     root: { flex: 1 },
//     header: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: 10,
//       paddingVertical: 10,
//       gap: 8,
//       borderBottomWidth: 1,
//     },
//     backBtn: {
//       width: 38,
//       height: 38,
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
//     headerAvatarWrap: { position: "relative" },
//     headerAvatar: { width: 42, height: 42, borderRadius: 21 },
//     headerAvatarFb: {
//       width: 42,
//       height: 42,
//       borderRadius: 21,
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     headerInitials: { color: "#fff", fontWeight: "700", fontSize: 15 },
//     onlineDot: {
//       position: "absolute",
//       bottom: 0,
//       right: 0,
//       width: 11,
//       height: 11,
//       borderRadius: 6,
//       borderWidth: 2,
//     },
//     headerName: { fontSize: 16, fontWeight: "800" },
//     headerStatus: { fontSize: 12, marginTop: 1 },
//     headerActions: { flexDirection: "row", gap: 2 },
//     hBtn: {
//       width: 38,
//       height: 38,
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
//     listContent: { paddingTop: 10, paddingHorizontal: 4 },
//     inputBar: {
//       flexDirection: "row",
//       alignItems: "flex-end",
//       paddingHorizontal: 10,
//       paddingTop: 10,
//       gap: 8,
//       borderTopWidth: 1,
//     },
//     inputIconBtn: {
//       width: 38,
//       height: 38,
//       justifyContent: "center",
//       alignItems: "center",
//       marginBottom: 2,
//     },
//     inputWrap: {
//       flex: 1,
//       borderRadius: 22,
//       borderWidth: 1,
//       paddingHorizontal: 14,
//       paddingVertical: 8,
//       maxHeight: 120,
//     },
//     input: { fontSize: 15, lineHeight: 21 },
//     sendBtn: {
//       width: 42,
//       height: 42,
//       borderRadius: 21,
//       overflow: "hidden",
//       marginBottom: 1,
//     },
//     sendGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
//   });
