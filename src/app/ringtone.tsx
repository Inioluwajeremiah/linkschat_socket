import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { createAudioPlayer, AudioPlayer } from "expo-audio";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import {
  BUNDLED_RINGTONES,
  getStoredRingtoneSelection,
  setStoredRingtoneSelection,
  StoredRingtoneSelection,
} from "@/services/ringtoneStorage";

const RINGTONE_DIR = `${FileSystem.documentDirectory}ringtones/`;

export default function RingtoneScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();

  const [selection, setSelection] = useState<StoredRingtoneSelection | null>(
    null
  );
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const previewPlayerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    getStoredRingtoneSelection().then(setSelection);
  }, []);

  const stopPreview = useCallback(() => {
    setPreviewingId(null);
    const player = previewPlayerRef.current;
    previewPlayerRef.current = null;
    if (player) {
      try {
        player.pause();
        player.remove();
      } catch {
        // no-op — see the same note in useRingtone.ts about .remove()
      }
    }
  }, []);

  useEffect(() => stopPreview, [stopPreview]); // stop on unmount

  const previewSource = (id: string, source: number | { uri: string }) => {
    stopPreview();
    try {
      const player = createAudioPlayer(source);
      player.loop = false;
      player.play();
      previewPlayerRef.current = player;
      setPreviewingId(id);
    } catch {
      showError("Couldn't play preview", "Try a different ringtone.");
    }
  };

  const selectBundled = async (
    id: string,
    source: number | { uri: string }
  ) => {
    const next: StoredRingtoneSelection = { kind: "bundled", id };
    setSelection(next);
    await setStoredRingtoneSelection(next);
    previewSource(id, source);
  };

  const pickCustomFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      // Guard against a missing/empty assets array — older
      // expo-document-picker versions return a flat
      // { type: "success" | "cancel", uri, name } shape with no `.assets`
      // at all, which would otherwise throw here uncaught.
      const asset = result.assets?.[0];
      if (!asset) {
        showError("No file selected", "Try picking the audio file again.");
        return;
      }

      // Picker URIs — especially Android content:// ones — aren't
      // guaranteed to still be readable after the app restarts, so copy
      // into a stable app-owned location rather than storing the raw URI.
      await FileSystem.makeDirectoryAsync(RINGTONE_DIR, {
        intermediates: true,
      }).catch(() => {}); // already exists — fine

      const destUri = `${RINGTONE_DIR}${Date.now()}-${asset.name}`;
      await FileSystem.copyAsync({ from: asset.uri, to: destUri });

      const next: StoredRingtoneSelection = {
        kind: "custom",
        name: asset.name,
        uri: destUri,
      };
      setSelection(next);
      await setStoredRingtoneSelection(next);
      previewSource("custom", { uri: destUri });
      showSuccess("Ringtone set", asset.name);
    } catch (err) {
      console.log("pickCustomFile error ===>>", err);
      showError("Couldn't use that file", "Try a different audio file.");
    }
  };

  const isBundledSelected = (id: string) =>
    selection?.kind === "bundled" && selection.id === id;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backBtn,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Ringtone
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={BUNDLED_RINGTONES}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.divider }]}
            onPress={() => selectBundled(item.id, item.source)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Select ${item.name} ringtone`}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name={
                  previewingId === item.id
                    ? "volume-high"
                    : "musical-note-outline"
                }
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                {item.name}
              </Text>
            </View>
            {isBundledSelected(item.id) && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No bundled ringtones added yet — choose a file below, or add entries
            to BUNDLED_RINGTONES once you have audio assets.
          </Text>
        }
        ListFooterComponent={
          <>
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: colors.divider }]}
              onPress={pickCustomFile}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Choose a ringtone from files"
            >
              <View style={styles.rowLeft}>
                <Ionicons
                  name="folder-open-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                  Choose from Files...
                </Text>
              </View>
            </TouchableOpacity>

            {selection?.kind === "custom" && (
              <View style={[styles.row, { borderBottomColor: colors.divider }]}>
                <View style={styles.rowLeft}>
                  <Ionicons
                    name="document-outline"
                    size={20}
                    color={colors.textMuted}
                  />
                  <Text
                    style={[styles.rowLabel, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {selection.name}
                  </Text>
                </View>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={colors.primary}
                />
              </View>
            )}
          </>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "800" },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "500", flexShrink: 1 },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 24,
    lineHeight: 20,
  },
});
