import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import firestore from "@react-native-firebase/firestore";

import ChatHeader from "../Components/ChatsHeader";
import RenderChats from "../Components/RenderChat";
import DeleteMessageHeader from "../Components/DeleteMessageHeader";

import {
  useCreateMessageMutation,
  useGetChatMessagesQuery,
} from "../Store/apislices/messageApiSlice";

import useGetUserStatus from "../hooks/useGetUserStatus";
import useUpdateMessageStatus from "../hooks/useUpdateMessageStatus";
import { windowHeight, windowWidth } from "../utils/Dimensions";
import { Colors } from "../utils/Colors";
import { APIEndPoints } from "../utils/ApiEndpoints";
import { useSocket } from "../socket/useSocket";

const ChatDetails = ({ route }) => {
  const { item, isNewChat, userBDetails } = route.params;
  const { socket, sendMessage, joinChat } = useSocket();
  const { userData } = useSelector((state) => state.auth);
  const amount = useSelector((state) => state.amount.amount);
  const userId = userData ? JSON.parse(userData)?.userId : null;

  const userBId = isNewChat
    ? item?.id
    : item?.participants?.find((id) => id !== userId);

  const scrollViewRef = useRef(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [textMessage, setTextMessage] = useState("");
  const [messagesToDelete, setMessagesToDelete] = useState([]);
  const [chatId, setChatId] = useState(item?.chatId || "");
  const [loadingInitialChatMessages, setLoadingInitialChatMessages] =
    useState(false);

  const { updateMessage } = useUpdateMessageStatus();
  const { status: userBStatus } = useGetUserStatus(userBId);

  const [createMessage] = useCreateMessageMutation();
  const { data: messagesFromChat } = useGetChatMessagesQuery({
    senderId: userId,
    receiverId: userBId,
  });

  const buttonSize = windowWidth <= 500 ? 40 : windowWidth * 0.1;
  const iconSize = buttonSize / 1.3;

  /** Show toast for amount */
  const showToast = useCallback(() => {
    Toast.show({
      type: "success",
      text1: "Success!",
      text2: `Your current balance is $${amount?.toFixed(2)}`,
    });
  }, [amount]);

  /** Scroll FlatList to bottom */
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

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

      if (data.type === "NEW_MESSAGE" && data.chatId === chatId) {
        setChatMessages((prev) => [...prev, data.message]);
      }
    };

    socket.addEventListener("message", onMessage);

    return () => socket.removeEventListener("message", onMessage);
  }, [socket, chatId]);

  /** Load initial messages */
  useEffect(() => {
    if (messagesFromChat?.data?.length > 0) {
      setLoadingInitialChatMessages(true);
      setChatMessages(messagesFromChat.data);
      setLoadingInitialChatMessages(false);
    }
  }, [messagesFromChat]);

  /** Update message status to READ */
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (userId && chatId) {
        try {
          await updateMessage(chatId, userId, true, "READ");
        } catch (error) {
          Alert.alert("Error", error.message);
        }
      }
    };
    markMessagesAsRead();
  }, [userId, chatId, chatMessages]);

  /** Listen for messages to mark DELIVERED in Firestore */
  useEffect(() => {
    if (!chatId || !userId) return;

    const unsubscribe = firestore()
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .where("receiverId", "==", userId)
      .where("status", "==", "SENT")
      .onSnapshot((snapshot) => {
        snapshot.forEach((docSnap) => {
          docSnap.ref.update({ status: "DELIVERED", updatedAt: Date.now() });
        });
      });

    return () => unsubscribe();
  }, [chatId, userId]);

  /** Scroll to bottom when messages update */
  useEffect(scrollToBottom, [chatMessages]);

  /** Set chatId if provided */
  useEffect(() => {
    if (item?.chatId) setChatId(item.chatId);
  }, [item?.chatId]);

  /** Handle sending a message */
  const handleSendMessage = async () => {
    if (!userId || !userBId || !textMessage.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      type: "NEW_MESSAGE",
      id: tempId,
      content: textMessage,
      messageType: "text",
      status: "SENDING",
      senderId: userId,
      receiverId: userBId,
      createdAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
      updatedAt: null,
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setTextMessage("");

    // Send via WebSocket
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ ...newMessage, clientTempId: tempId }));
    }

    try {
      const response = await createMessage({
        senderId: userId,
        receiverId: userBId,
        content: newMessage.content,
        status: "SENT",
        messageType: "text",
      });

      const savedMessage = response?.data?.data?.message;
      if (savedMessage) {
        setChatMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? savedMessage : msg))
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "FAILED" } : msg
        )
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      {messagesToDelete.length > 0 ? (
        <DeleteMessageHeader
          noOfMessagesSelected={messagesToDelete.length}
          messagesToDelete={messagesToDelete}
          setMessagesToDelete={setMessagesToDelete}
          chatId={chatId}
        />
      ) : (
        <ChatHeader
          chat={item}
          isNewChat={isNewChat}
          userBDetails={userBDetails}
        />
      )}

      {/* Chat background */}
      <ImageBackground style={styles.background}>
        {item?.time && <Text style={styles.dateBadge}>{item.time}</Text>}

        {/* Messages List */}
        <FlatList
          ref={scrollViewRef}
          data={chatMessages}
          onContentSizeChange={scrollToBottom}
          keyExtractor={(item, index) =>
            `${item?.id}_${item?.createdAt?._seconds}_${index}`
          }
          renderItem={({ item }) => (
            <RenderChats
              item={item}
              userId={userId}
              messagesToDelete={messagesToDelete}
              setMessagesToDelete={setMessagesToDelete}
            />
          )}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews
        />

        {/* Message input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "position" : undefined}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type here..."
              value={textMessage}
              multiline
              textAlignVertical="top"
              placeholderTextColor="gray"
              cursorColor="gray"
              onChangeText={setTextMessage}
              onPressIn={() => setMessagesToDelete([])}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!textMessage.trim()}
              style={styles.sendButton}
            >
              <FontAwesome
                name="send"
                size={iconSize}
                color={Colors.primaryColor}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ChatDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  background: {
    flex: 1,
  },
  dateBadge: {
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
  },
  inputContainer: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "aliceblue",
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  textInput: {
    flex: 1,
    maxHeight: windowHeight * 0.15,
    marginRight: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "aliceblue",
    fontFamily: "regular",
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    width: windowWidth <= 500 ? 40 : windowWidth * 0.1,
    height: windowWidth <= 500 ? 40 : windowWidth * 0.1,
  },
});
