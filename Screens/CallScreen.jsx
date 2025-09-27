import {
  RingingCallContent,
  StreamCall,
  useCallStateHooks,
  useCalls,
} from "@stream-io/video-react-native-sdk";
import { useEffect } from "react";
// import { useNavigation } from "@react-navigation/native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CallScreen = ({ navigation, route }) => {
  const calls = useCalls();
  const call = calls[0];

  useEffect(() => {
    if (!call) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Home"); // or your fallback screen
      }
    }
  }, [call, navigation]);

  if (!call) {
    // Prevent rendering anything while navigation happens
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StreamCall call={call}>
        <RingingCallContent />
      </StreamCall>
    </SafeAreaView>
  );
};

const ParticipantCountText = () => {
  const { useParticipantCount } = useCallStateHooks();
  const participantCount = useParticipantCount();

  return <Text style={{}}>Call has {participantCount} participants</Text>;
};

export default CallScreen;
