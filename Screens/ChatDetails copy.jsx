import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
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
import { useSelector, useDispatch } from "react-redux";
import {
  useCreateMessageMutation,
  useGetChatMessagesQuery,
} from "../Store/apislices/messageApiSlice";
import { windowHeight, windowWidth } from "../utils/Dimensions";
import { Colors } from "../utils/Colors";
import firestore from "@react-native-firebase/firestore";
import useGetUserStatus from "../hooks/useGetUserStatus";
import DeleteMessageHeader from "../Components/DeleteMessageHeader";
import useUpdateMessageStatus from "../hooks/useUpdateMessageStatus";
import { SafeAreaView } from "react-native-safe-area-context";
import { APIEndPoints } from "../utils/ApiEndpoints";

const ChatDetails = ({ route }) => {
  const dispatch = useDispatch();
  const { updateMessage } = useUpdateMessageStatus();
  const { item, loadingChats, isNewChat, userBDetails } = route.params;

  const [socket, setSocket] = useState(null);
  // get userB || receiver status
  const { status, loading } = useGetUserStatus(userBId);
  const amount = useSelector((state) => state.amount.amount);
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  const userBId = isNewChat
    ? item?.id
    : item?.participants?.find((item) => item !== userId);

  const scrollViewRef = useRef(null);
  const buttonSize = windowWidth <= 500 ? 40 : windowWidth * 0.1;
  const iconSize = buttonSize / 1.3;

  const [createMessage, { isLoading: creatingMessage }] =
    useCreateMessageMutation();

  // isNewChat is true in UserCard in AllRegisteredUsersScreen
  // // isNewChat is false in Message component in Messages.jsx
  const { data: messagesFromChat, isLoading: loadingMessagesFromChat } =
    useGetChatMessagesQuery({
      senderId: userId,
      receiverId: userBId,
    });

  const [visible, setVisible] = React.useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [messagesToDelete, setMessagesToDelete] = useState([]);
  const [chatId, setChatId] = useState(item?.chatId || "");
  const [flexToggle, setFlexToggle] = useState(false);
  const [loadingInitialChatMessages, setLoadingInitialChatMessages] =
    useState(false);
  const [behaviour, setBehaviour] = useState("height");

  const toast = () => {
    Toast.show({
      type: "success",
      text1: "Success!",
      text2: `Your current balance is $${amount?.toFixed(2)}`,
    });
  };

  const handleSendMessage = async () => {
    // 1. Pre-checks
    if (!userId || !userBId || !textMessage.trim()) return;

    // 2. Create a temporary message (optimistic UI)
    const tempId = `temp-${Date.now()}`;

    const newTextMessage = textMessage;
    setTextMessage("");

    const tempMessage = {
      id: tempId,
      content: newTextMessage,
      messageType: "text",
      status: "SENDING",
      senderId: userId,
      receiverId: userBId,
      createdAt: {
        _seconds: Math.floor(Date.now() / 1000),
        _nanoseconds: 0,
      },
      updatedAt: null,
    };

    // 3. Update UI immediately
    setChatMessages((prev) => [...prev, tempMessage]);

    // 4. Send via WebSocket FIRST
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          ...tempMessage,
          clientTempId: tempId, // helps server/client reconcile later
        })
      );
    }

    try {
      // 5. Persist to database
      const response = await createMessage({
        senderId: userId,
        receiverId: userBId,
        // content: tempMessage.content,
        content: newTextMessage,
        status: "SENT",
        messageType: "text",
      });

      const savedMessage = response?.data?.data?.message;

      if (savedMessage) {
        // 6. Replace temp message with DB message
        setChatMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? savedMessage : msg))
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      // 7. Mark message as failed
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "FAILED" } : msg
        )
      );
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef?.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  // set chat messages from messagesFromChat
  // useEffect(() => {
  //   if (messagesFromChat?.data?.length > 0) {
  //     setChatMessages(messagesFromChat.data);
  //   }
  // }, [messagesFromChat]);

  useEffect(() => {
    const ws = new WebSocket(APIEndPoints.SOCKET_URL);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      ws.send(
        JSON.stringify({
          type: "REGISTER",
          userId: userId,
        })
      );
    };

    // ws.onmessage = (event) => {
    //   console.log("Message:", event.data);
    //   setChatMessages((prev) => [...prev, event.data]);
    // };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "NEW_MESSAGE") {
        setChatMessages((prev) => [...prev, data.message]);
      }
    };

    ws.onerror = (error) => {};

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    setSocket(ws);

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (item?.messages?.length > 0) {
      setLoadingInitialChatMessages(true);
      setChatMessages(item?.messages);
      setLoadingInitialChatMessages(false);
    }
  }, [item?.messages]);

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

  useEffect(() => {
    if (!chatId || !userId) return;

    const unsubscribe = firestore()
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .where("receiverId", "==", userId)
      .where("status", "==", "SENT")
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          snapshot.forEach((docSnap) => {
            docSnap.ref.update({ status: "DELIVERED", updatedAt: Date.now() });
          });
        }
      });

    return () => unsubscribe();
  }, [chatId, userId, chatMessages]);

  // useEffect(() => {
  //   const showListener = Keyboard.addListener("keyboardDidShow", () => {
  //     setBehaviour("height");
  //   });
  //   const hideListener = Keyboard.addListener("keyboardDidHide", () => {
  //     setBehaviour(undefined);
  //   });

  //   return () => {
  //     showListener.remove();
  //     hideListener.remove();
  //   };
  // }, []);

  // scroll to bottom when the component mounts
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (item) {
      setChatId(item.chatId);
    }
  }, []);

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
        <ChatHeader
          chat={item}
          isNewChat={isNewChat}
          userBDetails={userBDetails}
        />
      )}
      <ImageBackground
        // source={require("../assets/background.jpg")}
        style={{
          flex: 1,
          // backgroundColor: "red",
        }}
      >
        {/* {loadingMessagesFromChat ? (
            <LoadingSpinner size={"small"} color={Colors.primaryColor} />
          ) : ( */}

        {/* {loadingInitialChatMessages && (
          <View style={{ marginTop: 100 }}>
            <LoadingSpinner size={"small"} color={Colors.primaryColor} />
          </View>
        )} */}

        {/* chat date */}
        {item?.time && (
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
            {item?.time}
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
          keyExtractor={(item, index) =>
            item?.id.toString() +
            item?.createdAt?._seconds.toString() +
            index.toString()
          }
          contentContainerStyle={{}}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          initialNumToRender={15} // render first 15 instantly
          maxToRenderPerBatch={10} // load in small batches
          windowSize={10} // how many screens worth of rows to render
          removeClippedSubviews={true} // recycle offscreen items
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
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ChatDetails;

const styles = StyleSheet.create({});
