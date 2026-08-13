// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
//   Platform,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import { Image } from "expo-image";
// import * as Notifications from "expo-notifications";
// import {
//   StreamVideo,
//   StreamVideoClient,
//   StreamCall,
//   CallContent,
//   User as StreamUser,
// } from "@stream-io/video-react-native-sdk";
// import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
// import { socketService } from "../../services/socket";
// import { callApi, chatApi } from "../../services/api";
// import { clearCall } from "../../store/slices/callSlice";
// import { useTheme } from "../../context/ThemeContext";
// import { useToast } from "../../context/ToastContext";
// import { STREAM_API_KEY } from "../../constants";
// import { Chat } from "../../types";

// type CallStatus =
//   | "calling"
//   | "ringing"
//   | "connected"
//   | "ended"
//   | "rejected"
//   | "missed";

// export default function CallScreen() {
//   const {
//     id: chatId,
//     type,
//     callId: incomingCallId,
//     isIncoming,
//   } = useLocalSearchParams<{
//     id: string;
//     type: "audio" | "video";
//     callId?: string;
//     isIncoming?: string;
//   }>();

//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { colors } = useTheme();
//   const toast = useToast();
//   const { user } = useAppSelector((s) => s.auth);
//   const streamToken = useAppSelector((s) => s.auth.streamToken);

//   const [status, setStatus] = useState<CallStatus>(
//     isIncoming === "1" ? "ringing" : "calling"
//   );
//   const [chatInfo, setChatInfo] = useState<Chat | null>(null);
//   const [duration, setDuration] = useState(0);
//   const [muted, setMuted] = useState(false);
//   const [cameraOn, setCameraOn] = useState(true);
//   const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(
//     null
//   );
//   const [streamCall, setStreamCall] = useState<any>(null);
//   const [streamReady, setStreamReady] = useState(false);
//   const [chatInfoLoaded, setChatInfoLoaded] = useState(false);

//   const callIdRef = useRef<string>(
//     incomingCallId ||
//       `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
//   );
//   const startTimeRef = useRef<Date | null>(null);
//   // const timerRef = useRef<ReturnType<typeof setInterval>>();
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const hasJoinedStream = useRef(false);

//   const isVideo = type === "video";
//   const isIncomingCall = isIncoming === "1";

//   // ── Keep screen awake ──────────────────────────────────────────────────────
//   useEffect(() => {
//     // On Android, post a high-priority notification to wake screen
//     // On iOS, the PushKit / VoIP notification wakes screen (handled by Expo)
//     if (Platform.OS === "android" && !isIncomingCall) {
//       Notifications.scheduleNotificationAsync({
//         content: {
//           title: "Calling...",
//           body: "Waiting for the other person to answer",
//           priority: Notifications.AndroidNotificationPriority.MAX,
//           sticky: true,
//         },
//         trigger: null,
//       }).catch(() => {});
//     }

//     return () => {
//       // Dismiss the sticky notification when leaving
//       Notifications.dismissAllNotificationsAsync().catch(() => {});
//     };
//   }, []);

//   // ── Pulse animation ────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (status === "calling" || status === "ringing") {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, {
//             toValue: 1.1,
//             duration: 800,
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulseAnim, {
//             toValue: 1,
//             duration: 800,
//             useNativeDriver: true,
//           }),
//         ])
//       ).start();
//     } else {
//       pulseAnim.stopAnimation();
//       Animated.timing(pulseAnim, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [status]);

//   // ── 1. Load chat info ──────────────────────────────────────────────────────
//   useEffect(() => {
//     chatApi
//       .getChatInfo(chatId)
//       .then((res) => {
//         if (res.success) {
//           setChatInfo(res.data.chat);
//           setChatInfoLoaded(true);
//         }
//       })
//       .catch(() => setChatInfoLoaded(true));
//   }, [chatId]);

//   // ── 2. Outgoing: initiate call once chat info is ready ─────────────────────
//   useEffect(() => {
//     if (!chatInfoLoaded || isIncomingCall || !chatInfo) return;
//     const other = chatInfo.participants.find((p) => p.user._id !== user?._id);
//     if (!other) return;

//     // socketService.initiateCall({
//     //   recipientId: other.user._id,
//     //   callId: callIdRef.current,
//     //   type: isVideo ? "video" : "audio",
//     //   chatId,
//     // });
//     socketService.initiateCall({
//       callerAvatar: user?.avatar || "",
//       callerName: user?.name || "",
//       recipientId: other.user._id,
//       callId: callIdRef.current,
//       type: isVideo ? "video" : "audio",
//       chatId,
//     });

//     // Caller joins Stream immediately so the room exists for recipient to join
//     joinStreamCall();
//   }, [chatInfoLoaded]);

//   // ── 3. Incoming: join Stream once screen mounts ───────────────────────────
//   useEffect(() => {
//     if (!isIncomingCall) return;
//     setStatus("connected");
//     startTimer();
//     joinStreamCall();
//   }, []);

//   // ── 4. Listen to socket responses ─────────────────────────────────────────
//   useEffect(() => {
//     const socket = socketService.getSocket();
//     if (!socket) return;

//     const onAccepted = ({ callId }: { callId: string }) => {
//       if (callId !== callIdRef.current) return;
//       // Caller: recipient answered — show connected UI
//       // Stream is already joined (step 2), just update status + timer
//       setStatus("connected");
//       startTimer();
//     };

//     const onRejected = ({ callId }: { callId: string }) => {
//       if (callId !== callIdRef.current) return;
//       setStatus("rejected");
//       toast.error("Call declined", "The other person declined your call");
//       setTimeout(() => handleEnd("rejected"), 2000);
//     };

//     const onEnded = ({ callId }: { callId: string }) => {
//       if (callId !== callIdRef.current) return;
//       handleEnd("completed");
//     };

//     socket.on("call:accepted", onAccepted);
//     socket.on("call:rejected", onRejected);
//     socket.on("call:ended", onEnded);

//     // 60-second no-answer timeout (outgoing only)
//     let timeout: ReturnType<typeof setTimeout>;
//     if (!isIncomingCall) {
//       timeout = setTimeout(() => {
//         setStatus((s) => {
//           if (s === "calling") {
//             handleEnd("missed");
//             return "missed";
//           }
//           return s;
//         });
//       }, 60000);
//     }

//     return () => {
//       socket.off("call:accepted", onAccepted);
//       socket.off("call:rejected", onRejected);
//       socket.off("call:ended", onEnded);
//       clearTimeout(timeout);
//     };
//   }, []);

//   // ── Timer ──────────────────────────────────────────────────────────────────
//   const startTimer = () => {
//     if (startTimeRef.current) return; // already started
//     startTimeRef.current = new Date();
//     timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
//   };

//   // ── Stream.io join ─────────────────────────────────────────────────────────
//   // const joinStreamCall = async () => {
//   //   if (hasJoinedStream.current) return;
//   //   hasJoinedStream.current = true;

//   //   if (!user || !streamToken) {
//   //     toast.error("Call error", "Missing credentials — please log in again");
//   //     return;
//   //   }
//   //   try {
//   //     const streamUser: StreamUser = {
//   //       id: user._id,
//   //       name: user.name,
//   //       image: user.avatar,
//   //     };

//   //     const client = new StreamVideoClient({
//   //       apiKey: STREAM_API_KEY,
//   //       user: streamUser,
//   //       token: streamToken,
//   //     });

//   //     // Use 'default' for video, 'audio_room' for audio-only
//   //     const callType = isVideo ? "default" : "audio_room";
//   //     const call = client.call(callType, callIdRef.current);

//   //     console.log("calll ===> ", call);

//   //     // create:true so caller creates it; recipient joins existing room
//   //     await call.join({ create: true,   });

//   //     setStreamClient(client);
//   //     setStreamCall(call);
//   //     setStreamReady(true);
//   //   } catch (err) {
//   //     console.error(
//   //       "Connection failed",
//   //       "Could not connect to the call server ==>>>",
//   //       err
//   //     );
//   //     toast.error("Connection failed", "Could not connect to the call server");
//   //     handleEnd("missed");
//   //   }
//   // };
//   const joinStreamCall = async () => {
//     if (hasJoinedStream.current) return;
//     hasJoinedStream.current = true;

//     if (!user || !streamToken) {
//       toast.error("Call error", "Missing credentials — please log in again");
//       return;
//     }

//     try {
//       const streamUser: StreamUser = {
//         id: user._id,
//         name: user.name,
//         image: user.avatar,
//       };

//       // const client = new StreamVideoClient({
//       //   apiKey: STREAM_API_KEY,
//       //   user: streamUser,
//       //   token: streamToken,
//       // });
//       const client = StreamVideoClient.getOrCreateInstance({
//         apiKey: STREAM_API_KEY,
//         user: streamUser,
//         token: streamToken,
//       });

//       //       types include
//       //       default is 1-1 call just like whatsapp
//       //       audio_room for spaces
//       // livestream just like we have it on twitter etc

//       // for audio_romm and livestream you have to call call.goLive() after call.join()

//       // Use 'default' for video, 'audio_room' for audio-only
//       // const callType = isVideo ? "default" : "audio_room";
//       const callType = "default";

//       const call = client.call(callType, callIdRef.current);

//       if (!isVideo) {
//         await call.camera.disable();
//       }
//       await call.getOrCreate({});

//       await call.join();

//       // await call.join({
//       //   create: true,
//       // });

//       setStreamClient(client);
//       setStreamCall(call);
//       setStreamReady(true);
//     } catch (err) {
//       toast.error("Connection failed", "Could not connect to the call server");

//       hasJoinedStream.current = false;

//       handleEnd("missed");
//     }
//   };
//   // ── End call ──────────────────────────────────────────────────────────────
//   const handleEnd = async (endStatus?: string) => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     Notifications.dismissAllNotificationsAsync().catch(() => {});

//     if (streamCall) {
//       try {
//         await streamCall.leave();
//       } catch {}
//     }
//     if (streamClient) {
//       try {
//         await streamClient.disconnectUser();
//       } catch {}
//     }

//     const finalStatus =
//       endStatus || (status === "connected" ? "completed" : "missed");
//     const participantIds = chatInfo?.participants.map((p) => p.user._id) || [];

//     socketService.endCall(
//       callIdRef.current,
//       participantIds,
//       isVideo ? "video" : "audio",
//       finalStatus
//     );
//     dispatch(clearCall());

//     try {
//       await callApi.saveCallHistory({
//         callId: callIdRef.current,
//         type: isVideo ? "video" : "audio",
//         participantIds,
//         chatId,
//         startedAt: startTimeRef.current?.toISOString(),
//         endedAt: new Date().toISOString(),
//         status: finalStatus,
//       });
//     } catch {}

//     router.back();
//   };

//   // ── Helpers ───────────────────────────────────────────────────────────────
//   const formatDuration = () => {
//     const m = Math.floor(duration / 60)
//       .toString()
//       .padStart(2, "0");
//     const s = (duration % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   };

//   const otherParticipant = chatInfo?.participants.find(
//     (p) => p.user._id !== user?._id
//   )?.user;
//   const displayName = otherParticipant?.name || "Connecting…";
//   const displayAvatar = otherParticipant?.avatar;
//   const initials = displayName
//     .split(" ")
//     .map((w: string) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   const statusLabel: Record<CallStatus, string> = {
//     calling: "Calling…",
//     ringing: "Connecting…",
//     connected: formatDuration(),
//     ended: "Call ended",
//     rejected: "Call declined",
//     missed: "No answer",
//   };

//   useEffect(() => {
//     return () => {
//       streamCall?.leave?.();
//     };
//   }, [streamCall]);

//   // ── When Stream is ready render Stream UI (both caller & receiver) ─────────
//   // The caller sees this as soon as joinStreamCall resolves (before accepted)
//   // The receiver sees it immediately after pressing accept
//   if (streamReady && streamClient && streamCall) {
//     return (
//       <StreamVideo client={streamClient}>
//         <StreamCall call={streamCall}>
//           <View style={{ flex: 1, backgroundColor: "#000" }}>
//             <StatusBar style="light" />
//             {/* Stream's built-in UI: handles video tiles, mute, camera, end button */}
//             <CallContent onHangupCallHandler={() => handleEnd("completed")} />

//             {/* Overlay: show who we're connected to + duration */}
//             <View style={styles.overlayHeader} pointerEvents="none">
//               <SafeAreaView edges={["top"]}>
//                 <View style={styles.overlayInfo}>
//                   <Text style={styles.overlayName}>{displayName}</Text>
//                   <Text
//                     style={[
//                       styles.overlayStatus,
//                       { color: status === "connected" ? "#00d4aa" : "#fff" },
//                     ]}
//                   >
//                     {statusLabel[status]}
//                   </Text>
//                 </View>
//               </SafeAreaView>
//             </View>
//           </View>
//         </StreamCall>
//       </StreamVideo>
//     );
//   }

//   // ── Waiting / signaling UI (before Stream connects) ───────────────────────
//   return (
//     <View style={styles.container}>
//       <StatusBar style="light" />
//       <LinearGradient
//         colors={
//           isVideo
//             ? ["#050520", "#0f1535", "#050520"]
//             : ["#0a0a20", "#0f0f35", "#0a0a20"]
//         }
//         style={StyleSheet.absoluteFillObject}
//       />
//       <View
//         style={[
//           styles.glow,
//           { backgroundColor: isVideo ? "#5b8dee" : "#00d4aa" },
//         ]}
//       />

//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => handleEnd()}
//             style={styles.minimizeBtn}
//           >
//             <Ionicons
//               name="chevron-down"
//               size={28}
//               color="rgba(255,255,255,0.6)"
//             />
//           </TouchableOpacity>
//           <Text style={styles.callTypeLabel}>
//             {isVideo ? "📹 Video Call" : "📞 Voice Call"}
//           </Text>
//           <View style={{ width: 44 }} />
//         </View>

//         <View style={styles.callerSection}>
//           <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
//             {displayAvatar ? (
//               <Image
//                 source={{ uri: displayAvatar }}
//                 style={[
//                   styles.avatar,
//                   { borderColor: isVideo ? "#5b8dee" : "#00d4aa" },
//                 ]}
//                 contentFit="cover"
//               />
//             ) : (
//               <LinearGradient
//                 colors={
//                   isVideo ? ["#5b8dee", "#7b5ea7"] : ["#00d4aa", "#00b090"]
//                 }
//                 style={styles.avatarFallback}
//               >
//                 <Text style={styles.avatarInitials}>{initials}</Text>
//               </LinearGradient>
//             )}
//           </Animated.View>

//           <Text style={styles.callerName}>{displayName}</Text>

//           <Text
//             style={[
//               styles.callStatus,
//               status === "connected" && { color: "#00d4aa", fontWeight: "700" },
//               (status === "rejected" || status === "missed") && {
//                 color: "#ff4757",
//               },
//             ]}
//           >
//             {statusLabel[status]}
//           </Text>

//           {(status === "calling" || status === "ringing") && (
//             <View style={styles.dotsRow}>
//               {[0, 1, 2].map((i) => (
//                 <View
//                   key={i}
//                   style={[
//                     styles.dot,
//                     {
//                       backgroundColor: isVideo ? "#5b8dee" : "#00d4aa",
//                       opacity: 0.3 + i * 0.25,
//                     },
//                   ]}
//                 />
//               ))}
//             </View>
//           )}
//         </View>

//         {/* Controls */}
//         <View style={styles.controls}>
//           <View style={styles.secondaryControls}>
//             <TouchableOpacity
//               style={[
//                 styles.ctrlBtn,
//                 muted && { backgroundColor: "rgba(255,71,87,0.2)" },
//               ]}
//               onPress={() => {
//                 const next = !muted;
//                 setMuted(next);
//                 if (streamCall) {
//                   next
//                     ? streamCall.microphone.disable()
//                     : streamCall.microphone.enable();
//                 }
//               }}
//             >
//               <Ionicons
//                 name={muted ? "mic-off" : "mic"}
//                 size={22}
//                 color={muted ? "#ff4757" : "#fff"}
//               />
//               <Text style={styles.ctrlLabel}>{muted ? "Unmute" : "Mute"}</Text>
//             </TouchableOpacity>

//             {isVideo && (
//               <TouchableOpacity
//                 style={[
//                   styles.ctrlBtn,
//                   !cameraOn && { backgroundColor: "rgba(255,71,87,0.2)" },
//                 ]}
//                 onPress={() => {
//                   const next = !cameraOn;
//                   setCameraOn(next);
//                   if (streamCall) {
//                     next
//                       ? streamCall.camera.enable()
//                       : streamCall.camera.disable();
//                   }
//                 }}
//               >
//                 <Ionicons
//                   name={cameraOn ? "videocam" : "videocam-off"}
//                   size={22}
//                   color={cameraOn ? "#fff" : "#ff4757"}
//                 />
//                 <Text style={styles.ctrlLabel}>
//                   {cameraOn ? "Camera" : "Camera off"}
//                 </Text>
//               </TouchableOpacity>
//             )}

//             {isVideo && (
//               <TouchableOpacity
//                 style={styles.ctrlBtn}
//                 onPress={() => {
//                   if (streamCall) streamCall.camera.flip();
//                 }}
//               >
//                 <Ionicons
//                   name="camera-reverse-outline"
//                   size={22}
//                   color="#fff"
//                 />
//                 <Text style={styles.ctrlLabel}>Flip</Text>
//               </TouchableOpacity>
//             )}

//             {!isVideo && (
//               <TouchableOpacity style={styles.ctrlBtn}>
//                 <Ionicons name="volume-high-outline" size={22} color="#fff" />
//                 <Text style={styles.ctrlLabel}>Speaker</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           <TouchableOpacity
//             onPress={() => handleEnd()}
//             style={styles.endCallBtn}
//             activeOpacity={0.85}
//           >
//             <LinearGradient
//               colors={["#ff4757", "#cc2233"]}
//               style={styles.endCallGradient}
//             >
//               <Ionicons
//                 name="call"
//                 size={30}
//                 color="#fff"
//                 style={{ transform: [{ rotate: "135deg" }] }}
//               />
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#0a0a20" },
//   safeArea: { flex: 1 },
//   glow: {
//     position: "absolute",
//     width: 400,
//     height: 400,
//     borderRadius: 200,
//     opacity: 0.08,
//     top: "15%",
//     alignSelf: "center",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   minimizeBtn: {
//     width: 44,
//     height: 44,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   callTypeLabel: {
//     fontSize: 15,
//     color: "rgba(255,255,255,0.55)",
//     fontWeight: "600",
//   },
//   callerSection: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 16,
//   },
//   avatar: { width: 130, height: 130, borderRadius: 65, borderWidth: 3 },
//   avatarFallback: {
//     width: 130,
//     height: 130,
//     borderRadius: 65,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarInitials: { fontSize: 46, fontWeight: "800", color: "#fff" },
//   callerName: {
//     fontSize: 30,
//     fontWeight: "800",
//     color: "#fff",
//     letterSpacing: -0.5,
//   },
//   callStatus: {
//     fontSize: 17,
//     color: "rgba(255,255,255,0.5)",
//     fontWeight: "500",
//   },
//   dotsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
//   dot: { width: 8, height: 8, borderRadius: 4 },
//   controls: { paddingHorizontal: 24, paddingBottom: 44, gap: 36 },
//   secondaryControls: { flexDirection: "row", justifyContent: "space-around" },
//   ctrlBtn: {
//     alignItems: "center",
//     gap: 8,
//     minWidth: 64,
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     borderRadius: 18,
//     backgroundColor: "rgba(255,255,255,0.08)",
//   },
//   ctrlLabel: {
//     fontSize: 11,
//     color: "rgba(255,255,255,0.6)",
//     fontWeight: "500",
//   },
//   endCallBtn: {
//     alignSelf: "center",
//     borderRadius: 40,
//     overflow: "hidden",
//     shadowColor: "#ff4757",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.5,
//     shadowRadius: 20,
//     elevation: 14,
//   },
//   endCallGradient: {
//     width: 80,
//     height: 80,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   // Stream overlay
//   overlayHeader: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "rgba(0,0,0,0.4)",
//   },
//   overlayInfo: { alignItems: "center", paddingVertical: 12 },
//   overlayName: { fontSize: 18, fontWeight: "700", color: "#fff" },
//   overlayStatus: { fontSize: 13, marginTop: 2 },
// });

// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
//   Platform,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import { Image } from "expo-image";
// import * as Notifications from "expo-notifications";
// import {
//   StreamVideo,
//   StreamVideoClient,
//   StreamCall,
//   CallContent,
//   User as StreamUser,
// } from "@stream-io/video-react-native-sdk";
// import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
// import { socketService } from "../../services/socket";
// import { callApi, chatApi } from "../../services/api";
// import { clearCall } from "../../store/slices/callSlice";
// import { useTheme } from "../../context/ThemeContext";
// import { useToast } from "../../context/ToastContext";
// import { STREAM_API_KEY } from "../../constants";
// import { Chat } from "../../types";

// type CallStatus =
//   | "calling"
//   | "ringing"
//   | "connected"
//   | "ended"
//   | "rejected"
//   | "missed";

// export default function CallScreen() {
//   const {
//     id: chatId,
//     type,
//     callId: incomingCallId,
//     isIncoming,
//   } = useLocalSearchParams<{
//     id: string;
//     type: "audio" | "video";
//     callId?: string;
//     isIncoming?: string;
//   }>();

//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { colors } = useTheme();
//   const toast = useToast();
//   const { user } = useAppSelector((s) => s.auth);
//   const streamToken = useAppSelector((s) => s.auth.streamToken);

//   const [status, setStatus] = useState<CallStatus>(
//     isIncoming === "1" ? "ringing" : "calling"
//   );
//   const [chatInfo, setChatInfo] = useState<Chat | null>(null);
//   const [duration, setDuration] = useState(0);
//   const [muted, setMuted] = useState(false);
//   const [cameraOn, setCameraOn] = useState(true);
//   const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(
//     null
//   );
//   const [streamCall, setStreamCall] = useState<any>(null);
//   const [streamReady, setStreamReady] = useState(false);
//   const [chatInfoLoaded, setChatInfoLoaded] = useState(false);

//   const callIdRef = useRef<string>(
//     incomingCallId ||
//       `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
//   );
//   const startTimeRef = useRef<Date | null>(null);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const hasJoinedStream = useRef(false);

//   const isVideo = type === "video";
//   const isIncomingCall = isIncoming === "1";
//   const isGroup = chatInfo?.type === "group";

//   // ── Keep screen awake ──────────────────────────────────────────────────────
//   useEffect(() => {
//     if (Platform.OS === "android" && !isIncomingCall) {
//       Notifications.scheduleNotificationAsync({
//         content: {
//           title: "Calling...",
//           body: "Waiting for the other person to answer",
//           priority: Notifications.AndroidNotificationPriority.MAX,
//           sticky: true,
//         },
//         trigger: null,
//       }).catch(() => {});
//     }

//     return () => {
//       Notifications.dismissAllNotificationsAsync().catch(() => {});
//     };
//   }, []);

//   // ── Pulse animation ────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (status === "calling" || status === "ringing") {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, {
//             toValue: 1.1,
//             duration: 800,
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulseAnim, {
//             toValue: 1,
//             duration: 800,
//             useNativeDriver: true,
//           }),
//         ])
//       ).start();
//     } else {
//       pulseAnim.stopAnimation();
//       Animated.timing(pulseAnim, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [status]);

//   // ── 1. Load chat info ──────────────────────────────────────────────────────
//   useEffect(() => {
//     chatApi
//       .getChatInfo(chatId)
//       .then((res) => {
//         if (res.success) {
//           setChatInfo(res.data.chat);
//           setChatInfoLoaded(true);
//         }
//       })
//       .catch(() => setChatInfoLoaded(true));
//   }, [chatId]);

//   // ── 2. Outgoing: initiate call once chat info is ready ─────────────────────
//   // Fans out to every participant in the chat server-side now — works
//   // identically for a 1:1 chat (one recipient) or a group chat (everyone
//   // else in it), so there's no more "find the other participant" logic
//   // that silently only ever called one person in a group.
//   useEffect(() => {
//     if (!chatInfoLoaded || isIncomingCall || !chatInfo) return;

//     socketService.initiateCall({
//       chatId,
//       callId: callIdRef.current,
//       type: isVideo ? "video" : "audio",
//     });

//     // Caller joins Stream immediately so the room exists for others to join
//     joinStreamCall();
//   }, [chatInfoLoaded]);

//   // ── 3. Incoming: join Stream once screen mounts ───────────────────────────
//   useEffect(() => {
//     if (!isIncomingCall) return;
//     setStatus("connected");
//     startTimer();
//     joinStreamCall();
//   }, []);

//   // ── 4. Listen to socket responses ─────────────────────────────────────────
//   useEffect(() => {
//     const socket = socketService.getSocket();
//     if (!socket) return;

//     const onAccepted = ({
//       callId,
//       acceptedByName,
//     }: {
//       callId: string;
//       acceptedByName?: string;
//     }) => {
//       if (callId !== callIdRef.current) return;
//       // Caller: someone answered — drop the "ringing" UI and show
//       // connected state. For group calls this fires once per acceptor;
//       // Stream itself renders each new joiner's tile automatically, so we
//       // only need this to happen once (starting the timer is idempotent
//       // via the `if (startTimeRef.current) return` guard in startTimer).
//       setStatus("connected");
//       startTimer();
//       if (isGroup && acceptedByName) {
//         toast.success(`${acceptedByName} joined`);
//       }
//     };

//     const onRejected = ({
//       callId,
//       rejectedByName,
//       isFinal,
//     }: {
//       callId: string;
//       rejectedByName?: string;
//       isFinal?: boolean;
//     }) => {
//       if (callId !== callIdRef.current) return;

//       if (!isFinal) {
//         // Group call: one person declined, but others are still ringing
//         // or already connected — the call continues.
//         toast.error(`${rejectedByName || "Someone"} declined`);
//         return;
//       }

//       setStatus("rejected");
//       toast.error("Call declined", "The other person declined your call");
//       setTimeout(() => handleEnd("rejected"), 2000);
//     };

//     const onEnded = ({ callId }: { callId: string }) => {
//       if (callId !== callIdRef.current) return;
//       handleEnd("completed");
//     };

//     socket.on("call:accepted", onAccepted);
//     socket.on("call:rejected", onRejected);
//     socket.on("call:ended", onEnded);

//     let timeout: ReturnType<typeof setTimeout>;
//     if (!isIncomingCall) {
//       timeout = setTimeout(() => {
//         setStatus((s) => {
//           if (s === "calling") {
//             handleEnd("missed");
//             return "missed";
//           }
//           return s;
//         });
//       }, 60000);
//     }

//     return () => {
//       socket.off("call:accepted", onAccepted);
//       socket.off("call:rejected", onRejected);
//       socket.off("call:ended", onEnded);
//       clearTimeout(timeout);
//     };
//   }, [isGroup]);

//   // ── Timer ──────────────────────────────────────────────────────────────────
//   const startTimer = () => {
//     if (startTimeRef.current) return; // already started
//     startTimeRef.current = new Date();
//     timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
//   };

//   // ── Stream.io join ─────────────────────────────────────────────────────────
//   // Unchanged from the 1:1 version — Stream's "default" call type already
//   // natively supports N participants, and CallContent renders a grid/
//   // spotlight layout automatically based on how many people are present.
//   // No SDK-level changes needed for group calling here.
//   const joinStreamCall = async () => {
//     if (hasJoinedStream.current) return;
//     hasJoinedStream.current = true;

//     if (!user || !streamToken) {
//       toast.error("Call error", "Missing credentials — please log in again");
//       return;
//     }

//     try {
//       const streamUser: StreamUser = {
//         id: user._id,
//         name: user.name,
//         image: user.avatar,
//       };

//       const client = StreamVideoClient.getOrCreateInstance({
//         apiKey: STREAM_API_KEY,
//         user: streamUser,
//         token: streamToken,
//       });

//       const callType = "default";
//       const call = client.call(callType, callIdRef.current);

//       if (!isVideo) {
//         await call.camera.disable();
//       }
//       await call.getOrCreate({});
//       await call.join();

//       setStreamClient(client);
//       setStreamCall(call);
//       setStreamReady(true);
//     } catch (err) {
//       toast.error("Connection failed", "Could not connect to the call server");
//       hasJoinedStream.current = false;
//       handleEnd("missed");
//     }
//   };

//   // ── End / leave call ────────────────────────────────────────────────────────
//   const handleEnd = async (endStatus?: string) => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     Notifications.dismissAllNotificationsAsync().catch(() => {});

//     if (streamCall) {
//       try {
//         await streamCall.leave();
//       } catch {}
//     }
//     if (streamClient) {
//       try {
//         await streamClient.disconnectUser();
//       } catch {}
//     }

//     const finalStatus =
//       endStatus || (status === "connected" ? "completed" : "missed");
//     const participantIds = chatInfo?.participants.map((p) => p.user._id) || [];

//     if (isGroup && status === "connected") {
//       // I'm just leaving a group call I'd already joined — everyone else
//       // stays connected via Stream. Broadcasting call:end here would
//       // incorrectly disconnect every other participant.
//       socketService.leaveCall(callIdRef.current);
//     } else {
//       // 1:1 call, or a group call nobody had joined yet — this genuinely
//       // ends it for everyone who was invited.
//       socketService.endCall(
//         callIdRef.current,
//         participantIds,
//         isVideo ? "video" : "audio",
//         finalStatus
//       );
//     }

//     dispatch(clearCall());

//     try {
//       await callApi.saveCallHistory({
//         callId: callIdRef.current,
//         type: isVideo ? "video" : "audio",
//         participantIds,
//         chatId,
//         startedAt: startTimeRef.current?.toISOString(),
//         endedAt: new Date().toISOString(),
//         status: finalStatus,
//       });
//     } catch {}

//     router.back();
//   };

//   // ── Helpers ───────────────────────────────────────────────────────────────
//   const formatDuration = () => {
//     const m = Math.floor(duration / 60)
//       .toString()
//       .padStart(2, "0");
//     const s = (duration % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   };

//   const otherParticipant = !isGroup
//     ? chatInfo?.participants.find((p) => p.user._id !== user?._id)?.user
//     : null;

//   const displayName = isGroup
//     ? chatInfo?.name || "Group"
//     : otherParticipant?.name || "Connecting…";
//   const displayAvatar = isGroup ? chatInfo?.avatar : otherParticipant?.avatar;
//   const initials = displayName
//     .split(" ")
//     .map((w: string) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   const statusLabel: Record<CallStatus, string> = {
//     calling: "Calling…",
//     ringing: "Connecting…",
//     connected: formatDuration(),
//     ended: "Call ended",
//     rejected: "Call declined",
//     missed: "No answer",
//   };

//   useEffect(() => {
//     return () => {
//       streamCall?.leave?.();
//     };
//   }, [streamCall]);

//   // ── When Stream is ready render Stream UI (all participants) ───────────────
//   if (streamReady && streamClient && streamCall) {
//     return (
//       <StreamVideo client={streamClient}>
//         <StreamCall call={streamCall}>
//           <View style={{ flex: 1, backgroundColor: "#000" }}>
//             <StatusBar style="light" />
//             {/* Stream's built-in UI already renders a grid for multiple
//                 participants — no changes needed here for group calls. */}
//             <CallContent onHangupCallHandler={() => handleEnd("completed")} />

//             <View style={styles.overlayHeader} pointerEvents="none">
//               <SafeAreaView edges={["top"]}>
//                 <View style={styles.overlayInfo}>
//                   <Text style={styles.overlayName}>{displayName}</Text>
//                   <Text
//                     style={[
//                       styles.overlayStatus,
//                       { color: status === "connected" ? "#00d4aa" : "#fff" },
//                     ]}
//                   >
//                     {statusLabel[status]}
//                   </Text>
//                 </View>
//               </SafeAreaView>
//             </View>
//           </View>
//         </StreamCall>
//       </StreamVideo>
//     );
//   }

//   // ── Waiting / signaling UI (before Stream connects) ───────────────────────
//   return (
//     <View style={styles.container}>
//       <StatusBar style="light" />
//       <LinearGradient
//         colors={
//           isVideo
//             ? ["#050520", "#0f1535", "#050520"]
//             : ["#0a0a20", "#0f0f35", "#0a0a20"]
//         }
//         style={StyleSheet.absoluteFillObject}
//       />
//       <View
//         style={[
//           styles.glow,
//           { backgroundColor: isVideo ? "#5b8dee" : "#00d4aa" },
//         ]}
//       />

//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => handleEnd()}
//             style={styles.minimizeBtn}
//           >
//             <Ionicons
//               name="chevron-down"
//               size={28}
//               color="rgba(255,255,255,0.6)"
//             />
//           </TouchableOpacity>
//           <Text style={styles.callTypeLabel}>
//             {isVideo ? "📹 Video Call" : "📞 Voice Call"}
//             {isGroup ? " · Group" : ""}
//           </Text>
//           <View style={{ width: 44 }} />
//         </View>

//         <View style={styles.callerSection}>
//           <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
//             {displayAvatar ? (
//               <Image
//                 source={{ uri: displayAvatar }}
//                 style={[
//                   styles.avatar,
//                   { borderColor: isVideo ? "#5b8dee" : "#00d4aa" },
//                 ]}
//                 contentFit="cover"
//               />
//             ) : (
//               <LinearGradient
//                 colors={
//                   isVideo ? ["#5b8dee", "#7b5ea7"] : ["#00d4aa", "#00b090"]
//                 }
//                 style={styles.avatarFallback}
//               >
//                 <Text style={styles.avatarInitials}>{initials}</Text>
//               </LinearGradient>
//             )}
//           </Animated.View>

//           <Text style={styles.callerName}>{displayName}</Text>

//           <Text
//             style={[
//               styles.callStatus,
//               status === "connected" && { color: "#00d4aa", fontWeight: "700" },
//               (status === "rejected" || status === "missed") && {
//                 color: "#ff4757",
//               },
//             ]}
//           >
//             {statusLabel[status]}
//           </Text>

//           {(status === "calling" || status === "ringing") && (
//             <View style={styles.dotsRow}>
//               {[0, 1, 2].map((i) => (
//                 <View
//                   key={i}
//                   style={[
//                     styles.dot,
//                     {
//                       backgroundColor: isVideo ? "#5b8dee" : "#00d4aa",
//                       opacity: 0.3 + i * 0.25,
//                     },
//                   ]}
//                 />
//               ))}
//             </View>
//           )}
//         </View>

//         {/* Controls */}
//         <View style={styles.controls}>
//           <View style={styles.secondaryControls}>
//             <TouchableOpacity
//               style={[
//                 styles.ctrlBtn,
//                 muted && { backgroundColor: "rgba(255,71,87,0.2)" },
//               ]}
//               onPress={() => {
//                 const next = !muted;
//                 setMuted(next);
//                 if (streamCall) {
//                   next
//                     ? streamCall.microphone.disable()
//                     : streamCall.microphone.enable();
//                 }
//               }}
//             >
//               <Ionicons
//                 name={muted ? "mic-off" : "mic"}
//                 size={22}
//                 color={muted ? "#ff4757" : "#fff"}
//               />
//               <Text style={styles.ctrlLabel}>{muted ? "Unmute" : "Mute"}</Text>
//             </TouchableOpacity>

//             {isVideo && (
//               <TouchableOpacity
//                 style={[
//                   styles.ctrlBtn,
//                   !cameraOn && { backgroundColor: "rgba(255,71,87,0.2)" },
//                 ]}
//                 onPress={() => {
//                   const next = !cameraOn;
//                   setCameraOn(next);
//                   if (streamCall) {
//                     next
//                       ? streamCall.camera.enable()
//                       : streamCall.camera.disable();
//                   }
//                 }}
//               >
//                 <Ionicons
//                   name={cameraOn ? "videocam" : "videocam-off"}
//                   size={22}
//                   color={cameraOn ? "#fff" : "#ff4757"}
//                 />
//                 <Text style={styles.ctrlLabel}>
//                   {cameraOn ? "Camera" : "Camera off"}
//                 </Text>
//               </TouchableOpacity>
//             )}

//             {isVideo && (
//               <TouchableOpacity
//                 style={styles.ctrlBtn}
//                 onPress={() => {
//                   if (streamCall) streamCall.camera.flip();
//                 }}
//               >
//                 <Ionicons
//                   name="camera-reverse-outline"
//                   size={22}
//                   color="#fff"
//                 />
//                 <Text style={styles.ctrlLabel}>Flip</Text>
//               </TouchableOpacity>
//             )}

//             {!isVideo && (
//               <TouchableOpacity style={styles.ctrlBtn}>
//                 <Ionicons name="volume-high-outline" size={22} color="#fff" />
//                 <Text style={styles.ctrlLabel}>Speaker</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           <TouchableOpacity
//             onPress={() => handleEnd()}
//             style={styles.endCallBtn}
//             activeOpacity={0.85}
//           >
//             <LinearGradient
//               colors={["#ff4757", "#cc2233"]}
//               style={styles.endCallGradient}
//             >
//               <Ionicons
//                 name="call"
//                 size={30}
//                 color="#fff"
//                 style={{ transform: [{ rotate: "135deg" }] }}
//               />
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#0a0a20" },
//   safeArea: { flex: 1 },
//   glow: {
//     position: "absolute",
//     width: 400,
//     height: 400,
//     borderRadius: 200,
//     opacity: 0.08,
//     top: "15%",
//     alignSelf: "center",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   minimizeBtn: {
//     width: 44,
//     height: 44,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   callTypeLabel: {
//     fontSize: 15,
//     color: "rgba(255,255,255,0.55)",
//     fontWeight: "600",
//   },
//   callerSection: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 16,
//   },
//   avatar: { width: 130, height: 130, borderRadius: 65, borderWidth: 3 },
//   avatarFallback: {
//     width: 130,
//     height: 130,
//     borderRadius: 65,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarInitials: { fontSize: 46, fontWeight: "800", color: "#fff" },
//   callerName: {
//     fontSize: 30,
//     fontWeight: "800",
//     color: "#fff",
//     letterSpacing: -0.5,
//   },
//   callStatus: {
//     fontSize: 17,
//     color: "rgba(255,255,255,0.5)",
//     fontWeight: "500",
//   },
//   dotsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
//   dot: { width: 8, height: 8, borderRadius: 4 },
//   controls: { paddingHorizontal: 24, paddingBottom: 44, gap: 36 },
//   secondaryControls: { flexDirection: "row", justifyContent: "space-around" },
//   ctrlBtn: {
//     alignItems: "center",
//     gap: 8,
//     minWidth: 64,
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     borderRadius: 18,
//     backgroundColor: "rgba(255,255,255,0.08)",
//   },
//   ctrlLabel: {
//     fontSize: 11,
//     color: "rgba(255,255,255,0.6)",
//     fontWeight: "500",
//   },
//   endCallBtn: {
//     alignSelf: "center",
//     borderRadius: 40,
//     overflow: "hidden",
//     shadowColor: "#ff4757",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.5,
//     shadowRadius: 20,
//     elevation: 14,
//   },
//   endCallGradient: {
//     width: 80,
//     height: 80,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   overlayHeader: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "rgba(0,0,0,0.4)",
//   },
//   overlayInfo: { alignItems: "center", paddingVertical: 12 },
//   overlayName: { fontSize: 18, fontWeight: "700", color: "#fff" },
//   overlayStatus: { fontSize: 13, marginTop: 2 },
// });

// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
//   Platform,
//   Alert,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import { Image } from "expo-image";
// import * as Notifications from "expo-notifications";
// import {
//   StreamVideo,
//   StreamVideoClient,
//   StreamCall,
//   CallContent,
//   User as StreamUser,
// } from "@stream-io/video-react-native-sdk";
// import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
// import { socketService } from "../../services/socket";
// import { callApi, chatApi } from "../../services/api";
// import { clearCall } from "../../store/slices/callSlice";
// import { useTheme } from "../../context/ThemeContext";
// import { useToast } from "../../context/ToastContext";
// import { STREAM_API_KEY } from "../../constants";
// import { Chat } from "../../types";
// import { useContactNameResolver } from "@/hooks/useContactName";
// import { useIsBlocked } from "@/hooks/useIsBlockedUser";

// type CallStatus =
//   | "calling"
//   | "ringing"
//   | "connected"
//   | "ended"
//   | "rejected"
//   | "missed";

// export default function CallScreen() {
//   const {
//     id: chatId,
//     type,
//     callId: incomingCallId,
//     isIncoming,
//   } = useLocalSearchParams<{
//     id: string;
//     type: "audio" | "video";
//     callId?: string;
//     isIncoming?: string;
//   }>();

//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const resolveContact = useContactNameResolver();
//   const { colors } = useTheme();
//   const toast = useToast();
//   const { user } = useAppSelector((s) => s.auth);
//   const streamToken = useAppSelector((s) => s.auth.streamToken);

//   const [status, setStatus] = useState<CallStatus>(
//     isIncoming === "1" ? "ringing" : "calling"
//   );
//   const [chatInfo, setChatInfo] = useState<Chat | null>(null);
//   const [duration, setDuration] = useState(0);
//   const [muted, setMuted] = useState(false);
//   const [cameraOn, setCameraOn] = useState(true);
//   const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(
//     null
//   );
//   const [streamCall, setStreamCall] = useState<any>(null);
//   const [streamReady, setStreamReady] = useState(false);
//   const [chatInfoLoaded, setChatInfoLoaded] = useState(false);

//   const callIdRef = useRef<string>(
//     incomingCallId ||
//       `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
//   );
//   const startTimeRef = useRef<Date | null>(null);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const hasJoinedStream = useRef(false);

//   const isVideo = type === "video";
//   const isIncomingCall = isIncoming === "1";
//   const isGroup = chatInfo?.type === "group";

//   // Computed early (not just near render) so the outgoing-call effect
//   // below can guard against it before ever emitting call:initiate.
//   const otherParticipantId = !isGroup
//     ? chatInfo?.participants.find((p) => p.user._id !== user?._id)?.user._id
//     : undefined;
//   const isOtherBlocked = useIsBlocked(otherParticipantId);

//   // ── Keep screen awake ──────────────────────────────────────────────────────
//   useEffect(() => {
//     if (Platform.OS === "android" && !isIncomingCall) {
//       Notifications.scheduleNotificationAsync({
//         content: {
//           title: "Calling...",
//           body: "Waiting for the other person to answer",
//           priority: Notifications.AndroidNotificationPriority.MAX,
//           sticky: true,
//         },
//         trigger: null,
//       }).catch(() => {});
//     }

//     return () => {
//       Notifications.dismissAllNotificationsAsync().catch(() => {});
//     };
//   }, []);

//   // ── Pulse animation ────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (status === "calling" || status === "ringing") {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, {
//             toValue: 1.1,
//             duration: 800,
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulseAnim, {
//             toValue: 1,
//             duration: 800,
//             useNativeDriver: true,
//           }),
//         ])
//       ).start();
//     } else {
//       pulseAnim.stopAnimation();
//       Animated.timing(pulseAnim, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [status]);

//   // ── 1. Load chat info ──────────────────────────────────────────────────────
//   useEffect(() => {
//     chatApi
//       .getChatInfo(chatId)
//       .then((res) => {
//         if (res.success) {
//           setChatInfo(res.data.chat);
//           setChatInfoLoaded(true);
//         }
//       })
//       .catch(() => setChatInfoLoaded(true));
//   }, [chatId]);

//   // ── 2. Outgoing: initiate call once chat info is ready ─────────────────────
//   // One emit, regardless of chat type — the backend derives every
//   // recipient from the chat's actual participant list, so this works
//   // identically for a 1:1 chat (one recipient) or a group chat (everyone
//   // else in it) without the client needing to know or loop over anything.
//   useEffect(() => {
//     if (!chatInfoLoaded || isIncomingCall || !chatInfo) return;

//     if (isOtherBlocked) {
//       toast.error("Unblock this contact to call them");
//       router.back();
//       return;
//     }

//     socketService.initiateCall({
//       chatId,
//       callId: callIdRef.current,
//       type: isVideo ? "video" : "audio",
//     });

//     // Caller joins Stream immediately so the room exists for others to join
//     joinStreamCall();
//   }, [chatInfoLoaded, isOtherBlocked]);

//   // ── 3. Incoming: join Stream once screen mounts ───────────────────────────
//   useEffect(() => {
//     if (!isIncomingCall) return;
//     setStatus("connected");
//     startTimer();
//     joinStreamCall();
//   }, []);

//   // ── 4. Listen to socket responses ─────────────────────────────────────────
//   useEffect(() => {
//     const socket = socketService.getSocket();
//     if (!socket) return;

//     const onAccepted = ({
//       callId,
//       acceptedByName,
//     }: {
//       callId: string;
//       acceptedByName?: string;
//     }) => {
//       if (callId !== callIdRef.current) return;
//       // Caller: someone answered — drop the "ringing" UI and show
//       // connected state. For group calls this fires once per acceptor;
//       // Stream itself renders each new joiner's tile automatically, so we
//       // only need this to happen once (starting the timer is idempotent
//       // via the `if (startTimeRef.current) return` guard in startTimer).
//       setStatus("connected");
//       startTimer();
//       if (isGroup && acceptedByName) {
//         toast.success(`${acceptedByName} joined`);
//       }
//     };

//     const onRejected = ({
//       callId,
//       rejectedByName,
//       isFinal,
//     }: {
//       callId: string;
//       rejectedByName?: string;
//       isFinal?: boolean;
//     }) => {
//       if (callId !== callIdRef.current) return;

//       if (!isFinal) {
//         // Group call: one person declined, but others are still ringing
//         // or already connected — the call continues.
//         toast.error(`${rejectedByName || "Someone"} declined`);
//         return;
//       }

//       setStatus("rejected");
//       toast.error("Call declined", "The other person declined your call");
//       setTimeout(() => handleEnd("rejected"), 2000);
//     };

//     const onEnded = ({ callId }: { callId: string }) => {
//       if (callId !== callIdRef.current) return;
//       handleEnd("completed");
//     };

//     socket.on("call:accepted", onAccepted);
//     socket.on("call:rejected", onRejected);
//     socket.on("call:ended", onEnded);

//     let timeout: ReturnType<typeof setTimeout>;
//     if (!isIncomingCall) {
//       timeout = setTimeout(() => {
//         setStatus((s) => {
//           if (s === "calling") {
//             handleEnd("missed");
//             return "missed";
//           }
//           return s;
//         });
//       }, 1200000);
//     }

//     return () => {
//       socket.off("call:accepted", onAccepted);
//       socket.off("call:rejected", onRejected);
//       socket.off("call:ended", onEnded);
//       clearTimeout(timeout);
//     };
//   }, [isGroup]);

//   // ── Timer ──────────────────────────────────────────────────────────────────
//   const startTimer = () => {
//     if (startTimeRef.current) return; // already started
//     startTimeRef.current = new Date();
//     timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
//   };

//   // ── Stream.io join ─────────────────────────────────────────────────────────
//   // Unchanged from the 1:1 version — Stream's "default" call type already
//   // natively supports N participants, and CallContent renders a grid/
//   // spotlight layout automatically based on how many people are present.
//   // No SDK-level changes needed for group calling here.
//   const joinStreamCall = async () => {
//     if (hasJoinedStream.current) return;
//     hasJoinedStream.current = true;

//     if (!user || !streamToken) {
//       toast.error("Call error", "Missing credentials — please log in again");
//       return;
//     }

//     try {
//       const streamUser: StreamUser = {
//         id: user._id,
//         name: user.name,
//         image: user.avatar,
//       };

//       const client = StreamVideoClient.getOrCreateInstance({
//         apiKey: STREAM_API_KEY,
//         user: streamUser,
//         token: streamToken,
//       });

//       const callType = "default";
//       const call = client.call(callType, callIdRef.current);

//       if (!isVideo) {
//         await call.camera.disable();
//       }
//       await call.getOrCreate({});
//       await call.join();

//       setStreamClient(client);
//       setStreamCall(call);
//       setStreamReady(true);
//     } catch (err: any) {
//       // JSON.stringify(err) on a plain Error prints "{}" — message/stack/
//       // name are non-enumerable own properties on Error objects in most
//       // JS engines, so JSON.stringify skips them entirely. Pull the real
//       // fields out explicitly instead.
//       const details = {
//         message: err?.message,
//         name: err?.name,
//         code: err?.code,
//         status: err?.status ?? err?.statusCode,
//       };
//       console.log(" call error ===>> ", details, err);
//       // console.log(" call error ===>> ", err);
//       toast.error(
//         "Connection failed",
//         details.message || "Could not connect to the call server"
//       );
//       Alert.alert("", details.message);
//       // toast.error(
//       //   "Connection failed",
//       //   "Could not connect to the call server " + JSON.stringify(err)
//       // );
//       hasJoinedStream.current = false;
//       handleEnd("missed");
//     }
//   };

//   // ── End / leave call ────────────────────────────────────────────────────────
//   const handleEnd = async (endStatus?: string) => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     Notifications.dismissAllNotificationsAsync().catch(() => {});

//     if (streamCall) {
//       try {
//         await streamCall.leave();
//       } catch {}
//     }
//     if (streamClient) {
//       try {
//         await streamClient.disconnectUser();
//       } catch {}
//     }

//     const finalStatus =
//       endStatus || (status === "connected" ? "completed" : "missed");
//     const participantIds = chatInfo?.participants.map((p) => p.user._id) || [];

//     if (isGroup && status === "connected") {
//       // I'm just leaving a group call I'd already joined — everyone else
//       // stays connected via Stream. Broadcasting call:end here would
//       // incorrectly disconnect every other participant.
//       socketService.leaveCall(callIdRef.current);
//     } else {
//       // 1:1 call, or a group call nobody had joined yet — this genuinely
//       // ends it for everyone who was invited.
//       socketService.endCall(
//         callIdRef.current,
//         participantIds,
//         isVideo ? "video" : "audio",
//         finalStatus
//       );
//     }

//     dispatch(clearCall());

//     try {
//       await callApi.saveCallHistory({
//         callId: callIdRef.current,
//         type: isVideo ? "video" : "audio",
//         participantIds,
//         chatId,
//         startedAt: startTimeRef.current?.toISOString(),
//         endedAt: new Date().toISOString(),
//         status: finalStatus,
//       });
//     } catch {}

//     router.back();
//   };

//   // ── Helpers ───────────────────────────────────────────────────────────────
//   const formatDuration = () => {
//     const m = Math.floor(duration / 60)
//       .toString()
//       .padStart(2, "0");
//     const s = (duration % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   };

//   const otherParticipant = !isGroup
//     ? chatInfo?.participants.find((p) => p.user._id !== user?._id)?.user
//     : null;

//   const { displayName, isContact: isContactSaved } = isGroup
//     ? { displayName: chatInfo?.name || "Group", isContact: false }
//     : resolveContact(
//         otherParticipant?.phone,
//         otherParticipant?.name || "Connecting..."
//       );

//   // const displayName = isGroup
//   //   ? chatInfo?.name || "Group"
//   //   : otherParticipant?.name || "Connecting…";
//   const displayAvatar = isGroup ? chatInfo?.avatar : otherParticipant?.avatar;
//   const initials = displayName
//     .split(" ")
//     .map((w: string) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   const statusLabel: Record<CallStatus, string> = {
//     calling: "Calling…",
//     ringing: "Connecting…",
//     connected: formatDuration(),
//     ended: "Call ended",
//     rejected: "Call declined",
//     missed: "No answer",
//   };

//   useEffect(() => {
//     return () => {
//       streamCall?.leave?.();
//     };
//   }, [streamCall]);

//   // ── When Stream is ready render Stream UI (all participants) ───────────────
//   if (streamReady && streamClient && streamCall) {
//     return (
//       <StreamVideo client={streamClient}>
//         <StreamCall call={streamCall}>
//           <View style={{ flex: 1, backgroundColor: "#000" }}>
//             <StatusBar style="light" />
//             {/* Stream's built-in UI already renders a grid for multiple
//                 participants — no changes needed here for group calls. */}
//             <CallContent onHangupCallHandler={() => handleEnd("completed")} />

//             <View style={styles.overlayHeader} pointerEvents="none">
//               <SafeAreaView edges={["top"]}>
//                 <View style={styles.overlayInfo}>
//                   <Text style={styles.overlayName}>{displayName}</Text>
//                   <Text
//                     style={[
//                       styles.overlayStatus,
//                       { color: status === "connected" ? "#00d4aa" : "#fff" },
//                     ]}
//                   >
//                     {statusLabel[status]}
//                   </Text>
//                 </View>
//               </SafeAreaView>
//             </View>
//           </View>
//         </StreamCall>
//       </StreamVideo>
//     );
//   }

//   // ── Waiting / signaling UI (before Stream connects) ───────────────────────
//   return (
//     <View style={styles.container}>
//       <StatusBar style="light" />
//       <LinearGradient
//         colors={
//           isVideo
//             ? ["#050520", "#0f1535", "#050520"]
//             : ["#0a0a20", "#0f0f35", "#0a0a20"]
//         }
//         style={StyleSheet.absoluteFillObject}
//       />
//       <View
//         style={[
//           styles.glow,
//           { backgroundColor: isVideo ? "#5b8dee" : "#00d4aa" },
//         ]}
//       />

//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => handleEnd()}
//             style={styles.minimizeBtn}
//           >
//             <Ionicons
//               name="chevron-down"
//               size={28}
//               color="rgba(255,255,255,0.6)"
//             />
//           </TouchableOpacity>
//           <Text style={styles.callTypeLabel}>
//             {isVideo ? "📹 Video Call" : "📞 Voice Call"}
//             {isGroup ? " · Group" : ""}
//           </Text>
//           <View style={{ width: 44 }} />
//         </View>

//         <View style={styles.callerSection}>
//           <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
//             {displayAvatar ? (
//               <Image
//                 source={{ uri: displayAvatar }}
//                 style={[
//                   styles.avatar,
//                   { borderColor: isVideo ? "#5b8dee" : "#00d4aa" },
//                 ]}
//                 contentFit="cover"
//               />
//             ) : (
//               <LinearGradient
//                 colors={
//                   isVideo ? ["#5b8dee", "#7b5ea7"] : ["#00d4aa", "#00b090"]
//                 }
//                 style={styles.avatarFallback}
//               >
//                 <Text style={styles.avatarInitials}>{initials}</Text>
//               </LinearGradient>
//             )}
//           </Animated.View>

//           <Text style={styles.callerName}>{displayName}</Text>

//           <Text
//             style={[
//               styles.callStatus,
//               status === "connected" && { color: "#00d4aa", fontWeight: "700" },
//               (status === "rejected" || status === "missed") && {
//                 color: "#ff4757",
//               },
//             ]}
//           >
//             {statusLabel[status]}
//           </Text>

//           {(status === "calling" || status === "ringing") && (
//             <View style={styles.dotsRow}>
//               {[0, 1, 2].map((i) => (
//                 <View
//                   key={i}
//                   style={[
//                     styles.dot,
//                     {
//                       backgroundColor: isVideo ? "#5b8dee" : "#00d4aa",
//                       opacity: 0.3 + i * 0.25,
//                     },
//                   ]}
//                 />
//               ))}
//             </View>
//           )}
//         </View>

//         {/* Controls */}
//         <View style={styles.controls}>
//           <View style={styles.secondaryControls}>
//             <TouchableOpacity
//               style={[
//                 styles.ctrlBtn,
//                 muted && { backgroundColor: "rgba(255,71,87,0.2)" },
//               ]}
//               onPress={() => {
//                 const next = !muted;
//                 setMuted(next);
//                 if (streamCall) {
//                   next
//                     ? streamCall.microphone.disable()
//                     : streamCall.microphone.enable();
//                 }
//               }}
//             >
//               <Ionicons
//                 name={muted ? "mic-off" : "mic"}
//                 size={22}
//                 color={muted ? "#ff4757" : "#fff"}
//               />
//               <Text style={styles.ctrlLabel}>{muted ? "Unmute" : "Mute"}</Text>
//             </TouchableOpacity>

//             {isVideo && (
//               <TouchableOpacity
//                 style={[
//                   styles.ctrlBtn,
//                   !cameraOn && { backgroundColor: "rgba(255,71,87,0.2)" },
//                 ]}
//                 onPress={() => {
//                   const next = !cameraOn;
//                   setCameraOn(next);
//                   if (streamCall) {
//                     next
//                       ? streamCall.camera.enable()
//                       : streamCall.camera.disable();
//                   }
//                 }}
//               >
//                 <Ionicons
//                   name={cameraOn ? "videocam" : "videocam-off"}
//                   size={22}
//                   color={cameraOn ? "#fff" : "#ff4757"}
//                 />
//                 <Text style={styles.ctrlLabel}>
//                   {cameraOn ? "Camera" : "Camera off"}
//                 </Text>
//               </TouchableOpacity>
//             )}

//             {isVideo && (
//               <TouchableOpacity
//                 style={styles.ctrlBtn}
//                 onPress={() => {
//                   if (streamCall) streamCall.camera.flip();
//                 }}
//               >
//                 <Ionicons
//                   name="camera-reverse-outline"
//                   size={22}
//                   color="#fff"
//                 />
//                 <Text style={styles.ctrlLabel}>Flip</Text>
//               </TouchableOpacity>
//             )}

//             {!isVideo && (
//               <TouchableOpacity style={styles.ctrlBtn}>
//                 <Ionicons name="volume-high-outline" size={22} color="#fff" />
//                 <Text style={styles.ctrlLabel}>Speaker</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           <TouchableOpacity
//             onPress={() => handleEnd()}
//             style={styles.endCallBtn}
//             activeOpacity={0.85}
//           >
//             <LinearGradient
//               colors={["#ff4757", "#cc2233"]}
//               style={styles.endCallGradient}
//             >
//               <Ionicons
//                 name="call"
//                 size={30}
//                 color="#fff"
//                 style={{ transform: [{ rotate: "135deg" }] }}
//               />
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#0a0a20" },
//   safeArea: { flex: 1 },
//   glow: {
//     position: "absolute",
//     width: 400,
//     height: 400,
//     borderRadius: 200,
//     opacity: 0.08,
//     top: "15%",
//     alignSelf: "center",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   minimizeBtn: {
//     width: 44,
//     height: 44,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   callTypeLabel: {
//     fontSize: 15,
//     color: "rgba(255,255,255,0.55)",
//     fontWeight: "600",
//   },
//   callerSection: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 16,
//   },
//   avatar: { width: 130, height: 130, borderRadius: 65, borderWidth: 3 },
//   avatarFallback: {
//     width: 130,
//     height: 130,
//     borderRadius: 65,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarInitials: { fontSize: 46, fontWeight: "800", color: "#fff" },
//   callerName: {
//     fontSize: 30,
//     fontWeight: "800",
//     color: "#fff",
//     letterSpacing: -0.5,
//   },
//   callStatus: {
//     fontSize: 17,
//     color: "rgba(255,255,255,0.5)",
//     fontWeight: "500",
//   },
//   dotsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
//   dot: { width: 8, height: 8, borderRadius: 4 },
//   controls: { paddingHorizontal: 24, paddingBottom: 44, gap: 36 },
//   secondaryControls: { flexDirection: "row", justifyContent: "space-around" },
//   ctrlBtn: {
//     alignItems: "center",
//     gap: 8,
//     minWidth: 64,
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     borderRadius: 18,
//     backgroundColor: "rgba(255,255,255,0.08)",
//   },
//   ctrlLabel: {
//     fontSize: 11,
//     color: "rgba(255,255,255,0.6)",
//     fontWeight: "500",
//   },
//   endCallBtn: {
//     alignSelf: "center",
//     borderRadius: 40,
//     overflow: "hidden",
//     shadowColor: "#ff4757",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.5,
//     shadowRadius: 20,
//     elevation: 14,
//   },
//   endCallGradient: {
//     width: 80,
//     height: 80,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   overlayHeader: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "rgba(0,0,0,0.4)",
//   },
//   overlayInfo: { alignItems: "center", paddingVertical: 12 },
//   overlayName: { fontSize: 18, fontWeight: "700", color: "#fff" },
//   overlayStatus: { fontSize: 13, marginTop: 2 },
// });

// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     Animated,
//     Platform,
//     Alert,
//   } from "react-native";
//   import { useEffect, useRef, useState } from "react";
//   import { useLocalSearchParams, useRouter } from "expo-router";
//   import { SafeAreaView } from "react-native-safe-area-context";
//   import { LinearGradient } from "expo-linear-gradient";
//   import { Ionicons } from "@expo/vector-icons";
//   import { StatusBar } from "expo-status-bar";
//   import { Image } from "expo-image";
//   import * as Notifications from "expo-notifications";
//   import {
//     StreamVideo,
//     StreamVideoClient,
//     StreamCall,
//     CallContent,
//     User as StreamUser,
//   } from "@stream-io/video-react-native-sdk";
//   import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
//   import { socketService } from "../../services/socket";
//   import { callApi, chatApi } from "../../services/api";
//   import { clearCall } from "../../store/slices/callSlice";
//   import { useTheme } from "../../context/ThemeContext";
//   import { useToast } from "../../context/ToastContext";
//   import { STREAM_API_KEY } from "../../constants";
//   import { Chat } from "../../types";
//   import { useContactNameResolver } from "@/hooks/useContactName";

//   type CallStatus =
//     | "calling"
//     | "ringing"
//     | "connected"
//     | "ended"
//     | "rejected"
//     | "missed";

//   export default function CallScreen() {
//     const {
//       id: chatId,
//       type,
//       callId: incomingCallId,
//       isIncoming,
//     } = useLocalSearchParams<{
//       id: string;
//       type: "audio" | "video";
//       callId?: string;
//       isIncoming?: string;
//     }>();

//     const router = useRouter();
//     const dispatch = useAppDispatch();
//     const resolveContact = useContactNameResolver();
//     const { colors } = useTheme();
//     const toast = useToast();
//     const { user } = useAppSelector((s) => s.auth);
//     const streamToken = useAppSelector((s) => s.auth.streamToken);

//     const [status, setStatus] = useState<CallStatus>(
//       isIncoming === "1" ? "ringing" : "calling"
//     );
//     const [chatInfo, setChatInfo] = useState<Chat | null>(null);
//     const [duration, setDuration] = useState(0);
//     const [muted, setMuted] = useState(false);
//     const [cameraOn, setCameraOn] = useState(true);
//     const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(
//       null
//     );
//     const [streamCall, setStreamCall] = useState<any>(null);
//     const [streamReady, setStreamReady] = useState(false);
//     const [chatInfoLoaded, setChatInfoLoaded] = useState(false);

//     const callIdRef = useRef<string>(
//       incomingCallId ||
//         `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
//     );
//     const startTimeRef = useRef<Date | null>(null);
//     const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//     const pulseAnim = useRef(new Animated.Value(1)).current;
//     const hasJoinedStream = useRef(false);
//     // Guards against socketService.initiateCall firing more than once for
//     // the same outgoing call — the effect below can legitimately re-run
//     // (its dependency array includes values that may update after mount),
//     // but the call should only ever be initiated a single time.
//     const hasInitiatedRef = useRef(false);

//     const isVideo = type === "video";
//     const isIncomingCall = isIncoming === "1";
//     const isGroup = chatInfo?.type === "group";

//     // ── Keep screen awake ──────────────────────────────────────────────────────
//     useEffect(() => {
//       if (Platform.OS === "android" && !isIncomingCall) {
//         Notifications.scheduleNotificationAsync({
//           content: {
//             title: "Calling...",
//             body: "Waiting for the other person to answer",
//             priority: Notifications.AndroidNotificationPriority.MAX,
//             sticky: true,
//           },
//           trigger: null,
//         }).catch(() => {});
//       }

//       return () => {
//         Notifications.dismissAllNotificationsAsync().catch(() => {});
//       };
//     }, []);

//     // ── Pulse animation ────────────────────────────────────────────────────────
//     useEffect(() => {
//       if (status === "calling" || status === "ringing") {
//         Animated.loop(
//           Animated.sequence([
//             Animated.timing(pulseAnim, {
//               toValue: 1.1,
//               duration: 800,
//               useNativeDriver: true,
//             }),
//             Animated.timing(pulseAnim, {
//               toValue: 1,
//               duration: 800,
//               useNativeDriver: true,
//             }),
//           ])
//         ).start();
//       } else {
//         pulseAnim.stopAnimation();
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 200,
//           useNativeDriver: true,
//         }).start();
//       }
//     }, [status]);

//     // ── 1. Load chat info ──────────────────────────────────────────────────────
//     useEffect(() => {
//       chatApi
//         .getChatInfo(chatId)
//         .then((res) => {
//           if (res.success) {
//             setChatInfo(res.data.chat);
//             setChatInfoLoaded(true);
//           }
//         })
//         .catch(() => setChatInfoLoaded(true));
//     }, [chatId]);

//     // ── 2. Outgoing: initiate call once chat info is ready ─────────────────────
//     // One emit, regardless of chat type — the backend derives every
//     // recipient from the chat's actual participant list, so this works
//     // identically for a 1:1 chat (one recipient) or a group chat (everyone
//     // else in it) without the client needing to know or loop over anything.
//     useEffect(() => {
//       if (!chatInfoLoaded || isIncomingCall || !chatInfo) return;
//       if (hasInitiatedRef.current) return;

//       hasInitiatedRef.current = true;

//       socketService.initiateCall({
//         chatId,
//         callId: callIdRef.current,
//         type: isVideo ? "video" : "audio",
//       });

//       // Caller joins Stream immediately so the room exists for others to join
//       joinStreamCall();
//     }, [chatInfoLoaded]);

//     // ── 3. Incoming: join Stream once screen mounts ───────────────────────────
//     useEffect(() => {
//       if (!isIncomingCall) return;
//       setStatus("connected");
//       startTimer();
//       joinStreamCall();
//     }, []);

//     // ── 4. Listen to socket responses ─────────────────────────────────────────
//     useEffect(() => {
//       const socket = socketService.getSocket();
//       if (!socket) return;

//       const onAccepted = ({
//         callId,
//         acceptedByName,
//       }: {
//         callId: string;
//         acceptedByName?: string;
//       }) => {
//         if (callId !== callIdRef.current) return;
//         // Caller: someone answered — drop the "ringing" UI and show
//         // connected state. For group calls this fires once per acceptor;
//         // Stream itself renders each new joiner's tile automatically, so we
//         // only need this to happen once (starting the timer is idempotent
//         // via the `if (startTimeRef.current) return` guard in startTimer).
//         setStatus("connected");
//         startTimer();
//         if (isGroup && acceptedByName) {
//           toast.success(`${acceptedByName} joined`);
//         }
//       };

//       const onRejected = ({
//         callId,
//         rejectedByName,
//         isFinal,
//       }: {
//         callId: string;
//         rejectedByName?: string;
//         isFinal?: boolean;
//       }) => {
//         if (callId !== callIdRef.current) return;

//         if (!isFinal) {
//           // Group call: one person declined, but others are still ringing
//           // or already connected — the call continues.
//           toast.error(`${rejectedByName || "Someone"} declined`);
//           return;
//         }

//         setStatus("rejected");
//         toast.error("Call declined", "The other person declined your call");
//         setTimeout(() => handleEnd("rejected"), 2000);
//       };

//       const onEnded = ({ callId }: { callId: string }) => {
//         if (callId !== callIdRef.current) return;
//         handleEnd("completed");
//       };

//       socket.on("call:accepted", onAccepted);
//       socket.on("call:rejected", onRejected);
//       socket.on("call:ended", onEnded);

//       let timeout: ReturnType<typeof setTimeout>;
//       if (!isIncomingCall) {
//         timeout = setTimeout(() => {
//           setStatus((s) => {
//             if (s === "calling") {
//               handleEnd("missed");
//               return "missed";
//             }
//             return s;
//           });
//         }, 60000);
//       }

//       return () => {
//         socket.off("call:accepted", onAccepted);
//         socket.off("call:rejected", onRejected);
//         socket.off("call:ended", onEnded);
//         clearTimeout(timeout);
//       };
//     }, [isGroup]);

//     // ── Timer ──────────────────────────────────────────────────────────────────
//     const startTimer = () => {
//       if (startTimeRef.current) return; // already started
//       startTimeRef.current = new Date();
//       timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
//     };

//     // ── Stream.io join ─────────────────────────────────────────────────────────
//     // Unchanged from the 1:1 version — Stream's "default" call type already
//     // natively supports N participants, and CallContent renders a grid/
//     // spotlight layout automatically based on how many people are present.
//     // No SDK-level changes needed for group calling here.
//     const joinStreamCall = async () => {
//       if (hasJoinedStream.current) return;
//       hasJoinedStream.current = true;

//       if (!user || !streamToken) {
//         toast.error("Call error", "Missing credentials — please log in again");
//         return;
//       }

//       try {
//         const streamUser: StreamUser = {
//           id: user._id,
//           name: user.name,
//           image: user.avatar,
//         };

//         const client = StreamVideoClient.getOrCreateInstance({
//           apiKey: STREAM_API_KEY || "wwzvk9atm57g",
//           user: streamUser,
//           token: streamToken,
//         });

//         const callType = "default";
//         const call = client.call(callType, callIdRef.current);

//         if (!isVideo) {
//           await call.camera.disable();
//         }

//         await call.getOrCreate({});
//         await call.join();
//         setStreamClient(client);
//         setStreamCall(call);
//         setStreamReady(true);
//       } catch (err: any) {
//         // JSON.stringify(err) on a plain Error prints "{}" — message/stack/
//         // name are non-enumerable own properties on Error objects in most
//         // JS engines, so JSON.stringify skips them entirely. Pull the real
//         // fields out explicitly instead.
//         const details = {
//           message: err?.message,
//           name: err?.name,
//           code: err?.code,
//           status: err?.status ?? err?.statusCode,
//         };
//         console.log(" call error ===>> ", details, err);
//         toast.error(
//           "Connection failed",
//           details.message || "Could not connect to the call server"
//         );
//         Alert.alert("", details.message);
//         hasJoinedStream.current = false;
//         handleEnd("missed");
//       }
//     };

//     // const joinStreamCall = async () => {
//     //   if (hasJoinedStream.current) return;
//     //   hasJoinedStream.current = true;

//     //   if (!user || !streamToken) {
//     //     toast.error("Call error", "Missing credentials — please log in again");
//     //     return;
//     //   }
//     //   try {
//     //     const streamUser: StreamUser = {
//     //       id: user._id,
//     //       name: user.name,
//     //       image: user.avatar,
//     //     };

//     //     const client = new StreamVideoClient({
//     //       apiKey: STREAM_API_KEY,
//     //       user: streamUser,
//     //       token: streamToken,
//     //     });

//     //     // // Use 'default' for video, 'audio_room' for audio-only
//     //     // const callType = isVideo ? "default" : "audio_room";
//     //     // const call = client.call(callType, callIdRef.current);

//     //     // // create:true so caller creates it; recipient joins existing room
//     //     // await call.join({ create: true });
//     //     // Use the default call type for both 1-to-1 audio and video calls.
//     //     const call = client.call("default", callIdRef.current);

//     //     await call.join({ create: true });

//     //     if (!isVideo) {
//     //       await call.camera.disable();
//     //     }

//     //     setStreamClient(client);
//     //     setStreamCall(call);
//     //     setStreamReady(true);
//     //   } catch (err: any) {
//     //     const details = {
//     //       message: err?.message,
//     //       name: err?.name,
//     //       code: err?.code,
//     //       status: err?.status ?? err?.statusCode,
//     //     };
//     //     console.log(" call error ===>> ", details, err);
//     //     toast.error(
//     //       "Connection failed",
//     //       details.message || "Could not connect to the call server"
//     //     );
//     //     Alert.alert("", details.message);
//     //     hasJoinedStream.current = false;
//     //     handleEnd("missed");
//     //   }
//     // };

//     // ── End / leave call ────────────────────────────────────────────────────────
//     const handleEnd = async (endStatus?: string) => {
//       if (timerRef.current) clearInterval(timerRef.current);
//       Notifications.dismissAllNotificationsAsync().catch(() => {});

//       if (streamCall) {
//         try {
//           await streamCall.leave();
//         } catch {}
//       }
//       if (streamClient) {
//         try {
//           await streamClient.disconnectUser();
//         } catch {}
//       }

//       const finalStatus =
//         endStatus || (status === "connected" ? "completed" : "missed");
//       const participantIds = chatInfo?.participants.map((p) => p.user._id) || [];

//       if (isGroup && status === "connected") {
//         // I'm just leaving a group call I'd already joined — everyone else
//         // stays connected via Stream. Broadcasting call:end here would
//         // incorrectly disconnect every other participant.
//         socketService.leaveCall(callIdRef.current);
//       } else {
//         // 1:1 call, or a group call nobody had joined yet — this genuinely
//         // ends it for everyone who was invited.
//         socketService.endCall(
//           callIdRef.current,
//           participantIds,
//           isVideo ? "video" : "audio",
//           finalStatus
//         );
//       }

//       dispatch(clearCall());

//       try {
//         await callApi.saveCallHistory({
//           callId: callIdRef.current,
//           type: isVideo ? "video" : "audio",
//           participantIds,
//           chatId,
//           startedAt: startTimeRef.current?.toISOString(),
//           endedAt: new Date().toISOString(),
//           status: finalStatus,
//         });
//       } catch {}

//       router.back();
//     };

//     // ── Helpers ───────────────────────────────────────────────────────────────
//     const formatDuration = () => {
//       const m = Math.floor(duration / 60)
//         .toString()
//         .padStart(2, "0");
//       const s = (duration % 60).toString().padStart(2, "0");
//       return `${m}:${s}`;
//     };

//     const otherParticipant = !isGroup
//       ? chatInfo?.participants.find((p) => p.user._id !== user?._id)?.user
//       : null;

//     const { displayName, isContact: isContactSaved } = isGroup
//       ? { displayName: chatInfo?.name || "Group", isContact: false }
//       : resolveContact(
//           otherParticipant?.phone,
//           otherParticipant?.name || "Connecting..."
//         );

//     const displayAvatar = isGroup ? chatInfo?.avatar : otherParticipant?.avatar;
//     const initials = displayName
//       .split(" ")
//       .map((w: string) => w[0])
//       .join("")
//       .slice(0, 2)
//       .toUpperCase();

//     const statusLabel: Record<CallStatus, string> = {
//       calling: "Calling…",
//       ringing: "Connecting…",
//       connected: formatDuration(),
//       ended: "Call ended",
//       rejected: "Call declined",
//       missed: "No answer",
//     };

//     useEffect(() => {
//       return () => {
//         streamCall?.leave?.().catch(() => {});
//       };
//     }, [streamCall]);

//     // ── When Stream is ready render Stream UI (all participants) ───────────────
//     if (streamReady && streamClient && streamCall) {
//       return (
//         <StreamVideo client={streamClient}>
//           <StreamCall call={streamCall}>
//             <View style={{ flex: 1, backgroundColor: "#000" }}>
//               <StatusBar style="light" />
//               {/* Stream's built-in UI already renders a grid for multiple
//                   participants — no changes needed here for group calls. */}
//               <CallContent onHangupCallHandler={() => handleEnd("completed")} />

//               <View style={styles.overlayHeader} pointerEvents="none">
//                 <SafeAreaView edges={["top"]}>
//                   <View style={styles.overlayInfo}>
//                     <Text style={styles.overlayName}>{displayName}</Text>
//                     <Text
//                       style={[
//                         styles.overlayStatus,
//                         { color: status === "connected" ? "#00d4aa" : "#fff" },
//                       ]}
//                     >
//                       {statusLabel[status]}
//                     </Text>
//                   </View>
//                 </SafeAreaView>
//               </View>
//             </View>
//           </StreamCall>
//         </StreamVideo>
//       );
//     }

//     // ── Waiting / signaling UI (before Stream connects) ───────────────────────
//     return (
//       <View style={styles.container}>
//         <StatusBar style="light" />
//         <LinearGradient
//           colors={
//             isVideo
//               ? ["#050520", "#0f1535", "#050520"]
//               : ["#0a0a20", "#0f0f35", "#0a0a20"]
//           }
//           style={StyleSheet.absoluteFillObject}
//         />
//         <View
//           style={[
//             styles.glow,
//             { backgroundColor: isVideo ? "#5b8dee" : "#00d4aa" },
//           ]}
//         />

//         <SafeAreaView style={styles.safeArea}>
//           <View style={styles.header}>
//             <TouchableOpacity
//               onPress={() => handleEnd()}
//               style={styles.minimizeBtn}
//             >
//               <Ionicons
//                 name="chevron-down"
//                 size={28}
//                 color="rgba(255,255,255,0.6)"
//               />
//             </TouchableOpacity>
//             <Text style={styles.callTypeLabel}>
//               {isVideo ? "📹 Video Call" : "📞 Voice Call"}
//               {isGroup ? " · Group" : ""}
//             </Text>
//             <View style={{ width: 44 }} />
//           </View>

//           <View style={styles.callerSection}>
//             <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
//               {displayAvatar ? (
//                 <Image
//                   source={{ uri: displayAvatar }}
//                   style={[
//                     styles.avatar,
//                     { borderColor: isVideo ? "#5b8dee" : "#00d4aa" },
//                   ]}
//                   contentFit="cover"
//                 />
//               ) : (
//                 <LinearGradient
//                   colors={
//                     isVideo ? ["#5b8dee", "#7b5ea7"] : ["#00d4aa", "#00b090"]
//                   }
//                   style={styles.avatarFallback}
//                 >
//                   <Text style={styles.avatarInitials}>{initials}</Text>
//                 </LinearGradient>
//               )}
//             </Animated.View>

//             <Text style={styles.callerName}>{displayName}</Text>

//             <Text
//               style={[
//                 styles.callStatus,
//                 status === "connected" && { color: "#00d4aa", fontWeight: "700" },
//                 (status === "rejected" || status === "missed") && {
//                   color: "#ff4757",
//                 },
//               ]}
//             >
//               {statusLabel[status]}
//             </Text>

//             {(status === "calling" || status === "ringing") && (
//               <View style={styles.dotsRow}>
//                 {[0, 1, 2].map((i) => (
//                   <View
//                     key={i}
//                     style={[
//                       styles.dot,
//                       {
//                         backgroundColor: isVideo ? "#5b8dee" : "#00d4aa",
//                         opacity: 0.3 + i * 0.25,
//                       },
//                     ]}
//                   />
//                 ))}
//               </View>
//             )}
//           </View>

//           {/* Controls */}
//           <View style={styles.controls}>
//             <View style={styles.secondaryControls}>
//               <TouchableOpacity
//                 style={[
//                   styles.ctrlBtn,
//                   muted && { backgroundColor: "rgba(255,71,87,0.2)" },
//                 ]}
//                 onPress={() => {
//                   const next = !muted;
//                   setMuted(next);
//                   if (streamCall) {
//                     next
//                       ? streamCall.microphone.disable()
//                       : streamCall.microphone.enable();
//                   }
//                 }}
//               >
//                 <Ionicons
//                   name={muted ? "mic-off" : "mic"}
//                   size={22}
//                   color={muted ? "#ff4757" : "#fff"}
//                 />
//                 <Text style={styles.ctrlLabel}>{muted ? "Unmute" : "Mute"}</Text>
//               </TouchableOpacity>

//               {isVideo && (
//                 <TouchableOpacity
//                   style={[
//                     styles.ctrlBtn,
//                     !cameraOn && { backgroundColor: "rgba(255,71,87,0.2)" },
//                   ]}
//                   onPress={() => {
//                     const next = !cameraOn;
//                     setCameraOn(next);
//                     if (streamCall) {
//                       next
//                         ? streamCall.camera.enable()
//                         : streamCall.camera.disable();
//                     }
//                   }}
//                 >
//                   <Ionicons
//                     name={cameraOn ? "videocam" : "videocam-off"}
//                     size={22}
//                     color={cameraOn ? "#fff" : "#ff4757"}
//                   />
//                   <Text style={styles.ctrlLabel}>
//                     {cameraOn ? "Camera" : "Camera off"}
//                   </Text>
//                 </TouchableOpacity>
//               )}

//               {isVideo && (
//                 <TouchableOpacity
//                   style={styles.ctrlBtn}
//                   onPress={() => {
//                     if (streamCall) streamCall.camera.flip();
//                   }}
//                 >
//                   <Ionicons
//                     name="camera-reverse-outline"
//                     size={22}
//                     color="#fff"
//                   />
//                   <Text style={styles.ctrlLabel}>Flip</Text>
//                 </TouchableOpacity>
//               )}

//               {!isVideo && (
//                 <TouchableOpacity style={styles.ctrlBtn}>
//                   <Ionicons name="volume-high-outline" size={22} color="#fff" />
//                   <Text style={styles.ctrlLabel}>Speaker</Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             <TouchableOpacity
//               onPress={() => handleEnd()}
//               style={styles.endCallBtn}
//               activeOpacity={0.85}
//             >
//               <LinearGradient
//                 colors={["#ff4757", "#cc2233"]}
//                 style={styles.endCallGradient}
//               >
//                 <Ionicons
//                   name="call"
//                   size={30}
//                   color="#fff"
//                   style={{ transform: [{ rotate: "135deg" }] }}
//                 />
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </SafeAreaView>
//       </View>
//     );
//   }

//   const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: "#0a0a20" },
//     safeArea: { flex: 1 },
//     glow: {
//       position: "absolute",
//       width: 400,
//       height: 400,
//       borderRadius: 200,
//       opacity: 0.08,
//       top: "15%",
//       alignSelf: "center",
//     },
//     header: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       paddingHorizontal: 16,
//       paddingVertical: 12,
//     },
//     minimizeBtn: {
//       width: 44,
//       height: 44,
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     callTypeLabel: {
//       fontSize: 15,
//       color: "rgba(255,255,255,0.55)",
//       fontWeight: "600",
//     },
//     callerSection: {
//       flex: 1,
//       justifyContent: "center",
//       alignItems: "center",
//       gap: 16,
//     },
//     avatar: { width: 130, height: 130, borderRadius: 65, borderWidth: 3 },
//     avatarFallback: {
//       width: 130,
//       height: 130,
//       borderRadius: 65,
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     avatarInitials: { fontSize: 46, fontWeight: "800", color: "#fff" },
//     callerName: {
//       fontSize: 30,
//       fontWeight: "800",
//       color: "#fff",
//       letterSpacing: -0.5,
//     },
//     callStatus: {
//       fontSize: 17,
//       color: "rgba(255,255,255,0.5)",
//       fontWeight: "500",
//     },
//     dotsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
//     dot: { width: 8, height: 8, borderRadius: 4 },
//     controls: { paddingHorizontal: 24, paddingBottom: 44, gap: 36 },
//     secondaryControls: { flexDirection: "row", justifyContent: "space-around" },
//     ctrlBtn: {
//       alignItems: "center",
//       gap: 8,
//       minWidth: 64,
//       paddingVertical: 12,
//       paddingHorizontal: 8,
//       borderRadius: 18,
//       backgroundColor: "rgba(255,255,255,0.08)",
//     },
//     ctrlLabel: {
//       fontSize: 11,
//       color: "rgba(255,255,255,0.6)",
//       fontWeight: "500",
//     },
//     endCallBtn: {
//       alignSelf: "center",
//       borderRadius: 40,
//       overflow: "hidden",
//       shadowColor: "#ff4757",
//       shadowOffset: { width: 0, height: 8 },
//       shadowOpacity: 0.5,
//       shadowRadius: 20,
//       elevation: 14,
//     },
//     endCallGradient: {
//       width: 80,
//       height: 80,
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     overlayHeader: {
//       position: "absolute",
//       top: 0,
//       left: 0,
//       right: 0,
//       backgroundColor: "rgba(0,0,0,0.4)",
//     },
//     overlayInfo: { alignItems: "center", paddingVertical: 12 },
//     overlayName: { fontSize: 18, fontWeight: "700", color: "#fff" },
//     overlayStatus: { fontSize: 13, marginTop: 2 },
//   });
