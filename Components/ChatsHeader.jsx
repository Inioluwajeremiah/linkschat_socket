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
  Alert,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import { windowWidth } from "../utils/Dimensions";
import useGetUserStatus from "../hooks/useGetUserStatus";
import { useSelector, useDispatch } from "react-redux";
import { setUserOffline, setUserOnline } from "../utils/presence";
import { useStreamCall } from "../hooks/streamCallHooksDelete/useStreamCall";
import { useDeleteGroupMutation } from "../Store/apislices/groupChatSlice";

const ChatHeader = ({ chat, isGroup, isNewChat, userBDetails }) => {
  const navigation = useNavigation();
  const imageSize = windowWidth * 0.15;
  const iconSize = imageSize / 1.5;

  const [deleteGroup, { isLoading: deletingGroup }] = useDeleteGroupMutation();

  const { status } = useGetUserStatus(userBDetails?.id);
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  const { GetOrCreateCall } = useStreamCall(
    userBDetails?.id,
    chat?.participants
  );

  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const ToggleCallPress = () => setShowCallDialog(!showCallDialog);
  const ToggleOptionsMenu = () => setShowOptionsMenu(!showOptionsMenu);

  const handleCallPress = () => GetOrCreateCall();

  // Delete Group Handler
  const handleDeleteGroup = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteGroup = async () => {
    try {
      const response = await deleteGroup({
        chatId: chat.chatId,
        requesterId: userId,
      });

      if (response?.data) {
        // Alert.alert("", response?.data?.message);
        setShowDeleteConfirm(false);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("", error.message);
    }
  };

  const handleEditGroup = () => {
    navigation.navigate("EditGroupScreen", { chat });
    setShowOptionsMenu(false);
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

    return () => setUserOffline(userId);
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#5bbbdf",
        height: 80,
        padding: 20,
        width: windowWidth,
        maxWidth: windowWidth,
      }}
    >
      {/* Left - Back & User Info */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.iconButton}
        >
          <MaterialIcons name="keyboard-arrow-left" size={34} color="white" />
        </TouchableOpacity>

        <Image
          source={
            chat?.isGroup
              ? { uri: chat.groupAvatar }
              : isNewChat
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

        <View style={{ maxWidth: windowWidth * 0.3 }}>
          <Text
            numberOfLines={1}
            style={{ fontWeight: "bold", color: "white", fontSize: 16 }}
          >
            {chat?.isGroup
              ? chat?.groupName
              : chat?.sender || chat?.userName || userBDetails?.userName}
          </Text>
          <Text style={{ fontSize: 12, color: "#fff", marginTop: 2 }}>
            {status?.online ? "Online" : "Offline"}
          </Text>
        </View>
      </View>

      {/* Right - Call & Options */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity onPress={handleCallPress} style={styles.iconButton}>
          <Feather name="phone-call" size={24} color="white" />
        </TouchableOpacity>

        {/* Options menu only for groups */}
        {chat?.isGroup && chat.chatId === userId && (
          <TouchableOpacity
            onPress={ToggleOptionsMenu}
            style={styles.iconButton}
          >
            <Feather name="more-vertical" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* ================= OPTIONS MENU ================= */}
      {showOptionsMenu && (
        <Modal transparent animationType="fade">
          <Pressable style={{ flex: 1 }} onPress={ToggleOptionsMenu} />
          <View
            style={{
              position: "absolute",
              top: 70,
              right: 20,
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 10,
              width: windowWidth * 0.4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <TouchableOpacity
              onPress={handleEditGroup}
              style={{ paddingVertical: 10 }}
            >
              <Text>Edit Group</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteGroup}
              style={{ paddingVertical: 10 }}
            >
              <Text style={{ color: "red" }}>Delete Group</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {showDeleteConfirm && (
        <Modal transparent animationType="fade">
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
            onPress={() => setShowDeleteConfirm(false)}
          />
          <View
            style={{
              position: "absolute",
              top: "40%",
              left: "10%",
              right: "10%",
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}
            >
              Are you sure you want to delete this group?
            </Text>
            <View style={{ flexDirection: "row", gap: 20 }}>
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(false)}
                style={{
                  padding: 10,
                  backgroundColor: "#ccc",
                  borderRadius: 8,
                }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDeleteGroup}
                style={{
                  padding: 10,
                  backgroundColor: "red",
                  borderRadius: 8,
                }}
              >
                {deletingGroup ? (
                  <ActivityIndicator size={"small"} color={"#fff"} />
                ) : (
                  <Text style={{ color: "#fff" }}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ChatHeader;

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5bbbdf",
    opacity: 0.7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});
