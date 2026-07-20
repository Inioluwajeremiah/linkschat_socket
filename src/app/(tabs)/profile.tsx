import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useTheme } from "../../context/ThemeContext";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { authApi } from "@/services/api";
import { socketService } from "@/services/socket";
import { logout } from "@/store/slices/authSlice";

function MenuItem({
  icon,
  label,
  value,
  onPress,
  danger,
  toggle,
  toggled,
  onToggle,
  colors,
  isDark,
}: any) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={toggle ? 1 : 0.7}
    >
      <View
        style={[
          styles.menuIconWrap,
          {
            backgroundColor: colors.surfaceElevated,
          },
          danger && { backgroundColor: colors.error + "20" },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={danger ? colors.error : colors.primary}
        />
      </View>

      <Text
        style={[
          styles.menuLabel,
          { color: colors.textPrimary },
          danger && { color: colors.error },
        ]}
      >
        {label}
      </Text>

      {value && (
        <Text style={[styles.menuValue, { color: colors.textMuted }]}>
          {value}
        </Text>
      )}

      {toggle && (
        <Switch
          value={toggled}
          onValueChange={onToggle}
          trackColor={{
            false: colors.border,
            true: colors.primary,
          }}
          thumbColor={isDark ? "#fff" : colors.surface}
        />
      )}

      {!toggle && !value && (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  console.log("user from useappselector ==>>> ", user);

  const [notifications, setNotifications] = useState(true);

  const initials =
    user?.name
      ?.split(" ")
      .map((w: any) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await authApi.logout();
          } catch {}
          socketService.disconnect();
          await AsyncStorage.multiRemove([
            "accessToken",
            "refreshToken",
            "streamToken",
          ]);
          dispatch(logout());
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      // edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Profile
          </Text>

          <TouchableOpacity
            style={[
              styles.editBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push("/profile/edit")}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* PROFILE CARD */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <LinearGradient
            colors={colors.gradientDark}
            style={styles.profileBg}
          />

          <View style={styles.avatarWrap}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.avatarFallback}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}

            <TouchableOpacity
              style={[
                styles.cameraOverlay,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {user?.name}
          </Text>

          <Text style={[styles.userBio, { color: colors.textSecondary }]}>
            {user?.bio || "Hey there! I am using LinksChat."}
          </Text>

          <View style={styles.onlineIndicator}>
            <View
              style={[styles.onlineDot, { backgroundColor: colors.online }]}
            />
            <Text style={[styles.onlineText, { color: colors.online }]}>
              Online
            </Text>
          </View>
        </View>

        {/* ACCOUNT */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            Account
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <MenuItem
              icon="mail-outline"
              label="Email"
              value={user?.email}
              colors={colors}
              isDark={isDark}
            />

            <View
              style={[styles.divider, { backgroundColor: colors.divider }]}
            />

            <MenuItem
              icon="call-outline"
              label="Phone"
              value={user?.phone || "Not set"}
              onPress={() => router.push("/profile/edit")}
              colors={colors}
              isDark={isDark}
            />
          </View>
        </View>

        {/* SETTINGS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            Settings
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              toggle
              toggled={notifications}
              onToggle={setNotifications}
              colors={colors}
              isDark={isDark}
            />

            <View
              style={[styles.divider, { backgroundColor: colors.divider }]}
            />

            <MenuItem
              icon="lock-closed-outline"
              label="Privacy"
              onPress={() => router.push("/privacy")}
              colors={colors}
              isDark={isDark}
            />

            <View
              style={[styles.divider, { backgroundColor: colors.divider }]}
            />

            <MenuItem
              icon="color-palette-outline"
              label="Theme"
              value={isDark ? "Dark" : "Light"}
              onPress={() => {}}
              colors={colors}
              isDark={isDark}
            />

            <View
              style={[styles.divider, { backgroundColor: colors.divider }]}
            />

            <MenuItem
              icon="people-outline"
              label="Contacts"
              onPress={() => router.push("/contacts")}
              colors={colors}
              isDark={isDark}
            />

            <View
              style={[styles.divider, { backgroundColor: colors.divider }]}
            />

            <MenuItem
              icon="phone-portrait-outline"
              label="Friends on LinksChat"
              onPress={() => router.push("/phone-contacts")}
              colors={colors}
              isDark={isDark}
            />
            <View
              style={[styles.divider, { backgroundColor: colors.divider }]}
            />
            <MenuItem
              icon="star-outline"
              label="Starred Messages"
              onPress={() => router.push("/starred-messages")}
              colors={colors}
              isDark={isDark}
            />
            {/* <View
              style={[styles.divider, { backgroundColor: colors.divider }]}
            />
            <MenuItem
              icon="star-outline"
              label="Blocked Users"
              onPress={() => router.push("/blocked-users")}
              colors={colors}
              isDark={isDark}
            /> */}
          </View>
        </View>

        {/* ABOUT */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            About
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <MenuItem
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => {}}
              colors={colors}
              isDark={isDark}
            />

            <View
              style={[styles.divider, { backgroundColor: colors.divider }]}
            />

            <MenuItem
              icon="information-circle-outline"
              label="Version"
              value="1.0.0"
              colors={colors}
              isDark={isDark}
            />
          </View>
        </View>

        {/* LOGOUT */}
        <View style={styles.section}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <MenuItem
              icon="log-out-outline"
              label="Sign Out"
              danger
              onPress={handleLogout}
              colors={colors}
              isDark={isDark}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  title: { fontSize: 28, fontWeight: "800" },

  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  profileCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
  },

  profileBg: {
    ...StyleSheet.absoluteFillObject,
  },

  avatarWrap: {
    position: "relative",
    marginBottom: 16,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
  },

  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarInitials: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },

  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0a0a14",
  },

  userName: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },

  userBio: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },

  onlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  onlineText: {
    fontSize: 12,
    fontWeight: "600",
  },

  section: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },

  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },

  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },

  menuValue: {
    fontSize: 13,
  },

  divider: {
    height: 1,
    marginLeft: 62,
  },
});
