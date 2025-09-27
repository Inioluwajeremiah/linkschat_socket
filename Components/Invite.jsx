import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { windowWidth } from "../utils/Dimensions";
import FontAwesome from "@expo/vector-icons/FontAwesome";
const Invite = ({ item }) => {
  const imageSize = windowWidth * 0.15;

  if (item?.name === " null" && !item?.phoneNumbers) {
    return null;
  } else {
    return (
      <View
        style={{
          width: "100%",
          backgroundColor: "white",
          marginTop: 20,
          alignSelf: "center",
          borderRadius: 16,
          height: 90,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          // Android Shadow
          elevation: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {item?.image ? (
            <Image
              source={item?.image}
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: imageSize,
                borderWidth: 1,
                borderColor: "#ccc",
              }}
            />
          ) : (
            <FontAwesome name="user-circle" size={imageSize} color="#5bbbdf" />
          )}
          <View style={{ maxWidth: windowWidth * 0.5 }}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 14,
                marginLeft: 10,
                fontFamily: "regular",
              }}
            >
              {item?.name}
            </Text>
            <Text
              style={{
                fontSize: 14,
                marginLeft: 10,
                fontFamily: "regular",
                marginTop: 4,
              }}
            >
              {/* {item?.phoneNumbers[0]?.number} */}
              {item?.phoneNumbers ? item?.phoneNumbers[0]?.number : ""}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: "#5bbbdf",
            borderRadius: 10,
            padding: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 14,
              color: "white",
              textAlign: "center",
              fontFamily: "regular",
            }}
          >
            Invite
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
};

export default Invite;

const styles = StyleSheet.create({});
