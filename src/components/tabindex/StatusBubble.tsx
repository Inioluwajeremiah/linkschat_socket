import { Spacing } from "@/constants";
import { useContactNameResolver } from "@/hooks/useContactName";
import { StatusGroup } from "@/types";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { TouchableOpacity } from "react-native";

export default function StatusBubble({
  group,
  allViewed,
  onPress,
  colors,
}: {
  group: StatusGroup;
  allViewed: boolean;
  onPress: () => void;
  colors: any;
}) {
  const resolveContact = useContactNameResolver();
  const { displayName, isContact } = resolveContact(
    group?.user.phone,
    group?.user.name
  );

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <TouchableOpacity
      style={styles.statusBubble}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.statusRingWrap}>
        {!allViewed ? (
          <LinearGradient
            colors={["#00d4aa", "#5b8dee"]}
            style={styles.statusRing}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        ) : (
          <View
            style={[styles.statusRing, { backgroundColor: colors.border }]}
          />
        )}
        {group.user.avatar ? (
          <Image
            source={{ uri: group.user.avatar }}
            style={styles.statusAvatarImg}
            contentFit="cover"
          />
        ) : (
          <LinearGradient
            colors={["#00d4aa", "#5b8dee"]}
            style={styles.statusAvatarFallback}
          >
            <Text style={styles.statusAvatarInitials}>{initials}</Text>
          </LinearGradient>
        )}
      </View>
      <Text
        style={[styles.statusName, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {displayName.split(" ")[0]}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  statusBar: { borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 2 },
  statusScroll: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    gap: 14,
  },
  statusBubble: { alignItems: "center", width: 64 },
  statusRingWrap: { position: "relative", marginBottom: 5 },
  statusRing: { width: 60, height: 60, borderRadius: 30 },
  statusAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    position: "absolute",
    top: 4,
    left: 4,
  },
  statusAvatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 4,
    left: 4,
  },
  statusAvatarInitials: { color: "#fff", fontSize: 17, fontWeight: "800" },

  statusName: { fontSize: 11, textAlign: "center", fontWeight: "500" },
});
