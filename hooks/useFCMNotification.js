import { Alert, Linking, PermissionsAndroid, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { useEffect } from "react";

const useFCMNotification = () => {
  async function requestIOsUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  }

  // const requestAndroidPermission = async () => {
  //   const granted = await PermissionsAndroid.request(
  //     PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  //   );

  //   if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //     console.log("Notification permission granted");
  //     Alert.alert("push notification granted");
  //   } else {
  //     console.log("Notification permission denied");
  //     Alert.alert("push notification not granted");
  //   }
  // };
  const requestAndroidPermission = async () => {
    console.log("Android version ===> ", Platform.Version);
    if (Platform.OS === "android") {
      if (Platform.Version >= 33) {
        // Android 13+ requires POST_NOTIFICATIONS
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("✅ Notification permission granted");
          Alert.alert("Push notifications granted");
        } else {
          console.log("❌ Notification permission denied");
          Alert.alert(
            "Push notifications blocked",
            "Please enable them in Settings.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings(),
              },
            ]
          );
        }
      } else {
        // On Android 12 and below → permission is auto-granted
        console.log("ℹ️ No runtime permission needed");
        Alert.alert("Push notifications already allowed by default");
      }
    }
  };

  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log("FCM token at useNotification ===>> ", token);
    } catch (error) {
      console.error("error getting token at useFCMNotification ====>> ", error);
    }
  };

  useEffect(() => {
    requestAndroidPermission();
    getToken();
  }, []);
  return;
};

export default useFCMNotification;
