import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Spacing, BorderRadius } from "../../constants";
import { useTheme } from "../../context/ThemeContext";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { updateUser } from "@/store/slices/authSlice";
import { userApi } from "@/services/api";

export default function ProfileEditScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickAvatar = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!granted) {
      Alert.alert("Permission required", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled) return;

    const localUri = result.assets[0].uri;
    setAvatar(localUri);
    setAvatarUri(localUri);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("bio", bio.trim());
      formData.append("phone", phone.trim());

      if (avatarUri) {
        const filename = avatarUri.split("/").pop() || "avatar.jpg";

        formData.append("avatar", {
          uri: avatarUri,
          name: filename,
          type: "image/jpeg",
        } as any);
      }

      const res = await userApi.updateProfile(formData);

      console.log("update user res ===>>> ", res);

      if (res.success) {
        dispatch(updateUser(res.data.user));
        router.back();
      }
    } catch (err) {
      console.log("update user err ===>>> ", err);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const initials =
    name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backBtn,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Edit Profile
        </Text>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: colors.primary },
            saving && { opacity: 0.6 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8}>
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={[styles.avatar, { borderColor: colors.primary }]}
              />
            ) : (
              <LinearGradient
                colors={colors.gradientPrimary}
                style={styles.avatarFallback}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}

            <View
              style={[
                styles.cameraOverlay,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.background,
                },
              ]}
            >
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Name</Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>Bio</Text>
          <View
            style={[
              styles.inputWrap,
              {
                height: 90,
                alignItems: "flex-start",
                paddingTop: 12,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                { textAlignVertical: "top", color: colors.textPrimary },
              ]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell something about yourself..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={150}
            />
          </View>

          <Text style={[styles.charCount, { color: colors.textMuted }]}>
            {bio.length}/150
          </Text>

          <Text style={[styles.label, { color: colors.textMuted }]}>
            Phone Number
          </Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 234 567 8900"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                opacity: 0.7,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.textMuted }]}
              value={user?.email}
              editable={false}
            />
            <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
          </View>

          <Text style={[styles.helperText, { color: colors.textMuted }]}>
            Email cannot be changed
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 28,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
  form: {
    paddingHorizontal: Spacing.base,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  charCount: {
    fontSize: 11,
    textAlign: "right",
  },
  helperText: {
    fontSize: 11,
  },
});
