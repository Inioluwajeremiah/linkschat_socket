import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useAppSelector } from "../../../hooks/useRedux";
import { chatApi, messageActionsApi } from "../../../services/api";
import { Chat, User } from "../../../types";
import { useToast } from "../../../context/ToastContext";

interface Props {
  visible: boolean;
  messageId: string | null;
  onClose: () => void;
  colors: any;
}

export default function ForwardSheet({
  visible,
  messageId,
  onClose,
  colors,
}: Props) {
  const { chats } = useAppSelector((s) => s.chat);
  const { user: me } = useAppSelector((s) => s.auth);
  const toast = useToast();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 200,
        friction: 22,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 220,
        useNativeDriver: true,
      }).start();
      setSelected([]);
      setSearch("");
    }
  }, [visible]);

  const toggle = (chatId: string) => {
    setSelected((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleForward = async () => {
    if (!messageId || selected.length === 0) return;
    setSending(true);
    try {
      await messageActionsApi.forwardMessage(messageId, selected);
      toast.success(
        `Forwarded to ${selected.length} chat${selected.length > 1 ? "s" : ""}`
      );
      onClose();
    } catch {
      toast.error("Failed to forward");
    } finally {
      setSending(false);
    }
  };

  const filtered = chats.filter((c) => {
    if (!search) return true;
    const name =
      c.type === "group"
        ? c.name
        : c.participants.find((p) => p.user._id !== me?._id)?.user?.name;
    return name?.toLowerCase().includes(search.toLowerCase());
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Forward to
          </Text>
          {selected.length > 0 && (
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleForward}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <LinearGradient
                  colors={["#00d4aa", "#00b090"]}
                  style={styles.sendGradient}
                >
                  <Text style={styles.sendText}>Send ({selected.length})</Text>
                  <Ionicons name="send" size={14} color="#fff" />
                </LinearGradient>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface2, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search chats..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(c) => c._id}
          style={{ maxHeight: 380 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: chat }) => {
            const other =
              chat.type === "private"
                ? (chat.participants.find((p) => p.user._id !== me?._id)
                    ?.user as User)
                : null;
            const name = chat.type === "group" ? chat.name : other?.name;
            const avatar = chat.type === "group" ? chat.avatar : other?.avatar;
            const initials = (name || "?")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const isSelected = selected.includes(chat._id);

            return (
              <TouchableOpacity
                style={[styles.chatRow, { borderBottomColor: colors.divider }]}
                onPress={() => toggle(chat._id)}
                activeOpacity={0.7}
              >
                <View style={styles.chatAvatarWrap}>
                  {avatar ? (
                    <Image
                      source={{ uri: avatar }}
                      style={styles.chatAvatar}
                      contentFit="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={["#00d4aa", "#5b8dee"]}
                      style={styles.chatAvatarFb}
                    >
                      <Text style={styles.chatInitials}>{initials}</Text>
                    </LinearGradient>
                  )}
                </View>
                <Text
                  style={[styles.chatName, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {name || "Unknown"}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: isSelected ? "#00d4aa" : colors.border },
                    isSelected && { backgroundColor: "#00d4aa" },
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={13} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.textMuted }]}>
              No chats found
            </Text>
          }
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: "800" },
  sendBtn: { borderRadius: 99, overflow: "hidden" },
  sendGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14 },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chatAvatarWrap: {},
  chatAvatar: { width: 44, height: 44, borderRadius: 22 },
  chatAvatarFb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  chatInitials: { color: "#fff", fontWeight: "700", fontSize: 15 },
  chatName: { flex: 1, fontSize: 15, fontWeight: "600" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: { textAlign: "center", paddingVertical: 30, fontSize: 14 },
});
