// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   TouchableOpacity,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";

// interface Props {
//   visible: boolean;
//   onSend: (uri: string, duration: number) => void;
//   onCancel: () => void;
//   colors: any;
// }

// export default function AudioRecorder({
//   visible,
//   onSend,
//   onCancel,
//   colors,
// }: Props) {
//   const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

//   const [seconds, setSeconds] = useState(0);
//   const [locked, setLocked] = useState(false);
//   const [cancelled, setCancelled] = useState(false);

//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const bars = useRef(
//     Array.from({ length: 30 }, () => new Animated.Value(4))
//   ).current;

//   useEffect(() => {
//     if (visible) startRecording();
//     else stopRecording(false);
//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, [visible]);

//   // Waveform animation
//   useEffect(() => {
//     if (!visible) return;
//     const anims = bars.map((bar, i) =>
//       Animated.loop(
//         Animated.sequence([
//           Animated.delay(i * 40),
//           Animated.timing(bar, {
//             toValue: 4 + Math.random() * 16,
//             duration: 200 + Math.random() * 200,
//             useNativeDriver: false,
//           }),
//           Animated.timing(bar, {
//             toValue: 4,
//             duration: 200,
//             useNativeDriver: false,
//           }),
//         ])
//       )
//     );
//     Animated.parallel(anims).start();
//     return () => anims.forEach((a) => a.stop());
//   }, [visible]);

//   // Pulse animation for mic button
//   useEffect(() => {
//     if (!visible) return;
//     const pulse = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1.15,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//       ])
//     );
//     pulse.start();
//     return () => pulse.stop();
//   }, [visible]);

//   const startRecording = async () => {
//     try {
//       const status = await AudioModule.requestRecordingPermissionsAsync();
//       if (!status.granted) return;

//       await AudioModule.setAudioModeAsync({
//         allowsRecording: true,
//         playsInSilentMode: true,
//       });

//       await audioRecorder.record();

//       setSeconds(0);
//       setCancelled(false);
//       timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
//     } catch (e) {
//       console.warn("Recording start failed", e);
//     }
//   };

//   const stopRecording = async (send: boolean) => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     try {
//       await audioRecorder.stop();
//       if (send && !cancelled) {
//         const uri = audioRecorder.uri;
//         if (uri) onSend(uri, seconds);
//       }
//     } catch {}
//     setSeconds(0);
//     setLocked(false);
//     setCancelled(false);
//   };

//   const fmt = (s: number) =>
//     `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

//   if (!visible) return null;

//   return (
//     <View
//       style={[
//         styles.container,
//         { backgroundColor: colors.surface, borderTopColor: colors.border },
//       ]}
//     >
//       {/* Cancel / delete area */}
//       {!locked ? (
//         <TouchableOpacity
//           style={styles.cancelArea}
//           onPress={() => {
//             setCancelled(true);
//             stopRecording(false);
//             onCancel();
//           }}
//         >
//           <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
//           <Text style={[styles.cancelHint, { color: colors.textMuted }]}>
//             Slide to cancel
//           </Text>
//         </TouchableOpacity>
//       ) : (
//         <TouchableOpacity
//           style={styles.deleteArea}
//           onPress={() => {
//             setCancelled(true);
//             stopRecording(false);
//             onCancel();
//           }}
//         >
//           <Ionicons name="trash-outline" size={20} color="#ff4757" />
//         </TouchableOpacity>
//       )}

//       {/* Waveform + timer */}
//       <View style={styles.waveRow}>
//         <View style={[styles.recDot, { backgroundColor: "#ff4757" }]} />
//         <Text style={[styles.timer, { color: colors.textPrimary }]}>
//           {fmt(seconds)}
//         </Text>
//         <View style={styles.waveform}>
//           {bars.slice(0, 20).map((bar, i) => (
//             <Animated.View
//               key={i}
//               style={[
//                 styles.waveBar,
//                 { height: bar, backgroundColor: "#00d4aa" },
//               ]}
//             />
//           ))}
//         </View>
//       </View>

//       {/* Send button (when locked) or mic button */}
//       {locked ? (
//         <TouchableOpacity
//           style={styles.sendBtn}
//           onPress={() => stopRecording(true)}
//         >
//           <LinearGradient
//             colors={["#00d4aa", "#00b090"]}
//             style={styles.sendGradient}
//           >
//             <Ionicons name="send" size={20} color="#fff" />
//           </LinearGradient>
//         </TouchableOpacity>
//       ) : (
//         <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
//           <TouchableOpacity
//             style={styles.micBtn}
//             onPress={() => stopRecording(true)}
//             delayLongPress={100}
//           >
//             <LinearGradient
//               colors={["#ff4757", "#cc2233"]}
//               style={styles.micGradient}
//             >
//               <Ionicons name="mic" size={24} color="#fff" />
//             </LinearGradient>
//           </TouchableOpacity>
//         </Animated.View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     gap: 12,
//   },
//   cancelArea: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
//   cancelHint: { fontSize: 13 },
//   deleteArea: { flex: 1, paddingLeft: 8 },
//   waveRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
//   recDot: { width: 8, height: 8, borderRadius: 4 },
//   timer: { fontSize: 15, fontWeight: "700", minWidth: 40 },
//   waveform: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 2,
//     height: 30,
//   },
//   waveBar: { width: 3, borderRadius: 2, minHeight: 4 },
//   micBtn: { borderRadius: 26, overflow: "hidden" },
//   micGradient: {
//     width: 52,
//     height: 52,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   sendBtn: { borderRadius: 26, overflow: "hidden" },
//   sendGradient: {
//     width: 52,
//     height: 52,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   TouchableOpacity,
//   Pressable,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   useAudioRecorder,
//   AudioModule,
//   RecordingPresets,
//   useAudioPlayer,
// } from "expo-audio";

// interface Props {
//   visible: boolean;
//   onSend: (uri: string, duration: number) => void;
//   onCancel: () => void;
//   colors: any;
// }

// type Stage = "recording" | "paused" | "preview";

// export default function AudioRecorder({
//   visible,
//   onSend,
//   onCancel,
//   colors,
// }: Props) {
//   const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

//   const [stage, setStage] = useState<Stage>("recording");
//   const [seconds, setSeconds] = useState(0);
//   const [recordedUri, setRecordedUri] = useState<string | null>(null);
//   const [recordedDuration, setRecordedDuration] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [playProgress, setPlayProgress] = useState(0);

//   const player = useAudioPlayer(recordedUri ?? "");

//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const glowAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(80)).current;
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const hasStarted = useRef(false);
//   const bars = useRef(
//     Array.from({ length: 40 }, () => new Animated.Value(4))
//   ).current;
//   const barAnims = useRef<Animated.CompositeAnimation[]>([]);

//   // ── Mount / unmount ────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (visible && !hasStarted.current) {
//       hasStarted.current = true;
//       Animated.spring(slideAnim, {
//         toValue: 0,
//         useNativeDriver: true,
//         tension: 200,
//         friction: 20,
//       }).start();
//       startRecording();
//     } else if (!visible) {
//       hasStarted.current = false;
//       reset();
//     }
//     return () => clearTimers();
//   }, [visible]);

//   // ── Waveform bars ──────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (stage === "recording") {
//       startBars();
//     } else {
//       stopBars();
//     }
//   }, [stage]);

//   // ── Pulse + glow on mic ───────────────────────────────────────────────────
//   useEffect(() => {
//     if (stage === "recording") {
//       const pulse = Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, {
//             toValue: 1.18,
//             duration: 750,
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulseAnim, {
//             toValue: 1,
//             duration: 750,
//             useNativeDriver: true,
//           }),
//         ])
//       );
//       const glow = Animated.loop(
//         Animated.sequence([
//           Animated.timing(glowAnim, {
//             toValue: 1,
//             duration: 900,
//             useNativeDriver: true,
//           }),
//           Animated.timing(glowAnim, {
//             toValue: 0.2,
//             duration: 900,
//             useNativeDriver: true,
//           }),
//         ])
//       );
//       pulse.start();
//       glow.start();
//       return () => {
//         pulse.stop();
//         glow.stop();
//       };
//     } else {
//       pulseAnim.setValue(1);
//       glowAnim.setValue(0);
//     }
//   }, [stage]);

//   // ── Playback progress ─────────────────────────────────────────────────────
//   useEffect(() => {
//     if (isPlaying) {
//       progressRef.current = setInterval(() => {
//         if (player.duration > 0) {
//           setPlayProgress(player.currentTime / player.duration);
//           if (player.currentTime >= player.duration) {
//             setIsPlaying(false);
//             setPlayProgress(0);
//             clearInterval(progressRef.current!);
//           }
//         }
//       }, 100);
//     } else {
//       if (progressRef.current) clearInterval(progressRef.current);
//     }
//     return () => {
//       if (progressRef.current) clearInterval(progressRef.current);
//     };
//   }, [isPlaying]);

//   const clearTimers = () => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     if (progressRef.current) clearInterval(progressRef.current);
//   };

//   const startBars = () => {
//     stopBars();
//     barAnims.current = bars.map((bar, i) =>
//       Animated.loop(
//         Animated.sequence([
//           Animated.delay(i * 30),
//           Animated.timing(bar, {
//             toValue: 4 + Math.random() * 24,
//             duration: 150 + Math.random() * 200,
//             useNativeDriver: false,
//           }),
//           Animated.timing(bar, {
//             toValue: 4 + Math.random() * 8,
//             duration: 150 + Math.random() * 150,
//             useNativeDriver: false,
//           }),
//         ])
//       )
//     );
//     barAnims.current.forEach((a) => a.start());
//   };

//   const stopBars = () => {
//     barAnims.current.forEach((a) => a.stop());
//     bars.forEach((bar) =>
//       Animated.timing(bar, {
//         toValue: 4,
//         duration: 300,
//         useNativeDriver: false,
//       }).start()
//     );
//   };

//   const reset = () => {
//     clearTimers();
//     setStage("recording");
//     setSeconds(0);
//     setRecordedUri(null);
//     setRecordedDuration(0);
//     setIsPlaying(false);
//     setPlayProgress(0);
//     slideAnim.setValue(80);
//   };

//   // ── Recording controls ────────────────────────────────────────────────────
//   const startRecording = async () => {
//     try {
//       const status = await AudioModule.requestRecordingPermissionsAsync();
//       if (!status.granted) return;
//       await AudioModule.setAudioModeAsync({
//         allowsRecording: true,
//         playsInSilentMode: true,
//       });
//       await audioRecorder.record();
//       setStage("recording");
//       setSeconds(0);
//       timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
//     } catch (e) {
//       console.warn("Recording failed", e);
//     }
//   };

//   const handlePause = async () => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     try {
//       await audioRecorder.pause();
//       setStage("paused");
//     } catch {}
//   };

//   const handleResume = async () => {
//     try {
//       await audioRecorder.record();
//       setStage("recording");
//       timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
//     } catch {}
//   };

//   const handleStop = async () => {
//     clearTimers();
//     try {
//       await audioRecorder.stop();
//       const uri = audioRecorder.uri;
//       setRecordedUri(uri);
//       setRecordedDuration(seconds);
//       setStage("preview");
//     } catch {}
//   };

//   // ── Playback ──────────────────────────────────────────────────────────────
//   const handlePlayPause = async () => {
//     if (!recordedUri) return;
//     if (isPlaying) {
//       player.pause();
//       setIsPlaying(false);
//     } else {
//       if (playProgress >= 1) {
//         player.seekTo(0);
//         setPlayProgress(0);
//       }
//       player.play();
//       setIsPlaying(true);
//     }
//   };

//   const handleDelete = () => {
//     if (isPlaying) {
//       player.pause();
//       setIsPlaying(false);
//     }
//     reset();
//     onCancel();
//   };

//   const handleSend = () => {
//     if (recordedUri) onSend(recordedUri, recordedDuration);
//     reset();
//   };

//   const fmt = (s: number) =>
//     `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

//   if (!visible) return null;

//   const isRecording = stage === "recording";
//   const isPaused = stage === "paused";
//   const isPreview = stage === "preview";

//   return (
//     <Animated.View
//       style={[
//         styles.wrapper,
//         {
//           backgroundColor: colors.surface,
//           borderTopColor: colors.border,
//           transform: [{ translateY: slideAnim }],
//         },
//       ]}
//     >
//       {/* ── RECORDING / PAUSED STAGE ───────────────────────────────────── */}
//       {!isPreview && (
//         <>
//           {/* Top row: status + timer */}
//           <View style={styles.topRow}>
//             <View style={styles.statusChip}>
//               {isRecording && (
//                 <Animated.View
//                   style={[
//                     styles.recDot,
//                     {
//                       opacity: glowAnim,
//                       shadowColor: "#ff4757",
//                       shadowOpacity: 1,
//                       shadowRadius: 6,
//                       elevation: 4,
//                     },
//                   ]}
//                 />
//               )}
//               {isPaused && (
//                 <View
//                   style={[
//                     styles.recDot,
//                     { backgroundColor: "#ffc107", shadowColor: "#ffc107" },
//                   ]}
//                 />
//               )}
//               <Text
//                 style={[
//                   styles.statusLabel,
//                   { color: isRecording ? "#ff4757" : "#ffc107" },
//                 ]}
//               >
//                 {isRecording ? "Recording" : "Paused"}
//               </Text>
//             </View>
//             <Text style={[styles.timer, { color: colors.textPrimary }]}>
//               {fmt(seconds)}
//             </Text>
//           </View>

//           {/* Waveform */}
//           <View style={styles.waveform}>
//             {bars.map((bar, i) => (
//               <Animated.View
//                 key={i}
//                 style={[
//                   styles.waveBar,
//                   {
//                     height: bar,
//                     backgroundColor: isRecording
//                       ? `rgba(0,212,170,${0.4 + (i % 3) * 0.2})`
//                       : `rgba(255,193,7,0.3)`,
//                   },
//                 ]}
//               />
//             ))}
//           </View>

//           {/* Controls */}
//           <View style={styles.controls}>
//             {/* Cancel */}
//             <TouchableOpacity
//               style={[styles.iconBtn, { backgroundColor: colors.surface2 }]}
//               onPress={handleDelete}
//             >
//               <Ionicons name="close" size={20} color="#ff4757" />
//             </TouchableOpacity>

//             {/* Pause / Resume — centre */}
//             <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
//               <TouchableOpacity
//                 onPress={isRecording ? handlePause : handleResume}
//                 activeOpacity={0.85}
//               >
//                 <LinearGradient
//                   colors={
//                     isRecording
//                       ? ["#ff4757", "#cc2233"]
//                       : ["#ffc107", "#ff9800"]
//                   }
//                   style={styles.mainBtn}
//                 >
//                   <Ionicons
//                     name={isRecording ? "pause" : "mic"}
//                     size={28}
//                     color="#fff"
//                   />
//                 </LinearGradient>
//               </TouchableOpacity>
//             </Animated.View>

//             {/* Stop → go to preview */}
//             <TouchableOpacity
//               style={[styles.iconBtn, { backgroundColor: colors.surface2 }]}
//               onPress={handleStop}
//             >
//               <View style={styles.stopSquare} />
//             </TouchableOpacity>
//           </View>

//           <Text style={[styles.hint, { color: colors.textMuted }]}>
//             {isRecording
//               ? "Tap ❚❚ to pause · ■ to finish"
//               : "Tap mic to resume · ■ to finish"}
//           </Text>
//         </>
//       )}

//       {/* ── PREVIEW STAGE ─────────────────────────────────────────────── */}
//       {isPreview && (
//         <>
//           {/* Header */}
//           <View style={styles.topRow}>
//             <View style={styles.statusChip}>
//               <Ionicons
//                 name="checkmark-circle"
//                 size={14}
//                 color="#00d4aa"
//                 style={{ marginRight: 4 }}
//               />
//               <Text style={[styles.statusLabel, { color: "#00d4aa" }]}>
//                 Voice note
//               </Text>
//             </View>
//             <Text style={[styles.timer, { color: colors.textPrimary }]}>
//               {fmt(recordedDuration)}
//             </Text>
//           </View>

//           {/* Playback bar */}
//           <View style={styles.playbackRow}>
//             {/* Play / Pause */}
//             <TouchableOpacity
//               style={styles.playBtn}
//               onPress={handlePlayPause}
//               activeOpacity={0.85}
//             >
//               <LinearGradient
//                 colors={["#00d4aa", "#00b090"]}
//                 style={styles.playBtnGradient}
//               >
//                 <Ionicons
//                   name={isPlaying ? "pause" : "play"}
//                   size={22}
//                   color="#fff"
//                 />
//               </LinearGradient>
//             </TouchableOpacity>

//             {/* Progress track */}
//             <View style={styles.progressTrack}>
//               <View
//                 style={[
//                   styles.progressFill,
//                   { width: `${playProgress * 100}%` },
//                 ]}
//               />
//               {/* Waveform static bars behind progress */}
//               <View style={StyleSheet.absoluteFillObject}>
//                 <View style={styles.staticWave}>
//                   {Array.from({ length: 30 }).map((_, i) => (
//                     <View
//                       key={i}
//                       style={[
//                         styles.staticBar,
//                         {
//                           height: 4 + Math.abs(Math.sin(i * 0.6)) * 16,
//                           backgroundColor:
//                             i / 30 <= playProgress ? "#00d4aa" : colors.border,
//                         },
//                       ]}
//                     />
//                   ))}
//                 </View>
//               </View>
//             </View>

//             {/* Current time */}
//             <Text style={[styles.playTime, { color: colors.textMuted }]}>
//               {fmt(Math.round(playProgress * recordedDuration))}
//             </Text>
//           </View>

//           {/* Action buttons */}
//           <View style={styles.previewActions}>
//             {/* Delete */}
//             <TouchableOpacity
//               style={[
//                 styles.actionBtn,
//                 {
//                   backgroundColor: "rgba(255,71,87,0.1)",
//                   borderColor: "#ff4757",
//                 },
//               ]}
//               onPress={handleDelete}
//               activeOpacity={0.8}
//             >
//               <Ionicons name="trash-outline" size={18} color="#ff4757" />
//               <Text style={[styles.actionLabel, { color: "#ff4757" }]}>
//                 Delete
//               </Text>
//             </TouchableOpacity>

//             {/* Re-record */}
//             <TouchableOpacity
//               style={[
//                 styles.actionBtn,
//                 {
//                   backgroundColor: colors.surface2,
//                   borderColor: colors.border,
//                 },
//               ]}
//               onPress={() => {
//                 if (isPlaying) {
//                   player.pause();
//                   setIsPlaying(false);
//                 }
//                 reset();
//                 hasStarted.current = true;
//                 startRecording();
//               }}
//               activeOpacity={0.8}
//             >
//               <Ionicons
//                 name="mic-outline"
//                 size={18}
//                 color={colors.textSecondary}
//               />
//               <Text
//                 style={[styles.actionLabel, { color: colors.textSecondary }]}
//               >
//                 Re-record
//               </Text>
//             </TouchableOpacity>

//             {/* Send */}
//             <TouchableOpacity
//               style={styles.sendBtn}
//               onPress={handleSend}
//               activeOpacity={0.85}
//             >
//               <LinearGradient
//                 colors={["#00d4aa", "#00b090"]}
//                 style={styles.sendGradient}
//               >
//                 <Ionicons name="send" size={18} color="#fff" />
//                 <Text style={styles.sendLabel}>Send</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </>
//       )}
//     </Animated.View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     borderTopWidth: 1,
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     paddingBottom: 24,
//     gap: 16,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 12,
//     elevation: 10,
//   },
//   topRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   statusChip: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 99,
//     backgroundColor: "rgba(255,255,255,0.05)",
//   },
//   recDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: "#ff4757",
//   },
//   statusLabel: {
//     fontSize: 12,
//     fontWeight: "700",
//     letterSpacing: 0.5,
//     textTransform: "uppercase",
//   },
//   timer: {
//     fontSize: 22,
//     fontWeight: "900",
//     letterSpacing: -0.5,
//     fontVariant: ["tabular-nums"],
//   },
//   waveform: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 3,
//     height: 48,
//     paddingHorizontal: 4,
//   },
//   waveBar: {
//     flex: 1,
//     borderRadius: 3,
//     minHeight: 4,
//     maxHeight: 44,
//   },
//   controls: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 24,
//     marginTop: 4,
//   },
//   iconBtn: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   mainBtn: {
//     width: 68,
//     height: 68,
//     borderRadius: 34,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#ff4757",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.45,
//     shadowRadius: 14,
//     elevation: 10,
//   },
//   stopSquare: {
//     width: 16,
//     height: 16,
//     borderRadius: 3,
//     backgroundColor: (colors) => colors,
//     // overridden inline
//   },
//   hint: {
//     fontSize: 11,
//     textAlign: "center",
//     letterSpacing: 0.3,
//   },
//   // Preview
//   playbackRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   playBtn: {
//     borderRadius: 24,
//     overflow: "hidden",
//     flexShrink: 0,
//   },
//   playBtnGradient: {
//     width: 48,
//     height: 48,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   progressTrack: {
//     flex: 1,
//     height: 36,
//     borderRadius: 8,
//     overflow: "hidden",
//     backgroundColor: "rgba(255,255,255,0.04)",
//     position: "relative",
//   },
//   progressFill: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,212,170,0.08)",
//     zIndex: 1,
//   },
//   staticWave: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-around",
//     paddingHorizontal: 6,
//     height: "100%",
//   },
//   staticBar: {
//     width: 3,
//     borderRadius: 2,
//   },
//   playTime: {
//     fontSize: 12,
//     fontWeight: "600",
//     minWidth: 36,
//     textAlign: "right",
//     fontVariant: ["tabular-nums"],
//   },
//   previewActions: {
//     flexDirection: "row",
//     gap: 10,
//     marginTop: 4,
//   },
//   actionBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 12,
//     borderRadius: 14,
//     borderWidth: 1.5,
//   },
//   actionLabel: {
//     fontSize: 13,
//     fontWeight: "700",
//   },
//   sendBtn: {
//     flex: 1.4,
//     borderRadius: 14,
//     overflow: "hidden",
//   },
//   sendGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 7,
//     paddingVertical: 13,
//   },
//   sendLabel: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "800",
//   },
// });

// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   TouchableOpacity,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   useAudioRecorder,
//   AudioModule,
//   RecordingPresets,
//   useAudioPlayer,
// } from "expo-audio";

// interface Props {
//   visible: boolean;
//   onSend: (uri: string, duration: number) => void;
//   onCancel: () => void;
//   colors: any;
// }

// export default function AudioRecorder({
//   visible,
//   onSend,
//   onCancel,
//   colors,
// }: Props) {
//   const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
//   const [stage, setStage] = useState<"recording" | "preview">("recording");
//   const [seconds, setSeconds] = useState(0);
//   const [recordedUri, setRecordedUri] = useState<string | null>(null);
//   const [savedDuration, setSavedDuration] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [playProgress, setPlayProgress] = useState(0);

//   const player = useAudioPlayer(recordedUri ?? "");

//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const hasStarted = useRef(false);
//   const bars = useRef(
//     Array.from({ length: 28 }, () => new Animated.Value(4))
//   ).current;
//   const barAnims = useRef<Animated.CompositeAnimation[]>([]);

//   // ── Start / stop based on visibility ──────────────────────────────────────
//   useEffect(() => {
//     if (visible && !hasStarted.current) {
//       hasStarted.current = true;
//       startRecording();
//     } else if (!visible) {
//       hasStarted.current = false;
//       cleanup();
//     }
//     return () => clearAllTimers();
//   }, [visible]);

//   // ── Waveform ───────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (stage === "recording") {
//       barAnims.current = bars.map((bar, i) =>
//         Animated.loop(
//           Animated.sequence([
//             Animated.delay(i * 35),
//             Animated.timing(bar, {
//               toValue: 4 + Math.random() * 22,
//               duration: 180 + Math.random() * 180,
//               useNativeDriver: false,
//             }),
//             Animated.timing(bar, {
//               toValue: 4,
//               duration: 160,
//               useNativeDriver: false,
//             }),
//           ])
//         )
//       );
//       barAnims.current.forEach((a) => a.start());
//     } else {
//       barAnims.current.forEach((a) => a.stop());
//       bars.forEach((b) =>
//         Animated.timing(b, {
//           toValue: 4,
//           duration: 250,
//           useNativeDriver: false,
//         }).start()
//       );
//     }
//   }, [stage]);

//   // ── Pulse mic button ───────────────────────────────────────────────────────
//   useEffect(() => {
//     if (stage !== "recording") {
//       pulseAnim.setValue(1);
//       return;
//     }
//     const anim = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1.15,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//       ])
//     );
//     anim.start();
//     return () => anim.stop();
//   }, [stage]);

//   // ── Playback progress ──────────────────────────────────────────────────────
//   useEffect(() => {
//     if (isPlaying) {
//       progressRef.current = setInterval(() => {
//         if (player.duration > 0) {
//           const p = player.currentTime / player.duration;
//           setPlayProgress(p);
//           if (p >= 1) {
//             setIsPlaying(false);
//             setPlayProgress(0);
//           }
//         }
//       }, 80);
//     } else {
//       if (progressRef.current) clearInterval(progressRef.current);
//     }
//     return () => {
//       if (progressRef.current) clearInterval(progressRef.current);
//     };
//   }, [isPlaying]);

//   const clearAllTimers = () => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     if (progressRef.current) clearInterval(progressRef.current);
//   };

//   const cleanup = () => {
//     clearAllTimers();
//     setStage("recording");
//     setSeconds(0);
//     setRecordedUri(null);
//     setSavedDuration(0);
//     setIsPlaying(false);
//     setPlayProgress(0);
//   };

//   const startRecording = async () => {
//     try {
//       const status = await AudioModule.requestRecordingPermissionsAsync();
//       if (!status.granted) return;
//       await AudioModule.setAudioModeAsync({
//         allowsRecording: true,
//         playsInSilentMode: true,
//       });
//       await audioRecorder.record();
//       setSeconds(0);
//       timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
//     } catch (e) {
//       console.warn("Recording failed", e);
//     }
//   };

//   const handleStop = async () => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     try {
//       await audioRecorder.stop();
//       setRecordedUri(audioRecorder.uri);
//       setSavedDuration(seconds);
//       setStage("preview");
//     } catch {}
//   };

//   const handlePlayPause = () => {
//     if (!recordedUri) return;
//     if (isPlaying) {
//       player.pause();
//       setIsPlaying(false);
//     } else {
//       if (playProgress >= 1) {
//         player.seekTo(0);
//         setPlayProgress(0);
//       }
//       player.play();
//       setIsPlaying(true);
//     }
//   };

//   const handleDelete = () => {
//     if (isPlaying) {
//       player.pause();
//       setIsPlaying(false);
//     }
//     cleanup();
//     onCancel();
//   };

//   const handleSend = () => {
//     if (recordedUri) onSend(recordedUri, savedDuration);
//     cleanup();
//   };

//   const fmt = (s: number) =>
//     `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

//   if (!visible) return null;

//   // ── RECORDING UI ───────────────────────────────────────────────────────────
//   if (stage === "recording") {
//     return (
//       <View
//         style={[
//           styles.container,
//           { backgroundColor: colors.surface, borderTopColor: colors.border },
//         ]}
//       >
//         {/* Cancel */}
//         <TouchableOpacity onPress={handleDelete} style={styles.sideBtn}>
//           <Ionicons name="trash-outline" size={22} color="#ff4757" />
//         </TouchableOpacity>

//         {/* Waveform + timer */}
//         <View style={styles.middle}>
//           <View style={styles.waveform}>
//             {bars.map((bar, i) => (
//               <Animated.View key={i} style={[styles.bar, { height: bar }]} />
//             ))}
//           </View>
//           <Text style={[styles.timer, { color: colors.textPrimary }]}>
//             {fmt(seconds)}
//           </Text>
//         </View>

//         {/* Stop */}
//         <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
//           <TouchableOpacity onPress={handleStop} activeOpacity={0.85}>
//             <LinearGradient
//               colors={["#ff4757", "#cc2233"]}
//               style={styles.mainBtn}
//             >
//               <View style={styles.stopSquare} />
//             </LinearGradient>
//           </TouchableOpacity>
//         </Animated.View>
//       </View>
//     );
//   }

//   // ── PREVIEW UI ─────────────────────────────────────────────────────────────
//   return (
//     <View
//       style={[
//         styles.container,
//         { backgroundColor: colors.surface, borderTopColor: colors.border },
//       ]}
//     >
//       {/* Delete */}
//       <TouchableOpacity onPress={handleDelete} style={styles.sideBtn}>
//         <Ionicons name="trash-outline" size={22} color="#ff4757" />
//       </TouchableOpacity>

//       {/* Player */}
//       <View style={styles.middle}>
//         {/* Progress track */}
//         <View
//           style={[styles.progressTrack, { backgroundColor: colors.border }]}
//         >
//           <View
//             style={[styles.progressFill, { width: `${playProgress * 100}%` }]}
//           />
//         </View>
//         {/* Duration */}
//         <Text style={[styles.timer, { color: colors.textPrimary }]}>
//           {fmt(
//             isPlaying ? Math.round(playProgress * savedDuration) : savedDuration
//           )}
//         </Text>
//       </View>

//       {/* Play / Pause */}
//       <TouchableOpacity onPress={handlePlayPause} activeOpacity={0.85}>
//         <LinearGradient colors={["#00d4aa", "#00b090"]} style={styles.mainBtn}>
//           <Ionicons
//             name={isPlaying ? "pause" : "play"}
//             size={22}
//             color="#fff"
//           />
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* Send */}
//       <TouchableOpacity onPress={handleSend} activeOpacity={0.85}>
//         <LinearGradient colors={["#5b8dee", "#3a6bc9"]} style={styles.mainBtn}>
//           <Ionicons name="send" size={20} color="#fff" />
//         </LinearGradient>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderTopWidth: 1,
//     gap: 12,
//   },
//   sideBtn: {
//     width: 40,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   middle: {
//     flex: 1,
//     gap: 6,
//   },
//   waveform: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 2.5,
//     height: 36,
//   },
//   bar: {
//     flex: 1,
//     borderRadius: 3,
//     backgroundColor: "#00d4aa",
//     minHeight: 4,
//     maxHeight: 36,
//     opacity: 0.85,
//   },
//   timer: {
//     fontSize: 13,
//     fontWeight: "700",
//     letterSpacing: 0.5,
//   },
//   progressTrack: {
//     height: 4,
//     borderRadius: 2,
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: "100%",
//     backgroundColor: "#00d4aa",
//     borderRadius: 2,
//   },
//   mainBtn: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   stopSquare: {
//     width: 14,
//     height: 14,
//     borderRadius: 2,
//     backgroundColor: "#fff",
//   },
// });

// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   TouchableOpacity,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   useAudioRecorder,
//   AudioModule,
//   RecordingPresets,
//   useAudioPlayer,
// } from "expo-audio";

// interface Props {
//   visible: boolean;
//   onSend: (uri: string, duration: number) => void;
//   onCancel: () => void;
//   colors: any;
// }

// type Stage = "idle" | "recording" | "paused";

// export default function AudioRecorder({
//   visible,
//   onSend,
//   onCancel,
//   colors,
// }: Props) {
//   const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

//   // ── State ──────────────────────────────────────────────────────────────────
//   const [stage, setStage] = useState<Stage>("idle");
//   const [seconds, setSeconds] = useState(0);
//   const [recordedUri, setRecordedUri] = useState<string | null>(null);
//   const [savedDuration, setSavedDuration] = useState(0);
//   const [isPlayingPreview, setIsPlayingPreview] = useState(false);
//   const [playProgress, setPlayProgress] = useState(0);

//   // ── Refs ───────────────────────────────────────────────────────────────────
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const hasStarted = useRef(false);
//   const bars = useRef(
//     Array.from({ length: 28 }, () => new Animated.Value(4))
//   ).current;
//   const barAnims = useRef<Animated.CompositeAnimation[]>([]);

//   // Preview player — only active when we have a paused URI
//   const player = useAudioPlayer(recordedUri ?? "");

//   // ── Lifecycle ──────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (visible && !hasStarted.current) {
//       hasStarted.current = true;
//       startRecording();
//     } else if (!visible) {
//       hasStarted.current = false;
//       cleanup();
//     }
//     return () => clearAllTimers();
//   }, [visible]);

//   // ── Waveform animation ─────────────────────────────────────────────────────
//   useEffect(() => {
//     if (stage === "recording") {
//       barAnims.current = bars.map((bar, i) =>
//         Animated.loop(
//           Animated.sequence([
//             Animated.delay(i * 35),
//             Animated.timing(bar, {
//               toValue: 4 + Math.random() * 22,
//               duration: 180 + Math.random() * 180,
//               useNativeDriver: false,
//             }),
//             Animated.timing(bar, {
//               toValue: 4,
//               duration: 160,
//               useNativeDriver: false,
//             }),
//           ])
//         )
//       );
//       barAnims.current.forEach((a) => a.start());
//     } else {
//       // Freeze waveform when paused or idle
//       barAnims.current.forEach((a) => a.stop());
//       bars.forEach((b) =>
//         Animated.timing(b, {
//           toValue: 4,
//           duration: 250,
//           useNativeDriver: false,
//         }).start()
//       );
//     }
//   }, [stage]);

//   // ── Pulse the mic/record button ────────────────────────────────────────────
//   useEffect(() => {
//     if (stage !== "recording") {
//       pulseAnim.setValue(1);
//       return;
//     }
//     const anim = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1.15,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//       ])
//     );
//     anim.start();
//     return () => anim.stop();
//   }, [stage]);

//   // ── Playback progress tracker ──────────────────────────────────────────────
//   useEffect(() => {
//     if (isPlayingPreview) {
//       progressRef.current = setInterval(() => {
//         if (player.duration > 0) {
//           const p = player.currentTime / player.duration;
//           setPlayProgress(p);
//           if (p >= 1) {
//             setIsPlayingPreview(false);
//             setPlayProgress(0);
//           }
//         }
//       }, 80);
//     } else {
//       if (progressRef.current) clearInterval(progressRef.current);
//     }
//     return () => {
//       if (progressRef.current) clearInterval(progressRef.current);
//     };
//   }, [isPlayingPreview]);

//   // ── Helpers ────────────────────────────────────────────────────────────────
//   const clearAllTimers = () => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     if (progressRef.current) clearInterval(progressRef.current);
//   };

//   const cleanup = () => {
//     clearAllTimers();
//     setStage("idle");
//     setSeconds(0);
//     setRecordedUri(null);
//     setSavedDuration(0);
//     setIsPlayingPreview(false);
//     setPlayProgress(0);
//   };

//   const fmt = (s: number) =>
//     `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

//   // ── Actions ────────────────────────────────────────────────────────────────
//   const startRecording = async () => {
//     try {
//       const status = await AudioModule.requestRecordingPermissionsAsync();
//       if (!status.granted) return;
//       await AudioModule.setAudioModeAsync({
//         allowsRecording: true,
//         playsInSilentMode: true,
//       });
//       await audioRecorder.record();
//       setStage("recording");
//       setSeconds(0);
//       timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
//     } catch (e) {
//       console.warn("Recording failed", e);
//     }
//   };

//   /** Pause the recording; snapshot URI so we can preview it */
//   const handlePause = async () => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     try {
//       await audioRecorder.stop();
//       const uri = audioRecorder.uri;
//       setRecordedUri(uri ?? null);
//       setSavedDuration(seconds);
//       setStage("paused");
//     } catch (e) {
//       console.warn("Pause failed", e);
//     }
//   };

//   /** Resume: start a fresh recording segment (appending isn't natively
//    *  supported by expo-audio, so we keep the latest segment and accumulate
//    *  duration — adjust if your backend merges segments). */
//   const handleResume = async () => {
//     // Stop any preview playback first
//     if (isPlayingPreview) {
//       player.pause();
//       setIsPlayingPreview(false);
//       setPlayProgress(0);
//     }
//     try {
//       await audioRecorder.record();
//       setStage("recording");
//       timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
//     } catch (e) {
//       console.warn("Resume failed", e);
//     }
//   };

//   /** Play / pause the paused preview */
//   const handlePlayPause = () => {
//     if (!recordedUri) return;
//     if (isPlayingPreview) {
//       player.pause();
//       setIsPlayingPreview(false);
//     } else {
//       if (playProgress >= 1) {
//         player.seekTo(0);
//         setPlayProgress(0);
//       }
//       player.play();
//       setIsPlayingPreview(true);
//     }
//   };

//   const handleDelete = async () => {
//     if (isPlayingPreview) {
//       player.pause();
//       setIsPlayingPreview(false);
//     }
//     try {
//       // Stop the recorder if it's still running
//       if (stage === "recording") await audioRecorder.stop();
//     } catch {}
//     cleanup();
//     onCancel();
//   };

//   const handleSend = async () => {
//     if (isPlayingPreview) {
//       player.pause();
//       setIsPlayingPreview(false);
//     }
//     // If the user hits send while still recording, stop first
//     if (stage === "recording") {
//       if (timerRef.current) clearInterval(timerRef.current);
//       try {
//         await audioRecorder.stop();
//         const uri = audioRecorder.uri;
//         if (uri) onSend(uri, seconds);
//       } catch {}
//     } else if (recordedUri) {
//       onSend(recordedUri, savedDuration);
//     }
//     cleanup();
//   };

//   if (!visible) return null;

//   // ── RECORDING UI ───────────────────────────────────────────────────────────
//   if (stage === "recording") {
//     return (
//       <View
//         style={[
//           styles.container,
//           { backgroundColor: colors.surface, borderTopColor: colors.border },
//         ]}
//       >
//         {/* Delete */}
//         <TouchableOpacity onPress={handleDelete} style={styles.sideBtn}>
//           <Ionicons name="trash-outline" size={22} color="#ff4757" />
//         </TouchableOpacity>

//         {/* Waveform + timer */}
//         <View style={styles.middle}>
//           <View style={styles.waveform}>
//             {bars.map((bar, i) => (
//               <Animated.View key={i} style={[styles.bar, { height: bar }]} />
//             ))}
//           </View>
//           <Text style={[styles.timer, { color: colors.textPrimary }]}>
//             {fmt(seconds)}
//           </Text>
//         </View>

//         {/* Pause recording */}
//         <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
//           <TouchableOpacity onPress={handlePause} activeOpacity={0.85}>
//             <LinearGradient
//               colors={["#ff4757", "#cc2233"]}
//               style={styles.mainBtn}
//             >
//               <Ionicons name="pause" size={22} color="#fff" />
//             </LinearGradient>
//           </TouchableOpacity>
//         </Animated.View>

//         {/* Send (while recording) */}
//         <TouchableOpacity onPress={handleSend} activeOpacity={0.85}>
//           <LinearGradient
//             colors={["#5b8dee", "#3a6bc9"]}
//             style={styles.mainBtn}
//           >
//             <Ionicons name="send" size={20} color="#fff" />
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // ── PAUSED UI ──────────────────────────────────────────────────────────────
//   // Shows: delete | progress+timer | play-preview | resume-record | send
//   return (
//     <View
//       style={[
//         styles.container,
//         { backgroundColor: colors.surface, borderTopColor: colors.border },
//       ]}
//     >
//       {/* Delete */}
//       <TouchableOpacity onPress={handleDelete} style={styles.sideBtn}>
//         <Ionicons name="trash-outline" size={22} color="#ff4757" />
//       </TouchableOpacity>

//       {/* Progress track + timer */}
//       <View style={styles.middle}>
//         <View
//           style={[styles.progressTrack, { backgroundColor: colors.border }]}
//         >
//           <View
//             style={[styles.progressFill, { width: `${playProgress * 100}%` }]}
//           />
//         </View>
//         <Text style={[styles.timer, { color: colors.textPrimary }]}>
//           {fmt(
//             isPlayingPreview
//               ? Math.round(playProgress * savedDuration)
//               : savedDuration
//           )}
//         </Text>
//       </View>

//       {/* Play / Pause preview */}
//       <TouchableOpacity onPress={handlePlayPause} activeOpacity={0.85}>
//         <LinearGradient colors={["#00d4aa", "#00b090"]} style={styles.mainBtn}>
//           <Ionicons
//             name={isPlayingPreview ? "pause" : "play"}
//             size={22}
//             color="#fff"
//           />
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* Resume recording (mic button) */}
//       <TouchableOpacity onPress={handleResume} activeOpacity={0.85}>
//         <LinearGradient colors={["#ff4757", "#cc2233"]} style={styles.mainBtn}>
//           <Ionicons name="mic" size={22} color="#fff" />
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* Send */}
//       <TouchableOpacity onPress={handleSend} activeOpacity={0.85}>
//         <LinearGradient colors={["#5b8dee", "#3a6bc9"]} style={styles.mainBtn}>
//           <Ionicons name="send" size={20} color="#fff" />
//         </LinearGradient>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderTopWidth: 1,
//     gap: 12,
//   },
//   sideBtn: {
//     width: 40,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   middle: {
//     flex: 1,
//     gap: 6,
//   },
//   waveform: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 2.5,
//     height: 36,
//   },
//   bar: {
//     flex: 1,
//     borderRadius: 3,
//     backgroundColor: "#00d4aa",
//     minHeight: 4,
//     maxHeight: 36,
//     opacity: 0.85,
//   },
//   timer: {
//     fontSize: 13,
//     fontWeight: "700",
//     letterSpacing: 0.5,
//   },
//   progressTrack: {
//     height: 4,
//     borderRadius: 2,
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: "100%",
//     backgroundColor: "#00d4aa",
//     borderRadius: 2,
//   },
//   mainBtn: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   stopSquare: {
//     width: 14,
//     height: 14,
//     borderRadius: 2,
//     backgroundColor: "#fff",
//   },
// });

// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   TouchableOpacity,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   useAudioRecorder,
//   useAudioPlayer,
//   useAudioPlayerStatus,
//   AudioModule,
//   RecordingPresets,
// } from "expo-audio";

// interface Props {
//   visible: boolean;
//   onSend: (uri: string, duration: number) => void;
//   onCancel: () => void;
//   colors: any;
// }

// type Stage = "idle" | "recording" | "paused";

// export default function AudioRecorder({
//   visible,
//   onSend,
//   onCancel,
//   colors,
// }: Props) {
//   const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

//   // ── State ──────────────────────────────────────────────────────────────────
//   const [stage, setStage] = useState<Stage>("idle");
//   const [elapsed, setElapsed] = useState(0); // whole seconds
//   const [recordedUri, setRecordedUri] = useState<string | null>(null);
//   const [savedDuration, setSavedDuration] = useState(0); // seconds at pause point

//   // ── Audio player (always mounted; source swapped via replace()) ────────────
//   // We init with null — replace() is called once we have a URI after pausing.
//   const player = useAudioPlayer(null);
//   const playerStatus = useAudioPlayerStatus(player);

//   // Derived playback state directly from the native player status
//   const isPlayingPreview = playerStatus.playing;
//   const playProgress =
//     playerStatus.duration > 0
//       ? playerStatus.currentTime / playerStatus.duration
//       : 0;

//   // ── Refs ───────────────────────────────────────────────────────────────────
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const hasStarted = useRef(false);
//   const bars = useRef(
//     Array.from({ length: 28 }, () => new Animated.Value(4))
//   ).current;
//   const barAnims = useRef<Animated.CompositeAnimation[]>([]);

//   // ── Lifecycle ──────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (visible && !hasStarted.current) {
//       hasStarted.current = true;
//       startRecording();
//     } else if (!visible) {
//       hasStarted.current = false;
//       cleanup();
//     }
//     return () => stopTimer();
//   }, [visible]);

//   // ── Waveform animation ─────────────────────────────────────────────────────
//   useEffect(() => {
//     if (stage === "recording") {
//       barAnims.current = bars.map((bar, i) =>
//         Animated.loop(
//           Animated.sequence([
//             Animated.delay(i * 35),
//             Animated.timing(bar, {
//               toValue: 4 + Math.random() * 22,
//               duration: 180 + Math.random() * 180,
//               useNativeDriver: false,
//             }),
//             Animated.timing(bar, {
//               toValue: 4,
//               duration: 160,
//               useNativeDriver: false,
//             }),
//           ])
//         )
//       );
//       barAnims.current.forEach((a) => a.start());
//     } else {
//       barAnims.current.forEach((a) => a.stop());
//       bars.forEach((b) =>
//         Animated.timing(b, {
//           toValue: 4,
//           duration: 250,
//           useNativeDriver: false,
//         }).start()
//       );
//     }
//   }, [stage]);

//   // ── Pulse the pause button while recording ─────────────────────────────────
//   useEffect(() => {
//     if (stage !== "recording") {
//       pulseAnim.setValue(1);
//       return;
//     }
//     const anim = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1.15,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//       ])
//     );
//     anim.start();
//     return () => anim.stop();
//   }, [stage]);

//   // ── Helpers ────────────────────────────────────────────────────────────────
//   const stopTimer = () => {
//     if (intervalRef.current !== null) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//   };

//   const startTimer = () => {
//     intervalRef.current = setInterval(() => {
//       setElapsed((s) => s + 1);
//     }, 1000);
//   };

//   const cleanup = () => {
//     stopTimer();
//     try {
//       player.pause();
//     } catch {}
//     setStage("idle");
//     setElapsed(0);
//     setRecordedUri(null);
//     setSavedDuration(0);
//   };

//   /** Format seconds → M:SS */
//   const fmt = (s: number) => {
//     const m = Math.floor(s / 60);
//     const sec = s % 60;
//     return `${m}:${String(sec).padStart(2, "0")}`;
//   };

//   // ── Actions ────────────────────────────────────────────────────────────────
//   const startRecording = async () => {
//     try {
//       const status = await AudioModule.requestRecordingPermissionsAsync();
//       if (!status.granted) return;
//       await AudioModule.setAudioModeAsync({
//         allowsRecording: true,
//         playsInSilentMode: true,
//       });
//       await audioRecorder.record();
//       setElapsed(0);
//       setStage("recording");
//       startTimer();
//     } catch (e) {
//       console.warn("Recording failed", e);
//     }
//   };

//   /** Pause recording — uses native pause() so the file stays open/appendable */
//   const handlePause = async () => {
//     stopTimer();
//     try {
//       audioRecorder.pause();
//       const uri = audioRecorder.uri;

//       if (uri) {
//         await AudioModule.setAudioModeAsync({
//           allowsRecording: false,
//           playsInSilentMode: true,
//         });
//         player.replace({ uri });
//         setRecordedUri(uri);
//       }

//       setSavedDuration(elapsed);
//       setStage("paused");
//     } catch (e) {
//       console.warn("Pause failed", e);
//     }
//   };

//   /** Resume recording */
//   const handleResume = async () => {
//     // Stop preview if playing
//     try {
//       player.pause();
//     } catch {}

//     try {
//       // Switch audio mode back to recording
//       await AudioModule.setAudioModeAsync({
//         allowsRecording: true,
//         playsInSilentMode: true,
//       });
//       audioRecorder.record(); // resumes from where it was paused (native)
//       setStage("recording");
//       startTimer(); // elapsed state already holds accumulated seconds
//     } catch (e) {
//       console.warn("Resume failed", e);
//     }
//   };

//   /** Play / pause the preview while recording is paused */
//   const handlePlayPause = async () => {
//     if (!recordedUri) return;
//     if (isPlayingPreview) {
//       player.pause();
//     } else {
//       // If finished, seek back to start
//       if (playProgress >= 0.99) {
//         await player.seekTo(0);
//       }
//       player.play();
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       player.pause();
//     } catch {}
//     try {
//       if (stage === "recording") await audioRecorder.stop();
//       else if (stage === "paused") await audioRecorder.stop();
//     } catch {}
//     cleanup();
//     onCancel();
//   };

//   const handleSend = async () => {
//     try {
//       player.pause();
//     } catch {}

//     if (stage === "recording") {
//       stopTimer();
//       try {
//         await audioRecorder.stop();
//         const uri = audioRecorder.uri;
//         if (uri) onSend(uri, elapsed);
//       } catch {}
//     } else if (recordedUri) {
//       try {
//         await audioRecorder.stop();
//       } catch {}
//       onSend(recordedUri, savedDuration);
//     }
//     cleanup();
//   };

//   if (!visible) return null;

//   // ── RECORDING UI ───────────────────────────────────────────────────────────
//   if (stage === "recording") {
//     return (
//       <View
//         style={[
//           styles.container,
//           { backgroundColor: colors.surface, borderTopColor: colors.border },
//         ]}
//       >
//         {/* Delete */}
//         <TouchableOpacity onPress={handleDelete} style={styles.sideBtn}>
//           <Ionicons name="trash-outline" size={22} color="#ff4757" />
//         </TouchableOpacity>

//         {/* Waveform + timer */}
//         <View style={styles.middle}>
//           <View style={styles.waveform}>
//             {bars.map((bar, i) => (
//               <Animated.View key={i} style={[styles.bar, { height: bar }]} />
//             ))}
//           </View>
//           <Text style={[styles.timer, { color: colors.textPrimary }]}>
//             {fmt(elapsed)}
//           </Text>
//         </View>

//         {/* Pause recording */}
//         <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
//           <TouchableOpacity onPress={handlePause} activeOpacity={0.85}>
//             <LinearGradient
//               colors={["#ff4757", "#cc2233"]}
//               style={styles.mainBtn}
//             >
//               <Ionicons name="pause" size={22} color="#fff" />
//             </LinearGradient>
//           </TouchableOpacity>
//         </Animated.View>

//         {/* Send while recording */}
//         <TouchableOpacity onPress={handleSend} activeOpacity={0.85}>
//           <LinearGradient
//             colors={["#5b8dee", "#3a6bc9"]}
//             style={styles.mainBtn}
//           >
//             <Ionicons name="send" size={20} color="#fff" />
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // ── PAUSED UI ──────────────────────────────────────────────────────────────
//   return (
//     <View
//       style={[
//         styles.container,
//         { backgroundColor: colors.surface, borderTopColor: colors.border },
//       ]}
//     >
//       {/* Delete */}
//       <TouchableOpacity onPress={handleDelete} style={styles.sideBtn}>
//         <Ionicons name="trash-outline" size={22} color="#ff4757" />
//       </TouchableOpacity>

//       {/* Progress track + timer */}
//       <View style={styles.middle}>
//         <View
//           style={[styles.progressTrack, { backgroundColor: colors.border }]}
//         >
//           <View
//             style={[styles.progressFill, { width: `${playProgress * 100}%` }]}
//           />
//         </View>
//         <Text style={[styles.timer, { color: colors.textPrimary }]}>
//           {fmt(
//             isPlayingPreview
//               ? Math.floor(playerStatus.currentTime)
//               : savedDuration
//           )}
//         </Text>
//       </View>

//       {/* Play / Pause preview */}
//       <TouchableOpacity onPress={handlePlayPause} activeOpacity={0.85}>
//         <LinearGradient colors={["#00d4aa", "#00b090"]} style={styles.mainBtn}>
//           <Ionicons
//             name={isPlayingPreview ? "pause" : "play"}
//             size={22}
//             color="#fff"
//           />
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* Resume recording */}
//       <TouchableOpacity onPress={handleResume} activeOpacity={0.85}>
//         <LinearGradient colors={["#ff4757", "#cc2233"]} style={styles.mainBtn}>
//           <Ionicons name="mic" size={22} color="#fff" />
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* Send */}
//       <TouchableOpacity onPress={handleSend} activeOpacity={0.85}>
//         <LinearGradient colors={["#5b8dee", "#3a6bc9"]} style={styles.mainBtn}>
//           <Ionicons name="send" size={20} color="#fff" />
//         </LinearGradient>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderTopWidth: 1,
//     gap: 12,
//   },
//   sideBtn: {
//     width: 40,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   middle: {
//     flex: 1,
//     gap: 6,
//   },
//   waveform: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 2.5,
//     height: 36,
//   },
//   bar: {
//     flex: 1,
//     borderRadius: 3,
//     backgroundColor: "#00d4aa",
//     minHeight: 4,
//     maxHeight: 36,
//     opacity: 0.85,
//   },
//   timer: {
//     fontSize: 13,
//     fontWeight: "700",
//     letterSpacing: 0.5,
//   },
//   progressTrack: {
//     height: 4,
//     borderRadius: 2,
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: "100%",
//     backgroundColor: "#00d4aa",
//     borderRadius: 2,
//   },
//   mainBtn: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 6,
//   },
// });

// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   TouchableOpacity,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   AudioModule,
//   RecordingPresets,
//   setAudioModeAsync,
//   useAudioPlayer,
//   useAudioPlayerStatus,
//   useAudioRecorder,
//   useAudioRecorderState,
// } from "expo-audio";

// interface Props {
//   visible: boolean;
//   onSend: (uri: string, duration: number) => void;
//   onCancel: () => void;
//   colors: any;
// }

// type RecState = "recording" | "paused" | "idle";

// const BAR_COUNT = 40;
// const VISIBLE_BARS = 24;

// // Enable metering so we can drive the waveform off real audio levels
// // instead of random bars.
// const RECORDER_OPTIONS = {
//   ...RecordingPresets.HIGH_QUALITY,
//   isMeteringEnabled: true,
// };

// const meteringToHeight = (db: number | undefined) => {
//   const clamped = Math.max(-60, Math.min(0, db ?? -60));
//   const ratio = (clamped + 60) / 60; // 0..1
//   return 4 + ratio * 24;
// };

// export default function AudioRecorder({
//   visible,
//   onSend,
//   onCancel,
//   colors,
// }: Props) {
//   const recorder = useAudioRecorder(RECORDER_OPTIONS);
//   const recorderState = useAudioRecorderState(recorder, 100);

//   // Player starts with no source; we load a file into it via replace()
//   // once the user pauses and wants to preview what's been recorded.
//   const player = useAudioPlayer(null);
//   const playerStatus = useAudioPlayerStatus(player);

//   const [state, setState] = useState<RecState>("idle");
//   const [barHeights, setBarHeights] = useState<number[]>(
//     Array.from({ length: BAR_COUNT }, () => 4)
//   );

//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const frozenDurationRef = useRef(0);

//   useEffect(() => {
//     if (visible) beginRecording();
//     else teardown();
//     return () => {
//       teardown();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [visible]);

//   // Mic pulse only while actively recording
//   useEffect(() => {
//     if (state === "recording") {
//       const pulse = Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, {
//             toValue: 1.15,
//             duration: 700,
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulseAnim, {
//             toValue: 1,
//             duration: 700,
//             useNativeDriver: true,
//           }),
//         ])
//       );
//       pulse.start();
//       return () => pulse.stop();
//     }
//     pulseAnim.setValue(1);
//   }, [state]);

//   // Waveform driven by live metering while recording; freezes while paused
//   useEffect(() => {
//     if (state === "recording" && recorderState.isRecording) {
//       setBarHeights((prev) => [
//         ...prev.slice(1),
//         meteringToHeight(recorderState.metering),
//       ]);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [recorderState.metering]);

//   // ---------- Recording lifecycle ----------
//   const beginRecording = async () => {
//     try {
//       const permission = await AudioModule.requestRecordingPermissionsAsync();
//       if (!permission.granted) {
//         console.warn("Recording permission denied");
//         onCancel();
//         return;
//       }
//       await setAudioModeAsync({
//         allowsRecording: true,
//         playsInSilentMode: true,
//       });
//       await recorder.prepareToRecordAsync();
//       recorder.record();
//       setBarHeights(Array.from({ length: BAR_COUNT }, () => 4));
//       setState("recording");
//     } catch (e) {
//       console.warn("Recording start failed", e);
//     }
//   };

//   // recorder.pause() / recorder.record() operate on the same underlying
//   // file — resuming appends to it rather than starting a new clip, so no
//   // stitching is needed.
//   const pauseRecording = async () => {
//     if (state !== "recording") return;
//     try {
//       recorder.pause();
//       frozenDurationRef.current = recorderState.durationMillis;
//       setState("paused");
//     } catch (e) {
//       console.warn("Pause failed", e);
//     }
//   };

//   const resumeRecording = async () => {
//     if (state !== "paused") return;
//     try {
//       if (playerStatus.playing) player.pause();
//       await setAudioModeAsync({
//         allowsRecording: true,
//         playsInSilentMode: true,
//       });
//       recorder.record();
//       setState("recording");
//     } catch (e) {
//       console.warn("Resume failed", e);
//     }
//   };

//   const finalizeRecording = async (): Promise<string | null> => {
//     try {
//       await recorder.stop();
//       return recorder.uri;
//     } catch (e) {
//       console.warn("Finalize failed", e);
//       return recorder.uri ?? null;
//     }
//   };

//   const teardown = async () => {
//     try {
//       if (playerStatus.playing) player.pause();
//       if (recorderState.isRecording) await recorder.stop();
//     } catch {}
//     setState("idle");
//     frozenDurationRef.current = 0;
//   };

//   // ---------- Preview playback (only available while paused) ----------
//   // Loads the in-progress file into the player. Works reliably for the
//   // AAC/m4a presets on both platforms once the encoder has flushed a
//   // readable header at the pause point — test on your target devices.
//   const togglePreview = async () => {
//     if (state !== "paused") return;
//     if (playerStatus.playing) {
//       player.pause();
//       return;
//     }
//     try {
//       const uri = recorder.uri;
//       if (!uri) return;
//       await setAudioModeAsync({
//         allowsRecording: false,
//         playsInSilentMode: true,
//       });
//       player.replace(uri);
//       player.play();
//     } catch (e) {
//       console.warn("Preview failed", e);
//     }
//   };

//   // ---------- Actions ----------
//   const handleDelete = async () => {
//     await teardown();
//     onCancel();
//   };

//   const handleSend = async () => {
//     if (playerStatus.playing) player.pause();
//     const uri = await finalizeRecording();
//     const finalSeconds = Math.round(
//       (state === "paused"
//         ? frozenDurationRef.current
//         : recorderState.durationMillis) / 1000
//     );
//     setState("idle");
//     if (uri) onSend(uri, finalSeconds);
//     else onCancel();
//   };

//   const fmt = (s: number) =>
//     `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, "0")}`;

//   if (!visible || state === "idle") return null;

//   const totalMs =
//     state === "paused"
//       ? frozenDurationRef.current
//       : recorderState.durationMillis;
//   const totalSeconds = totalMs / 1000;
//   const visibleBars = barHeights.slice(-VISIBLE_BARS);
//   const playedFraction =
//     totalSeconds > 0 ? playerStatus.currentTime / totalSeconds : 0;

//   return (
//     <View
//       style={[
//         styles.container,
//         { backgroundColor: colors.surface, borderTopColor: colors.border },
//       ]}
//     >
//       {/* Delete */}
//       <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
//         <Ionicons name="trash-outline" size={22} color="#ff4757" />
//       </TouchableOpacity>

//       {/* Timer + waveform (+ preview toggle when paused) */}
//       <View style={[styles.pill, { backgroundColor: colors.background }]}>
//         {state === "recording" && <View style={styles.recDot} />}
//         {state === "paused" && (
//           <TouchableOpacity onPress={togglePreview} style={styles.previewBtn}>
//             <Ionicons
//               name={playerStatus.playing ? "pause" : "play"}
//               size={16}
//               color="#00d4aa"
//             />
//           </TouchableOpacity>
//         )}

//         <Text style={[styles.timer, { color: colors.textPrimary }]}>
//           {playerStatus.playing
//             ? `${fmt(playerStatus.currentTime)} / ${fmt(totalSeconds)}`
//             : fmt(totalSeconds)}
//         </Text>

//         <View style={styles.waveform}>
//           {visibleBars.map((h, i) => {
//             const played =
//               playerStatus.playing && i / VISIBLE_BARS < playedFraction;
//             return (
//               <View
//                 key={i}
//                 style={[
//                   styles.waveBar,
//                   {
//                     height: h,
//                     backgroundColor:
//                       state === "recording"
//                         ? "#00d4aa"
//                         : played
//                         ? "#00d4aa"
//                         : colors.textMuted,
//                   },
//                 ]}
//               />
//             );
//           })}
//         </View>
//       </View>

//       {/* Pause / Resume */}
//       <TouchableOpacity
//         style={styles.iconBtn}
//         onPress={state === "recording" ? pauseRecording : resumeRecording}
//       >
//         <View
//           style={[styles.circleBtn, { backgroundColor: colors.background }]}
//         >
//           <Ionicons
//             name={state === "recording" ? "pause" : "mic"}
//             size={18}
//             color={colors.textPrimary}
//           />
//         </View>
//       </TouchableOpacity>

//       {/* Send — works whether currently recording, paused, or mid-preview */}
//       <Animated.View
//         style={{
//           transform: [{ scale: state === "recording" ? pulseAnim : 1 }],
//         }}
//       >
//         <TouchableOpacity onPress={handleSend}>
//           <LinearGradient
//             colors={["#00d4aa", "#00b090"]}
//             style={styles.sendGradient}
//           >
//             <Ionicons name="send" size={20} color="#fff" />
//           </LinearGradient>
//         </TouchableOpacity>
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     gap: 8,
//   },
//   iconBtn: { justifyContent: "center", alignItems: "center" },
//   circleBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   pill: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },
//   previewBtn: { width: 22, alignItems: "center" },
//   recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ff4757" },
//   timer: { fontSize: 14, fontWeight: "700", minWidth: 40 },
//   waveform: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 2,
//     height: 24,
//     overflow: "hidden",
//   },
//   waveBar: { width: 3, borderRadius: 2, minHeight: 4 },
//   sendGradient: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

// ---------------------------------------------------------------------------
// WHY THIS CHANGED
// ---------------------------------------------------------------------------
// recorder.pause() suspends the encoder but does NOT finalize the file's
// container (no moov atom / duration written). Loading that half-written
// file into the player during a pause leaves it stuck at isLoaded:false,
// duration:NaN — nothing audibly plays, even though play() "succeeds".
//
// The only way to get a genuinely playable file is to call recorder.stop().
// But stop() also ends the ability to append to that file, so "pause, then
// resume the SAME clip" isn't something expo-audio supports reliably.
//
// Fix: record in SEGMENTS. Every pause finalizes (stops) the current
// segment into its own playable file. Resume starts a brand new segment.
// Preview plays finished segments back-to-back. On send, all segments are
// handed to the caller as a playlist instead of a single uri.
//
// ⚠️ INTERFACE CHANGE: onSend now receives an array of clips instead of a
// single (uri, duration) pair, since expo-audio can't merge separate m4a
// files into one on-device without an extra native module (e.g.
// ffmpeg-kit-react-native). If you need a single merged file for upload,
// that merge step has to happen either with ffmpeg-kit or server-side after
// you upload each segment. Happy to wire that up next if you want it.
// ---------------------------------------------------------------------------

export interface RecordedSegment {
  uri: string;
  durationMs: number;
}

interface Props {
  visible: boolean;
  onSend: (segments: RecordedSegment[], totalDurationSeconds: number) => void;
  onCancel: () => void;
  colors: any;
}

type RecState = "recording" | "paused" | "idle";

const BAR_COUNT = 40;
const VISIBLE_BARS = 24;

const RECORDER_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

const meteringToHeight = (db: number | undefined) => {
  const clamped = Math.max(-60, Math.min(0, db ?? -60));
  const ratio = (clamped + 60) / 60; // 0..1
  return 4 + ratio * 24;
};

export default function AudioRecorder({
  visible,
  onSend,
  onCancel,
  colors,
}: Props) {
  const recorder = useAudioRecorder(RECORDER_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, 100);

  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);

  const [state, setState] = useState<RecState>("idle");
  const [segments, setSegments] = useState<RecordedSegment[]>([]);
  const [barHeights, setBarHeights] = useState<number[]>(
    Array.from({ length: BAR_COUNT }, () => 4)
  );

  // Which segment index we're previewing, and whether preview is active at all.
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Segments are captured in a ref too so async callbacks (like the
  // "advance to next segment" playback listener) always see the latest list
  // without needing to be re-subscribed every time segments changes.
  const segmentsRef = useRef<RecordedSegment[]>([]);
  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    if (visible) beginRecording();
    else teardown();
    return () => {
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Mic pulse only while actively recording
  useEffect(() => {
    if (state === "recording") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
    pulseAnim.setValue(1);
  }, [state]);

  // Waveform driven by live metering while recording.
  useEffect(() => {
    if (state === "recording" && recorderState.isRecording) {
      setBarHeights((prev) => [
        ...prev.slice(1),
        meteringToHeight(recorderState.metering),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorderState.metering]);

  // Auto-advance preview to the next finished segment when the current one
  // finishes playing, so pause -> resume -> pause -> preview plays the
  // whole thing back seamlessly instead of just the last chunk.
  useEffect(() => {
    if (!isPreviewing) return;
    if (!playerStatus.didJustFinish) return;

    const next = previewIndex + 1;
    const list = segmentsRef.current;
    if (next < list.length) {
      setPreviewIndex(next);
      player.replace(list[next].uri);
      player.play();
    } else {
      setIsPreviewing(false);
      setPreviewIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerStatus.didJustFinish]);

  // ---------- Recording lifecycle ----------
  const beginRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        console.warn("Recording permission denied");
        onCancel();
        return;
      }
      setSegments([]);
      setBarHeights(Array.from({ length: BAR_COUNT }, () => 4));
      await startNewSegment();
      setState("recording");
    } catch (e) {
      console.warn("Recording start failed", e);
    }
  };

  // Starts a brand new recording file. Used both for the very first segment
  // and for every "resume" after a pause.
  const startNewSegment = async () => {
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  // Finalizes the in-progress segment (if any) into a real, playable file
  // and appends it to the segments list. Returns the segment, or null if
  // nothing was recording.
  const finalizeCurrentSegment = async (): Promise<RecordedSegment | null> => {
    if (!recorderState.isRecording) return null;
    const durationMs = recorderState.durationMillis;
    try {
      await recorder.stop();
    } catch (e) {
      console.warn("Stop failed", e);
    }
    const uri = recorder.uri;
    if (!uri) return null;
    const segment = { uri, durationMs };
    setSegments((prev) => [...prev, segment]);
    return segment;
  };

  const pauseRecording = async () => {
    if (state !== "recording") return;
    try {
      await finalizeCurrentSegment();
      setState("paused");
    } catch (e) {
      console.warn("Pause failed", e);
    }
  };

  const resumeRecording = async () => {
    if (state !== "paused") return;
    try {
      if (isPreviewing) {
        player.pause();
        setIsPreviewing(false);
        setPreviewIndex(0);
      }
      await startNewSegment();
      setState("recording");
    } catch (e) {
      console.warn("Resume failed", e);
    }
  };

  const teardown = async () => {
    try {
      if (playerStatus.playing) player.pause();
      if (recorderState.isRecording) await recorder.stop();
    } catch {}
    setState("idle");
    setSegments([]);
    setIsPreviewing(false);
    setPreviewIndex(0);
  };

  // ---------- Preview playback (only available while paused) ----------
  // Plays finished segments back-to-back starting from the first one.
  const togglePreview = async () => {
    if (state !== "paused") return;

    if (isPreviewing) {
      player.pause();
      setIsPreviewing(false);
      return;
    }

    if (segments.length === 0) return;

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      setPreviewIndex(0);
      player.replace(segments[0].uri);
      player.play();
      setIsPreviewing(true);
    } catch (e) {
      console.warn("Preview failed", e);
    }
  };

  // ---------- Actions ----------
  const handleDelete = async () => {
    await teardown();
    onCancel();
  };

  const handleSend = async () => {
    if (playerStatus.playing) player.pause();

    // If we're still recording, finalize that last segment first.
    const lastSegment =
      state === "recording" ? await finalizeCurrentSegment() : null;

    const finalSegments = lastSegment ? [...segments, lastSegment] : segments;

    setState("idle");

    if (finalSegments.length === 0) {
      onCancel();
      return;
    }

    const totalSeconds = Math.round(
      finalSegments.reduce((sum, s) => sum + s.durationMs, 0) / 1000
    );
    onSend(finalSegments, totalSeconds);
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, "0")}`;

  if (!visible || state === "idle") return null;

  const segmentsTotalMs = segments.reduce((sum, s) => sum + s.durationMs, 0);
  const totalMs =
    state === "recording"
      ? segmentsTotalMs + recorderState.durationMillis
      : segmentsTotalMs;
  const totalSeconds = totalMs / 1000;
  const visibleBars = barHeights.slice(-VISIBLE_BARS);

  // Preview progress across the whole playlist, not just the current segment.
  const playedMsBeforeCurrent = segments
    .slice(0, previewIndex)
    .reduce((sum, s) => sum + s.durationMs, 0);
  const previewCurrentMs =
    playedMsBeforeCurrent + playerStatus.currentTime * 1000;
  const previewTotalMs = segmentsTotalMs || 1;
  const playedFraction = isPreviewing ? previewCurrentMs / previewTotalMs : 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderTopColor: colors.border },
      ]}
    >
      {/* Delete */}
      <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={22} color="#ff4757" />
      </TouchableOpacity>

      {/* Timer + waveform (+ preview toggle when paused) */}
      <View style={[styles.pill, { backgroundColor: colors.background }]}>
        {state === "recording" && <View style={styles.recDot} />}
        {state === "paused" && segments.length > 0 && (
          <TouchableOpacity onPress={togglePreview} style={styles.previewBtn}>
            <Ionicons
              name={isPreviewing ? "pause" : "play"}
              size={16}
              color="#00d4aa"
            />
          </TouchableOpacity>
        )}

        <Text style={[styles.timer, { color: colors.textPrimary }]}>
          {isPreviewing
            ? `${fmt(previewCurrentMs / 1000)} / ${fmt(totalSeconds)}`
            : fmt(totalSeconds)}
        </Text>

        <View style={styles.waveform}>
          {visibleBars.map((h, i) => {
            const played = isPreviewing && i / VISIBLE_BARS < playedFraction;
            return (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: h,
                    backgroundColor:
                      state === "recording"
                        ? "#00d4aa"
                        : played
                        ? "#00d4aa"
                        : colors.textMuted,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Pause / Resume */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={state === "recording" ? pauseRecording : resumeRecording}
      >
        <View
          style={[styles.circleBtn, { backgroundColor: colors.background }]}
        >
          <Ionicons
            name={state === "recording" ? "pause" : "mic"}
            size={18}
            color={colors.textPrimary}
          />
        </View>
      </TouchableOpacity>

      {/* Send — works whether currently recording or paused */}
      <Animated.View
        style={{
          transform: [{ scale: state === "recording" ? pulseAnim : 1 }],
        }}
      >
        <TouchableOpacity onPress={handleSend}>
          <LinearGradient
            colors={["#00d4aa", "#00b090"]}
            style={styles.sendGradient}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  iconBtn: { justifyContent: "center", alignItems: "center" },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewBtn: { width: 22, alignItems: "center" },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ff4757" },
  timer: { fontSize: 14, fontWeight: "700", minWidth: 40 },
  waveform: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 24,
    overflow: "hidden",
  },
  waveBar: { width: 3, borderRadius: 2, minHeight: 4 },
  sendGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
