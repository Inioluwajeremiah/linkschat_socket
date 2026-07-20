import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Colors, Spacing, BorderRadius } from "../constants";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { userApi, chatApi, uploadFileToS3 } from "../services/api";
import { User } from "../types";
import { useAppDispatch } from "../hooks/useRedux";
import { addOrUpdateChat } from "../store/slices/chatSlice";

export default function NewGroupScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<"select" | "name">("select");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setUsers([]);
      return;
    }
    setLoading(true);
    try {
      const res = await userApi.searchUsers(q);
      if (res.success) setUsers(res.data.users);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSelect = (u: User) => {
    setSelected((prev) =>
      prev.find((s) => s._id === u._id)
        ? prev.filter((s) => s._id !== u._id)
        : [...prev, u]
    );
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    setAvatarUri(result.assets[0].uri);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Group name is required");
      return;
    }
    if (selected.length < 1) {
      Alert.alert("Error", "Add at least 2 members");
      return;
    }

    setCreating(true);
    try {
      // Upload the picked avatar to S3 first — the local file URI only
      // resolves on this device, so every group member needs the S3 URL.
      let avatarUrl: string | undefined;
      if (avatarUri) {
        avatarUrl = await uploadFileToS3(
          avatarUri,
          "group-avatar.jpg",
          "image/jpeg",
          "image"
        );
      }

      const res = await chatApi.createGroupChat({
        name: groupName.trim(),
        participantIds: selected.map((u) => u._id),
        avatar: avatarUrl,
      });
      if (res.success) {
        dispatch(addOrUpdateChat(res.data.chat));
        router.replace(`/chat/${res.data.chat._id}`);
      }
    } catch (err) {
      console.log("create group error ===>>> ", err);
      Alert.alert("Error", "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step === "name" ? setStep("select") : router.back())}
          style={[
            styles.backBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {step === "select" ? "Add Members" : "Group Name"}
        </Text>
        {step === "select" && selected.length >= 1 && (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => setStep("name")}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.nextGradient}
            >
              <Ionicons name="arrow-forward" size={20} color={colors.surface} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {step === "select" ? (
        <>
          {/* Selected chips */}
          {selected.length > 0 && (
            <View style={styles.selectedRow}>
              {selected.map((u) => (
                <TouchableOpacity
                  key={u._id}
                  style={[styles.chip, { backgroundColor: colors.tabActive }]}
                  onPress={() => toggleSelect(u)}
                >
                  <Text
                    style={[styles.chipText, { color: colors.textInverse }]}
                  >
                    {u.name.split(" ")[0]}
                  </Text>
                  <Ionicons name="close" size={14} color={colors.surface} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.searchWrap}>
            <View
              style={[
                styles.searchBar,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search people..."
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={search}
                autoFocus
              />
              {loading && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
            </View>
          </View>

          <FlatList
            data={users}
            keyExtractor={(u) => u._id}
            renderItem={({ item }) => {
              const isSelected = selected.some((s) => s._id === item._id);
              const initials = item.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => toggleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarWrap}>
                    {item.avatar ? (
                      <Image
                        source={{ uri: item.avatar }}
                        style={styles.avatar}
                        contentFit="cover"
                      />
                    ) : (
                      <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.avatarFallback}
                      >
                        <Text
                          style={[
                            styles.initials,
                            { color: colors.textInverse },
                          ]}
                        >
                          {initials}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <Text
                      style={[styles.userName, { color: colors.textPrimary }]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.userSub, { color: colors.textSecondary }]}
                    >
                      {item.bio || item.email}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkCircle,
                      { borderColor: colors.border },
                      isSelected && styles.checkCircleActive,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.surface}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.nameStep}>
          <TouchableOpacity
            onPress={pickAvatar}
            activeOpacity={0.8}
            style={styles.groupIconWrap}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.groupIcon}
                contentFit="cover"
              />
            ) : (
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.groupIcon}
              >
                <Ionicons name="people" size={36} color={colors.surface} />
              </LinearGradient>
            )}
            <View
              style={[
                styles.avatarEditBadge,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.background,
                },
              ]}
            >
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
            {selected.length} members selected
          </Text>
          <View
            style={[
              styles.nameInputWrap,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.nameInput, { color: colors.textPrimary }]}
              placeholder="Group name..."
              placeholderTextColor={colors.textMuted}
              value={groupName}
              onChangeText={setGroupName}
              autoFocus
              maxLength={100}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.createBtn,
              (!groupName.trim() || creating) && { opacity: 0.5 },
            ]}
            onPress={handleCreate}
            disabled={!groupName.trim() || creating}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.createGradient}
            >
              {creating ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text
                  style={[styles.createText, { color: colors.textInverse }]}
                >
                  Create Group
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
  title: { flex: 1, fontSize: 20, fontWeight: "700" },
  nextBtn: { borderRadius: 20, overflow: "hidden" },
  nextGradient: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: Spacing.base,
    marginBottom: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  searchWrap: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    gap: 12,
  },
  avatarWrap: {},
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: { fontSize: 17, fontWeight: "700" },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "700" },
  userSub: { fontSize: 13 },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircleActive: { backgroundColor: "#00d4aa", borderColor: "#00d4aa" },
  nameStep: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: Spacing.xl,
    gap: 20,
  },
  groupIconWrap: { marginBottom: 8, position: "relative" },
  groupIcon: {
    width: 90,
    height: 90,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  memberCount: { fontSize: 14 },
  nameInputWrap: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 54,
    justifyContent: "center",
  },
  nameInput: { fontSize: 16 },
  createBtn: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 12,
  },
  createGradient: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  createText: { fontSize: 16, fontWeight: "700" },
});
