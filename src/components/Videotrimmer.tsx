// /**
//  * VideoTrimmer — production-quality trim timeline component.
//  *
//  * Features:
//  *  - Frame thumbnails from expo-video-thumbnails
//  *  - Amber start/end handles with grip marks, drag-to-trim
//  *  - Dim overlay outside selection with amber border inside
//  *  - Live white playhead
//  *  - Tap-to-seek anywhere on the track
//  *  - Haptic feedback on handle grab/release and limit hits
//  */

// import React, { useCallback, useEffect, useRef } from "react";
// import {
//   Image,
//   LayoutChangeEvent,
//   Platform,
//   StyleSheet,
//   View,
// } from "react-native";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";
// import Animated, {
//   runOnJS,
//   useAnimatedStyle,
//   useSharedValue,
// } from "react-native-reanimated";
// import * as Haptics from "expo-haptics";

// const HANDLE_WIDTH = 18;
// const TRACK_HEIGHT = 68;
// const HANDLE_OVERHANG = 10;
// const OUTER_HEIGHT = TRACK_HEIGHT + HANDLE_OVERHANG * 2;
// const MIN_GAP = 0.03;
// const SELECTION_BORDER = 3;
// const PLAYHEAD_WIDTH = 2;

// export interface VideoTrimmerProps {
//   duration: number;
//   currentTime: number;
//   startTime: number;
//   endTime: number;
//   thumbnails: string[];
//   onTrimChange: (startMs: number, endMs: number) => void;
//   onSeek: (ms: number) => void;
// }

// export default function VideoTrimmer({
//   duration,
//   currentTime,
//   startTime,
//   endTime,
//   thumbnails,
//   onTrimChange,
//   onSeek,
// }: VideoTrimmerProps) {
//   const safeDuration = duration > 0 ? duration : 1;

//   const trackWidth = useSharedValue(1);
//   const startFrac = useSharedValue(startTime / safeDuration);
//   const endFrac = useSharedValue(endTime / safeDuration);
//   const currentFrac = useSharedValue(currentTime / safeDuration);
//   const startCtx = useSharedValue(0);
//   const endCtx = useSharedValue(0);
//   const draggingStart = useSharedValue(false);
//   const draggingEnd = useSharedValue(false);

//   useEffect(() => {
//     if (!draggingStart.value) startFrac.value = startTime / safeDuration;
//   }, [startTime, safeDuration]);

//   useEffect(() => {
//     if (!draggingEnd.value) endFrac.value = endTime / safeDuration;
//   }, [endTime, safeDuration]);

//   useEffect(() => {
//     currentFrac.value = currentTime / safeDuration;
//   }, [currentTime, safeDuration]);

//   const haptic = useCallback(() => {
//     if (Platform.OS !== "web") {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     }
//   }, []);

//   const reportTrim = useCallback(() => {
//     onTrimChange(
//       Math.round(startFrac.value * safeDuration),
//       Math.round(endFrac.value * safeDuration)
//     );
//   }, [onTrimChange, safeDuration]);

//   const startGesture = Gesture.Pan()
//     .minDistance(0)
//     .onStart(() => {
//       "worklet";
//       draggingStart.value = true;
//       startCtx.value = startFrac.value;
//       runOnJS(haptic)();
//     })
//     .onUpdate((e) => {
//       "worklet";
//       const next = startCtx.value + e.translationX / trackWidth.value;
//       startFrac.value = Math.max(0, Math.min(endFrac.value - MIN_GAP, next));
//     })
//     .onEnd(() => {
//       "worklet";
//       runOnJS(haptic)();
//       runOnJS(reportTrim)();
//     })
//     .onFinalize(() => {
//       "worklet";
//       draggingStart.value = false;
//     });

//   const endGesture = Gesture.Pan()
//     .minDistance(0)
//     .onStart(() => {
//       "worklet";
//       draggingEnd.value = true;
//       endCtx.value = endFrac.value;
//       runOnJS(haptic)();
//     })
//     .onUpdate((e) => {
//       "worklet";
//       const next = endCtx.value + e.translationX / trackWidth.value;
//       endFrac.value = Math.max(startFrac.value + MIN_GAP, Math.min(1, next));
//     })
//     .onEnd(() => {
//       "worklet";
//       runOnJS(haptic)();
//       runOnJS(reportTrim)();
//     })
//     .onFinalize(() => {
//       "worklet";
//       draggingEnd.value = false;
//     });

//   const seekGesture = Gesture.Tap().onEnd((e) => {
//     "worklet";
//     const frac = e.x / trackWidth.value;
//     const clamped = Math.max(startFrac.value, Math.min(endFrac.value, frac));
//     runOnJS(onSeek)(Math.round(clamped * safeDuration));
//   });

//   const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
//     trackWidth.value = e.nativeEvent.layout.width;
//   }, []);

//   const leftDimStyle = useAnimatedStyle(() => ({
//     width: startFrac.value * trackWidth.value,
//   }));
//   const rightDimStyle = useAnimatedStyle(() => ({
//     left: endFrac.value * trackWidth.value,
//   }));
//   const selectionStyle = useAnimatedStyle(() => ({
//     left: startFrac.value * trackWidth.value,
//     width: (endFrac.value - startFrac.value) * trackWidth.value,
//   }));
//   const startHandleStyle = useAnimatedStyle(() => ({
//     transform: [
//       { translateX: startFrac.value * trackWidth.value - HANDLE_WIDTH / 2 },
//     ],
//   }));
//   const endHandleStyle = useAnimatedStyle(() => ({
//     transform: [
//       { translateX: endFrac.value * trackWidth.value - HANDLE_WIDTH / 2 },
//     ],
//   }));
//   const playheadStyle = useAnimatedStyle(() => ({
//     transform: [
//       { translateX: currentFrac.value * trackWidth.value - PLAYHEAD_WIDTH / 2 },
//     ],
//   }));

//   return (
//     <View style={styles.outer}>
//       <GestureDetector gesture={seekGesture}>
//         <Animated.View style={styles.track} onLayout={onTrackLayout}>
//           <View style={[styles.thumbRow, styles.noTouch]}>
//             {thumbnails.length > 0
//               ? thumbnails.map((uri, i) => (
//                   <Image
//                     key={i}
//                     source={{ uri }}
//                     style={styles.thumb}
//                     resizeMode="cover"
//                   />
//                 ))
//               : Array.from({ length: 12 }).map((_, i) => (
//                   <View
//                     key={i}
//                     style={[
//                       styles.thumbPlaceholder,
//                       { backgroundColor: i % 2 === 0 ? "#1A1A1A" : "#1E1E1E" },
//                     ]}
//                   />
//                 ))}
//           </View>

//           <Animated.View
//             style={[
//               styles.dimOverlay,
//               { left: 0 },
//               leftDimStyle,
//               styles.noTouch,
//             ]}
//           />
//           <Animated.View
//             style={[
//               styles.dimOverlay,
//               { right: 0 },
//               rightDimStyle,
//               styles.noTouch,
//             ]}
//           />
//           <Animated.View
//             style={[styles.selectionBorder, selectionStyle, styles.noTouch]}
//           />
//           <Animated.View
//             style={[styles.playhead, playheadStyle, styles.noTouch]}
//           />
//         </Animated.View>
//       </GestureDetector>

//       <GestureDetector gesture={startGesture}>
//         <Animated.View style={[styles.handleWrap, startHandleStyle]}>
//           <HandleBar />
//         </Animated.View>
//       </GestureDetector>

//       <GestureDetector gesture={endGesture}>
//         <Animated.View style={[styles.handleWrap, endHandleStyle]}>
//           <HandleBar />
//         </Animated.View>
//       </GestureDetector>
//     </View>
//   );
// }

// function HandleBar() {
//   return (
//     <View style={handleStyles.bar}>
//       {[0, 1, 2].map((i) => (
//         <View key={i} style={handleStyles.grip} />
//       ))}
//     </View>
//   );
// }

// const handleStyles = StyleSheet.create({
//   bar: {
//     width: HANDLE_WIDTH,
//     height: OUTER_HEIGHT,
//     backgroundColor: "#F5A623",
//     borderRadius: 5,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 4,
//     shadowColor: "#F5A623",
//     shadowOpacity: 0.4,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 0 },
//     elevation: 6,
//   },
//   grip: {
//     width: 2,
//     height: 10,
//     backgroundColor: "rgba(0,0,0,0.35)",
//     borderRadius: 1,
//   },
// });

// const styles = StyleSheet.create({
//   noTouch: { pointerEvents: "none" as const },
//   outer: {
//     height: OUTER_HEIGHT,
//     position: "relative",
//     marginHorizontal: HANDLE_WIDTH / 2,
//   },
//   track: {
//     position: "absolute",
//     top: HANDLE_OVERHANG,
//     left: 0,
//     right: 0,
//     height: TRACK_HEIGHT,
//     borderRadius: 5,
//     overflow: "hidden",
//     backgroundColor: "#111",
//   },
//   thumbRow: { flex: 1, flexDirection: "row", overflow: "hidden" },
//   thumb: { flex: 1, height: TRACK_HEIGHT },
//   thumbPlaceholder: { flex: 1, height: TRACK_HEIGHT },
//   dimOverlay: {
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.62)",
//   },
//   selectionBorder: {
//     position: "absolute",
//     top: 0,
//     height: TRACK_HEIGHT,
//     borderTopWidth: SELECTION_BORDER,
//     borderBottomWidth: SELECTION_BORDER,
//     borderTopColor: "#F5A623",
//     borderBottomColor: "#F5A623",
//   },
//   playhead: {
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     width: PLAYHEAD_WIDTH,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 1,
//     shadowColor: "#FFFFFF",
//     shadowOpacity: 0.9,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 0 },
//     elevation: 8,
//   },
//   handleWrap: {
//     position: "absolute",
//     top: 0,
//     width: HANDLE_WIDTH,
//     height: OUTER_HEIGHT,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });
