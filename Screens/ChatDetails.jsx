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
// import { cleanupSocket, initSocket } from "../utils/socket";
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
    if (!userId || !userBId) {
      Alert.alert("", "User ID or Receiver ID is missing");
      return;
    }
    if (userBId === userId) {
      Alert.alert("", "You cannot send a message to yourself");
      return;
    }
    try {
      const response = await createMessage({
        senderId: userId,
        receiverId: userBId,
        content: textMessage,
        status: status?.online ? "DELIVERED" : "SENT",
      });

      if (response?.data) {
        setChatId(response?.data?.data?.chat?.chatId);
        setChatMessages((prevMessages) => [
          ...prevMessages,
          response?.data?.data?.messages,
        ]);

        socket.emit("sendMessage", {
          receiverId: receiverId,
          message: response?.data?.data?.messages,
        });
      }

      setTextMessage("");

      if (response?.error) {
        Alert.alert(
          "",
          response?.error?.data?.message ||
            "Unable to send message. Please try again later"
        );
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      Alert.alert("", errorMessage);
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
    // IMPORTANT: replace localhost with your machine’s IP when testing on a device
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

    ws.onmessage = (event) => {
      console.log("Message:", event.data);
      setChatMessages((prev) => [...prev, event.data]);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

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
          paddingTop: 80,
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
          keyExtractor={(item) => item?.id.toString()}
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
              {creatingMessage ? (
                <ActivityIndicator size={"small"} />
              ) : (
                <FontAwesome
                  name="send"
                  size={iconSize}
                  color={Colors.primaryColor}
                />
              )}
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

// useEffect(() => {
//   createRoomIfNotExists();

//   let roomid = getRoomId(user?.userId, item?.userId);
//   const docRef = doc(db, "rooms", roomId);
//   const messagesRef = collection(docRef, "messages");
//   const q = query(messagesRef, orderBy("createdAt", "asc"));
//   let unsub = onSnapshot(q, (snapshot) => {
//     let allMessages =
//       snapshot.docs -
//       map((doc) => {
//         return doc.data();
//       });
//     setMessages([...allMessages]);
//   });
//   return unsub;
// }, []);

// import {
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
// } from "react-native";

// function MessageBubble({ author, message }) {
//   return (
//     <View
//       style={{
//         maxWidth: "80%",
//         borderRadius: 15,
//         padding: 10,
//         alignSelf: author === "user" ? "flex-start" : "flex-end",
//         backgroundColor: author === "user" ? "#121212" : "#007AFF",
//       }}
//     >
//       <Text style={{}}>{message}</Text>
//     </View>
//   );
// }

// export default function TabOneScreen() {
//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <View style={styles.container}>
//         <Text style={styles.title}>Chat GPT</Text>
//         <FlatList
//           data={conversation}
//           renderItem={({ item }) => <MessageBubble {...item} />}
//           keyExtractor={(_, index) => index.toString()}
//           contentContainerStyle={{
//             paddingHorizontal: 10,
//             gap: 10,
//             paddingBottom: 60,
//           }}
//           automaticallyAdjustKeyboardInsets
//         />
//         <KeyboardAvoidingView
//           // style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "position" : undefined}
//           keyboardVerticalOffset={60}
//         >
//           <TextInput
//             placeholder="write a message"
//             placeholderTextColor={"white"}
//             style={{
//               borderWidth: 1,
//               borderColor: "gray",
//               borderRadius: 10,
//               padding: 15,
//               color: "white",
//             }}
//           />
//         </KeyboardAvoidingView>
//       </View>
//     </SafeAreaView>
//   );
//   // return (
//   //   <SafeAreaView style={{ flex: 1 }}>
//   //     <View style={styles.container}>
//   //       <Text style={styles.title}>Chat GPT</Text>
//   //       <KeyboardAvoidingView
//   //         style={{ flex: 1 }}
//   //         behavior={Platform.OS === "ios" ? "padding" : undefined}
//   //         keyboardVerticalOffset={60}
//   //       >
//   //         <FlatList
//   //           data={conversation}
//   //           renderItem={({ item }) => <MessageBubble {...item} />}
//   //           keyExtractor={(_, index) => index.toString()}
//   //           contentContainerStyle={{ paddingHorizontal: 10, gap: 10 }}
//   //         />
//   //         <Input />
//   //       </KeyboardAvoidingView>
//   //     </View>
//   //   </SafeAreaView>
//   // );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
// });

// const conversation = [
//   { author: "bot", message: "Sure, what's your location?" },
//   { author: "user", message: "I'm in downtown San Francisco." },
//   {
//     author: "bot",
//     message: "Great! What type of cuisine are you in the mood for?",
//   },
//   { author: "user", message: "I'm in the mood for sushi." },
//   {
//     author: "bot",
//     message:
//       "There's a great sushi restaurant called Akiko's nearby. Would you like me to book a table for you?",
//   },
//   { author: "user", message: "Yes please, for two people at 7 pm tonight." },
//   {
//     author: "bot",
//     message:
//       "Alright, I've made a reservation at Akiko's for two people at 7 pm tonight. Enjoy your meal!",
//   },
//   {
//     author: "user",
//     message: "Thanks! Can you recommend any good bars in the area?",
//   },
//   {
//     author: "bot",
//     message:
//       "Sure, there's a great rooftop bar called Charmaine's nearby. Would you like me to give you directions?",
//   },
//   { author: "user", message: "Yes please." },
//   {
//     author: "bot",
//     message:
//       "To get to Charmaine's, head east on Market Street and turn left on Cyril Magnin Street. The bar will be on your right. Enjoy your drinks!",
//   },
//   {
//     author: "user",
//     message:
//       "Thanks! Do you have any recommendations for things to do in San Francisco?",
//   },
//   {
//     author: "bot",
//     message:
//       "There are plenty of great things to do in San Francisco. Some popular attractions include the Golden Gate Bridge, Alcatraz Island, and Fisherman's Wharf.",
//   },
//   {
//     author: "user",
//     message: "That sounds great. How do I get to the Golden Gate Bridge?",
//   },
//   {
//     author: "bot",
//     message:
//       "You can take a bus or drive to the Golden Gate Bridge. It's located at the northern end of the city, and there are several parking areas nearby.",
//   },
//   {
//     author: "user",
//     message: "Thanks! Can you recommend any good hotels in the area?",
//   },
//   {
//     author: "bot",
//     message:
//       "Sure, there are many great hotels in San Francisco. The Palace Hotel and the St. Regis San Francisco are both highly rated.",
//   },
//   {
//     author: "user",
//     message:
//       "Thanks for the recommendations! What's the weather like in San Francisco today?",
//   },
//   {
//     author: "bot",
//     message:
//       "The current temperature in San Francisco is 63°F (17°C), with mostly cloudy skies.",
//   },
//   {
//     author: "user",
//     message:
//       "Thanks for letting me know. Do you have any suggestions for indoor activities in case it starts raining?",
//   },
//   {
//     author: "bot",
//     message:
//       "Sure, some popular indoor attractions in San Francisco include the California Academy of Sciences, the San Francisco Museum of Modern Art, and the Exploratorium.",
//   },
//   {
//     author: "user",
//     message:
//       "That sounds great. Can you give me directions to the California Academy of Sciences?",
//   },
//   {
//     author: "bot",
//     message:
//       "To get to the California Academy of Sciences, take the Muni Metro K or M line to the Castro Station. From there, transfer to the 43 bus and get off at the Music Concourse stop. The academy will be just a short walk away. Enjoy your visit!",
//   },
//   {
//     author: "user",
//     message:
//       "Thanks! Do you have any recommendations for vegetarian restaurants in the area?",
//   },
//   { author: "bot", message: "bye" },
// ];
