import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { reelApi } from "@/services/api";
import { Reel } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Modal, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommentsModal({
  reel,
  visible,
  onClose,
  myId,
}: {
  reel: Reel | null;
  visible: boolean;
  onClose: () => void;
  myId: string;
}) {
  const { colors } = useTheme();
  const toast = useToast();
  const [text, setText] = useState("");
  const [comments, setComments] = useState<Reel["comments"]>([]);

  useEffect(() => {
    setComments(reel?.comments ?? []);
  }, [reel]);

  const submit = async () => {
    if (!text.trim() || !reel) return;
    try {
      await reelApi.addComment(reel._id, text.trim());
      setComments((c) => [
        ...c,
        {
          _id: String(Date.now()),
          user: {
            _id: myId,
            name: "You",
            isOnline: true,
            email: "",
            lastSeen: "",
          } as any,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        },
      ]);
      setText("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to comment");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBg} onPress={onClose} />
      <SafeAreaView style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View
          style={[styles.sheetHandle, { backgroundColor: colors.border }]}
        />
        <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
          Comments ({comments.length})
        </Text>
        <FlatList
          data={comments}
          keyExtractor={(c) => c._id}
          style={{ maxHeight: 300 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.noComments, { color: colors.textMuted }]}>
              No comments yet. Be first!
            </Text>
          }
          renderItem={({ item }) => {
            const u = item.user as any;
            return (
              <View style={styles.commentRow}>
                <View
                  style={[styles.commentAvatar, { backgroundColor: "#00d4aa" }]}
                >
                  <Text style={styles.commentAvatarText}>
                    {u.name?.[0]?.toUpperCase() || "?"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.commentUser, { color: colors.textPrimary }]}
                  >
                    {u.name}
                  </Text>
                  <Text
                    style={[
                      styles.commentText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
              </View>
            );
          }}
        />
        <View
          style={[styles.commentInputRow, { borderTopColor: colors.border }]}
        >
          <TextInput
            style={[
              styles.commentInput,
              { color: colors.textPrimary, backgroundColor: colors.inputBg },
            ]}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
          />

          <TouchableOpacity onPress={submit} disabled={!text.trim()}>
            <LinearGradient
              colors={["#00d4aa", "#00b090"]}
              style={styles.commentSend}
            >
              <Ionicons name="send" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBg: { flex: 1 },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "60%",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 17, fontWeight: "800", marginBottom: 14 },
  commentRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  commentAvatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  commentUser: { fontSize: 13, fontWeight: "700" },
  commentText: { fontSize: 13, marginTop: 2 },
  noComments: { textAlign: "center", marginTop: 20, fontSize: 14 },
  commentInputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  commentSend: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  menuBtn: {
    position: "absolute",
    top: 60,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 10,
  },
});
