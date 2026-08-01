import { Spacing } from "@/constants";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchStatuses } from "@/store/slices/statusSlice";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { ScrollView } from "react-native";
import { View } from "react-native";
import StatusBubble from "./StatusBubble";
import MyStatusBubble from "./MyStatusBubble";
import { User } from "@/types";

export default function StatusRow({
  user,
  colors,
}: {
  user: User;
  colors: any;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { myStatus, statuses } = useAppSelector((s) => s.status);

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        await dispatch(fetchStatuses()).unwrap();
      } catch (err) {
        // console.error(err);
      }
    };

    loadStatuses();
  }, []);
  return (
    <View style={[styles.statusBar, { borderBottomColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusScroll}
      >
        <MyStatusBubble
          user={user}
          hasStatus={!!myStatus}
          colors={colors}
          onPress={() =>
            router.push({
              pathname: "/status/view",
              params: { userId: user._id },
            })
          }
          onAdd={() => router.push("/status/create")}
        />
        {statuses.map((group) => (
          <StatusBubble
            key={group.user._id}
            group={group}
            colors={colors}
            allViewed={group.statuses.every((s) => s.viewed)}
            onPress={() =>
              router.push({
                pathname: "/status/view",
                params: { userId: group.user._id },
              })
            }
          />
        ))}
      </ScrollView>
    </View>
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
