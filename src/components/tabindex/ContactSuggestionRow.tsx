import { Spacing } from "@/constants";
import { useContactNameResolver } from "@/hooks/useContactName";
import { User } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * A row for a LinksChat contact you haven't started a conversation with
 * yet. Deliberately mirrors ChatItem's layout (avatar size, name style,
 * row height) so it reads as part of the same list, while the right-hand
 * side swaps the time/unread badge for a "Message" pill so it's clearly
 * not an existing conversation.
 */
export default function ContactSuggestionRow({
  contact,
  colors,
  isCreating,
  onPress,
}: {
  contact: User;
  colors: any;
  isCreating: boolean;
  onPress: (contact: User) => void;
}) {
  const resolveContact = useContactNameResolver();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, []);

  const hideOnlineStatus =
    (contact as any)?.privacySettings?.hideOnlineStatus ?? false;
  const isOnline = !hideOnlineStatus && contact.isOnline;

  const { displayName, isContact } = resolveContact(
    contact.phone,
    contact.name
  );

  const initials = (displayName || "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.background }]}
        activeOpacity={0.65}
        onPress={() => onPress(contact)}
        disabled={isCreating}
        accessibilityRole="button"
        accessibilityLabel={`Start chat with ${displayName}`}
      >
        <View style={styles.avatarWrap}>
          {contact.avatar ? (
            <Image
              source={{ uri: contact.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <LinearGradient
              colors={["#00d4aa", "#5b8dee"]}
              style={styles.avatarFallback}
            >
              <Text style={styles.avatarInitials}>{initials}</Text>
            </LinearGradient>
          )}
          {isOnline && (
            <View
              style={[styles.onlineDot, { borderColor: colors.background }]}
            />
          )}
        </View>

        <View style={[styles.content, { borderBottomColor: colors.divider }]}>
          <View style={styles.textCol}>
            <Text
              style={[styles.name, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <View style={styles.subtitleRow}>
              <Ionicons
                name="checkmark-circle"
                size={12}
                color={colors.textPrimary}
              />
              <Text
                style={[styles.subtitle, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                On LinksChat
              </Text>
            </View>
          </View>

          {isCreating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View
              style={[
                styles.messagePill,
                { backgroundColor: `${colors.primary}1a` },
              ]}
            >
              <Text style={[styles.messagePillText, { color: colors.primary }]}>
                Message
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: Spacing.base,
  },
  avatarWrap: { position: "relative", flexShrink: 0, paddingVertical: 10 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: { color: "#fff", fontSize: 17, fontWeight: "700" },
  onlineDot: {
    position: "absolute",
    bottom: 11,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#00d4aa",
    borderWidth: 2,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingRight: Spacing.base,
    paddingVertical: 10,
    paddingLeft: 12,
    gap: 8,
  },
  textCol: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  subtitleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  subtitle: { fontSize: 13 },
  messagePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    flexShrink: 0,
  },
  messagePillText: { fontSize: 12, fontWeight: "700" },
});
