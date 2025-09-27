import { FlatList, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import { useSelector } from "react-redux";
import {
  useGetChatsQuery,
  useGetGroupChatsQuery,
} from "../Store/apislices/chatApiSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import DeleteChatHeader from "../Components/DeleteChatHeader";
import firestore from "@react-native-firebase/firestore";
import FloatingActionButton from "../Components/FloatingActionButton";
import GroupMessage from "../Components/GroupMessage";

const GroupChats = () => {
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  console.log("user id at group chats =>> ", userId);

  const [chatsToDelete, setChatsToDelete] = useState([]);
  const [chats, setChats] = useState([]);

  // get all chats
  const {
    data: userChats,
    refetch: refetchUserChats,
    isLoading: loadingChats,
  } = useGetGroupChatsQuery({
    userId,
  });

  // refresh chats
  const handleRefresh = async () => {
    try {
      await refetchUserChats();
    } catch (err) {
      // console.error("Refetch failed:", err);
    }
  };

  // useEffect(() => {
  //   if (!userId) return;

  //   const unsubscribe = firestore()
  //     .collection("chats")
  //     .where("participants", "array-contains", userId)
  //     .onSnapshot((querySnapshot) => {
  //       const chats = [];

  //       querySnapshot.forEach((doc) => {
  //         chats.push({ id: doc.id, ...doc.data() });
  //       });

  //       setChats(chats.filter((item) => item.isGroup === true)); // Update your state with fetched chats
  //     });

  //   return () => unsubscribe();
  // }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestore()
      .collection("chats")
      .where("participants", "array-contains", userId)
      .onSnapshot((querySnapshot) => {
        const groupchats = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            groupName: data?.groupName || null,
            isGroup: data?.isGroup || false,
            participants: data?.participants || [],
            createdAt: data?.createdAt?.toDate?.() || null,
            createdBy: data?.createdBy || null,
            updatedAt: data?.updatedAt?.toDate?.() || null,
            lastMessage: data?.lastMessage || null,
            unreadCounts: data?.unreadCounts || {},
          };
        });

        // if you still want only direct (1-1) chats:
        const filteredChats = groupchats.filter(
          (item) => item.isGroup === true
        );

        console.log(
          "first chat from firestore at groupchats===>>> ",
          groupchats[0]
        );

        // setChats(filteredChats);
      });

    return () => unsubscribe();
  }, [userId]);

  // set chat messages from messagesFromChat

  console.log("userChats.data at groupchats ===>> ", userChats?.data);

  useEffect(() => {
    if (userChats?.data?.length > 0) {
      const filteredChats = userChats.data.filter(
        (item) => item.isGroup === true
      );
      setChats(filteredChats);
    }
  }, [userChats]);

  if (loadingChats) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"small"} color={"blue"} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: "white",
        flex: 1,
        flexGrow: 1,
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

      {!loadingChats && chats.length === 0 && (
        <View style={{}}>
          <Text style={{ margin: 20 }}>
            You don't have an active group. Create one by clicking on the add
            button below.
          </Text>
        </View>
      )}
      <FlatList
        data={chats}
        renderItem={({ item }) => (
          <GroupMessage
            loadingChats={loadingChats}
            item={item}
            chatsToDelete={chatsToDelete}
            setChatsToDelete={setChatsToDelete}
          />
        )}
        keyExtractor={(item) => item?.chatId?.toString()}
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}
        refreshing={loadingChats}
        onRefresh={handleRefresh}
      />

      {/* floating chat icon */}
      <FloatingActionButton />
    </SafeAreaView>
  );
};

export default GroupChats;
