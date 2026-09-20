// import { useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useAppSelector } from "../hooks/useRedux";
// import { socketService } from "../services/socket";

// /**
//  * Drop this at the top of a group chat screen, passing that chat's id.
//  * Renders nothing if there's no active call in that chat; otherwise
//  * shows a pulsing "call in progress — Join" banner. Self-contained —
//  * reads Redux state populated by useSocket.ts's call:ongoing/call:ended
//  * listeners, no props beyond chatId needed.
//  */
// export default function OngoingCallBanner({ chatId }: { chatId: string }) {
//   const router = useRouter();
//   const call = useAppSelector((s) => s.ongoingCalls.byChatId[chatId]);
//   const pulseAnim = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     if (!call) return;
//     const loop = Animated.loop(
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
//     loop.start();
//     return () => loop.stop();
//   }, [call]);

//   if (!call) return null;

//   const handleJoin = () => {
//     // Reuses CallScreen's existing incoming-call join path unmodified —
//     // it just joins the Stream room by callId regardless of who invited
//     // you, so no changes were needed there for this to work.
//     socketService
//       .getSocket()
//       ?.emit("call:join-ongoing", { callId: call.callId });

//     router.push({
//       pathname: "/call/[id]",
//       params: {
//         id: chatId,
//         type: call.type,
//         callId: call.callId,
//         isIncoming: "1",
//       },
//     });
//   };

//   return (
//     <TouchableOpacity onPress={handleJoin} activeOpacity={0.85}>
//       <LinearGradient
//         colors={
//           call.type === "video"
//             ? ["#5b8dee", "#3a6bc9"]
//             : ["#00d4aa", "#00b090"]
//         }
//         style={styles.banner}
//       >
//         <Animated.View
//           style={[styles.iconWrap, { transform: [{ scale: pulseAnim }] }]}
//         >
//           <Ionicons
//             name={call.type === "video" ? "videocam" : "call"}
//             size={16}
//             color="#fff"
//           />
//         </Animated.View>
//         <Text style={styles.text} numberOfLines={1}>
//           {call.type === "video" ? "Video call" : "Voice call"} in progress
//           {call.joinedCount > 0 ? ` · ${call.joinedCount} in call` : ""}
//         </Text>
//         <View style={styles.joinPill}>
//           <Text style={styles.joinText}>Join</Text>
//         </View>
//       </LinearGradient>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   banner: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     gap: 10,
//   },
//   iconWrap: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: "rgba(255,255,255,0.25)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   text: { flex: 1, color: "#fff", fontSize: 13, fontWeight: "700" },
//   joinPill: {
//     backgroundColor: "rgba(255,255,255,0.25)",
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     borderRadius: 99,
//   },
//   joinText: { color: "#fff", fontSize: 13, fontWeight: "800" },
// });

import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppSelector } from "../hooks/useRedux";
import { socketService } from "../services/socket";

/**
 * Drop this at the top of a group chat screen, passing that chat's id.
 * Renders nothing if there's no active call in that chat; otherwise
 * shows a pulsing banner. If this device is already in the call (tracked
 * via myCallSlice, set the moment CallScreen's call.join() succeeds), it
 * shows "Return to call" instead of "Join" and skips re-emitting
 * call:join-ongoing — the server already knows this device is in.
 */
export default function OngoingCallBanner({ chatId }: { chatId: string }) {
  const router = useRouter();
  const call = useAppSelector((s) => s.ongoingCalls.byChatId[chatId]);
  const myActiveCall = useAppSelector((s) => s.myCall.active);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const alreadyJoined = !!call && myActiveCall?.callId === call.callId;

  useEffect(() => {
    if (!call) return;
    const loop = Animated.loop(
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
    loop.start();
    return () => loop.stop();
  }, [call]);

  if (!call) return null;

  const handlePress = () => {
    // Only tell the server we're joining if we actually aren't already —
    // re-emitting call:join-ongoing for a call we're already in is
    // harmless server-side (it'd just re-add an id already in the Set),
    // but there's no reason to send it.
    if (!alreadyJoined) {
      socketService
        .getSocket()
        ?.emit("call:join-ongoing", { callId: call.callId });
    }

    router.push({
      pathname: "/call/[id]",
      params: {
        id: chatId,
        type: call.type,
        callId: call.callId,
        isIncoming: "1",
      },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <LinearGradient
        colors={
          call.type === "video"
            ? ["#5b8dee", "#3a6bc9"]
            : ["#00d4aa", "#00b090"]
        }
        style={styles.banner}
      >
        <Animated.View
          style={[styles.iconWrap, { transform: [{ scale: pulseAnim }] }]}
        >
          <Ionicons
            name={call.type === "video" ? "videocam" : "call"}
            size={16}
            color="#fff"
          />
        </Animated.View>
        <Text style={styles.text} numberOfLines={1}>
          {alreadyJoined
            ? "You're in this call"
            : `${
                call.type === "video" ? "Video call" : "Voice call"
              } in progress`}
          {call.joinedCount > 0 ? ` · ${call.joinedCount} in call` : ""}
        </Text>
        <View style={styles.joinPill}>
          <Text style={styles.joinText}>
            {alreadyJoined ? "Return" : "Join"}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  text: { flex: 1, color: "#fff", fontSize: 13, fontWeight: "700" },
  joinPill: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
  },
  joinText: { color: "#fff", fontSize: 13, fontWeight: "800" },
});
