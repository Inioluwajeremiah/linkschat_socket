import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import Header from "../Components/Header";
import Chat from "../Components/FloatingActionButton";
import Icon from "react-native-vector-icons/Feather";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import LogoutModal from "../Components/LogoutModal";

import Search from "../Components/Search";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(false);

  return (
    <SafeAreaView
      style={{
        backgroundColor: "white",
        flex: 1,
      }}
    >
      <View
        style={{
          position: "relative",
        }}
      >
        <Header setShow={setShow} />
        {show ? <Search setShow={setShow} /> : null}
      </View>

      <View>
        <ListSettings setVisible={setVisible} />
      </View>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({});

const ListSettings = () => {
  const navigation = useNavigation();

  const settingsData = [
    {
      id: "1",
      icon: "message-square",
      label: "App Language",
      onPress: () => navigation.navigate("/profile-settings"),
      sublabel: "Update your personal information",
    },
    {
      id: "2",
      icon: "message-square",
      label: "Chats",
      onPress: () => navigation.navigate("Chats"),
      sublabel: "Update your personal information",
    },
    {
      id: "3",
      icon: "image",
      label: "Wallpaper",
      onPress: () => navigation.navigate("/profile-settings"),
      sublabel: "Update your personal information",
    },
    {
      id: "4",
      icon: "users",
      label: "Invite People",
      onPress: () => navigation.navigate("Invite Friends"),
    },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity style={style.itemContainer} onPress={item.onPress}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginLeft: 20,
        }}
      >
        {item.label === "App Language" ? (
          <AntDesign name="earth" size={24} color="black" />
        ) : (
          <Feather name={item.icon} size={24} color="black" />
        )}
        <Text
          style={{
            fontFamily: "regular",
          }}
        >
          {item.label}
        </Text>
      </View>

      <Icon
        name="chevron-right"
        size={24}
        color="black"
        style={{
          marginRight: 20,
        }}
      />
    </TouchableOpacity>
  );

  return (
    <View>
      <Text
        style={{
          marginHorizontal: 20,
          fontSize: 25,
          fontFamily: "regular",
          marginTop: 50,
        }}
      >
        Settings
      </Text>
      <View style={{}}>
        <FlatList
          data={settingsData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={style.container}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Montserrat-Bold",
    color: "#000000",
  },
  sublabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Montserrat-Regular",
    color: "#000000",
  },

  title: {
    fontSize: 22,
    fontFamily: "bold",
    color: "#000",
    marginHorizontal: 20,
  },
});
