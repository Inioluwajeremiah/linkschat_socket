// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
//   Pressable,
//   ActivityIndicator,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { Image } from "expo-image";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Message, User } from "../../../types";
// import { formatTime } from "../../../utils/date";
// import AudioPlayer from "./AudioPlayer";
// import { useMediaDownload } from "@/utils/mediaCache.ts";
// import DocMessage, { docStyles } from "./DocMessage";
// import * as Sharing from "expo-sharing";

// interface Props {
//   message: Message;
//   isOwn: boolean;
//   showAvatar: boolean;
//   onLongPress: (
//     msg: Message,
//     anchor: { x: number; y: number; width: number; height: number }
//   ) => void;
//   onReplyPress: (msg: Message) => void;
//   onMediaPress: (uri: string, type: "image" | "video") => void;
//   colors: any;
//   myId: string;
// }

// const STATUS_ICONS = {
//   sending: { name: "time-outline" as const, color: "rgba(255,255,255)" },
//   sent: { name: "checkmark-outline" as const, color: "rgba(255,255,255)" },
//   delivered: {
//     name: "checkmark-done-outline" as const,
//     color: "rgba(255,255,255)",
//   },
//   read: {
//     name: "checkmark-done-outline" as const,
//     color: "#fff",
//   },
// };

// // ─── Reply preview ─────────────────────────────────────────────────────────
// function ReplyPreview({ replyTo, colors }: { replyTo: any; colors: any }) {
//   if (!replyTo) return null;
//   const sender = replyTo.sender as User;
//   const preview =
//     replyTo.type === "image"
//       ? "📷 Photo"
//       : replyTo.type === "audio"
//       ? "🎵 Voice"
//       : replyTo.type === "video"
//       ? "🎥 Video"
//       : replyTo.content?.slice(0, 60) || "";
//   return (
//     <View
//       style={[
//         replyStyles.wrap,
//         { borderLeftColor: "#00d4aa", backgroundColor: "rgba(0,212,170,0.08)" },
//       ]}
//     >
//       <Text style={replyStyles.name}>{sender?.name || "Unknown"}</Text>
//       <Text
//         style={[replyStyles.text, { color: colors.textSecondary }]}
//         numberOfLines={1}
//       >
//         {preview}
//       </Text>
//     </View>
//   );
// }
// const replyStyles = StyleSheet.create({
//   wrap: {
//     borderLeftWidth: 3,
//     paddingLeft: 8,
//     paddingVertical: 4,
//     marginBottom: 6,
//     borderRadius: 4,
//   },
//   name: { fontSize: 12, fontWeight: "700", color: "#00d4aa" },
//   text: { fontSize: 12 },
// });

// // ─── Shared download control (spinner + %, or download / retry icon) ───────
// function DownloadControl({
//   status,
//   progress,
//   onPress,
// }: {
//   status: "idle" | "downloading" | "downloaded" | "error";
//   progress: number;
//   onPress: () => void;
// }) {
//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       style={dlStyles.circle}
//       disabled={status === "downloading"}
//       activeOpacity={0.75}
//     >
//       {status === "downloading" ? (
//         <>
//           <ActivityIndicator color="#fff" size="small" />
//           <Text style={dlStyles.pct}>{Math.round(progress * 100)}%</Text>
//         </>
//       ) : status === "error" ? (
//         <Ionicons name="refresh" size={20} color="#fff" />
//       ) : (
//         <Ionicons name="arrow-down" size={20} color="#fff" />
//       )}
//     </TouchableOpacity>
//   );
// }
// const dlStyles = StyleSheet.create({
//   circle: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     backgroundColor: "rgba(0,0,0,0.55)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   pct: { color: "#fff", fontSize: 9, fontWeight: "700", marginTop: 1 },
// });

// // ─── Locked image / video thumb — blurred preview + tap-to-download ────────
// function LockedVisualMedia({
//   id,
//   url,
//   thumbnail,
//   type,
//   onReady,
// }: {
//   id: string;
//   url: string;
//   thumbnail?: string;
//   type: "image" | "video";
//   onReady: (localUri: string) => void;
// }) {
//   const { status, progress, localUri, startDownload } = useMediaDownload(
//     id,
//     url,
//     type === "video" ? "mp4" : "jpg"
//   );

//   if (status === "downloaded" && localUri) {
//     return (
//       <TouchableOpacity onPress={() => onReady(localUri)} activeOpacity={0.9}>
//         <Image
//           source={{ uri: localUri }}
//           style={styles.imageMsg}
//           contentFit="cover"
//         />
//         {type === "video" && (
//           <View style={styles.playBtn}>
//             <Ionicons name="play" size={26} color="#fff" />
//           </View>
//         )}
//       </TouchableOpacity>
//     );
//   }

//   return (
//     <View style={styles.imageMsg}>
//       {thumbnail ? (
//         <Image
//           source={{ uri: thumbnail }}
//           style={StyleSheet.absoluteFillObject}
//           contentFit="cover"
//           blurRadius={18}
//         />
//       ) : (
//         <View
//           style={[
//             StyleSheet.absoluteFillObject,
//             { backgroundColor: "#1a1a2e", borderRadius: 12 },
//           ]}
//         />
//       )}
//       <View style={[StyleSheet.absoluteFillObject, lockedStyles.dim]} />
//       <View style={lockedStyles.center}>
//         <DownloadControl
//           status={status}
//           progress={progress}
//           onPress={startDownload}
//         />
//         <Text style={lockedStyles.label}>
//           {type === "video" ? "Video" : "Photo"}
//         </Text>
//       </View>
//     </View>
//   );
// }
// const lockedStyles = StyleSheet.create({
//   dim: { backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 6 },
//   label: { color: "#fff", fontSize: 12, fontWeight: "600" },
// });

// // ─── Locked audio card — shown until downloaded, then swaps to AudioPlayer ──
// function LockedAudio({
//   id,
//   url,
//   isOwn,
//   duration,
//   onReady,
// }: {
//   id: string;
//   url: string;
//   isOwn: boolean;
//   duration?: number;
//   onReady: (localUri: string) => void;
// }) {
//   const { status, progress, localUri, startDownload } = useMediaDownload(
//     id,
//     url,
//     "m4a"
//   );

//   useEffect(() => {
//     if (status === "downloaded" && localUri) onReady(localUri);
//   }, [status, localUri]);

//   const fmt = (s: number) =>
//     `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

//   return (
//     <View style={audioLockStyles.wrap}>
//       <DownloadControl
//         status={status}
//         progress={progress}
//         onPress={startDownload}
//       />
//       <View>
//         <Text
//           style={[audioLockStyles.label, { color: isOwn ? "#fff" : "#8888aa" }]}
//         >
//           Voice message
//         </Text>
//         <Text
//           style={[
//             audioLockStyles.sub,
//             { color: isOwn ? "rgba(255,255,255)" : "#8888aa" },
//           ]}
//         >
//           {fmt(duration || 0)} · Tap to download
//         </Text>
//       </View>
//     </View>
//   );
// }
// const audioLockStyles = StyleSheet.create({
//   wrap: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 190 },
//   label: { fontSize: 13, fontWeight: "700" },
//   sub: { fontSize: 11, marginTop: 2 },
// });

// // ─── Swaps LockedAudio -> AudioPlayer once the file is on disk ─────────────
// function LockedAudioOrPlayer({
//   id,
//   url,
//   duration,
//   isOwn,
// }: {
//   id: string;
//   url: string;
//   duration: number;
//   isOwn: boolean;
// }) {
//   const [localUri, setLocalUri] = useState<string | null>(null);

//   if (localUri) {
//     return (
//       <AudioPlayer uri={localUri} duration={duration} isOwn={isOwn} id={id} />
//     );
//   }
//   return (
//     <LockedAudio
//       id={id}
//       url={url}
//       isOwn={isOwn}
//       duration={duration}
//       onReady={setLocalUri}
//     />
//   );
// }

// // ─── Main bubble ────────────────────────────────────────────────────────────
// export default function MessageBubble({
//   message,
//   isOwn,
//   showAvatar,
//   onLongPress,
//   onReplyPress,
//   onMediaPress,
//   colors,
//   myId,
// }: Props) {
//   const slideAnim = useRef(new Animated.Value(isOwn ? 30 : -30)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.95)).current;
//   const viewRef = useRef<View>(null);

//   useEffect(() => {
//     Animated.parallel([
//       Animated.spring(slideAnim, {
//         toValue: 0,
//         useNativeDriver: true,
//         tension: 200,
//         friction: 22,
//       }),
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 180,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         useNativeDriver: true,
//         tension: 200,
//         friction: 18,
//       }),
//     ]).start();
//   }, []);

//   const handleLongPress = () => {
//     viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
//       onLongPress(message, { x: pageX, y: pageY, width, height });
//     });
//   };

//   const sender = message.sender as User;
//   const isDeleted = message.isDeleted;
//   const isForwarded = !!message.forwardedFrom;

//   // Compute delivery status for own messages
//   const status: keyof typeof STATUS_ICONS = !isOwn
//     ? "read"
//     : (message as any).sending
//     ? "sending"
//     : message.readBy?.length > 1
//     ? "read"
//     : message.deliveredTo?.length > 1
//     ? "delivered"
//     : "sent";

//   // Group reactions by emoji
//   const reactionGroups: Record<string, { count: number; mine: boolean }> = {};
//   (message.reactions || []).forEach((r: any) => {
//     const uid = typeof r.user === "string" ? r.user : r.user?._id;
//     if (!reactionGroups[r.emoji])
//       reactionGroups[r.emoji] = { count: 0, mine: false };
//     reactionGroups[r.emoji].count++;
//     if (uid === myId) reactionGroups[r.emoji].mine = true;
//   });

//   const initials =
//     sender?.name
//       ?.split(" ")
//       .map((w) => w[0])
//       .join("")
//       .slice(0, 2)
//       .toUpperCase() || "?";

//   return (
//     <Animated.View
//       style={[
//         styles.row,
//         isOwn ? styles.rowOwn : styles.rowOther,
//         {
//           opacity: fadeAnim,
//           transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
//         },
//       ]}
//     >
//       {/* Avatar (other side only) */}
//       {!isOwn && (
//         <View style={styles.avatarCol}>
//           {showAvatar ? (
//             sender?.avatar ? (
//               <Image
//                 source={{ uri: sender.avatar }}
//                 style={styles.avatar}
//                 contentFit="cover"
//               />
//             ) : (
//               <LinearGradient
//                 colors={["#00d4aa", "#5b8dee"]}
//                 style={styles.avatarFb}
//               >
//                 <Text style={styles.avatarInitials}>{initials}</Text>
//               </LinearGradient>
//             )
//           ) : (
//             <View style={styles.avatarPlaceholder} />
//           )}
//         </View>
//       )}

//       <View
//         style={[
//           styles.bubbleCol,
//           isOwn ? styles.bubbleColOwn : styles.bubbleColOther,
//         ]}
//       >
//         {/* Sender name in groups */}
//         {!isOwn && showAvatar && sender?.name && (
//           <Text style={styles.senderName}>{sender.name}</Text>
//         )}

//         <Pressable
//           ref={viewRef as any}
//           onLongPress={handleLongPress}
//           delayLongPress={280}
//         >
//           <View
//             style={[
//               styles.bubble,
//               isOwn
//                 ? styles.bubbleOwn
//                 : [styles.bubbleOther, { backgroundColor: colors.surface }],
//               isDeleted && styles.bubbleDeleted,
//             ]}
//           >
//             {/* Forwarded label */}
//             {isForwarded && !isDeleted && (
//               <View style={styles.forwardedLabel}>
//                 <Ionicons
//                   name="arrow-redo-outline"
//                   size={11}
//                   color={isOwn ? "rgba(255,255,255,0.6)" : colors.textMuted}
//                 />
//                 <Text
//                   style={[
//                     styles.forwardedText,
//                     {
//                       color: isOwn ? "rgba(255,255,255,0.6)" : colors.textMuted,
//                     },
//                   ]}
//                 >
//                   Forwarded
//                 </Text>
//               </View>
//             )}

//             {/* Reply preview */}
//             {!isDeleted && message.replyTo && (
//               <TouchableOpacity
//                 onPress={() => onReplyPress(message)}
//                 activeOpacity={0.8}
//               >
//                 <ReplyPreview replyTo={message.replyTo} colors={colors} />
//               </TouchableOpacity>
//             )}

//             {/* Content */}
//             {isDeleted ? (
//               <View style={styles.deletedWrap}>
//                 <Ionicons
//                   name="ban-outline"
//                   size={14}
//                   color={isOwn ? "#fff" : colors.textMuted}
//                 />
//                 <Text
//                   style={[
//                     styles.deletedText,
//                     {
//                       color: isOwn ? "#fff" : colors.textMuted,
//                     },
//                   ]}
//                 >
//                   This message was deleted
//                 </Text>
//               </View>
//             ) : message.type === "image" || message.type === "gif" ? (
//               //   <View>
//               //     <LockedVisualMedia
//               //       id={message._id}
//               //       url={message.mediaUrl || ""}
//               //       thumbnail={message.mediaThumbnail}
//               //       type="image"
//               //       onReady={(localUri) => onMediaPress(localUri, "image")}
//               //     />
//               //     {message.content ? (
//               //       <Text
//               //         style={[
//               //           styles.imageCaption,
//               //           { color: isOwn ? "#fff" : colors.textPrimary },
//               //         ]}
//               //       >
//               //         {message.content}
//               //       </Text>
//               //     ) : null}
//               //   </View>
//               // ) : message.type === "audio" ? (
//               //   <LockedAudioOrPlayer
//               //     id={message._id}
//               //     url={message.mediaUrl || ""}
//               //     duration={message.mediaDuration || 0}
//               //     isOwn={isOwn}
//               //   />
//               // ) : message.type === "video" ? (
//               //   <LockedVisualMedia
//               //     id={message._id}
//               //     url={message.mediaUrl || ""}
//               //     thumbnail={message.mediaThumbnail}
//               //     type="video"
//               //     onReady={(localUri) => onMediaPress(localUri, "video")}
//               //   />
//               // )

//               <View>
//                 {isOwn ? (
//                   <TouchableOpacity
//                     onPress={() => onMediaPress(message.mediaUrl!, "image")}
//                     activeOpacity={0.9}
//                   >
//                     <Image
//                       source={{ uri: message.mediaUrl }}
//                       style={styles.imageMsg}
//                       contentFit="cover"
//                     />
//                   </TouchableOpacity>
//                 ) : (
//                   <LockedVisualMedia
//                     id={message._id}
//                     url={message.mediaUrl || ""}
//                     thumbnail={message.mediaThumbnail}
//                     type="image"
//                     onReady={(localUri) => onMediaPress(localUri, "image")}
//                   />
//                 )}
//                 {message.content ? (
//                   <Text
//                     style={[
//                       styles.imageCaption,
//                       { color: isOwn ? "#fff" : colors.textPrimary },
//                     ]}
//                   >
//                     {message.content}
//                   </Text>
//                 ) : null}
//               </View>
//             ) : message.type === "audio" ? (
//               isOwn ? (
//                 <AudioPlayer
//                   uri={message.mediaUrl || ""}
//                   duration={message.mediaDuration || 0}
//                   isOwn={isOwn}
//                   id={message._id}
//                 />
//               ) : (
//                 <LockedAudioOrPlayer
//                   id={message._id}
//                   url={message.mediaUrl || ""}
//                   duration={message.mediaDuration || 0}
//                   isOwn={isOwn}
//                 />
//               )
//             ) : message.type === "video" ? (
//               isOwn ? (
//                 <TouchableOpacity
//                   onPress={() => onMediaPress(message.mediaUrl!, "video")}
//                   activeOpacity={0.9}
//                   style={styles.videoWrap}
//                 >
//                   <Image
//                     source={{ uri: message.mediaThumbnail || message.mediaUrl }}
//                     style={styles.imageMsg}
//                     contentFit="cover"
//                   />
//                   <View style={styles.playBtn}>
//                     <Ionicons name="play" size={26} color="#fff" />
//                   </View>
//                 </TouchableOpacity>
//               ) : (
//                 <LockedVisualMedia
//                   id={message._id}
//                   url={message.mediaUrl || ""}
//                   thumbnail={message.mediaThumbnail}
//                   type="video"
//                   onReady={(localUri) => onMediaPress(localUri, "video")}
//                 />
//               )
//             ) : message.type === "document" ? (
//               isOwn ? (
//                 <TouchableOpacity
//                   onPress={async () => {
//                     try {
//                       // const Sharing = await import("expo-sharing");
//                       if (
//                         (await Sharing.isAvailableAsync()) &&
//                         message.mediaUrl
//                       ) {
//                         await Sharing.shareAsync(message.mediaUrl);
//                       }
//                     } catch (e) {
//                       console.warn("Failed to open document", e);
//                     }
//                   }}
//                   activeOpacity={0.8}
//                 >
//                   <View style={docStyles.wrap}>
//                     <View
//                       style={[
//                         docStyles.icon,
//                         { backgroundColor: "rgba(255,255,255)" },
//                       ]}
//                     >
//                       <Text style={docStyles.ext}>
//                         {(message.mediaName || "")
//                           .split(".")
//                           .pop()
//                           ?.toUpperCase() || "DOC"}
//                       </Text>
//                     </View>
//                     <View style={docStyles.info}>
//                       <Text
//                         style={[docStyles.name, { color: "#fff" }]}
//                         numberOfLines={1}
//                       >
//                         {message.mediaName || "Document"}
//                       </Text>
//                       <Text style={docStyles.size}>
//                         {message.mediaSize
//                           ? message.mediaSize > 1024 * 1024
//                             ? `${(message.mediaSize / 1024 / 1024).toFixed(
//                                 1
//                               )} MB`
//                             : `${Math.round(message.mediaSize / 1024)} KB`
//                           : ""}
//                       </Text>
//                     </View>
//                     <Ionicons
//                       name="open-outline"
//                       size={18}
//                       color="rgba(255,255,255)"
//                     />
//                   </View>
//                 </TouchableOpacity>
//               ) : (
//                 <DocMessage
//                   id={message._id}
//                   name={message.mediaName}
//                   size={message.mediaSize}
//                   url={message.mediaUrl || ""}
//                   isOwn={isOwn}
//                 />
//               )
//             ) : message.type === "sticker" ? (
//               <Image
//                 source={{ uri: message.mediaUrl }}
//                 style={styles.sticker}
//                 contentFit="contain"
//               />
//             ) : (
//               <Text
//                 style={[
//                   styles.textContent,
//                   { color: isOwn ? "#fff" : colors.textPrimary },
//                 ]}
//               >
//                 {message.content}
//               </Text>
//             )}

//             {/* Time + status */}
//             <View
//               style={[
//                 styles.metaRow,
//                 isOwn ? styles.metaRowOwn : styles.metaRowOther,
//               ]}
//             >
//               {message.isEdited && (
//                 <Text
//                   style={[
//                     styles.editedTag,
//                     {
//                       color: isOwn ? "rgba(255,255,255)" : colors.textMuted,
//                     },
//                   ]}
//                 >
//                   edited
//                 </Text>
//               )}
//               <Text
//                 style={[
//                   styles.timeText,
//                   { color: isOwn ? "rgba(255,255,255)" : colors.textMuted },
//                 ]}
//               >
//                 {formatTime(new Date(message.createdAt))}
//               </Text>
//               {isOwn && (
//                 <Ionicons
//                   // name="checkmark-done-outline"
//                   // color={"#000"}
//                   name={STATUS_ICONS[status].name}
//                   // size={14}
//                   color={STATUS_ICONS[status].color}
//                 />
//               )}
//             </View>
//           </View>
//         </Pressable>

//         {/* Reactions */}
//         {Object.keys(reactionGroups).length > 0 && (
//           <View
//             style={[styles.reactionsRow, isOwn ? styles.reactionsRowOwn : {}]}
//           >
//             {Object.entries(reactionGroups).map(([emoji, { count, mine }]) => (
//               <View
//                 key={emoji}
//                 style={[
//                   styles.reactionChip,
//                   mine && styles.reactionChipMine,
//                   {
//                     backgroundColor: colors.surface,
//                     borderColor: mine ? "#00d4aa" : colors.border,
//                   },
//                 ]}
//               >
//                 <Text style={styles.reactionEmoji}>{emoji}</Text>
//                 {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
//               </View>
//             ))}
//           </View>
//         )}
//       </View>
//     </Animated.View>
//   );
// }

// const styles = StyleSheet.create({
//   row: {
//     flexDirection: "row",
//     paddingHorizontal: 12,
//     marginBottom: 2,
//     alignItems: "flex-end",
//   },
//   rowOwn: { justifyContent: "flex-end" },
//   rowOther: { justifyContent: "flex-start" },
//   avatarCol: { width: 34, marginRight: 6, flexShrink: 0 },
//   avatar: { width: 28, height: 28, borderRadius: 14 },
//   avatarFb: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarInitials: { color: "#fff", fontSize: 10, fontWeight: "800" },
//   avatarPlaceholder: { width: 28, height: 28 },
//   bubbleCol: { maxWidth: "78%", gap: 2 },
//   bubbleColOwn: { alignItems: "flex-end" },
//   bubbleColOther: { alignItems: "flex-start" },
//   senderName: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#00d4aa",
//     marginLeft: 4,
//     marginBottom: 2,
//   },
//   bubble: {
//     borderRadius: 20,
//     paddingHorizontal: 13,
//     paddingTop: 9,
//     paddingBottom: 7,
//     maxWidth: "100%",
//     minWidth: 60,
//   },
//   bubbleOwn: {
//     backgroundColor: "#00d4aa",
//     borderBottomRightRadius: 4,
//   },
//   bubbleOther: {
//     borderBottomLeftRadius: 4,
//   },
//   bubbleDeleted: { opacity: 0.8 },
//   forwardedLabel: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     marginBottom: 4,
//   },
//   forwardedText: { fontSize: 11, fontStyle: "italic" },
//   deletedWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
//   deletedText: { fontSize: 14, fontStyle: "italic" },
//   textContent: { fontSize: 15, lineHeight: 21 },
//   imageMsg: { width: 220, height: 160, borderRadius: 12, overflow: "hidden" },
//   imageCaption: { fontSize: 13, marginTop: 6 },
//   videoWrap: { position: "relative" },
//   playBtn: {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     transform: [{ translateX: -23 }, { translateY: -23 }],
//   },
//   sticker: { width: 140, height: 140 },
//   metaRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
//   metaRowOwn: { justifyContent: "flex-end" },
//   metaRowOther: { justifyContent: "flex-start" },
//   timeText: { fontSize: 11 },
//   editedTag: { fontSize: 11, fontStyle: "italic", marginRight: 2 },
//   reactionsRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 4,
//     marginTop: 4,
//     marginLeft: 4,
//   },
//   reactionsRowOwn: {
//     justifyContent: "flex-end",
//     marginLeft: 0,
//     marginRight: 4,
//   },
//   reactionChip: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 3,
//     paddingHorizontal: 7,
//     paddingVertical: 3,
//     borderRadius: 99,
//     borderWidth: 1,
//   },
//   reactionChipMine: {},
//   reactionEmoji: { fontSize: 14 },
//   reactionCount: { fontSize: 11, color: "#8888aa", fontWeight: "700" },
// });

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Message, User } from "../../../types";
import { formatTime } from "../../../utils/date";
import AudioPlayer from "./AudioPlayer";
import { useMediaDownload } from "@/utils/mediaCache.ts";
import DocMessage, { docStyles } from "./DocMessage";
import * as Sharing from "expo-sharing";
import { findBundledStickerSource } from "@/constants/stickers";

interface Props {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  onLongPress: (
    msg: Message,
    anchor: { x: number; y: number; width: number; height: number }
  ) => void;
  onReplyPress: (msg: Message) => void;
  onMediaPress: (uri: string, type: "image" | "video") => void;
  colors: any;
  myId: string;
}

const STATUS_ICONS = {
  sending: { name: "time-outline" as const, color: "rgba(255,255,255)" },
  sent: { name: "checkmark-outline" as const, color: "rgba(255,255,255)" },
  delivered: {
    name: "checkmark-done-outline" as const,
    color: "rgba(255,255,255)",
  },
  read: {
    name: "checkmark-done-outline" as const,
    color: "#fff",
  },
};

// ─── Reply preview ─────────────────────────────────────────────────────────
function ReplyPreview({ replyTo, colors }: { replyTo: any; colors: any }) {
  if (!replyTo) return null;
  const sender = replyTo.sender as User;
  const preview =
    replyTo.type === "image"
      ? "📷 Photo"
      : replyTo.type === "audio"
      ? "🎵 Voice"
      : replyTo.type === "video"
      ? "🎥 Video"
      : replyTo.type === "sticker"
      ? "🏷️ Sticker"
      : replyTo.content?.slice(0, 60) || "";
  return (
    <View
      style={[
        replyStyles.wrap,
        { borderLeftColor: "#00d4aa", backgroundColor: "rgba(0,212,170,0.08)" },
      ]}
    >
      <Text style={replyStyles.name}>{sender?.name || "Unknown"}</Text>
      <Text
        style={[replyStyles.text, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {preview}
      </Text>
    </View>
  );
}
const replyStyles = StyleSheet.create({
  wrap: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 4,
    marginBottom: 6,
    borderRadius: 4,
  },
  name: { fontSize: 12, fontWeight: "700", color: "#00d4aa" },
  text: { fontSize: 12 },
});

// ─── Shared download control (spinner + %, or download / retry icon) ───────
function DownloadControl({
  status,
  progress,
  onPress,
}: {
  status: "idle" | "downloading" | "downloaded" | "error";
  progress: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={dlStyles.circle}
      disabled={status === "downloading"}
      activeOpacity={0.75}
    >
      {status === "downloading" ? (
        <>
          <ActivityIndicator color="#fff" size="small" />
          <Text style={dlStyles.pct}>{Math.round(progress * 100)}%</Text>
        </>
      ) : status === "error" ? (
        <Ionicons name="refresh" size={20} color="#fff" />
      ) : (
        <Ionicons name="arrow-down" size={20} color="#fff" />
      )}
    </TouchableOpacity>
  );
}
const dlStyles = StyleSheet.create({
  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  pct: { color: "#fff", fontSize: 9, fontWeight: "700", marginTop: 1 },
});

// ─── Locked image / video thumb — blurred preview + tap-to-download ────────
function LockedVisualMedia({
  id,
  url,
  thumbnail,
  type,
  onReady,
}: {
  id: string;
  url: string;
  thumbnail?: string;
  type: "image" | "video";
  onReady: (localUri: string) => void;
}) {
  const { status, progress, localUri, startDownload } = useMediaDownload(
    id,
    url,
    type === "video" ? "mp4" : "jpg"
  );

  if (status === "downloaded" && localUri) {
    return (
      <TouchableOpacity onPress={() => onReady(localUri)} activeOpacity={0.9}>
        <Image
          source={{ uri: localUri }}
          style={styles.imageMsg}
          contentFit="cover"
        />
        {type === "video" && (
          <View style={styles.playBtn}>
            <Ionicons name="play" size={26} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.imageMsg}>
      {thumbnail ? (
        <Image
          source={{ uri: thumbnail }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          blurRadius={18}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "#1a1a2e", borderRadius: 12 },
          ]}
        />
      )}
      <View style={[StyleSheet.absoluteFillObject, lockedStyles.dim]} />
      <View style={lockedStyles.center}>
        <DownloadControl
          status={status}
          progress={progress}
          onPress={startDownload}
        />
        <Text style={lockedStyles.label}>
          {type === "video" ? "Video" : "Photo"}
        </Text>
      </View>
    </View>
  );
}
const lockedStyles = StyleSheet.create({
  dim: { backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 6 },
  label: { color: "#fff", fontSize: 12, fontWeight: "600" },
});

// ─── Locked sticker — same download-gated pattern as photos/videos, but
// sized for a sticker rather than a full image, and with no blur/dim since
// a small transparent-PNG preview isn't the bandwidth concern a photo is. ──
function LockedSticker({
  id,
  url,
  onReady,
}: {
  id: string;
  url: string;
  onReady: (localUri: string) => void;
}) {
  const { status, progress, localUri, startDownload } = useMediaDownload(
    id,
    url,
    "jpg"
  );

  if (status === "downloaded" && localUri) {
    return (
      <Image
        source={{ uri: localUri }}
        style={styles.sticker}
        contentFit="contain"
      />
    );
  }

  return (
    <View style={[styles.sticker, lockedStickerStyles.wrap]}>
      <DownloadControl
        status={status}
        progress={progress}
        onPress={startDownload}
      />
    </View>
  );
}
const lockedStickerStyles = StyleSheet.create({
  wrap: { justifyContent: "center", alignItems: "center" },
});

// ─── Locked audio card — shown until downloaded, then swaps to AudioPlayer ──
function LockedAudio({
  id,
  url,
  isOwn,
  duration,
  onReady,
}: {
  id: string;
  url: string;
  isOwn: boolean;
  duration?: number;
  onReady: (localUri: string) => void;
}) {
  const { status, progress, localUri, startDownload } = useMediaDownload(
    id,
    url,
    "m4a"
  );

  useEffect(() => {
    if (status === "downloaded" && localUri) onReady(localUri);
  }, [status, localUri]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <View style={audioLockStyles.wrap}>
      <DownloadControl
        status={status}
        progress={progress}
        onPress={startDownload}
      />
      <View>
        <Text
          style={[audioLockStyles.label, { color: isOwn ? "#fff" : "#8888aa" }]}
        >
          Voice message
        </Text>
        <Text
          style={[
            audioLockStyles.sub,
            { color: isOwn ? "rgba(255,255,255)" : "#8888aa" },
          ]}
        >
          {fmt(duration || 0)} · Tap to download
        </Text>
      </View>
    </View>
  );
}
const audioLockStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 190 },
  label: { fontSize: 13, fontWeight: "700" },
  sub: { fontSize: 11, marginTop: 2 },
});

// ─── Swaps LockedAudio -> AudioPlayer once the file is on disk ─────────────
function LockedAudioOrPlayer({
  id,
  url,
  duration,
  isOwn,
}: {
  id: string;
  url: string;
  duration: number;
  isOwn: boolean;
}) {
  const [localUri, setLocalUri] = useState<string | null>(null);

  if (localUri) {
    return (
      <AudioPlayer uri={localUri} duration={duration} isOwn={isOwn} id={id} />
    );
  }
  return (
    <LockedAudio
      id={id}
      url={url}
      isOwn={isOwn}
      duration={duration}
      onReady={setLocalUri}
    />
  );
}

// ─── Main bubble ────────────────────────────────────────────────────────────
export default function MessageBubble({
  message,
  isOwn,
  showAvatar,
  onLongPress,
  onReplyPress,
  onMediaPress,
  colors,
  myId,
}: Props) {
  const slideAnim = useRef(new Animated.Value(isOwn ? 30 : -30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const viewRef = useRef<View>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 200,
        friction: 22,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 18,
      }),
    ]).start();
  }, []);

  const handleLongPress = () => {
    viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
      onLongPress(message, { x: pageX, y: pageY, width, height });
    });
  };

  const sender = message.sender as User;
  const isDeleted = message.isDeleted;
  const isForwarded = !!message.forwardedFrom;

  const status: keyof typeof STATUS_ICONS = !isOwn
    ? "read"
    : (message as any).sending
    ? "sending"
    : message.readBy?.length > 1
    ? "read"
    : message.deliveredTo?.length > 1
    ? "delivered"
    : "sent";

  const reactionGroups: Record<string, { count: number; mine: boolean }> = {};
  (message.reactions || []).forEach((r: any) => {
    const uid = typeof r.user === "string" ? r.user : r.user?._id;
    if (!reactionGroups[r.emoji])
      reactionGroups[r.emoji] = { count: 0, mine: false };
    reactionGroups[r.emoji].count++;
    if (uid === myId) reactionGroups[r.emoji].mine = true;
  });

  const initials =
    sender?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  // Sticker source resolution happens once here since the render branch
  // below checks it more than once.
  const bundledStickerSource =
    message.type === "sticker"
      ? findBundledStickerSource(message.mediaUrl)
      : null;

  return (
    <Animated.View
      style={[
        styles.row,
        isOwn ? styles.rowOwn : styles.rowOther,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {!isOwn && (
        <View style={styles.avatarCol}>
          {showAvatar ? (
            sender?.avatar ? (
              <Image
                source={{ uri: sender.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <LinearGradient
                colors={["#00d4aa", "#5b8dee"]}
                style={styles.avatarFb}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
      )}

      <View
        style={[
          styles.bubbleCol,
          isOwn ? styles.bubbleColOwn : styles.bubbleColOther,
        ]}
      >
        {!isOwn && showAvatar && sender?.name && (
          <Text style={styles.senderName}>{sender.name}</Text>
        )}

        <Pressable
          ref={viewRef as any}
          onLongPress={handleLongPress}
          delayLongPress={280}
        >
          {/* Stickers render outside the normal bubble chrome — no
              background/padding/tail, matching WhatsApp/Telegram. Every
              other message type keeps the standard bubble below. */}
          {!isDeleted && message.type === "sticker" ? (
            <View style={styles.stickerBubbleWrap}>
              {message.replyTo && (
                <TouchableOpacity
                  onPress={() => onReplyPress(message)}
                  activeOpacity={0.8}
                  style={{ marginBottom: 6 }}
                >
                  <ReplyPreview replyTo={message.replyTo} colors={colors} />
                </TouchableOpacity>
              )}
              {bundledStickerSource ? (
                // Bundled sticker: both apps already ship this asset, so it
                // renders instantly regardless of who sent it — no download.
                <Image
                  source={bundledStickerSource}
                  style={styles.sticker}
                  contentFit="contain"
                />
              ) : isOwn ? (
                // Custom sticker, own message: it was just uploaded from
                // this device, so show it directly.
                <Image
                  source={{ uri: message.mediaUrl }}
                  style={styles.sticker}
                  contentFit="contain"
                />
              ) : (
                // Custom sticker from someone else: it's really just a
                // photo, so gate it behind the same tap-to-download flow
                // used by every other remote media type.
                <LockedSticker
                  id={message._id}
                  url={message.mediaUrl || ""}
                  onReady={() => {}}
                />
              )}
              <View style={styles.stickerMetaRow}>
                {message.isEdited && (
                  <Text style={[styles.editedTag, { color: colors.textMuted }]}>
                    edited
                  </Text>
                )}
                <Text style={[styles.timeText, { color: colors.textMuted }]}>
                  {formatTime(new Date(message.createdAt))}
                </Text>
                {isOwn && (
                  <Ionicons
                    name={STATUS_ICONS[status].name}
                    color={colors.textMuted}
                    size={13}
                  />
                )}
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.bubble,
                isOwn
                  ? styles.bubbleOwn
                  : [styles.bubbleOther, { backgroundColor: colors.surface }],
                isDeleted && styles.bubbleDeleted,
              ]}
            >
              {isForwarded && !isDeleted && (
                <View style={styles.forwardedLabel}>
                  <Ionicons
                    name="arrow-redo-outline"
                    size={11}
                    color={isOwn ? "rgba(255,255,255,0.6)" : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.forwardedText,
                      {
                        color: isOwn
                          ? "rgba(255,255,255,0.6)"
                          : colors.textMuted,
                      },
                    ]}
                  >
                    Forwarded
                  </Text>
                </View>
              )}

              {!isDeleted && message.replyTo && (
                <TouchableOpacity
                  onPress={() => onReplyPress(message)}
                  activeOpacity={0.8}
                >
                  <ReplyPreview replyTo={message.replyTo} colors={colors} />
                </TouchableOpacity>
              )}

              {isDeleted ? (
                <View style={styles.deletedWrap}>
                  <Ionicons
                    name="ban-outline"
                    size={14}
                    color={isOwn ? "#fff" : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.deletedText,
                      {
                        color: isOwn ? "#fff" : colors.textMuted,
                      },
                    ]}
                  >
                    This message was deleted
                  </Text>
                </View>
              ) : message.type === "image" || message.type === "gif" ? (
                <View>
                  {isOwn ? (
                    <TouchableOpacity
                      onPress={() => onMediaPress(message.mediaUrl!, "image")}
                      activeOpacity={0.9}
                    >
                      <Image
                        source={{ uri: message.mediaUrl }}
                        style={styles.imageMsg}
                        contentFit="cover"
                      />
                    </TouchableOpacity>
                  ) : (
                    <LockedVisualMedia
                      id={message._id}
                      url={message.mediaUrl || ""}
                      thumbnail={message.mediaThumbnail}
                      type="image"
                      onReady={(localUri) => onMediaPress(localUri, "image")}
                    />
                  )}
                  {message.content ? (
                    <Text
                      style={[
                        styles.imageCaption,
                        { color: isOwn ? "#fff" : colors.textPrimary },
                      ]}
                    >
                      {message.content}
                    </Text>
                  ) : null}
                </View>
              ) : message.type === "audio" ? (
                isOwn ? (
                  <AudioPlayer
                    uri={message.mediaUrl || ""}
                    duration={message.mediaDuration || 0}
                    isOwn={isOwn}
                    id={message._id}
                  />
                ) : (
                  <LockedAudioOrPlayer
                    id={message._id}
                    url={message.mediaUrl || ""}
                    duration={message.mediaDuration || 0}
                    isOwn={isOwn}
                  />
                )
              ) : message.type === "video" ? (
                isOwn ? (
                  <TouchableOpacity
                    onPress={() => onMediaPress(message.mediaUrl!, "video")}
                    activeOpacity={0.9}
                    style={styles.videoWrap}
                  >
                    <Image
                      source={{
                        uri: message.mediaThumbnail || message.mediaUrl,
                      }}
                      style={styles.imageMsg}
                      contentFit="cover"
                    />
                    <View style={styles.playBtn}>
                      <Ionicons name="play" size={26} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <LockedVisualMedia
                    id={message._id}
                    url={message.mediaUrl || ""}
                    thumbnail={message.mediaThumbnail}
                    type="video"
                    onReady={(localUri) => onMediaPress(localUri, "video")}
                  />
                )
              ) : message.type === "document" ? (
                isOwn ? (
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        if (
                          (await Sharing.isAvailableAsync()) &&
                          message.mediaUrl
                        ) {
                          await Sharing.shareAsync(message.mediaUrl);
                        }
                      } catch (e) {
                        console.warn("Failed to open document", e);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={docStyles.wrap}>
                      <View
                        style={[
                          docStyles.icon,
                          { backgroundColor: "rgba(255,255,255)" },
                        ]}
                      >
                        <Text style={docStyles.ext}>
                          {(message.mediaName || "")
                            .split(".")
                            .pop()
                            ?.toUpperCase() || "DOC"}
                        </Text>
                      </View>
                      <View style={docStyles.info}>
                        <Text
                          style={[docStyles.name, { color: "#fff" }]}
                          numberOfLines={1}
                        >
                          {message.mediaName || "Document"}
                        </Text>
                        <Text style={docStyles.size}>
                          {message.mediaSize
                            ? message.mediaSize > 1024 * 1024
                              ? `${(message.mediaSize / 1024 / 1024).toFixed(
                                  1
                                )} MB`
                              : `${Math.round(message.mediaSize / 1024)} KB`
                            : ""}
                        </Text>
                      </View>
                      <Ionicons
                        name="open-outline"
                        size={18}
                        color="rgba(255,255,255)"
                      />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <DocMessage
                    id={message._id}
                    name={message.mediaName}
                    size={message.mediaSize}
                    url={message.mediaUrl || ""}
                    isOwn={isOwn}
                  />
                )
              ) : (
                <Text
                  style={[
                    styles.textContent,
                    { color: isOwn ? "#fff" : colors.textPrimary },
                  ]}
                >
                  {message.content}
                </Text>
              )}

              <View
                style={[
                  styles.metaRow,
                  isOwn ? styles.metaRowOwn : styles.metaRowOther,
                ]}
              >
                {message.isEdited && (
                  <Text
                    style={[
                      styles.editedTag,
                      {
                        color: isOwn ? "rgba(255,255,255)" : colors.textMuted,
                      },
                    ]}
                  >
                    edited
                  </Text>
                )}
                <Text
                  style={[
                    styles.timeText,
                    { color: isOwn ? "rgba(255,255,255)" : colors.textMuted },
                  ]}
                >
                  {formatTime(new Date(message.createdAt))}
                </Text>
                {isOwn && (
                  <Ionicons
                    name={STATUS_ICONS[status].name}
                    color={STATUS_ICONS[status].color}
                  />
                )}
              </View>
            </View>
          )}
        </Pressable>

        {Object.keys(reactionGroups).length > 0 && (
          <View
            style={[styles.reactionsRow, isOwn ? styles.reactionsRowOwn : {}]}
          >
            {Object.entries(reactionGroups).map(([emoji, { count, mine }]) => (
              <View
                key={emoji}
                style={[
                  styles.reactionChip,
                  mine && styles.reactionChipMine,
                  {
                    backgroundColor: colors.surface,
                    borderColor: mine ? "#00d4aa" : colors.border,
                  },
                ]}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
              </View>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 2,
    alignItems: "flex-end",
  },
  rowOwn: { justifyContent: "flex-end" },
  rowOther: { justifyContent: "flex-start" },
  avatarCol: { width: 34, marginRight: 6, flexShrink: 0 },
  avatar: { width: 28, height: 28, borderRadius: 14 },
  avatarFb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: { color: "#fff", fontSize: 10, fontWeight: "800" },
  avatarPlaceholder: { width: 28, height: 28 },
  bubbleCol: { maxWidth: "78%", gap: 2 },
  bubbleColOwn: { alignItems: "flex-end" },
  bubbleColOther: { alignItems: "flex-start" },
  senderName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#00d4aa",
    marginLeft: 4,
    marginBottom: 2,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingTop: 9,
    paddingBottom: 7,
    maxWidth: "100%",
    minWidth: 60,
  },
  bubbleOwn: {
    backgroundColor: "#00d4aa",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  bubbleDeleted: { opacity: 0.8 },
  forwardedLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  forwardedText: { fontSize: 11, fontStyle: "italic" },
  deletedWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  deletedText: { fontSize: 14, fontStyle: "italic" },
  textContent: { fontSize: 15, lineHeight: 21 },
  imageMsg: { width: 220, height: 160, borderRadius: 12, overflow: "hidden" },
  imageCaption: { fontSize: 13, marginTop: 6 },
  videoWrap: { position: "relative" },
  playBtn: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateX: -23 }, { translateY: -23 }],
  },
  sticker: { width: 140, height: 140 },
  stickerBubbleWrap: { alignItems: "flex-start" },
  stickerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  metaRowOwn: { justifyContent: "flex-end" },
  metaRowOther: { justifyContent: "flex-start" },
  timeText: { fontSize: 11 },
  editedTag: { fontSize: 11, fontStyle: "italic", marginRight: 2 },
  reactionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
    marginLeft: 4,
  },
  reactionsRowOwn: {
    justifyContent: "flex-end",
    marginLeft: 0,
    marginRight: 4,
  },
  reactionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
  },
  reactionChipMine: {},
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontSize: 11, color: "#8888aa", fontWeight: "700" },
});
