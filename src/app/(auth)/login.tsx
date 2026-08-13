import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StyleSheet,
} from "react-native";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Spacing, BorderRadius, Colors } from "../../constants";
import { authApi } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { Dimensions } from "react-native";
import { Image } from "react-native";
import CountryPickerSheet from "@/components/CountryPickerSheet";

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [focused, setFocused] = useState(false);
  const [phone, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("+1");
  const [showPicker, setShowPicker] = useState(false);
  const [focusedInput, setFocusedInput] = useState<"email" | "phone" | null>(
    null
  );

  // Animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Email required", "Please enter your email");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      toast.error("Invalid email", "Enter a valid email address");
      return;
    }
    if (!phone) {
      toast.error("Phone required", "Please enter your phone number");
      return;
    }
    setIsLoading(true);
    const loadId = toast.loading("Sending OTP...");
    try {
      const res = await authApi.login({
        email: trimmed,
        phone: `${dialCode}${phone.trim()}`,
      });
      toast.dismiss(loadId!);

      if (res.success) {
        await AsyncStorage.setItem("pendingUserId", res.data.userId);
        toast.success("OTP sent!", "Check your email inbox");
        setTimeout(
          () =>
            router.push({
              pathname: "/(auth)/otp",
              params: { userId: res.data.userId, email: res.data.email },
            }),
          700
        );
      }
    } catch (err: unknown) {
      toast.dismiss(loadId!);

      toast.error(
        "Login failed",
        err instanceof Error ? err.message : "Please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    keyboardView: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.xl,
    },
    orb: {
      position: "absolute",
      width: 300,
      height: 300,
      borderRadius: 150,
      opacity: 0.15,
    },
    orbTop: {
      top: -80,
      right: -80,
      backgroundColor: colors.primary,
    },
    orbBottom: {
      bottom: -100,
      left: -80,
      backgroundColor: colors.secondary,
      opacity: 0.1,
    },
    logoSection: { alignItems: "center", marginBottom: 50 },
    logoCircle: {
      width: 140,
      height: 140,
      borderRadius: 28,
      overflow: "hidden",
      // marginBottom: 16,
      // shadowColor: colors.primary,
      // shadowOffset: { width: 0, height: 8 },
      // shadowOpacity: 0.5,
      // shadowRadius: 20,
      // elevation: 15,
    },
    logoGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
    appName: {
      fontSize: 36,
      fontWeight: "800",
      color: colors.textPrimary,
      letterSpacing: -1,
    },
    tagline: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 6,
      letterSpacing: 2,
    },
    form: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    formTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 6,
    },
    formSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 28,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: Spacing.md,
      height: 54,
    },
    inputIcon: { marginRight: 10 },
    input: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 15,
      height: "100%",
    },
    label: {
      color: Colors.textSecondary,
      fontSize: 13,
      marginBottom: 8,
      marginTop: 12,
      fontWeight: "500",
    },
    button: { borderRadius: BorderRadius.md, overflow: "hidden", marginTop: 8 },
    buttonDisabled: { opacity: 0.6 },
    buttonGradient: {
      height: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    registerRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
    },
    registerLabel: { color: colors.textMuted, fontSize: 14 },
    registerLink: { color: colors.primary, fontSize: 14, fontWeight: "600" },
    phoneRow: {
      marginBottom: 16,

      flexDirection: "row",
      gap: 10,
      alignItems: "center",
    },
    dialBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      height: 52,
      paddingHorizontal: 12,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      minWidth: 80,
      justifyContent: "center",
    },
    dialBtnText: {
      fontSize: 14,
      fontWeight: "600",
    },
    phoneInput: {
      flex: 1,
    },
  });
  const isFormValid = email?.trim() && phone?.trim();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={
          isDark
            ? ["#0a0a14", "#0f0f22", "#0a0a14"]
            : ["#f5f7fa", "#eef2ff", "#f5f7fa"]
        }
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      {/* Decorative orbs */}
      <Animated.View
        style={[
          styles.orb,
          styles.orbTop,
          { transform: [{ scale: pulseAnim }] },
        ]}
      />
      <Animated.View style={[styles.orb, styles.orbBottom]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Logo section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: logoAnim,
              transform: [
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Image
              style={{ width: 140, height: 140 }}
              source={require("../../../assets/icons/adaptive-icon.png")}
            />
          </View>
          <Text style={styles.appName}>LinksChat</Text>
          <Text style={styles.tagline}>Private. Fast. Secure.</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View
          style={[
            styles.form,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: formAnim,
              transform: [
                {
                  translateY: formAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
            Welcome back
          </Text>
          <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
            Sign in to continue chatting
          </Text>

          {/* Email */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Email Address *
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.inputBg,
                borderColor:
                  focusedInput === "email" ? "#5bbbdf" : colors.border,
              },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={focusedInput === "email" ? "#5bbbdf" : colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Enter your email"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              onSubmitEditing={handleLogin}
            />
          </View>

          {/* Phone — split dial code + number */}
          <Text
            style={[
              styles.label,
              { color: colors.textSecondary, marginTop: 16 },
            ]}
          >
            Phone Number *
          </Text>
          <View style={styles.phoneRow}>
            {/* Dial code trigger */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setShowPicker(true)}
              style={[
                styles.dialBtn,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="call-outline"
                size={15}
                color={focusedInput === "phone" ? "#5bbbdf" : colors.textMuted}
              />
              <Text style={[styles.dialBtnText, { color: colors.textPrimary }]}>
                {dialCode}
              </Text>
              <Ionicons
                name="chevron-down"
                size={13}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {/* Number input */}
            <View
              style={[
                styles.inputWrapper,
                styles.phoneInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor:
                    focusedInput === "phone" ? "#5bbbdf" : colors.border,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="234 567 8900"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocusedInput("phone")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, !email.trim() && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!email.trim() || !phone.trim() || isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isFormValid
                  ? [colors.primary, colors.primaryDark]
                  : ["#333", "#333"]
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Get OTP</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerLabel}>New to LinksChat? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.registerLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Country picker bottom sheet */}
        <CountryPickerSheet
          visible={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={setDialCode}
          selected={dialCode}
          colors={colors}
          isDark={isDark}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
