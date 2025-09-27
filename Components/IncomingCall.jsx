// import {
//   StreamCall,
//   useCalls,
//   CallingState,
//   RingingCallContent,
//   useCallStateHooks,
//   useCall,
// } from "@stream-io/video-react-native-sdk";
// import { Button, Text, View } from "react-native";
// import InCallManager from "react-native-incall-manager";
// import { useStreamCall } from "../hooks/streamCallHooks/useStreamCall";
// import { useNavigation } from "@react-navigation/native";

// const RingingSound = () => {
//   const call = useCall();
//   const isCallCreatedByMe = call?.isCreatedByMe;
//   const { useCallingState } = useCallStateHooks();
//   const callingState = useCallingState();
//   useEffect(() => {
//     if (callingState !== CallingState.RINGING) return;
//     if (isCallCreatedByMe) {
//       // play outgoing call sound
//       InCallManager.start({ media: "video", ringback: "_BUNDLE_" }); // or _DEFAULT_ or _DTMF_
//       return () => InCallManager.stopRingback();
//     } else {
//       // play incoming call sound
//       InCallManager.startRingtone("_BUNDLE_"); // or _DEFAULT_ or system filename with extension
//       return () => InCallManager.stopRingtone();
//     }
//   }, [callingState, isCallCreatedByMe]);
//   // renderless component
//   return null;
// };
// const IncomingCall = () => {
//   // collect all ringing kind of calls managed by the SDK
//   // const calls = useCalls().filter((c) => c.ringing);
//   const navigation = useNavigation();
//   const calls = useCalls();
//   const { cancelCall, leaveCall } = useStreamCall();

//   // for simplicity, we only take the first one but
//   // there could be multiple calls ringing at the same time
//   const ringingCall = calls[0];
//   // if (!ringingCall) return null;
//   if (!ringingCall) {
//     navigation.navigate("Home");
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <Text>Connecting to video service...</Text>

//         <Button onPress={cancelCall} title="End call" />
//       </View>
//     );
//   }

//   return (
//     <StreamCall call={ringingCall}>
//       <RingingSound />
//       {/* Render the content of the ringing call */}
//       <RingingCallContent />
//     </StreamCall>
//   );
// };

// export default IncomingCall;

import { useNavigation } from "@react-navigation/native";
import {
  CallingState,
  IncomingCall,
  OutgoingCall,
  StreamCall,
  StreamVideoClient,
  useCall,
  useCalls,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import { useStreamCall } from "../hooks/streamCallHooksDelete/useStreamCall";
import { APIEndPoints } from "../utils/ApiEndpoints";
import { useGetStreamUserCredential } from "../hooks/streamCallHooksDelete/useGetStreamUserCredential";
import { Alert } from "react-native";

const CallPanel = ({}) => {
  const { token, userName, userId } = useGetStreamUserCredential();

  const apiKey = APIEndPoints.STREAM_API_KEY;
  const client = StreamVideoClient.getOrCreateInstance({
    apiKey,
    user: { id: userId, name: userName },
    token: token,
    options: {
      maxConnectUserRetries: 3,
      onConnectUserError: (err, allErrors) => {
        console.error("Failed to connect user", err, allErrors);
      },
    },
  });

  const { createCall, endCall, rejectCall, joinCall } = useStreamCall();
  // const call = useCall();
  const call = client.call("default", APIEndPoints.CallID);
  const isCallCreatedByMe = call?.data?.created_by.id === call?.currentUserId;
  const { useCallCallingState } = useCallStateHooks();
  const navigation = useNavigation();
  const callingState = useCallCallingState();

  const handleAcceptCall = async () => {
    try {
      await call.join({ create: false });
      navigation.navigate("CallScreen", { callId: call.id });
    } catch (error) {
      console.error("Error accepting call:", error);
      Alert.alert("", error.message || "Failed to accept the call");
    }
  };

  const handleRejectCall = async () => {
    // Reject the call and navigate back

    try {
      call.leave({ reject: true, reason: "decline" });
    } catch (error) {
      console.error("Error rejecting call:", error);
      Alert.alert("", error.message || "Failed to reject the call");
    }
    // rejectCall();
    // navigation.goBack();
  };

  // Display the incoming call if the call state is RINGING and the call is not created by me, i.e., recieved from others.
  if (callingState === CallingState.RINGING && !isCallCreatedByMe) {
    return (
      <IncomingCall
        onAcceptCallHandler={handleAcceptCall}
        onRejectCallHandler={handleRejectCall}
      />
    );
  }
  if (callingState === CallingState.RINGING) {
    return <OutgoingCall />;
  }
};

const IncomingCallS = ({ navigation }) => {
  const calls = useCalls();

  return (
    <StreamCall call={calls[0]}>
      <CallPanel navigation={navigation} />
    </StreamCall>
  );
};

export default IncomingCallS;
