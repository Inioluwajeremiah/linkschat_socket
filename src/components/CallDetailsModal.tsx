// import {
//   Modal,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Animated,
//   ColorValue,
// } from "react-native";
// import { useEffect, useRef, useState } from "react";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Image } from "expo-image";
// import { CallHistory, User } from "@/types";
// import { useContactNameResolver } from "@/hooks/useContactName";
// import { useTheme } from "@/context/ThemeContext";
// import { formatDistanceToNow } from "@/utils/date";

// function getCallStatusLabel(
//   status: CallHistory["status"],
//   isInitiator: boolean
// ): string {
//   switch (status) {
//     case "missed":
//       return isInitiator ? "No Answer" : "Missed";

//     case "rejected":
//       return "Declined";

//     case "ongoing":
//       return "Ongoing";

//     case "completed":
//     default:
//       return isInitiator ? "Outgoing" : "Incoming";
//   }
// }

// function getCallStatusColor(
//   status: CallHistory["status"],
//   colors: ReturnType<typeof useTheme>["colors"]
// ): string {
//   if (status === "missed" || status === "rejected") {
//     return colors.error;
//   }

//   if (status === "ongoing") {
//     return colors.success;
//   }

//   return colors.success;
// }

// function ParticipantRow({
//   person,
//   tag,
//   isLast = false,
// }: {
//   person: User | null;
//   tag?: string;
//   isLast?: boolean;
// }) {
//   const { colors } = useTheme();
//   const resolveContact = useContactNameResolver();

//   const { displayName } = resolveContact(person?.phone, person?.name);

//   const initials = (displayName || "?")
//     .split(" ")
//     .map((word) => word[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   return (
//     <View
//       style={[
//         styles.participantRow,
//         !isLast && {
//           borderBottomWidth: StyleSheet.hairlineWidth,
//           borderBottomColor: colors.border,
//         },
//       ]}
//     >
//       {person?.avatar ? (
//         <Image
//           source={{ uri: person.avatar }}
//           style={styles.pAvatar}
//           contentFit="cover"
//         />
//       ) : (
//         <LinearGradient
//           colors={[colors.primary, colors.secondary]}
//           style={styles.pAvatarFallback}
//         >
//           <Text style={styles.pInitials}>{initials}</Text>
//         </LinearGradient>
//       )}

//       <View style={styles.participantInfo}>
//         <Text
//           style={[styles.pName, { color: colors.textPrimary }]}
//           numberOfLines={1}
//         >
//           {displayName || "Unknown"}
//         </Text>

//         {tag ? (
//           <Text style={[styles.pTag, { color: colors.textMuted }]}>{tag}</Text>
//         ) : null}
//       </View>

//       <Ionicons name="person-outline" size={18} color={colors.textMuted} />
//     </View>
//   );
// }

// export interface OngoingInfo {
//   alreadyJoined: boolean;
//   joinedCount: number;
// }

// export default function CallDetailsModal({
//   visible,
//   call,
//   myId,
//   isGroup,
//   ongoingInfo,
//   onClose,
//   onCallBack,
//   onJoinOngoing,
// }: {
//   visible: boolean;
//   call: CallHistory | null;
//   myId: string;
//   isGroup: boolean;
//   ongoingInfo?: OngoingInfo | null;
//   onClose: () => void;
//   onCallBack: () => void;
//   onJoinOngoing: () => void;
// }) {
//   const { colors } = useTheme();

//   const [modalMounted, setModalMounted] = useState(visible);
//   const [renderedCall, setRenderedCall] = useState<CallHistory | null>(call);

//   // ------------------------------------------------------------
//   // ANIMATION VALUES
//   // ------------------------------------------------------------

//   const overlayAnim = useRef(new Animated.Value(0)).current;

//   const slideAnim = useRef(new Animated.Value(600)).current;

//   const contentOpacity = useRef(new Animated.Value(0)).current;
//   const contentTranslateY = useRef(new Animated.Value(20)).current;

//   const heroScale = useRef(new Animated.Value(0.75)).current;
//   const heroOpacity = useRef(new Animated.Value(0)).current;
//   const heroRotate = useRef(new Animated.Value(-8)).current;

//   const quickInfoAnim = useRef(new Animated.Value(25)).current;
//   const participantsAnim = useRef(new Animated.Value(25)).current;
//   const infoAnim = useRef(new Animated.Value(25)).current;

//   const actionScale = useRef(new Animated.Value(0.92)).current;
//   const actionOpacity = useRef(new Animated.Value(0)).current;

//   const closeScale = useRef(new Animated.Value(1)).current;

//   const pulseAnim = useRef(new Animated.Value(1)).current;

//   // ------------------------------------------------------------
//   // KEEP CALL DATA UPDATED
//   // ------------------------------------------------------------

//   useEffect(() => {
//     if (call) {
//       setRenderedCall(call);
//     }
//   }, [call]);

//   // ------------------------------------------------------------
//   // OPEN / CLOSE ANIMATION
//   // ------------------------------------------------------------

//   useEffect(() => {
//     if (visible) {
//       setModalMounted(true);

//       // Reset animations
//       overlayAnim.setValue(0);
//       slideAnim.setValue(600);

//       contentOpacity.setValue(0);
//       contentTranslateY.setValue(20);

//       heroScale.setValue(0.75);
//       heroOpacity.setValue(0);
//       heroRotate.setValue(-8);

//       quickInfoAnim.setValue(25);
//       participantsAnim.setValue(25);
//       infoAnim.setValue(25);

//       actionScale.setValue(0.92);
//       actionOpacity.setValue(0);

//       closeScale.setValue(1);
//       pulseAnim.setValue(1);

//       // --------------------------------------------------------
//       // SHEET + BACKDROP
//       // --------------------------------------------------------

//       Animated.parallel([
//         Animated.timing(overlayAnim, {
//           toValue: 1,
//           duration: 280,
//           useNativeDriver: true,
//         }),

//         Animated.spring(slideAnim, {
//           toValue: 0,
//           tension: 75,
//           friction: 12,
//           useNativeDriver: true,
//         }),
//       ]).start();

//       // --------------------------------------------------------
//       // HEADER / GENERAL CONTENT
//       // --------------------------------------------------------

//       Animated.parallel([
//         Animated.timing(contentOpacity, {
//           toValue: 1,
//           duration: 350,
//           delay: 100,
//           useNativeDriver: true,
//         }),

//         Animated.spring(contentTranslateY, {
//           toValue: 0,
//           delay: 80,
//           tension: 90,
//           friction: 12,
//           useNativeDriver: true,
//         }),
//       ]).start();

//       // --------------------------------------------------------
//       // HERO ICON
//       // --------------------------------------------------------

//       Animated.parallel([
//         Animated.spring(heroScale, {
//           toValue: 1,
//           delay: 120,
//           tension: 140,
//           friction: 8,
//           useNativeDriver: true,
//         }),

//         Animated.timing(heroOpacity, {
//           toValue: 1,
//           duration: 250,
//           delay: 120,
//           useNativeDriver: true,
//         }),

//         Animated.spring(heroRotate, {
//           toValue: 0,
//           delay: 120,
//           tension: 100,
//           friction: 8,
//           useNativeDriver: true,
//         }),
//       ]).start();

//       // --------------------------------------------------------
//       // CARDS
//       // --------------------------------------------------------

//       Animated.stagger(70, [
//         Animated.spring(quickInfoAnim, {
//           toValue: 0,
//           delay: 180,
//           tension: 90,
//           friction: 12,
//           useNativeDriver: true,
//         }),

//         Animated.spring(participantsAnim, {
//           toValue: 0,
//           delay: 220,
//           tension: 90,
//           friction: 12,
//           useNativeDriver: true,
//         }),

//         Animated.spring(infoAnim, {
//           toValue: 0,
//           delay: 260,
//           tension: 90,
//           friction: 12,
//           useNativeDriver: true,
//         }),
//       ]).start();

//       // --------------------------------------------------------
//       // ACTION BUTTON
//       // --------------------------------------------------------

//       Animated.parallel([
//         Animated.spring(actionScale, {
//           toValue: 1,
//           delay: 350,
//           tension: 120,
//           friction: 9,
//           useNativeDriver: true,
//         }),

//         Animated.timing(actionOpacity, {
//           toValue: 1,
//           duration: 250,
//           delay: 350,
//           useNativeDriver: true,
//         }),
//       ]).start();

//       // --------------------------------------------------------
//       // SUBTLE HERO PULSE
//       // --------------------------------------------------------

//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, {
//             toValue: 1.05,
//             duration: 1200,
//             useNativeDriver: true,
//           }),

//           Animated.timing(pulseAnim, {
//             toValue: 1,
//             duration: 1200,
//             useNativeDriver: true,
//           }),
//         ])
//       ).start();
//     } else if (modalMounted) {
//       pulseAnim.stopAnimation();

//       Animated.parallel([
//         Animated.timing(overlayAnim, {
//           toValue: 0,
//           duration: 180,
//           useNativeDriver: true,
//         }),

//         Animated.timing(slideAnim, {
//           toValue: 600,
//           duration: 260,
//           useNativeDriver: true,
//         }),

//         Animated.timing(contentOpacity, {
//           toValue: 0,
//           duration: 150,
//           useNativeDriver: true,
//         }),

//         Animated.timing(actionOpacity, {
//           toValue: 0,
//           duration: 120,
//           useNativeDriver: true,
//         }),
//       ]).start(() => {
//         setModalMounted(false);
//       });
//     }
//   }, [visible]);

//   // ------------------------------------------------------------
//   // BUTTON ANIMATIONS
//   // ------------------------------------------------------------

//   const handleActionPressIn = () => {
//     Animated.spring(actionScale, {
//       toValue: 0.96,
//       tension: 200,
//       friction: 12,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handleActionPressOut = () => {
//     Animated.spring(actionScale, {
//       toValue: 1,
//       tension: 180,
//       friction: 10,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handleClosePressIn = () => {
//     Animated.spring(closeScale, {
//       toValue: 0.86,
//       tension: 200,
//       friction: 10,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handleClosePressOut = () => {
//     Animated.spring(closeScale, {
//       toValue: 1,
//       tension: 180,
//       friction: 10,
//       useNativeDriver: true,
//     }).start();
//   };

//   const closeWithAnimation = () => {
//     onClose();
//   };

//   // ------------------------------------------------------------
//   // DATA
//   // ------------------------------------------------------------

//   if (!modalMounted || !renderedCall) {
//     return null;
//   }

//   const call2 = renderedCall;

//   const initiator = call2.initiator as User | null;

//   const isInitiator = initiator?._id === myId;

//   const statusLabel = getCallStatusLabel(call2.status, isInitiator);

//   const statusColor = getCallStatusColor(call2.status, colors);

//   const durationLabel = call2.duration
//     ? `${Math.floor(call2.duration / 60)}:${(call2.duration % 60)
//         .toString()
//         .padStart(2, "0")}`
//     : null;

//   const participants = [
//     initiator,
//     ...call2.participants.filter(
//       (participant) => participant && participant._id !== initiator?._id
//     ),
//   ].filter(Boolean) as User[];

//   const primaryGradient: readonly [ColorValue, ColorValue] =
//     call2.type === "video"
//       ? [colors.secondary, colors.primaryDark]
//       : [colors.primary, colors.primaryDark];

//   // ------------------------------------------------------------
//   // RENDER
//   // ------------------------------------------------------------

//   return (
//     <Modal
//       visible={modalMounted}
//       transparent
//       animationType="none"
//       onRequestClose={closeWithAnimation}
//     >
//       {/* ====================================================== */}
//       {/* BACKDROP */}
//       {/* ====================================================== */}

//       <Animated.View
//         style={[
//           styles.menuOverlay,
//           {
//             opacity: overlayAnim,
//             backgroundColor: colors.overlay,
//           },
//         ]}
//       >
//         <TouchableOpacity
//           style={StyleSheet.absoluteFillObject}
//           activeOpacity={1}
//           onPress={closeWithAnimation}
//         />
//       </Animated.View>

//       {/* ====================================================== */}
//       {/* BOTTOM SHEET */}
//       {/* ====================================================== */}

//       <Animated.View
//         style={[
//           styles.menuSheet,
//           {
//             backgroundColor: colors.surface,
//             borderTopColor: colors.border,

//             transform: [
//               {
//                 translateY: slideAnim,
//               },
//             ],
//           },
//         ]}
//       >
//         {/* ==================================================== */}
//         {/* HANDLE */}
//         {/* ==================================================== */}

//         <Animated.View
//           style={{
//             opacity: contentOpacity,
//             transform: [
//               {
//                 scaleX: contentOpacity.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0.7, 1],
//                 }),
//               },
//             ],
//           }}
//         >
//           <View
//             style={[
//               styles.sheetHandle,
//               {
//                 backgroundColor: colors.border,
//               },
//             ]}
//           />
//         </Animated.View>

//         {/* ==================================================== */}
//         {/* HEADER */}
//         {/* ==================================================== */}

//         <Animated.View
//           style={{
//             opacity: contentOpacity,
//             transform: [
//               {
//                 translateY: contentTranslateY,
//               },
//             ],
//           }}
//         >
//           <View style={styles.headerRow}>
//             <View style={styles.headerTitleContainer}>
//               <Text
//                 style={[
//                   styles.headerTitle,
//                   {
//                     color: colors.textPrimary,
//                   },
//                 ]}
//               >
//                 Call details
//               </Text>

//               <Text
//                 style={[
//                   styles.headerSubtitle,
//                   {
//                     color: colors.textMuted,
//                   },
//                 ]}
//               >
//                 {isGroup ? "Group conversation" : "Call information"}
//               </Text>
//             </View>

//             <Animated.View
//               style={{
//                 transform: [{ scale: closeScale }],
//               }}
//             >
//               <TouchableOpacity
//                 onPress={closeWithAnimation}
//                 onPressIn={handleClosePressIn}
//                 onPressOut={handleClosePressOut}
//                 activeOpacity={1}
//                 style={[
//                   styles.closeBtn,
//                   {
//                     backgroundColor: colors.background,
//                   },
//                 ]}
//               >
//                 <Ionicons name="close" size={20} color={colors.textMuted} />
//               </TouchableOpacity>
//             </Animated.View>
//           </View>
//         </Animated.View>

//         {/* ==================================================== */}
//         {/* SCROLL CONTENT */}
//         {/* ==================================================== */}

//         <ScrollView
//           style={styles.scrollArea}
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* ================================================== */}
//           {/* HERO */}
//           {/* ================================================== */}

//           <View style={styles.heroSection}>
//             <Animated.View
//               style={{
//                 opacity: heroOpacity,

//                 transform: [
//                   {
//                     scale: Animated.multiply(heroScale, pulseAnim),
//                   },
//                   {
//                     rotate: heroRotate.interpolate({
//                       inputRange: [-8, 0],
//                       outputRange: ["-8deg", "0deg"],
//                     }),
//                   },
//                 ],
//               }}
//             >
//               <LinearGradient colors={primaryGradient} style={styles.heroIcon}>
//                 <Ionicons
//                   name={call2.type === "video" ? "videocam" : "call"}
//                   size={34}
//                   color="#fff"
//                 />
//               </LinearGradient>
//             </Animated.View>

//             <Animated.View
//               style={{
//                 opacity: contentOpacity,
//                 transform: [
//                   {
//                     translateY: contentTranslateY,
//                   },
//                 ],
//               }}
//             >
//               <Text
//                 style={[
//                   styles.heroTitle,
//                   {
//                     color: colors.textPrimary,
//                   },
//                 ]}
//               >
//                 {call2.type === "video" ? "Video call" : "Voice call"}
//               </Text>

//               <View
//                 style={[
//                   styles.statusPill,
//                   {
//                     backgroundColor: `${statusColor}18`,
//                   },
//                 ]}
//               >
//                 <View
//                   style={[
//                     styles.statusDot,
//                     {
//                       backgroundColor: statusColor,
//                     },
//                   ]}
//                 />

//                 <Text
//                   style={[
//                     styles.statusText,
//                     {
//                       color: statusColor,
//                     },
//                   ]}
//                 >
//                   {statusLabel}
//                 </Text>
//               </View>

//               <Text
//                 style={[
//                   styles.heroSubtitle,
//                   {
//                     color: colors.textMuted,
//                   },
//                 ]}
//               >
//                 {formatDistanceToNow(new Date(call2.createdAt))} ago
//               </Text>
//             </Animated.View>
//           </View>

//           {/* ================================================== */}
//           {/* QUICK INFORMATION */}
//           {/* ================================================== */}

//           <Animated.View
//             style={[
//               styles.quickInfoCard,
//               {
//                 backgroundColor: colors.background,
//                 borderColor: colors.border,
//                 opacity: contentOpacity,

//                 transform: [
//                   {
//                     translateY: quickInfoAnim,
//                   },
//                 ],
//               },
//             ]}
//           >
//             <View style={styles.quickInfoItem}>
//               <View
//                 style={[
//                   styles.quickIcon,
//                   {
//                     backgroundColor: `${colors.primary}18`,
//                   },
//                 ]}
//               >
//                 <Ionicons
//                   name={
//                     call2.type === "video" ? "videocam-outline" : "call-outline"
//                   }
//                   size={18}
//                   color={colors.primary}
//                 />
//               </View>

//               <View>
//                 <Text
//                   style={[
//                     styles.quickLabel,
//                     {
//                       color: colors.textMuted,
//                     },
//                   ]}
//                 >
//                   TYPE
//                 </Text>

//                 <Text
//                   style={[
//                     styles.quickValue,
//                     {
//                       color: colors.textPrimary,
//                     },
//                   ]}
//                 >
//                   {call2.type === "video" ? "Video" : "Voice"}
//                 </Text>
//               </View>
//             </View>

//             <View
//               style={[
//                 styles.quickDivider,
//                 {
//                   backgroundColor: colors.border,
//                 },
//               ]}
//             />

//             <View style={styles.quickInfoItem}>
//               <View
//                 style={[
//                   styles.quickIcon,
//                   {
//                     backgroundColor: `${colors.success}18`,
//                   },
//                 ]}
//               >
//                 <Ionicons
//                   name="time-outline"
//                   size={18}
//                   color={colors.success}
//                 />
//               </View>

//               <View>
//                 <Text
//                   style={[
//                     styles.quickLabel,
//                     {
//                       color: colors.textMuted,
//                     },
//                   ]}
//                 >
//                   DURATION
//                 </Text>

//                 <Text
//                   style={[
//                     styles.quickValue,
//                     {
//                       color: colors.textPrimary,
//                     },
//                   ]}
//                 >
//                   {durationLabel || "—"}
//                 </Text>
//               </View>
//             </View>
//           </Animated.View>

//           {/* ================================================== */}
//           {/* PARTICIPANTS */}
//           {/* ================================================== */}

//           <Animated.View
//             style={{
//               opacity: contentOpacity,
//               transform: [
//                 {
//                   translateY: participantsAnim,
//                 },
//               ],
//             }}
//           >
//             <Text
//               style={[
//                 styles.sectionLabel,
//                 {
//                   color: colors.textMuted,
//                 },
//               ]}
//             >
//               PARTICIPANTS · {participants.length}
//             </Text>

//             <View
//               style={[
//                 styles.participantsCard,
//                 {
//                   backgroundColor: colors.background,
//                   borderColor: colors.border,
//                 },
//               ]}
//             >
//               {participants.map((participant, index) => {
//                 const isParticipantInitiator =
//                   participant._id === initiator?._id;

//                 const tag =
//                   participant._id === myId
//                     ? isParticipantInitiator
//                       ? "You · Started call"
//                       : "You"
//                     : isParticipantInitiator
//                     ? "Started call"
//                     : undefined;

//                 return (
//                   <ParticipantRow
//                     key={participant._id}
//                     person={participant}
//                     tag={tag}
//                     isLast={index === participants.length - 1}
//                   />
//                 );
//               })}
//             </View>
//           </Animated.View>

//           {/* ================================================== */}
//           {/* CALL INFORMATION */}
//           {/* ================================================== */}

//           <Animated.View
//             style={{
//               opacity: contentOpacity,
//               transform: [
//                 {
//                   translateY: infoAnim,
//                 },
//               ],
//             }}
//           >
//             <Text
//               style={[
//                 styles.sectionLabel,
//                 {
//                   color: colors.textMuted,
//                   marginTop: 24,
//                 },
//               ]}
//             >
//               CALL INFORMATION
//             </Text>

//             <View
//               style={[
//                 styles.infoCard,
//                 {
//                   backgroundColor: colors.background,
//                   borderColor: colors.border,
//                 },
//               ]}
//             >
//               {/* STATUS */}

//               <View style={styles.infoRow}>
//                 <View style={styles.infoLeft}>
//                   <View
//                     style={[
//                       styles.infoIcon,
//                       {
//                         backgroundColor: `${statusColor}16`,
//                       },
//                     ]}
//                   >
//                     <Ionicons
//                       name="information-circle-outline"
//                       size={17}
//                       color={statusColor}
//                     />
//                   </View>

//                   <Text
//                     style={[
//                       styles.infoLabel,
//                       {
//                         color: colors.textMuted,
//                       },
//                     ]}
//                   >
//                     Status
//                   </Text>
//                 </View>

//                 <Text
//                   style={[
//                     styles.infoValue,
//                     {
//                       color: statusColor,
//                     },
//                   ]}
//                 >
//                   {statusLabel}
//                 </Text>
//               </View>

//               <View
//                 style={[
//                   styles.infoDivider,
//                   {
//                     backgroundColor: colors.border,
//                   },
//                 ]}
//               />

//               {/* TIME */}

//               <View style={styles.infoRow}>
//                 <View style={styles.infoLeft}>
//                   <View
//                     style={[
//                       styles.infoIcon,
//                       {
//                         backgroundColor: `${colors.primary}16`,
//                       },
//                     ]}
//                   >
//                     <Ionicons
//                       name="calendar-outline"
//                       size={17}
//                       color={colors.primary}
//                     />
//                   </View>

//                   <Text
//                     style={[
//                       styles.infoLabel,
//                       {
//                         color: colors.textMuted,
//                       },
//                     ]}
//                   >
//                     When
//                   </Text>
//                 </View>

//                 <Text
//                   style={[
//                     styles.infoValue,
//                     {
//                       color: colors.textPrimary,
//                     },
//                   ]}
//                 >
//                   {formatDistanceToNow(new Date(call2.createdAt))} ago
//                 </Text>
//               </View>

//               {/* DURATION */}

//               {durationLabel && (
//                 <>
//                   <View
//                     style={[
//                       styles.infoDivider,
//                       {
//                         backgroundColor: colors.border,
//                       },
//                     ]}
//                   />

//                   <View style={styles.infoRow}>
//                     <View style={styles.infoLeft}>
//                       <View
//                         style={[
//                           styles.infoIcon,
//                           {
//                             backgroundColor: `${colors.success}16`,
//                           },
//                         ]}
//                       >
//                         <Ionicons
//                           name="timer-outline"
//                           size={17}
//                           color={colors.success}
//                         />
//                       </View>

//                       <Text
//                         style={[
//                           styles.infoLabel,
//                           {
//                             color: colors.textMuted,
//                           },
//                         ]}
//                       >
//                         Duration
//                       </Text>
//                     </View>

//                     <Text
//                       style={[
//                         styles.infoValue,
//                         {
//                           color: colors.textPrimary,
//                         },
//                       ]}
//                     >
//                       {durationLabel}
//                     </Text>
//                   </View>
//                 </>
//               )}
//             </View>
//           </Animated.View>
//         </ScrollView>

//         {/* ==================================================== */}
//         {/* PRIMARY ACTION */}
//         {/* ==================================================== */}

//         <Animated.View
//           style={{
//             opacity: actionOpacity,
//             transform: [
//               {
//                 scale: actionScale,
//               },
//             ],
//           }}
//         >
//           <TouchableOpacity
//             onPress={ongoingInfo ? onJoinOngoing : onCallBack}
//             onPressIn={handleActionPressIn}
//             onPressOut={handleActionPressOut}
//             activeOpacity={1}
//             style={styles.actionBtnWrap}
//           >
//             <LinearGradient colors={primaryGradient} style={styles.actionBtn}>
//               <Ionicons
//                 name={
//                   ongoingInfo
//                     ? "enter-outline"
//                     : call2.type === "video"
//                     ? "videocam"
//                     : "call"
//                 }
//                 size={20}
//                 color="#fff"
//               />

//               <Text style={styles.actionBtnText}>
//                 {ongoingInfo
//                   ? ongoingInfo.alreadyJoined
//                     ? "Return to call"
//                     : `Join ongoing call${
//                         ongoingInfo.joinedCount > 0
//                           ? ` · ${ongoingInfo.joinedCount} in call`
//                           : ""
//                       }`
//                   : "Call back"}
//               </Text>

//               <Ionicons name="arrow-forward" size={18} color="#fff" />
//             </LinearGradient>
//           </TouchableOpacity>
//         </Animated.View>

//         {/* ==================================================== */}
//         {/* DISMISS */}
//         {/* ==================================================== */}

//         <Animated.View
//           style={{
//             opacity: contentOpacity,
//           }}
//         >
//           <TouchableOpacity
//             style={styles.menuCancel}
//             onPress={closeWithAnimation}
//             activeOpacity={0.7}
//           >
//             <Text
//               style={[
//                 styles.menuCancelText,
//                 {
//                   color: colors.textMuted,
//                 },
//               ]}
//             >
//               Dismiss
//             </Text>
//           </TouchableOpacity>
//         </Animated.View>
//       </Animated.View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   // ============================================================
//   // OVERLAY
//   // ============================================================

//   menuOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     zIndex: 10,
//   },

//   // ============================================================
//   // BOTTOM SHEET
//   // ============================================================

//   menuSheet: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,

//     borderTopLeftRadius: 32,
//     borderTopRightRadius: 32,
//     borderTopWidth: 1,

//     paddingHorizontal: 20,
//     paddingBottom: 28,

//     zIndex: 11,

//     shadowOpacity: 0.15,
//     shadowRadius: 24,

//     shadowOffset: {
//       width: 0,
//       height: -8,
//     },

//     elevation: 20,
//   },

//   // ============================================================
//   // HANDLE
//   // ============================================================

//   sheetHandle: {
//     width: 40,
//     height: 5,

//     borderRadius: 10,

//     alignSelf: "center",

//     marginTop: 12,
//     marginBottom: 18,
//   },

//   // ============================================================
//   // HEADER
//   // ============================================================

//   headerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",

//     marginBottom: 4,
//   },

//   headerTitleContainer: {
//     flex: 1,
//   },

//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//     letterSpacing: -0.5,
//   },

//   headerSubtitle: {
//     fontSize: 12,
//     marginTop: 3,
//   },

//   closeBtn: {
//     width: 38,
//     height: 38,

//     borderRadius: 19,

//     justifyContent: "center",
//     alignItems: "center",
//   },

//   // ============================================================
//   // SCROLL
//   // ============================================================

//   scrollArea: {
//     maxHeight: 500,
//   },

//   scrollContent: {
//     paddingBottom: 8,
//   },

//   // ============================================================
//   // HERO
//   // ============================================================

//   heroSection: {
//     alignItems: "center",

//     paddingTop: 20,
//     paddingBottom: 24,
//   },

//   heroIcon: {
//     width: 76,
//     height: 76,

//     borderRadius: 38,

//     justifyContent: "center",
//     alignItems: "center",

//     marginBottom: 14,

//     shadowOpacity: 0.18,
//     shadowRadius: 16,

//     shadowOffset: {
//       width: 0,
//       height: 8,
//     },

//     elevation: 6,
//   },

//   heroTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     letterSpacing: -0.5,

//     textAlign: "center",
//   },

//   heroSubtitle: {
//     fontSize: 13,

//     marginTop: 8,

//     textAlign: "center",
//   },

//   statusPill: {
//     flexDirection: "row",
//     alignItems: "center",

//     gap: 7,

//     paddingHorizontal: 12,
//     paddingVertical: 7,

//     borderRadius: 100,

//     marginTop: 10,

//     alignSelf: "center",
//   },

//   statusDot: {
//     width: 7,
//     height: 7,

//     borderRadius: 10,
//   },

//   statusText: {
//     fontSize: 12,
//     fontWeight: "700",
//   },

//   // ============================================================
//   // QUICK INFORMATION
//   // ============================================================

//   quickInfoCard: {
//     flexDirection: "row",
//     alignItems: "center",

//     borderWidth: 1,
//     borderRadius: 20,

//     paddingVertical: 16,
//     paddingHorizontal: 14,

//     marginBottom: 26,
//   },

//   quickInfoItem: {
//     flex: 1,

//     flexDirection: "row",
//     alignItems: "center",

//     gap: 10,
//   },

//   quickIcon: {
//     width: 38,
//     height: 38,

//     borderRadius: 12,

//     justifyContent: "center",
//     alignItems: "center",
//   },

//   quickLabel: {
//     fontSize: 10,
//     fontWeight: "700",
//     letterSpacing: 0.8,

//     marginBottom: 3,
//   },

//   quickValue: {
//     fontSize: 14,
//     fontWeight: "700",
//   },

//   quickDivider: {
//     width: 1,
//     height: 36,

//     marginHorizontal: 10,
//   },

//   // ============================================================
//   // SECTION
//   // ============================================================

//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: "800",

//     letterSpacing: 1.1,

//     marginBottom: 10,
//   },

//   // ============================================================
//   // PARTICIPANTS
//   // ============================================================

//   participantsCard: {
//     borderWidth: 1,
//     borderRadius: 20,

//     paddingHorizontal: 14,
//   },

//   participantRow: {
//     flexDirection: "row",
//     alignItems: "center",

//     paddingVertical: 12,
//   },

//   participantInfo: {
//     flex: 1,

//     marginLeft: 12,
//     marginRight: 10,
//   },

//   pAvatar: {
//     width: 42,
//     height: 42,

//     borderRadius: 21,
//   },

//   pAvatarFallback: {
//     width: 42,
//     height: 42,

//     borderRadius: 21,

//     justifyContent: "center",
//     alignItems: "center",
//   },

//   pInitials: {
//     color: "#fff",

//     fontSize: 14,
//     fontWeight: "800",
//   },

//   pName: {
//     fontSize: 15,
//     fontWeight: "700",
//   },

//   pTag: {
//     fontSize: 12,

//     marginTop: 2,
//   },

//   // ============================================================
//   // CALL INFORMATION
//   // ============================================================

//   infoCard: {
//     borderWidth: 1,
//     borderRadius: 20,

//     paddingHorizontal: 16,

//     marginBottom: 8,
//   },

//   infoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",

//     paddingVertical: 15,
//   },

//   infoLeft: {
//     flexDirection: "row",
//     alignItems: "center",

//     gap: 10,
//   },

//   infoIcon: {
//     width: 32,
//     height: 32,

//     borderRadius: 10,

//     justifyContent: "center",
//     alignItems: "center",
//   },

//   infoLabel: {
//     fontSize: 14,
//     fontWeight: "500",
//   },

//   infoValue: {
//     fontSize: 14,
//     fontWeight: "700",
//   },

//   infoDivider: {
//     height: StyleSheet.hairlineWidth,
//   },

//   // ============================================================
//   // ACTION BUTTON
//   // ============================================================

//   actionBtnWrap: {
//     borderRadius: 18,

//     overflow: "hidden",

//     marginTop: 16,

//     shadowOpacity: 0.16,
//     shadowRadius: 14,

//     shadowOffset: {
//       width: 0,
//       height: 7,
//     },

//     elevation: 5,
//   },

//   actionBtn: {
//     minHeight: 56,

//     paddingHorizontal: 18,

//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",

//     gap: 10,
//   },

//   actionBtnText: {
//     color: "#fff",

//     fontSize: 15,
//     fontWeight: "800",

//     flexShrink: 1,

//     textAlign: "center",
//   },

//   // ============================================================
//   // DISMISS
//   // ============================================================

//   menuCancel: {
//     alignItems: "center",

//     paddingVertical: 15,

//     marginTop: 4,
//   },

//   menuCancelText: {
//     fontSize: 14,
//     fontWeight: "700",
//   },
// });

import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ColorValue,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { CallHistory, User } from "@/types";
import { useContactNameResolver } from "@/hooks/useContactName";
import { useTheme } from "@/context/ThemeContext";
import { formatDistanceToNow } from "@/utils/date";

function getCallStatusLabel(
  status: CallHistory["status"],
  isInitiator: boolean
): string {
  switch (status) {
    case "missed":
      return isInitiator ? "No Answer" : "Missed";

    case "rejected":
      return "Declined";

    case "ongoing":
      return "Ongoing";

    case "completed":
    default:
      return isInitiator ? "Outgoing" : "Incoming";
  }
}

function getCallStatusColor(
  status: CallHistory["status"],
  colors: ReturnType<typeof useTheme>["colors"]
): string {
  if (status === "missed" || status === "rejected") {
    return colors.error;
  }

  if (status === "ongoing") {
    return colors.success;
  }

  return colors.success;
}

function ParticipantRow({
  person,
  tag,
  isLast = false,
}: {
  person: User | null;
  tag?: string;
  isLast?: boolean;
}) {
  const { colors } = useTheme();
  const resolveContact = useContactNameResolver();

  const { displayName } = resolveContact(person?.phone, person?.name);

  const initials = (displayName || "?")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        styles.participantRow,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {person?.avatar ? (
        <Image
          source={{ uri: person.avatar }}
          style={styles.pAvatar}
          contentFit="cover"
        />
      ) : (
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.pAvatarFallback}
        >
          <Text style={styles.pInitials}>{initials}</Text>
        </LinearGradient>
      )}

      <View style={styles.participantInfo}>
        <Text
          style={[styles.pName, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {displayName || "Unknown"}
        </Text>

        {tag ? (
          <Text style={[styles.pTag, { color: colors.textMuted }]}>{tag}</Text>
        ) : null}
      </View>

      <Ionicons name="person-outline" size={18} color={colors.textMuted} />
    </View>
  );
}

export interface OngoingInfo {
  alreadyJoined: boolean;
  joinedCount: number;
}

export default function CallDetailsModal({
  visible,
  call,
  myId,
  isGroup,
  ongoingInfo,
  onClose,
  onCallBack,
  onJoinOngoing,
}: {
  visible: boolean;
  call: CallHistory | null;
  myId: string;
  isGroup: boolean;
  ongoingInfo?: OngoingInfo | null;
  onClose: () => void;
  onCallBack: () => void;
  onJoinOngoing: () => void;
}) {
  const { colors } = useTheme();

  const [modalMounted, setModalMounted] = useState(visible);
  const [renderedCall, setRenderedCall] = useState<CallHistory | null>(call);

  // ------------------------------------------------------------
  // ANIMATION VALUES
  // ------------------------------------------------------------

  const overlayAnim = useRef(new Animated.Value(0)).current;

  const slideAnim = useRef(new Animated.Value(600)).current;

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  const heroScale = useRef(new Animated.Value(0.75)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroRotate = useRef(new Animated.Value(-8)).current;

  const quickInfoAnim = useRef(new Animated.Value(25)).current;
  const participantsAnim = useRef(new Animated.Value(25)).current;
  const infoAnim = useRef(new Animated.Value(25)).current;

  const actionScale = useRef(new Animated.Value(0.92)).current;
  const actionOpacity = useRef(new Animated.Value(0)).current;

  const closeScale = useRef(new Animated.Value(1)).current;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ------------------------------------------------------------
  // KEEP CALL DATA UPDATED
  // ------------------------------------------------------------

  useEffect(() => {
    if (call) {
      setRenderedCall(call);
    }
  }, [call]);

  // ------------------------------------------------------------
  // OPEN / CLOSE ANIMATION
  // ------------------------------------------------------------

  useEffect(() => {
    if (visible) {
      setModalMounted(true);

      // Reset animations
      overlayAnim.setValue(0);
      slideAnim.setValue(600);

      contentOpacity.setValue(0);
      contentTranslateY.setValue(20);

      heroScale.setValue(0.75);
      heroOpacity.setValue(0);
      heroRotate.setValue(-8);

      quickInfoAnim.setValue(25);
      participantsAnim.setValue(25);
      infoAnim.setValue(25);

      actionScale.setValue(0.92);
      actionOpacity.setValue(0);

      closeScale.setValue(1);
      pulseAnim.setValue(1);

      // --------------------------------------------------------
      // SHEET + BACKDROP
      // --------------------------------------------------------

      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),

        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 75,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();

      // --------------------------------------------------------
      // HEADER / GENERAL CONTENT
      // --------------------------------------------------------

      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 350,
          delay: 100,
          useNativeDriver: true,
        }),

        Animated.spring(contentTranslateY, {
          toValue: 0,
          delay: 80,
          tension: 90,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();

      // --------------------------------------------------------
      // HERO ICON
      // --------------------------------------------------------

      Animated.parallel([
        Animated.spring(heroScale, {
          toValue: 1,
          delay: 120,
          tension: 140,
          friction: 8,
          useNativeDriver: true,
        }),

        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 250,
          delay: 120,
          useNativeDriver: true,
        }),

        Animated.spring(heroRotate, {
          toValue: 0,
          delay: 120,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // --------------------------------------------------------
      // CARDS
      // --------------------------------------------------------

      Animated.stagger(70, [
        Animated.spring(quickInfoAnim, {
          toValue: 0,
          delay: 180,
          tension: 90,
          friction: 12,
          useNativeDriver: true,
        }),

        Animated.spring(participantsAnim, {
          toValue: 0,
          delay: 220,
          tension: 90,
          friction: 12,
          useNativeDriver: true,
        }),

        Animated.spring(infoAnim, {
          toValue: 0,
          delay: 260,
          tension: 90,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();

      // --------------------------------------------------------
      // ACTION BUTTON
      // --------------------------------------------------------

      Animated.parallel([
        Animated.spring(actionScale, {
          toValue: 1,
          delay: 350,
          tension: 120,
          friction: 9,
          useNativeDriver: true,
        }),

        Animated.timing(actionOpacity, {
          toValue: 1,
          duration: 250,
          delay: 350,
          useNativeDriver: true,
        }),
      ]).start();

      // --------------------------------------------------------
      // SUBTLE HERO PULSE
      // --------------------------------------------------------

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1200,
            useNativeDriver: true,
          }),

          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (modalMounted) {
      pulseAnim.stopAnimation();

      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),

        Animated.timing(slideAnim, {
          toValue: 600,
          duration: 260,
          useNativeDriver: true,
        }),

        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),

        Animated.timing(actionOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalMounted(false);
      });
    }
  }, [visible]);

  // ------------------------------------------------------------
  // BUTTON ANIMATIONS
  // ------------------------------------------------------------

  const handleActionPressIn = () => {
    Animated.spring(actionScale, {
      toValue: 0.96,
      tension: 200,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  const handleActionPressOut = () => {
    Animated.spring(actionScale, {
      toValue: 1,
      tension: 180,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleClosePressIn = () => {
    Animated.spring(closeScale, {
      toValue: 0.86,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleClosePressOut = () => {
    Animated.spring(closeScale, {
      toValue: 1,
      tension: 180,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const closeWithAnimation = () => {
    onClose();
  };

  // ------------------------------------------------------------
  // DATA
  // ------------------------------------------------------------

  if (!modalMounted || !renderedCall) {
    return null;
  }

  const call2 = renderedCall;

  const initiator = call2.initiator as User | null;

  const isInitiator = initiator?._id === myId;

  const statusLabel = getCallStatusLabel(call2.status, isInitiator);

  const statusColor = getCallStatusColor(call2.status, colors);

  const durationLabel = call2.duration
    ? `${Math.floor(call2.duration / 60)}:${(call2.duration % 60)
        .toString()
        .padStart(2, "0")}`
    : null;

  const participants = [
    initiator,
    ...call2.participants.filter(
      (participant) => participant && participant._id !== initiator?._id
    ),
  ].filter(Boolean) as User[];

  const primaryGradient: readonly [ColorValue, ColorValue] =
    call2.type === "video"
      ? [colors.secondary, colors.primaryDark]
      : [colors.primary, colors.primaryDark];

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <Modal
      visible={modalMounted}
      transparent
      animationType="none"
      onRequestClose={closeWithAnimation}
    >
      {/* ====================================================== */}
      {/* BACKDROP */}
      {/* ====================================================== */}

      <Animated.View
        style={[
          styles.menuOverlay,
          {
            opacity: overlayAnim,
            backgroundColor: colors.overlay,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={closeWithAnimation}
        />
      </Animated.View>

      {/* ====================================================== */}
      {/* BOTTOM SHEET */}
      {/* ====================================================== */}

      <Animated.View
        style={[
          styles.menuSheet,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,

            transform: [
              {
                translateY: slideAnim,
              },
            ],
          },
        ]}
      >
        {/* ==================================================== */}
        {/* HANDLE */}
        {/* ==================================================== */}

        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [
              {
                scaleX: contentOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.sheetHandle,
              {
                backgroundColor: colors.border,
              },
            ]}
          />
        </Animated.View>

        {/* ==================================================== */}
        {/* HEADER */}
        {/* ==================================================== */}

        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [
              {
                translateY: contentTranslateY,
              },
            ],
          }}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTitleContainer}>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: colors.textPrimary,
                  },
                ]}
                numberOfLines={1}
              >
                {isGroup ? call2.chat?.name || "Group call" : "Call details"}
              </Text>

              <Text
                style={[
                  styles.headerSubtitle,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                {isGroup ? "Group call details" : "Call information"}
              </Text>
            </View>

            <Animated.View
              style={{
                transform: [{ scale: closeScale }],
              }}
            >
              <TouchableOpacity
                onPress={closeWithAnimation}
                onPressIn={handleClosePressIn}
                onPressOut={handleClosePressOut}
                activeOpacity={1}
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: colors.background,
                  },
                ]}
              >
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>

        {/* ==================================================== */}
        {/* SCROLL CONTENT */}
        {/* ==================================================== */}

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ================================================== */}
          {/* HERO */}
          {/* ================================================== */}

          <View style={styles.heroSection}>
            <Animated.View
              style={{
                opacity: heroOpacity,

                transform: [
                  {
                    scale: Animated.multiply(heroScale, pulseAnim),
                  },
                  {
                    rotate: heroRotate.interpolate({
                      inputRange: [-8, 0],
                      outputRange: ["-8deg", "0deg"],
                    }),
                  },
                ],
              }}
            >
              <LinearGradient colors={primaryGradient} style={styles.heroIcon}>
                <Ionicons
                  name={call2.type === "video" ? "videocam" : "call"}
                  size={34}
                  color="#fff"
                />
              </LinearGradient>
            </Animated.View>

            <Animated.View
              style={{
                opacity: contentOpacity,
                transform: [
                  {
                    translateY: contentTranslateY,
                  },
                ],
              }}
            >
              <Text
                style={[
                  styles.heroTitle,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                {call2.type === "video" ? "Video call" : "Voice call"}
              </Text>

              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: `${statusColor}18`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: statusColor,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    {
                      color: statusColor,
                    },
                  ]}
                >
                  {statusLabel}
                </Text>
              </View>

              <Text
                style={[
                  styles.heroSubtitle,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                {formatDistanceToNow(new Date(call2.createdAt))} ago
              </Text>
            </Animated.View>
          </View>

          {/* ================================================== */}
          {/* QUICK INFORMATION */}
          {/* ================================================== */}

          <Animated.View
            style={[
              styles.quickInfoCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                opacity: contentOpacity,

                transform: [
                  {
                    translateY: quickInfoAnim,
                  },
                ],
              },
            ]}
          >
            <View style={styles.quickInfoItem}>
              <View
                style={[
                  styles.quickIcon,
                  {
                    backgroundColor: `${colors.primary}18`,
                  },
                ]}
              >
                <Ionicons
                  name={
                    call2.type === "video" ? "videocam-outline" : "call-outline"
                  }
                  size={18}
                  color={colors.primary}
                />
              </View>

              <View>
                <Text
                  style={[
                    styles.quickLabel,
                    {
                      color: colors.textMuted,
                    },
                  ]}
                >
                  TYPE
                </Text>

                <Text
                  style={[
                    styles.quickValue,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {call2.type === "video" ? "Video" : "Voice"}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.quickDivider,
                {
                  backgroundColor: colors.border,
                },
              ]}
            />

            <View style={styles.quickInfoItem}>
              <View
                style={[
                  styles.quickIcon,
                  {
                    backgroundColor: `${colors.success}18`,
                  },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={colors.success}
                />
              </View>

              <View>
                <Text
                  style={[
                    styles.quickLabel,
                    {
                      color: colors.textMuted,
                    },
                  ]}
                >
                  DURATION
                </Text>

                <Text
                  style={[
                    styles.quickValue,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {durationLabel || "—"}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* ================================================== */}
          {/* PARTICIPANTS */}
          {/* ================================================== */}

          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [
                {
                  translateY: participantsAnim,
                },
              ],
            }}
          >
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.textMuted,
                },
              ]}
            >
              PARTICIPANTS · {participants.length}
            </Text>

            <View
              style={[
                styles.participantsCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              {participants.map((participant, index) => {
                const isParticipantInitiator =
                  participant._id === initiator?._id;

                const tag =
                  participant._id === myId
                    ? isParticipantInitiator
                      ? "You · Started call"
                      : "You"
                    : isParticipantInitiator
                    ? "Started call"
                    : undefined;

                return (
                  <ParticipantRow
                    key={participant._id}
                    person={participant}
                    tag={tag}
                    isLast={index === participants.length - 1}
                  />
                );
              })}
            </View>
          </Animated.View>

          {/* ================================================== */}
          {/* CALL INFORMATION */}
          {/* ================================================== */}

          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [
                {
                  translateY: infoAnim,
                },
              ],
            }}
          >
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.textMuted,
                  marginTop: 24,
                },
              ]}
            >
              CALL INFORMATION
            </Text>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* STATUS */}

              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <View
                    style={[
                      styles.infoIcon,
                      {
                        backgroundColor: `${statusColor}16`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={17}
                      color={statusColor}
                    />
                  </View>

                  <Text
                    style={[
                      styles.infoLabel,
                      {
                        color: colors.textMuted,
                      },
                    ]}
                  >
                    Status
                  </Text>
                </View>

                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: statusColor,
                    },
                  ]}
                >
                  {statusLabel}
                </Text>
              </View>

              <View
                style={[
                  styles.infoDivider,
                  {
                    backgroundColor: colors.border,
                  },
                ]}
              />

              {/* TIME */}

              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <View
                    style={[
                      styles.infoIcon,
                      {
                        backgroundColor: `${colors.primary}16`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={17}
                      color={colors.primary}
                    />
                  </View>

                  <Text
                    style={[
                      styles.infoLabel,
                      {
                        color: colors.textMuted,
                      },
                    ]}
                  >
                    When
                  </Text>
                </View>

                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {formatDistanceToNow(new Date(call2.createdAt))} ago
                </Text>
              </View>

              {/* DURATION */}

              {durationLabel && (
                <>
                  <View
                    style={[
                      styles.infoDivider,
                      {
                        backgroundColor: colors.border,
                      },
                    ]}
                  />

                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <View
                        style={[
                          styles.infoIcon,
                          {
                            backgroundColor: `${colors.success}16`,
                          },
                        ]}
                      >
                        <Ionicons
                          name="timer-outline"
                          size={17}
                          color={colors.success}
                        />
                      </View>

                      <Text
                        style={[
                          styles.infoLabel,
                          {
                            color: colors.textMuted,
                          },
                        ]}
                      >
                        Duration
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color: colors.textPrimary,
                        },
                      ]}
                    >
                      {durationLabel}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* ==================================================== */}
        {/* PRIMARY ACTION */}
        {/* ==================================================== */}

        <Animated.View
          style={{
            opacity: actionOpacity,
            transform: [
              {
                scale: actionScale,
              },
            ],
          }}
        >
          <TouchableOpacity
            onPress={ongoingInfo ? onJoinOngoing : onCallBack}
            onPressIn={handleActionPressIn}
            onPressOut={handleActionPressOut}
            activeOpacity={1}
            style={styles.actionBtnWrap}
          >
            <LinearGradient colors={primaryGradient} style={styles.actionBtn}>
              <Ionicons
                name={
                  ongoingInfo
                    ? "enter-outline"
                    : call2.type === "video"
                    ? "videocam"
                    : "call"
                }
                size={20}
                color="#fff"
              />

              <Text style={styles.actionBtnText}>
                {ongoingInfo
                  ? ongoingInfo.alreadyJoined
                    ? "Return to call"
                    : `Join ongoing call${
                        ongoingInfo.joinedCount > 0
                          ? ` · ${ongoingInfo.joinedCount} in call`
                          : ""
                      }`
                  : "Call back"}
              </Text>

              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ==================================================== */}
        {/* DISMISS */}
        {/* ==================================================== */}

        <Animated.View
          style={{
            opacity: contentOpacity,
          }}
        >
          <TouchableOpacity
            style={styles.menuCancel}
            onPress={closeWithAnimation}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.menuCancelText,
                {
                  color: colors.textMuted,
                },
              ]}
            >
              Dismiss
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // ============================================================
  // OVERLAY
  // ============================================================

  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },

  // ============================================================
  // BOTTOM SHEET
  // ============================================================

  menuSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,

    paddingHorizontal: 20,
    paddingBottom: 28,

    zIndex: 11,

    shadowOpacity: 0.15,
    shadowRadius: 24,

    shadowOffset: {
      width: 0,
      height: -8,
    },

    elevation: 20,
  },

  // ============================================================
  // HANDLE
  // ============================================================

  sheetHandle: {
    width: 40,
    height: 5,

    borderRadius: 10,

    alignSelf: "center",

    marginTop: 12,
    marginBottom: 18,
  },

  // ============================================================
  // HEADER
  // ============================================================

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 4,
  },

  headerTitleContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  closeBtn: {
    width: 38,
    height: 38,

    borderRadius: 19,

    justifyContent: "center",
    alignItems: "center",
  },

  // ============================================================
  // SCROLL
  // ============================================================

  scrollArea: {
    maxHeight: 500,
  },

  scrollContent: {
    paddingBottom: 8,
  },

  // ============================================================
  // HERO
  // ============================================================

  heroSection: {
    alignItems: "center",

    paddingTop: 20,
    paddingBottom: 24,
  },

  heroIcon: {
    width: 76,
    height: 76,

    borderRadius: 38,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 14,

    shadowOpacity: 0.18,
    shadowRadius: 16,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 6,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,

    textAlign: "center",
  },

  heroSubtitle: {
    fontSize: 13,

    marginTop: 8,

    textAlign: "center",
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",

    gap: 7,

    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 100,

    marginTop: 10,

    alignSelf: "center",
  },

  statusDot: {
    width: 7,
    height: 7,

    borderRadius: 10,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // ============================================================
  // QUICK INFORMATION
  // ============================================================

  quickInfoCard: {
    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderRadius: 20,

    paddingVertical: 16,
    paddingHorizontal: 14,

    marginBottom: 26,
  },

  quickInfoItem: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,
  },

  quickIcon: {
    width: 38,
    height: 38,

    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",
  },

  quickLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,

    marginBottom: 3,
  },

  quickValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  quickDivider: {
    width: 1,
    height: 36,

    marginHorizontal: 10,
  },

  // ============================================================
  // SECTION
  // ============================================================

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",

    letterSpacing: 1.1,

    marginBottom: 10,
  },

  // ============================================================
  // PARTICIPANTS
  // ============================================================

  participantsCard: {
    borderWidth: 1,
    borderRadius: 20,

    paddingHorizontal: 14,
  },

  participantRow: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 12,
  },

  participantInfo: {
    flex: 1,

    marginLeft: 12,
    marginRight: 10,
  },

  pAvatar: {
    width: 42,
    height: 42,

    borderRadius: 21,
  },

  pAvatarFallback: {
    width: 42,
    height: 42,

    borderRadius: 21,

    justifyContent: "center",
    alignItems: "center",
  },

  pInitials: {
    color: "#fff",

    fontSize: 14,
    fontWeight: "800",
  },

  pName: {
    fontSize: 15,
    fontWeight: "700",
  },

  pTag: {
    fontSize: 12,

    marginTop: 2,
  },

  // ============================================================
  // CALL INFORMATION
  // ============================================================

  infoCard: {
    borderWidth: 1,
    borderRadius: 20,

    paddingHorizontal: 16,

    marginBottom: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingVertical: 15,
  },

  infoLeft: {
    flexDirection: "row",
    alignItems: "center",

    gap: 10,
  },

  infoIcon: {
    width: 32,
    height: 32,

    borderRadius: 10,

    justifyContent: "center",
    alignItems: "center",
  },

  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  infoDivider: {
    height: StyleSheet.hairlineWidth,
  },

  // ============================================================
  // ACTION BUTTON
  // ============================================================

  actionBtnWrap: {
    borderRadius: 18,

    overflow: "hidden",

    marginTop: 16,

    shadowOpacity: 0.16,
    shadowRadius: 14,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 5,
  },

  actionBtn: {
    minHeight: 56,

    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 10,
  },

  actionBtnText: {
    color: "#fff",

    fontSize: 15,
    fontWeight: "800",

    flexShrink: 1,

    textAlign: "center",
  },

  // ============================================================
  // DISMISS
  // ============================================================

  menuCancel: {
    alignItems: "center",

    paddingVertical: 15,

    marginTop: 4,
  },

  menuCancelText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
