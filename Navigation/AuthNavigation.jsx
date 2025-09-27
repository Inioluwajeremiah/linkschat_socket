import { createStackNavigator } from "@react-navigation/stack";
import OtpScreen from "../Screens/OtpScreen";
import LoginScreen from "../Screens/LoginScreen";
import Welcome from "../Screens/Welcome";
import PrivacyPolicy from "../Screens/PrivacyPolicy";
import { useDispatch, useSelector } from "react-redux";
import { setUserOffline, setUserOnline } from "../utils/presence";
import { registerForPushNotificationsAsync } from "../utils/notificationService";
import { useEffect, useState } from "react";
import { useNotificationHandler } from "../hooks/useNotificationHandlerDelete";
import { AppState } from "react-native";
import useUpdateMessageStatus from "../hooks/useUpdateMessageStatus";
// import { loadInitialStatusData } from "../Store/slices/statusSlice";
import RegisterScreen from "../Screens/RegisterScreen";
import MainScreen from "./MainScreen";
import IncomingCallS from "../Components/IncomingCall";
import { SafeAreaView } from "react-native-safe-area-context";

const Stack = createStackNavigator();

export default function AuthScreen() {
  const dispatch = useDispatch();
  const { isCompleteOnboarding, isStartedOnboarding } = useSelector(
    (state) => state.onboarding
  );
  const { userData, isLogin } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  useNotificationHandler(); // always listen for notification tap

  // update chat messages to delivered status
  const { updateMessage } = useUpdateMessageStatus();

  useEffect(() => {
    setUserOnline(userId);

    const onAppBackground = () => setUserOffline(userId);
    const onAppForeground = () => setUserOnline(userId);

    AppState.addEventListener("change", (state) => {
      if (state === "background") onAppBackground();
      else if (state === "active") onAppForeground();
    });

    return () => {
      setUserOffline(userId);
    };
  }, []);

  // setup notification
  useEffect(() => {
    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        // Replace with your auth state
        await firestore()
          .collection("users")
          .doc(userId)
          .set({ fcmToken: token }, { merge: true });
      }
    };

    setupNotifications();
  }, []);

  useEffect(() => {
    const updateMessageStatus = async () => {
      if (userId) {
        await updateMessage(userId, false, "DELIVERED");
      }
    };

    updateMessageStatus();
  }, [userId, updateMessage]);

  // // load initial status data from AsyncStorage
  // useEffect(() => {
  //   dispatch(loadInitialStatusData());
  // }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isCompleteOnboarding && (
        <Stack.Screen name="Welcome" component={Welcome} />
      )}

      {!isCompleteOnboarding && (
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      )}
      {/* incase a user exits screen before finishing verifying his email, 
      he should be returned to the otp screen. */}

      {/* if user is not yet authenticated show Login and otp screen */}
      {/* 
        {!isStartedOnboarding && !userId && (
          <Stack.Screen name="Register" component={RegisterScreen} />
        )} */}
      {/* {!userId && <Stack.Screen name="Login" component={LoginScreen} />}
        {!userId && <Stack.Screen name="Otp" component={OtpScreen} />}
        {!userId && <Stack.Screen name="Register" component={RegisterScreen} />} */}

      {!isLogin && <Stack.Screen name="Login" component={LoginScreen} />}
      {!isLogin && <Stack.Screen name="Otp" component={OtpScreen} />}
      {!isLogin && <Stack.Screen name="Register" component={RegisterScreen} />}
      <Stack.Screen name="MainScreen" component={MainScreen} />
      {/* <Stack.Screen name="IncomingCall" component={IncomingCallS} /> */}
    </Stack.Navigator>
  );
}
