import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import LoginScreen from "../Screens/auth/LoginScreen";
import SignupScreen from "../Screens/auth/SignupScreen";
import Onboarding from "../Screens/Onboarding";
import HomeScreen from "../Screens/HomeScreen";
import ProfileScreen from "../Screens/ProfileScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ChatDetails from "../Screens/ChatDetails";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const DrawerTab = createDrawerNavigator();
function MyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Followup" component={Followup} />
      <Stack.Screen name="Addmembers" component={Addmembers} />
      <Stack.Screen name="AddProjection" component={AddProjection} />
      <Stack.Screen name="MemberDetails" component={MemberDetails} />
      <Stack.Screen name="Addattendance" component={Addattendance} />
      <Stack.Screen name="chat-details" component={ChatDetails} />
    </Stack.Navigator>
  );
}

function MyTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Members" component={Members} />
      <Tab.Screen name="FollowUp" component={MyStack} />
    </Tab.Navigator>
  );
}

function Drawer() {
  return (
    <DrawerTab.Navigator>
      <DrawerTab.Screen name="Home" component={MyTabs} />
      <DrawerTab.Screen name="Profile" component={ProfileScreen} />
    </DrawerTab.Navigator>
  );
}

export default function AppNavigation() {
  return <Drawer />;
}
