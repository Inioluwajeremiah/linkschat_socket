import messaging from "@react-native-firebase/messaging";
export const getToken = async () => {
  try {
    const token = await messaging().getToken();

    console.log("FCM token at useNotification ===>> ", token);
    return token;
  } catch (error) {
    console.error("error getting token at useFCMNotification ====>> ", error);
  }
};
