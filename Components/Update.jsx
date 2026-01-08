import { View, Text, Image, FlatList, ActivityIndicator } from "react-native";
import React from "react";
import { useGetStatusQuery } from "../Store/apislices/statusApiSlice";
import UpdateUserCard from "./UpdateUserCard";
import { useSelector } from "react-redux";

export default function Updates() {
  const { userData } = useSelector((state) => state.auth);
  const { viewedStatus } = useSelector((state) => state.viewedStatus);

  const userId = JSON.parse(userData)?.userId;

  const { data: allStatusUpdate, isLoading: gettingAllStatus } =
    useGetStatusQuery();

  if (gettingAllStatus) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"small"} color={"blue"} />
      </View>
    );
  }

  // filter the status updates to show only those from the current user
  const filterCurrentUserStatus = allStatusUpdate?.data.filter(
    (item) => item?.userId === userId
  );

  const filterByOtherUsersStatus = allStatusUpdate?.data.filter(
    (item) => item?.userId !== userId
  );

  return (
    <View
      style={{
        borderBottomColor: "gray",
        borderBottomWidth: 0.5,
        marginTop: 10,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 16,
          marginHorizontal: 20,
          fontFamily: "regular",
        }}
      >
        Recent Updates
      </Text>
      <View style={{ flexDirection: "row" }}>
        <UpdateUserCard
          item={filterCurrentUserStatus}
          allStatusUpdates={filterCurrentUserStatus}
          filterCurrentUserStatus={filterCurrentUserStatus}
          filterByOtherUsersStatus={filterByOtherUsersStatus}
          index={0}
          viewed={false}
          fromCurrentUserStatus={true}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterByOtherUsersStatus}
          renderItem={({ item, index }) => (
            <UpdateUserCard
              allStatusUpdates={filterByOtherUsersStatus}
              filterCurrentUserStatus={filterCurrentUserStatus}
              filterByOtherUsersStatus={filterByOtherUsersStatus}
              item={item}
              index={index}
              viewed={false}
              fromCurrentUserStatus={false}
            />
          )}
        />
      </View>
    </View>
  );
}
