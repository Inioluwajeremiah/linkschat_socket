import { View, Text } from "react-native";
import React from "react";

const ViewUpdatesHeader = () => {
  const noOfActiveUpdates = [];

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#5bbbdf",
        height: windowHeight * 0.15,
        padding: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          // marginRight:20
        }}
      >
        {/* back arrow */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={{
            width: iconSize,
            height: iconSize,
            borderWidth: 1,
            borderColor: "#fff",
            borderRadius: 10,
            backgroundColor: "#5bbbdf",
            opacity: 0.7,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
          }}
        >
          <MaterialIcons name="keyboard-arrow-left" size={34} color="white" />
        </TouchableOpacity>

        {/* middle view - user details */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",

            gap: 10,
          }}
        >
          <Image
            source={{ uri: chat?.imageUrl }}
            style={{
              width: imageSize,
              height: imageSize,
              borderRadius: imageSize / 2,
              borderColor: "white",
              borderWidth: 1,
            }}
          />
          <View style={{}}>
            <Text
              style={{
                fontFamily: "bold",
                fontWeight: "bold",
                color: "white",
              }}
              numberOfLines={1}
            >
              {chat?.sender || chat?.userName}
              {/* {chat?.userName} */}
            </Text>
            <Text
              style={{
                fontFamily: "regular",
                marginTop: 4,
                fontSize: 12,
              }}
            >
              {chat?.isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>
      </View>

      {/* right icons */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={{
            width: iconSize,
            height: iconSize,
            borderWidth: 1,
            borderColor: "#fff",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
            backgroundColor: "#5bbbdf",
            opacity: 0.7,
          }}
        >
          <Feather name="phone-call" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={{
            width: iconSize,
            height: iconSize,
            borderWidth: 1,
            borderColor: "#fff",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            backgroundColor: "#5bbbdf",
            opacity: 0.7,
            elevation: 5,
          }}
        >
          <AntDesign name="ellipsis1" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ViewUpdatesHeader;
