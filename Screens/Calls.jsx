import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Header from "../Components/Header";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Chat from "../Components/FloatingActionButton";
import { SafeAreaView } from "react-native-safe-area-context";

const Calls = () => {
  return (
    <SafeAreaView style={{ backgroundColor: "white", flex: 1 }}>
      <Header />
      <Text
        style={{
          marginTop: 60,
          fontSize: 24,
          fontWeight: "bold",
          color: "gray",
          marginHorizontal: 20,
          marginBottom: 10,
          textAlign: "center",
          fontFamily: "regular",
        }}
      >
        Calls Screen
      </Text>
      <Chat />
    </SafeAreaView>
  );
};

export default Calls;

const styles = StyleSheet.create({});
