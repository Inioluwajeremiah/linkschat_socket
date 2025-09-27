import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import Invites from "../Components/Invites";
import { SafeAreaView } from "react-native-safe-area-context";

const InviteScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      {/* header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 10,
          paddingHorizontal: 20,
          gap: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("Tabs")}
          style={{
            width: 40,
            height: 40,
            borderWidth: 1,
            borderColor: "black",
            borderRadius: 20,
            opacity: 0.7,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
          }}
        >
          <MaterialIcons name="keyboard-arrow-left" size={34} color="black" />
        </TouchableOpacity>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 20,
            color: "black",
            fontFamily: "regular",
          }}
        >
          Invite Friends
        </Text>
      </View>

      <Invites />
    </SafeAreaView>
  );
};

export default InviteScreen;

const styles = StyleSheet.create({});
