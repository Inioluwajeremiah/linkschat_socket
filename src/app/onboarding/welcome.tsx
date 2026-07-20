import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { windowHeight, windowWidth } from "@/utils/dimensions";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const BRAND = "#38bdf8";
const BRAND_DEEP = "#0ea5e9";

// Floating orb component
function Orb({
  size,
  top,
  left,
  color,
  delay,
}: {
  size: number;
  top: number;
  left: number;
  color: string;
  delay: number;
}) {
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 1000 }));
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-20, {
            duration: 3000 + delay * 0.3,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, {
            duration: 3000 + delay * 0.3,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

type Props = { navigation: any };

const Welcome: React.FC<Props> = () => {
  const router = useRouter();
  // Staggered entrance values
  const imgY = useSharedValue(60);
  const imgO = useSharedValue(0);
  const chipO = useSharedValue(0);
  const chipY = useSharedValue(20);
  const titleO = useSharedValue(0);
  const titleY = useSharedValue(30);
  const subO = useSharedValue(0);
  const descO = useSharedValue(0);
  const logoO = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const btnO = useSharedValue(0);
  const btnY = useSharedValue(30);
  const btnScale = useSharedValue(1);

  // Image float
  const float = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    imgY.value = withDelay(100, withTiming(0, { duration: 700, easing: ease }));
    imgO.value = withDelay(100, withTiming(1, { duration: 700 }));

    chipY.value = withDelay(
      350,
      withTiming(0, { duration: 500, easing: ease })
    );
    chipO.value = withDelay(350, withTiming(1, { duration: 400 }));

    titleY.value = withDelay(
      480,
      withTiming(0, { duration: 600, easing: ease })
    );
    titleO.value = withDelay(480, withTiming(1, { duration: 500 }));

    subO.value = withDelay(620, withTiming(1, { duration: 500 }));
    descO.value = withDelay(750, withTiming(1, { duration: 500 }));

    logoScale.value = withDelay(
      850,
      withSpring(1, { damping: 12, stiffness: 120 })
    );
    logoO.value = withDelay(850, withTiming(1, { duration: 400 }));

    btnY.value = withDelay(980, withTiming(0, { duration: 600, easing: ease }));
    btnO.value = withDelay(980, withTiming(1, { duration: 500 }));

    // Gentle float loop
    float.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const imgStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: imgY.value + float.value }],
    opacity: imgO.value,
  }));
  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: chipY.value }],
    opacity: chipO.value,
  }));
  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleO.value,
  }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subO.value }));
  const descStyle = useAnimatedStyle(() => ({ opacity: descO.value }));
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoO.value,
  }));
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: btnY.value }, { scale: btnScale.value }],
    opacity: btnO.value,
  }));

  return (
    <View style={styles.root}>
      {/* Deep background */}
      <LinearGradient
        colors={["#020c18", "#071628", "#0a1f35"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Background orbs */}
      <Orb
        size={260}
        top={-60}
        left={-80}
        color="rgba(14,165,233,0.08)"
        delay={0}
      />
      <Orb
        size={180}
        top={height * 0.45}
        left={width * 0.6}
        color="rgba(56,189,248,0.06)"
        delay={400}
      />
      <Orb
        size={120}
        top={height * 0.75}
        left={-40}
        color="rgba(2,132,199,0.07)"
        delay={200}
      />

      {/* Top accent line */}
      <LinearGradient
        colors={["transparent", BRAND + "60", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentLine}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          {/* Hero image */}
          <Animated.View style={[styles.imageWrapper, imgStyle]}>
            {/* Glow beneath image */}
            <View style={styles.imageGlow} />
            <Image
              source={require("../../../assets/welcome.png")}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Text section */}
          <View style={styles.textSection}>
            {/* Chip */}
            {/* <Animated.View style={chipStyle}>
              <BlurView intensity={18} tint="dark" style={styles.chip}>
                <View style={styles.chipDot} />
                <Text style={styles.chipText}>MESSAGING · REIMAGINED</Text>
              </BlurView>
            </Animated.View> */}

            {/* Title */}
            <Animated.View style={titleStyle}>
              {/* <Text style={styles.titleLine1}></Text> */}
              <Text style={styles.titleLine2}>LinksChat.</Text>
            </Animated.View>

            {/* Subtitle */}
            <Animated.Text style={[styles.subtitle, subStyle]}>
              Now discuss anything, anywhere
            </Animated.Text>

            {/* Description */}
            <Animated.Text style={[styles.description, descStyle]}>
              Create conferences, invite people, and collaborate in real time —
              secure, fast, and beautifully simple.
            </Animated.Text>
          </View>

          {/* Bottom section */}
          <View style={styles.bottomSection}>
            {/* Logo + brand row */}
            <Animated.View style={[styles.brandRow, logoStyle]}>
              <View style={styles.logoRing}>
                <Image
                  source={require("../../../assets/newlogo.jpeg")}
                  style={styles.logo}
                />
              </View>
              <View style={styles.brandMeta}>
                <Text style={styles.brandName}>LinksChat</Text>
                <Text style={styles.brandTagline}>Secure by default</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            </Animated.View>

            {/* CTA Button */}
            <Animated.View style={btnStyle}>
              <Pressable
                onPressIn={() => {
                  btnScale.value = withSpring(0.96, {
                    damping: 15,
                    stiffness: 300,
                  });
                }}
                onPressOut={() => {
                  btnScale.value = withSpring(1, {
                    damping: 15,
                    stiffness: 300,
                  });
                }}
                onPress={() => router.push("/onboarding/privacypolicy")}
                style={styles.btnPressable}
              >
                <LinearGradient
                  colors={[BRAND_DEEP, "#0284c7", "#0369a1"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.btn}
                >
                  <Text style={styles.btnText}>Get Started</Text>
                  <View style={styles.btnArrowBadge}>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Footer note */}
            <Animated.Text style={[styles.footNote, descStyle]}>
              By continuing you agree to our Privacy Policy
            </Animated.Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  root: { flex: 1 },
  accentLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: "space-between",
  },

  // Image
  imageWrapper: {
    alignItems: "center",
    marginTop: 8,
  },
  imageGlow: {
    position: "absolute",
    bottom: 0,
    width: windowWidth * 0.6,
    height: 40,
    borderRadius: 60,
    backgroundColor: BRAND_DEEP,
    opacity: 0.15,
    transform: [{ scaleX: 1.4 }],
  },
  heroImage: {
    height: windowHeight * 0.28,
    width: windowWidth * 0.75,
  },

  // Text
  textSection: { marginTop: 4 },
  chip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.2)",
    marginBottom: 16,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND,
  },
  chipText: {
    color: BRAND,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  titleLine1: {
    fontSize: 56,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -2,
    lineHeight: 58,
  },
  titleLine2: {
    fontSize: 56,
    fontWeight: "900",
    color: BRAND,
    letterSpacing: -2,
    lineHeight: 58,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: "rgba(148,185,212,0.7)",
    lineHeight: 21,
    maxWidth: 300,
  },

  // Bottom
  bottomSection: { gap: 16 },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(56,189,248,0.05)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.1)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logoRing: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BRAND + "60",
    overflow: "hidden",
    padding: 2,
  },
  logo: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  brandMeta: { flex: 1 },
  brandName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  brandTagline: {
    color: "rgba(148,185,212,0.6)",
    fontSize: 11,
    marginTop: 1,
  },
  verifiedBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: BRAND_DEEP,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // Button
  btnPressable: { borderRadius: 16, overflow: "hidden" },
  btn: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    shadowColor: BRAND_DEEP,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  btnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  btnArrowBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnArrow: { color: "#fff", fontSize: 17 },

  footNote: {
    color: "rgba(100,140,165,0.6)",
    fontSize: 11,
    textAlign: "center",
  },
});
