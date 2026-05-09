import { createStackNavigator } from "@react-navigation/stack";
import DrawerStack from "./DrawerTabNavigator";
import Profile from "../Screens/Profile";
import ChatDetails from "../Screens/ChatDetails";
import GiftSomeone from "../Screens/GiftSomeone";
import AddUpdateScreen from "../Screens/AddUpdateScreen";
import ViewUpdateScreen from "../Screens/ViewUpdateScreen";
import CallScreen from "../Screens/CallScreen";
import AllRegisteredUsersScreen from "../Screens/AllRegisteredUsersScreen";
import LinksChatStreamVideoProvider from "../providers/LinksChatStreamVideoProvider";
import LinksChatStreamCallProvider from "../providers/LinksChatStreamCallProvider";
import AddNewGroup from "../Screens/AddNewGroup";
import GroupChatDetails from "../Screens/GroupChatDetails";
import messaging from "@react-native-firebase/messaging";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearExpiredViewedStatus } from "../Store/slices/statusSlice";
import EditGroupScreen from "../Screens/EditGroupScreen";
import { hydrateViewedStatus } from "../utils/statusHelper";

const Stack = createStackNavigator();

export const MainScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    hydrateViewedStatus();
  }, []);

  // useEffect(() => {
  //   // Foreground tap
  //   messaging().onNotificationOpenedApp((remoteMessage) => {
  //     if (remoteMessage?.data?.chatId) {
  //       navigation.navigate("Home", {
  //         screen: "ChatScreen",
  //         params: { chatId: remoteMessage.data.chatId },
  //       });
  //     }
  //   });

  //   // Cold start tap
  //   messaging().onNotificationOpenedApp((remoteMessage) => {
  //     if (remoteMessage?.data?.chatId) {
  //       navigation.navigate("Home", {
  //         screen: "ChatScreen",
  //         params: { chatId: remoteMessage.data.chatId },
  //       });
  //     }
  //   });
  // }, []);

  useEffect(() => {
    // Foreground tap
    messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage?.data?.chatId) {
        // navigation.navigate("MainScreen", {
        //   screen: "chat-details",
        //   params: { chatId: remoteMessage.data.chatId },
        // });
        navigation.navigate("MainScreen");
      }
    });

    // Cold start tap
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage?.data?.chatId) {
          // navigation.navigate("MainScreen", {
          //   screen: "chat-details",
          //   params: { chatId: remoteMessage.data.chatId },
          // });
          navigation.navigate("MainScreen");
        }
      });
  }, []);

  const dispatch = useDispatch();

  useEffect(() => {
    // Run once on app start
    dispatch(clearExpiredViewedStatus());
  }, [dispatch]);

  return (
    <LinksChatStreamVideoProvider>
      <LinksChatStreamCallProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={DrawerStack} />
          <Stack.Screen name="Profile" component={Profile} />
          {/* <Stack.Screen name="Setting" component={Settings} /> */}
          <Stack.Screen name="chat-details" component={ChatDetails} />
          <Stack.Screen name="Gift" component={GiftSomeone} />
          <Stack.Screen name="AddUpdateScreen" component={AddUpdateScreen} />
          <Stack.Screen name="ViewUpdateScreen" component={ViewUpdateScreen} />

          <Stack.Screen name="CallScreen" component={CallScreen} />
          {/* <Stack.Screen
            name="IncomingCallScreen"
            component={IncomingCallScreen}
          /> */}
          <Stack.Screen
            name="AllRegisteredUsersScreen"
            component={AllRegisteredUsersScreen}
          />
          <Stack.Screen name="AddNewGroup" component={AddNewGroup} />
          <Stack.Screen name="GroupChatDetails" component={GroupChatDetails} />
          <Stack.Screen name="EditGroupScreen" component={EditGroupScreen} />
        </Stack.Navigator>
      </LinksChatStreamCallProvider>
    </LinksChatStreamVideoProvider>
  );
};
export default MainScreen;
