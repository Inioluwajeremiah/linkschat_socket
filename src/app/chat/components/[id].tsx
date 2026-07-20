// // import {
// //   View,
// //   Text,
// //   FlatList,
// //   TouchableOpacity,
// //   StyleSheet,
// //   TextInput,
// //   KeyboardAvoidingView,
// //   Platform,
// //   Animated,
// //   ActivityIndicator,
// //   Pressable,
// // } from "react-native";
// // import { useEffect, useRef, useState, useCallback } from "react";
// // import { Color, useLocalSearchParams, useRouter } from "expo-router";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import { Ionicons } from "@expo/vector-icons";
// // import { LinearGradient } from "expo-linear-gradient";
// // import { Image } from "expo-image";
// // import {
// //   Colors,
// //   Spacing,
// //   BorderRadius,
// //   EMOJI_REACTIONS,
// // } from "../../constants";
// // import { useTheme } from "../../context/ThemeContext";
// // import { useToast } from "../../context/ToastContext";
// // import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
// // import * as ImagePicker from "expo-image-picker";
// // import * as Crypto from "expo-crypto";
// // import { Chat, Message, User } from "@/types";
// // import { chatApi } from "@/services/api";
// // import {
// //   addMessage,
// //   setActiveChat,
// //   setMessages,
// // } from "@/store/slices/chatSlice";
// // import { socketService } from "@/services/socket";
// // import { formatTime } from "@/utils/date";

// // function TypingIndicator({ names }: { names: string[] }) {
// //   const { colors } = useTheme();
// //   const dot1 = useRef(new Animated.Value(0)).current;
// //   const dot2 = useRef(new Animated.Value(0)).current;
// //   const dot3 = useRef(new Animated.Value(0)).current;

// //   useEffect(() => {
// //     const anim = (dot: Animated.Value, delay: number) =>
// //       Animated.loop(
// //         Animated.sequence([
// //           Animated.delay(delay),
// //           Animated.timing(dot, {
// //             toValue: -4,
// //             duration: 300,
// //             useNativeDriver: true,
// //           }),
// //           Animated.timing(dot, {
// //             toValue: 0,
// //             duration: 300,
// //             useNativeDriver: true,
// //           }),
// //         ])
// //       );
// //     Animated.parallel([
// //       anim(dot1, 0),
// //       anim(dot2, 150),
// //       anim(dot3, 300),
// //     ]).start();
// //   }, []);

// //   return (
// //     <View style={typingStyles.wrap}>
// //       <View style={[typingStyles.bubble, { backgroundColor: colors.primary }]}>
// //         {[dot1, dot2, dot3].map((d, i) => (
// //           <Animated.View
// //             key={i}
// //             style={[
// //               typingStyles.dot,
// //               {
// //                 backgroundColor: colors.textMuted,
// //                 transform: [{ translateY: d }],
// //               },
// //             ]}
// //           />
// //         ))}
// //       </View>
// //       <Text style={[typingStyles.label, { color: colors.textMuted }]}>
// //         {names.join(", ")} typing...
// //       </Text>
// //     </View>
// //   );
// // }

// // const typingStyles = StyleSheet.create({
// //   wrap: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: Spacing.base,
// //     paddingBottom: 4,
// //     gap: 8,
// //   },
// //   bubble: {
// //     flexDirection: "row",
// //     gap: 4,

// //     padding: 10,
// //     borderRadius: 14,
// //     alignItems: "center",
// //   },
// //   dot: { width: 6, height: 6, borderRadius: 3 },
// //   label: { fontSize: 12, fontStyle: "italic" },
// // });

// // function MessageBubble({
// //   message,
// //   isOwn,
// //   onLongPress,
// //   onReply,
// // }: {
// //   message: Message;
// //   isOwn: boolean;
// //   onLongPress: (msg: Message) => void;
// //   onReply: (msg: Message) => void;
// // }) {
// //   const sender = message.sender as User;
// //   const slideAnim = useRef(new Animated.Value(isOwn ? 40 : -40)).current;
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const { colors } = useTheme();
// //   useEffect(() => {
// //     Animated.parallel([
// //       Animated.spring(slideAnim, {
// //         toValue: 0,
// //         useNativeDriver: true,
// //         tension: 200,
// //         friction: 20,
// //       }),
// //       Animated.timing(fadeAnim, {
// //         toValue: 1,
// //         duration: 200,
// //         useNativeDriver: true,
// //       }),
// //     ]).start();
// //   }, []);

// //   const isDeleted = message.isDeleted;

// //   return (
// //     <Animated.View
// //       style={[
// //         styles.msgRow,
// //         isOwn ? styles.msgRowOwn : styles.msgRowOther,
// //         { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
// //       ]}
// //     >
// //       {!isOwn && (
// //         <View style={styles.msgAvatarWrap}>
// //           {sender?.avatar ? (
// //             <Image
// //               source={{ uri: sender.avatar }}
// //               style={styles.msgAvatar}
// //               contentFit="cover"
// //             />
// //           ) : (
// //             <LinearGradient
// //               colors={[Colors.secondary, Colors.primary]}
// //               style={styles.msgAvatarFallback}
// //             >
// //               <Text
// //                 style={[
// //                   styles.msgAvatarInitials,
// //                   { color: colors.textInverse },
// //                 ]}
// //               >
// //                 {sender?.name?.charAt(0).toUpperCase() || "?"}
// //               </Text>
// //             </LinearGradient>
// //           )}
// //         </View>
// //       )}

// //       <Pressable
// //         onLongPress={() => onLongPress(message)}
// //         style={[
// //           styles.bubble,
// //           isOwn
// //             ? styles.bubbleOwn
// //             : [styles.bubbleOther, { backgroundColor: colors.surface }],
// //         ]}
// //       >
// //         {/* Reply reference */}
// //         {message.replyTo && !isDeleted && (
// //           <View style={styles.replyRef}>
// //             <View
// //               style={[
// //                 styles.replyRefBar,
// //                 { backgroundColor: colors.background },
// //               ]}
// //             />
// //             <View>
// //               <Text style={styles.replyRefSender}>
// //                 {(message.replyTo.sender as User)?.name || "Unknown"}
// //               </Text>
// //               <Text
// //                 style={[
// //                   styles.replyRefContent,
// //                   { color: colors.textSecondary },
// //                 ]}
// //                 numberOfLines={1}
// //               >
// //                 {(message.replyTo as Message).content}
// //               </Text>
// //             </View>
// //           </View>
// //         )}

// //         {isDeleted ? (
// //           <View style={styles.deletedMsg}>
// //             <Ionicons name="ban-outline" size={14} color={Colors.textMuted} />
// //             <Text style={[styles.deletedText, { color: colors.textMuted }]}>
// //               Message deleted
// //             </Text>
// //           </View>
// //         ) : message.type === "image" && message.mediaUrl ? (
// //           <View>
// //             <Image
// //               source={{ uri: message.mediaUrl }}
// //               style={styles.msgImage}
// //               contentFit="cover"
// //             />
// //             {message.content ? (
// //               <Text
// //                 style={[
// //                   styles.msgText,
// //                   { color: colors.bubbleOtherText },
// //                   isOwn && styles.msgTextOwn,
// //                 ]}
// //               >
// //                 {message.content}
// //               </Text>
// //             ) : null}
// //           </View>
// //         ) : (
// //           <Text style={[styles.msgText, isOwn && styles.msgTextOwn]}>
// //             {message.content}
// //           </Text>
// //         )}

// //         <View style={styles.msgMeta}>
// //           {message.isEdited && <Text style={styles.editedLabel}>edited</Text>}
// //           <Text
// //             style={[
// //               styles.msgTime,
// //               { color: colors.textMuted },
// //               isOwn && styles.msgTimeOwn,
// //             ]}
// //           >
// //             {formatTime(new Date(message.createdAt))}
// //           </Text>
// //           {isOwn && (
// //             <Ionicons
// //               name={message.readBy?.length > 1 ? "checkmark-done" : "checkmark"}
// //               size={14}
// //               color={
// //                 message.readBy?.length > 1
// //                   ? Colors.primary
// //                   : "rgba(255,255,255,0.6)"
// //               }
// //             />
// //           )}
// //         </View>

// //         {/* Reactions */}
// //         {message.reactions.length > 0 && (
// //           <View style={styles.reactionsRow}>
// //             {Object.entries(
// //               message.reactions.reduce<Record<string, number>>((acc, r) => {
// //                 acc[r.emoji] = (acc[r.emoji] || 0) + 1;
// //                 return acc;
// //               }, {})
// //             ).map(([emoji, count]) => (
// //               <View
// //                 key={emoji}
// //                 style={[
// //                   styles.reactionChip,
// //                   {
// //                     backgroundColor: colors.surface,
// //                     borderColor: colors.border,
// //                   },
// //                 ]}
// //               >
// //                 <Text style={styles.reactionEmoji}>{emoji}</Text>
// //                 {count > 1 && (
// //                   <Text
// //                     style={[
// //                       styles.reactionCount,
// //                       { color: colors.textSecondary },
// //                     ]}
// //                   >
// //                     {count}
// //                   </Text>
// //                 )}
// //               </View>
// //             ))}
// //           </View>
// //         )}
// //       </Pressable>

// //       {/* Swipe-to-reply button */}
// //       <TouchableOpacity
// //         style={styles.replyBtn}
// //         onPress={() => onReply(message)}
// //       >
// //         <Ionicons
// //           name="return-up-back-outline"
// //           size={16}
// //           color={Colors.textMuted}
// //         />
// //       </TouchableOpacity>
// //     </Animated.View>
// //   );
// // }

// // export default function ChatScreen() {
// //   const { colors, isDark } = useTheme();
// //   const { id: chatId } = useLocalSearchParams<{ id: string }>();
// //   const router = useRouter();
// //   const dispatch = useAppDispatch();
// //   const { user } = useAppSelector((s) => s.auth);
// //   const {
// //     messages: allMessages,
// //     activeChat,
// //     typingUsers,
// //   } = useAppSelector((s) => s.chat);
// //   const messages = allMessages[chatId] || [];
// //   const typingIds = typingUsers[chatId] || [];

// //   const [input, setInput] = useState("");
// //   const [chatInfo, setChatInfo] = useState<Chat | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [replyTo, setReplyTo] = useState<Message | null>(null);
// //   const [showReactions, setShowReactions] = useState<string | null>(null);

// //   const flatListRef = useRef<FlatList>(null);
// //   // const typingTimer = useRef<ReturnType<typeof setTimeout>>();
// //   const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

// //   // Load chat info + messages
// //   useEffect(() => {
// //     const init = async () => {
// //       try {
// //         const [chatRes, msgRes] = await Promise.all([
// //           chatApi.getChatInfo(chatId),
// //           chatApi.getMessages(chatId),
// //         ]);
// //         if (chatRes.success) {
// //           setChatInfo(chatRes.data.chat);
// //           dispatch(setActiveChat(chatRes.data.chat));
// //         }
// //         if (msgRes.success)
// //           dispatch(setMessages({ chatId, messages: msgRes.data.messages }));
// //       } catch {
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     init();

// //     socketService.joinChat(chatId);
// //     socketService.markRead(chatId);

// //     return () => {
// //       socketService.leaveChat(chatId);
// //       dispatch(setActiveChat(null));
// //     };
// //   }, [chatId]);

// //   // Listen for new messages
// //   useEffect(() => {
// //     const socket = socketService.getSocket();
// //     if (!socket) return;
// //     socket.on("message:new", (msg: Message) => {
// //       if (msg.chatId === chatId) {
// //         dispatch(addMessage({ chatId, message: msg }));
// //         socketService.markRead(chatId);
// //         setTimeout(
// //           () => flatListRef.current?.scrollToEnd({ animated: true }),
// //           100
// //         );
// //       }
// //     });
// //     return () => {
// //       socket.off("message:new");
// //     };
// //   }, [chatId]);

// //   const handleSend = useCallback(() => {
// //     const text = input.trim();
// //     if (!text) return;

// //     const tempId = Crypto.randomUUID();
// //     const optimistic: Message = {
// //       _id: tempId,
// //       chatId,
// //       sender: user!,
// //       content: text,
// //       type: "text",
// //       reactions: [],
// //       readBy: [{ user: user!, readAt: new Date().toISOString() }],
// //       deliveredTo: [],
// //       isDeleted: false,
// //       deletedFor: [],
// //       isEdited: false,
// //       createdAt: new Date().toISOString(),
// //       updatedAt: new Date().toISOString(),
// //       tempId,
// //       ...(replyTo ? { replyTo } : {}),
// //     };

// //     dispatch(addMessage({ chatId, message: optimistic }));
// //     socketService.sendMessage({
// //       chatId,
// //       content: text,
// //       replyTo: replyTo?._id,
// //       tempId,
// //     });
// //     setInput("");
// //     setReplyTo(null);
// //     socketService.stopTyping(chatId);

// //     setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
// //   }, [input, chatId, replyTo, user, dispatch]);

// //   const handleTyping = (text: string) => {
// //     setInput(text);
// //     socketService.startTyping(chatId);
// //     if (typingTimer.current) clearTimeout(typingTimer.current);
// //     typingTimer.current = setTimeout(
// //       () => socketService.stopTyping(chatId),
// //       1500
// //     );
// //   };

// //   const getDisplayName = () => {
// //     if (!chatInfo) return "";
// //     if (chatInfo.type === "group") return chatInfo.name;
// //     return (
// //       chatInfo.participants.find((p) => p.user._id !== user?._id)?.user?.name ||
// //       ""
// //     );
// //   };

// //   const getDisplayAvatar = () => {
// //     if (!chatInfo) return null;
// //     if (chatInfo.type === "group") return chatInfo.avatar;
// //     return chatInfo.participants.find((p) => p.user._id !== user?._id)?.user
// //       ?.avatar;
// //   };

// //   const otherParticipant = chatInfo?.participants.find(
// //     (p) => p.user._id !== user?._id
// //   );
// //   const isOtherOnline = otherParticipant?.user?.isOnline;
// //   const displayAvatar = getDisplayAvatar();
// //   const displayName = getDisplayName();
// //   const initials = (displayName || "?")
// //     .split(" ")
// //     .map((w) => w[0])
// //     .join("")
// //     .slice(0, 2)
// //     .toUpperCase();

// //   return (
// //     <SafeAreaView
// //       style={[styles.container, { backgroundColor: colors.background }]}
// //       edges={["top"]}
// //     >
// //       {/* Header */}
// //       <View style={[styles.header, { borderBottomColor: colors.border }]}>
// //         <TouchableOpacity
// //           onPress={() => router.back()}
// //           style={[styles.backBtn]}
// //         >
// //           <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
// //         </TouchableOpacity>

// //         <TouchableOpacity
// //           style={styles.headerInfo}
// //           onPress={() => router.push(`/profile/${otherParticipant?.user._id}`)}
// //         >
// //           <View style={styles.headerAvatarWrap}>
// //             {displayAvatar ? (
// //               <Image
// //                 source={{ uri: displayAvatar }}
// //                 style={styles.headerAvatar}
// //                 contentFit="cover"
// //               />
// //             ) : (
// //               <LinearGradient
// //                 colors={[Colors.primary, Colors.secondary]}
// //                 style={styles.headerAvatarFallback}
// //               >
// //                 <Text
// //                   style={[
// //                     styles.headerAvatarInitials,
// //                     { color: colors.textInverse },
// //                   ]}
// //                 >
// //                   {initials}
// //                 </Text>
// //               </LinearGradient>
// //             )}
// //             {isOtherOnline && <View style={styles.onlineDot} />}
// //           </View>
// //           <View>
// //             <Text style={[styles.headerName, { color: colors.textPrimary }]}>
// //               {displayName}
// //             </Text>
// //             {typingIds.length > 0 ? (
// //               <Text style={styles.headerTyping}>typing...</Text>
// //             ) : (
// //               <Text style={[styles.headerStatus, { color: colors.textMuted }]}>
// //                 {isOtherOnline ? "Online" : "Offline"}
// //               </Text>
// //             )}
// //           </View>
// //         </TouchableOpacity>

// //         <View style={styles.headerActions}>
// //           <TouchableOpacity
// //             style={[
// //               styles.actionBtn,
// //               { borderColor: colors.border, backgroundColor: colors.surface },
// //             ]}
// //             onPress={() => router.push(`/call/${chatId}?type=audio`)}
// //           >
// //             <Ionicons
// //               name="call-outline"
// //               size={20}
// //               color={colors.textPrimary}
// //             />
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={[
// //               styles.actionBtn,
// //               { borderColor: colors.border, backgroundColor: colors.surface },
// //             ]}
// //             onPress={() => router.push(`/call/${chatId}?type=video`)}
// //           >
// //             <Ionicons
// //               name="videocam-outline"
// //               size={20}
// //               color={colors.textPrimary}
// //             />
// //           </TouchableOpacity>
// //         </View>
// //       </View>

// //       <KeyboardAvoidingView
// //         style={{ flex: 1 }}
// //         behavior={Platform.OS === "ios" ? "padding" : undefined}
// //         keyboardVerticalOffset={0}
// //       >
// //         {loading ? (
// //           <View style={styles.loadingWrap}>
// //             <ActivityIndicator color={colors.primary} size="large" />
// //           </View>
// //         ) : (
// //           <FlatList
// //             ref={flatListRef}
// //             data={messages}
// //             keyExtractor={(m) => m._id}
// //             renderItem={({ item }) => (
// //               <MessageBubble
// //                 message={item}
// //                 isOwn={
// //                   (item.sender as User)?._id === user?._id ||
// //                   item.sender === user?._id
// //                 }
// //                 onLongPress={(msg) => setShowReactions(msg._id)}
// //                 onReply={setReplyTo}
// //               />
// //             )}
// //             contentContainerStyle={styles.messageList}
// //             showsVerticalScrollIndicator={false}
// //             onContentSizeChange={() =>
// //               flatListRef.current?.scrollToEnd({ animated: false })
// //             }
// //             ListFooterComponent={
// //               typingIds.length > 0 ? (
// //                 <TypingIndicator names={typingIds} />
// //               ) : null
// //             }
// //           />
// //         )}

// //         {/* Reply preview */}
// //         {replyTo && (
// //           <View
// //             style={[
// //               styles.replyPreview,
// //               { backgroundColor: colors.surface, borderColor: colors.border },
// //             ]}
// //           >
// //             <View
// //               style={[
// //                 styles.replyPreviewBar,
// //                 { backgroundColor: colors.tabActive },
// //               ]}
// //             />
// //             <View style={{ flex: 1 }}>
// //               <Text
// //                 style={[styles.replyPreviewSender, { color: colors.tabActive }]}
// //               >
// //                 {(replyTo.sender as User)?.name}
// //               </Text>
// //               <Text
// //                 style={[
// //                   styles.replyPreviewContent,
// //                   { color: colors.textSecondary },
// //                 ]}
// //                 numberOfLines={1}
// //               >
// //                 {replyTo.content}
// //               </Text>
// //             </View>
// //             <TouchableOpacity onPress={() => setReplyTo(null)}>
// //               <Ionicons name="close" size={20} color={Colors.textMuted} />
// //             </TouchableOpacity>
// //           </View>
// //         )}

// //         {/* Input bar */}
// //         <View
// //           style={[
// //             styles.inputBar,
// //             {
// //               borderTopColor: colors.border,
// //               backgroundColor: colors.background,
// //             },
// //           ]}
// //         >
// //           <TouchableOpacity style={styles.attachBtn}>
// //             <Ionicons
// //               name="attach-outline"
// //               size={22}
// //               color={Colors.textMuted}
// //             />
// //           </TouchableOpacity>

// //           <View
// //             style={[
// //               styles.inputWrap,
// //               { backgroundColor: colors.surface, borderColor: colors.border },
// //             ]}
// //           >
// //             <TextInput
// //               style={[styles.input, { color: colors.textPrimary }]}
// //               value={input}
// //               onChangeText={handleTyping}
// //               placeholder="Message..."
// //               placeholderTextColor={Colors.textMuted}
// //               multiline
// //               maxLength={2000}
// //             />
// //             <TouchableOpacity style={styles.emojiBtn}>
// //               <Ionicons
// //                 name="happy-outline"
// //                 size={20}
// //                 color={Colors.textMuted}
// //               />
// //             </TouchableOpacity>
// //           </View>

// //           <TouchableOpacity
// //             style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
// //             onPress={handleSend}
// //             disabled={!input.trim()}
// //             activeOpacity={0.8}
// //           >
// //             <LinearGradient
// //               colors={
// //                 input.trim()
// //                   ? [Colors.primary, Colors.primaryDark]
// //                   : [Colors.surface, Colors.surface]
// //               }
// //               style={styles.sendGradient}
// //             >
// //               <Ionicons
// //                 name="send"
// //                 size={18}
// //                 color={input.trim() ? "#fff" : Colors.textMuted}
// //               />
// //             </LinearGradient>
// //           </TouchableOpacity>
// //         </View>
// //       </KeyboardAvoidingView>

// //       {/* Reaction picker modal */}
// //       {showReactions && (
// //         <Pressable
// //           style={styles.reactionsOverlay}
// //           onPress={() => setShowReactions(null)}
// //         >
// //           <View
// //             style={[
// //               styles.reactionsPicker,
// //               { backgroundColor: colors.surface, borderColor: colors.border },
// //             ]}
// //           >
// //             {EMOJI_REACTIONS.map((emoji) => (
// //               <TouchableOpacity
// //                 key={emoji}
// //                 onPress={() => {
// //                   socketService.emit("message:react", {
// //                     messageId: showReactions,
// //                     emoji,
// //                     chatId,
// //                   });
// //                   setShowReactions(null);
// //                 }}
// //               >
// //                 <Text style={styles.emojiOption}>{emoji}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>
// //         </Pressable>
// //       )}
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1 },
// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: Spacing.sm,
// //     paddingVertical: 10,
// //     borderBottomWidth: 1,

// //     gap: 8,
// //   },
// //   backBtn: {
// //     width: 40,
// //     height: 40,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
// //   headerAvatarWrap: { position: "relative" },
// //   headerAvatar: { width: 42, height: 42, borderRadius: 21 },
// //   headerAvatarFallback: {
// //     width: 42,
// //     height: 42,
// //     borderRadius: 21,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   headerAvatarInitials: { fontWeight: "700", fontSize: 15 },
// //   onlineDot: {
// //     position: "absolute",
// //     bottom: 1,
// //     right: 1,
// //     width: 11,
// //     height: 11,
// //     borderRadius: 6,
// //     backgroundColor: Colors.primary,
// //     borderWidth: 2,
// //     borderColor: Colors.primary,
// //   },
// //   headerName: { fontSize: 16, fontWeight: "700" },
// //   headerStatus: { fontSize: 12 },
// //   headerTyping: { fontSize: 12, color: Colors.primary, fontStyle: "italic" },
// //   headerActions: { flexDirection: "row", gap: 4 },
// //   actionBtn: {
// //     width: 38,
// //     height: 38,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     borderRadius: 19,

// //     borderWidth: 1,
// //   },
// //   loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   messageList: { paddingVertical: 12, paddingHorizontal: 8 },
// //   msgRow: {
// //     flexDirection: "row",
// //     alignItems: "flex-end",
// //     marginBottom: 4,
// //     gap: 6,
// //   },
// //   msgRowOwn: { justifyContent: "flex-end" },
// //   msgRowOther: { justifyContent: "flex-start" },
// //   msgAvatarWrap: { marginBottom: 4 },
// //   msgAvatar: { width: 28, height: 28, borderRadius: 14 },
// //   msgAvatarFallback: {
// //     width: 28,
// //     height: 28,
// //     borderRadius: 14,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   msgAvatarInitials: { fontSize: 10, fontWeight: "700" },
// //   bubble: {
// //     maxWidth: "75%",
// //     borderRadius: 18,
// //     padding: 10,
// //     paddingHorizontal: 14,
// //   },
// //   bubbleOwn: { backgroundColor: Colors.bubbleOwn, borderBottomRightRadius: 4 },
// //   bubbleOther: { borderBottomLeftRadius: 4 },
// //   replyRef: {
// //     flexDirection: "row",
// //     gap: 8,
// //     marginBottom: 6,
// //     backgroundColor: "rgba(0,0,0,0.15)",
// //     borderRadius: 8,
// //     padding: 6,
// //   },
// //   replyRefBar: { width: 3, borderRadius: 2 },
// //   replyRefSender: { fontSize: 11, fontWeight: "700", color: Colors.primary },
// //   replyRefContent: { fontSize: 12 },
// //   msgImage: { width: 220, height: 160, borderRadius: 12, marginBottom: 4 },
// //   msgText: { fontSize: 15, lineHeight: 20 },
// //   msgTextOwn: { color: Colors.bubbleOwnText },
// //   deletedMsg: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: 6,
// //     opacity: 0.6,
// //   },
// //   deletedText: { fontSize: 13, fontStyle: "italic" },
// //   msgMeta: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "flex-end",
// //     gap: 4,
// //     marginTop: 4,
// //   },
// //   editedLabel: {
// //     fontSize: 10,
// //     color: "rgba(255,255,255,0.5)",
// //     fontStyle: "italic",
// //   },
// //   msgTime: { fontSize: 10 },
// //   msgTimeOwn: { color: "rgba(255,255,255,0.65)" },
// //   reactionsRow: {
// //     flexDirection: "row",
// //     gap: 4,
// //     marginTop: 6,
// //     flexWrap: "wrap",
// //   },
// //   reactionChip: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     borderRadius: 99,
// //     paddingHorizontal: 6,
// //     paddingVertical: 2,
// //     gap: 2,
// //   },
// //   reactionEmoji: { fontSize: 13 },
// //   reactionCount: { fontSize: 11, fontWeight: "700" },
// //   replyBtn: { opacity: 0, width: 28, height: 28 }, // invisible but pressable
// //   replyPreview: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: Spacing.base,
// //     paddingVertical: 10,
// //     gap: 10,
// //     borderTopWidth: 1,
// //   },
// //   replyPreviewBar: {
// //     width: 3,
// //     height: "100%",
// //     borderRadius: 2,
// //   },
// //   replyPreviewSender: { fontSize: 12, fontWeight: "700" },
// //   replyPreviewContent: { fontSize: 13 },
// //   inputBar: {
// //     flexDirection: "row",
// //     alignItems: "flex-end",
// //     paddingHorizontal: 10,
// //     paddingVertical: 10,
// //     gap: 8,
// //     borderTopWidth: 1,
// //   },
// //   attachBtn: {
// //     width: 40,
// //     height: 40,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   inputWrap: {
// //     flex: 1,
// //     flexDirection: "row",
// //     alignItems: "flex-end",

// //     borderRadius: 24,
// //     borderWidth: 1,

// //     paddingHorizontal: 14,
// //     paddingVertical: 8,
// //     minHeight: 44,
// //   },
// //   input: { flex: 1, fontSize: 15, maxHeight: 120 },
// //   emojiBtn: {
// //     width: 28,
// //     height: 28,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   sendBtn: { width: 44, height: 44, borderRadius: 22, overflow: "hidden" },
// //   sendBtnDisabled: {},
// //   sendGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   reactionsOverlay: {
// //     ...StyleSheet.absoluteFillObject,
// //     backgroundColor: "rgba(0,0,0,0.5)",
// //     justifyContent: "center",
// //     alignItems: "center",
// //     zIndex: 50,
// //   },
// //   reactionsPicker: {
// //     flexDirection: "row",
// //     gap: 8,

// //     borderRadius: 99,
// //     paddingHorizontal: 20,
// //     paddingVertical: 12,
// //     borderWidth: 1,
// //   },
// //   emojiOption: { fontSize: 28 },
// // });

// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   Animated,
//   ActivityIndicator,
//   Pressable,
//   Alert,
//   Keyboard,
//   Modal,
//   Dimensions,
//   AppState,
// } from "react-native";
// import { useEffect, useRef, useState, useCallback } from "react";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import {
//   SafeAreaView,
//   useSafeAreaInsets,
// } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import * as Clipboard from "expo-clipboard";
// import { useTheme } from "../../context/ThemeContext";
// import { useToast } from "../../context/ToastContext";
// import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
// import {
//   setMessages,
//   addMessage,
//   updateMessage,
//   removeMessage,
//   clearUnread,
// } from "../../store/slices/chatSlice";
// import { chatApi, messageActionsApi, uploadFileToS3 } from "../../services/api";
// import { socketService } from "../../services/socket";
// import { Message, User, Chat } from "../../types";
// import { formatTime, formatDateSeparator } from "../../utils/date";
// import MessageBubble from "./components/MessageBubble";
// import ReactionActionMenu from "./components/ReactionActionMenu";
// import AttachmentSheet, {
//   AttachmentResult,
// } from "./components/AttachmentSheet";
// import AudioRecorder from "./components/AudioRecorder";
// import ForwardSheet from "./components/ForwardSheet";

// const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
// const EMOJI_ROWS = [
//   "😀😂🥰😍🤩😎🥳🤔😅😭",
//   "❤️🔥💯✨🎉👏🙌💪🎯🏆",
//   "😤🤣😊🥺😢😡🤯🥱😏🤗",
// ];

// // ─── Date separator ───────────────────────────────────────────────────────────
// function DateSeparator({ date, colors }: { date: string; colors: any }) {
//   return (
//     <View style={sepStyles.wrap}>
//       <View style={[sepStyles.line, { backgroundColor: colors.border }]} />
//       <Text
//         style={[
//           sepStyles.label,
//           { color: colors.textMuted, backgroundColor: colors.background },
//         ]}
//       >
//         {date}
//       </Text>
//       <View style={[sepStyles.line, { backgroundColor: colors.border }]} />
//     </View>
//   );
// }
// const sepStyles = StyleSheet.create({
//   wrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     marginVertical: 12,
//     gap: 10,
//   },
//   line: { flex: 1, height: StyleSheet.hairlineWidth },
//   label: {
//     fontSize: 11,
//     fontWeight: "600",
//     paddingHorizontal: 10,
//     paddingVertical: 3,
//     borderRadius: 99,
//   },
// });

// // ─── Reply bar ────────────────────────────────────────────────────────────────
// function ReplyBar({
//   replyTo,
//   onCancel,
//   colors,
// }: {
//   replyTo: Message;
//   onCancel: () => void;
//   colors: any;
// }) {
//   const sender = replyTo.sender as User;
//   const preview =
//     replyTo.type === "image"
//       ? "📷 Photo"
//       : replyTo.type === "audio"
//       ? "🎵 Voice note"
//       : replyTo.type === "video"
//       ? "🎥 Video"
//       : replyTo.content?.slice(0, 80) || "";
//   const slideAnim = useRef(new Animated.Value(-60)).current;

//   useEffect(() => {
//     Animated.spring(slideAnim, {
//       toValue: 0,
//       useNativeDriver: true,
//       tension: 280,
//       friction: 22,
//     }).start();
//   }, []);

//   return (
//     <Animated.View
//       style={[
//         replyBarStyles.wrap,
//         {
//           backgroundColor: colors.surface,
//           borderTopColor: colors.border,
//           transform: [{ translateY: slideAnim }],
//         },
//       ]}
//     >
//       <View style={replyBarStyles.indicator} />
//       <View style={replyBarStyles.content}>
//         <Text style={replyBarStyles.name}>{sender?.name || "Unknown"}</Text>
//         <Text
//           style={[replyBarStyles.preview, { color: colors.textSecondary }]}
//           numberOfLines={1}
//         >
//           {preview}
//         </Text>
//       </View>
//       <TouchableOpacity onPress={onCancel} style={replyBarStyles.close}>
//         <Ionicons name="close" size={18} color={colors.textMuted} />
//       </TouchableOpacity>
//     </Animated.View>
//   );
// }
// const replyBarStyles = StyleSheet.create({
//   wrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     gap: 10,
//   },
//   indicator: {
//     width: 3,
//     height: 36,
//     borderRadius: 2,
//     backgroundColor: "#00d4aa",
//   },
//   content: { flex: 1 },
//   name: { fontSize: 12, fontWeight: "700", color: "#00d4aa" },
//   preview: { fontSize: 13, marginTop: 1 },
//   close: { padding: 4 },
// });

// // ─── Emoji panel ──────────────────────────────────────────────────────────────
// function EmojiPanel({
//   visible,
//   onPick,
//   colors,
// }: {
//   visible: boolean;
//   onPick: (e: string) => void;
//   colors: any;
// }) {
//   const slideAnim = useRef(new Animated.Value(300)).current;

//   useEffect(() => {
//     Animated.spring(slideAnim, {
//       toValue: visible ? 0 : 300,
//       useNativeDriver: true,
//       tension: 280,
//       friction: 24,
//     }).start();
//   }, [visible]);

//   if (!visible) return null;

//   return (
//     <Animated.View
//       style={[
//         emojiStyles.panel,
//         {
//           backgroundColor: colors.surface,
//           borderTopColor: colors.border,
//           transform: [{ translateY: slideAnim }],
//         },
//       ]}
//     >
//       {EMOJI_ROWS.map((row, ri) => (
//         <View key={ri} style={emojiStyles.row}>
//           {row
//             .split("")
//             .filter((_, i) => i % 2 === 0)
//             .map((_, ci) => {
//               const emoji =
//                 Array.from(row)[ci * 2] + (Array.from(row)[ci * 2 + 1] || "");
//               if (!emoji.trim()) return null;
//               return (
//                 <TouchableOpacity
//                   key={ci}
//                   onPress={() => onPick(emoji.trim())}
//                   style={emojiStyles.btn}
//                 >
//                   <Text style={emojiStyles.emoji}>{emoji.trim()}</Text>
//                 </TouchableOpacity>
//               );
//             })}
//         </View>
//       ))}
//     </Animated.View>
//   );
// }
// const emojiStyles = StyleSheet.create({
//   panel: { borderTopWidth: 1, paddingVertical: 12, paddingHorizontal: 8 },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 4,
//   },
//   btn: { padding: 6 },
//   emoji: { fontSize: 26 },
// });

// // ─── Upload progress indicator ────────────────────────────────────────────────
// function UploadingIndicator({ colors }: { colors: any }) {
//   return (
//     <View
//       style={[
//         upStyles.wrap,
//         { backgroundColor: colors.surface, borderColor: colors.border },
//       ]}
//     >
//       <ActivityIndicator color="#00d4aa" size="small" />
//       <Text style={[upStyles.text, { color: colors.textSecondary }]}>
//         Uploading…
//       </Text>
//     </View>
//   );
// }
// const upStyles = StyleSheet.create({
//   wrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderTopWidth: 1,
//   },
//   text: { fontSize: 13 },
// });

// // ─── Main screen ──────────────────────────────────────────────────────────────
// export default function ChatScreen() {
//   const { id: chatId } = useLocalSearchParams<{ id: string }>();

//   // console.log("join chat chatId ==>> ", chatId);
//   const router = useRouter();
//   const { colors } = useTheme();
//   const toast = useToast();
//   const dispatch = useAppDispatch();
//   const { user: me } = useAppSelector((s) => s.auth);
//   const messages = useAppSelector((s) => s.chat.messages[chatId] || []);
//   const insets = useSafeAreaInsets();

//   const [chatInfo, setChatInfo] = useState<Chat | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [text, setText] = useState("");
//   const [replyTo, setReplyTo] = useState<Message | null>(null);
//   const [editingMessage, setEditingMessage] = useState<Message | null>(null);
//   const [showEmoji, setShowEmoji] = useState(false);
//   const [showAttachment, setShowAttachment] = useState(false);
//   const [showRecorder, setShowRecorder] = useState(false);
//   const [forwardMessageId, setForwardMessageId] = useState<string | null>(null);
//   const [menuMessage, setMenuMessage] = useState<Message | null>(null);
//   const [menuAnchor, setMenuAnchor] = useState<any>(null);
//   const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
//   const [isTyping, setIsTyping] = useState(false);
//   const [otherTyping, setOtherTyping] = useState(false);
//   // ── Pagination state ───────────────────────────────────────────────────────
//   const [currentPage, setCurrentPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);

//   const flatListRef = useRef<FlatList>(null);
//   const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const inputRef = useRef<TextInput>(null);

//   // ── Load initial data ──────────────────────────────────────────────────────
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [chatRes, msgRes] = await Promise.all([
//           chatApi.getChatInfo(chatId),
//           chatApi.getMessages(chatId, 1), // page 1, no before
//         ]);
//         if (chatRes.success) setChatInfo(chatRes.data.chat);
//         if (msgRes.success) {
//           dispatch(setMessages({ chatId, messages: msgRes.data.messages }));
//           // Use hasNextPage from pagination to know if more pages exist
//           setHasMore(msgRes.data.pagination.hasNextPage);
//           setCurrentPage(msgRes.data.pagination.page);
//         }
//       } catch {
//         toast.error("Failed to load chat");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();

//     // Mark chat as read
//     dispatch(clearUnread(chatId));
//     messageActionsApi.markChatRead(chatId).catch(() => {});

//     // Join socket room
//     socketService.emit("chat:join", chatId);
//     return () => {
//       socketService.emit("chat:leave", { chatId });
//     };
//   }, [chatId]);

//   // ── Socket listeners ───────────────────────────────────────────────────────
//   useEffect(() => {
//     const socket = socketService.getSocket();
//     if (!socket) return;

//     const onNewMessage = (msg: Message) => {
//       if (msg.chatId !== chatId) return;
//       dispatch(addMessage({ chatId, message: msg }));
//       messageActionsApi.markChatRead(chatId).catch(() => {});
//       setTimeout(
//         () => flatListRef.current?.scrollToEnd({ animated: true }),
//         100
//       );
//     };

//     const onEdited = (data: {
//       message: Message;
//       messageId: string;
//       content: string;
//       editedAt: string;
//     }) => {
//       dispatch(
//         updateMessage({
//           chatId,
//           message: data.message,
//           messageId: data.messageId,
//           changes: {
//             content: data.content,
//             isEdited: true,
//             editedAt: data.editedAt,
//           },
//         })
//       );
//     };

//     const onDeleted = (data: {
//       message: Message;
//       messageId: string;
//       forEveryone: boolean;
//     }) => {
//       if (data.forEveryone) {
//         dispatch(
//           updateMessage({
//             chatId,
//             message: data.message,
//             messageId: data.messageId,
//             changes: { isDeleted: true, content: "" },
//           })
//         );
//       } else {
//         dispatch(removeMessage({ chatId, messageId: data.messageId }));
//       }
//     };

//     const onReacted = (data: {
//       message: Message;
//       messageId: string;
//       reactions: any[];
//     }) => {
//       dispatch(
//         updateMessage({
//           chatId,
//           message: data.message,
//           messageId: data.messageId,
//           changes: { reactions: data.reactions },
//         })
//       );
//     };

//     const onTypingStart = (data: { userId: string; chatId: string }) => {
//       if (data.chatId === chatId && data.userId !== me?._id)
//         setOtherTyping(true);
//     };

//     const onTypingStop = (data: { userId: string; chatId: string }) => {
//       if (data.chatId === chatId && data.userId !== me?._id)
//         setOtherTyping(false);
//     };

//     socket.on("message:new", onNewMessage);
//     socket.on("message:edited", onEdited);
//     socket.on("message:deleted", onDeleted);
//     socket.on("message:reacted", onReacted);
//     socket.on("typing:start", onTypingStart);
//     socket.on("typing:stop", onTypingStop);

//     return () => {
//       socket.off("message:new", onNewMessage);
//       socket.off("message:edited", onEdited);
//       socket.off("message:deleted", onDeleted);
//       socket.off("message:reacted", onReacted);
//       socket.off("typing:start", onTypingStart);
//       socket.off("typing:stop", onTypingStop);
//     };
//   }, [chatId, me?._id]);

//   // ── Load older messages ────────────────────────────────────────────────────
//   // Strategy: use `before` cursor (oldest message's createdAt) so that
//   // page-based skip stays accurate even when new messages arrive in real-time.
//   const loadMore = async () => {
//     if (!hasMore || loadingMore || messages.length === 0) return;
//     setLoadingMore(true);
//     try {
//       const oldest = messages[0];
//       const nextPage = currentPage + 1;
//       const res = await chatApi.getMessages(
//         chatId,
//         nextPage,
//         oldest.createdAt.toString() // `before` cursor keeps the window stable
//       );
//       if (res.success) {
//         const older = res.data.messages;
//         // Prepend older messages; keep existing ones at the end
//         dispatch(setMessages({ chatId, messages: [...older, ...messages] }));
//         // Update pagination state from server response
//         setHasMore(res.data.pagination.hasNextPage);
//         setCurrentPage(res.data.pagination.page);
//       }
//     } catch {
//       toast.error("Failed to load older messages");
//     } finally {
//       setLoadingMore(false);
//     }
//   };

//   // ── Typing indicator ───────────────────────────────────────────────────────
//   const handleTyping = (val: string) => {
//     setText(val);
//     if (!isTyping) {
//       setIsTyping(true);
//       socketService.emit("typing:start", { chatId });
//     }
//     if (typingTimeout.current) clearTimeout(typingTimeout.current);
//     typingTimeout.current = setTimeout(() => {
//       setIsTyping(false);
//       socketService.emit("typing:stop", { chatId });
//     }, 1500);
//   };

//   // ── Send text ──────────────────────────────────────────────────────────────
//   const sendText = async () => {
//     const content = text.trim();
//     if (!content && !editingMessage) return;
//     setText("");
//     Keyboard.dismiss();

//     // Editing existing message
//     if (editingMessage) {
//       try {
//         await messageActionsApi.editMessage(editingMessage._id, content);
//         dispatch(
//           updateMessage({
//             chatId,
//             message: editingMessage,
//             messageId: editingMessage._id,
//             changes: { content, isEdited: true },
//           })
//         );
//         socketService.emit("message:edit", {
//           messageId: editingMessage._id,
//           content,
//           chatId,
//         });
//       } catch {
//         toast.error("Failed to edit");
//       }
//       setEditingMessage(null);
//       return;
//     }

//     setSending(true);
//     try {
//       const res = await chatApi.sendMessage(chatId, {
//         content,
//         type: "text",
//         replyTo: replyTo?._id,
//         mediaUrl: "",
//         mediaName: "",
//         mediaSize: 0,
//         mediaDuration: 0,
//       });
//       if (res.success) {
//         dispatch(addMessage({ chatId, message: res.data.message }));
//         socketService.emit("message:send", {
//           chatId,
//           message: res.data.message,
//         });
//         setTimeout(
//           () => flatListRef.current?.scrollToEnd({ animated: true }),
//           80
//         );
//       }
//     } catch {
//       toast.error("Failed to send");
//     } finally {
//       setSending(false);
//       setReplyTo(null);
//     }
//   };

//   // ── Send attachment ────────────────────────────────────────────────────────
//   const handleAttachment = async (result: AttachmentResult) => {
//     setUploading(true);
//     try {
//       const mimeType = result.mimeType || "application/octet-stream";
//       const publicUrl = await uploadFileToS3(
//         result.uri,
//         result.name || "file",
//         mimeType,
//         result.type
//       );

//       const res = await chatApi.sendMessage(chatId, {
//         content: text,
//         type: result.type,
//         mediaUrl: publicUrl,
//         mediaName: result?.name || "",
//         mediaSize: result?.size || 0,
//         mediaDuration: result?.duration || 0,
//         replyTo: replyTo?._id,
//       });
//       if (res.success) {
//         dispatch(addMessage({ chatId, message: res.data.message }));
//         socketService.emit("message:send", {
//           chatId,
//           message: res.data.message,
//         });
//         setTimeout(
//           () => flatListRef.current?.scrollToEnd({ animated: true }),
//           80
//         );
//       }
//     } catch {
//       toast.error("Failed to send file");
//     } finally {
//       setUploading(false);
//       setReplyTo(null);
//     }
//   };

//   // ── Send voice note ────────────────────────────────────────────────────────
//   const handleVoiceNote = async (uri: string, duration: number) => {
//     setShowRecorder(false);
//     setUploading(true);
//     try {
//       const publicUrl = await uploadFileToS3(
//         uri,
//         "voice.m4a",
//         "audio/mp4",
//         "audio"
//       );
//       const res = await chatApi.sendMessage(chatId, {
//         content: text,
//         mediaName: "",
//         mediaSize: 0,
//         replyTo: replyTo?._id,
//         type: "audio",
//         mediaUrl: publicUrl,
//         mediaDuration: duration,
//       });
//       if (res.success) {
//         dispatch(addMessage({ chatId, message: res.data.message }));
//         socketService.emit("message:send", {
//           chatId,
//           message: res.data.message,
//         });
//         setTimeout(
//           () => flatListRef.current?.scrollToEnd({ animated: true }),
//           80
//         );
//       }
//     } catch {
//       toast.error("Failed to send voice note");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ── Emoji picked ───────────────────────────────────────────────────────────
//   const handleEmojiPick = (emoji: string) => {
//     setText((t) => t + emoji);
//     setShowEmoji(false);
//     inputRef.current?.focus();
//   };

//   // ── Message actions ────────────────────────────────────────────────────────
//   const handleReact = async (emoji: string) => {
//     if (!menuMessage) return;
//     try {
//       await messageActionsApi.reactToMessage(menuMessage._id, emoji);
//       socketService.emit("message:react", {
//         messageId: menuMessage._id,
//         emoji,
//         chatId,
//         userId: me?._id,
//       });
//     } catch {}
//   };

//   const handleDelete = (forEveryone: boolean) => {
//     if (!menuMessage) return;
//     Alert.alert(
//       forEveryone ? "Delete for everyone" : "Delete for me",
//       forEveryone
//         ? "This message will be removed for all participants."
//         : "This message will be removed only for you.",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await messageActionsApi.deleteMessage(
//                 menuMessage._id,
//                 forEveryone
//               );
//               if (forEveryone) {
//                 dispatch(
//                   updateMessage({
//                     chatId,
//                     message: menuMessage,
//                     messageId: menuMessage._id,
//                     changes: { isDeleted: true, content: "" },
//                   })
//                 );
//                 socketService.emit("message:delete", {
//                   messageId: menuMessage._id,
//                   chatId,
//                   forEveryone: true,
//                 });
//               } else {
//                 dispatch(removeMessage({ chatId, messageId: menuMessage._id }));
//               }
//             } catch {
//               toast.error("Failed to delete");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleStar = async () => {
//     if (!menuMessage) return;
//     try {
//       await messageActionsApi.starMessage(menuMessage._id);
//       setStarredIds((prev) => {
//         const next = new Set(prev);
//         if (next.has(menuMessage._id)) next.delete(menuMessage._id);
//         else next.add(menuMessage._id);
//         return next;
//       });
//       toast.success(starredIds.has(menuMessage._id) ? "Unstarred" : "Starred");
//     } catch {
//       toast.error("Failed");
//     }
//   };

//   const handleCopy = async () => {
//     if (menuMessage?.content) {
//       await Clipboard.setStringAsync(menuMessage.content);
//       toast.success("Copied to clipboard");
//     }
//   };

//   // ── Derived values ─────────────────────────────────────────────────────────
//   const isGroup = chatInfo?.type === "group";
//   const otherParticipant = !isGroup
//     ? chatInfo?.participants.find((p) => p.user._id !== me?._id)
//     : null;
//   const displayName = isGroup ? chatInfo?.name : otherParticipant?.user.name;
//   const displayAvatar = isGroup
//     ? chatInfo?.avatar
//     : (otherParticipant?.user as User)?.avatar;
//   const isOtherOnline = !isGroup && (otherParticipant?.user as User)?.isOnline;
//   const initials = (displayName || "?")
//     .split(" ")
//     .map((w: string) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   // Build flat list data with date separators
//   const listData: (
//     | Message
//     | { _id: string; type: "separator"; date: string }
//   )[] = [];
//   messages.forEach((msg: any, i: number) => {
//     const prev = messages[i - 1];
//     if (
//       !prev ||
//       formatDateSeparator(new Date(msg.createdAt)) !==
//         formatDateSeparator(new Date(prev.createdAt))
//     ) {
//       listData.push({
//         _id: `sep-${msg._id}`,
//         type: "separator",
//         date: formatDateSeparator(new Date(msg.createdAt)),
//       });
//     }
//     listData.push(msg);
//   });

//   return (
//     <View style={[styles.root, { backgroundColor: colors.background }]}>
//       {/* Header */}
//       <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.surface }}>
//         <View style={[styles.header, { borderBottomColor: colors.border }]}>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={styles.backBtn}
//           >
//             <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.headerInfo}
//             onPress={() =>
//               isGroup
//                 ? router.push(`/group-info/${chatId}`)
//                 : router.push(`/profile/${otherParticipant?.user._id}`)
//             }
//             activeOpacity={0.75}
//           >
//             <View style={styles.headerAvatarWrap}>
//               {displayAvatar ? (
//                 <Image
//                   source={{ uri: displayAvatar }}
//                   style={styles.headerAvatar}
//                   contentFit="cover"
//                 />
//               ) : (
//                 <LinearGradient
//                   colors={["#00d4aa", "#5b8dee"]}
//                   style={styles.headerAvatarFb}
//                 >
//                   <Text style={styles.headerInitials}>{initials}</Text>
//                 </LinearGradient>
//               )}
//               {!isGroup && (
//                 <View
//                   style={[
//                     styles.onlineDot,
//                     {
//                       backgroundColor: isOtherOnline ? "#00d4aa" : "#555577",
//                       borderColor: colors.surface,
//                     },
//                   ]}
//                 />
//               )}
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text
//                 style={[styles.headerName, { color: colors.textPrimary }]}
//                 numberOfLines={1}
//               >
//                 {displayName || "…"}
//               </Text>
//               <Text
//                 style={[
//                   styles.headerStatus,
//                   { color: otherTyping ? "#00d4aa" : colors.textMuted },
//                 ]}
//               >
//                 {otherTyping
//                   ? "typing…"
//                   : isGroup
//                   ? `${chatInfo?.participants.length || 0} members`
//                   : isOtherOnline
//                   ? "Online"
//                   : "Offline"}
//               </Text>
//             </View>
//           </TouchableOpacity>

//           <View style={styles.headerActions}>
//             {!isGroup && (
//               <>
//                 <TouchableOpacity
//                   style={styles.hBtn}
//                   onPress={() => router.push(`/call/${chatId}?type=audio`)}
//                 >
//                   <Ionicons
//                     name="call-outline"
//                     size={20}
//                     color={colors.textPrimary}
//                   />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.hBtn}
//                   onPress={() => router.push(`/call/${chatId}?type=video`)}
//                 >
//                   <Ionicons
//                     name="videocam-outline"
//                     size={20}
//                     color={colors.textPrimary}
//                   />
//                 </TouchableOpacity>
//               </>
//             )}
//             <TouchableOpacity
//               style={styles.hBtn}
//               onPress={() =>
//                 isGroup
//                   ? router.push(`/group-info/${chatId}`)
//                   : router.push(`/profile/${otherParticipant?.user._id}`)
//               }
//             >
//               <Ionicons
//                 name="ellipsis-vertical"
//                 size={20}
//                 color={colors.textPrimary}
//               />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>

//       {/* Messages list */}
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//       >
//         {loading ? (
//           <View style={styles.loadingWrap}>
//             <ActivityIndicator color="#00d4aa" size="large" />
//           </View>
//         ) : (
//           <FlatList
//             ref={flatListRef}
//             data={listData}
//             keyExtractor={(item) => item._id}
//             contentContainerStyle={[styles.listContent, { paddingBottom: 16 }]}
//             showsVerticalScrollIndicator={false}
//             onEndReached={loadMore}
//             onEndReachedThreshold={0.2}
//             ListHeaderComponent={
//               loadingMore ? (
//                 <ActivityIndicator color="#00d4aa" style={{ margin: 16 }} />
//               ) : null
//             }
//             onContentSizeChange={() =>
//               flatListRef.current?.scrollToEnd({ animated: false })
//             }
//             renderItem={({ item, index }) => {
//               if ((item as any).type === "separator") {
//                 return (
//                   <DateSeparator date={(item as any).date} colors={colors} />
//                 );
//               }
//               const msg = item as Message;
//               const isOwn =
//                 (msg.sender as User)?._id === me?._id || msg.sender === me?._id;
//               const prevMsg = listData[index - 1] as Message | undefined;
//               const prevSenderId =
//                 prevMsg && !(prevMsg as any).type
//                   ? (prevMsg.sender as User)?._id
//                   : null;
//               const showAvatar =
//                 !isOwn &&
//                 (prevSenderId !== (msg.sender as User)?._id || !prevMsg);
//               return (
//                 <MessageBubble
//                   message={msg}
//                   isOwn={isOwn}
//                   showAvatar={showAvatar}
//                   myId={me?._id || ""}
//                   colors={colors}
//                   onLongPress={(m, anchor) => {
//                     setMenuMessage(m);
//                     setMenuAnchor(anchor);
//                   }}
//                   onReplyPress={(m) => setReplyTo(m)}
//                   onImagePress={(url) => {
//                     /* TODO: full screen viewer */
//                   }}
//                 />
//               );
//             }}
//           />
//         )}

//         {/* Upload progress */}
//         {uploading && <UploadingIndicator colors={colors} />}

//         {/* Reply bar */}
//         {replyTo && !editingMessage && (
//           <ReplyBar
//             replyTo={replyTo}
//             onCancel={() => setReplyTo(null)}
//             colors={colors}
//           />
//         )}

//         {/* Edit bar */}
//         {editingMessage && (
//           <View
//             style={[
//               replyBarStyles.wrap,
//               {
//                 backgroundColor: colors.surface,
//                 borderTopColor: colors.border,
//               },
//             ]}
//           >
//             <View
//               style={[replyBarStyles.indicator, { backgroundColor: "#ffc107" }]}
//             />
//             <View style={replyBarStyles.content}>
//               <Text style={[replyBarStyles.name, { color: "#ffc107" }]}>
//                 Editing message
//               </Text>
//               <Text
//                 style={[
//                   replyBarStyles.preview,
//                   { color: colors.textSecondary },
//                 ]}
//                 numberOfLines={1}
//               >
//                 {editingMessage.content}
//               </Text>
//             </View>
//             <TouchableOpacity
//               onPress={() => {
//                 setEditingMessage(null);
//                 setText("");
//               }}
//               style={replyBarStyles.close}
//             >
//               <Ionicons name="close" size={18} color={colors.textMuted} />
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Input bar */}
//         <View
//           style={[
//             styles.inputBar,
//             {
//               backgroundColor: colors.surface,
//               borderTopColor: colors.border,
//               paddingBottom: Math.max(insets.bottom, 12),
//             },
//           ]}
//         >
//           <TouchableOpacity
//             style={styles.inputIconBtn}
//             onPress={() => {
//               setShowEmoji((v) => !v);
//               if (!showEmoji) Keyboard.dismiss();
//               else inputRef.current?.focus();
//             }}
//           >
//             <Ionicons
//               name={showEmoji ? "keypad-outline" : "happy-outline"}
//               size={24}
//               color={colors.textMuted}
//             />
//           </TouchableOpacity>

//           <View
//             style={[
//               styles.inputWrap,
//               { backgroundColor: colors.surface, borderColor: colors.border },
//             ]}
//           >
//             <TextInput
//               ref={inputRef}
//               style={[styles.input, { color: colors.textPrimary }]}
//               value={text}
//               onChangeText={handleTyping}
//               placeholder={editingMessage ? "Edit message…" : "Message…"}
//               placeholderTextColor={colors.textMuted}
//               multiline
//               maxLength={4000}
//               onFocus={() => setShowEmoji(false)}
//             />
//           </View>

//           {text.trim().length > 0 || editingMessage ? (
//             <TouchableOpacity
//               style={styles.sendBtn}
//               onPress={sendText}
//               disabled={sending}
//             >
//               <LinearGradient
//                 colors={["#00d4aa", "#00b090"]}
//                 style={styles.sendGradient}
//               >
//                 {sending ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Ionicons
//                     name={editingMessage ? "checkmark" : "send"}
//                     size={18}
//                     color="#fff"
//                   />
//                 )}
//               </LinearGradient>
//             </TouchableOpacity>
//           ) : (
//             <>
//               <TouchableOpacity
//                 style={styles.inputIconBtn}
//                 onPress={() => setShowAttachment(true)}
//               >
//                 <Ionicons
//                   name="attach-outline"
//                   size={24}
//                   color={colors.textMuted}
//                 />
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.inputIconBtn}
//                 onPress={() => setShowRecorder(true)}
//               >
//                 <Ionicons
//                   name="mic-outline"
//                   size={24}
//                   color={colors.textMuted}
//                 />
//               </TouchableOpacity>
//             </>
//           )}
//         </View>

//         {/* Emoji panel */}
//         <EmojiPanel
//           visible={showEmoji}
//           onPick={handleEmojiPick}
//           colors={colors}
//         />

//         {/* Audio recorder */}
//         {showRecorder && (
//           <AudioRecorder
//             visible={showRecorder}
//             onSend={handleVoiceNote}
//             onCancel={() => setShowRecorder(false)}
//             colors={colors}
//           />
//         )}
//       </KeyboardAvoidingView>

//       {/* Floating action menu */}
//       <ReactionActionMenu
//         visible={!!menuMessage}
//         message={menuMessage}
//         anchor={menuAnchor}
//         isOwn={(menuMessage?.sender as User)?._id === me?._id}
//         isStarred={starredIds.has(menuMessage?._id || "")}
//         onClose={() => {
//           setMenuMessage(null);
//           setMenuAnchor(null);
//         }}
//         onReact={handleReact}
//         onReply={() => {
//           setReplyTo(menuMessage!);
//         }}
//         onEdit={() => {
//           setEditingMessage(menuMessage!);
//           setText(menuMessage!.content || "");
//           inputRef.current?.focus();
//         }}
//         onCopy={handleCopy}
//         onStar={handleStar}
//         onForward={() => setForwardMessageId(menuMessage!._id)}
//         onDelete={handleDelete}
//         colors={colors}
//       />

//       {/* Attachment sheet */}
//       <AttachmentSheet
//         visible={showAttachment}
//         onClose={() => setShowAttachment(false)}
//         onPick={handleAttachment}
//         onRecord={() => {
//           setShowAttachment(false);
//           setShowRecorder(true);
//         }}
//         colors={colors}
//       />

//       {/* Forward sheet */}
//       <ForwardSheet
//         visible={!!forwardMessageId}
//         messageId={forwardMessageId}
//         onClose={() => setForwardMessageId(null)}
//         colors={colors}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 10,
//     paddingVertical: 10,
//     gap: 8,
//     borderBottomWidth: 1,
//   },
//   backBtn: {
//     width: 38,
//     height: 38,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
//   headerAvatarWrap: { position: "relative" },
//   headerAvatar: { width: 42, height: 42, borderRadius: 21 },
//   headerAvatarFb: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerInitials: { color: "#fff", fontWeight: "700", fontSize: 15 },
//   onlineDot: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     width: 11,
//     height: 11,
//     borderRadius: 6,
//     borderWidth: 2,
//   },
//   headerName: { fontSize: 16, fontWeight: "800" },
//   headerStatus: { fontSize: 12, marginTop: 1 },
//   headerActions: { flexDirection: "row", gap: 2 },
//   hBtn: {
//     width: 38,
//     height: 38,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
//   listContent: { paddingTop: 10, paddingHorizontal: 4 },
//   inputBar: {
//     flexDirection: "row",
//     alignItems: "flex-end",
//     paddingHorizontal: 10,
//     paddingTop: 10,
//     gap: 8,
//     borderTopWidth: 1,
//   },
//   inputIconBtn: {
//     width: 38,
//     height: 38,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 2,
//   },
//   inputWrap: {
//     flex: 1,
//     borderRadius: 22,
//     borderWidth: 1,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     maxHeight: 120,
//   },
//   input: { fontSize: 15, lineHeight: 21 },
//   sendBtn: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     overflow: "hidden",
//     marginBottom: 1,
//   },
//   sendGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
// });

// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   FlatList,
// //   TouchableOpacity,
// //   TextInput,
// //   KeyboardAvoidingView,
// //   Platform,
// //   Animated,
// //   ActivityIndicator,
// //   Pressable,
// //   Alert,
// //   Keyboard,
// //   Modal,
// //   Dimensions,
// //   AppState,
// // } from "react-native";
// // import { useEffect, useRef, useState, useCallback } from "react";
// // import { useLocalSearchParams, useRouter } from "expo-router";
// // import {
// //   SafeAreaView,
// //   useSafeAreaInsets,
// // } from "react-native-safe-area-context";
// // import { Ionicons } from "@expo/vector-icons";
// // import { LinearGradient } from "expo-linear-gradient";
// // import { Image } from "expo-image";
// // import * as Clipboard from "expo-clipboard";
// // import EmojiKeyboard, { type EmojiType } from "rn-emoji-keyboard";
// // import { useTheme } from "../../context/ThemeContext";
// // import { useToast } from "../../context/ToastContext";
// // import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
// // import {
// //   setMessages,
// //   addMessage,
// //   updateMessage,
// //   removeMessage,
// //   clearUnread,
// // } from "../../store/slices/chatSlice";
// // import { chatApi, messageActionsApi, uploadFileToS3 } from "../../services/api";
// // import { socketService } from "../../services/socket";
// // import { Message, User, Chat } from "../../types";
// // import { formatTime, formatDateSeparator } from "../../utils/date";
// // import MessageBubble from "./components/MessageBubble";
// // import ReactionActionMenu from "./components/ReactionActionMenu";
// // import AttachmentSheet, {
// //   AttachmentResult,
// // } from "./components/AttachmentSheet";
// // import AudioRecorder from "./components/AudioRecorder";
// // import ForwardSheet from "./components/ForwardSheet";

// // const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// // // ─── Date separator ───────────────────────────────────────────────────────────
// // function DateSeparator({ date, colors }: { date: string; colors: any }) {
// //   return (
// //     <View style={sepStyles.wrap}>
// //       <View style={[sepStyles.line, { backgroundColor: colors.border }]} />
// //       <Text
// //         style={[
// //           sepStyles.label,
// //           { color: colors.textMuted, backgroundColor: colors.background },
// //         ]}
// //       >
// //         {date}
// //       </Text>
// //       <View style={[sepStyles.line, { backgroundColor: colors.border }]} />
// //     </View>
// //   );
// // }
// // const sepStyles = StyleSheet.create({
// //   wrap: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: 16,
// //     marginVertical: 12,
// //     gap: 10,
// //   },
// //   line: { flex: 1, height: StyleSheet.hairlineWidth },
// //   label: {
// //     fontSize: 11,
// //     fontWeight: "600",
// //     paddingHorizontal: 10,
// //     paddingVertical: 3,
// //     borderRadius: 99,
// //   },
// // });

// // // ─── Reply bar ────────────────────────────────────────────────────────────────
// // function ReplyBar({
// //   replyTo,
// //   onCancel,
// //   colors,
// // }: {
// //   replyTo: Message;
// //   onCancel: () => void;
// //   colors: any;
// // }) {
// //   const sender = replyTo.sender as User;
// //   const preview =
// //     replyTo.type === "image"
// //       ? "📷 Photo"
// //       : replyTo.type === "audio"
// //       ? "🎵 Voice note"
// //       : replyTo.type === "video"
// //       ? "🎥 Video"
// //       : replyTo.content?.slice(0, 80) || "";
// //   const slideAnim = useRef(new Animated.Value(-60)).current;

// //   useEffect(() => {
// //     Animated.spring(slideAnim, {
// //       toValue: 0,
// //       useNativeDriver: true,
// //       tension: 280,
// //       friction: 22,
// //     }).start();
// //   }, []);

// //   return (
// //     <Animated.View
// //       style={[
// //         replyBarStyles.wrap,
// //         {
// //           backgroundColor: colors.surface,
// //           borderTopColor: colors.border,
// //           transform: [{ translateY: slideAnim }],
// //         },
// //       ]}
// //     >
// //       <View style={replyBarStyles.indicator} />
// //       <View style={replyBarStyles.content}>
// //         <Text style={replyBarStyles.name}>{sender?.name || "Unknown"}</Text>
// //         <Text
// //           style={[replyBarStyles.preview, { color: colors.textSecondary }]}
// //           numberOfLines={1}
// //         >
// //           {preview}
// //         </Text>
// //       </View>
// //       <TouchableOpacity onPress={onCancel} style={replyBarStyles.close}>
// //         <Ionicons name="close" size={18} color={colors.textMuted} />
// //       </TouchableOpacity>
// //     </Animated.View>
// //   );
// // }
// // const replyBarStyles = StyleSheet.create({
// //   wrap: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: 16,
// //     paddingVertical: 10,
// //     borderTopWidth: 1,
// //     gap: 10,
// //   },
// //   indicator: {
// //     width: 3,
// //     height: 36,
// //     borderRadius: 2,
// //     backgroundColor: "#00d4aa",
// //   },
// //   content: { flex: 1 },
// //   name: { fontSize: 12, fontWeight: "700", color: "#00d4aa" },
// //   preview: { fontSize: 13, marginTop: 1 },
// //   close: { padding: 4 },
// // });

// // // ─── Upload progress indicator ────────────────────────────────────────────────
// // function UploadingIndicator({ colors }: { colors: any }) {
// //   return (
// //     <View
// //       style={[
// //         upStyles.wrap,
// //         { backgroundColor: colors.surface, borderColor: colors.border },
// //       ]}
// //     >
// //       <ActivityIndicator color="#00d4aa" size="small" />
// //       <Text style={[upStyles.text, { color: colors.textSecondary }]}>
// //         Uploading…
// //       </Text>
// //     </View>
// //   );
// // }
// // const upStyles = StyleSheet.create({
// //   wrap: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: 8,
// //     paddingHorizontal: 16,
// //     paddingVertical: 10,
// //     borderTopWidth: 1,
// //   },
// //   text: { fontSize: 13 },
// // });

// // // ─── Main screen ──────────────────────────────────────────────────────────────
// // export default function ChatScreen() {
// //   const { id: chatId } = useLocalSearchParams<{ id: string }>();
// //   const router = useRouter();
// //   const { colors } = useTheme();
// //   const toast = useToast();
// //   const dispatch = useAppDispatch();
// //   const { user: me } = useAppSelector((s) => s.auth);
// //   const messages = useAppSelector((s) => s.chat.messages[chatId] || []);
// //   const insets = useSafeAreaInsets();

// //   const [chatInfo, setChatInfo] = useState<Chat | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [sending, setSending] = useState(false);
// //   const [uploading, setUploading] = useState(false);
// //   const [text, setText] = useState("");
// //   const [replyTo, setReplyTo] = useState<Message | null>(null);
// //   const [editingMessage, setEditingMessage] = useState<Message | null>(null);
// //   const [showEmoji, setShowEmoji] = useState(false);
// //   const [showAttachment, setShowAttachment] = useState(false);
// //   const [showRecorder, setShowRecorder] = useState(false);
// //   const [forwardMessageId, setForwardMessageId] = useState<string | null>(null);
// //   const [menuMessage, setMenuMessage] = useState<Message | null>(null);
// //   const [menuAnchor, setMenuAnchor] = useState<any>(null);
// //   const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
// //   const [isTyping, setIsTyping] = useState(false);
// //   const [otherTyping, setOtherTyping] = useState(false);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [hasMore, setHasMore] = useState(true);
// //   const [loadingMore, setLoadingMore] = useState(false);

// //   const flatListRef = useRef<FlatList>(null);
// //   const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
// //   const inputRef = useRef<TextInput>(null);

// //   // ── Load initial data ──────────────────────────────────────────────────────
// //   useEffect(() => {
// //     const load = async () => {
// //       try {
// //         const [chatRes, msgRes] = await Promise.all([
// //           chatApi.getChatInfo(chatId),
// //           chatApi.getMessages(chatId, 1),
// //         ]);
// //         if (chatRes.success) setChatInfo(chatRes.data.chat);
// //         if (msgRes.success) {
// //           dispatch(setMessages({ chatId, messages: msgRes.data.messages }));
// //           setHasMore(msgRes.data.pagination.hasNextPage);
// //           setCurrentPage(msgRes.data.pagination.page);
// //         }
// //       } catch {
// //         toast.error("Failed to load chat");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     load();

// //     dispatch(clearUnread(chatId));
// //     messageActionsApi.markChatRead(chatId).catch(() => {});
// //     socketService.emit("chat:join", chatId);
// //     return () => {
// //       socketService.emit("chat:leave", { chatId });
// //     };
// //   }, [chatId]);

// //   // ── Socket listeners ───────────────────────────────────────────────────────
// //   useEffect(() => {
// //     const socket = socketService.getSocket();
// //     if (!socket) return;

// //     const onNewMessage = (msg: Message) => {
// //       if (msg.chatId !== chatId) return;
// //       dispatch(addMessage({ chatId, message: msg }));
// //       messageActionsApi.markChatRead(chatId).catch(() => {});
// //       setTimeout(
// //         () => flatListRef.current?.scrollToEnd({ animated: true }),
// //         100
// //       );
// //     };

// //     const onEdited = (data: {
// //       message: Message;
// //       messageId: string;
// //       content: string;
// //       editedAt: string;
// //     }) => {
// //       dispatch(
// //         updateMessage({
// //           chatId,
// //           message: data.message,
// //           messageId: data.messageId,
// //           changes: {
// //             content: data.content,
// //             isEdited: true,
// //             editedAt: data.editedAt,
// //           },
// //         })
// //       );
// //     };

// //     const onDeleted = (data: {
// //       message: Message;
// //       messageId: string;
// //       forEveryone: boolean;
// //     }) => {
// //       if (data.forEveryone) {
// //         dispatch(
// //           updateMessage({
// //             chatId,
// //             message: data.message,
// //             messageId: data.messageId,
// //             changes: { isDeleted: true, content: "" },
// //           })
// //         );
// //       } else {
// //         dispatch(removeMessage({ chatId, messageId: data.messageId }));
// //       }
// //     };

// //     const onReacted = (data: {
// //       message: Message;
// //       messageId: string;
// //       reactions: any[];
// //     }) => {
// //       dispatch(
// //         updateMessage({
// //           chatId,
// //           message: data.message,
// //           messageId: data.messageId,
// //           changes: { reactions: data.reactions },
// //         })
// //       );
// //     };

// //     const onTypingStart = (data: { userId: string; chatId: string }) => {
// //       if (data.chatId === chatId && data.userId !== me?._id)
// //         setOtherTyping(true);
// //     };

// //     const onTypingStop = (data: { userId: string; chatId: string }) => {
// //       if (data.chatId === chatId && data.userId !== me?._id)
// //         setOtherTyping(false);
// //     };

// //     socket.on("message:new", onNewMessage);
// //     socket.on("message:edited", onEdited);
// //     socket.on("message:deleted", onDeleted);
// //     socket.on("message:reacted", onReacted);
// //     socket.on("typing:start", onTypingStart);
// //     socket.on("typing:stop", onTypingStop);

// //     return () => {
// //       socket.off("message:new", onNewMessage);
// //       socket.off("message:edited", onEdited);
// //       socket.off("message:deleted", onDeleted);
// //       socket.off("message:reacted", onReacted);
// //       socket.off("typing:start", onTypingStart);
// //       socket.off("typing:stop", onTypingStop);
// //     };
// //   }, [chatId, me?._id]);

// //   // ── Load older messages ────────────────────────────────────────────────────
// //   const loadMore = async () => {
// //     if (!hasMore || loadingMore || messages.length === 0) return;
// //     setLoadingMore(true);
// //     try {
// //       const oldest = messages[0];
// //       const nextPage = currentPage + 1;
// //       const res = await chatApi.getMessages(
// //         chatId,
// //         nextPage,
// //         oldest.createdAt.toString()
// //       );
// //       if (res.success) {
// //         dispatch(
// //           setMessages({ chatId, messages: [...res.data.messages, ...messages] })
// //         );
// //         setHasMore(res.data.pagination.hasNextPage);
// //         setCurrentPage(res.data.pagination.page);
// //       }
// //     } catch {
// //       toast.error("Failed to load older messages");
// //     } finally {
// //       setLoadingMore(false);
// //     }
// //   };

// //   // ── Typing indicator ───────────────────────────────────────────────────────
// //   const handleTyping = (val: string) => {
// //     setText(val);
// //     if (!isTyping) {
// //       setIsTyping(true);
// //       socketService.emit("typing:start", { chatId });
// //     }
// //     if (typingTimeout.current) clearTimeout(typingTimeout.current);
// //     typingTimeout.current = setTimeout(() => {
// //       setIsTyping(false);
// //       socketService.emit("typing:stop", { chatId });
// //     }, 1500);
// //   };

// //   // ── Send text ──────────────────────────────────────────────────────────────
// //   const sendText = async () => {
// //     const content = text.trim();
// //     if (!content && !editingMessage) return;
// //     setText("");
// //     Keyboard.dismiss();

// //     if (editingMessage) {
// //       try {
// //         await messageActionsApi.editMessage(editingMessage._id, content);
// //         dispatch(
// //           updateMessage({
// //             chatId,
// //             message: editingMessage,
// //             messageId: editingMessage._id,
// //             changes: { content, isEdited: true },
// //           })
// //         );
// //         // ✅ No socket emit here — backend broadcasts message:edited to the room
// //       } catch {
// //         toast.error("Failed to edit");
// //       }
// //       setEditingMessage(null);
// //       return;
// //     }

// //     setSending(true);
// //     try {
// //       const res = await chatApi.sendMessage(chatId, {
// //         content,
// //         type: "text",
// //         replyTo: replyTo?._id,
// //         mediaUrl: "",
// //         mediaName: "",
// //         mediaSize: 0,
// //         mediaDuration: 0,
// //       });
// //       if (res.success) {
// //         // ✅ Add locally for instant feedback (optimistic)
// //         dispatch(addMessage({ chatId, message: res.data.message }));
// //         // ✅ No socket emit — backend already broadcasts message:new to the room
// //         setTimeout(
// //           () => flatListRef.current?.scrollToEnd({ animated: true }),
// //           80
// //         );
// //       }
// //     } catch {
// //       toast.error("Failed to send");
// //     } finally {
// //       setSending(false);
// //       setReplyTo(null);
// //     }
// //   };

// //   // ── Send attachment ────────────────────────────────────────────────────────
// //   const handleAttachment = async (result: AttachmentResult) => {
// //     setUploading(true);
// //     try {
// //       const mimeType = result.mimeType || "application/octet-stream";
// //       const publicUrl = await uploadFileToS3(
// //         result.uri,
// //         result.name || "file",
// //         mimeType,
// //         result.type
// //       );

// //       const res = await chatApi.sendMessage(chatId, {
// //         content: text,
// //         type: result.type,
// //         mediaUrl: publicUrl,
// //         mediaName: result?.name || "",
// //         mediaSize: result?.size || 0,
// //         mediaDuration: result?.duration || 0,
// //         replyTo: replyTo?._id,
// //       });
// //       if (res.success) {
// //         dispatch(addMessage({ chatId, message: res.data.message }));
// //         // ✅ No socket emit — backend broadcasts message:new
// //         setTimeout(
// //           () => flatListRef.current?.scrollToEnd({ animated: true }),
// //           80
// //         );
// //       }
// //     } catch {
// //       toast.error("Failed to send file");
// //     } finally {
// //       setUploading(false);
// //       setReplyTo(null);
// //     }
// //   };

// //   // ── Send voice note ────────────────────────────────────────────────────────
// //   const handleVoiceNote = async (uri: string, duration: number) => {
// //     setShowRecorder(false);
// //     setUploading(true);
// //     try {
// //       const publicUrl = await uploadFileToS3(
// //         uri,
// //         "voice.m4a",
// //         "audio/mp4",
// //         "audio"
// //       );
// //       const res = await chatApi.sendMessage(chatId, {
// //         content: text,
// //         mediaName: "",
// //         mediaSize: 0,
// //         replyTo: replyTo?._id,
// //         type: "audio",
// //         mediaUrl: publicUrl,
// //         mediaDuration: duration,
// //       });
// //       if (res.success) {
// //         dispatch(addMessage({ chatId, message: res.data.message }));
// //         // ✅ No socket emit — backend broadcasts message:new
// //         setTimeout(
// //           () => flatListRef.current?.scrollToEnd({ animated: true }),
// //           80
// //         );
// //       }
// //     } catch {
// //       toast.error("Failed to send voice note");
// //     } finally {
// //       setUploading(false);
// //     }
// //   };

// //   // ── Message actions ────────────────────────────────────────────────────────
// //   const handleReact = async (emoji: string) => {
// //     if (!menuMessage) return;
// //     try {
// //       await messageActionsApi.reactToMessage(menuMessage._id, emoji);
// //       // ✅ No socket emit — backend broadcasts message:reacted
// //     } catch {}
// //   };

// //   const handleDelete = (forEveryone: boolean) => {
// //     if (!menuMessage) return;
// //     Alert.alert(
// //       forEveryone ? "Delete for everyone" : "Delete for me",
// //       forEveryone
// //         ? "This message will be removed for all participants."
// //         : "This message will be removed only for you.",
// //       [
// //         { text: "Cancel", style: "cancel" },
// //         {
// //           text: "Delete",
// //           style: "destructive",
// //           onPress: async () => {
// //             try {
// //               await messageActionsApi.deleteMessage(
// //                 menuMessage._id,
// //                 forEveryone
// //               );
// //               if (forEveryone) {
// //                 dispatch(
// //                   updateMessage({
// //                     chatId,
// //                     message: menuMessage,
// //                     messageId: menuMessage._id,
// //                     changes: { isDeleted: true, content: "" },
// //                   })
// //                 );
// //                 // ✅ No socket emit — backend broadcasts message:deleted
// //               } else {
// //                 dispatch(removeMessage({ chatId, messageId: menuMessage._id }));
// //               }
// //             } catch {
// //               toast.error("Failed to delete");
// //             }
// //           },
// //         },
// //       ]
// //     );
// //   };

// //   const handleStar = async () => {
// //     if (!menuMessage) return;
// //     try {
// //       await messageActionsApi.starMessage(menuMessage._id);
// //       setStarredIds((prev) => {
// //         const next = new Set(prev);
// //         if (next.has(menuMessage._id)) next.delete(menuMessage._id);
// //         else next.add(menuMessage._id);
// //         return next;
// //       });
// //       toast.success(starredIds.has(menuMessage._id) ? "Unstarred" : "Starred");
// //     } catch {
// //       toast.error("Failed");
// //     }
// //   };

// //   const handleCopy = async () => {
// //     if (menuMessage?.content) {
// //       await Clipboard.setStringAsync(menuMessage.content);
// //       toast.success("Copied to clipboard");
// //     }
// //   };

// //   // ── Derived values ─────────────────────────────────────────────────────────
// //   const isGroup = chatInfo?.type === "group";
// //   const otherParticipant = !isGroup
// //     ? chatInfo?.participants.find((p) => p.user._id !== me?._id)
// //     : null;
// //   const displayName = isGroup ? chatInfo?.name : otherParticipant?.user.name;
// //   const displayAvatar = isGroup
// //     ? chatInfo?.avatar
// //     : (otherParticipant?.user as User)?.avatar;
// //   const isOtherOnline = !isGroup && (otherParticipant?.user as User)?.isOnline;
// //   const initials = (displayName || "?")
// //     .split(" ")
// //     .map((w: string) => w[0])
// //     .join("")
// //     .slice(0, 2)
// //     .toUpperCase();

// //   // Build flat list data with date separators
// //   const listData: (
// //     | Message
// //     | { _id: string; type: "separator"; date: string }
// //   )[] = [];
// //   messages.forEach((msg: any, i: number) => {
// //     const prev = messages[i - 1];
// //     if (
// //       !prev ||
// //       formatDateSeparator(new Date(msg.createdAt)) !==
// //         formatDateSeparator(new Date(prev.createdAt))
// //     ) {
// //       listData.push({
// //         _id: `sep-${msg._id}`,
// //         type: "separator",
// //         date: formatDateSeparator(new Date(msg.createdAt)),
// //       });
// //     }
// //     listData.push(msg);
// //   });

// //   return (
// //     <View style={[styles.root, { backgroundColor: colors.background }]}>
// //       {/* Header */}
// //       <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.surface }}>
// //         <View style={[styles.header, { borderBottomColor: colors.border }]}>
// //           <TouchableOpacity
// //             onPress={() => router.back()}
// //             style={styles.backBtn}
// //           >
// //             <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
// //           </TouchableOpacity>

// //           <TouchableOpacity
// //             style={styles.headerInfo}
// //             onPress={() =>
// //               isGroup
// //                 ? router.push(`/group-info/${chatId}`)
// //                 : router.push(`/profile/${otherParticipant?.user._id}`)
// //             }
// //             activeOpacity={0.75}
// //           >
// //             <View style={styles.headerAvatarWrap}>
// //               {displayAvatar ? (
// //                 <Image
// //                   source={{ uri: displayAvatar }}
// //                   style={styles.headerAvatar}
// //                   contentFit="cover"
// //                 />
// //               ) : (
// //                 <LinearGradient
// //                   colors={["#00d4aa", "#5b8dee"]}
// //                   style={styles.headerAvatarFb}
// //                 >
// //                   <Text style={styles.headerInitials}>{initials}</Text>
// //                 </LinearGradient>
// //               )}
// //               {!isGroup && (
// //                 <View
// //                   style={[
// //                     styles.onlineDot,
// //                     {
// //                       backgroundColor: isOtherOnline ? "#00d4aa" : "#555577",
// //                       borderColor: colors.surface,
// //                     },
// //                   ]}
// //                 />
// //               )}
// //             </View>
// //             <View style={{ flex: 1 }}>
// //               <Text
// //                 style={[styles.headerName, { color: colors.textPrimary }]}
// //                 numberOfLines={1}
// //               >
// //                 {displayName || "…"}
// //               </Text>
// //               <Text
// //                 style={[
// //                   styles.headerStatus,
// //                   { color: otherTyping ? "#00d4aa" : colors.textMuted },
// //                 ]}
// //               >
// //                 {otherTyping
// //                   ? "typing…"
// //                   : isGroup
// //                   ? `${chatInfo?.participants.length || 0} members`
// //                   : isOtherOnline
// //                   ? "Online"
// //                   : "Offline"}
// //               </Text>
// //             </View>
// //           </TouchableOpacity>

// //           <View style={styles.headerActions}>
// //             {!isGroup && (
// //               <>
// //                 <TouchableOpacity
// //                   style={styles.hBtn}
// //                   onPress={() => router.push(`/call/${chatId}?type=audio`)}
// //                 >
// //                   <Ionicons
// //                     name="call-outline"
// //                     size={20}
// //                     color={colors.textPrimary}
// //                   />
// //                 </TouchableOpacity>
// //                 <TouchableOpacity
// //                   style={styles.hBtn}
// //                   onPress={() => router.push(`/call/${chatId}?type=video`)}
// //                 >
// //                   <Ionicons
// //                     name="videocam-outline"
// //                     size={20}
// //                     color={colors.textPrimary}
// //                   />
// //                 </TouchableOpacity>
// //               </>
// //             )}
// //             <TouchableOpacity
// //               style={styles.hBtn}
// //               onPress={() =>
// //                 isGroup
// //                   ? router.push(`/group-info/${chatId}`)
// //                   : router.push(`/profile/${otherParticipant?.user._id}`)
// //               }
// //             >
// //               <Ionicons
// //                 name="ellipsis-vertical"
// //                 size={20}
// //                 color={colors.textPrimary}
// //               />
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </SafeAreaView>

// //       {/* Messages list */}
// //       <KeyboardAvoidingView
// //         style={{ flex: 1 }}
// //         behavior={Platform.OS === "ios" ? "padding" : "height"}
// //         keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
// //       >
// //         {loading ? (
// //           <View style={styles.loadingWrap}>
// //             <ActivityIndicator color="#00d4aa" size="large" />
// //           </View>
// //         ) : (
// //           <FlatList
// //             ref={flatListRef}
// //             data={listData}
// //             keyExtractor={(item) => item._id}
// //             contentContainerStyle={[styles.listContent, { paddingBottom: 16 }]}
// //             showsVerticalScrollIndicator={false}
// //             onEndReached={loadMore}
// //             onEndReachedThreshold={0.2}
// //             ListHeaderComponent={
// //               loadingMore ? (
// //                 <ActivityIndicator color="#00d4aa" style={{ margin: 16 }} />
// //               ) : null
// //             }
// //             onContentSizeChange={() =>
// //               flatListRef.current?.scrollToEnd({ animated: false })
// //             }
// //             renderItem={({ item, index }) => {
// //               if ((item as any).type === "separator") {
// //                 return (
// //                   <DateSeparator date={(item as any).date} colors={colors} />
// //                 );
// //               }
// //               const msg = item as Message;
// //               const isOwn =
// //                 (msg.sender as User)?._id === me?._id || msg.sender === me?._id;
// //               const prevMsg = listData[index - 1] as Message | undefined;
// //               const prevSenderId =
// //                 prevMsg && !(prevMsg as any).type
// //                   ? (prevMsg.sender as User)?._id
// //                   : null;
// //               const showAvatar =
// //                 !isOwn &&
// //                 (prevSenderId !== (msg.sender as User)?._id || !prevMsg);
// //               return (
// //                 <MessageBubble
// //                   message={msg}
// //                   isOwn={isOwn}
// //                   showAvatar={showAvatar}
// //                   myId={me?._id || ""}
// //                   colors={colors}
// //                   onLongPress={(m, anchor) => {
// //                     setMenuMessage(m);
// //                     setMenuAnchor(anchor);
// //                   }}
// //                   onReplyPress={(m) => setReplyTo(m)}
// //                   onImagePress={(url) => {}}
// //                 />
// //               );
// //             }}
// //           />
// //         )}

// //         {uploading && <UploadingIndicator colors={colors} />}

// //         {replyTo && !editingMessage && (
// //           <ReplyBar
// //             replyTo={replyTo}
// //             onCancel={() => setReplyTo(null)}
// //             colors={colors}
// //           />
// //         )}

// //         {editingMessage && (
// //           <View
// //             style={[
// //               replyBarStyles.wrap,
// //               {
// //                 backgroundColor: colors.surface,
// //                 borderTopColor: colors.border,
// //               },
// //             ]}
// //           >
// //             <View
// //               style={[replyBarStyles.indicator, { backgroundColor: "#ffc107" }]}
// //             />
// //             <View style={replyBarStyles.content}>
// //               <Text style={[replyBarStyles.name, { color: "#ffc107" }]}>
// //                 Editing message
// //               </Text>
// //               <Text
// //                 style={[
// //                   replyBarStyles.preview,
// //                   { color: colors.textSecondary },
// //                 ]}
// //                 numberOfLines={1}
// //               >
// //                 {editingMessage.content}
// //               </Text>
// //             </View>
// //             <TouchableOpacity
// //               onPress={() => {
// //                 setEditingMessage(null);
// //                 setText("");
// //               }}
// //               style={replyBarStyles.close}
// //             >
// //               <Ionicons name="close" size={18} color={colors.textMuted} />
// //             </TouchableOpacity>
// //           </View>
// //         )}

// //         {/* Input bar */}
// //         <View
// //           style={[
// //             styles.inputBar,
// //             {
// //               backgroundColor: colors.surface,
// //               borderTopColor: colors.border,
// //               paddingBottom: Math.max(insets.bottom, 12),
// //             },
// //           ]}
// //         >
// //           <TouchableOpacity
// //             style={styles.inputIconBtn}
// //             onPress={() => {
// //               setShowEmoji((v) => !v);
// //               if (!showEmoji) Keyboard.dismiss();
// //               else inputRef.current?.focus();
// //             }}
// //           >
// //             <Ionicons
// //               name={showEmoji ? "keypad-outline" : "happy-outline"}
// //               size={24}
// //               color={showEmoji ? "#00d4aa" : colors.textMuted}
// //             />
// //           </TouchableOpacity>

// //           <View
// //             style={[
// //               styles.inputWrap,
// //               { backgroundColor: colors.surface, borderColor: colors.border },
// //             ]}
// //           >
// //             <TextInput
// //               ref={inputRef}
// //               style={[styles.input, { color: colors.textPrimary }]}
// //               value={text}
// //               onChangeText={handleTyping}
// //               placeholder={editingMessage ? "Edit message…" : "Message…"}
// //               placeholderTextColor={colors.textMuted}
// //               multiline
// //               maxLength={4000}
// //               onFocus={() => setShowEmoji(false)}
// //             />
// //           </View>

// //           {text.trim().length > 0 || editingMessage ? (
// //             <TouchableOpacity
// //               style={styles.sendBtn}
// //               onPress={sendText}
// //               disabled={sending}
// //             >
// //               <LinearGradient
// //                 colors={["#00d4aa", "#00b090"]}
// //                 style={styles.sendGradient}
// //               >
// //                 {sending ? (
// //                   <ActivityIndicator size="small" color="#fff" />
// //                 ) : (
// //                   <Ionicons
// //                     name={editingMessage ? "checkmark" : "send"}
// //                     size={18}
// //                     color="#fff"
// //                   />
// //                 )}
// //               </LinearGradient>
// //             </TouchableOpacity>
// //           ) : (
// //             <>
// //               <TouchableOpacity
// //                 style={styles.inputIconBtn}
// //                 onPress={() => setShowAttachment(true)}
// //               >
// //                 <Ionicons
// //                   name="attach-outline"
// //                   size={24}
// //                   color={colors.textMuted}
// //                 />
// //               </TouchableOpacity>
// //               <TouchableOpacity
// //                 style={styles.inputIconBtn}
// //                 onPress={() => setShowRecorder(true)}
// //               >
// //                 <Ionicons
// //                   name="mic-outline"
// //                   size={24}
// //                   color={colors.textMuted}
// //                 />
// //               </TouchableOpacity>
// //             </>
// //           )}
// //         </View>

// //         {/* rn-emoji-keyboard */}
// //         <EmojiKeyboard
// //           onEmojiSelected={(emoji: EmojiType) => {
// //             setText((t) => t + emoji.emoji);
// //           }}
// //           open={showEmoji}
// //           onClose={() => setShowEmoji(false)}
// //           enableSearchBar
// //           theme={{
// //             backdrop: "transparent",
// //             knob: "#00d4aa",
// //             container: colors.surface,
// //             header: colors.textPrimary,
// //             skinTonesContainer: colors.surface,
// //             category: {
// //               icon: colors.textMuted,
// //               iconActive: "#00d4aa",
// //               container: colors.surface,
// //               containerActive: colors.surface,
// //             },
// //             search: {
// //               text: colors.textPrimary,
// //               placeholder: colors.textMuted,
// //               icon: colors.textMuted,
// //               background: colors.surface,
// //             },
// //             emoji: {
// //               selected: colors.surface,
// //             },
// //           }}
// //         />

// //         {showRecorder && (
// //           <AudioRecorder
// //             visible={showRecorder}
// //             onSend={handleVoiceNote}
// //             onCancel={() => setShowRecorder(false)}
// //             colors={colors}
// //           />
// //         )}
// //       </KeyboardAvoidingView>

// //       <ReactionActionMenu
// //         visible={!!menuMessage}
// //         message={menuMessage}
// //         anchor={menuAnchor}
// //         isOwn={(menuMessage?.sender as User)?._id === me?._id}
// //         isStarred={starredIds.has(menuMessage?._id || "")}
// //         onClose={() => {
// //           setMenuMessage(null);
// //           setMenuAnchor(null);
// //         }}
// //         onReact={handleReact}
// //         onReply={() => {
// //           setReplyTo(menuMessage!);
// //         }}
// //         onEdit={() => {
// //           setEditingMessage(menuMessage!);
// //           setText(menuMessage!.content || "");
// //           inputRef.current?.focus();
// //         }}
// //         onCopy={handleCopy}
// //         onStar={handleStar}
// //         onForward={() => setForwardMessageId(menuMessage!._id)}
// //         onDelete={handleDelete}
// //         colors={colors}
// //       />

// //       <AttachmentSheet
// //         visible={showAttachment}
// //         onClose={() => setShowAttachment(false)}
// //         onPick={handleAttachment}
// //         onRecord={() => {
// //           setShowAttachment(false);
// //           setShowRecorder(true);
// //         }}
// //         colors={colors}
// //       />

// //       <ForwardSheet
// //         visible={!!forwardMessageId}
// //         messageId={forwardMessageId}
// //         onClose={() => setForwardMessageId(null)}
// //         colors={colors}
// //       />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   root: { flex: 1 },
// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: 10,
// //     paddingVertical: 10,
// //     gap: 8,
// //     borderBottomWidth: 1,
// //   },
// //   backBtn: {
// //     width: 38,
// //     height: 38,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
// //   headerAvatarWrap: { position: "relative" },
// //   headerAvatar: { width: 42, height: 42, borderRadius: 21 },
// //   headerAvatarFb: {
// //     width: 42,
// //     height: 42,
// //     borderRadius: 21,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   headerInitials: { color: "#fff", fontWeight: "700", fontSize: 15 },
// //   onlineDot: {
// //     position: "absolute",
// //     bottom: 0,
// //     right: 0,
// //     width: 11,
// //     height: 11,
// //     borderRadius: 6,
// //     borderWidth: 2,
// //   },
// //   headerName: { fontSize: 16, fontWeight: "800" },
// //   headerStatus: { fontSize: 12, marginTop: 1 },
// //   headerActions: { flexDirection: "row", gap: 2 },
// //   hBtn: {
// //     width: 38,
// //     height: 38,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   listContent: { paddingTop: 10, paddingHorizontal: 4 },
// //   inputBar: {
// //     flexDirection: "row",
// //     alignItems: "flex-end",
// //     paddingHorizontal: 10,
// //     paddingTop: 10,
// //     gap: 8,
// //     borderTopWidth: 1,
// //   },
// //   inputIconBtn: {
// //     width: 38,
// //     height: 38,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     marginBottom: 2,
// //   },
// //   inputWrap: {
// //     flex: 1,
// //     borderRadius: 22,
// //     borderWidth: 1,
// //     paddingHorizontal: 14,
// //     paddingVertical: 8,
// //     maxHeight: 120,
// //   },
// //   input: { fontSize: 15, lineHeight: 21 },
// //   sendBtn: {
// //     width: 42,
// //     height: 42,
// //     borderRadius: 21,
// //     overflow: "hidden",
// //     marginBottom: 1,
// //   },
// //   sendGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
// // });
