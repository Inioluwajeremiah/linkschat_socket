import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import AllRegisteredUsersScreen from "./AllRegisteredUsersScreen";
import { useCreateGroupMutation } from "../Store/apislices/messageApiSlice";
import { useSelector } from "react-redux";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useNavigation } from "@react-navigation/native";

const AddNewGroup = () => {
  const navigation = useNavigation();
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;
  const [showModal, setShowModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState("");

  const [createGroup, { isLoading: creatingGroup, error: errorCreatingGroup }] =
    useCreateGroupMutation();

  const handleCreateGroup = async () => {
    const body = {
      chatId: userId,
      groupName: groupName,
      participants: selectedMembers,
      senderId: userId,
      content: "hello",
      status: "SENT",
    };
    try {
      const response = await createGroup(body);
      console.log(" handleCreateGroup body ===>> ", body);
      console.log(" handleCreateGroup response ===>> ", response);
      if (response?.error) {
      }

      if (response?.data) {
        Alert.alert("", response?.data?.message);
        navigation.goBack();
      }
    } catch (error) {
      console.log("error ==>> ", error.message);
      Alert.alert("", error.message);
    }
  };

  if (showModal) {
    return (
      <AllRegisteredUsersScreen
        fromAddNewGroup={true}
        setShowModal={setShowModal}
        selectedMembers={selectedMembers}
        setSelectedMembers={setSelectedMembers}
      />
    );
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: "white",
        flex: 1,
      }}
    >
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* header */}
        <View style={{ paddingHorizontal: 16, flexDirection: "row" }}>
          <TouchableOpacity
            style={{
              paddingTop: 20,
              position: "absolute",
              left: 16,
              top: 0,
            }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} />
          </TouchableOpacity>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              fontFamily: "regular",
              marginHorizontal: 20,
              textAlign: "center",
              paddingTop: 20,
              flex: 1,
            }}
          >
            Add New Group
          </Text>
        </View>

        <View style={{ position: "relative" }}>
          <View
            style={{
              width: 130,
              height: 130,
              borderWidth: 1,
              borderRadius: 65,
              borderColor: "#ccc",

              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 50,
              zIndex: -1,
            }}
          >
            <FontAwesome name="user-circle" size={64} color="#5bbbdf" />
          </View>

          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 20,
              position: "absolute",
              top: 140,
              right: 130,
              backgroundColor: "white",
              zIndex: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Entypo name="plus" size={30} color="#5bbbdf" />
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginTop: 40,
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              marginBottom: 10,

              fontFamily: "regular",
            }}
          >
            Group Name
          </Text>
          <TextInput
            placeholderTextColor={"gray"}
            placeholder="Group Name"
            onChangeText={(e) => setGroupName(e)}
            value={groupName}
            style={{
              height: 50,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 5,
              fontSize: 16,
              paddingHorizontal: 10,
              marginBottom: 10,
              backgroundColor: "white",
            }}
          />

          {/* add member button */}
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{
              width: "100%",
              height: 50,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
              backgroundColor: "#f0f0f0",
              marginTop: 10,
              marginBottom: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "regular",
                textAlign: "center",
              }}
            >
              {"Add Member(s)"} {selectedMembers.length}
            </Text>
          </TouchableOpacity>

          {/* create group button */}
          <TouchableOpacity
            disabled={selectedMembers.length > 0 ? false : true}
            onPress={handleCreateGroup}
            style={{
              backgroundColor: selectedMembers.length > 0 ? "#5bbbdf" : "#aaa",
              padding: 12,
              borderRadius: 10,
              marginTop: 20,
              // justifyContent:"center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              // Android Shadow
              elevation: 3,
            }}
          >
            {creatingGroup ? (
              <ActivityIndicator size={"small"} color={"#fff"} />
            ) : (
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                  fontFamily: "regular",
                }}
              >
                Create Group
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddNewGroup;
