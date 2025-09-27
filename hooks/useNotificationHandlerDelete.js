import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";

export const useNotificationHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data?.roomId && data?.callDocId) {
          navigation.navigate("IncomingCallScreen", {
            roomId: data.roomId,
            callId: data.callDocId,
            type: data.callType,
            callerId: data.callerId,
          });
        }
      }
    );

    return () => subscription.remove();
  }, []);
};
