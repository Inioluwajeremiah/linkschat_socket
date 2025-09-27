import { Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import Updates from "../Components/Update";
import Messages from "../Components/Messages";
import { useDispatch, useSelector } from "react-redux";
import { useGetChatsQuery } from "../Store/apislices/chatApiSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import DeleteChatHeader from "../Components/DeleteChatHeader";
import firestore from "@react-native-firebase/firestore";
import FloatingActionButton from "../Components/FloatingActionButton";
import { setUserChats } from "../Store/slices/chatSlice";

const Chats = () => {
  const { userData } = useSelector((state) => state.auth);
  const { userChatsToDelete } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const userId = JSON.parse(userData)?.userId;

  const [chatsToDelete, setChatsToDelete] = useState([]);
  const [chats, setChats] = useState([]);

  // get all chats
  const {
    data: userChats,
    refetch: refetchUserChats,
    isLoading: loadingChats,
  } = useGetChatsQuery({
    userId,
  });

  console.log("userchats at chat ===>>> ", userChats);
  // refresh chats
  const handleRefresh = async () => {
    try {
      await refetchUserChats();
    } catch (err) {
      // console.error("Refetch failed:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestore()
      .collection("chats")
      .where("participants", "array-contains", userId)
      .onSnapshot((querySnapshot) => {
        const chats = [];

        querySnapshot.forEach((doc) => {
          chats.push({ id: doc.id, ...doc.data() });
        });

        // const filteredChats = chats.filter((item) => item.isGroup === false);

        // console.log("chats in  firestore chats in useefect ==>>> ", chats[0]);

        // setChats(filteredChats); // Update your state with fetched chats
        setChats(chats);
        dispatch(setUserChats(chats));
      });

    return () => unsubscribe();
  }, [userId]);

  // useEffect(() => {
  //   if (!userId) return;

  //   const unsubscribe = firestore()
  //     .collection("chats")
  //     .where("participants", "array-contains", userId)
  //     .onSnapshot((querySnapshot) => {
  //       const userchats = querySnapshot.docs.map((doc) => {
  //         const data = doc.data();

  //         return {
  //           id: doc.id,
  //           groupName: data?.groupName || null,
  //           isGroup: data?.isGroup || false,
  //           participants: data?.participants || [],
  //           createdAt: data?.createdAt?.toDate?.() || null,
  //           createdBy: data?.createdBy || null,
  //           updatedAt: data?.updatedAt?.toDate?.() || null,
  //           lastMessage: data?.lastMessage || null,
  //           unreadCounts: data?.unreadCounts || {},
  //         };
  //       });

  //       // if you still want only direct (1-1) chats:
  //       const filteredChats = userchats.filter(
  //         (item) => item.isGroup === false
  //       );

  //       console.log("first chat from firestore ===>>> ", chats[0]);

  //       // setChats(filteredChats);
  //     });

  //   return () => unsubscribe();
  // }, [userId]);

  // set chat messages from messagesFromChat
  useEffect(() => {
    if (!loadingChats && userChats?.data?.length > 0) {
      // setChats(userChats.data.filter((item) => item.isGroup === false));
      setChats(userChats.data);
      dispatch(setUserChats(userChats.data));
    }
  }, [userChats, loadingChats]);

  return (
    <SafeAreaView
      style={{
        backgroundColor: "white",
        flex: 1,
        flexGrow: 1,
        // marginTop: 30,
      }}
    >
      {/* header */}
      {chatsToDelete.length > 0 ? (
        <DeleteChatHeader
          noOfChatsSelected={chatsToDelete.length}
          chatsToDelete={chatsToDelete}
          userId={userId}
          setChatsToDelete={setChatsToDelete}
        />
      ) : (
        <Header />
      )}
      {/* updates */}
      <Updates />

      {/* chat title and number of chats */}
      <View
        style={{
          marginHorizontal: 20,
          flexDirection: "row",
          color: "gray",
          marginVertical: 20,
          fontWeight: "bold",
        }}
      >
        <Text
          style={{
            fontFamily: "regular",
          }}
        >
          CHATS
        </Text>

        {chats.length > 0 && (
          <Text
            style={{
              fontFamily: "regular",
              marginLeft: 5,
            }}
          >
            ({chats.length})
          </Text>
        )}
      </View>
      {/* list of user chats */}
      <Messages
        // userChats={chats}
        loadingChats={loadingChats}
        chatsToDelete={chatsToDelete}
        setChatsToDelete={setChatsToDelete}
        handleRefresh={handleRefresh}
      />
      {/* floating chat icon */}
      <FloatingActionButton />
    </SafeAreaView>
  );
};

export default Chats;
