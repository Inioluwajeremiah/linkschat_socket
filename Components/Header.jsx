import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import {
  default as Plus,
  default as Star,
} from "react-native-vector-icons/AntDesign";
import Group from "react-native-vector-icons/FontAwesome";
import { windowWidth } from "../utils/Dimensions";
import logo from "../assets/newlogo.jpeg";
import Search from "./Search";

const Header = ({ notDashboard, setShow }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigation = useNavigation();

  const ToggleSearch = () => {
    setShowSearch(!showSearch);
    setShowMenu(false);
  };

  const ToggleContextMenu = () => {
    setShowMenu(!showMenu);
    setShowSearch(false);
  };

  return (
    <View
      style={{ maxWidth: windowWidth, paddingHorizontal: 20, marginTop: 10 }}
    >
      {/* main header */}
      <View
        style={{
          display: "flex",
          backgroundColor: "white",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* drawer menu icon */}
        <TouchableOpacity
          onPress={() => navigation.openDrawer("Home")}
          style={{
            width: 40,
            height: 40,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            // iOS Shadow
            // justifyContent:"center",
            // alignItems:"center",
            // iOS Shadow
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            // Android Shadow
            // elevation: 5,
          }}
        >
          <MaterialIcons name="menu" size={24} color="black" />
        </TouchableOpacity>

        {/* logo and text */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            marginHorizontal: 5,
          }}
        >
          <Image source={logo} style={{ width: 40, height: 40 }} />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "black",
              fontFamily: "regular",
            }}
          >
            LinksChat
          </Text>
        </View>

        {/* search and context menu icon */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 5,
            alignItems: "center",
            marginLeft: 1,
          }}
        >
          <TouchableOpacity
            onPress={ToggleSearch}
            style={{
              width: 40,
              height: 40,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              // iOS Shadow
              // justifyContent:"center",
              // alignItems:"center",
              // iOS Shadow
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              // Android Shadow
              // elevation: 5,
            }}
          >
            <Feather name="search" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={ToggleContextMenu}
            style={{
              width: 40,
              height: 40,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",

              // iOS Shadow
              // justifyContent:"center",
              // alignItems:"center",
              // iOS Shadow
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              // Android Shadow
              // elevation: 5,
            }}
          >
            <Ionicons
              name="ellipsis-horizontal-outline"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* context menu */}
      {showMenu ? (
        <View
          style={{
            width: windowWidth * 0.45,
            height: "auto",
            backgroundColor: "white",
            justifyContent: "center",
            position: "absolute",
            top: 50,
            right: 20,
            zIndex: 100,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            // padding:20,
            // Android Shadow
            elevation: 5,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              paddingHorizontal: 10,
              paddingVertical: 5,
              gap: 10,
            }}
            onPress={() => navigation.navigate("AddNewGroup")}
          >
            <Group name="users" size={14} />
            <Text
              style={{
                fontWeight: "bold",
                marginVertical: 5,
                fontFamily: "regular",
              }}
            >
              New Group
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingVertical: 5,
              gap: 10,
            }}
          >
            <Group name="users" size={14} />
            <Text
              style={{
                fontWeight: "bold",
                marginVertical: 5,
                fontFamily: "regular",
              }}
            >
              New BroadCast
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingVertical: 5,
              gap: 10,
            }}
            onPress={() => navigation.navigate("Starred Messages")}
          >
            <Star name="staro" size={14} />
            <Text
              style={{
                fontWeight: "bold",
                marginVertical: 5,
                fontFamily: "regular",
                color: "black",
              }}
            >
              Starred Messages
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
              paddingHorizontal: 10,
              paddingVertical: 5,
              gap: 10,
            }}
            onPress={() => navigation.navigate("Invite Friends")}
          >
            <Plus name="plussquareo" size={14} />

            <Text
              style={{
                fontWeight: "bold",
                marginVertical: 5,
                fontFamily: "regular",
              }}
            >
              invite a friend
            </Text>
          </TouchableOpacity> */}
        </View>
      ) : null}

      {/* show search */}
      {showSearch && <Search setShow={ToggleSearch} />}
    </View>
  );
};

export default Header;
