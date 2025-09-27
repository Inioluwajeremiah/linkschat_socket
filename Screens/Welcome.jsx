import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { windowHeight, windowWidth } from "../utils/Dimensions";

const Welcome = ({ navigation }) => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        style={{
          flex: 1,
          padding: 20,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Image
          style={{ height: windowHeight * 0.3, objectFit: "contain" }}
          source={require("../assets/welcome.png")}
        />

        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 10,
            color: "#000",
            marginHorizontal: 30,
            fontFamily: "regular",
            textAlign: "center",
          }}
        >
          Welcome to LINKSCHAT
        </Text>
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 10,
                color: "#5bbbdf",
                marginHorizontal: 30,
                fontFamily: "regular",
                textAlign: "center",
              }}
            >
              Now Discuss Anything
            </Text>
            <Text></Text>
          </View>
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                marginBottom: 10,
                color: "gray",

                fontFamily: "regular",
                textAlign: "center",
              }}
            >
              Create conferences, invite people, discuss anything together{" "}
            </Text>
            <Image
              style={{ width: 80, height: 80, borderRadius: 40 }}
              source={require("../assets/newlogo.jpeg")}
            ></Image>
          </View>
          {/* next button */}
          <TouchableOpacity
            style={{
              width: windowWidth - 40,
              marginTop: 20,
              backgroundColor: "#5bbbdf",
              alignSelf: "center",
              borderRadius: 10,
              height: 50,
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              // Android Shadow
              elevation: 5,
            }}
            onPress={() => navigation.navigate("PrivacyPolicy")}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
                fontFamily: "regular",
              }}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Welcome;
