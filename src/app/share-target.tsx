import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useIncomingShare } from "expo-sharing";
import type { ResolvedSharePayload } from "expo-sharing";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { useAppSelector } from "../hooks/useRedux";
import { useContactNameResolver } from "@/hooks/useContactName";
import { enqueueMessage, makeDurableCopy } from "../services/outbox";
import { Chat, User } from "../types";

const isTextLike = (p: ResolvedSharePayload) =>
  p.contentType === "text" || p.contentType === "website" || !p.contentUri;

const messageTypeFor = (p: ResolvedSharePayload) => {
  switch (p.contentType) {
    case "image":
    case "video":
    case "audio":
      return p.contentType;
    default:
      return "document";
  }
};

// Receives content shared from other apps (Android share sheet / iOS share
// extension), WhatsApp-style: pick one or more chats, then send.
export default function ShareTargetScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const resolveContact = useContactNameResolver();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const { user: me } = useAppSelector((s) => s.auth);
  const { chats } = useAppSelector((s) => s.chat);
  const {
    sharedPayloads,
    resolvedSharedPayloads,
    clearSharedPayloads,
    isResolving,
    error,
  } = useIncomingShare();

  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) clearSharedPayloads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const chatName = (c: Chat) => {
    if (c.type === "group") return c.name;
    const other = c.participants.find((p) => p.user._id !== me?._id)?.user as
      | User
      | undefined;
    return resolveContact(other?.phone, other?.name).displayName;
  };

  const filtered = useMemo(() => {
    if (!search) return chats;
    const q = search.toLowerCase();
    return chats.filter((c) => chatName(c)?.toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, search]);

  const close = () => {
    clearSharedPayloads();
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSend = async () => {
    if (!selected.length || !resolvedSharedPayloads.length || sending) return;
    setSending(true);
    try {
      // Everything goes through the offline outbox, so sharing works with no
      // connection too: it's queued and delivered when the network is back.
      for (const payload of resolvedSharedPayloads) {
        if (isTextLike(payload)) {
          const content = payload.value || payload.contentUri || "";
          if (!content) continue;
          for (const chatId of selected) {
            await enqueueMessage({ chatId, type: "text", content });
          }
          continue;
        }

        const type = messageTypeFor(payload);
        const name = payload.originalName || `file-${Date.now()}`;
        // One durable copy shared by every destination chat (and uploaded
        // once), instead of one per chat.
        const uri = await makeDurableCopy(payload.contentUri!, name);
        for (const chatId of selected) {
          await enqueueMessage({
            chatId,
            type,
            media: {
              uri,
              mimeType: payload.contentMimeType || undefined,
              name,
              size: payload.contentSize ?? 0,
            },
            copyMedia: false,
          });
        }
      }

      clearSharedPayloads();
      if (selected.length === 1) router.replace(`/chat/${selected[0]}`);
      else {
        toast.success(`Sending to ${selected.length} chats`);
        router.replace("/(tabs)");
      }
    } catch {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  // Not signed in: drop the share and let the normal entry flow run.
  if (!isAuthenticated) return <Redirect href="/" />;
  // Opened with nothing shared (stale link / already handled).
  if (sharedPayloads.length === 0 && !sending) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={close} hitSlop={12} disabled={sending}>
          <Ionicons name="close" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Send to
        </Text>
      </View>

      <PreviewStrip
        payloads={resolvedSharedPayloads}
        loading={isResolving}
        failed={!!error}
        colors={colors}
      />

      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
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
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item: chat }) => {
          const other =
            chat.type === "private"
              ? (chat.participants.find((p) => p.user._id !== me?._id)
                  ?.user as User)
              : null;
          const name = chatName(chat);
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
              style={[styles.row, { borderBottomColor: colors.divider }]}
              onPress={() => toggle(chat._id)}
              activeOpacity={0.7}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View
                  style={[styles.avatar, styles.avatarFallback]}
                  accessibilityElementsHidden
                >
                  <Text style={styles.initials}>{initials}</Text>
                </View>
              )}
              <Text
                style={[styles.name, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {name}
              </Text>
              <Ionicons
                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={isSelected ? "#00b090" : colors.textMuted}
              />
            </TouchableOpacity>
          );
        }}
      />

      {selected.length > 0 && (
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (sending || isResolving || !resolvedSharedPayloads.length) &&
              styles.sendBtnDisabled,
          ]}
          onPress={handleSend}
          disabled={sending || isResolving || !resolvedSharedPayloads.length}
          activeOpacity={0.85}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.sendText}>Send ({selected.length})</Text>
              <Ionicons name="send" size={16} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function PreviewStrip({
  payloads,
  loading,
  failed,
  colors,
}: {
  payloads: ResolvedSharePayload[];
  loading: boolean;
  failed: boolean;
  colors: any;
}) {
  if (loading) {
    return (
      <View style={styles.previewWrap}>
        <ActivityIndicator size="small" color={colors.textMuted} />
        <Text style={[styles.previewText, { color: colors.textMuted }]}>
          Preparing…
        </Text>
      </View>
    );
  }
  if (failed || payloads.length === 0) {
    return (
      <View style={styles.previewWrap}>
        <Text style={[styles.previewText, { color: colors.textMuted }]}>
          Couldn't read the shared content
        </Text>
      </View>
    );
  }
  return (
    <FlatList
      horizontal
      data={payloads}
      keyExtractor={(_, i) => String(i)}
      style={styles.previewList}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) =>
        item.contentType === "image" && item.contentUri ? (
          <Image source={{ uri: item.contentUri }} style={styles.thumb} />
        ) : (
          <View
            style={[
              styles.thumb,
              styles.thumbIcon,
              { backgroundColor: colors.surfaceElevated },
            ]}
          >
            <Ionicons
              name={
                item.contentType === "video"
                  ? "videocam"
                  : item.contentType === "audio"
                    ? "musical-notes"
                    : isTextLike(item)
                      ? "chatbubble-ellipses"
                      : "document-text"
              }
              size={26}
              color={colors.textMuted}
            />
            <Text
              style={[styles.thumbLabel, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {isTextLike(item) ? item.value : item.originalName}
            </Text>
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 20, fontWeight: "600" },
  previewList: { flexGrow: 0, marginBottom: 12 },
  previewWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    height: 76,
  },
  previewText: { fontSize: 14 },
  thumb: { width: 76, height: 76, borderRadius: 10 },
  thumbIcon: { alignItems: "center", justifyContent: "center", padding: 6 },
  thumbLabel: { fontSize: 10, marginTop: 4, maxWidth: 68 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: {
    backgroundColor: "#00b090",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { color: "#fff", fontWeight: "600" },
  name: { flex: 1, fontSize: 16 },
  sendBtn: {
    position: "absolute",
    right: 16,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00b090",
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
