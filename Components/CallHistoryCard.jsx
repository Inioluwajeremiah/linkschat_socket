import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDeleteUserCallMutation } from "../Store/apislices/callApiSlice";
import { useGetUserDetailsQuery } from "../Store/apislices/userApiSlice";

export default function CallHistoryCard({ item, onPress }) {
  const isMissed = item.status === "missed";

  const [deleteUserCall, { isLoading }] = useDeleteUserCallMutation();

  const {
    data: userBDetails,
    isLoading: loadingUserDetails,
    error: userBDetailsError,
  } = useGetUserDetailsQuery({ userId: item.receiverId });

  const directionIcon =
    item.direction === "incoming" ? "call-received" : "call-made";

  const callTypeIcon = item.callType === "audio" ? "call" : "videocam";

  const statusColor = isMissed ? "#E53935" : "#4CAF50";

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatTime = (timestamp) => new Date(timestamp).toLocaleString();

  const handleDeleteCall = async (callId) => {
    try {
      const response = await deleteUserCall({ userId });
    } catch (err) {
      Alert.alert(
        "Delete failed",
        err?.data?.message || "Unable to delete call history"
      );
    }
  };

  const confirmDelete = () => {
    if (isLoading) return;

    Alert.alert(
      "Delete call history",
      "Are you sure you want to delete this call record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteCall(item.callId),
        },
      ]
    );
  };

  if (loadingUserDetails) {
    return <ChatCardLoadingSkeleton />;
  }

  return (
    <Pressable
      onPress={!isLoading ? onPress : undefined}
      onLongPress={!isLoading ? confirmDelete : undefined}
      style={[styles.card, isLoading && styles.cardDisabled]}
    >
      <Image
        source={
          userBDetails?.data?.imageUrl
            ? { uri: userBDetails.data.imageUrl }
            : require("../assets/user.png")
        }
        style={styles.avatar}
      />

      <View style={styles.center}>
        <Text style={styles.name}>
          {userBDetails?.data?.userName?.trim() || ""}
        </Text>

        <View style={styles.meta}>
          {/* Direction */}
          <MaterialCommunityIcons
            name={directionIcon}
            size={16}
            color={statusColor}
          />

          {/* Call type */}
          <Ionicons
            name={callTypeIcon}
            size={14}
            color="#555"
            style={{ marginLeft: 6 }}
          />

          <Text style={[styles.status, { color: statusColor }]}>
            {item.status}
          </Text>

          {item.duration ? (
            <Text style={styles.duration}>
              • {formatDuration(item.duration)}
            </Text>
          ) : null}
        </View>

        <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color="#E53935" />
      ) : (
        <Ionicons name="call-outline" size={22} color="#1E88E5" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  center: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  status: {
    marginLeft: 6,
    fontSize: 13,
    textTransform: "capitalize",
  },
  duration: {
    marginLeft: 6,
    fontSize: 13,
    color: "#555",
  },
  time: {
    marginTop: 4,
    fontSize: 12,
    color: "#777",
  },
});
