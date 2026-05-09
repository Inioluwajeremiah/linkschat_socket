import { FlatList, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import FloatingActionButton from "../Components/FloatingActionButton";
import GroupMessage from "../Components/GroupMessage";
import { Colors } from "../utils/Colors";
import DeleteGroupChatHeader from "../Components/DeleteGroupChatHeader";
import { useGetGroupChatsQuery } from "../Store/apislices/groupChatSlice";

const GroupChats = () => {
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  const [chatsToDelete, setChatsToDelete] = useState([]);

  // get all chats
  const {
    data: userChats,
    refetch: refetchUserChats,
    isLoading: loadingChats,
  } = useGetGroupChatsQuery({
    userId,
  });

  const chats = userChats?.data?.filter((item) => item.isGroup === true) ?? [];

  if (loadingChats) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"small"} color={Colors.primaryColor} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: "white",
        flex: 1,
      }}
    >
      {/* header */}
      {chatsToDelete.length > 0 ? (
        <DeleteGroupChatHeader
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
        onRefresh={() => refetchUserChats()}
      />

      {/* floating chat icon */}
      <FloatingActionButton />
    </SafeAreaView>
  );
};

export default GroupChats;
