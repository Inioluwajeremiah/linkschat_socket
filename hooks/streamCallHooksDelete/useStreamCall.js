// hooks/useStreamCall.js
import { useState, useCallback } from "react";
import { APIEndPoints } from "../../utils/ApiEndpoints";
import {
  StreamCall,
  StreamVideoClient,
  useCall,
  useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { useGetStreamUserCredential } from "./useGetStreamUserCredential";
import { Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setStreamCall } from "../../Store/slices/streamSlice";
import * as Crypto from "expo-crypto";
import { useNavigation } from "@react-navigation/native";

export const useStreamCall = (receiverId, participants) => {
  // const client = useStreamClient();
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;
  const videoClient = useStreamVideoClient();
  const navigation = useNavigation();
  console.log("receiver id ==>>  ", receiverId);
  const dispatch = useDispatch();
  // const { userData } = useSelector((state) => state.auth);
  // const userId = JSON.parse(userData)?.userId;
  const { streamCall } = useSelector((state) => state.stream);
  const stramCallObj =
    streamCall !== null && typeof streamCall === "string"
      ? JSON.parse(streamCall)
      : streamCall;

  const [call, setCall] = useState(null);
  // const { token, userName, userId } = useGetStreamUserCredential();

  // const apiKey = APIEndPoints.STREAM_API_KEY;
  // const client = StreamVideoClient.getOrCreateInstance({
  //   apiKey,
  //   user: { id: userId, name: userName },
  //   token: token,
  //   options: {
  //     maxConnectUserRetries: 3,
  //     onConnectUserError: (err, allErrors) => {
  //       console.error("Failed to connect user", err, allErrors);
  //     },
  //   },
  // });

  const createCall = async () => {
    if (!client) throw new Error("Stream client not initialized");

    try {
      const callOptions = {
        ring: true,
        video: true,

        data: {
          members: [
            {
              user_id: APIEndPoints.userID,
            },
            {
              user_id: "Pewter_Building",
            },
          ],
        },
      };

      // Create call handle
      const newCall = client.call("default", APIEndPoints.CallID);

      console.log("newcall at createCall ==> ", newCall);

      // Create call if it doesn’t exist
      await newCall.getOrCreate(callOptions);

      // Join immediately after creation
      await newCall.join({ create: true });

      setCall(newCall);
      dispatch(setStreamCall(JSON.stringify(newCall)));
      return newCall;
    } catch (error) {
      Alert.alert("", error.message);
    }
  };

  const GetOrCreateCall = async () => {
    try {
      const call = videoClient.call("default", Crypto.randomUUID());
      await call.getOrCreate({
        ring: true,
        data: {
          members: [
            {
              user_id: userId,
            },
            ...participants
              ?.filter((item) => item !== userId)
              .map((participant) => ({ user_id: participant })),
            // {
            //   user_id: receiverId,
            // },
          ],
        },
      });
      navigation.navigate("CallScreen", { callId: call?.id });
    } catch (error) {
      Alert.alert("", error.message);
    }
  };
  // Join an existing call
  const joinCall = async () => {
    const callInstance = client.call("default", APIEndPoints.CallID);
    try {
      await callInstance.join({ create: false });
    } catch (error) {
      console.error("Error joining call:", error);
      Alert.alert("Error", error.message || "Failed to join call");
      return;
    }
  };
  // Create + join in one step
  const createAndJoinCall = useCallback(
    async (callType, callId, options = {}) => {
      return joinCall(callType, callId, { create: true, ...options });
    },
    [joinCall]
  );

  // Leave joined call
  const leaveCall = async () => {
    try {
      await stramCallObj.leave();
      setCall(null);
    } catch (error) {
      console.error("Error leaving call:", error);
      Alert.alert("Error", error.message || "Failed to leave call");
    }
  };

  // cancel outgoing call
  const cancelCall = async () => {
    try {
      await stramCallObj.leave({ reject: true, reason: "cancel" });
      setCall(null);
    } catch (error) {
      console.error("Error canceling call:", error);
      Alert.alert("Error", error.message || "Failed to cancel call");
    }
  };

  // reject incoming call

  const rejectCall = async () => {
    const callInstance = client.call("default", APIEndPoints.CallID);
    try {
      await callInstance.leave({ reject: true, reason: "decline" });
      setCall(null);
    } catch (error) {
      console.error("Error rejecting call:", error);
      Alert.alert("Error", error.message || "Failed to reject call");
    }
  };

  // End call for everyone
  const endCall = async () => {
    // if (!call2) return;
    Alert.alert("", "Call ended");
    const call = client.call("default", APIEndPoints.CallID); // type, id
    await call.endCall();
    setCall(null);
  };

  // Load an existing call without joining
  const loadCall = useCallback();
  // async (callType, callId) => {
  //   if (!client) throw new Error("Stream client not initialized");
  //   const loadedCall = client.call(callType, callId);
  //   await loadedCall.get();
  //   setCall(loadedCall);
  //   return loadedCall;
  // },
  // [client]

  const endAllActiveCalls = async () => {
    try {
      // 1️⃣ Find all calls where you're currently a member and they're ongoing
      const { calls } = await client.queryCalls({
        filter_conditions: {
          ongoing: true,
        },
      });

      console.log(`Found ${calls.length} ongoing calls`);

      // 2️⃣ End each call
      for (const c of calls) {
        try {
          await c.endCall(); // Ends for everyone
          console.log(`Ended call: ${c.id}`);
        } catch (err) {
          console.error(`Failed to end call ${c.id}:`, err);
        }
      }
    } catch (err) {
      console.error("Error fetching calls:", err);
    }
  };

  return {
    call,
    createCall,
    GetOrCreateCall,
    joinCall,
    createAndJoinCall,
    leaveCall,
    cancelCall,
    rejectCall,
    endCall,
    endAllActiveCalls,
    loadCall,
  };
};
