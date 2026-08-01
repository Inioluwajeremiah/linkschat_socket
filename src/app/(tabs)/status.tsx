import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useTheme } from "../../context/ThemeContext";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { fetchStatuses } from "../../store/slices/statusSlice";
import { useContactNameResolver } from "@/hooks/useContactName";

function StatusRing({ statuses, viewed, colors }: any) {
  const allViewed = statuses.every((s: any) => s.viewed);

  return (
    <LinearGradient
      colors={
        allViewed
          ? [colors.border, colors.border]
          : [colors.primary, colors.secondary]
      }
      style={styles.ring}
    />
  );
}

export default function StatusScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { myStatus, statuses, loading } = useAppSelector((s) => s.status);
  const dispatch = useAppDispatch();
  const resolveContact = useContactNameResolver();
  // const [myStatus, setMyStatus] = useState<StatusGroup | null>(null);
  // const [statuses, setStatuses] = useState<StatusGroup[]>([]);
  // const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // const loadStatuses = useCallback(async () => {
  //   try {
  //     const res = await statusApi.getStatuses();
  //     if (res.success) {
  //       setMyStatus(res.data.myStatus);
  //       setStatuses(res.data.statuses);
  //     }
  //   } catch {
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   const loadStatuses = async () => {
  //     try {
  //       await fetchStatuses();
  //     } catch (error) {
  //       console.error("Failed to fetch statuses:", error);
  //     }
  //   };

  //   loadStatuses();
  // }, []);

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        await dispatch(fetchStatuses()).unwrap();
      } catch (err) {
        // console.error(err);
      }
    };

    loadStatuses();
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    // await loadStatuses();
    await dispatch(fetchStatuses());
    setRefreshing(false);
  };

  const myInitials =
    user?.name
      ?.split(" ")
      .map((w: any) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      // edges={["top"]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Status
        </Text>

        <TouchableOpacity
          style={[
            styles.headerBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => router.push("/status/create")}
        >
          <Ionicons name="add" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* LOADING */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => "dummy"}
          renderItem={null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <>
              {/* MY STATUS */}
              <View style={styles.section}>
                <Text
                  style={[styles.sectionLabel, { color: colors.textMuted }]}
                >
                  My Status
                </Text>

                <TouchableOpacity
                  style={[
                    styles.myStatusRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() =>
                    myStatus
                      ? router.push("/status/view")
                      : router.push("/status/create")
                  }
                >
                  <View style={styles.myAvatarWrap}>
                    {myStatus && (
                      <StatusRing
                        statuses={myStatus.statuses}
                        viewed={false}
                        colors={colors}
                      />
                    )}

                    {user?.avatar ? (
                      <Image
                        source={{ uri: user.avatar }}
                        style={styles.myAvatar}
                      />
                    ) : (
                      <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.myAvatarFallback}
                      >
                        <Text style={styles.myInitials}>{myInitials}</Text>
                      </LinearGradient>
                    )}

                    {!myStatus && (
                      <View
                        style={[
                          styles.addDot,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Ionicons name="add" size={14} color="#fff" />
                      </View>
                    )}
                  </View>

                  <View style={styles.myStatusInfo}>
                    <Text
                      style={[
                        styles.myStatusName,
                        { color: colors.textPrimary },
                      ]}
                    >
                      My Status
                    </Text>

                    <Text
                      style={[
                        styles.myStatusSub,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {myStatus
                        ? `${myStatus.statuses.length} update${
                            myStatus.statuses.length > 1 ? "s" : ""
                          }`
                        : "Tap to add status update"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.cameraBtn,
                      { backgroundColor: colors.surfaceElevated },
                    ]}
                    onPress={() => router.push("/status/create")}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>

              {/* OTHER STATUS */}
              {statuses.length > 0 && (
                <View style={styles.section}>
                  <Text
                    style={[styles.sectionLabel, { color: colors.textMuted }]}
                  >
                    Recent Updates
                  </Text>

                  {statuses.map((group) => (
                    <TouchableOpacity
                      key={group.user._id}
                      style={styles.statusRow}
                      onPress={() =>
                        router.push({
                          pathname: "/status/view",
                          params: { userId: group.user._id },
                        })
                      }
                    >
                      <View style={styles.statusAvatarWrap}>
                        <StatusRing
                          statuses={group.statuses}
                          viewed={group.statuses.every((s) => s.viewed)}
                          colors={colors}
                        />

                        {group.user.avatar ? (
                          <Image
                            source={{ uri: group.user.avatar }}
                            style={styles.statusAvatar}
                          />
                        ) : (
                          <LinearGradient
                            colors={[colors.primary, colors.secondary]}
                            style={styles.statusAvatarFallback}
                          >
                            <Text style={styles.statusInitials}>
                              {resolveContact(group.user.phone, group.user.name)
                                .displayName.split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </Text>
                          </LinearGradient>
                        )}
                      </View>

                      <View style={styles.statusInfo}>
                        <Text
                          style={[
                            styles.statusName,
                            { color: colors.textPrimary },
                          ]}
                        >
                          {
                            resolveContact(group.user.phone, group.user.name)
                              .displayName
                          }

                          {/* {group.user.name } */}
                        </Text>

                        <Text
                          style={[
                            styles.statusCount,
                            { color: colors.textMuted },
                          ]}
                        >
                          {group.statuses.length} update
                          {group.statuses.length > 1 ? "s" : ""}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* EMPTY STATE */}
              {statuses.length === 0 && !myStatus && (
                <View style={styles.empty}>
                  <Ionicons
                    name="radio-outline"
                    size={60}
                    color={colors.textMuted}
                  />

                  <Text
                    style={[styles.emptyTitle, { color: colors.textPrimary }]}
                  >
                    No status updates
                  </Text>

                  <Text
                    style={[styles.emptySubtitle, { color: colors.textMuted }]}
                  >
                    Share what's on your mind
                  </Text>

                  <TouchableOpacity
                    style={styles.createBtn}
                    onPress={() => router.push("/status/create")}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.secondary]}
                      style={styles.createGradient}
                    >
                      <Text style={styles.createText}>Add Status</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/status/create")}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  title: { fontSize: 28, fontWeight: "800" },

  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  section: { marginBottom: 12 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  myStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },

  myAvatarWrap: {
    position: "relative",
    width: 54,
    height: 54,
  },

  myAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: "absolute",
    top: 2,
    left: 2,
  },

  myAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 2,
    left: 2,
  },

  myInitials: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  addDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },

  myStatusInfo: { flex: 1 },

  myStatusName: { fontSize: 15, fontWeight: "700" },

  myStatusSub: { fontSize: 13 },

  cameraBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },

  statusAvatarWrap: {
    position: "relative",
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },

  ring: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    padding: 2,
  },

  statusAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },

  statusAvatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },

  statusInitials: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  statusInfo: { flex: 1 },

  statusName: { fontSize: 15, fontWeight: "700" },

  statusCount: { fontSize: 12, marginTop: 2 },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },

  emptyTitle: { fontSize: 20, fontWeight: "700" },

  emptySubtitle: { fontSize: 14 },

  createBtn: { marginTop: 8, borderRadius: 99, overflow: "hidden" },

  createGradient: { paddingHorizontal: 28, paddingVertical: 12 },

  createText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    borderRadius: 28,
    overflow: "hidden",
  },

  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
});
