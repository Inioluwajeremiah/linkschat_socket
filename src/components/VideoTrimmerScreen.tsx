// import React, { useCallback, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Platform,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { Feather } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import * as ImagePicker from "expo-image-picker";
// import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
// import * as Haptics from "expo-haptics";
// import VideoTrimmer from "@/components/VideoTrimmer";

// let VideoThumbnails: typeof import("expo-video-thumbnails") | null = null;
// if (Platform.OS !== "web") {
//   VideoThumbnails = require("expo-video-thumbnails");
// }

// function pad(n: number) {
//   return n.toString().padStart(2, "0");
// }
// function formatTime(ms: number) {
//   if (!isFinite(ms) || ms < 0) ms = 0;
//   const s = Math.floor(ms / 1000);
//   return `${pad(Math.floor(s / 60))}:${pad(s % 60)}.${Math.floor(
//     (ms % 1000) / 100
//   )}`;
// }

// const THUMBNAIL_COUNT = 14;

// export default function VideoTrimmerScreen() {
//   const insets = useSafeAreaInsets();
//   const videoRef = useRef<Video>(null);

//   const [videoUri, setVideoUri] = useState<string | null>(null);
//   const [duration, setDuration] = useState(0);
//   const [startTime, setStartTime] = useState(0);
//   const [endTime, setEndTime] = useState(0);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [thumbnails, setThumbnails] = useState<string[]>([]);
//   const [loadingThumbs, setLoadingThumbs] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const pickVersion = useRef(0);

//   const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
//   const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

//   const pickVideo = useCallback(async () => {
//     const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (perm.status !== "granted") {
//       Alert.alert("Permission required", "Please allow media library access.");
//       return;
//     }
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Videos,
//       allowsEditing: false,
//       quality: 1,
//     });
//     if (result.canceled || !result.assets[0]) return;
//     const asset = result.assets[0];
//     const uri = asset.uri;
//     const dur = (asset.duration ?? 30) * 1000;

//     setVideoUri(uri);
//     setDuration(dur);
//     setStartTime(0);
//     setEndTime(dur);
//     setCurrentTime(0);
//     setIsPlaying(false);
//     setThumbnails([]);
//     setShowSuccess(false);

//     if (VideoThumbnails) {
//       const version = ++pickVersion.current;
//       setLoadingThumbs(true);
//       const thumbs: string[] = [];
//       for (let i = 0; i < THUMBNAIL_COUNT; i++) {
//         if (pickVersion.current !== version) break;
//         const time = Math.floor((i / THUMBNAIL_COUNT) * dur);
//         try {
//           const { uri: t } = await VideoThumbnails.getThumbnailAsync(uri, {
//             time,
//             quality: 0.4,
//           });
//           thumbs.push(t);
//         } catch {
//           /* skip */
//         }
//       }
//       if (pickVersion.current === version) {
//         setThumbnails(thumbs);
//         setLoadingThumbs(false);
//       }
//     }
//   }, []);

//   const onPlaybackStatusUpdate = useCallback(
//     (status: AVPlaybackStatus) => {
//       if (!status.isLoaded) return;
//       setCurrentTime(status.positionMillis);
//       if (isPlaying && status.positionMillis >= endTime) {
//         videoRef.current?.setPositionAsync(startTime);
//         videoRef.current?.pauseAsync();
//         setIsPlaying(false);
//       }
//     },
//     [isPlaying, startTime, endTime]
//   );

//   const togglePlay = useCallback(async () => {
//     if (!videoRef.current) return;
//     if (isPlaying) {
//       await videoRef.current.pauseAsync();
//       setIsPlaying(false);
//     } else {
//       if (currentTime >= endTime || currentTime < startTime)
//         await videoRef.current.setPositionAsync(startTime);
//       await videoRef.current.playAsync();
//       setIsPlaying(true);
//     }
//     if (Platform.OS !== "web")
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//   }, [isPlaying, currentTime, startTime, endTime]);

//   const jumpToStart = useCallback(async () => {
//     await videoRef.current?.setPositionAsync(startTime);
//     setCurrentTime(startTime);
//     if (Platform.OS !== "web")
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//   }, [startTime]);

//   const jumpToEnd = useCallback(async () => {
//     await videoRef.current?.setPositionAsync(endTime);
//     setCurrentTime(endTime);
//     if (Platform.OS !== "web")
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//   }, [endTime]);

//   const onTrimChange = useCallback(
//     async (start: number, end: number) => {
//       setStartTime(start);
//       setEndTime(end);
//       if (currentTime < start || currentTime > end) {
//         await videoRef.current?.setPositionAsync(start);
//         setCurrentTime(start);
//       }
//     },
//     [currentTime]
//   );

//   const onSeek = useCallback(async (ms: number) => {
//     await videoRef.current?.setPositionAsync(ms);
//     setCurrentTime(ms);
//   }, []);

//   const handleExport = useCallback(async () => {
//     if (Platform.OS !== "web")
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//     setShowSuccess(true);
//   }, []);

//   const trimDuration = endTime - startTime;

//   // ── Empty state ─────────────────────────────────────────────────────────────
//   if (!videoUri) {
//     return (
//       <View
//         style={[
//           styles.emptyRoot,
//           { paddingTop: topPad, paddingBottom: bottomPad },
//         ]}
//       >
//         <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
//         <LinearGradient
//           colors={["#141414", "#0A0A0A"]}
//           style={[StyleSheet.absoluteFill, styles.noTouch]}
//         />
//         <View style={styles.emptyContent}>
//           <View style={styles.emptyIconRing}>
//             <Feather name="film" size={38} color="#F5A623" />
//           </View>
//           <Text style={styles.emptyHeading}>Video Trimmer</Text>
//           <Text style={styles.emptySub}>
//             Pick any video from your library and set{"\n"}precise in/out points
//             with a swipe.
//           </Text>
//           <View style={styles.featuresRow}>
//             {(
//               [
//                 ["scissors", "Precision trim"],
//                 ["film", "Frame preview"],
//                 ["zap", "Instant export"],
//               ] as const
//             ).map(([icon, label]) => (
//               <View key={label} style={styles.featureChip}>
//                 <Feather name={icon} size={14} color="#F5A623" />
//                 <Text style={styles.featureLabel}>{label}</Text>
//               </View>
//             ))}
//           </View>
//           <TouchableOpacity
//             style={styles.pickBtn}
//             onPress={pickVideo}
//             activeOpacity={0.85}
//           >
//             <Feather
//               name="upload"
//               size={17}
//               color="#0A0A0A"
//               style={{ marginRight: 8 }}
//             />
//             <Text style={styles.pickBtnText}>Choose Video</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   // ── Main UI ─────────────────────────────────────────────────────────────────
//   return (
//     <View
//       style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}
//     >
//       <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.headerBtn}
//           onPress={() => {
//             setVideoUri(null);
//             setIsPlaying(false);
//           }}
//           activeOpacity={0.7}
//         >
//           <Feather name="x" size={22} color="#666" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Trim Video</Text>
//         <TouchableOpacity
//           style={styles.headerBtn}
//           onPress={pickVideo}
//           activeOpacity={0.7}
//         >
//           <Feather name="folder" size={19} color="#666" />
//         </TouchableOpacity>
//       </View>

//       {/* Video preview */}
//       <View style={styles.videoWrapper}>
//         <Video
//           ref={videoRef}
//           source={{ uri: videoUri }}
//           style={StyleSheet.absoluteFill}
//           resizeMode={ResizeMode.CONTAIN}
//           shouldPlay={false}
//           isLooping={false}
//           onPlaybackStatusUpdate={onPlaybackStatusUpdate}
//         />
//         <LinearGradient
//           colors={[
//             "rgba(0,0,0,0.3)",
//             "transparent",
//             "transparent",
//             "rgba(0,0,0,0.3)",
//           ]}
//           style={[StyleSheet.absoluteFill, styles.noTouch]}
//         />
//       </View>

//       {/* Time row */}
//       <View style={styles.timeRow}>
//         <View style={styles.timeChip}>
//           <Text style={styles.timeChipLabel}>START</Text>
//           <Text style={styles.timeChipVal}>{formatTime(startTime)}</Text>
//         </View>
//         <View style={styles.timeCentre}>
//           <Text style={styles.timeCurrent}>{formatTime(currentTime)}</Text>
//           <Text style={styles.timeTotalLabel}>/ {formatTime(duration)}</Text>
//         </View>
//         <View style={[styles.timeChip, { alignItems: "flex-end" }]}>
//           <Text style={styles.timeChipLabel}>END</Text>
//           <Text style={styles.timeChipVal}>{formatTime(endTime)}</Text>
//         </View>
//       </View>

//       <View style={styles.sep} />

//       {/* Timeline */}
//       <View style={styles.timelineSection}>
//         {loadingThumbs && (
//           <View style={styles.thumbLoadRow}>
//             <ActivityIndicator color="#F5A623" size="small" />
//             <Text style={styles.thumbLoadText}>Generating frames…</Text>
//           </View>
//         )}
//         <VideoTrimmer
//           duration={duration}
//           currentTime={currentTime}
//           startTime={startTime}
//           endTime={endTime}
//           thumbnails={thumbnails}
//           onTrimChange={onTrimChange}
//           onSeek={onSeek}
//         />
//         <View style={styles.trimBadge}>
//           <Feather name="scissors" size={11} color="#F5A623" />
//           <Text style={styles.trimBadgeText}>
//             {formatTime(trimDuration)} selected
//           </Text>
//         </View>
//       </View>

//       <View style={styles.sep} />

//       {/* Playback controls */}
//       <View style={styles.controls}>
//         <TouchableOpacity
//           style={styles.ctrlBtn}
//           onPress={jumpToStart}
//           activeOpacity={0.7}
//         >
//           <Feather name="skip-back" size={21} color="#CCC" />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.playBtn}
//           onPress={togglePlay}
//           activeOpacity={0.85}
//         >
//           <Feather
//             name={isPlaying ? "pause" : "play"}
//             size={26}
//             color="#0A0A0A"
//           />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.ctrlBtn}
//           onPress={jumpToEnd}
//           activeOpacity={0.7}
//         >
//           <Feather name="skip-forward" size={21} color="#CCC" />
//         </TouchableOpacity>
//       </View>

//       {/* Export */}
//       <View style={styles.exportSection}>
//         <TouchableOpacity
//           style={styles.exportBtn}
//           onPress={handleExport}
//           activeOpacity={0.85}
//         >
//           <LinearGradient
//             colors={["#F7B733", "#F5A623", "#E8900A"]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 0 }}
//             style={[StyleSheet.absoluteFill, styles.noTouch]}
//           />
//           <Feather
//             name="download"
//             size={17}
//             color="#0A0A0A"
//             style={{ marginRight: 8 }}
//           />
//           <Text style={styles.exportBtnText}>Export Trimmed Video</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Success overlay */}
//       {showSuccess && (
//         <View style={styles.successOverlay}>
//           <View style={styles.successCard}>
//             <View style={styles.successIconRing}>
//               <Feather name="check" size={32} color="#F5A623" />
//             </View>
//             <Text style={styles.successTitle}>Trim Applied</Text>
//             <Text style={styles.successSub}>
//               Your trim settings are ready to export.
//             </Text>
//             <View style={styles.successGrid}>
//               {(
//                 [
//                   ["START", formatTime(startTime)],
//                   ["END", formatTime(endTime)],
//                   ["DURATION", formatTime(trimDuration)],
//                 ] as const
//               ).map(([label, value], i) => (
//                 <View key={label} style={{ alignItems: "center", flex: 1 }}>
//                   <Text
//                     style={{
//                       fontSize: 9,
//                       color: "#555",
//                       letterSpacing: 1,
//                       marginBottom: 4,
//                     }}
//                   >
//                     {label}
//                   </Text>
//                   <Text
//                     style={{
//                       fontSize: 15,
//                       color: i === 2 ? "#F5A623" : "#FFF",
//                       fontWeight: "600",
//                     }}
//                   >
//                     {value}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//             <TouchableOpacity
//               style={styles.successDoneBtn}
//               onPress={() => setShowSuccess(false)}
//               activeOpacity={0.85}
//             >
//               <Text style={styles.successDoneText}>Done</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   noTouch: { pointerEvents: "none" as const },
//   root: { flex: 1, backgroundColor: "#0A0A0A" },
//   emptyRoot: { flex: 1, backgroundColor: "#0A0A0A" },
//   emptyContent: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 36,
//   },
//   emptyIconRing: {
//     width: 84,
//     height: 84,
//     borderRadius: 22,
//     backgroundColor: "#141414",
//     borderWidth: 1,
//     borderColor: "#2A2A2A",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 28,
//   },
//   emptyHeading: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "#FFF",
//     marginBottom: 12,
//   },
//   emptySub: {
//     fontSize: 15,
//     color: "#666",
//     lineHeight: 23,
//     textAlign: "center",
//     marginBottom: 28,
//   },
//   featuresRow: { flexDirection: "row", gap: 10, marginBottom: 40 },
//   featureChip: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//     backgroundColor: "#141414",
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderWidth: 1,
//     borderColor: "#2A2A2A",
//   },
//   featureLabel: { fontSize: 12, color: "#AAA" },
//   pickBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F5A623",
//     paddingHorizontal: 32,
//     paddingVertical: 15,
//     borderRadius: 16,
//   },
//   pickBtnText: { fontSize: 16, fontWeight: "700", color: "#0A0A0A" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#1C1C1C",
//   },
//   headerBtn: {
//     width: 40,
//     height: 40,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   headerTitle: { fontSize: 17, fontWeight: "600", color: "#FFF" },
//   videoWrapper: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
//   timeRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//   },
//   timeChip: { alignItems: "flex-start" },
//   timeChipLabel: {
//     fontSize: 9,
//     fontWeight: "700",
//     color: "#F5A623",
//     letterSpacing: 1.4,
//     marginBottom: 3,
//   },
//   timeChipVal: { fontSize: 14, color: "#EEE" },
//   timeCentre: { alignItems: "center", flexDirection: "row", gap: 4 },
//   timeCurrent: { fontSize: 18, fontWeight: "700", color: "#FFF" },
//   timeTotalLabel: { fontSize: 13, color: "#555" },
//   sep: { height: 1, backgroundColor: "#1C1C1C", marginHorizontal: 16 },
//   timelineSection: { paddingHorizontal: 16, paddingVertical: 14 },
//   thumbLoadRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 8,
//   },
//   thumbLoadText: { fontSize: 12, color: "#555" },
//   trimBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//     marginTop: 10,
//     alignSelf: "center",
//     backgroundColor: "#161616",
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     borderWidth: 1,
//     borderColor: "#2A2A2A",
//   },
//   trimBadgeText: { fontSize: 12, color: "#F5A623" },
//   controls: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 24,
//     paddingVertical: 18,
//   },
//   ctrlBtn: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#1A1A1A",
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "#2A2A2A",
//   },
//   playBtn: {
//     width: 62,
//     height: 62,
//     borderRadius: 31,
//     backgroundColor: "#F5A623",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   exportSection: { paddingHorizontal: 16, paddingBottom: 12 },
//   exportBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     height: 54,
//     borderRadius: 16,
//     overflow: "hidden",
//   },
//   exportBtnText: { fontSize: 16, fontWeight: "700", color: "#0A0A0A" },
//   successOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.88)",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 24,
//   },
//   successCard: {
//     backgroundColor: "#141414",
//     borderRadius: 24,
//     padding: 32,
//     width: "100%",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#2A2A2A",
//   },
//   successIconRing: {
//     width: 68,
//     height: 68,
//     borderRadius: 34,
//     backgroundColor: "#1E1A10",
//     borderWidth: 2,
//     borderColor: "#F5A623",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 22,
//   },
//   successTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#FFF",
//     marginBottom: 8,
//   },
//   successSub: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//     marginBottom: 28,
//   },
//   successGrid: {
//     flexDirection: "row",
//     width: "100%",
//     backgroundColor: "#0E0E0E",
//     borderRadius: 14,
//     paddingVertical: 16,
//     marginBottom: 28,
//     borderWidth: 1,
//     borderColor: "#222",
//   },
//   successDoneBtn: {
//     backgroundColor: "#F5A623",
//     paddingHorizontal: 48,
//     paddingVertical: 14,
//     borderRadius: 14,
//   },
//   successDoneText: { fontSize: 16, fontWeight: "700", color: "#0A0A0A" },
// });
