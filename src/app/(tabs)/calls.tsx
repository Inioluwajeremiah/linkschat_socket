import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Colors, Spacing, BorderRadius } from "../../constants";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { callApi } from "../../services/api";
import { CallHistory, User } from "../../types";
import { useAppSelector } from "../../hooks/useRedux";
import { formatDistanceToNow } from "../../utils/date";

const CALL_ICONS: Record<
  string,
  { name: keyof typeof Ionicons.glyphMap; color: string }
> = {
  missed: { name: "call", color: Colors.error },
  completed: { name: "call", color: Colors.success },
  rejected: { name: "call", color: Colors.error },
  incoming: { name: "call-outline", color: Colors.success },
};

function CallItem({ call, myId }: { call: CallHistory; myId: string }) {
  const { colors, isDark } = useTheme();
  const isInitiator = call.initiator._id === myId;
  const other = isInitiator
    ? call.participants.find((p) => p._id !== myId) || call.participants[0]
    : call.initiator;

  const iconInfo = CALL_ICONS[call.status] || CALL_ICONS.completed;
  const initials = (other?.name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formatDuration = (secs?: number) => {
    if (!secs) return "";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return ` · ${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.callItem}>
      <View style={styles.avatarWrap}>
        {other?.avatar ? (
          <Image
            source={{ uri: other.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <LinearGradient
            colors={[colors.surfaceHigh, colors.surface]}
            style={styles.avatarFallback}
          >
            <Text style={[styles.initials, { color: colors.textSecondary }]}>
              {initials}
            </Text>
          </LinearGradient>
        )}
        <View
          style={[
            styles.callTypeBadge,
            {
              backgroundColor:
                call.type === "video" ? colors.secondary : colors.primary,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name={call.type === "video" ? "videocam" : "call"}
            size={9}
            color={colors.surface}
          />
        </View>
      </View>

      <View style={styles.callInfo}>
        <Text style={[styles.callerName, { color: colors.textPrimary }]}>
          {other?.name || "Unknown"}
        </Text>
        <View style={styles.callMeta}>
          <Ionicons
            name={isInitiator ? "arrow-up" : "arrow-down"}
            size={12}
            color={call.status === "missed" ? Colors.error : Colors.success}
          />
          <Text
            style={[
              styles.callStatus,
              call.status === "missed" && { color: Colors.error },
              ,
              { color: colors.textSecondary },
            ]}
          >
            {isInitiator
              ? "Outgoing"
              : call.status === "missed"
              ? "Missed"
              : "Incoming"}
            {formatDuration(call.duration)}
          </Text>
          <Text style={[styles.callTime, { color: colors.textMuted }]}>
            {" "}
            · {formatDistanceToNow(new Date(call.createdAt))}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.callBackBtn,
          { borderColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <Ionicons
          name={call.type === "video" ? "videocam-outline" : "call-outline"}
          size={20}
          color={colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function CallsScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAppSelector((s) => s.auth);
  const [calls, setCalls] = useState<CallHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCalls = useCallback(async () => {
    try {
      const res = await callApi.getCallHistory();
      if (res.success) setCalls(res.data.calls);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalls();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCalls();
    setRefreshing(false);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      // edges={["top"]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Calls</Text>
        <TouchableOpacity
          style={[
            styles.newCallBtn,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Ionicons name="call-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={calls}
          keyExtractor={(c) => c._id}
          renderItem={({ item }) => (
            <CallItem call={item} myId={user?._id || ""} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          contentContainerStyle={[
            styles.list,
            calls.length === 0 && styles.listEmpty,
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="call-outline"
                size={60}
                color={Colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No call history
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Your calls will appear here
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: 28, fontWeight: "800" },
  newCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,

    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  list: { paddingBottom: 100 },
  listEmpty: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  callItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    gap: 12,
  },
  avatarWrap: { position: "relative" },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: { fontSize: 18, fontWeight: "700" },
  callTypeBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  callInfo: { flex: 1, gap: 4 },
  callerName: { fontSize: 15, fontWeight: "700" },
  callMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  callStatus: { fontSize: 13 },
  callTime: { fontSize: 12 },
  callBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,

    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySubtitle: { fontSize: 14 },
});
