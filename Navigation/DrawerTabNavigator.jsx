import { createDrawerNavigator } from "@react-navigation/drawer";
import { MaterialIcons } from "@expo/vector-icons";
import BottomTabs from "./BottomTabNavigator";
import CustomDrawer from "../Components/CustomDrawer";
import Profiles from "../Screens/Profiles";
import NewGroup from "../Screens/NewGroup";
import NewCalls from "../Screens/NewCalls";
import AddNewContact from "../Screens/AddNewContact";
import BuyGiftCard from "../Components/BuyGiftCard";
import Icon from "react-native-vector-icons/FontAwesome5";
import Call from "react-native-vector-icons/MaterialIcons";
import Home from "react-native-vector-icons/AntDesign";
import Group from "react-native-vector-icons/FontAwesome";
import Contacts from "react-native-vector-icons/MaterialCommunityIcons";
import Cash from "react-native-vector-icons/MaterialCommunityIcons";
import Chat from "react-native-vector-icons/Entypo";
import Star from "react-native-vector-icons/AntDesign";
import Invite from "react-native-vector-icons/AntDesign";

import StarredMessages from "../Screens/StarredMessages";
import InviteScreen from "../Screens/InviteScreen";
import Settings from "../Screens/Settings";
import Ionicons from "@expo/vector-icons/Ionicons";
import Profile from "../Screens/Profile";
import useLogout from "../hooks/useLogout";

const Drawer = createDrawerNavigator();

export default function DrawerStack() {
  const { onUserLogout, isLoading } = useLogout();

  return (
    <Drawer.Navigator
      drawerWidth={200}
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: "left",
      }}
    >
      <Drawer.Screen
        name="Tabs"
        component={BottomTabs}
        options={{
          drawerIcon: ({ color, focused, size }) => (
            <Home name="home" color={focused ? color : "gray"} size={size} />
          ),
          title: "Home",
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          drawerIcon: ({ color, focused, size }) => (
            <Icon name="user" color={focused ? color : "gray"} size={size} />
          ),
          title: "Profile",
        }}
      />

      <Drawer.Screen
        name="New Calls"
        component={NewCalls}
        options={{
          drawerIcon: ({ color, focused, size }) => (
            <Call name="call" color={focused ? color : "gray"} size={size} />
          ),
          title: "New Calls",
        }}
      />
      <Drawer.Screen
        name="New Group"
        component={NewGroup}
        options={{
          drawerIcon: ({ color, focused, size }) => (
            <Group name="users" color={focused ? color : "gray"} size={size} />
          ),
          title: "New Group",
        }}
      />
      <Drawer.Screen
        name="Add Newcontact"
        component={AddNewContact}
        options={{
          drawerIcon: ({ color, focused, size }) => (
            <Contacts
              name="contacts"
              color={focused ? color : "gray"}
              size={size}
            />
          ),
          title: "Add New Contact",
        }}
      />

      <Drawer.Screen
        name="Starred Messages"
        component={StarredMessages}
        options={{
          drawerIcon: ({ color, focused, size }) => (
            <Star name="staro" color={focused ? color : "gray"} size={size} />
          ),
          title: "Starred Messages",
        }}
      />
      <Drawer.Screen
        name="InviteFriends"
        component={InviteScreen}
        options={{
          drawerIcon: ({ color, focused, size }) => (
            <Invite
              name="plussquareo"
              color={focused ? color : "gray"}
              size={size}
            />
          ),
          title: "Invite Friends",
        }}
      />

      <Drawer.Screen
        name="Settings"
        component={Settings}
        options={{
          drawerIcon: ({ color, focused, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          title: "Settings",
        }}
      />

      <Drawer.Screen
        name="Logout"
        component={() => <View></View>}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out" color={color} size={size} />
          ),
          title: "Logout",
        }}
        listeners={({ navigation }) => ({
          drawerItemPress: async (e) => {
            e.preventDefault();
            onUserLogout();
          },
        })}
      />
    </Drawer.Navigator>
  );
}
