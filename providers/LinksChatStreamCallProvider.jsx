import { useEffect, useState } from "react";
import { useCalls } from "@stream-io/video-react-native-sdk";
import { useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { customNavigation } from "../App";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LinksChatStreamCallProvider = ({ children }) => {
  const route = useRoute();
  const { top } = useSafeAreaInsets();
  const isOnCallScreen = route.name === "CallScreen";
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  const calls = useCalls();
  const call = calls[0];

  useEffect(() => {
    if (!call) {
      return;
    }

    setTimeout(() => {
      customNavigation("CallScreen", { callId: call.id });
    }, 2000);
  }, [call, isOnCallScreen]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {call && !isOnCallScreen && (
        <Pressable
          onPress={() => customNavigation("CallScreen", { callId: call.id })}
          style={{
            position: "absolute",
            backgroundColor: "lightgreen",
            top: top + 40,
            left: 0,
            right: 0,
            padding: 10,
          }}
        >
          <Text>
            Call: {call.id} ({call.state.callingState})
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default LinksChatStreamCallProvider;
