import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import icon from "./logo.jpeg";
import { windowHeight } from "../utils/Dimensions";
import { SafeAreaView } from "react-native-safe-area-context";
const Splashscreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Image source={icon} style={styles.image} />
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#5bbbdf",
          textAlign: "center",
          fontFamily: "regular",
          marginBottom: 20,
        }}
      >
        Instant Messaging Service
      </Text>
    </SafeAreaView>
  );
};

export default Splashscreen;

const styles = StyleSheet.create({
  image: {
    marginTop: windowHeight * 0.2,
    width: "100%",
    height: 200,
    resizeMode: "contain",
    borderRadius: 100,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
