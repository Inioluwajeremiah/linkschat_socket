import { registerRootComponent } from "expo";
import App from "./App";
import { setFirebaseListeners } from "./utils/setFirebaseListeners.android";
import { setPushConfig } from "./utils/setPushConfig";
import messaging from "@react-native-firebase/messaging";

// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background!", remoteMessage);
});

setPushConfig();
setFirebaseListeners();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Disabling push notifications
// In some cases, you would want to disable the delivery of push notifications. One example is the user logs out of your app or, if you switch an user on the device.

// import { StreamVideoRN } from "@stream-io/video-react-native-sdk";
// await StreamVideoRN.onPushLogout();
