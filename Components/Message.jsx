import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import OnlineUserIndicator from "./OnlineUserIndicator";
import { windowWidth } from "../utils/Dimensions";
import { timeAgo } from "../utils/TimeUtils";
import { useGetUserDetailsQuery } from "../Store/apislices/userApiSlice";
import ChatCardLoadingSkeleton from "./ChatCardLoadingSkeleton";

// Message is chat card
const Message = ({ item, loadingChats, chatsToDelete, setChatsToDelete }) => {
  const navigation = useNavigation();
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  const userBId = item?.participants?.find((item) => item !== userId);

  const {
    data: userBDetails,
    isLoading: loadingUserDetails,
    error: userBDetailsError,
  } = useGetUserDetailsQuery({ userId: userBId });

  // console.log(
  //   "userBDetailsError details at chat message card ====>>>  ",
  //   userBDetailsError
  // );

  const imageSize = windowWidth * 0.15;
  const indicatorSize = imageSize * 0.4;

  // console.log("item at chat message card ====>>> ", item.participants);

  const handleLongPress = (chatId) => {
    // setOnLongPressActivated(true);
    setChatsToDelete((prev) => {
      if (prev.includes(chatId)) {
        return prev.filter((id) => id !== chatId);
      } else {
        return [...prev, chatId];
      }
    });
  };

  if (loadingUserDetails) {
    return <ChatCardLoadingSkeleton />;
  }

  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        backgroundColor: "white",
        gap: 10,
        marginBottom: 10,
        paddingVertical: 10,
        // marginHorizontal: 20,
        borderRadius: 10,
        padding: chatsToDelete.includes(item?.chatId) ? 10 : 0,
        backgroundColor: chatsToDelete.includes(item?.chatId)
          ? "rgba(91, 187, 223, 0.5)"
          : "transparent",
      }}
      onLongPress={() => handleLongPress(item?.chatId)}
      onPress={
        chatsToDelete.length > 0
          ? () => handleLongPress(item?.chatId)
          : () =>
              navigation.navigate("chat-details", {
                loadingChats,
                item: item,
                isNewChat: false,
                userBDetails: userBDetails?.data,
              })
      }
    >
      {/* profile image and indicator */}
      <View
        style={{
          width: imageSize,
          height: imageSize,
          borderWidth: 3,
          borderColor: "#5bbbdf",
          borderRadius: imageSize / 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={
            userBDetails?.data?.imageUrl
              ? { uri: userBDetails.data.imageUrl }
              : require("../assets/user.png")
          }
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: imageSize / 2,
          }}
        />
        {/* active user indicator */}
        {userBId && <OnlineUserIndicator receiverId={userBId} />}
      </View>
      {/* user b name, timestamp, text and unread counts  */}
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          marginLeft: 10,
        }}
      >
        {/* user b and last message timestamp  */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 16,
              fontWeight: "bold",
              color: "black",
              fontFamily: "regular",
            }}
            numberOfLines={1}
          >
            {userBDetails?.data?.userName?.trim() || ""}
          </Text>

          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: "#5bbbdf",
              fontFamily: "regular",
            }}
          >
            {timeAgo(item?.lastMessage?.timestamp)}
          </Text>
        </View>
        {/* last message text and count */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 5,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              color: "gray",
              fontFamily: "regular",
            }}
            numberOfLines={1}
          >
            {item?.lastMessage?.content}
          </Text>

          {/* <Text
            style={{
              display: "flex",
              width: indicatorSize,
              height: indicatorSize,
              borderRadius: indicatorSize / 2,
              padding: indicatorSize * 0.1,
              textAlign: "center",
              fontSize: 14,
              color: "white",
              fontFamily: "regular",
              backgroundColor: Colors.primaryColor,
            }}
            numberOfLines={1}
          >
            {item?.unreadCounts[userId]}
          </Text> */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Message;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  lineShort: {
    width: 150,
    height: 20,
    borderRadius: 4,
  },
  lineLong: {
    width: "90%",
    height: 20,
    borderRadius: 4,
  },
  box: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
});
