import { useEffect, useRef, useState } from "react";
import { useCalls } from "@stream-io/video-react-native-sdk";
import { useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { customNavigation } from "../App";
import { Alert, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCreateUserCallMutation } from "../Store/apislices/callApiSlice";

const LinksChatStreamCallProvider = ({ children }) => {
  const route = useRoute();
  const { top } = useSafeAreaInsets();
  const isOnCallScreen = route.name === "CallScreen";
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;
  const lastStateRef = useRef(null);
  const joinedAtRef = useRef(null);
  const calls = useCalls();
  const call = calls[0];

  const [
    createUserCall,
    { isLoading: creatingUserCall, error: errorCreatingUserCall },
  ] = useCreateUserCallMutation();

  // const caller =
  //   "Incoming call by " + call?.state?.createdBy?.name ||
  //   call?.state?.createdBy?.id;

  const isOutgoing = call?.state?.createdBy?.id === userId;

  const callerName =
    call?.state?.createdBy?.name ||
    call?.state?.createdBy?.id ||
    "Unknown user";

  const caller = isOutgoing
    ? `Outgoing call by ${callerName}`
    : `Incoming call from ${callerName}`;

  const callType = call?.type === "audio" ? "audio" : "video";

  // useEffect(() => {
  //   if (!call) {
  //     return;
  //   }

  //   setTimeout(() => {
  //     customNavigation("CallScreen", { callId: call.id });
  //   }, 2000);
  // }, [call, isOnCallScreen]);

  // useEffect(() => {
  //   if (!call) return;

  //   const callingState = call.state.callingState;

  //   // Prevent duplicate sends
  //   if (callingState === lastStateRef.current) return;
  //   lastStateRef.current = callingState;

  //   const createdById = call.state.createdBy?.id;
  //   const isOutgoing = createdById === userId;

  //   sendCallEventToBackend({
  //     callId: call.id,
  //     callerId: userId,
  //     // otherUserId: createdById,
  //     receiverId: "",
  //     direction: isOutgoing ? "outgoing" : "incoming",
  //     status:
  //       callingState === "ringing"
  //         ? "ringing"
  //         : callingState === "joined"
  //         ? "accepted"
  //         : callingState === "ended"
  //         ? "ended"
  //         : "unknown",
  //     timestamp: Date.now(),
  //   });

  //   // Auto navigate on incoming call
  //   if (!isOnCallScreen && callingState === "ringing") {
  //     setTimeout(() => {
  //       customNavigation("CallScreen", { callId: call.id });
  //     }, 1500);
  //   }
  // }, [call?.state.callingState]);

  // // Detect missed call (ringing → ended without joined)
  // useEffect(() => {
  //   if (!call) return;

  //   return () => {
  //     if (call.state.callingState === "ringing") {
  //       sendCallEventToBackend({
  //         callerId: userId,
  //         receiverId: "user_456",
  //         duration: 180,
  //         callId: call.id,
  //         status: "missed",
  //         timestamp: Date.now(),
  //       });
  //     }
  //   };
  // }, [call]);

  // const sendCallEventToBackend = async (body) => {
  //   try {
  //     const response = await createUserCallMutation(body);
  //     console.log(
  //       "sendCallEventToBackend response at LinksChatStreamCallProvider ===>> ",
  //       response
  //     );
  //   } catch (error) {
  //     Alert.alert("error", error.message);
  //   }
  // };
  const sendCallEventToBackend = async (body) => {
    try {
      const response = await createUserCall(body);
    } catch (error) {
      // console.log("sendCallEventToBackend error ===>>", error);
    }
  };

  // useEffect(() => {
  //   if (!call) return;

  //   const callingState = call.state.callingState;

  //   // Prevent duplicates
  //   if (callingState === lastStateRef.current) return;
  //   lastStateRef.current = callingState;

  //   const createdById = call.state.createdBy?.id;
  //   const isOutgoing = createdById === userId;

  //   const members = Object.keys(call.state.members || {});
  //   const otherUserId = members.find((id) => id !== userId) ?? "";

  //   // Track when call is accepted
  //   if (callingState === "joined") {
  //     joinedAtRef.current = Date.now();
  //   }

  //   // Handle ended call
  //   if (callingState === "ended") {
  //     const wasAnswered = joinedAtRef.current !== null;

  //     sendCallEventToBackend({
  //       callId: call.id,
  //       callType,
  //       callerId: createdById,
  //       receiverId: otherUserId,
  //       direction: isOutgoing ? "outgoing" : "incoming",
  //       status: wasAnswered ? "ended" : "missed",
  //       duration: wasAnswered
  //         ? Math.floor((Date.now() - joinedAtRef?.current) / 1000)
  //         : 0,
  //       timestamp: Date.now(),
  //     });

  //     joinedAtRef.current = null;
  //     return;
  //   }

  //   // Ringing / Accepted events
  //   sendCallEventToBackend({
  //     callId: call.id,
  //     callType,
  //     callerId: createdById,
  //     receiverId: otherUserId,
  //     direction: isOutgoing ? "outgoing" : "incoming",
  //     status:
  //       callingState === "ringing"
  //         ? "ringing"
  //         : callingState === "joined"
  //         ? "accepted"
  //         : "unknown",
  //     timestamp: Date.now(),
  //   });
  // }, [call?.state.callingState]);

  useEffect(() => {
    if (!call) return;

    const callingState = call.state.callingState;

    // Prevent duplicate state handling
    if (callingState === lastStateRef.current) return;
    lastStateRef.current = callingState;

    const createdById = call.state.createdBy?.id;
    if (!createdById) return;

    const isOutgoing = createdById === userId;

    const members = call?.state?.members || [];

    const memberList = Array.isArray(members)
      ? members
      : Object.values(members);

    const otherUserId = memberList
      .map((m) => m?.user?.id)
      .find((id) => id && id !== userId);
    if (!otherUserId) return;

    // Track when call is accepted
    if (callingState === "joined") {
      joinedAtRef.current = Date.now();
    }

    // Handle call ended
    if (callingState === "ended") {
      const wasAnswered = joinedAtRef.current !== null;
      const body = {
        callId: call.id,
        callType, // "audio" | "video"
        callerId: createdById,
        receiverId: otherUserId,
        direction: isOutgoing ? "outgoing" : "incoming",
        status: wasAnswered ? "ended" : "missed",
        duration: wasAnswered
          ? Math.floor((Date.now() - joinedAtRef.current) / 1000)
          : 0,
        // timestamp: Date.now(),
      };

      sendCallEventToBackend(body);

      joinedAtRef.current = null;
      return;
    }

    // Only log ringing & accepted
    if (callingState === "ringing" || callingState === "joined") {
      const body = {
        callId: call.id,
        callType,
        callerId: createdById,
        receiverId: otherUserId,
        direction: isOutgoing ? "outgoing" : "incoming",
        duration: 0,
        status: callingState === "ringing" ? "ringing" : "accepted",
        // timestamp: Date.now(),
      };

      sendCallEventToBackend(body);
    }
  }, [call?.state.callingState]);

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
          {/* <Text>
            Call: {call.id} ({call.state.callingState})
          </Text> */}
          <Text style={{ textAlign: "center" }}>{caller}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default LinksChatStreamCallProvider;
