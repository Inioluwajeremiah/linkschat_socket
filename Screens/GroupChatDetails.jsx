import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ChatHeader from "../Components/ChatsHeader";
import RenderChats from "../Components/RenderChat";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { windowHeight, windowWidth } from "../utils/Dimensions";
import { Colors } from "../utils/Colors";
import DeleteMessageHeader from "../Components/DeleteMessageHeader";
import useUpdateMessageStatus from "../hooks/useUpdateMessageStatus";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSocket } from "../socket/useSocket";
import LoadingSpinner from "../Components/LoadingSpinner";
import {
  useCreateGroupMessageMutation,
  useGetGroupChatQuery,
  useSendGroupMessageMutation,
} from "../Store/apislices/groupChatSlice";
import GroupChatHeader from "../Components/GroupChatsHeader";
import { getToken } from "@react-native-firebase/messaging";

// import { FlatList } from "react-native-gesture-handler";

const GroupChatDetails = ({ route }) => {
  const { updateMessage } = useUpdateMessageStatus();
  const { socket, sendMessage, joinChat } = useSocket();
  // const { item, loadingChats, isNewChat, userBDetails } = route.params;
  const { chatId, loadingChats, isNewChat, userBDetails } = route.params;

  // get userB || receiver status
  // const { status, loading } = useGetUserStatus(userBId);
  const amount = useSelector((state) => state.amount.amount);
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  // const userBId = isNewChat
  //   ? item?.id
  //   : item?.participants?.find((item) => item !== userId);

  const scrollViewRef = useRef(null);
  const buttonSize = windowWidth <= 500 ? 40 : windowWidth * 0.1;
  const iconSize = buttonSize / 1.3;

  // const [createGroupMessage, { isLoading: creatingMessage }] =
  //   useCreateGroupMessageMutation();

  const [sendGroupMessage, { isLoading: sendingMessage }] =
    useSendGroupMessageMutation();

  // isNewChat is true in UserCard in AllRegisteredUsersScreen
  // // isNewChat is false in Message component in Messages.jsx
  // const { data: messagesFromChat, isLoading: loadingMessagesFromChat } =
  //   useGetChatMessagesQuery({
  //     senderId: userId,
  //     receiverId: userBId,
  //   });

  const {
    data: groupChat,
    isLoading,
    isError,
  } = useGetGroupChatQuery({ chatId, userId });

  const groupChatData = groupChat?.data;

  const [visible, setVisible] = React.useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [messagesToDelete, setMessagesToDelete] = useState([]);

  const toast = () => {
    Toast.show({
      type: "success",
      text1: "Success!",
      text2: `Your current balance is $${amount?.toFixed(2)}`,
    });
  };

  const handleSendMessage = async () => {
    if (!userId || !chatId) {
      Alert.alert("", "User ID or Chat ID is missing");
      return;
    }

    if (!textMessage.trim()) return;

    // 1. Create temporary message (optimistic UI)
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      chatId: chatId,
      groupName: groupChatData.groupName,
      participants: groupChatData.participants,
      senderId: userId,
      content: textMessage,
      status: "SENDING",
      createdAt: {
        _seconds: Math.floor(Date.now() / 1000),
        _nanoseconds: 0,
      },
      updatedAt: null,
    };

    // 2. Update UI immediately
    setChatMessages((prev) => [...prev, tempMessage]);
    setTextMessage("");

    // 3. Send via WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "NEW_GROUP_MESSAGE",
          chatId,
          message: tempMessage,
          clientTempId: tempId, // for reconciliation
        })
      );
    }

    try {
      // 4. Persist to database

      // {
      //   chatId: chatId,
      //   groupName: groupChatData.groupName,
      //   participants: groupChatData.participants,
      //   senderId: userId,
      //   content: tempMessage.content,
      //   status: "SENT",
      //   messageType: "text",
      // }
      // const body = {
      //   creatorId: groupChatData?.messages[0].senderId,
      //   senderId: userId,
      //   content: tempMessage.content,
      //   groupName: groupChatData.groupName,
      //   participants: groupChatData.participants,
      //   status: "SENT",
      //   groupAvatar: groupChatData.groupAvatar,
      //   file: "",
      // };

      const body = {
        chatId: chatId,
        senderId: userId,
        content: tempMessage.content,
        file: "",
        status: "SENT",
        fcmToken: getToken(),
      };
      const response = await sendGroupMessage(body);
      const savedMessage = response?.data?.data?.message;

      if (savedMessage) {
        // 5. Replace temp message with DB message
        setChatMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? savedMessage : msg))
        );
      }

      if (response?.data?.data?.chat?.chatId) {
        // setChatId(response.data.data.chat.chatId);
      }
    } catch (error) {
      // console.error("Failed to send group message:", error);

      // 6. Mark temp message as failed
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "FAILED" } : msg
        )
      );
    }
  };

  // useEffect(() => {
  //   if (item) {
  //     setChatId(item.chatId);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (!userId || !chatId) return;

  //   const unsubscribe = firestore()
  //     .collection("groups")
  //     .doc(chatId)
  //     .collection("messages")
  //     .orderBy("createdAt", "asc") // use 'desc' for latest first
  //     .onSnapshot((querySnapshot) => {
  //       const messages = [];

  //       querySnapshot.forEach((doc) => {
  //         messages.push({ id: doc.id, ...doc.data() });
  //       });

  //       setChatMessages(messages);
  //       dispatch(setRefetchChat(true));
  //     });

  //   return () => unsubscribe();
  // }, [userId, chatId]);

  useEffect(() => {
    if (groupChatData?.messages) {
      setChatMessages(groupChatData?.messages);
    }
  }, [groupChatData?.messages]);

  // update message status to delivered when the chat details screen is opened
  useEffect(() => {
    const updateMessageStatus = async () => {
      if (userId) {
        // update SENT or DELIVERED messages to READ
        try {
          await updateMessage(chatId, userId, true, "READ");
        } catch (error) {
          Alert.alert("", error.message);
        }
      }
    };
    updateMessageStatus();
  }, [userId, chatId, chatMessages]);

  // socket joins chat
  useEffect(() => {
    if (!chatId || !userId) return;

    joinChat(chatId);
  }, [chatId, userId]);

  // socket listens to incoming message
  useEffect(() => {
    if (!socket) return;

    const onMessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "NEW_GROUP_MESSAGE" && data.chatId === chatId) {
        setChatMessages((prev) => [...prev, data.message]);
      }
    };

    socket.addEventListener("message", onMessage);

    return () => socket.removeEventListener("message", onMessage);
  }, [socket, chatId]);

  const scrollToBottom = () => {
    if (scrollViewRef?.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  // scroll to bottom when the component mounts
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{
        backgroundColor: "white",
        flex: 1,
      }}
    >
      {messagesToDelete.length > 0 ? (
        <DeleteMessageHeader
          noOfMessagesSelected={messagesToDelete.length}
          messagesToDelete={messagesToDelete}
          setMessagesToDelete={setMessagesToDelete}
          // chatId={item?.chatId}
          chatId={chatId}
        />
      ) : (
        <GroupChatHeader
          chat={groupChatData?.chat}
          isNewChat={isNewChat}
          isAdmin={groupChatData?.messages[0].senderId === userId}
          userBDetails={userBDetails}
          isGroup={true}
        />
      )}
      {/* <ImageBackground
        // source={require("../assets/background.jpg")}
        style={{
          flex: 1,
          // backgroundColor: "red",
        }}
      > */}
      <View
        style={{
          flex: 1,
        }}
      >
        {/* {loadingMessagesFromChat ? (
              <LoadingSpinner size={"small"} color={Colors.primaryColor} />
            ) : ( */}

        {isLoading && (
          <View style={{ marginTop: 100 }}>
            <LoadingSpinner size={"small"} color={Colors.primaryColor} />
          </View>
        )}

        {/* chat date */}
        {groupChatData?.time && (
          <Text
            style={{
              alignSelf: "center",
              color: "gray",
              fontFamily: "regular",
              marginHorizontal: 30,
              backgroundColor: "white",
              borderWidth: 0.5,
              marginTop: 10,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
            }}
          >
            {groupChatData?.time}
          </Text>
        )}
        {/* <Text>{item?.chatId}</Text>
                <Text>{chatId}</Text> */}

        <FlatList
          ref={scrollViewRef}
          onContentSizeChange={scrollToBottom}
          data={chatMessages}
          renderItem={({ item }) => (
            <RenderChats
              item={item}
              userId={userId}
              messagesToDelete={messagesToDelete}
              setMessagesToDelete={setMessagesToDelete}
            />
          )}
          keyExtractor={(item) => item?.id.toString()}
          contentContainerStyle={{}}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        />

        <KeyboardAvoidingView
          // style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "position" : undefined}
        >
          {/* bottom text input */}
          <View
            style={{
              height: 60,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
              backgroundColor: "aliceblue",
              padding: 10,
              marginHorizontal: 10,
              borderRadius: 10,
            }}
          >
            <TextInput
              placeholder="Type here..."
              value={textMessage}
              cursorColor={"gray"}
              placeholderTextColor={"gray"}
              style={{
                flex: 1,
                maxHeight: windowHeight * 0.15,
                marginRight: 10,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 10,
                paddingHorizontal: 10,
                backgroundColor: "aliceblue",
                fontFamily: "regular",
              }}
              // maxLength={100}
              textAlignVertical="top"
              multiline={true}
              onPressIn={() => setMessagesToDelete([])}
              onChangeText={(text) => setTextMessage(text)}
            />

            <TouchableOpacity
              disabled={!textMessage}
              onPress={handleSendMessage}
              style={{
                width: buttonSize,
                height: buttonSize,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* {creatingMessage ? (
                <ActivityIndicator size={"small"} />
              ) : ( */}
              <FontAwesome
                name="send"
                size={iconSize}
                color={Colors.primaryColor}
              />
              {/* )} */}
            </TouchableOpacity>

            <View>
              {/* <EmojiSelectorComponent style={{width:10,height:10}}/> */}
            </View>
          </View>
        </KeyboardAvoidingView>
        {/* </KeyboardAwareScrollView> */}
        {/* </KeyboardAvoidingView> */}
        {/* </ImageBackground> */}
      </View>
    </SafeAreaView>
  );
};
export default GroupChatDetails;
