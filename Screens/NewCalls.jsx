import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import Histories from "../Components/Histories";
import Call from "../Components/Call";
import Search from "../Components/Search";
import { SafeAreaView } from "react-native-safe-area-context";
import CallHistoryHeader from "../Components/CallHistoryHeader";

const NewCalls = () => {
  const [show, setShow] = useState(false);
  return (
    <SafeAreaView
      style={{
        backgroundColor: "white",
        flex: 1,
      }}
    >
      <CallHistoryHeader />

      {/* <Call /> */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          marginTop: 10,
          marginLeft: 20,
          marginBottom: 10,
          color: "#243c56",
          fontFamily: "regular",
        }}
      >
        Recent calls
      </Text>
      <Histories />
    </SafeAreaView>
  );
};

export default NewCalls;

const styles = StyleSheet.create({});
