import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  Alert,
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
import { useSocket } from "../socket/useSocket";

/* -------------------------------------------------------------------------- */
/*                               CHAT INPUT                                   */
/* -------------------------------------------------------------------------- */
const ChatInput = memo(({ value, onChange, onSend }) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChange}
        multiline
        placeholder="Type here..."
        placeholderTextColor="gray"
      />
      <TouchableOpacity onPress={onSend} disabled={!value.trim()}>
        <FontAwesome name="send" size={22} color={Colors.primaryColor} />
      </TouchableOpacity>
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/*                              MAIN SCREEN                                    */
/* -------------------------------------------------------------------------- */
const ChatDetails = ({ route }) => {
  const { item, isNewChat, userBDetails } = route.params;

  /* -------------------- GLOBAL STATE -------------------- */
  const { userData } = useSelector((state) => state.auth);
  const userId = userData ? JSON.parse(userData)?.userId : null;

  const userBId = isNewChat
    ? item?.id
    : item?.participants?.find((id) => id !== userId);

  /* -------------------- SOCKET -------------------- */
  const { socket, joinChat } = useSocket();

  /* -------------------- LOCAL STATE -------------------- */
  const listRef = useRef(null);
  const lastMessageId = useRef(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [textMessage, setTextMessage] = useState("");
  const [messagesToDelete, setMessagesToDelete] = useState([]);
  const [chatId, setChatId] = useState(item?.chatId || "");
  const [isLoading, setIsLoading] = useState(true);

  /* -------------------- API -------------------- */
  const [createMessage] = useCreateMessageMutation();
  const { data: messagesFromChat } = useGetChatMessagesQuery(
    { senderId: userId, receiverId: userBId },
    { skip: !userId || !userBId }
  );

  const { updateMessage } = useUpdateMessageStatus();
  useGetUserStatus(userBId);

  /* -------------------- SOCKET JOIN -------------------- */
  useEffect(() => {
    if (chatId && userId) {
      joinChat(chatId);
    }
  }, [chatId, userId, joinChat]);

  /* -------------------- SOCKET LISTENER -------------------- */
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

  /* -------------------- INITIAL LOAD -------------------- */
  useEffect(() => {
    if (messagesFromChat?.data) {
      setChatMessages(messagesFromChat.data);
      setIsLoading(false);
    }
  }, [messagesFromChat]);

  /* -------------------- MARK READ (ONCE) -------------------- */
  useEffect(() => {
    if (!chatId || !userId) return;

    updateMessage(chatId, userId, true, "READ").catch((err) =>
      Alert.alert("Error", err.message)
    );
  }, [chatId, userId]);

  /* -------------------- DELIVERY STATUS -------------------- */
  useEffect(() => {
    if (!chatId || !userId) return;

    const unsubscribe = firestore()
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .where("receiverId", "==", userId)
      .where("status", "==", "SENT")
      .onSnapshot((snapshot) => {
        snapshot.forEach((doc) =>
          doc.ref.update({ status: "DELIVERED", updatedAt: Date.now() })
        );
      });

    return () => unsubscribe();
  }, [chatId, userId]);

  /* -------------------- SCROLL ON NEW MESSAGE -------------------- */
  useEffect(() => {
    const last = chatMessages[chatMessages.length - 1]?.id;
    if (last && last !== lastMessageId.current) {
      listRef.current?.scrollToEnd({ animated: true });
      lastMessageId.current = last;
    }
  }, [chatMessages]);

  /* -------------------- SEND MESSAGE -------------------- */
  const handleSendMessage = async () => {
    if (!textMessage.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const content = textMessage;

    const tempMessage = {
      id: tempId,
      content,
      messageType: "text",
      status: "SENDING",
      senderId: userId,
      receiverId: userBId,
      createdAt: { _seconds: Math.floor(Date.now() / 1000) },
    };

    setChatMessages((prev) => [...prev, tempMessage]);
    setTextMessage("");

    socket?.send?.(
      JSON.stringify({
        type: "NEW_MESSAGE",
        ...tempMessage,
        clientTempId: tempId,
      })
    );

    try {
      const res = await createMessage({
        senderId: userId,
        receiverId: userBId,
        content,
        status: "SENT",
        messageType: "text",
      });

      const saved = res?.data?.data?.message;
      if (saved) {
        setChatMessages((prev) =>
          prev.map((m) => (m.id === tempId ? saved : m))
        );
      }
    } catch {
      setChatMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "FAILED" } : m))
      );
    }
  };

  /* -------------------- RENDER ITEM -------------------- */
  const renderItem = useCallback(
    ({ item }) => (
      <RenderChats
        item={item}
        userId={userId}
        messagesToDelete={messagesToDelete}
        setMessagesToDelete={setMessagesToDelete}
      />
    ),
    [userId, messagesToDelete]
  );

  /* -------------------- UI -------------------- */
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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

      <View style={styles.messagesWrapper}>
        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primaryColor} />
            <Text style={styles.loadingText}>Loading messages…</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={chatMessages}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews
          />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ChatInput
          value={textMessage}
          onChange={setTextMessage}
          onSend={handleSendMessage}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatDetails;

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  messagesWrapper: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "gray" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "aliceblue",
  },
  textInput: {
    flex: 1,
    maxHeight: windowHeight * 0.15,
    marginRight: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
});
