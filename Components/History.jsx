import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { windowWidth } from "../utils/Dimensions";
import { Colors } from "../utils/Colors";
import { ScrollView } from "react-native-gesture-handler";

const History = ({ item }) => {
  const imageSize = windowWidth * 0.15;
  const iconSize = imageSize / 2;

  // {
  //   callId: "call_009",
  //   participants: [
  //     { userId: "u023", userName: "Ada" },
  //     { userId: "u024", userName: "Obinna" },
  //     { userId: "u025", userName: "Rita" },
  //     { userId: "u026", userName: "Bashir" },
  //     { userId: "u027", userName: "Halima" }
  //   ],
  //   callType: "voice",
  //   direction: "outgoing",
  //   status: "connected",
  //   startedAt: "2025-06-25T08:00:00Z",
  //   endedAt: "2025-06-25T08:25:00Z",
  //   duration: 1500
  // },

  return (
    <View
      style={{
        flexDirection: "row",
        marginTop: 20,
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {/* profile image */}
      {item?.imageUrl ? (
        <Image
          source={{ uri: item?.imageUrl }}
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: imageSize / 2,
            overflow: "hidden",
          }}
        />
      ) : (
        <View
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: imageSize / 2,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="call-outline"
            color={Colors.primaryColor}
            size={imageSize / 2}
          />
        </View>
      )}

      <View
        style={{
          flex: 1,
          overflow: "hidden",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 10,
          backgroundColor: "white",
          borderRadius: 10,
          height: 60,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          // Android Shadow
          elevation: 5,
        }}
      >
        <ScrollView horizontal>
          {/* participants name */}

          {item?.participants.map((item, index) => (
            <Text
              key={index}
              style={{
                fontWeight: "bold",
                fontSize: 12,
                color: "black",
                fontFamily: "regular",
                overflow: "hidden",
              }}
            >
              {item.userName +
                `${index !== item?.participants?.length - 1 ? ", " : ""}`}
              {/* {index < item?.participants?.length - 1
                ? item.userName + ", "
                : item.userName} */}
            </Text>
          ))}
        </ScrollView>

        {/* call direction */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Feather
            name={
              item?.direction === "outgoing"
                ? "arrow-up-right"
                : "arrow-down-left"
            }
            size={iconSize / 2}
            color={item?.status === "connected" ? "green" : "red"}
          />

          {/* call start time ==>  startedAt */}
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 12,
              color: "gray",
              fontFamily: "regular",
            }}
          >
            {item.time}
          </Text>
        </View>

        {/* call type and call status color indicator icon */}
        <Ionicons
          name={
            item?.callType === "voice" ? "call-outline" : "videocam-outline"
          }
          size={iconSize}
          color={item.status === "connected" ? "green" : "red"}
        />
      </View>
    </View>
  );
};

export default History;

const styles = StyleSheet.create({});
