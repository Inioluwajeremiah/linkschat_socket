import { Colors } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { CountryCodes } from "@/utils/CountryCodes";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import {
  Animated,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

// ─── Country Picker Bottom Sheet ──────────────────────────────────────────────

type CountryEntry = { dial_code: string; code: string; name: string };

interface CountryPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (dialCode: string) => void;
  selected: string;
  colors: ReturnType<typeof useTheme>["colors"];
  isDark: boolean;
}

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    height: "100%",
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  flag: {
    fontSize: 22,
    width: 32,
    textAlign: "center",
  },
  countryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  dialBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(99,102,241,0.12)",
  },
  dialText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.accent,
  },
  empty: {
    alignItems: "center",
    paddingTop: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});

export default function CountryPickerSheet({
  visible,
  onClose,
  onSelect,
  selected,
  colors,
  isDark,
}: CountryPickerSheetProps) {
  const [search, setSearch] = useState("");
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      setSearch("");
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const filtered = useMemo(
    () =>
      CountryCodes.filter(
        (c: CountryEntry) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial_code.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const renderItem = ({ item }: { item: CountryEntry }) => {
    const isSelected = item.dial_code === selected;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          onSelect(item.dial_code);
          onClose();
        }}
        style={[
          sheetStyles.item,
          {
            borderBottomColor: colors.border,
            backgroundColor: isSelected
              ? isDark
                ? "rgba(99,102,241,0.12)"
                : "rgba(99,102,241,0.07)"
              : "transparent",
          },
        ]}
      >
        {/* Flag emoji from country code */}
        <Text style={sheetStyles.flag}>
          {item.code
            .toUpperCase()
            .replace(/./g, (c) =>
              String.fromCodePoint(127397 + c.charCodeAt(0))
            )}
        </Text>

        <Text
          style={[sheetStyles.countryName, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <View style={sheetStyles.dialBadge}>
          <Text style={sheetStyles.dialText}>{item.dial_code}</Text>
        </View>

        {isSelected && (
          <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={sheetStyles.overlay}>
        <Pressable style={sheetStyles.backdrop} onPress={onClose} />

        <Animated.View
          style={[
            sheetStyles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View
            style={[sheetStyles.handle, { backgroundColor: colors.border }]}
          />

          {/* Header */}
          <View style={sheetStyles.sheetHeader}>
            <Text
              style={[sheetStyles.sheetTitle, { color: colors.textPrimary }]}
            >
              Select country
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View
                style={[
                  sheetStyles.closeBtn,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="close" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View
            style={[
              sheetStyles.searchWrapper,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={16}
              color={colors.textMuted}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={[sheetStyles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search country or code…"
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item, i) => `${item.code}-${i}`}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
            ListEmptyComponent={
              <View style={sheetStyles.empty}>
                <Ionicons
                  name="globe-outline"
                  size={36}
                  color={colors.textMuted}
                />
                <Text
                  style={[sheetStyles.emptyText, { color: colors.textMuted }]}
                >
                  No countries found
                </Text>
              </View>
            }
          />
        </Animated.View>
      </View>
    </Modal>
  );
}
