import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import Message from "./Message";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useGetUsersQuery } from "../Store/apislices/userApiSlice";
import UserCard from "./UserCard";
import ChatCardLoadingSkeleton from "./ChatCardLoadingSkeleton";

const Messages = ({
  // userChats,
  loadingChats,
  chatsToDelete,
  setChatsToDelete,
  handleRefresh,
}) => {
  const navigation = useNavigation();
  const { userData } = useSelector((state) => state.auth);
  const { userChats } = useSelector((state) => state.chat);
  const userId = JSON.parse(userData)?.userId;

  const {
    data: allUsers,
    refetch,
    isLoading: loadingAllUsersData,
  } = useGetUsersQuery();

  const handleRefreshUsersAndChats = async () => {
    handleRefresh();
    await refetch();
  };

  console.log("userChats at Messages ===>> ", userChats);

  if (loadingChats || loadingAllUsersData) {
    return (
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <ChatCardLoadingSkeleton />
      </View>
    );
  }

  // if (!loadingChats && userChats?.length === 0) {
  //   return (
  //     <FlatList
  //       data={allUsers?.data}
  //       renderItem={({ item }) => <UserCard item={item} />}
  //       keyExtractor={(item) => item?.id?.toString()}
  //       style={{ flex: 1, paddingHorizontal: 20 }}
  //       contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
  //       ListHeaderComponent={
  //         <View>
  //           <Text>
  //             You have not initiated any conversation. Click on the button below
  //             to start conversation with your contact by inviting them
  //           </Text>
  //           <TouchableOpacity
  //             onPress={() => navigation.navigate("InviteFriends")}
  //             style={{
  //               backgroundColor: "#5bbbdf",
  //               marginTop: 20,
  //               alignSelf: "center",
  //               borderRadius: 10,
  //               marginBottom: 20,
  //               height: 50,
  //               width: "100%",
  //               justifyContent: "center",
  //               shadowColor: "#000",
  //               shadowOffset: { width: 0, height: 5 },
  //               shadowOpacity: 0.2,
  //               shadowRadius: 5,
  //               elevation: 5,
  //             }}
  //           >
  //             <Text
  //               style={{
  //                 color: "#fff",
  //                 fontSize: 18,
  //                 fontWeight: "bold",
  //                 textAlign: "center",
  //                 fontFamily: "regular",
  //               }}
  //             >
  //               Start conversation
  //             </Text>
  //           </TouchableOpacity>
  //         </View>
  //       }
  //       refreshing={loadingAllUsersData}
  //       onRefresh={handleRefreshUsersAndChats}
  //     />
  //   );
  // }

  // returns list of chats
  return (
    <FlatList
      data={userChats}
      renderItem={({ item }) => (
        <Message
          loadingChats={loadingChats}
          item={item}
          chatsToDelete={chatsToDelete}
          setChatsToDelete={setChatsToDelete}
        />
      )}
      keyExtractor={(item, index) =>
        item?.chatId?.toString() + index.toString()
      }
      style={{ flex: 1, paddingHorizontal: 20 }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      refreshing={loadingChats}
      onRefresh={handleRefresh}
    />
  );
};

export default React.memo(Messages);
