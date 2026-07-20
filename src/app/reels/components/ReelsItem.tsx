// import { useTheme } from "@/context/ThemeContext";
// import { reelApi } from "@/services/api";
// import { Reel } from "@/types";
// import { formatDistanceToNow } from "@/utils/date";
// import { Ionicons } from "@expo/vector-icons";
// import { Image } from "expo-image";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import { useEffect, useRef, useState } from "react";
// import {
//   Alert,
//   Animated,
//   Dimensions,
//   Modal,
//   Pressable,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { VideoView, useVideoPlayer } from "expo-video";

// export default function ReelItem({
//   reel,
//   isActive,
//   myId,
//   onComment,
//   onDelete,
// }: {
//   reel: Reel;
//   isActive: boolean;
//   myId: string;
//   onComment: () => void;
//   onDelete: (reelId: string) => void;
// }) {
//   const { colors } = useTheme();
//   const { width, height } = Dimensions.get("window");
//   const router = useRouter();
//   const [liked, setLiked] = useState(reel.isLiked ?? false);
//   const [likes, setLikes] = useState(reel.likes?.length ?? 0);
//   const likeScale = useRef(new Animated.Value(1)).current;
//   const [paused, setPaused] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const slideAnim = useRef(new Animated.Value(300)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   const isMine = reel.user._id === myId;

//   const player = useVideoPlayer(reel.mediaUrl, (player) => {
//     player.loop = true;

//     if (isActive && reel.type === "video") {
//       player.play();
//     }
//   });

//   const handleLike = async () => {
//     const next = !liked;
//     setLiked(next);
//     setLikes((c) => (next ? c + 1 : c - 1));
//     Animated.sequence([
//       Animated.spring(likeScale, {
//         toValue: 1.4,
//         useNativeDriver: true,
//         tension: 300,
//         friction: 10,
//       }),
//       Animated.spring(likeScale, {
//         toValue: 1,
//         useNativeDriver: true,
//         tension: 300,
//         friction: 10,
//       }),
//     ]).start();
//     reelApi.toggleLike(reel._id).catch(() => {});
//   };
//   const openMenu = () => {
//     setShowMenu(true);

//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 220,
//         useNativeDriver: true,
//       }),
//       Animated.spring(slideAnim, {
//         toValue: 0,
//         useNativeDriver: true,
//         damping: 18,
//         stiffness: 180,
//       }),
//     ]).start();
//   };

//   const closeMenu = () => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 0,
//         duration: 180,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 300,
//         duration: 220,
//         useNativeDriver: true,
//       }),
//     ]).start(() => setShowMenu(false));
//   };

//   const handleDelete = () => {
//     closeMenu();

//     setTimeout(() => {
//       Alert.alert("Delete Reel", "Are you sure you want to delete this reel?", [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: () => onDelete(reel._id),
//         },
//       ]);
//     }, 200);
//   };

//   const initials = reel.user.name
//     .split(" ")
//     .map((w) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   const togglePlayback = () => {
//     if (reel.type !== "video") return;

//     if (paused) {
//       player.play();
//     } else {
//       player.pause();
//     }

//     setPaused(!paused);
//   };

//   useEffect(() => {
//     if (reel.type !== "video") return;

//     if (isActive) {
//       player.play();
//     } else {
//       player.pause();
//     }
//   }, [isActive, player, reel.type]);

//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: colors.background,
//     },

//     topBar: {
//       position: "absolute",
//       top: 0,
//       left: 0,
//       right: 0,
//       zIndex: 20,
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       paddingHorizontal: 16,
//       paddingBottom: 8,
//       backgroundColor: colors.background,
//     },

//     topTitle: {
//       fontSize: 22,
//       fontWeight: "800",
//       color: colors.textPrimary,
//     },

//     topRight: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 12,
//     },

//     trendBtn: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 5,
//       paddingHorizontal: 11,
//       paddingVertical: 5,
//       borderRadius: 99,
//       borderWidth: 1,
//       borderColor: colors.primary,
//       backgroundColor: colors.surface,
//     },

//     trendBtnActive: {
//       backgroundColor: colors.primary,
//       borderColor: colors.primary,
//     },

//     trendText: {
//       fontSize: 12,
//       fontWeight: "700",
//       color: colors.primary,
//     },

//     empty: {
//       flex: 1,
//       justifyContent: "center",
//       alignItems: "center",
//       gap: 12,
//     },

//     emptyTitle: {
//       fontSize: 22,
//       fontWeight: "800",
//       color: colors.textPrimary,
//     },

//     emptySub: {
//       fontSize: 14,
//       color: colors.textSecondary,
//     },

//     createBtn: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 8,
//       paddingHorizontal: 24,
//       paddingVertical: 12,
//       borderRadius: 99,
//       marginTop: 8,
//     },

//     createBtnText: {
//       color: colors.textInverse,
//       fontWeight: "700",
//       fontSize: 15,
//     },

//     reelCard: {
//       position: "relative",
//       backgroundColor: colors.background,
//     },

//     rail: {
//       position: "absolute",
//       right: 12,
//       bottom: 130,
//       alignItems: "center",
//       gap: 20,
//     },

//     creatorBtn: {
//       position: "relative",
//     },

//     creatorAvatar: {
//       width: 48,
//       height: 48,
//       borderRadius: 24,
//       borderWidth: 2,
//       borderColor: colors.surface,
//     },

//     creatorAvatarFb: {
//       width: 48,
//       height: 48,
//       borderRadius: 24,
//       justifyContent: "center",
//       alignItems: "center",
//       borderWidth: 2,
//       borderColor: colors.surface,
//     },

//     creatorInitials: {
//       color: colors.textInverse,
//       fontWeight: "800",
//       fontSize: 16,
//     },

//     followDot: {
//       position: "absolute",
//       bottom: -6,
//       alignSelf: "center",
//       width: 18,
//       height: 18,
//       borderRadius: 9,
//       backgroundColor: colors.primary,
//       justifyContent: "center",
//       alignItems: "center",
//     },

//     railItem: {
//       alignItems: "center",
//       gap: 3,
//     },

//     railCount: {
//       color: colors.textInverse,
//       fontSize: 12,
//       fontWeight: "700",
//     },

//     bottomInfo: {
//       position: "absolute",
//       left: 16,
//       right: 72,
//       bottom: 96,
//     },

//     creatorName: {
//       fontSize: 15,
//       fontWeight: "800",
//       color: colors.textInverse,
//       marginBottom: 5,
//     },

//     caption: {
//       fontSize: 13,
//       color: colors.textInverse,
//       lineHeight: 18,
//       marginBottom: 5,
//     },

//     reelTime: {
//       fontSize: 11,
//       color: colors.textSecondary,
//     },

//     modalBg: {
//       flex: 1,
//       backgroundColor: colors.overlay,
//     },

//     sheet: {
//       backgroundColor: colors.surface,
//       borderTopLeftRadius: 24,
//       borderTopRightRadius: 24,
//       padding: 20,
//       paddingBottom: 40,
//       maxHeight: "60%",
//     },

//     sheetTitle: {
//       fontSize: 17,
//       fontWeight: "800",
//       marginBottom: 14,
//       color: colors.textPrimary,
//     },

//     commentRow: {
//       flexDirection: "row",
//       gap: 10,
//       marginBottom: 14,
//     },

//     commentAvatar: {
//       width: 32,
//       height: 32,
//       borderRadius: 16,
//       justifyContent: "center",
//       alignItems: "center",
//       backgroundColor: colors.primary,
//     },

//     commentAvatarText: {
//       color: colors.textInverse,
//       fontWeight: "700",
//       fontSize: 13,
//     },

//     commentUser: {
//       fontSize: 13,
//       fontWeight: "700",
//       color: colors.textPrimary,
//     },

//     commentText: {
//       fontSize: 13,
//       marginTop: 2,
//       color: colors.textSecondary,
//     },

//     noComments: {
//       textAlign: "center",
//       marginTop: 20,
//       fontSize: 14,
//       color: colors.textMuted,
//     },

//     commentInputRow: {
//       flexDirection: "row",
//       gap: 10,
//       alignItems: "center",
//       borderTopWidth: 1,
//       borderTopColor: colors.border,
//       paddingTop: 12,
//       marginTop: 8,
//     },

//     commentInput: {
//       flex: 1,
//       borderRadius: 20,
//       paddingHorizontal: 14,
//       paddingVertical: 10,
//       fontSize: 14,
//       backgroundColor: colors.inputBg,
//       color: colors.textPrimary,
//     },

//     commentSend: {
//       width: 38,
//       height: 38,
//       borderRadius: 19,
//       justifyContent: "center",
//       alignItems: "center",
//     },

//     menuBtn: {
//       position: "absolute",
//       top: 80,
//       right: 12,
//       width: 36,
//       height: 36,
//       borderRadius: 18,
//       justifyContent: "center",
//       alignItems: "center",
//       backgroundColor: colors.overlay,
//       zIndex: 10,
//     },

//     menuOverlay: {
//       ...StyleSheet.absoluteFillObject,
//       backgroundColor: colors.overlay,
//       justifyContent: "flex-end",
//     },

//     menuSheet: {
//       backgroundColor: colors.surface,
//       borderTopLeftRadius: 28,
//       borderTopRightRadius: 28,
//       paddingBottom: 36,
//       paddingTop: 12,
//     },

//     sheetHandle: {
//       width: 42,
//       height: 5,
//       borderRadius: 3,
//       backgroundColor: colors.border,
//       alignSelf: "center",
//       marginBottom: 18,
//     },

//     menuOption: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: 22,
//       paddingVertical: 18,
//       gap: 16,
//     },

//     menuTitle: {
//       color: colors.textPrimary,
//       fontSize: 16,
//       fontWeight: "700",
//     },

//     menuSubtitle: {
//       color: colors.textSecondary,
//       fontSize: 13,
//       marginTop: 3,
//     },
//   });
//   return (
//     <SafeAreaView style={[styles.reelCard, { width, height }]}>
//       {/* {reel.thumbnail ? (
//         <Image
//           source={{ uri: reel.thumbnail }}
//           style={StyleSheet.absoluteFillObject}
//           contentFit="cover"
//         />
//       ) : (
//         <LinearGradient
//           colors={["#0a0a20", "#1a1a35"]}
//           style={StyleSheet.absoluteFillObject}
//         />
//       )} */}

//       <TouchableOpacity
//         activeOpacity={1}
//         onPress={togglePlayback}
//         style={StyleSheet.absoluteFillObject}
//       >
//         {reel.type === "video" ? (
//           <>
//             <VideoView
//               player={player}
//               style={StyleSheet.absoluteFillObject}
//               nativeControls={false}
//               contentFit="cover"
//             />

//             {paused && (
//               <View
//                 style={{
//                   ...StyleSheet.absoluteFillObject,
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 <View
//                   style={{
//                     width: 72,
//                     height: 72,
//                     borderRadius: 36,
//                     backgroundColor: "rgba(0,0,0,0.45)",
//                     justifyContent: "center",
//                     alignItems: "center",
//                   }}
//                 >
//                   <Ionicons name="play" size={36} color="#fff" />
//                 </View>
//               </View>
//             )}
//           </>
//         ) : (
//           <Image
//             source={{ uri: reel.mediaUrl }}
//             style={StyleSheet.absoluteFillObject}
//             contentFit="cover"
//           />
//         )}
//       </TouchableOpacity>
//       <LinearGradient
//         colors={[
//           "rgba(0,0,0,0.35)",
//           "transparent",
//           "transparent",
//           "rgba(0,0,0,0.75)",
//         ]}
//         style={StyleSheet.absoluteFillObject}
//         pointerEvents="none"
//       />

//       {/* Right rail */}
//       <View style={styles.rail}>
//         <TouchableOpacity
//           style={styles.creatorBtn}
//           onPress={() => router.push(`/profile/${reel.user._id}`)}
//         >
//           {reel.user.avatar ? (
//             <Image
//               source={{ uri: reel.user.avatar }}
//               style={styles.creatorAvatar}
//               contentFit="cover"
//             />
//           ) : (
//             <LinearGradient
//               colors={["#00d4aa", "#5b8dee"]}
//               style={styles.creatorAvatarFb}
//             >
//               <Text style={styles.creatorInitials}>{initials}</Text>
//             </LinearGradient>
//           )}
//           <View style={styles.followDot}>
//             <Ionicons name="add" size={11} color="#fff" />
//           </View>
//         </TouchableOpacity>

//         <View style={styles.railItem}>
//           <TouchableOpacity onPress={handleLike}>
//             <Animated.View style={{ transform: [{ scale: likeScale }] }}>
//               <Ionicons
//                 name={liked ? "heart" : "heart-outline"}
//                 size={30}
//                 color={liked ? "#ff4757" : "#fff"}
//               />
//             </Animated.View>
//           </TouchableOpacity>
//           <Text style={styles.railCount}>{likes}</Text>
//         </View>

//         <View style={styles.railItem}>
//           <TouchableOpacity onPress={onComment}>
//             <Ionicons name="chatbubble-outline" size={28} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.railCount}>{reel.comments?.length ?? 0}</Text>
//         </View>

//         <View style={styles.railItem}>
//           <Ionicons
//             name="eye-outline"
//             size={24}
//             color="rgba(255,255,255,0.7)"
//           />
//           <Text style={styles.railCount}>{reel.views}</Text>
//         </View>
//       </View>

//       {/* Bottom info */}
//       <View style={styles.bottomInfo}>
//         <Text style={styles.creatorName}>@{reel.user.name.split(" ")[0]}</Text>
//         {reel.caption ? (
//           <Text style={styles.caption} numberOfLines={2}>
//             {reel.caption}
//           </Text>
//         ) : null}
//         <Text style={styles.reelTime}>
//           {formatDistanceToNow(new Date(reel.createdAt))}
//         </Text>
//       </View>

//       {isMine && (
//         <TouchableOpacity style={styles.menuBtn} onPress={openMenu}>
//           <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
//         </TouchableOpacity>
//       )}
//       {/* context menu */}
//       <Modal visible={showMenu} transparent animationType="none">
//         <Animated.View style={[styles.menuOverlay, { opacity: fadeAnim }]}>
//           <Pressable style={{ flex: 1 }} onPress={closeMenu} />

//           <Animated.View
//             style={[
//               styles.menuSheet,
//               {
//                 transform: [
//                   {
//                     translateY: slideAnim,
//                   },
//                 ],
//               },
//             ]}
//           >
//             <View style={styles.sheetHandle} />

//             {isMine && (
//               <TouchableOpacity
//                 style={styles.menuOption}
//                 onPress={handleDelete}
//               >
//                 <Ionicons name="trash-outline" size={24} color="#ff4d4f" />

//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.menuTitle}>Delete Reel</Text>

//                   <Text style={styles.menuSubtitle}>
//                     Permanently remove this reel
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )}

//             <TouchableOpacity
//               style={styles.menuOption}
//               onPress={() => {
//                 closeMenu();
//               }}
//             >
//               <Ionicons
//                 name="share-social-outline"
//                 size={24}
//                 color={colors.textPrimary}
//               />

//               <Text style={styles.menuTitle}>Share</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuOption}
//               onPress={() => {
//                 closeMenu();
//               }}
//             >
//               <Ionicons
//                 name="flag-outline"
//                 size={24}
//                 color={colors.textPrimary}
//               />

//               <Text style={styles.menuTitle}>Report</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.menuOption, { justifyContent: "center" }]}
//               onPress={closeMenu}
//             >
//               <Text
//                 style={{
//                   color: "#00d4aa",
//                   fontWeight: "700",
//                   fontSize: 16,
//                 }}
//               >
//                 Cancel
//               </Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </Animated.View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

import { useTheme } from "@/context/ThemeContext";
import { reelApi } from "@/services/api";
import { Reel } from "@/types";
import { formatDistanceToNow } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";

export default function ReelItem({
  reel,
  isActive,
  myId,
  onComment,
  onDelete,
}: {
  reel: Reel;
  isActive: boolean;
  myId: string;
  onComment: () => void;
  onDelete: (reelId: string) => void;
}) {
  const { colors } = useTheme();
  const { width, height } = Dimensions.get("window");
  const router = useRouter();

  const [liked, setLiked] = useState(reel.isLiked ?? false);
  const [likes, setLikes] = useState(reel.likes?.length ?? 0);
  const [paused, setPaused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const likeScale = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Play/pause icon animation
  const playIconScale = useRef(new Animated.Value(0)).current;
  const playIconOpacity = useRef(new Animated.Value(0)).current;

  const isMine = reel.user._id === myId;

  const player = useVideoPlayer(reel.mediaUrl, (p) => {
    p.loop = true;
    if (isActive && reel.type === "video") p.play();
  });

  // ── Play / pause based on active tab ──────────────────────────────────────
  useEffect(() => {
    if (reel.type !== "video") return;
    if (isActive) {
      player.play();
      setPaused(false);
    } else {
      player.pause();
    }
  }, [isActive, player, reel.type]);

  // ── Show animated play/pause indicator briefly on tap ─────────────────────
  const showPlayPauseIndicator = (nextPaused: boolean) => {
    // Reset
    playIconScale.setValue(0.6);
    playIconOpacity.setValue(1);

    Animated.parallel([
      Animated.spring(playIconScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 12,
      }),
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(playIconOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const togglePlayback = () => {
    if (reel.type !== "video") return;
    const next = !paused;
    if (next) {
      player.pause();
    } else {
      player.play();
    }
    setPaused(next);
    showPlayPauseIndicator(next);
  };

  // ── Like ──────────────────────────────────────────────────────────────────
  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikes((c) => (next ? c + 1 : c - 1));
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.4,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();
    reelApi.toggleLike(reel._id).catch(() => {});
  };

  // ── Menu ──────────────────────────────────────────────────────────────────
  const openMenu = () => {
    setShowMenu(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => setShowMenu(false));
  };

  const handleDelete = () => {
    closeMenu();
    setTimeout(() => {
      Alert.alert("Delete Reel", "Are you sure you want to delete this reel?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(reel._id),
        },
      ]);
    }, 200);
  };

  const initials = reel.user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={[styles.reelCard, { width, height }]}>
      {/* ── Media ── */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={togglePlayback}
        style={StyleSheet.absoluteFillObject}
      >
        {reel.type === "video" ? (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFillObject}
            nativeControls={false}
            contentFit="cover"
          />
        ) : (
          <Image
            source={{ uri: reel.mediaUrl }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
        )}
      </TouchableOpacity>

      {/* ── Gradient overlays ── */}
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.35)",
          "transparent",
          "transparent",
          "rgba(0,0,0,0.8)",
        ]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* ── Play / Pause indicator (centre, fades out) ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.playIndicatorWrap,
          {
            opacity: playIconOpacity,
            transform: [{ scale: playIconScale }],
          },
        ]}
      >
        <View style={styles.playIndicatorBg}>
          <Ionicons
            name={paused ? "play" : "pause"}
            size={38}
            color="#fff"
            style={{ marginLeft: paused ? 4 : 0 }}
          />
        </View>
      </Animated.View>

      {/* ── Persistent paused badge (top-left) ── */}
      {paused && (
        <View style={styles.pausedBadge}>
          <Ionicons name="pause" size={12} color="#fff" />
          <Text style={styles.pausedBadgeText}>Paused</Text>
        </View>
      )}

      {/* ── Right rail ── */}
      <View style={styles.rail}>
        {/* Creator */}
        <TouchableOpacity
          style={styles.creatorBtn}
          onPress={() => router.push(`/profile/${reel.user._id}`)}
        >
          {reel.user.avatar ? (
            <Image
              source={{ uri: reel.user.avatar }}
              style={styles.creatorAvatar}
              contentFit="cover"
            />
          ) : (
            <LinearGradient
              colors={["#00d4aa", "#5b8dee"]}
              style={styles.creatorAvatarFb}
            >
              <Text style={styles.creatorInitials}>{initials}</Text>
            </LinearGradient>
          )}
          <View style={styles.followDot}>
            <Ionicons name="add" size={11} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Like */}
        <View style={styles.railItem}>
          <TouchableOpacity onPress={handleLike}>
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={30}
                color={liked ? "#ff4757" : "#fff"}
              />
            </Animated.View>
          </TouchableOpacity>
          <Text style={styles.railCount}>{likes}</Text>
        </View>

        {/* Comment */}
        <View style={styles.railItem}>
          <TouchableOpacity onPress={onComment}>
            <Ionicons name="chatbubble-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.railCount}>{reel.comments?.length ?? 0}</Text>
        </View>

        {/* Views */}
        <View style={styles.railItem}>
          <Ionicons
            name="eye-outline"
            size={24}
            color="rgba(255,255,255,0.7)"
          />
          <Text style={styles.railCount}>{reel.views}</Text>
        </View>

        {/* Play/pause toggle button on rail */}
        <View style={styles.railItem}>
          <TouchableOpacity
            onPress={togglePlayback}
            disabled={reel.type !== "video"}
          >
            <View style={styles.railPlayBtn}>
              <Ionicons
                name={paused ? "play" : "pause"}
                size={18}
                color="#fff"
                style={{ marginLeft: paused ? 2 : 0 }}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Bottom info ── */}
      <View style={styles.bottomInfo}>
        <Text style={styles.creatorName}>@{reel.user.name.split(" ")[0]}</Text>
        {reel.caption ? (
          <Text style={styles.caption} numberOfLines={2}>
            {reel.caption}
          </Text>
        ) : null}
        <Text style={styles.reelTime}>
          {formatDistanceToNow(new Date(reel.createdAt))}
        </Text>
      </View>

      {/* ── Mine: kebab menu ── */}
      {isMine && (
        <TouchableOpacity style={styles.menuBtn} onPress={openMenu}>
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      )}

      {/* ── Context menu ── */}
      <Modal visible={showMenu} transparent animationType="none">
        <Animated.View style={[styles.menuOverlay, { opacity: fadeAnim }]}>
          <Pressable style={{ flex: 1 }} onPress={closeMenu} />

          <Animated.View
            style={[
              styles.menuSheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sheetHandle} />

            {isMine && (
              <TouchableOpacity
                style={styles.menuOption}
                onPress={handleDelete}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name="trash-outline" size={20} color="#ff4d4f" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuTitle, { color: "#ff4d4f" }]}>
                    Delete Reel
                  </Text>
                  <Text style={styles.menuSubtitle}>
                    Permanently remove this reel
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuOption} onPress={closeMenu}>
              <View style={styles.menuIconWrap}>
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color="#5b8dee"
                />
              </View>
              <Text style={styles.menuTitle}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuOption} onPress={closeMenu}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="flag-outline" size={20} color="#ffc107" />
              </View>
              <Text style={styles.menuTitle}>Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuOption, styles.cancelOption]}
              onPress={closeMenu}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  reelCard: {
    position: "relative",
    backgroundColor: "#000",
  },

  // ── Play / Pause indicator ──────────────────────────────────────────────
  playIndicatorWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    pointerEvents: "none",
  },
  playIndicatorBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    // Frosted look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  // ── Paused badge ─────────────────────────────────────────────────────────
  pausedBadge: {
    position: "absolute",
    top: 56,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    zIndex: 10,
  },
  pausedBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Rail ─────────────────────────────────────────────────────────────────
  rail: {
    position: "absolute",
    right: 12,
    bottom: 130,
    alignItems: "center",
    gap: 20,
  },
  creatorBtn: { position: "relative" },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
  },
  creatorAvatarFb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  creatorInitials: { color: "#fff", fontWeight: "800", fontSize: 16 },
  followDot: {
    position: "absolute",
    bottom: -6,
    alignSelf: "center",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#00d4aa",
    justifyContent: "center",
    alignItems: "center",
  },
  railItem: { alignItems: "center", gap: 3 },
  railCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  railPlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Bottom info ───────────────────────────────────────────────────────────
  bottomInfo: {
    position: "absolute",
    left: 16,
    right: 72,
    bottom: 96,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 5,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  caption: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 18,
    marginBottom: 5,
  },
  reelTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },

  // ── Menu btn ──────────────────────────────────────────────────────────────
  menuBtn: {
    position: "absolute",
    top: 80,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
  },

  // ── Context menu ──────────────────────────────────────────────────────────
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  menuSheet: {
    backgroundColor: "#12121f",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 36,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#2a2a45",
    alignSelf: "center",
    marginBottom: 18,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 16,
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1a1a2e",
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuTitle: {
    color: "#f0f0ff",
    fontSize: 15,
    fontWeight: "700",
  },
  menuSubtitle: {
    color: "#8888aa",
    fontSize: 12,
    marginTop: 2,
  },
  cancelOption: {
    justifyContent: "center",
    borderBottomWidth: 0,
    marginTop: 4,
  },
  cancelText: {
    color: "#00d4aa",
    fontWeight: "700",
    fontSize: 16,
  },
});
