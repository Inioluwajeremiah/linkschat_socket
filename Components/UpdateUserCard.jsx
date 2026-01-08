import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import React from "react";
import Entypo from "@expo/vector-icons/Entypo";
import Svg, { Circle } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useGetUserDetailsQuery } from "../Store/apislices/userApiSlice";
import { imageSize } from "../utils/Dimensions";

const RING_SIZE = imageSize + 10; // Adjusted size for the ring
const STROKE_WIDTH = 4;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const UpdateUserCard = ({
  item,
  allStatusUpdates,
  index,
  viewed,
  filterCurrentUserStatus,
  filterByOtherUsersStatus,
  fromCurrentUserStatus,
}) => {
  const navigation = useNavigation();
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;
  const statusOwnerId = item?.userId;

  const { viewedStatus } = useSelector((state) => state.viewedStatus);

  const { data: userDetails, isLoading } = useGetUserDetailsQuery({
    userId: statusOwnerId,
  });

  const statusIds = item?.data?.map((status) => status.id);

  const statusCount = item?.data?.length || 1;
  const dashGap = 5;
  const dashLength = (CIRCUMFERENCE - dashGap * statusCount) / statusCount;

  if (isLoading) return null;

  return (
    <TouchableOpacity
      key={index}
      style={styles.container}
      onPress={
        item?.length <= 0
          ? () => navigation.navigate("AddUpdateScreen")
          : () =>
              navigation.navigate("ViewUpdateScreen", {
                allStatusUpdates,
                statusIndex: index,
                userDetails,
                filterCurrentUserStatus: filterCurrentUserStatus,
                filterByOtherUsersStatus: filterByOtherUsersStatus,
                fromCurrentUserStatus: fromCurrentUserStatus,
                statusOwnerId: statusOwnerId,
              })
      } // Navigate to view update screen
    >
      <View style={styles.avatarWrapper}>
        {/* Dashed Ring */}

        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={
              statusIds?.every((id) =>
                viewedStatus.some((status) => status.id === id)
              )
                ? "gray"
                : item?.length <= 0
                ? "gray"
                : "#5bbbdf"
            }
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${dashLength},${dashGap}`}
            rotation="-90"
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        </Svg>

        {/* Avatar Image */}
        <Image
          source={
            userDetails?.data?.imageUrl
              ? { uri: userDetails.data.imageUrl }
              : require("../assets/user.png")
          }
          style={styles.avatar}
        />

        {/* add status Button */}
        {item?.length === 0 || item?.[0]?.userId === userId ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("AddUpdateScreen")}
            style={styles.addButton}
          >
            <Entypo name="plus" size={20} color="#5bbbdf" />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.nameText}>
        {item[0]?.userId === userId ? "My status" : userDetails?.data?.userName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: imageSize + 14,
    margin: 5,
    padding: 5,
    backgroundColor: "white",
  },
  avatarWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: RING_SIZE,
    height: RING_SIZE,
  },
  avatar: {
    width: imageSize,
    height: imageSize,
    borderRadius: imageSize / 2,
    position: "absolute",
  },
  addButton: {
    width: imageSize / 2,
    height: imageSize / 2,
    top: imageSize - imageSize / 2.5,
    right: -4,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: imageSize / 4,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    zIndex: 10,
  },
  nameText: {
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 10,
    fontFamily: "regular",
  },
});

export default UpdateUserCard;
