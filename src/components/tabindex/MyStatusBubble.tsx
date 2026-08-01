import { Spacing } from "@/constants";
import { User } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MyStatusBubble({
  user,
  hasStatus,
  onPress,
  onAdd,
  colors,
}: {
  user: User;
  hasStatus: boolean;
  onPress: () => void;
  onAdd: () => void;
  colors: any;
}) {
  const initials = user.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <TouchableOpacity
      style={styles.statusBubble}
      onPress={hasStatus ? onPress : onAdd}
      activeOpacity={0.8}
    >
      <View style={styles.statusRingWrap}>
        {hasStatus ? (
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
        {user.avatar ? (
          <Image
            source={{ uri: user.avatar }}
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
        <TouchableOpacity
          style={[styles.plusBadge, { borderColor: colors.background }]}
          onPress={onAdd}
        >
          <Ionicons name="add" size={11} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text
        style={[styles.statusName, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        My Stories
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
  plusBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#00d4aa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  statusTitle: {
    fontSize: 14,
    textAlign: "left",
    fontWeight: "600",
    paddingHorizontal: Spacing.base,
    marginTop: 8,
  },
  statusName: { fontSize: 11, textAlign: "center", fontWeight: "500" },
});
