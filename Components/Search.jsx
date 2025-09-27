import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";

const Search = ({ setShow }) => {
  const services = [
    {
      id: 1,
      name: "Video",
      icon: "video-camera-back",
    },
    {
      id: 2,
      name: "Audio",
      icon: "audio-file",
    },
    {
      id: 3,
      name: "Photos",
      icon: "insert-photo",
    },
    {
      id: 4,
      name: "Documents",
      icon: "document-scanner",
    },
    {
      id: 5,
      name: "Links",
      icon: "insert-link",
    },
    {
      id: 6,
      name: "Unread",
      icon: "mark-unread-chat-alt",
    },
  ];

  return (
    <View
      style={{
        marginTop: 50,
        paddingVertical: 20,

        backgroundColor: "white",
        position: "absolute",
        height: "auto",
        top: 0,
        right: 0,
        left: 0,
        zIndex: 2000,
      }}
    >
      {/* search and back button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => setShow(false)}
          style={{
            width: 40,
            height: 40,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 20,
            opacity: 0.7,
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
            marginHorizontal: 20,
          }}
        >
          <MaterialIcons name="keyboard-arrow-left" size={34} color="black" />
        </TouchableOpacity>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            paddingHorizontal: 10,

            borderRadius: 25,
            width: "70%",
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <Octicons name="search" size={24} color="#ddd" />
          <TextInput
            placeholder="Search..."
            placeholderTextColor={"gray"}
            style={{
              padding: 10,
            }}
          />
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={{ paddingBottom: 16 }}
      >
        {services.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={{
              marginTop: 20,
              marginHorizontal: 10,
              backgroundColor: "#eceded",
              padding: 5,
              height: 30,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 1,
              // Android Shadow
              elevation: 5,
              gap: 5,
            }}
          >
            <MaterialIcons name={service.icon} size={12} color="#7f8384" />
            <Text
              style={{
                fontFamily: "regular",
                fontSize: 12,
              }}
            >
              {service.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({});
