import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Keyboard,
} from "react-native";
import { useRef, useState, useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Spacing, BorderRadius, Colors } from "../../constants";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { authApi } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import CountryPickerSheet from "@/components/CountryPickerSheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
// ─── Register Screen ───────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const toast = useToast();
  const instets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("+1");
  const [showPicker, setShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<
    "name" | "email" | "phone" | null
  >(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Required fields", "Name and email are required");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error("Invalid email", "Enter a valid email address");
      return;
    }
    setIsLoading(true);
    const loadId = toast.loading("Creating account...");
    try {
      const fullPhone = phone.trim() ? `${dialCode}${phone.trim()}` : undefined;
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        phone: fullPhone,
      });
      toast.dismiss(loadId!);
      if (res.success) {
        await AsyncStorage.setItem("pendingUserId", res.data.userId);
        toast.success("Account created!", "Check your email for OTP");
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
        "Registration failed",
        err instanceof Error ? err.message : "Please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={
          isDark
            ? ["#0a0a14", "#0f0f22", "#0a0a14"]
            : ["#f5f7fa", "#eef2ff", "#f5f7fa"]
        }
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.orb, styles.orbLeft]} />

      {/* <KeyboardAvoidingView
        // behavior={Platform.OS === "android" ? "height" : undefined}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={{ flex: 1 }}

        // behavior={Platform.OS === "ios" ? "padding" : undefined} // let Android's native resize handle it
        // style={[styles.scroll, { flex: 1 }]}
        // style={{
        //   flex: 1,
        //   justifyContent: "center",
        //   paddingHorizontal: Spacing.xl,
        // }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          showsVerticalScrollIndicator={false}
        > */}
      <KeyboardAwareScrollView>
        <TouchableOpacity
          style={[
            styles.backBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Logo */}
          <View style={styles.headerWrap}>
            <View style={styles.logoCircle}>
              <Image
                style={{ width: 140, height: 140 }}
                source={require("../../../assets/icons/adaptive-icon.png")}
              />
            </View>
            <LinearGradient
              colors={[Colors.accent, Colors.secondary]}
              style={styles.iconBadge}
            >
              <Ionicons name="person-add" size={20} color={colors.surface} />
            </LinearGradient>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join millions of users on LinksChat
          </Text>

          <View
            style={[
              styles.form,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Name */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Name *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBg,
                  borderColor:
                    focusedInput === "name" ? "#5bbbdf" : colors.border,
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={focusedInput === "name" ? "#5bbbdf" : colors.textMuted}
                style={styles.icon}
              />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Your full name"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                onFocus={() => setFocusedInput("name")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

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
                size={18}
                color={focusedInput === "email" ? "#5bbbdf" : colors.textMuted}
                style={styles.icon}
              />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="your@email.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Phone — split dial code + number */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Phone Number
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
                    borderColor:
                      focusedInput === "phone" ? "#5bbbdf" : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={15}
                  color={
                    focusedInput === "phone" ? "#5bbbdf" : colors.textMuted
                  }
                />
                <Text
                  style={[styles.dialBtnText, { color: colors.textPrimary }]}
                >
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

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.button,
                (!name.trim() || !email.trim()) && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={!name.trim() || !email.trim() || isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  name && email
                    ? [colors.accent, colors.secondary]
                    : ["#333", "#333"]
                }
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.buttonText,
                        { color: colors.bubbleOwnText },
                      ]}
                    >
                      Create Account
                    </Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.bubbleOwnText}
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={[styles.loginLabel, { color: colors.textMuted }]}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
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
      </KeyboardAwareScrollView>
      {/* </ScrollView>
      </KeyboardAvoidingView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 40,
  },
  orb: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.12,
  },
  orbLeft: { bottom: 0, left: -60, backgroundColor: Colors.accent },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  headerWrap: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
    marginTop: 12,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 15 },

  // Phone row
  phoneRow: {
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

  button: { borderRadius: BorderRadius.md, overflow: "hidden", marginTop: 28 },
  buttonDisabled: { opacity: 0.5 },
  buttonGradient: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  loginLabel: { color: Colors.textMuted, fontSize: 14 },
  loginLink: { color: Colors.primary, fontSize: 14, fontWeight: "600" },
});
