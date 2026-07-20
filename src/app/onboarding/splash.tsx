import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppSelector } from "@/hooks/useRedux";

const BRAND = "#38bdf8";
const BRAND_DEEP = "#0ea5e9";

const Splashscreen = () => {
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const navigateNext = () => {
    router.replace(isAuthenticated ? "/(tabs)" : "/onboarding/welcome");
  };

  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const float = useSharedValue(0);
  const shimmerX = useSharedValue(-160);

  const titleY = useSharedValue(24);
  const titleO = useSharedValue(0);
  const subtitleY = useSharedValue(16);
  const subtitleO = useSharedValue(0);

  const dotScale = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  useEffect(() => {
    // Logo pop
    logoScale.value = withSpring(1, { damping: 11, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 500 });

    // Shimmer sweep across logo
    shimmerX.value = withDelay(
      500,
      withTiming(160, { duration: 800, easing: Easing.out(Easing.quad) })
    );

    // Title slide up
    titleY.value = withDelay(
      400,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    titleO.value = withDelay(400, withTiming(1, { duration: 500 }));

    // Subtitle
    subtitleY.value = withDelay(
      580,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    subtitleO.value = withDelay(580, withTiming(1, { duration: 500 }));

    // Loader dots bounce in
    dotScale.forEach((dot, i) => {
      dot.value = withDelay(
        900 + i * 120,
        withSpring(1, { damping: 10, stiffness: 180 })
      );
    });

    // Float loop (starts after entrance)
    float.value = withDelay(
      700,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    const timer = setTimeout(() => runOnJS(navigateNext)(), 2800);
    // return

    // Navigate after all entrance animations settle
    () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }, { translateY: float.value }],
    opacity: logoOpacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleO.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: subtitleY.value }],
    opacity: subtitleO.value,
  }));

  const dotStyles = dotScale.map((dot) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ transform: [{ scale: dot.value }] }))
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#020c18", "#061525", "#091e30"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.inner}>
        {/* Radial glow */}
        <View style={styles.glow} />

        {/* Logo */}
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          {/* Outer hex border */}
          <LinearGradient
            colors={[BRAND + "80", BRAND_DEEP + "40", "transparent"]}
            style={styles.logoBorder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.logoInner}>
              <Image
                source={require("../../../assets/newlogo.jpeg")}
                style={styles.image}
              />
              {/* Shimmer sweep */}
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Text block */}
        <View style={styles.textBlock}>
          <Animated.Text style={[styles.title, titleStyle]}>
            LINKS<Text style={styles.titleAccent}>CHAT</Text>
          </Animated.Text>

          <Animated.View style={[styles.dividerRow, subtitleStyle]}>
            <Text style={styles.subtitle}>INSTANT MESSAGING</Text>
          </Animated.View>
        </View>

        {/* Loader dots */}
        <View style={styles.dotsRow}>
          {dotStyles.map((style, i) => (
            <Animated.View key={i} style={[styles.dot, style]} />
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Splashscreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: BRAND_DEEP,
    opacity: 0.07,
  },
  logoWrapper: {
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 36,
    elevation: 20,
    marginBottom: 32,
  },
  logoBorder: {
    width: 156,
    height: 156,
    borderRadius: 40,
    padding: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    width: "100%",
    height: "100%",
    borderRadius: 38,
    overflow: "hidden",
    backgroundColor: "#0a1e30",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 38,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.18)",
    transform: [{ skewX: "-18deg" }],
  },
  textBlock: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 6,
    textAlign: "center",
  },
  titleAccent: {
    color: BRAND,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    width: 32,
    height: 1,
    backgroundColor: BRAND + "50",
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: BRAND,
    letterSpacing: 3,
    textAlign: "center",
  },
  dotsRow: {
    position: "absolute",
    bottom: 52,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BRAND,
    opacity: 0.75,
  },
});
