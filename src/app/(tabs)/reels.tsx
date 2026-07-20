import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import {
  fetchReels,
  deleteReelThunk,
  removeReelOptimistic,
  restoreReel,
} from "../../store/slices/reelSlice";
import { reelApi } from "../../services/api";
import { Reel } from "../../types";
import ReelItem from "../reels/components/ReelsItem";
import CommentsModal from "../reels/components/CommentModal";
import { Image } from "expo-image";

const { height } = Dimensions.get("window");

export default function ReelsScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const { user } = useAppSelector((s) => s.auth);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { reels, loading, page, hasMore, trending } = useAppSelector(
    (s) => s.reel
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    dispatch(fetchReels({ page: 1, trending: false, replace: true }));
  }, [dispatch]);

  const handleDeleteReel = async (reelId: string) => {
    const index = reels.findIndex((r) => r._id === reelId);
    const removedReel = reels[index];

    dispatch(removeReelOptimistic(reelId));
    try {
      await dispatch(deleteReelThunk(reelId)).unwrap();
      toast.success("LinksSwipe deleted");
    } catch {
      if (removedReel) dispatch(restoreReel({ reel: removedReel, index }));
      toast.error("Failed to delete reel");
    }
  };

  const toggleTrending = () => {
    const next = !trending;
    dispatch(fetchReels({ page: 1, trending: next, replace: true }));
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      dispatch(fetchReels({ page: page + 1, trending, replace: false }));
    }
  };

  const onViewable = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setActiveIdx(idx);
      const r = viewableItems[0].item as Reel;
      reelApi.recordView(r._id).catch(() => {});
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  if (loading && reels.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator color={colors.textPrimary} size="large" />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
          Loading LinksSwipe...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[styles.topBar, { backgroundColor: colors.background }]}
        // edges={["top"]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image
            source={require("@/assets/images/swipe.jpeg")}
            style={{ width: 40, height: 40 }}
          />
          <Text style={[styles.topTitle, { color: colors.textPrimary }]}>
            LinksSwipe
          </Text>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity
            style={[styles.trendBtn, trending && styles.trendBtnActive]}
            onPress={toggleTrending}
          >
            <Ionicons
              name="flame"
              size={15}
              color={trending ? "#fff" : "#ff6b35"}
            />
            <Text style={[styles.trendText, trending && { color: "#fff" }]}>
              Trending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/reels/create")}>
            <Ionicons name="add-circle" size={30} color="#00d4aa" />
          </TouchableOpacity>
        </View>
      </View>

      {reels.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="film-outline"
            size={70}
            color="rgba(255,255,255,0.15)"
          />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
            No LinksSwipe Yet
          </Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Be the first to post!
          </Text>
          <TouchableOpacity onPress={() => router.push("/reels/create")}>
            <LinearGradient
              colors={["#00d4aa", "#5b8dee"]}
              style={styles.createBtn}
            >
              <Ionicons name="videocam" size={18} color="#fff" />
              <Text style={styles.createBtnText}>Create LinksSwipe</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reels}
          keyExtractor={(r) => r._id}
          renderItem={({ item, index }) => (
            <ReelItem
              reel={item}
              isActive={index === activeIdx}
              myId={user?._id || ""}
              onComment={() => {
                setSelectedReel(item);
                setShowComments(true);
              }}
              onDelete={handleDeleteReel}
            />
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewable}
          viewabilityConfig={viewConfig}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          getItemLayout={(_, i) => ({
            length: height,
            offset: height * i,
            index: i,
          })}
        />
      )}

      <CommentsModal
        reel={selectedReel}
        visible={showComments}
        onClose={() => setShowComments(false)}
        myId={user?._id || ""}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 60,
  },
  topTitle: { fontSize: 22, fontWeight: "800" },
  topRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  trendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#ff6b35",
  },
  trendBtnActive: { backgroundColor: "#ff6b35" },
  trendText: { fontSize: 12, fontWeight: "700", color: "#ff6b35" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: "800" },
  emptySub: { fontSize: 14 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 99,
    marginTop: 8,
  },
  createBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  reelCard: { position: "relative" },
  rail: {
    position: "absolute",
    right: 12,
    bottom: 130,
    alignItems: "center",
    gap: 20,
  },
  creatorBtn: { position: "relative" },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
  },
  creatorAvatarFb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  creatorInitials: { color: "#fff", fontWeight: "800", fontSize: 16 },
  followDot: {
    position: "absolute",
    bottom: -6,
    alignSelf: "center",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#00d4aa",
    justifyContent: "center",
    alignItems: "center",
  },
  railItem: { alignItems: "center", gap: 3 },
  railCount: { color: "#fff", fontSize: 12, fontWeight: "700" },
  bottomInfo: { position: "absolute", left: 16, right: 72, bottom: 36 },
  creatorName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 5,
  },
  caption: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 18,
    marginBottom: 5,
  },
  reelTime: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
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
