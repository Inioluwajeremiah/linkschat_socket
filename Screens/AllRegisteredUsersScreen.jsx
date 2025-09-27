import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetUsersQuery } from "../Store/apislices/userApiSlice";
import UserCard from "../Components/UserCard";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

const AllRegisteredUsersScreen = ({
  fromAddNewGroup,
  selectedMembers,
  setSelectedMembers,
  setShowModal,
}) => {
  const navigation = useNavigation();
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  const {
    data: allUsers,
    refetch,
    isLoading: loadingAllUsersData,
  } = useGetUsersQuery();

  const filteredData = allUsers?.data?.filter((item) => item.id !== userId);

  const handleBackButton = () => {
    if (fromAddNewGroup) {
      setShowModal(false);
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  if (loadingAllUsersData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"small"} color={"blue"} />
      </View>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* header */}

      <View
        style={{
          paddingHorizontal: 16,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          backgroundColor: "#fafafa",
        }}
      >
        {/* back button ==> action based on previous screen */}
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            position: "absolute",
            top: 0,
            left: 16,
            paddingHorizontal: 10,
            paddingTop: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={handleBackButton}
        >
          <Ionicons name="arrow-back" size={20} color={"#000"} />
        </TouchableOpacity>

        {/* title text ==>> text based on previous screen */}
        <Text
          style={{
            color: "#000",
            fontSize: 18,
            paddingHorizontal: 10,
            paddingVertical: 20,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "regular",
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {fromAddNewGroup ? "Add Member" : "Start Conversation"}
        </Text>

        {/* display number of members selected  */}
        {selectedMembers?.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              position: "absolute",
              top: 0,
              right: 16,
              paddingTop: 20,
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Text
              style={{
                color: "#000",
                fontSize: 16,
                textAlign: "center",
                fontFamily: "regular",
              }}
            >
              {selectedMembers?.length}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedMembers([])}
              style={{
                width: 40,
                height: 40,
                // borderWidth: 2,
                // borderColor: "#ccc",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="close" size={20} color={"#000"} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={{
                width: 40,
                height: 40,
                // borderWidth: 2,
                // borderColor: "#ccc",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="checkmark-outline" size={20} color={"#000"} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <UserCard
            fromAddNewGroup={true}
            item={item}
            selectedMembers={selectedMembers}
            setSelectedMembers={setSelectedMembers}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        refreshing={loadingAllUsersData}
        onRefresh={refetch}
      />
    </SafeAreaView>
  );
};

export default AllRegisteredUsersScreen;
