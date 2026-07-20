import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { privacyApi } from "../services/api";
import { PrivacySettings } from "../types";

function SettingRow({
  icon,
  label,
  sub,
  value,
  onToggle,
  colors,
  danger,
}: {
  icon: string;
  label: string;
  sub?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  colors: any;
  danger?: boolean;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.divider }]}>
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: danger
              ? "rgba(255,71,87,0.1)"
              : colors.surfaceElevated,
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={danger ? "#ff4757" : "#00d4aa"}
        />
      </View>
      <View style={styles.rowText}>
        <Text
          style={[
            styles.rowLabel,
            { color: danger ? "#ff4757" : colors.textPrimary },
          ]}
        >
          {label}
        </Text>
        {sub && (
          <Text style={[styles.rowSub, { color: colors.textMuted }]}>
            {sub}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ true: "#00d4aa" }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PrivacySettings>({
    hideOnlineStatus: false,
    hideLastSeen: false,
    disableReadReceipts: false,
    onlyContactsCanMessage: false,
  });
  const [appLock, setAppLock] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [res, bio] = await Promise.all([
          privacyApi.getSettings(),
          LocalAuthentication.hasHardwareAsync(),
        ]);
        if (res.success) {
          const s = (res.data.settings as any)?.privacySettings || {};
          setSettings({
            hideOnlineStatus: s.hideOnlineStatus ?? false,
            hideLastSeen: s.hideLastSeen ?? false,
            disableReadReceipts: s.disableReadReceipts ?? false,
            onlyContactsCanMessage: s.onlyContactsCanMessage ?? false,
          });
          setAppLock((res.data.settings as any)?.appLockEnabled ?? false);
        }
        setBiometricAvailable(bio);
      } catch (err) {
        console.log("privacy error ==>>> ", err);

        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateSetting = async (key: keyof PrivacySettings, value: boolean) => {
    const prev = { ...settings };
    setSettings((s) => ({ ...s, [key]: value }));
    try {
      await privacyApi.updatePrivacy({ [key]: value });
      toast.success("Saved");
    } catch {
      setSettings(prev);
      toast.error("Failed to save");
    }
  };

  const handleAppLock = async (value: boolean) => {
    if (value && biometricAvailable) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable app lock",
      });
      if (!result.success) {
        toast.error("Authentication failed");
        return;
      }
    }
    setAppLock(value);
    try {
      await privacyApi.updateAppLock(value);
      toast.success(value ? "App lock enabled" : "Disabled");
    } catch {
      setAppLock(!value);
      toast.error("Failed");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.backBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Privacy & Security
          </Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color="#00d4aa" />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Privacy & Security
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          ONLINE PRESENCE
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="eye-off-outline"
            label="Hide Online Status"
            sub="Others won't see when you're active"
            value={settings.hideOnlineStatus}
            onToggle={(v) => updateSetting("hideOnlineStatus", v)}
            colors={colors}
          />
          <SettingRow
            icon="time-outline"
            label="Hide Last Seen"
            sub="Others won't see your last active time"
            value={settings.hideLastSeen}
            onToggle={(v) => updateSetting("hideLastSeen", v)}
            colors={colors}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          MESSAGING
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="checkmark-done-outline"
            label="Disable Read Receipts"
            sub="Blue ticks won't show when you read"
            value={settings.disableReadReceipts}
            onToggle={(v) => updateSetting("disableReadReceipts", v)}
            colors={colors}
          />
          <SettingRow
            icon="people-outline"
            label="Only Contacts Can Message"
            sub="Strangers can't start a chat with you"
            value={settings.onlyContactsCanMessage}
            onToggle={(v) => updateSetting("onlyContactsCanMessage", v)}
            colors={colors}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          APP SECURITY
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="finger-print-outline"
            label={
              biometricAvailable
                ? "App Lock (Biometric/Face ID)"
                : "App Lock (unavailable)"
            }
            sub={
              biometricAvailable
                ? "Require biometric to open app"
                : "No biometric hardware found"
            }
            value={appLock}
            onToggle={handleAppLock}
            colors={colors}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          BLOCKED USERS
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.navRow}
            onPress={() => router.push("/blocked-users")}
          >
            <View
              style={[
                styles.rowIcon,
                { backgroundColor: "rgba(255,71,87,0.1)" },
              ]}
            >
              <Ionicons name="ban-outline" size={18} color="#ff4757" />
            </View>
            <Text style={[styles.rowLabel, { color: "#ff4757", flex: 1 }]}>
              Blocked Users
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#ff4757" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "800", flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 100 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: "600" },
  rowSub: { fontSize: 11, marginTop: 2 },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
});
