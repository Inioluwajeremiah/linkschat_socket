import { Ionicons } from "@expo/vector-icons";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { StyleSheet } from "react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native";
import { audioPlaybackManager } from "../../../utils/audioPlaybackManager";
// export default function AudioPlayer({
//   uri,
//   duration,
//   isOwn,
// }: {
//   uri: string;
//   duration?: number;
//   isOwn: boolean;
// }) {
//   const player = useAudioPlayer(uri);
//   const status = useAudioPlayerStatus(player);
//   const barAnim = useRef(new Animated.Value(0)).current;

//   const playing = status.playing;
//   const actualDuration = status.duration || duration || 0;
//   const currentTime = status.currentTime || 0;

//   // Keep the progress bar in sync with real playback position
//   useEffect(() => {
//     if (actualDuration > 0) {
//       barAnim.setValue(currentTime / actualDuration);
//     }
//   }, [currentTime, actualDuration]);

//   // Reset to the start once playback finishes
//   useEffect(() => {
//     if (status.didJustFinish) {
//       player.seekTo(0);
//       barAnim.setValue(0);
//     }
//   }, [status.didJustFinish]);

//   const togglePlay = async () => {
//     try {
//       await setAudioModeAsync({
//         allowsRecording: false,
//         playsInSilentMode: true,
//       });
//       if (playing) {
//         player.pause();
//       } else {
//         // If it already played to the end, restart from 0
//         if (
//           status.currentTime >= (status.duration || 0) &&
//           status.duration > 0
//         ) {
//           player.seekTo(0);
//         }
//         player.play();
//       }
//     } catch (e) {
//       console.warn("Audio playback failed", e);
//     }
//   };

//   const fmt = (s: number) =>
//     `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

//   return (
//     <View style={audioStyles.wrap}>
//       <TouchableOpacity
//         onPress={togglePlay}
//         style={[
//           audioStyles.btn,
//           {
//             backgroundColor: isOwn
//               ? "rgba(255,255,255,0.2)"
//               : "rgba(0,212,170,0.15)",
//           },
//         ]}
//       >
//         <Ionicons
//           name={playing ? "pause" : "play"}
//           size={20}
//           color={isOwn ? "#fff" : "#00d4aa"}
//         />
//       </TouchableOpacity>
//       <View style={audioStyles.waveWrap}>
//         {Array.from({ length: 20 }).map((_, i) => (
//           <View
//             key={i}
//             style={[
//               audioStyles.bar,
//               {
//                 height: 4 + Math.sin(i * 0.8) * 8,
//                 backgroundColor: isOwn ? "rgba(255,255,255,0.4)" : "#00d4aa44",
//               },
//             ]}
//           />
//         ))}
//         <Animated.View
//           style={[
//             audioStyles.progress,
//             {
//               width: barAnim.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: ["0%", "100%"],
//               }),
//               backgroundColor: isOwn ? "#fff" : "#00d4aa",
//             },
//           ]}
//         />
//       </View>
//       <Text
//         style={[
//           audioStyles.duration,
//           { color: isOwn ? "rgba(255,255,255,0.7)" : "#8888aa" },
//         ]}
//       >
//         {fmt(playing || currentTime > 0 ? currentTime : actualDuration)}
//       </Text>
//     </View>
//   );
// }

export default function AudioPlayer({
  uri,
  duration,
  isOwn,
  id, // ← new prop, pass message._id from the caller
}: {
  uri: string;
  duration?: number;
  isOwn: boolean;
  id: string;
}) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const barAnim = useRef(new Animated.Value(0)).current;

  const playing = status.playing;
  const actualDuration = status.duration || duration || 0;
  const currentTime = status.currentTime || 0;

  useEffect(() => {
    if (actualDuration > 0) {
      barAnim.setValue(currentTime / actualDuration);
    }
  }, [currentTime, actualDuration]);

  useEffect(() => {
    if (status.didJustFinish) {
      player.seekTo(0);
      barAnim.setValue(0);
      audioPlaybackManager.stop(id);
    }
  }, [status.didJustFinish]);

  // Listen for other players starting — pause self if someone else took over
  useEffect(() => {
    const unsubscribe = audioPlaybackManager.subscribe((activeId) => {
      if (activeId !== id && player.playing) {
        player.pause();
      }
    });
    return unsubscribe;
  }, [id, player]);

  // Pause + release cleanly if this bubble unmounts mid-playback
  // (e.g. scrolled out of a virtualized list) so it doesn't keep "claiming" active
  useEffect(() => {
    return () => {
      audioPlaybackManager.stop(id);
    };
  }, [id]);

  const togglePlay = async () => {
    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      if (playing) {
        player.pause();
        audioPlaybackManager.stop(id);
      } else {
        if (
          status.currentTime >= (status.duration || 0) &&
          status.duration > 0
        ) {
          player.seekTo(0);
        }
        audioPlaybackManager.play(id); // tells every other AudioPlayer to pause first
        player.play();
      }
    } catch (e) {
      // console.warn("Audio playback failed", e);
    }
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <View style={audioStyles.wrap}>
      <TouchableOpacity
        onPress={togglePlay}
        style={[
          audioStyles.btn,
          {
            backgroundColor: isOwn
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,212,170,0.15)",
          },
        ]}
      >
        <Ionicons
          name={playing ? "pause" : "play"}
          size={20}
          color={isOwn ? "#fff" : "#00d4aa"}
        />
      </TouchableOpacity>
      <View style={audioStyles.waveWrap}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={i}
            style={[
              audioStyles.bar,
              {
                height: 4 + Math.sin(i * 0.8) * 8,
                backgroundColor: isOwn ? "rgba(255,255,255,0.4)" : "#00d4aa44",
              },
            ]}
          />
        ))}
        <Animated.View
          style={[
            audioStyles.progress,
            {
              width: barAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: isOwn ? "#fff" : "#00d4aa",
            },
          ]}
        />
      </View>
      <Text
        style={[
          audioStyles.duration,
          { color: isOwn ? "rgba(255,255,255,0.7)" : "#8888aa" },
        ]}
      >
        {fmt(playing || currentTime > 0 ? currentTime : actualDuration)}
      </Text>
    </View>
  );
}

const audioStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 180 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  waveWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 28,
    position: "relative",
    overflow: "hidden",
  },
  bar: { width: 3, borderRadius: 2 },
  progress: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    opacity: 0.4,
    borderRadius: 2,
  },
  duration: { fontSize: 11, fontWeight: "600", minWidth: 32 },
});
