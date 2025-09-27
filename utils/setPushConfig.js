import {
  StreamVideoClient,
  StreamVideoRN,
} from "@stream-io/video-react-native-sdk";
import { AndroidImportance } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APIEndPoints } from "./ApiEndpoints";

export function setPushConfig() {
  StreamVideoRN.setPushConfig({
    // pass true to inform the SDK that this is an expo app
    isExpo: true,

    ios: {
      // add your push_provider_name for iOS that you have setup in Stream dashboard
      pushProviderName: __DEV__ ? "apn-video-staging" : "apn-video-production",
    },

    android: {
      // the name of android notification icon (Optional, defaults to 'ic_launcher')
      smallIcon: "notification_icon",
      // add your push_provider_name for Android that you have setup in Stream dashboard
      pushProviderName: "LinksChat",
      // configure the notification channel to be used for incoming calls for Android.
      incomingCallChannel: {
        id: "stream_incoming_call",
        name: "Incoming call notifications",
        // This is the advised importance of receiving incoming call notifications.
        // This will ensure that the notification will appear on-top-of applications.
        importance: AndroidImportance.HIGH,
        // optional: if you dont pass a sound, default ringtone will be used
        sound: "notification_sound",
      },
      // configure the functions to create the texts shown in the notification
      // for incoming calls in Android.
      incomingCallNotificationTextGetters: {
        getTitle: (userName) => `Incoming call from ${userName}`,
        getBody: (_userName) => "Tap to answer the call",
        getAcceptButtonTitle: () => "Accept",
        getDeclineButtonTitle: () => "Decline",
      },
    },

    // add the async callback to create a video client
    // for incoming calls in the background on a push notification
    createStreamVideoClient: async () => {
      const storedProfile = await AsyncStorage.getItem("@userProfile");

      console.log(
        "storedProfile at createStreamVideoClient ==>> ",
        storedProfile
      );
      const userData = JSON.parse(storedProfile);
      const userId = userData?.userId;
      const userName = userData?.userName;
      // const userId = APIEndPoints.userID;
      // const userName = "John Doe";
      if (!userId) return undefined;

      // an example promise to fetch token from your server
      // const tokenProvider = async () =>
      //   yourServerAPI.getTokenForUser(userId).then((auth) => auth.token);

      const user = { id: userId, name: userName };
      return StreamVideoClient.getOrCreateInstance({
        apiKey: APIEndPoints.STREAM_API_KEY, // pass your stream api key
        user,
        // tokenProvider,
        token: userData?.streamToken, // pass your stream token
      });
    },
  });
}
