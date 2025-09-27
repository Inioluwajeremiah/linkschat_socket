import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  View,
  AppState,
  Modal,
  Pressable,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import { windowWidth } from "../utils/Dimensions";
import useGetUserStatus from "../hooks/useGetUserStatus";
import { useSelector } from "react-redux";
import { setUserOffline, setUserOnline } from "../utils/presence";
import { useStreamCall } from "../hooks/streamCallHooksDelete/useStreamCall";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatHeader = ({ chat, isNewChat, userBDetails }) => {
  const navigation = useNavigation();
  const imageSize = windowWidth * 0.15;
  const iconSize = imageSize / 1.5;

  const { status, loading } = useGetUserStatus(userBDetails?.id);
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  console.log(
    "chat participants in chats header  ====>>> ",
    chat?.participants
  );

  // const { GetOrCreateCall } = useStreamCall(userBDetails.id);
  const { GetOrCreateCall } = useStreamCall(
    userBDetails?.id,
    chat?.participants
  );

  const [showCallDialog, setShowCallDialog] = useState(false);

  const ToggleCallPress = () => {
    setShowCallDialog(!showCallDialog);
  };

  const handleCallPress = () => {
    GetOrCreateCall();
  };

  // set active or inactive user
  useEffect(() => {
    setUserOnline(userId);

    const onAppBackground = () => setUserOffline(userId);
    const onAppForeground = () => setUserOnline(userId);

    AppState.addEventListener("change", (state) => {
      if (state === "background") onAppBackground();
      else if (state === "active") onAppForeground();
    });

    return () => {
      setUserOffline(userId);
    };
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#5bbbdf",
        // position: "absolute",
        // top: 0,
        // left: 0,
        // right: 0,
        // zIndex: 10,
        // height: windowHeight * 0.15 < 70 ? 70 : windowHeight * 0.15,
        height: 80,
        padding: 20,
        width: windowWidth,
        maxWidth: windowWidth,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          // marginRight:20
        }}
      >
        {/* back arrow */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={{
            width: iconSize,
            height: iconSize,
            borderWidth: 1,
            borderColor: "#fff",
            borderRadius: 10,
            backgroundColor: "#5bbbdf",
            opacity: 0.7,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
          }}
        >
          <MaterialIcons name="keyboard-arrow-left" size={34} color="white" />
        </TouchableOpacity>

        {/* middle view - user details */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: windowWidth * 0.6,
            gap: 10,
            overflow: "hidden",
          }}
        >
          <Image
            // source={
            //   isNewChat && chat?.imageUrl
            //     ? { uri: chat?.imageUrl }
            //     : !isNewChat && userBDetails?.imageUrl
            //     ? { uri: userBDetails?.imageUrl }
            //     : require("../assets/user.png")
            // }
            source={
              isNewChat
                ? chat?.imageUrl
                  ? { uri: chat.imageUrl }
                  : require("../assets/user.png")
                : userBDetails?.imageUrl
                ? { uri: userBDetails.imageUrl }
                : require("../assets/user.png")
            }
            style={{
              width: imageSize,
              height: imageSize,
              borderRadius: imageSize / 2,
              borderColor: "white",
              borderWidth: 1,
            }}
          />
          <View style={{}}>
            <Text
              style={{
                fontFamily: "bold",
                fontWeight: "bold",
                color: "white",
                width: windowWidth * 0.6,
              }}
              numberOfLines={1}
            >
              {chat?.isGroup
                ? chat?.groupName
                : chat?.sender || chat?.userName || userBDetails?.userName}
              {/* {chat?.userName} */}
            </Text>
            <Text
              style={{
                fontFamily: "regular",
                marginTop: 4,
                fontSize: 12,
              }}
            >
              {status?.online ? "Online" : "Offline"}
            </Text>
          </View>
        </View>
      </View>

      {/* right icons */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <TouchableOpacity
          onPress={handleCallPress}
          style={{
            width: iconSize,
            height: iconSize,
            borderWidth: 1,
            borderColor: "#fff",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
            backgroundColor: "#5bbbdf",
            opacity: 0.7,
          }}
        >
          <Feather name="phone-call" size={24} color="white" />
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={{
            width: iconSize,
            height: iconSize,
            borderWidth: 1,
            borderColor: "#fff",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            backgroundColor: "#5bbbdf",
            opacity: 0.7,
            elevation: 5,
          }}
        >
          <AntDesign name="ellipsis1" size={24} color="white" />
        </TouchableOpacity> */}
      </View>

      {/* Call Dialog */}
      {showCallDialog && (
        <Modal transparent visible={showCallDialog} animationType="none">
          <Pressable style={{ height: "50%" }} onPress={ToggleCallPress} />
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            {/* <ZegoCloudCallModal /> */}
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ChatHeader;

const styles = StyleSheet.create({});
