// // import { View, Text, StyleSheet, PanResponder, Dimensions } from "react-native";
// // import { useEffect, useRef, useState } from "react";
// // import { Image } from "expo-image";
// // import { createVideoPlayer, VideoThumbnail } from "expo-video";

// // const { width: SCREEN_W } = Dimensions.get("window");
// // const TRACK_WIDTH = SCREEN_W - 32;
// // const HANDLE_WIDTH = 18;
// // const THUMB_COUNT = 8;

// // interface Props {
// //   uri: string;
// //   durationMs: number;
// //   maxTrimSeconds?: number;
// //   onChange: (startSec: number, endSec: number) => void;
// // }

// // export default function VideoTrimmer({
// //   uri,
// //   durationMs,
// //   maxTrimSeconds = 30,
// //   onChange,
// // }: Props) {
// //   const durationSec = durationMs / 1000;
// //   const maxWindowSec = Math.min(maxTrimSeconds, durationSec);
// //   const maxWindowPx = (maxWindowSec / durationSec) * TRACK_WIDTH;

// //   const [thumbs, setThumbs] = useState<VideoThumbnail[]>([]);
// //   const [startX, setStartX] = useState(0);
// //   const [endX, setEndX] = useState(Math.min(TRACK_WIDTH, maxWindowPx));

// //   // Refs mirror the latest state so the PanResponder closures (built once
// //   // and never recreated) always read current values instead of whatever
// //   // startX/endX happened to be on first render.
// //   const startXRef = useRef(startX);
// //   const endXRef = useRef(endX);
// //   useEffect(() => {
// //     startXRef.current = startX;
// //   }, [startX]);
// //   useEffect(() => {
// //     endXRef.current = endX;
// //   }, [endX]);

// //   // Captures the handle's position at the moment each drag begins, so we
// //   // can compute `dragStart + gestureState.dx` instead of incorrectly
// //   // accumulating the already-cumulative dx onto itself on every move event.
// //   const dragStartRef = useRef(0);

// //   useEffect(() => {
// //     let cancelled = false;
// //     let player: ReturnType<typeof createVideoPlayer> | null = null;

// //     (async () => {
// //       try {
// //         player = createVideoPlayer(uri);
// //         const times = Array.from(
// //           { length: THUMB_COUNT },
// //           (_, i) => (durationMs / THUMB_COUNT) * i
// //         );
// //         const results = await player.generateThumbnailsAsync(times);
// //         if (!cancelled) setThumbs(results);
// //       } catch (e) {
// //         console.warn("Thumbnail generation failed", e);
// //       } finally {
// //         player?.release();
// //       }
// //     })();

// //     return () => {
// //       cancelled = true;
// //       player?.release();
// //     };
// //   }, [uri]);

// //   const pxToSec = (px: number) => (px / TRACK_WIDTH) * durationSec;

// //   const startResponder = useRef(
// //     PanResponder.create({
// //       onStartShouldSetPanResponder: () => true,
// //       onMoveShouldSetPanResponder: () => true,
// //       onPanResponderTerminationRequest: () => false,
// //       onShouldBlockNativeResponder: () => true,
// //       onPanResponderGrant: () => {
// //         dragStartRef.current = startXRef.current;
// //       },
// //       onPanResponderMove: (_, g) => {
// //         let next = dragStartRef.current + g.dx;
// //         next = Math.max(0, next);
// //         if (endXRef.current - next > maxWindowPx)
// //           next = endXRef.current - maxWindowPx;
// //         if (next > endXRef.current - 10) next = endXRef.current - 10;
// //         setStartX(next);
// //       },
// //       onPanResponderRelease: () =>
// //         onChange(pxToSec(startXRef.current), pxToSec(endXRef.current)),
// //     })
// //   ).current;

// //   const endResponder = useRef(
// //     PanResponder.create({
// //       onStartShouldSetPanResponder: () => true,
// //       onMoveShouldSetPanResponder: () => true,
// //       onPanResponderTerminationRequest: () => false,
// //       onShouldBlockNativeResponder: () => true,
// //       onPanResponderGrant: () => {
// //         dragStartRef.current = endXRef.current;
// //       },
// //       onPanResponderMove: (_, g) => {
// //         let next = dragStartRef.current + g.dx;
// //         next = Math.min(TRACK_WIDTH, next);
// //         if (next - startXRef.current > maxWindowPx)
// //           next = startXRef.current + maxWindowPx;
// //         if (next < startXRef.current + 10) next = startXRef.current + 10;
// //         setEndX(next);
// //       },
// //       onPanResponderRelease: () =>
// //         onChange(pxToSec(startXRef.current), pxToSec(endXRef.current)),
// //     })
// //   ).current;

// //   useEffect(() => {
// //     onChange(pxToSec(startX), pxToSec(endX));
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [thumbs.length]);

// //   return (
// //     <View style={styles.wrap}>
// //       <View style={styles.track}>
// //         <View style={styles.filmstrip}>
// //           {thumbs.length > 0
// //             ? thumbs.map((t, i) => (
// //                 <Image
// //                   key={i}
// //                   source={t}
// //                   style={styles.thumb}
// //                   contentFit="cover"
// //                 />
// //               ))
// //             : Array.from({ length: THUMB_COUNT }).map((_, i) => (
// //                 <View
// //                   key={i}
// //                   style={[styles.thumb, { backgroundColor: "#222" }]}
// //                 />
// //               ))}
// //         </View>

// //         <View style={[styles.dim, { left: 0, width: startX }]} />
// //         <View style={[styles.dim, { left: endX, width: TRACK_WIDTH - endX }]} />
// //         <View
// //           style={[
// //             styles.selectionBorder,
// //             { left: startX, width: endX - startX },
// //           ]}
// //         />

// //         <View
// //           {...startResponder.panHandlers}
// //           style={[styles.handle, { left: startX - HANDLE_WIDTH / 2 }]}
// //         >
// //           <View style={styles.handleGrip} />
// //         </View>
// //         <View
// //           {...endResponder.panHandlers}
// //           style={[styles.handle, { left: endX - HANDLE_WIDTH / 2 }]}
// //         >
// //           <View style={styles.handleGrip} />
// //         </View>
// //       </View>
// //       <Text style={styles.durationLabel}>
// //         {(pxToSec(endX) - pxToSec(startX)).toFixed(1)}s selected · max{" "}
// //         {maxWindowSec.toFixed(0)}s
// //       </Text>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   wrap: { paddingHorizontal: 16, paddingVertical: 12 },
// //   track: { height: 56, position: "relative" },
// //   filmstrip: {
// //     flexDirection: "row",
// //     height: 56,
// //     borderRadius: 8,
// //     overflow: "hidden",
// //   },
// //   thumb: { flex: 1, height: 56 },
// //   dim: {
// //     position: "absolute",
// //     top: 0,
// //     height: 56,
// //     backgroundColor: "rgba(0,0,0,0.6)",
// //   },
// //   selectionBorder: {
// //     position: "absolute",
// //     top: -2,
// //     height: 60,
// //     borderWidth: 2,
// //     borderColor: "#00d4aa",
// //     borderRadius: 8,
// //   },
// //   handle: {
// //     position: "absolute",
// //     top: -8,
// //     width: HANDLE_WIDTH,
// //     height: 72,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   handleGrip: {
// //     width: 6,
// //     height: 40,
// //     borderRadius: 3,
// //     backgroundColor: "#00d4aa",
// //   },
// //   durationLabel: {
// //     color: "#fff",
// //     fontSize: 12,
// //     textAlign: "center",
// //     marginTop: 8,
// //     fontWeight: "600",
// //   },
// // });

// import { View, Text, StyleSheet, Dimensions } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { Image } from "expo-image";
// import { createVideoPlayer, VideoThumbnail } from "expo-video";
// import {
//   GestureHandlerRootView,
//   GestureDetector,
//   Gesture,
// } from "react-native-gesture-handler";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   runOnJS,
//   clamp,
//   SharedValue,
// } from "react-native-reanimated";

// const { width: SCREEN_W } = Dimensions.get("window");
// const TRACK_WIDTH = SCREEN_W - 48;
// const HANDLE_W = 22;
// const THUMB_COUNT = 8;
// const MIN_SELECTION_PX = 20;

// interface Props {
//   uri: string;
//   durationMs: number;
//   maxTrimSeconds?: number;
//   onChange: (startSec: number, endSec: number) => void;
// }

// export default function VideoTrimmer({
//   uri,
//   durationMs,
//   maxTrimSeconds = 30,
//   onChange,
// }: Props) {
//   const durationSec = durationMs / 1000;
//   const maxWindowSec = Math.min(maxTrimSeconds, durationSec);
//   const maxWindowPx = (maxWindowSec / durationSec) * TRACK_WIDTH;

//   const [thumbs, setThumbs] = useState<VideoThumbnail[]>([]);

//   // Shared values for Reanimated — live on the UI thread
//   const startX = useSharedValue(0);
//   const endX = useSharedValue(Math.min(TRACK_WIDTH, maxWindowPx));

//   // Capture position at gesture start
//   const startDragOrigin = useSharedValue(0);
//   const endDragOrigin = useSharedValue(0);

//   const pxToSec = (px: number) => (px / TRACK_WIDTH) * durationSec;

//   const notifyChange = (sx: number, ex: number) => {
//     onChange(pxToSec(sx), pxToSec(ex));
//   };

//   // ── Generate thumbnails ────────────────────────────────────────────────────
//   useEffect(() => {
//     let cancelled = false;
//     let player: ReturnType<typeof createVideoPlayer> | null = null;

//     (async () => {
//       try {
//         player = createVideoPlayer(uri);
//         const times = Array.from(
//           { length: THUMB_COUNT },
//           (_, i) => (durationMs / THUMB_COUNT) * i
//         );
//         const results = await player.generateThumbnailsAsync(times);
//         if (!cancelled) {
//           setThumbs(results);
//           notifyChange(startX.value, endX.value);
//         }
//       } catch (e) {
//         console.warn("Thumbnail generation failed", e);
//       } finally {
//         player?.release();
//       }
//     })();

//     return () => {
//       cancelled = true;
//       player?.release();
//     };
//   }, [uri]);

//   // ── Left handle gesture ────────────────────────────────────────────────────
//   const leftGesture = Gesture.Pan()
//     .minDistance(0)
//     .onBegin(() => {
//       startDragOrigin.value = startX.value;
//     })
//     .onUpdate((e) => {
//       let next = startDragOrigin.value + e.translationX;
//       // Can't go below 0
//       next = Math.max(0, next);
//       // Can't exceed max window
//       if (endX.value - next > maxWindowPx) {
//         next = endX.value - maxWindowPx;
//       }
//       // Must stay behind end handle
//       if (next > endX.value - MIN_SELECTION_PX) {
//         next = endX.value - MIN_SELECTION_PX;
//       }
//       startX.value = next;
//     })
//     .onEnd(() => {
//       runOnJS(notifyChange)(startX.value, endX.value);
//     });

//   // ── Right handle gesture ───────────────────────────────────────────────────
//   const rightGesture = Gesture.Pan()
//     .minDistance(0)
//     .onBegin(() => {
//       endDragOrigin.value = endX.value;
//     })
//     .onUpdate((e) => {
//       let next = endDragOrigin.value + e.translationX;
//       // Can't exceed track width
//       next = Math.min(TRACK_WIDTH, next);
//       // Can't exceed max window
//       if (next - startX.value > maxWindowPx) {
//         next = startX.value + maxWindowPx;
//       }
//       // Must stay ahead of start handle
//       if (next < startX.value + MIN_SELECTION_PX) {
//         next = startX.value + MIN_SELECTION_PX;
//       }
//       endX.value = next;
//     })
//     .onEnd(() => {
//       runOnJS(notifyChange)(startX.value, endX.value);
//     });

//   // ── Animated styles ────────────────────────────────────────────────────────
//   const leftDimStyle = useAnimatedStyle(() => ({
//     width: startX.value,
//   }));

//   const rightDimStyle = useAnimatedStyle(() => ({
//     left: endX.value,
//     width: TRACK_WIDTH - endX.value,
//   }));

//   const selectionStyle = useAnimatedStyle(() => ({
//     left: startX.value,
//     width: endX.value - startX.value,
//   }));

//   const leftHandleStyle = useAnimatedStyle(() => ({
//     left: startX.value - HANDLE_W / 2,
//   }));

//   const rightHandleStyle = useAnimatedStyle(() => ({
//     left: endX.value - HANDLE_W / 2,
//   }));

//   const durationStyle = useAnimatedStyle(() => {
//     const sec = pxToSec(endX.value) - pxToSec(startX.value);
//     return {}; // text updates via JS — see DurationLabel below
//   });

//   return (
//     <GestureHandlerRootView>
//       <View style={styles.wrap}>
//         {/* ── Label ── */}
//         <View style={styles.labelRow}>
//           <Text style={styles.labelText}>Trim Video</Text>
//           <Text style={styles.maxLabel}>max {maxWindowSec.toFixed(0)}s</Text>
//         </View>

//         {/* ── Track ── */}
//         <View style={styles.trackWrap}>
//           {/* Filmstrip */}
//           <View style={styles.filmstrip}>
//             {thumbs.length > 0
//               ? thumbs.map((t, i) => (
//                   <Image
//                     key={i}
//                     source={t}
//                     style={styles.thumb}
//                     contentFit="cover"
//                   />
//                 ))
//               : Array.from({ length: THUMB_COUNT }).map((_, i) => (
//                   <View
//                     key={i}
//                     style={[styles.thumb, styles.thumbPlaceholder]}
//                   />
//                 ))}
//           </View>

//           {/* Dim left */}
//           <Animated.View style={[styles.dim, styles.dimLeft, leftDimStyle]} />

//           {/* Dim right */}
//           <Animated.View
//             style={[styles.dim, styles.dimRight, rightDimStyle]}
//           />

//           {/* Selection border */}
//           <Animated.View style={[styles.selectionBorder, selectionStyle]} />

//           {/* Left handle */}
//           <GestureDetector gesture={leftGesture}>
//             <Animated.View style={[styles.handle, leftHandleStyle]}>
//               <View style={styles.handleInner}>
//                 <View style={styles.grip} />
//                 <View style={styles.grip} />
//                 <View style={styles.grip} />
//               </View>
//             </Animated.View>
//           </GestureDetector>

//           {/* Right handle */}
//           <GestureDetector gesture={rightGesture}>
//             <Animated.View style={[styles.handle, rightHandleStyle]}>
//               <View style={styles.handleInner}>
//                 <View style={styles.grip} />
//                 <View style={styles.grip} />
//                 <View style={styles.grip} />
//               </View>
//             </Animated.View>
//           </GestureDetector>
//         </View>

//         {/* ── Duration display ── */}
//         <DurationLabel
//           startX={startX}
//           endX={endX}
//           pxToSec={pxToSec}
//           maxSec={maxWindowSec}
//         />
//       </View>
//     </GestureHandlerRootView>
//   );
// }

// // Separate component so it can re-render independently from animated values
// function DurationLabel({
//   startX,
//   endX,
//   pxToSec,
//   maxSec,
// }: {
//   startX: SharedValue<number>;
//   endX: SharedValue<number>;
//   pxToSec: (px: number) => number;
//   maxSec: number;
// }) {
//   const [selected, setSelected] = useState(0);

//   const style = useAnimatedStyle(() => {
//     runOnJS(setSelected)(pxToSec(endX.value) - pxToSec(startX.value));
//     return {};
//   });

//   // Dummy animated view to hook into reanimated
//   return (
//     <>
//       <Animated.View style={style} />
//       <View style={styles.durationRow}>
//         <View style={styles.durationChip}>
//           <Text style={styles.durationText}>
//             {selected.toFixed(1)}s selected
//           </Text>
//         </View>
//         <View style={[styles.durationChip, styles.maxChip]}>
//           <Text style={styles.maxChipText}>max {maxSec.toFixed(0)}s</Text>
//         </View>
//       </View>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   wrap: {
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//   },
//   labelRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   labelText: {
//     color: "#fff",
//     fontSize: 13,
//     fontWeight: "700",
//     letterSpacing: 0.5,
//   },
//   maxLabel: {
//     color: "#8888aa",
//     fontSize: 12,
//   },
//   trackWrap: {
//     height: 60,
//     position: "relative",
//     borderRadius: 10,
//     overflow: "visible",
//   },
//   filmstrip: {
//     flexDirection: "row",
//     height: 60,
//     borderRadius: 10,
//     overflow: "hidden",
//     backgroundColor: "#1a1a2e",
//   },
//   thumb: {
//     flex: 1,
//     height: 60,
//   },
//   thumbPlaceholder: {
//     backgroundColor: "#1a1a2e",
//     borderRightWidth: StyleSheet.hairlineWidth,
//     borderRightColor: "#222240",
//   },
//   dim: {
//     position: "absolute",
//     top: 0,
//     height: 60,
//     backgroundColor: "rgba(0,0,0,0.65)",
//   },
//   dimLeft: { left: 0 },
//   dimRight: {},
//   selectionBorder: {
//     position: "absolute",
//     top: -2,
//     height: 64,
//     borderWidth: 2.5,
//     borderColor: "#00d4aa",
//     borderRadius: 10,
//     // Glow effect
//     shadowColor: "#00d4aa",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.6,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   handle: {
//     position: "absolute",
//     top: -6,
//     width: HANDLE_W,
//     height: 72,
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 10,
//   },
//   handleInner: {
//     width: HANDLE_W,
//     height: 52,
//     borderRadius: 6,
//     backgroundColor: "#00d4aa",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 4,
//     // Shadow
//     shadowColor: "#00d4aa",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.5,
//     shadowRadius: 6,
//     elevation: 6,
//   },
//   grip: {
//     width: 2.5,
//     height: 14,
//     borderRadius: 2,
//     backgroundColor: "rgba(255,255,255,0.7)",
//   },
//   durationRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//     marginTop: 12,
//   },
//   durationChip: {
//     backgroundColor: "rgba(255,255,255,0.08)",
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     borderRadius: 99,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   durationText: {
//     color: "#00d4aa",
//     fontSize: 12,
//     fontWeight: "700",
//   },
//   maxChip: {
//     backgroundColor: "rgba(91,141,238,0.1)",
//     borderColor: "rgba(91,141,238,0.2)",
//   },
//   maxChipText: {
//     color: "#5b8dee",
//     fontSize: 12,
//     fontWeight: "600",
//   },
// });

import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { createVideoPlayer, VideoThumbnail } from "expo-video";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_W } = Dimensions.get("window");
const TRACK_WIDTH = SCREEN_W - 48;
const HANDLE_W = 22;
const THUMB_COUNT = 5; // ← reduced from 8 to avoid OOM
const MIN_SELECTION_PX = 20;

interface Props {
  uri: string;
  durationMs: number;
  maxTrimSeconds?: number;
  onChange: (startSec: number, endSec: number) => void;
}

export default function VideoTrimmer({
  uri,
  durationMs,
  maxTrimSeconds = 30,
  onChange,
}: Props) {
  const durationSec = durationMs / 1000;
  const maxWindowSec = Math.min(maxTrimSeconds, durationSec);
  const maxWindowPx = (maxWindowSec / durationSec) * TRACK_WIDTH;

  const [thumbs, setThumbs] = useState<VideoThumbnail[]>([]);
  const [selectedSec, setSelectedSec] = useState(maxWindowSec);

  const startX = useSharedValue(0);
  const endX = useSharedValue(Math.min(TRACK_WIDTH, maxWindowPx));

  const startDragOrigin = useSharedValue(0);
  const endDragOrigin = useSharedValue(0);

  // ── Must be a worklet — called on UI thread ────────────────────────────────
  const pxToSec = (px: number) => {
    "worklet";
    return (px / TRACK_WIDTH) * durationSec;
  };

  const notifyChange = (sx: number, ex: number) => {
    onChange(pxToSec(sx), pxToSec(ex));
  };

  // ── Generate thumbnails with memory guard ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let player: ReturnType<typeof createVideoPlayer> | null = null;

    (async () => {
      try {
        player = createVideoPlayer(uri);

        // Spread timestamps evenly, skip first frame (often blank)
        const times = Array.from(
          { length: THUMB_COUNT },
          (_, i) => ((i + 0.5) / THUMB_COUNT) * durationMs
        );

        const results = await player.generateThumbnailsAsync(times);
        if (!cancelled) {
          setThumbs(results);
          notifyChange(startX.value, endX.value);
        }
      } catch (e) {
        console.warn("Thumbnail generation failed:", e);
        // Silently fall back to placeholder blocks — trimmer still works
      } finally {
        try {
          player?.release();
        } catch {}
      }
    })();

    return () => {
      cancelled = true;
      try {
        player?.release();
      } catch {}
    };
  }, [uri]);

  // ── Left handle gesture ────────────────────────────────────────────────────
  const leftGesture = Gesture.Pan()
    .minDistance(0)
    .onBegin(() => {
      startDragOrigin.value = startX.value;
    })
    .onUpdate((e) => {
      let next = startDragOrigin.value + e.translationX;
      next = Math.max(0, next);
      if (endX.value - next > maxWindowPx) {
        next = endX.value - maxWindowPx;
      }
      if (next > endX.value - MIN_SELECTION_PX) {
        next = endX.value - MIN_SELECTION_PX;
      }
      startX.value = next;
      runOnJS(setSelectedSec)(pxToSec(endX.value) - pxToSec(next));
    })
    .onEnd(() => {
      runOnJS(notifyChange)(startX.value, endX.value);
    });

  // ── Right handle gesture ───────────────────────────────────────────────────
  const rightGesture = Gesture.Pan()
    .minDistance(0)
    .onBegin(() => {
      endDragOrigin.value = endX.value;
    })
    .onUpdate((e) => {
      let next = endDragOrigin.value + e.translationX;
      next = Math.min(TRACK_WIDTH, next);
      if (next - startX.value > maxWindowPx) {
        next = startX.value + maxWindowPx;
      }
      if (next < startX.value + MIN_SELECTION_PX) {
        next = startX.value + MIN_SELECTION_PX;
      }
      endX.value = next;
      runOnJS(setSelectedSec)(pxToSec(next) - pxToSec(startX.value));
    })
    .onEnd(() => {
      runOnJS(notifyChange)(startX.value, endX.value);
    });

  // ── Animated styles ────────────────────────────────────────────────────────
  const leftDimStyle = useAnimatedStyle(() => ({
    width: startX.value,
  }));

  const rightDimStyle = useAnimatedStyle(() => ({
    left: endX.value,
    width: TRACK_WIDTH - endX.value,
  }));

  const selectionStyle = useAnimatedStyle(() => ({
    left: startX.value,
    width: endX.value - startX.value,
  }));

  const leftHandleStyle = useAnimatedStyle(() => ({
    left: startX.value - HANDLE_W / 2,
  }));

  const rightHandleStyle = useAnimatedStyle(() => ({
    left: endX.value - HANDLE_W / 2,
  }));

  return (
    <GestureHandlerRootView>
      <View style={styles.wrap}>
        {/* ── Header ── */}
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>Trim Video</Text>
          <Text style={styles.maxLabel}>max {maxWindowSec.toFixed(0)}s</Text>
        </View>

        {/* ── Track ── */}
        <View style={styles.trackWrap}>
          {/* Filmstrip */}
          <View style={styles.filmstrip}>
            {thumbs.length > 0
              ? thumbs.map((t, i) => (
                  <Image
                    key={i}
                    source={t}
                    style={styles.thumb}
                    contentFit="cover"
                  />
                ))
              : Array.from({ length: THUMB_COUNT }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.thumb, styles.thumbPlaceholder]}
                  />
                ))}
          </View>

          {/* Dim: left of selection */}
          <Animated.View style={[styles.dim, styles.dimLeft, leftDimStyle]} />

          {/* Dim: right of selection */}
          <Animated.View style={[styles.dim, styles.dimRight, rightDimStyle]} />

          {/* Selection border */}
          <Animated.View style={[styles.selectionBorder, selectionStyle]} />

          {/* Left handle */}
          <GestureDetector gesture={leftGesture}>
            <Animated.View style={[styles.handle, leftHandleStyle]}>
              <View style={styles.handleInner}>
                <View style={styles.grip} />
                <View style={styles.grip} />
                <View style={styles.grip} />
              </View>
            </Animated.View>
          </GestureDetector>

          {/* Right handle */}
          <GestureDetector gesture={rightGesture}>
            <Animated.View style={[styles.handle, rightHandleStyle]}>
              <View style={styles.handleInner}>
                <View style={styles.grip} />
                <View style={styles.grip} />
                <View style={styles.grip} />
              </View>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* ── Duration chips ── */}
        <View style={styles.durationRow}>
          <View style={styles.durationChip}>
            <Text style={styles.durationText}>
              {selectedSec.toFixed(1)}s selected
            </Text>
          </View>
          <View style={[styles.durationChip, styles.maxChip]}>
            <Text style={styles.maxChipText}>
              max {maxWindowSec.toFixed(0)}s
            </Text>
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  labelText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  maxLabel: {
    color: "#8888aa",
    fontSize: 12,
  },
  trackWrap: {
    height: 60,
    position: "relative",
    borderRadius: 10,
    overflow: "visible",
  },
  filmstrip: {
    flexDirection: "row",
    height: 60,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1a1a2e",
  },
  thumb: {
    flex: 1,
    height: 60,
  },
  thumbPlaceholder: {
    backgroundColor: "#1a1a2e",
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: "#222240",
  },
  dim: {
    position: "absolute",
    top: 0,
    height: 60,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  dimLeft: { left: 0 },
  dimRight: {},
  selectionBorder: {
    position: "absolute",
    top: -2,
    height: 64,
    borderWidth: 2.5,
    borderColor: "#00d4aa",
    borderRadius: 10,
    shadowColor: "#00d4aa",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  handle: {
    position: "absolute",
    top: -6,
    width: HANDLE_W,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  handleInner: {
    width: HANDLE_W,
    height: 52,
    borderRadius: 6,
    backgroundColor: "#00d4aa",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    shadowColor: "#00d4aa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  grip: {
    width: 2.5,
    height: 14,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  durationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  durationChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  durationText: {
    color: "#00d4aa",
    fontSize: 12,
    fontWeight: "700",
  },
  maxChip: {
    backgroundColor: "rgba(91,141,238,0.1)",
    borderColor: "rgba(91,141,238,0.2)",
  },
  maxChipText: {
    color: "#5b8dee",
    fontSize: 12,
    fontWeight: "600",
  },
});
