import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Spacing, BorderRadius, Colors } from "../../constants";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { authApi } from "../../services/api";
import { useAppDispatch } from "../../hooks/useRedux";
import { setCredentials } from "../../store/slices/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const toast = useToast();
  const { userId, email } = useLocalSearchParams<{
    userId: string;
    email: string;
    phone: string;
  }>();
  const dispatch = useAppDispatch();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];

    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, OTP_LENGTH);
      const chars = pasted.split("");
      chars.forEach((c, i) => {
        if (index + i < OTP_LENGTH) newOtp[index + i] = c;
      });
      setOtp(newOtp);
      const nextIdx = Math.min(index + chars.length, OTP_LENGTH - 1);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (
      newOtp.every((d) => d !== "") &&
      newOtp.join("").length === OTP_LENGTH
    ) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join("");
    if (otpCode.length !== OTP_LENGTH) return;

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp({ userId: userId!, otp: otpCode });
      if (res.success) {
        const { user, accessToken, refreshToken, streamToken } = res.data;

        // Persist tokens
        await AsyncStorage.multiSet([
          ["accessToken", accessToken],
          ["refreshToken", refreshToken],
          ["streamToken", streamToken],
        ]);

        dispatch(
          setCredentials({ user, accessToken, refreshToken, streamToken })
        );
        router.replace("/(tabs)");
      }
    } catch (err: unknown) {
      shake();
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      toast.error(
        "Invalid OTP",
        err instanceof Error ? err.message : "Please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsResending(true);
    const loadId = toast.loading("Resending OTP...");
    try {
      await authApi.resendOtp(userId!);
      setCountdown(60);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      toast.dismiss(loadId);
      toast.success("OTP resent!", "Check your email inbox");
    } catch {
      toast.error("Failed to resend", "Please try again");
    } finally {
      setIsResending(false);
      toast.dismiss(loadId);
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
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View
        style={[
          styles.orb,
          { top: -60, right: -60, backgroundColor: colors.secondary },
        ]}
      />

      <TouchableOpacity
        style={[
          styles.backBtn,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.headerWrap}>
              <View style={styles.logoCircle}>
                <Image
                  style={{ width: 140, height: 140 }}
                  source={require("../../../assets/icons/adaptive-icon.png")}
                />
              </View>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.iconBadge}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={colors.surface}
                />
              </LinearGradient>
            </View>

            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Verify your email
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              We sent a 6-digit code to{"\n"}
              <Text style={[styles.email, { color: colors.primary }]}>
                {email}
              </Text>
            </Text>

            {/* OTP Inputs */}
            <Animated.View
              style={[
                styles.otpRow,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(ref) => {
                    inputRefs.current[idx] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                    digit && {
                      borderColor: colors.primary,
                      backgroundColor: colors.surfaceElevated,
                    },
                  ]}
                  value={digit}
                  onChangeText={(v) => handleOtpChange(v, idx)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, idx)
                  }
                  keyboardType="number-pad"
                  maxLength={6}
                  selectTextOnFocus
                  caretHidden
                />
              ))}
            </Animated.View>

            <TouchableOpacity
              style={[
                styles.verifyBtn,
                otp.join("").length !== OTP_LENGTH && styles.verifyBtnDisabled,
              ]}
              onPress={() => handleVerify()}
              disabled={otp.join("").length !== OTP_LENGTH || isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  otp.join("").length === OTP_LENGTH
                    ? [Colors.primary, Colors.primaryDark]
                    : ["#333", "#333"]
                }
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.verifyText,
                        { color: colors.bubbleOwnText },
                      ]}
                    >
                      Verify & Continue
                    </Text>
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.bubbleOwnText}
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.resendRow}>
              {canResend ? (
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={isResending}
                  style={styles.resendBtn}
                >
                  {isResending ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text
                      style={[styles.resendActive, { color: colors.primary }]}
                    >
                      Resend code
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <Text
                  style={[styles.resendInactive, { color: colors.textMuted }]}
                >
                  Resend in{" "}
                  <Text style={[styles.countdown, { color: colors.primary }]}>
                    {countdown}s
                  </Text>
                </Text>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  orb: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.12,
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerWrap: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
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
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  email: { color: Colors.primary, fontWeight: "600" },
  otpRow: { flexDirection: "row", gap: 10, marginBottom: 36 },
  otpInput: {
    width: 48,
    height: 60,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
  },
  verifyBtn: {
    width: "100%",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  verifyBtnDisabled: { opacity: 0.5 },
  btnGradient: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  verifyText: { fontSize: 16, fontWeight: "700" },
  resendRow: { marginTop: 24 },
  resendBtn: {
    minHeight: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  resendActive: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  resendInactive: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
  },
  countdown: { color: Colors.primary, fontWeight: "700" },
});
