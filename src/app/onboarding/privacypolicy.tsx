import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import { setIsCompleteOnboarding } from "@/store/slices/onboardingslice";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { width } = Dimensions.get("window");
const BRAND = "#5bbbdf";

const privacyPolicyData = [
  {
    title: "Information We Collect",
    icon: "📋",
    points: [
      "Name, email, phone number for account creation",
      "Profile details (username, profile picture, bio)",
      "Text, images, videos, and files shared in chats",
      "IP address, device type, operating system",
      "Location data only if you enable location features",
    ],
  },
  {
    title: "How We Use Your Information",
    icon: "⚙️",
    points: [
      "To provide and improve LinksChat services",
      "To personalize your experience",
      "To detect and prevent fraud or abuse",
      "For analytics and app improvements",
    ],
  },
  {
    title: "Data Sharing & Disclosure",
    icon: "🔗",
    points: [
      "We do not sell your personal data",
      "Service Providers (hosting, analytics, support)",
      "Legal Authorities if required by law",
      "Other users only see what you choose to share",
    ],
  },
  {
    title: "Data Security",
    icon: "🔒",
    points: [
      "SSL/TLS encryption protects data in transit",
      "Secure servers with access controls",
      "No system is 100% secure — use caution with sensitive info",
    ],
  },
  {
    title: "Your Rights",
    icon: "✋",
    points: [
      "Delete account via Settings at any time",
      "Opt-out by disabling permissions in device settings",
      "Request a copy or correction of your data via support",
    ],
  },
  {
    title: "Children's Privacy",
    icon: "👶",
    points: [
      "LinksChat is not intended for users under 13",
      "We do not knowingly collect data from children",
    ],
  },
];

export default function PrivacyPolicyScreen() {
  const [accepted, setAccepted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dispatch = useDispatch();

  // Entrance animations
  const headerY = useSharedValue(40);
  const headerO = useSharedValue(0);
  const cardY = useSharedValue(60);
  const cardO = useSharedValue(0);
  const footerY = useSharedValue(40);
  const footerO = useSharedValue(0);

  // Checkbox animation
  const checkScale = useSharedValue(1);
  const checkBg = useSharedValue(0);
  const btnScale = useSharedValue(1);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    headerY.value = withDelay(
      100,
      withTiming(0, { duration: 600, easing: ease })
    );
    headerO.value = withDelay(100, withTiming(1, { duration: 500 }));
    cardY.value = withDelay(
      300,
      withTiming(0, { duration: 700, easing: ease })
    );
    cardO.value = withDelay(300, withTiming(1, { duration: 600 }));
    footerY.value = withDelay(
      500,
      withTiming(0, { duration: 600, easing: ease })
    );
    footerO.value = withDelay(500, withTiming(1, { duration: 500 }));
  }, []);

  const toggleAccept = () => {
    const next = !accepted;
    setAccepted(next);
    checkScale.value = withSpring(0.85, { damping: 10, stiffness: 300 }, () => {
      checkScale.value = withSpring(1, { damping: 10, stiffness: 300 });
    });
    checkBg.value = withTiming(next ? 1 : 0, { duration: 200 });
  };

  const handleNext = async () => {
    if (!accepted) return;
    btnScale.value = withSpring(0.96, { damping: 15 }, () => {
      btnScale.value = withSpring(1, { damping: 15 });
    });
    dispatch(setIsCompleteOnboarding(true));
    await AsyncStorage.setItem("isCompleteOnboarding", JSON.stringify(true));
    router.replace("/(auth)/login");
  };

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerY.value }],
    opacity: headerO.value,
  }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity: cardO.value,
  }));
  const footerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: footerY.value }],
    opacity: footerO.value,
  }));
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));
  const checkFillStyle = useAnimatedStyle(() => ({
    opacity: checkBg.value,
  }));
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
    opacity: accepted ? 1 : 0.45,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#05101a", "#081c2e", "#0c2540"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative accent bar */}
      <LinearGradient
        colors={[BRAND + "00", BRAND + "40", BRAND + "00"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentBar}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerChip}>
            <Text style={styles.headerChipText}>🛡️ Privacy Policy</Text>
          </View>
          <Text style={styles.headerTitle}>
            Your Data,{"\n"}Our Responsibility
          </Text>
          <Text style={styles.headerSub}>Last updated June 9, 2025</Text>
        </Animated.View>

        {/* Policy card */}
        <Animated.View style={cardStyle}>
          <BlurView intensity={12} tint="dark" style={styles.card}>
            {/* Intro */}
            <Text style={styles.introText}>
              Welcome to LinksChat. We collect and use your data only to provide
              you with a better messaging experience, never to sell or exploit
              it.
            </Text>

            {/* Toggle expand */}
            <TouchableOpacity
              onPress={() => setExpanded((p) => !p)}
              style={styles.expandBtn}
            >
              <LinearGradient
                colors={["rgba(91,187,223,0.12)", "rgba(91,187,223,0.06)"]}
                style={styles.expandBtnInner}
              >
                {expanded ? (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <Text style={styles.expandBtnText}>Hide full policy </Text>{" "}
                    <Ionicons name="arrow-up" size={20} color="#fff" />
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <Text style={styles.expandBtnText}>Read full policy</Text>
                    <Ionicons name="arrow-down" size={20} color="#fff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Sections */}
            {expanded && (
              <View style={styles.sectionsWrapper}>
                {privacyPolicyData.map((section, i) => (
                  <PolicySection key={i} section={section} index={i} />
                ))}
              </View>
            )}

            <View style={styles.divider} />

            {/* Accept row */}
            <View style={styles.acceptRow}>
              <Pressable onPress={toggleAccept}>
                <Animated.View style={[styles.checkbox, checkStyle]}>
                  <LinearGradient
                    colors={[BRAND, "#1a8ab0"]}
                    style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
                  />
                  <Animated.View style={[styles.checkboxFill, checkFillStyle]}>
                    <Text style={styles.checkmark}>✓</Text>
                  </Animated.View>
                </Animated.View>
              </Pressable>
              <Text style={styles.acceptText}>
                I have read and agree to the{" "}
                <Text style={styles.acceptLink}>Privacy Policy</Text>
              </Text>
            </View>
          </BlurView>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.btnWrapper, footerStyle, btnStyle]}>
          <Pressable
            onPress={handleNext}
            disabled={!accepted}
            style={styles.btnPressable}
          >
            <LinearGradient
              colors={accepted ? [BRAND, "#1a8ab0"] : ["#1e3a50", "#1e3a50"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              <Text style={styles.btnText}>
                {accepted ? "Continue to Login" : "Accept to continue"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function PolicySection({
  section,
  index,
}: {
  section: { title: string; icon: string; points: string[] };
  index: number;
}) {
  const y = useSharedValue(20);
  const o = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      index * 80,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    o.value = withDelay(index * 80, withTiming(1, { duration: 400 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: o.value,
  }));

  return (
    <Animated.View style={[styles.section, style]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{section.icon}</Text>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      {section.points.map((point, i) => (
        <View key={i} style={styles.pointRow}>
          <View style={styles.pointDot} />
          <Text style={styles.pointText}>{point}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: { marginBottom: 24 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(91,187,223,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  backArrow: { color: BRAND, fontSize: 20 },
  headerChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(91,187,223,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(91,187,223,0.2)",
    marginBottom: 14,
  },
  headerChipText: { color: BRAND, fontSize: 12, fontWeight: "600" },
  headerTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 6,
  },
  headerSub: { color: "#4a6a80", fontSize: 13 },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(91,187,223,0.12)",
    padding: 20,
    marginBottom: 20,
  },
  introText: {
    color: "#9ab5c8",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  expandBtn: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 4,
  },
  expandBtnInner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(91,187,223,0.15)",
    alignItems: "center",
  },
  expandBtnText: { color: BRAND, fontSize: 13, fontWeight: "600" },
  sectionsWrapper: { marginTop: 16, gap: 16 },
  section: {
    borderLeftWidth: 2,
    borderLeftColor: BRAND + "50",
    paddingLeft: 14,
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionIcon: { fontSize: 16 },
  sectionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  pointDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: BRAND + "90",
    marginTop: 7,
  },
  pointText: { color: "#7899a8", fontSize: 13, lineHeight: 20, flex: 1 },
  divider: {
    height: 1,
    backgroundColor: "rgba(91,187,223,0.1)",
    marginVertical: 16,
  },
  acceptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: BRAND,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxFill: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: { color: "#fff", fontSize: 16, fontWeight: "700" },
  acceptText: {
    color: "#9ab5c8",
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
  acceptLink: { color: BRAND, fontWeight: "600" },
  btnWrapper: { borderRadius: 16, overflow: "hidden" },
  btnPressable: { borderRadius: 16, overflow: "hidden" },
  btn: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
