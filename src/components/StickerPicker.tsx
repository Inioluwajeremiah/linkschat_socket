import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { STICKER_PACKS, StickerRef } from "@/constants/stickers";
import {
  CustomSticker,
  getCustomStickers,
  pickAndSaveCustomSticker,
  deleteCustomSticker,
} from "@/utils/stickerStorage";

const COLUMNS = 4;

interface Props {
  visible: boolean;
  onPick: (ref: StickerRef) => void;
  colors: any;
}

export default function StickerPicker({ visible, onPick, colors }: Props) {
  // "pack-basics" etc, or the reserved id "custom" for the user's own library
  const [activeTab, setActiveTab] = useState<string>(
    STICKER_PACKS[0]?.id ?? "custom"
  );
  const [customStickers, setCustomStickers] = useState<CustomSticker[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCustom = useCallback(async () => {
    setLoadingCustom(true);
    try {
      setCustomStickers(await getCustomStickers());
    } finally {
      setLoadingCustom(false);
    }
  }, []);

  useEffect(() => {
    if (visible) loadCustom();
  }, [visible, loadCustom]);

  if (!visible) return null;

  const handleAddCustom = async () => {
    setSaving(true);
    try {
      const saved = await pickAndSaveCustomSticker();
      if (saved) setCustomStickers((prev) => [saved, ...prev]);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCustom = async (id: string) => {
    await deleteCustomSticker(id);
    setCustomStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const activePack = STICKER_PACKS.find((p) => p.id === activeTab);

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.surface, borderTopColor: colors.border },
      ]}
    >
      {/* Pack tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {STICKER_PACKS.map((pack) => (
          <TouchableOpacity
            key={pack.id}
            onPress={() => setActiveTab(pack.id)}
            style={[
              styles.tab,
              activeTab === pack.id && {
                borderBottomWidth: 2,
                borderBottomColor: "#00d4aa",
              },
            ]}
          >
            <Image source={pack.icon.source} style={styles.tabIcon} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => setActiveTab("custom")}
          style={[
            styles.tab,
            activeTab === "custom" && {
              borderBottomWidth: 2,
              borderBottomColor: "#00d4aa",
            },
          ]}
        >
          <MaterialCommunityIcons
            name="folder-star-outline"
            size={22}
            color={activeTab === "custom" ? "#00d4aa" : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Grid */}
      {activeTab === "custom" ? (
        loadingCustom ? (
          <ActivityIndicator color="#00d4aa" style={{ paddingVertical: 30 }} />
        ) : (
          <FlatList
            data={[{ id: "__add__" } as any, ...customStickers]}
            keyExtractor={(item) => item.id}
            numColumns={COLUMNS}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) =>
              item.id === "__add__" ? (
                <TouchableOpacity
                  style={[
                    styles.cell,
                    styles.addCell,
                    { borderColor: colors.border },
                  ]}
                  onPress={handleAddCustom}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#00d4aa" size="small" />
                  ) : (
                    <Ionicons name="add" size={26} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.cell}
                  onPress={() => onPick({ kind: "custom", localUri: item.uri })}
                  onLongPress={() => handleRemoveCustom(item.id)}
                >
                  <Image source={{ uri: item.uri }} style={styles.sticker} />
                </TouchableOpacity>
              )
            }
            ListEmptyComponent={null}
          />
        )
      ) : (
        <FlatList
          data={activePack?.stickers ?? []}
          keyExtractor={(item) => item.id}
          numColumns={COLUMNS}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cell}
              onPress={() =>
                onPick({
                  kind: "bundled",
                  packId: activePack!.id,
                  stickerId: item.id,
                })
              }
            >
              <Image source={item.source} style={styles.sticker} />
            </TouchableOpacity>
          )}
        />
      )}

      {activeTab === "custom" && customStickers.length > 0 && (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Long-press a sticker to remove it
        </Text>
      )}
    </View>
  );
}

const CELL_SIZE = 72;

const styles = StyleSheet.create({
  wrap: { borderTopWidth: 1, maxHeight: 320 },
  tabRow: { flexDirection: "row", borderBottomWidth: 1, paddingHorizontal: 8 },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIcon: { width: 26, height: 26, resizeMode: "contain" },
  grid: { padding: 8 },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
  },
  addCell: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
  },
  sticker: {
    width: CELL_SIZE - 8,
    height: CELL_SIZE - 8,
    resizeMode: "contain",
  },
  hint: { fontSize: 11, textAlign: "center", paddingBottom: 8 },
});
