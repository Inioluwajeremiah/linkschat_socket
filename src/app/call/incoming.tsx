// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
// } from "react-native";
// import { useEffect, useRef } from "react";
// import { useRouter } from "expo-router";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import { Image } from "expo-image";
// import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
// import { clearCall } from "../../store/slices/callSlice";
// import { socketService } from "../../services/socket";
// import { useTheme } from "../../context/ThemeContext";
// import { useContactNameResolver } from "@/hooks/useContactName";
// import { useRingtone } from "@/hooks/useRingTone";

// export default function IncomingCallScreen() {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const resolveContact = useContactNameResolver();
//   const { colors } = useTheme();
//   const callData = useAppSelector((s) => s.call.incomingCall);
//   useRingtone(!!callData);

//   // Tracks whether WE are the ones clearing incomingCall (via accept/
//   // reject), as opposed to it being cleared out from under us externally
//   // (caller hung up, someone else answered). Without this, dispatching
//   // clearCall() inside handleAccept re-triggers the auto-dismiss effect
//   // below and immediately navigates back off the call screen we just
//   // pushed to — which is why tapping Accept could appear to do nothing.
//   const navigatingAwayRef = useRef(false);

//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const ring1Anim = useRef(new Animated.Value(1)).current;
//   const ring2Anim = useRef(new Animated.Value(1)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 400,
//       useNativeDriver: true,
//     }).start();

//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1.06,
//           duration: 900,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 900,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();

//     const ringAnim = (anim: Animated.Value, delay: number) =>
//       Animated.loop(
//         Animated.sequence([
//           Animated.delay(delay),
//           Animated.parallel([
//             Animated.timing(anim, {
//               toValue: 1.5,
//               duration: 1600,
//               useNativeDriver: true,
//             }),
//           ]),
//           Animated.timing(anim, {
//             toValue: 1,
//             duration: 0,
//             useNativeDriver: true,
//           }),
//         ])
//       );
//     ringAnim(ring1Anim, 0).start();
//     ringAnim(ring2Anim, 800).start();
//   }, []);

//   useEffect(() => {
//     if (!callData && !navigatingAwayRef.current) {
//       if (router.canGoBack()) {
//         router.back();
//       }
//     }
//   }, [callData, router]);

//   // if (!callData) {
//   //   return (
//   //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//   //       <Text>No call Data</Text>
//   //     </View>
//   //   );
//   // }

//   // ── 1. Fix the effect itself — add a fallback for when there's nothing
//   // to go back to, instead of silently doing nothing: ──

//   useEffect(() => {
//     if (!callData && !navigatingAwayRef.current) {
//       if (router.canGoBack()) {
//         router.back();
//       } else {
//         // No screen behind this one — e.g. the app was killed and the user
//         // tapped a call push notification, launching straight into this
//         // screen. router.back() would be a no-op here, leaving the user
//         // stuck with nothing on screen. Send them somewhere real instead.
//         router.replace("/(tabs)");
//       }
//     }
//   }, [callData, router]);

//   // ── 2. Replace the !callData branch with this. Auto-recovery above means
//   // this is rarely seen for more than an instant, but if it IS seen —
//   // slow navigation, router not ready yet, anything — it now reads as a
//   // deliberate screen with a real way out, not a debug dump. ──
//   //
//   // Requires this import added if not already present:
//   //   import { LinearGradient } from "expo-linear-gradient";

//   if (!callData) {
//     return (
//       <View style={styles.container}>
//         <StatusBar style="light" />
//         <LinearGradient
//           colors={["#050510", "#0f0f28", "#050510"]}
//           style={StyleSheet.absoluteFillObject}
//         />
//         <View style={[styles.glow, { backgroundColor: "#555577" }]} />

//         <View style={unavailableStyles.content}>
//           <View style={unavailableStyles.iconWrap}>
//             <Ionicons
//               name="call-outline"
//               size={36}
//               color="rgba(255,255,255,0.5)"
//             />
//           </View>
//           <Text style={unavailableStyles.title}>Call unavailable</Text>
//           <Text style={unavailableStyles.subtitle}>
//             This call has ended or is no longer available.
//           </Text>

//           <TouchableOpacity
//             style={unavailableStyles.actionBtn}
//             onPress={() => router.replace("/(tabs)")}
//             activeOpacity={0.85}
//           >
//             <Text style={unavailableStyles.actionText}>Back to Chats</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   const isVideo = callData.type === "video";
//   const isGroup = !!callData.isGroup;

//   const handleAccept = () => {
//     navigatingAwayRef.current = true;

//     // This was previously commented out — without it, the caller never
//     // received call:accepted and would sit on the ringing screen until
//     // the 60s no-answer timeout, even though the callee had connected.
//     socketService.acceptCall(callData.callId, callData.callerId);

//     router.replace({
//       pathname: "/call/[id]",
//       params: {
//         id: callData.chatId || callData.callerId,
//         type: callData.type,
//         callId: callData.callId,
//         isIncoming: "1",
//       },
//     });

//     dispatch(clearCall());
//   };

//   const handleReject = () => {
//     navigatingAwayRef.current = true;
//     socketService.rejectCall(callData.callId, callData.callerId);
//     dispatch(clearCall());
//     router.back();
//   };

//   const { displayName, isContact: isContactSaved } = isGroup
//     ? { displayName: callData.groupName || "Group call", isContact: false }
//     : resolveContact(callData?.callerPhone?.toString(), callData.callerName);

//   // const displayName = isGroup
//   //   ? callData.groupName || "Group call"
//   //   : callData.callerName;
//   const displayAvatar = isGroup ? callData.groupAvatar : callData.callerAvatar;

//   const initials = displayName
//     .split(" ")
//     .map((w) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   return (
//     <View style={styles.container}>
//       <StatusBar style="light" />
//       <LinearGradient
//         colors={
//           isVideo
//             ? ["#050520", "#0f1535", "#050520"]
//             : ["#050510", "#0f0f28", "#050510"]
//         }
//         style={StyleSheet.absoluteFillObject}
//       />
//       <View
//         style={[
//           styles.glow,
//           { backgroundColor: isVideo ? "#5b8dee" : "#00d4aa" },
//         ]}
//       />

//       <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
//         <Text style={styles.callTypeLabel}>
//           {isVideo
//             ? isGroup
//               ? "📹 Incoming Group Video Call"
//               : "📹 Incoming Video Call"
//             : isGroup
//             ? "📞 Incoming Group Voice Call"
//             : "📞 Incoming Voice Call"}
//         </Text>

//         <View style={styles.avatarContainer}>
//           <Animated.View
//             style={[
//               styles.ring,
//               styles.ring2,
//               {
//                 transform: [{ scale: ring2Anim }],
//                 borderColor: isVideo ? "#5b8dee40" : "#00d4aa40",
//               },
//             ]}
//           />
//           <Animated.View
//             style={[
//               styles.ring,
//               styles.ring1,
//               {
//                 transform: [{ scale: ring1Anim }],
//                 borderColor: isVideo ? "#5b8dee60" : "#00d4aa60",
//               },
//             ]}
//           />
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
//         </View>

//         <Text style={styles.callerName}>{displayName}</Text>
//         <Text style={styles.callerSub}>
//           {isGroup ? `${callData.callerName} is calling` : "is calling you…"}
//         </Text>

//         <View style={styles.actions}>
//           <View style={styles.actionWrap}>
//             <TouchableOpacity
//               style={styles.rejectBtn}
//               onPress={handleReject}
//               activeOpacity={0.85}
//             >
//               <Ionicons
//                 name="call"
//                 size={30}
//                 color="#fff"
//                 style={{ transform: [{ rotate: "135deg" }] }}
//               />
//             </TouchableOpacity>
//             <Text
//               style={[styles.actionLabel, { color: "rgba(255,255,255,0.55)" }]}
//             >
//               Decline
//             </Text>
//           </View>

//           <View style={styles.actionWrap}>
//             <TouchableOpacity
//               style={styles.acceptBtn}
//               onPress={handleAccept}
//               activeOpacity={0.85}
//             >
//               <LinearGradient
//                 colors={
//                   isVideo ? ["#5b8dee", "#3a6bc9"] : ["#00d4aa", "#00b090"]
//                 }
//                 style={styles.acceptGradient}
//               >
//                 <Ionicons
//                   name={isVideo ? "videocam" : "call"}
//                   size={30}
//                   color="#fff"
//                 />
//               </LinearGradient>
//             </TouchableOpacity>
//             <Text
//               style={[styles.actionLabel, { color: "rgba(255,255,255,0.55)" }]}
//             >
//               Accept
//             </Text>
//           </View>
//         </View>
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#050510",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   glow: {
//     position: "absolute",
//     width: 500,
//     height: 500,
//     borderRadius: 250,
//     opacity: 0.07,
//     top: "10%",
//     alignSelf: "center",
//   },
//   content: {
//     alignItems: "center",
//     gap: 12,
//     paddingHorizontal: 40,
//     width: "100%",
//   },
//   callTypeLabel: {
//     fontSize: 15,
//     color: "rgba(255,255,255,0.55)",
//     fontWeight: "600",
//     marginBottom: 16,
//   },
//   avatarContainer: {
//     position: "relative",
//     justifyContent: "center",
//     alignItems: "center",
//     width: 200,
//     height: 200,
//     marginBottom: 12,
//   },
//   ring: { position: "absolute", borderRadius: 100, borderWidth: 2 },
//   ring1: { width: 160, height: 160 },
//   ring2: { width: 200, height: 200 },
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
//   callerSub: {
//     fontSize: 16,
//     color: "rgba(255,255,255,0.45)",
//     marginBottom: 20,
//   },
//   actions: { flexDirection: "row", gap: 64, marginTop: 32 },
//   actionWrap: { alignItems: "center", gap: 12 },
//   rejectBtn: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: "#ff4757",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#ff4757",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.5,
//     shadowRadius: 20,
//     elevation: 12,
//   },
//   acceptBtn: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     overflow: "hidden",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.5,
//     shadowRadius: 20,
//     elevation: 12,
//   },
//   acceptGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
//   actionLabel: { fontSize: 13, fontWeight: "600" },
// });

// const unavailableStyles = StyleSheet.create({
//   content: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 40,
//     gap: 8,
//   },
//   iconWrap: {
//     width: 76,
//     height: 76,
//     borderRadius: 38,
//     backgroundColor: "rgba(255,255,255,0.06)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#fff",
//     letterSpacing: -0.3,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "rgba(255,255,255,0.5)",
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 20,
//   },
//   actionBtn: {
//     paddingHorizontal: 28,
//     paddingVertical: 13,
//     borderRadius: 99,
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.15)",
//   },
//   actionText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "700",
//   },
// });

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { clearCall } from "../../store/slices/callSlice";
import { socketService } from "../../services/socket";
import { useTheme } from "../../context/ThemeContext";
import { useContactNameResolver } from "@/hooks/useContactName";
import { useRingtone } from "@/hooks/useRingTone";

export default function IncomingCallScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const resolveContact = useContactNameResolver();
  const { colors } = useTheme();
  const callData = useAppSelector((s) => s.call.incomingCall);
  useRingtone(!!callData);

  // Tracks whether WE are the ones clearing incomingCall (via accept/
  // reject), as opposed to it being cleared out from under us externally
  // (caller hung up, someone else answered). Without this, dispatching
  // clearCall() inside handleAccept re-triggers the auto-dismiss effect
  // below and immediately navigates back off the call screen we just
  // pushed to — which is why tapping Accept could appear to do nothing.
  const navigatingAwayRef = useRef(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ring1Anim = useRef(new Animated.Value(1)).current;
  const ring2Anim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const ringAnim = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1.5,
              duration: 1600,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    ringAnim(ring1Anim, 0).start();
    ringAnim(ring2Anim, 800).start();
  }, []);

  // Normal path: server told us the call ended (caller hung up, was
  // rejected elsewhere, etc.) — callData goes null, get off this screen.
  useEffect(() => {
    if (!callData && !navigatingAwayRef.current) {
      if (router.canGoBack()) {
        router.back();
      } else {
        // No screen behind this one — e.g. the app was killed and the
        // user tapped a call push notification, launching straight into
        // this screen. router.back() would be a no-op here, leaving the
        // user stuck with nothing on screen. Send them somewhere real.
        router.replace("/(tabs)");
      }
    }
  }, [callData, router]);

  // Safety-net path: independent of anything the caller's device does.
  // If neither Accept nor Reject nor an external call:ended has resolved
  // this within 60s, give up locally rather than ringing forever — this
  // screen shouldn't depend entirely on an external signal that has no
  // guarantee of ever arriving (the caller's app could crash, lose all
  // connectivity, or be force-killed before any of its own cleanup code
  // ever runs, in which case no fix on their end could help this screen).
  // 60s matches CallScreen.tsx's own no-answer timeout, so both sides
  // converge on "missed" around the same time regardless of which one
  // gives up first. Sends the same reject signal handleReject does
  // (rather than calling handleReject itself, which is defined after the
  // early return below and assumes non-null callData) — the existing
  // effect above then handles navigation once clearCall() runs.
  useEffect(() => {
    if (!callData) return;
    const timeoutCallId = callData.callId;
    const timeoutCallerId = callData.callerId;

    const timeout = setTimeout(() => {
      if (navigatingAwayRef.current) return;
      navigatingAwayRef.current = true;
      socketService.rejectCall(timeoutCallId, timeoutCallerId);
      dispatch(clearCall());
    }, 60000);

    return () => clearTimeout(timeout);
  }, [callData?.callId]);

  if (!callData) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#050510", "#0f0f28", "#050510"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.glow, { backgroundColor: "#555577" }]} />

        <View style={unavailableStyles.content}>
          <View style={unavailableStyles.iconWrap}>
            <Ionicons
              name="call-outline"
              size={36}
              color="rgba(255,255,255,0.5)"
            />
          </View>
          <Text style={unavailableStyles.title}>Call unavailable</Text>
          <Text style={unavailableStyles.subtitle}>
            This call has ended or is no longer available.
          </Text>

          <TouchableOpacity
            style={unavailableStyles.actionBtn}
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.85}
          >
            <Text style={unavailableStyles.actionText}>Back to Chats</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isVideo = callData.type === "video";
  const isGroup = !!callData.isGroup;

  const handleAccept = () => {
    navigatingAwayRef.current = true;

    // This was previously commented out — without it, the caller never
    // received call:accepted and would sit on the ringing screen until
    // the 60s no-answer timeout, even though the callee had connected.
    socketService.acceptCall(callData.callId, callData.callerId);

    router.replace({
      pathname: "/call/[id]",
      params: {
        id: callData.chatId || callData.callerId,
        type: callData.type,
        callId: callData.callId,
        isIncoming: "1",
      },
    });

    dispatch(clearCall());
  };

  const handleReject = () => {
    navigatingAwayRef.current = true;
    socketService.rejectCall(callData.callId, callData.callerId);
    dispatch(clearCall());
    router.back();
  };

  const { displayName, isContact: isContactSaved } = isGroup
    ? { displayName: callData.groupName || "Group call", isContact: false }
    : resolveContact(callData?.callerPhone?.toString(), callData.callerName);

  // const displayName = isGroup
  //   ? callData.groupName || "Group call"
  //   : callData.callerName;
  const displayAvatar = isGroup ? callData.groupAvatar : callData.callerAvatar;

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={
          isVideo
            ? ["#050520", "#0f1535", "#050520"]
            : ["#050510", "#0f0f28", "#050510"]
        }
        style={StyleSheet.absoluteFillObject}
      />
      <View
        style={[
          styles.glow,
          { backgroundColor: isVideo ? "#5b8dee" : "#00d4aa" },
        ]}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.callTypeLabel}>
          {isVideo
            ? isGroup
              ? "📹 Incoming Group Video Call"
              : "📹 Incoming Video Call"
            : isGroup
            ? "📞 Incoming Group Voice Call"
            : "📞 Incoming Voice Call"}
        </Text>

        <View style={styles.avatarContainer}>
          <Animated.View
            style={[
              styles.ring,
              styles.ring2,
              {
                transform: [{ scale: ring2Anim }],
                borderColor: isVideo ? "#5b8dee40" : "#00d4aa40",
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              styles.ring1,
              {
                transform: [{ scale: ring1Anim }],
                borderColor: isVideo ? "#5b8dee60" : "#00d4aa60",
              },
            ]}
          />
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
        </View>

        <Text style={styles.callerName}>{displayName}</Text>
        <Text style={styles.callerSub}>
          {isGroup ? `${callData.callerName} is calling` : "is calling you…"}
        </Text>

        <View style={styles.actions}>
          <View style={styles.actionWrap}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={handleReject}
              activeOpacity={0.85}
            >
              <Ionicons
                name="call"
                size={30}
                color="#fff"
                style={{ transform: [{ rotate: "135deg" }] }}
              />
            </TouchableOpacity>
            <Text
              style={[styles.actionLabel, { color: "rgba(255,255,255,0.55)" }]}
            >
              Decline
            </Text>
          </View>

          <View style={styles.actionWrap}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAccept}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  isVideo ? ["#5b8dee", "#3a6bc9"] : ["#00d4aa", "#00b090"]
                }
                style={styles.acceptGradient}
              >
                <Ionicons
                  name={isVideo ? "videocam" : "call"}
                  size={30}
                  color="#fff"
                />
              </LinearGradient>
            </TouchableOpacity>
            <Text
              style={[styles.actionLabel, { color: "rgba(255,255,255,0.55)" }]}
            >
              Accept
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050510",
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 250,
    opacity: 0.07,
    top: "10%",
    alignSelf: "center",
  },
  content: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 40,
    width: "100%",
  },
  callTypeLabel: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "600",
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    width: 200,
    height: 200,
    marginBottom: 12,
  },
  ring: { position: "absolute", borderRadius: 100, borderWidth: 2 },
  ring1: { width: 160, height: 160 },
  ring2: { width: 200, height: 200 },
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
  callerSub: {
    fontSize: 16,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 20,
  },
  actions: { flexDirection: "row", gap: 64, marginTop: 32 },
  actionWrap: { alignItems: "center", gap: 12 },
  rejectBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ff4757",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ff4757",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  acceptBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  acceptGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  actionLabel: { fontSize: 13, fontWeight: "600" },
});

const unavailableStyles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 8,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  actionBtn: {
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  actionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
