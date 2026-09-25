// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
//   Platform,
//   Alert,
// } from "react-native";
// import { useEffect, useMemo, useRef, useState } from "react";
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
//   ParticipantLabelProps,
//   ParticipantVideoFallbackProps,
// } from "@stream-io/video-react-native-sdk";
// import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
// import { socketService } from "../../services/socket";
// import { callApi, chatApi } from "../../services/api";
// import { clearCall } from "../../store/slices/callSlice";
// import {
//   setMyActiveCall,
//   clearMyActiveCall,
// } from "../../store/slices/myCallSlice";
// import { useTheme } from "../../context/ThemeContext";
// import { useToast } from "../../context/ToastContext";
// import { STREAM_API_KEY } from "../../constants";
// import { Chat } from "../../types";
// import { useContactNameResolver } from "@/hooks/useContactName";
// import { useOutgoingRingback } from "../../hooks/useOutgoingRingback"; // adjust path to match where you place useOutgoingRingback.ts relative to CallScreen
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
//         apiKey: STREAM_API_KEY || "wwzvk9atm57g",
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

//       // Purely local fact — this device has successfully joined this
//       // call. Drives OngoingCallBanner/CallsScreen's "already joined"
//       // state, which the server has no reliable way to push back to us
//       // (every call:ongoing broadcast explicitly skips re-notifying
//       // whoever just joined).
//       dispatch(
//         setMyActiveCall({
//           callId: callIdRef.current,
//           chatId,
//           type: isVideo ? "video" : "audio",
//         })
//       );
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
//     dispatch(clearMyActiveCall());

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
//   const participantPhoneById = useMemo(() => {
//     const map: Record<string, string | undefined> = {};
//     chatInfo?.participants.forEach((p) => {
//       map[p.user._id] = p.user.phone;
//     });
//     return map;
//   }, [chatInfo]);

//   const CustomParticipantLabel = useMemo(() => {
//     return function ParticipantLabel({ participant }: ParticipantLabelProps) {
//       const resolveParticipantName = useContactNameResolver();
//       const phone = participant?.userId
//         ? participantPhoneById[participant.userId]
//         : undefined;
//       const { displayName: participantDisplayName } = resolveParticipantName(
//         phone,
//         participant?.name || participant?.userId || "Unknown"
//       );

//       return (
//         <View style={styles.participantLabel}>
//           <Text style={styles.participantLabelText} numberOfLines={1}>
//             {participantDisplayName}
//           </Text>
//         </View>
//       );
//     };
//   }, [participantPhoneById]);

//   const CustomParticipantVideoFallback = useMemo(() => {
//     return function ParticipantVideoFallback({
//       participant,
//     }: ParticipantVideoFallbackProps) {
//       const resolveParticipantName = useContactNameResolver();
//       const phone = participant?.userId
//         ? participantPhoneById[participant.userId]
//         : undefined;
//       const { displayName: participantDisplayName } = resolveParticipantName(
//         phone,
//         participant?.name || participant?.userId || "Unknown"
//       );

//       const initials = (participantDisplayName || "?")
//         .split(" ")
//         .map((w) => w[0])
//         .join("")
//         .slice(0, 2)
//         .toUpperCase();

//       return (
//         <View style={styles.wrap}>
//           {participant?.image ? (
//             <Image
//               source={{ uri: participant.image }}
//               style={styles.avatar}
//               contentFit="cover"
//             />
//           ) : (
//             <LinearGradient
//               colors={["#00d4aa", "#5b8dee"]}
//               style={styles.avatarFallback}
//             >
//               <Text style={styles.initials}>{initials}</Text>
//             </LinearGradient>
//           )}
//           <Text style={styles.name}>{participantDisplayName}</Text>
//         </View>
//       );
//     };
//   }, [participantPhoneById]);

//   const otherParticipant = !isGroup
//     ? chatInfo?.participants.find((p) => p.user._id !== user?._id)?.user
//     : null;

//   const { displayName, isContact: isContactSaved } = isGroup
//     ? { displayName: chatInfo?.name || "Group", isContact: false }
//     : resolveContact(
//         otherParticipant?.phone,
//         otherParticipant?.name || "Connecting..."
//       );

//   // Group calls have no "known/unknown number" concept — treated as
//   // known by default rather than inheriting isContactSaved's
//   // false-by-definition value for groups above (that false means
//   // something different: "not applicable", not "unknown caller").
//   useOutgoingRingback(status === "calling", isGroup ? true : isContactSaved);

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

//             <CallContent
//               onHangupCallHandler={() => handleEnd("completed")}
//               ParticipantLabel={CustomParticipantLabel}
//               ParticipantVideoFallback={CustomParticipantVideoFallback}
//             />

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
//   participantLabel: {
//     backgroundColor: "rgba(0,0,0,0.5)",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//     alignSelf: "flex-start",
//   },
//   participantLabelText: {
//     color: "#fff",
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   wrap: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 14,
//     backgroundColor: "#0a0a20",
//   },

//   initials: { fontSize: 46, fontWeight: "800", color: "#fff" },
//   name: { fontSize: 22, fontWeight: "700", color: "#fff" },
// });

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import * as Notifications from "expo-notifications";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallContent,
  User as StreamUser,
  ParticipantLabelProps,
  ParticipantVideoFallbackProps,
  useAudioDeviceStatus,
  callManager,
} from "@stream-io/video-react-native-sdk";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { socketService } from "../../services/socket";
import { callApi, chatApi } from "../../services/api";
import { clearCall } from "../../store/slices/callSlice";
import {
  setMyActiveCall,
  clearMyActiveCall,
} from "../../store/slices/myCallSlice";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { STREAM_API_KEY } from "../../constants";
import { Chat } from "../../types";
import { useContactNameResolver } from "@/hooks/useContactName";
import { useOutgoingRingback } from "../../hooks/useOutgoingRingback"; // adjust path to match where you place useOutgoingRingback.ts relative to CallScreen
import { useIsBlocked } from "@/hooks/useIsBlockedUser";
import {
  ensureCallPermissions,
  warnPermissionsOff,
} from "../../utils/callPermissions";

type CallStatus =
  | "calling"
  | "ringing"
  | "connected"
  | "ended"
  | "rejected"
  | "missed";

export default function CallScreen() {
  const {
    id: chatId,
    type,
    callId: incomingCallId,
    isIncoming,
  } = useLocalSearchParams<{
    id: string;
    type: "audio" | "video";
    callId?: string;
    isIncoming?: string;
  }>();

  const audioDeviceStatus = useAudioDeviceStatus();
  const isSpeakerOn = audioDeviceStatus?.currentEndpointType === "Speaker";
  const toggleSpeaker = () => {
    const devices = audioDeviceStatus?.devices || [];
    const target = devices.find((d) =>
      isSpeakerOn ? d.type === "Earpiece" : d.type === "Speaker"
    );
    if (target) {
      callManager.audioDevices.select(target.id);
    }
  };

  const router = useRouter();
  const dispatch = useAppDispatch();
  const resolveContact = useContactNameResolver();
  const { colors } = useTheme();
  const toast = useToast();
  const { user } = useAppSelector((s) => s.auth);
  const streamToken = useAppSelector((s) => s.auth.streamToken);

  const [status, setStatus] = useState<CallStatus>(
    isIncoming === "1" ? "ringing" : "calling"
  );
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(
    null
  );
  const [streamCall, setStreamCall] = useState<any>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [chatInfoLoaded, setChatInfoLoaded] = useState(false);

  const callIdRef = useRef<string>(
    incomingCallId ||
      `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  const startTimeRef = useRef<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const hasJoinedStream = useRef(false);

  const isVideo = type === "video";
  const isIncomingCall = isIncoming === "1";
  const isGroup = chatInfo?.type === "group";

  // Computed early (not just near render) so the outgoing-call effect
  // below can guard against it before ever emitting call:initiate.
  const otherParticipantId = !isGroup
    ? chatInfo?.participants.find((p) => p.user._id !== user?._id)?.user._id
    : undefined;
  const isOtherBlocked = useIsBlocked(otherParticipantId);

  // ── Keep screen awake ──────────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS === "android" && !isIncomingCall) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Calling...",
          body: "Waiting for the other person to answer",
          priority: Notifications.AndroidNotificationPriority.MAX,
          sticky: true,
        },
        trigger: null,
      }).catch(() => {});
    }

    return () => {
      Notifications.dismissAllNotificationsAsync().catch(() => {});
    };
  }, []);

  // ── Pulse animation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "calling" || status === "ringing") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [status]);

  // ── 1. Load chat info ──────────────────────────────────────────────────────
  useEffect(() => {
    chatApi
      .getChatInfo(chatId)
      .then((res) => {
        if (res.success) {
          setChatInfo(res.data.chat);
          setChatInfoLoaded(true);
        }
      })
      .catch(() => setChatInfoLoaded(true));
  }, [chatId]);

  // ── 2. Outgoing: initiate call once chat info is ready ─────────────────────
  // One emit, regardless of chat type — the backend derives every
  // recipient from the chat's actual participant list, so this works
  // identically for a 1:1 chat (one recipient) or a group chat (everyone
  // else in it) without the client needing to know or loop over anything.
  useEffect(() => {
    if (!chatInfoLoaded || isIncomingCall || !chatInfo) return;

    if (isOtherBlocked) {
      toast.error("Unblock this contact to call them");
      router.back();
      return;
    }

    socketService.initiateCall({
      chatId,
      callId: callIdRef.current,
      type: isVideo ? "video" : "audio",
    });

    // Caller joins Stream immediately so the room exists for others to join
    joinStreamCall();
  }, [chatInfoLoaded, isOtherBlocked]);

  // ── 3. Incoming: join Stream once screen mounts ───────────────────────────
  useEffect(() => {
    if (!isIncomingCall) return;
    setStatus("connected");
    startTimer();
    joinStreamCall();
  }, []);

  // ── 4. Listen to socket responses ─────────────────────────────────────────
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const onAccepted = ({
      callId,
      acceptedByName,
    }: {
      callId: string;
      acceptedByName?: string;
    }) => {
      if (callId !== callIdRef.current) return;
      // Caller: someone answered — drop the "ringing" UI and show
      // connected state. For group calls this fires once per acceptor;
      // Stream itself renders each new joiner's tile automatically, so we
      // only need this to happen once (starting the timer is idempotent
      // via the `if (startTimeRef.current) return` guard in startTimer).
      setStatus("connected");
      startTimer();
      if (isGroup && acceptedByName) {
        toast.success(`${acceptedByName} joined`);
      }
    };

    const onRejected = ({
      callId,
      rejectedByName,
      isFinal,
    }: {
      callId: string;
      rejectedByName?: string;
      isFinal?: boolean;
    }) => {
      if (callId !== callIdRef.current) return;

      if (!isFinal) {
        // Group call: one person declined, but others are still ringing
        // or already connected — the call continues.
        toast.error(`${rejectedByName || "Someone"} declined`);
        return;
      }

      setStatus("rejected");
      toast.error("Call declined", "The other person declined your call");
      setTimeout(() => handleEnd("rejected"), 2000);
    };

    const onEnded = ({ callId }: { callId: string }) => {
      if (callId !== callIdRef.current) return;
      handleEnd("completed");
    };

    // The server refused to ring anyone (blocked, or the callee only
    // accepts calls from contacts). Without this the caller just saw
    // "Calling…" until the 60s timeout.
    const onCallError = ({
      callId,
      error,
    }: {
      callId: string;
      error?: string;
      code?: string;
    }) => {
      if (callId !== callIdRef.current) return;
      setStatus("rejected");
      toast.error("Call couldn't be placed", error);
      setTimeout(() => handleEnd("rejected"), 1500);
    };

    socket.on("call:accepted", onAccepted);
    socket.on("call:error", onCallError);
    socket.on("call:rejected", onRejected);
    socket.on("call:ended", onEnded);

    let timeout: ReturnType<typeof setTimeout>;
    if (!isIncomingCall) {
      timeout = setTimeout(() => {
        setStatus((s) => {
          if (s === "calling") {
            handleEnd("missed");
            return "missed";
          }
          return s;
        });
      }, 60000);
    }

    return () => {
      socket.off("call:accepted", onAccepted);
      socket.off("call:error", onCallError);
      socket.off("call:rejected", onRejected);
      socket.off("call:ended", onEnded);
      clearTimeout(timeout);
    };
  }, [isGroup]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const startTimer = () => {
    if (startTimeRef.current) return; // already started
    startTimeRef.current = new Date();
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
  };

  // ── streamReady gating ──────────────────────────────────────────────────────
  // Only flips once Stream itself has connected for this device AND the
  // call has actually been answered by someone — not just "my own join
  // succeeded". Previously this was set to true inside joinStreamCall()
  // the instant *this device's* call.join() resolved, which meant the
  // CALLER (whose join happens immediately when they place the call, well
  // before anyone answers) could see the full Stream video/call grid UI
  // before the other side had even seen it ring. For the receiver this
  // was already correct by accident — status is forced to "connected"
  // before joinStreamCall() even runs on their screen, since reaching
  // this screen at all already means they tapped Accept — so this fires
  // immediately for them, same as before. For a group call, status
  // becomes "connected" the first time ANY participant joins (via
  // onAccepted above), matching "a participant has joined".
  useEffect(() => {
    if (streamClient && streamCall && status === "connected") {
      setStreamReady(true);
    }
  }, [streamClient, streamCall, status]);

  // ── Stream.io join ─────────────────────────────────────────────────────────
  // Unchanged from the 1:1 version — Stream's "default" call type already
  // natively supports N participants, and CallContent renders a grid/
  // spotlight layout automatically based on how many people are present.
  // No SDK-level changes needed for group calling here.
  const joinStreamCall = async () => {
    if (hasJoinedStream.current) return;
    hasJoinedStream.current = true;

    if (!user || !streamToken) {
      toast.error("Call error", "Missing credentials — please log in again");
      return;
    }

    try {
      // Ask for the mic/camera first. The SDK never prompts itself: with the
      // mic denied it joins fine and just publishes no audio — a "silent"
      // call with no explanation. Non-blocking: they can still listen.
      warnPermissionsOff(await ensureCallPermissions(isVideo));

      const streamUser: StreamUser = {
        id: user._id,
        name: user.name,
        image: user.avatar,
      };

      const client = StreamVideoClient.getOrCreateInstance({
        apiKey: STREAM_API_KEY || "wwzvk9atm57g",
        user: streamUser,
        token: streamToken,
      });

      const callType = "default";
      const call = client.call(callType, callIdRef.current);

      if (!isVideo) {
        await call.camera.disable();
      }

      callManager.start({
        audioRole: "communicator",
        deviceEndpointType: "speaker",
      });
      await call.getOrCreate({});
      await call.join();

      setStreamClient(client);
      setStreamCall(call);

      // Diagnostics for "connected but silent": a few seconds after joining,
      // log whether THIS device is actually publishing microphone audio.
      // Look for "[call diag]" in logcat / Xcode. micStatus should be
      // "enabled" and published should include an audio track.
      setTimeout(() => {
        try {
          console.log("[call diag]", {
            micStatus: call.microphone.state.status,
            published: call.state.localParticipant?.publishedTracks,
            participants: call.state.participants.length,
          });
        } catch {}
      }, 4000);

      // Purely local fact — this device has successfully joined this
      // call. Drives OngoingCallBanner/CallsScreen's "already joined"
      // state, which the server has no reliable way to push back to us
      // (every call:ongoing broadcast explicitly skips re-notifying
      // whoever just joined). Deliberately NOT the same thing as
      // streamReady — joining Stream and the call being *answered* are
      // two different facts now; see the streamReady effect above.
      dispatch(
        setMyActiveCall({
          callId: callIdRef.current,
          chatId,
          type: isVideo ? "video" : "audio",
        })
      );
    } catch (err: any) {
      // JSON.stringify(err) on a plain Error prints "{}" — message/stack/
      // name are non-enumerable own properties on Error objects in most
      // JS engines, so JSON.stringify skips them entirely. Pull the real
      // fields out explicitly instead.
      const details = {
        message: err?.message,
        name: err?.name,
        code: err?.code,
        status: err?.status ?? err?.statusCode,
      };
      console.log(" call error ===>> ", details, err);
      // console.log(" call error ===>> ", err);
      toast.error(
        "Connection failed",
        details.message || "Could not connect to the call server"
      );
      Alert.alert("", details.message);
      // toast.error(
      //   "Connection failed",
      //   "Could not connect to the call server " + JSON.stringify(err)
      // );
      hasJoinedStream.current = false;
      handleEnd("missed");
    }
  };

  // ── End / leave call ────────────────────────────────────────────────────────
  const handleEnd = async (endStatus?: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    Notifications.dismissAllNotificationsAsync().catch(() => {});

    callManager.stop();
    if (streamCall) {
      try {
        await streamCall.leave();
      } catch {}
    }
    if (streamClient) {
      try {
        await streamClient.disconnectUser();
      } catch {}
    }

    const finalStatus =
      endStatus || (status === "connected" ? "completed" : "missed");
    const participantIds = chatInfo?.participants.map((p) => p.user._id) || [];

    if (isGroup && status === "connected") {
      // I'm just leaving a group call I'd already joined — everyone else
      // stays connected via Stream. Broadcasting call:end here would
      // incorrectly disconnect every other participant.
      socketService.leaveCall(callIdRef.current);
    } else {
      // 1:1 call, or a group call nobody had joined yet — this genuinely
      // ends it for everyone who was invited.
      socketService.endCall(
        callIdRef.current,
        participantIds,
        isVideo ? "video" : "audio",
        finalStatus
      );
    }

    dispatch(clearCall());
    dispatch(clearMyActiveCall());

    try {
      await callApi.saveCallHistory({
        callId: callIdRef.current,
        type: isVideo ? "video" : "audio",
        participantIds,
        chatId,
        startedAt: startTimeRef.current?.toISOString(),
        endedAt: new Date().toISOString(),
        status: finalStatus,
      });
    } catch {}

    router.back();
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDuration = () => {
    const m = Math.floor(duration / 60)
      .toString()
      .padStart(2, "0");
    const s = (duration % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };
  const participantPhoneById = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    chatInfo?.participants.forEach((p) => {
      map[p.user._id] = p.user.phone;
    });
    return map;
  }, [chatInfo]);

  const CustomParticipantLabel = useMemo(() => {
    return function ParticipantLabel({ participant }: ParticipantLabelProps) {
      const resolveParticipantName = useContactNameResolver();
      const phone = participant?.userId
        ? participantPhoneById[participant.userId]
        : undefined;
      const { displayName: participantDisplayName } = resolveParticipantName(
        phone,
        participant?.name || participant?.userId || "Unknown"
      );

      return (
        <View style={styles.participantLabel}>
          <Text style={styles.participantLabelText} numberOfLines={1}>
            {participantDisplayName}
          </Text>
        </View>
      );
    };
  }, [participantPhoneById]);

  const CustomParticipantVideoFallback = useMemo(() => {
    return function ParticipantVideoFallback({
      participant,
    }: ParticipantVideoFallbackProps) {
      const resolveParticipantName = useContactNameResolver();
      const phone = participant?.userId
        ? participantPhoneById[participant.userId]
        : undefined;
      const { displayName: participantDisplayName } = resolveParticipantName(
        phone,
        participant?.name || participant?.userId || "Unknown"
      );

      const initials = (participantDisplayName || "?")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return (
        <View style={styles.wrap}>
          {participant?.image ? (
            <Image
              source={{ uri: participant.image }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <LinearGradient
              colors={["#00d4aa", "#5b8dee"]}
              style={styles.avatarFallback}
            >
              <Text style={styles.initials}>{initials}</Text>
            </LinearGradient>
          )}
          <Text style={styles.name}>{participantDisplayName}</Text>
        </View>
      );
    };
  }, [participantPhoneById]);

  const otherParticipant = !isGroup
    ? chatInfo?.participants.find((p) => p.user._id !== user?._id)?.user
    : null;

  const { displayName, isContact: isContactSaved } = isGroup
    ? { displayName: chatInfo?.name || "Group", isContact: false }
    : resolveContact(
        otherParticipant?.phone,
        otherParticipant?.name || "Connecting..."
      );

  // Group calls have no "known/unknown number" concept — treated as
  // known by default rather than inheriting isContactSaved's
  // false-by-definition value for groups above (that false means
  // something different: "not applicable", not "unknown caller").
  useOutgoingRingback(status === "calling", isGroup ? true : isContactSaved);

  // const displayName = isGroup
  //   ? chatInfo?.name || "Group"
  //   : otherParticipant?.name || "Connecting…";
  const displayAvatar = isGroup ? chatInfo?.avatar : otherParticipant?.avatar;
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statusLabel: Record<CallStatus, string> = {
    calling: "Calling…",
    ringing: "Connecting…",
    connected: formatDuration(),
    ended: "Call ended",
    rejected: "Call declined",
    missed: "No answer",
  };

  useEffect(() => {
    return () => {
      streamCall?.leave?.();
    };
  }, [streamCall]);

  // ── When Stream is ready render Stream UI (all participants) ───────────────
  if (streamReady && streamClient && streamCall) {
    return (
      <StreamVideo client={streamClient}>
        <StreamCall call={streamCall}>
          <View style={{ flex: 1, backgroundColor: "#000" }}>
            <StatusBar style="light" />

            <CallContent
              onHangupCallHandler={() => handleEnd("completed")}
              ParticipantLabel={CustomParticipantLabel}
              ParticipantVideoFallback={CustomParticipantVideoFallback}
            />

            <View style={styles.overlayHeader} pointerEvents="none">
              <SafeAreaView edges={["top"]}>
                <View style={styles.overlayInfo}>
                  <Text style={styles.overlayName}>{displayName}</Text>
                  <Text
                    style={[
                      styles.overlayStatus,
                      { color: status === "connected" ? "#00d4aa" : "#fff" },
                    ]}
                  >
                    {statusLabel[status]}
                  </Text>
                </View>
              </SafeAreaView>
            </View>
          </View>
        </StreamCall>
      </StreamVideo>
    );
  }

  // ── Waiting / signaling UI (before Stream connects) ───────────────────────
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={
          isVideo
            ? ["#050520", "#0f1535", "#050520"]
            : ["#0a0a20", "#0f0f35", "#0a0a20"]
        }
        style={StyleSheet.absoluteFillObject}
      />
      <View
        style={[
          styles.glow,
          { backgroundColor: isVideo ? "#5b8dee" : "#00d4aa" },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => handleEnd()}
            style={styles.minimizeBtn}
          >
            <Ionicons
              name="chevron-down"
              size={28}
              color="rgba(255,255,255,0.6)"
            />
          </TouchableOpacity>
          <Text style={styles.callTypeLabel}>
            {isVideo ? "📹 Video Call" : "📞 Voice Call"}
            {isGroup ? " · Group" : ""}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.callerSection}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            {displayAvatar ? (
              <Image
                source={{ uri: displayAvatar }}
                style={[
                  styles.avatar,
                  { borderColor: isVideo ? "#5b8dee" : "#00d4aa" },
                ]}
                contentFit="cover"
              />
            ) : (
              <LinearGradient
                colors={
                  isVideo ? ["#5b8dee", "#7b5ea7"] : ["#00d4aa", "#00b090"]
                }
                style={styles.avatarFallback}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
          </Animated.View>

          <Text style={styles.callerName}>{displayName}</Text>

          <Text
            style={[
              styles.callStatus,
              status === "connected" && { color: "#00d4aa", fontWeight: "700" },
              (status === "rejected" || status === "missed") && {
                color: "#ff4757",
              },
            ]}
          >
            {statusLabel[status]}
          </Text>

          {(status === "calling" || status === "ringing") && (
            <View style={styles.dotsRow}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isVideo ? "#5b8dee" : "#00d4aa",
                      opacity: 0.3 + i * 0.25,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.secondaryControls}>
            <TouchableOpacity
              style={[
                styles.ctrlBtn,
                muted && { backgroundColor: "rgba(255,71,87,0.2)" },
              ]}
              onPress={() => {
                const next = !muted;
                setMuted(next);
                if (streamCall) {
                  next
                    ? streamCall.microphone.disable()
                    : streamCall.microphone.enable();
                }
              }}
            >
              <Ionicons
                name={muted ? "mic-off" : "mic"}
                size={22}
                color={muted ? "#ff4757" : "#fff"}
              />
              <Text style={styles.ctrlLabel}>{muted ? "Unmute" : "Mute"}</Text>
            </TouchableOpacity>

            {isVideo && (
              <TouchableOpacity
                style={[
                  styles.ctrlBtn,
                  !cameraOn && { backgroundColor: "rgba(255,71,87,0.2)" },
                ]}
                onPress={() => {
                  const next = !cameraOn;
                  setCameraOn(next);
                  if (streamCall) {
                    next
                      ? streamCall.camera.enable()
                      : streamCall.camera.disable();
                  }
                }}
              >
                <Ionicons
                  name={cameraOn ? "videocam" : "videocam-off"}
                  size={22}
                  color={cameraOn ? "#fff" : "#ff4757"}
                />
                <Text style={styles.ctrlLabel}>
                  {cameraOn ? "Camera" : "Camera off"}
                </Text>
              </TouchableOpacity>
            )}

            {isVideo && (
              <TouchableOpacity
                style={styles.ctrlBtn}
                onPress={() => {
                  if (streamCall) streamCall.camera.flip();
                }}
              >
                <Ionicons
                  name="camera-reverse-outline"
                  size={22}
                  color="#fff"
                />
                <Text style={styles.ctrlLabel}>Flip</Text>
              </TouchableOpacity>
            )}

            {/* {!isVideo && (
              <TouchableOpacity style={styles.ctrlBtn}>
                <Ionicons name="volume-high-outline" size={22} color="#fff" />
                <Text style={styles.ctrlLabel}>Speaker</Text>
              </TouchableOpacity>
            )} */}
            {!isVideo && (
              <TouchableOpacity
                style={[
                  styles.ctrlBtn,
                  isSpeakerOn && { backgroundColor: "rgba(0,212,170,0.15)" },
                ]}
                onPress={toggleSpeaker}
              >
                <Ionicons
                  name={isSpeakerOn ? "volume-high" : "volume-high-outline"}
                  size={22}
                  color={isSpeakerOn ? "#00d4aa" : "#fff"}
                />
                <Text style={styles.ctrlLabel}>Speaker</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => handleEnd()}
            style={styles.endCallBtn}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#ff4757", "#cc2233"]}
              style={styles.endCallGradient}
            >
              <Ionicons
                name="call"
                size={30}
                color="#fff"
                style={{ transform: [{ rotate: "135deg" }] }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a20" },
  safeArea: { flex: 1 },
  glow: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.08,
    top: "15%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  minimizeBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  callTypeLabel: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "600",
  },
  callerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  avatar: { width: 130, height: 130, borderRadius: 65, borderWidth: 3 },
  avatarFallback: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: { fontSize: 46, fontWeight: "800", color: "#fff" },
  callerName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  callStatus: {
    fontSize: 17,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
  },
  dotsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  controls: { paddingHorizontal: 24, paddingBottom: 44, gap: 36 },
  secondaryControls: { flexDirection: "row", justifyContent: "space-around" },
  ctrlBtn: {
    alignItems: "center",
    gap: 8,
    minWidth: 64,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  ctrlLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  endCallBtn: {
    alignSelf: "center",
    borderRadius: 40,
    overflow: "hidden",
    shadowColor: "#ff4757",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
  endCallGradient: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  overlayInfo: { alignItems: "center", paddingVertical: 12 },
  overlayName: { fontSize: 18, fontWeight: "700", color: "#fff" },
  overlayStatus: { fontSize: 13, marginTop: 2 },
  participantLabel: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  participantLabelText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  wrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#0a0a20",
  },

  initials: { fontSize: 46, fontWeight: "800", color: "#fff" },
  name: { fontSize: 22, fontWeight: "700", color: "#fff" },
});
