import { View, Text } from "react-native";
import React from "react";
import { StreamVideoRN } from "@stream-io/video-react-native-sdk";

await StreamVideoRN.onPushLogout();

const Logout = () => {
  return (
    <View>
      <Text>Logout</Text>
    </View>
  );
};

export default Logout;
