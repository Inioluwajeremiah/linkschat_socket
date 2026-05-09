import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useState } from "react";
import History from "./History";
import CallHistoryCard from "./CallHistoryCard";
import { useGetUserCallsQuery } from "../Store/apislices/callApiSlice";
import { useSelector } from "react-redux";

const Histories = () => {
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  const { data, refetch, isLoading, error } = useGetUserCallsQuery({ userId });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await refetch(); // 🔁 RTK Query refetch or API reload
    } catch (e) {
      console.log("Refresh failed", e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const mappedCalls = (data?.data ?? []).map((call) => ({
    callId: call.callId,
    status: call.status,
    direction: call.direction,
    callType: call.callType,
    duration: call.duration,
    callerId: call.callerId,
    receiverId: call.receiverId,

    // normalize time
    timestamp: call.createdAt?.seconds
      ? new Date(call.createdAt.seconds * 1000).toISOString()
      : new Date().toISOString(),

    // placeholders (until backend provides these)
    otherUserName:
      call.direction === "incoming" ? call.callerId : call.receiverId,

    otherUserAvatar: null,
  }));

  return (
    // <FlatList
    //   data={data}
    //   keyExtractor={(item) => item.callId}
    //   renderItem={({ item }) => (
    //     <CallHistoryCard
    //       item={item}
    //       onPress={() => {
    //         // Redial or open call details
    //       }}
    //     />
    //   )}
    //   ListEmptyComponent={<Text style={styles.empty}>No call history yet</Text>}
    //   contentContainerStyle={{ padding: 16 }}
    // />

    <FlatList
      data={mappedCalls}
      keyExtractor={(item) => item.callId}
      renderItem={({ item }) => (
        <CallHistoryCard
          item={item}
          onPress={() => {
            // Redial or open call details
          }}
        />
      )}
      ListEmptyComponent={<Text style={styles.empty}>No call history yet</Text>}
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      /* 🔄 Pull-to-refresh */
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={["#5bbbdf"]} // Android
          tintColor="#5bbbdf" // iOS
        />
      }
    />
  );
};

export default Histories;

const styles = StyleSheet.create({});
