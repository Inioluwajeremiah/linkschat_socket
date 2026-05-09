import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import Icon from "react-native-vector-icons/Ionicons";

import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import Chats from "../Screens/Chats";
import Profile from "../Screens/Profile";
import Settings from "../Screens/Settings";
import Calls from "../Screens/Calls";
import NewCalls from "../Screens/NewCalls";
import ChatDetails from "../Screens/ChatDetails";
import GroupChats from "../Screens/GroupChats";

const Stack = createStackNavigator();
function MyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="chats" component={Chats} />
      {/* <Stack.Screen name="chat-details" component={ChatDetails} /> */}
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Chats"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#5bbbdf",
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === "Chats") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name == "Stories") {
            iconName = focused ? "web-stories" : "auto-stories";
            return <MaterialIcons name={iconName} size={24} color={color} />;
          } else if (route.name == "Calls") {
            iconName = focused ? "call-sharp" : "call-outline";
          } else if (route.name == "Profile") {
            iconName = focused ? "user-alt" : "user";
            return <FontAwesome5 name={iconName} size={24} color={color} />;
          } else if (route.name == "Group Chat") {
            iconName = focused ? "people-sharp" : "people-sharp";
            return <Ionicons name={iconName} size={24} color={color} />;
          } else if (route.name == "Products") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name == "Services") {
            iconName = focused ? "workspaces-filled" : "workspaces-outline";
          } else if (route.name == "Auction") {
            iconName = focused ? "sell" : "sell";
          }

          return <Ionicons name={iconName} color={color} size={22} />;
        },
      })}
    >
      <Tab.Screen name="Chats" component={Chats} />
      {/* <Tab.Screen name="Group Chat" component={GroupChats} /> */}
      <Tab.Screen name="Calls" component={NewCalls} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Stories" component={Chats} />
    </Tab.Navigator>
  );
}

export default BottomTabs;
