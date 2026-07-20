import { Tabs } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRef, useEffect } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAppSelector } from "../../hooks/useRedux";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants";

function TabIcon({
  name,
  focused,
  badge,
}: {
  name: string;
  focused: boolean;
  badge?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const { colors } = useTheme();
  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.15 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color: colors.textInverse }]}>
            {badge > 99 ? "99+" : badge}
          </Text>
        </View>
      )}
      {focused && <View style={styles.activeDot} />}
    </Animated.View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const chats = useAppSelector((s) => s.chat.chats);
  const totalUnread = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            borderTopColor: colors.border + "60",
            backgroundColor: colors.background,
          },
        ],
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        // tabBarBackground: () => (
        //   <BlurView
        //     intensity={60}
        //     tint="dark"
        //     style={StyleSheet.absoluteFillObject}
        //   />
        // ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, focused }) => (
            <>
              <TabIcon
                name="chatbubbles"
                focused={focused}
                badge={totalUnread}
              />
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={24}
                color={color}
              />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          title: "LinksSwipe",
          tabBarIcon: ({ color, focused }) => (
            <>
              <TabIcon name="film" focused={focused} />
              <Ionicons
                name={focused ? "film" : "film-outline"}
                size={24}
                color={color}
              />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="calls"
        options={{
          title: "Calls",
          tabBarIcon: ({ color, focused }) => (
            <>
              <TabIcon name="call" focused={focused} />
              <Ionicons
                name={focused ? "call" : "call-outline"}
                size={24}
                color={color}
              />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: "Stories",
          tabBarIcon: ({ color, focused }) => (
            <>
              <TabIcon name="radio" focused={focused} />
              <MaterialCommunityIcons
                name={focused ? "circle-slice-8" : "circle-outline"}
                size={24}
                color={color}
              />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <>
              <TabIcon name="person" focused={focused} />
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            </>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    height: 80,
    paddingTop: 10,
    paddingBottom: 10,

    elevation: 0,
  },
  tabLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  iconWrap: { position: "absolute", top: -4, alignItems: "center" },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    zIndex: 10,
  },
  badgeText: { fontSize: 10, fontWeight: "800" },
  activeDot: {
    position: "absolute",
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.tabActive,
  },
});
