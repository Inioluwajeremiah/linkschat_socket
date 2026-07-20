// import { View, Text, TouchableOpacity, Modal } from "react-native";
// import React from "react";
// import { StyleSheet } from "react-native";
// import { Animated } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useTheme } from "@/context/ThemeContext";
// import { useRouter } from "expo-router";

// interface MenuItemsProps {
//   closeHeaderMenu: () => void;
//   menuAnim: Animated.Value;
// }
// const MenuItems = ({ closeHeaderMenu, menuAnim }: MenuItemsProps) => {
//   const router = useRouter();
//   const { colors } = useTheme();
//   return (
//     <Modal>
//       <TouchableOpacity
//         style={StyleSheet.absoluteFillObject}
//         onPress={closeHeaderMenu}
//         activeOpacity={1}
//       />

//       <Animated.View
//         style={[
//           styles.dropMenu,
//           {
//             backgroundColor: colors.surface,
//             borderColor: colors.border,
//             opacity: menuAnim,
//             transform: [
//               {
//                 scale: menuAnim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0.85, 1],
//                 }),
//               },
//               {
//                 translateY: menuAnim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [-10, 0],
//                 }),
//               },
//             ],
//           },
//         ]}
//       >
//         {[
//           {
//             icon: "chatbubble-ellipses-outline",
//             label: "New Chat",
//             sub: "Start a private conversation",
//             color: "#00d4aa",
//             bg: "rgba(0,212,170,0.1)",
//             route: "/new-chat",
//           },
//           {
//             icon: "people-outline",
//             label: "New Group",
//             sub: "Create a group chat",
//             color: "#5b8dee",
//             bg: "rgba(91,141,238,0.1)",
//             route: "/new-group",
//           },
//           {
//             icon: "person-add-outline",
//             label: "Contacts",
//             sub: "Find friends on LinksChat",
//             color: "#ff6b9d",
//             bg: "rgba(255,107,157,0.1)",
//             route: "/phone-contacts",
//           },
//         ].map(({ icon, label, sub, color, bg, route }, i) => (
//           <TouchableOpacity
//             key={label}
//             style={[
//               styles.dropMenuItem,
//               i < 2 && {
//                 borderBottomWidth: StyleSheet.hairlineWidth,
//                 borderBottomColor: colors.border,
//               },
//             ]}
//             onPress={() => {
//               closeHeaderMenu();
//               setTimeout(() => router.push(route as any), 200);
//             }}
//             activeOpacity={0.7}
//           >
//             <View style={[styles.dropMenuIcon, { backgroundColor: bg }]}>
//               <Ionicons name={icon as any} size={18} color={color} />
//             </View>
//             <View style={styles.dropMenuText}>
//               <Text
//                 style={[styles.dropMenuLabel, { color: colors.textPrimary }]}
//               >
//                 {label}
//               </Text>
//               <Text style={[styles.dropMenuSub, { color: colors.textMuted }]}>
//                 {sub}
//               </Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={14}
//               color={colors.textMuted}
//             />
//           </TouchableOpacity>
//         ))}
//       </Animated.View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   dropMenu: {
//     position: "absolute",
//     top: 52,
//     right: 16,
//     width: 240,
//     borderRadius: 16,
//     borderWidth: 1,
//     zIndex: 100,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.2,
//     shadowRadius: 16,
//     elevation: 12,
//     overflow: "hidden",
//   },
//   dropMenuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 14,
//     paddingVertical: 13,
//     gap: 12,
//   },
//   dropMenuIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   dropMenuLabel: {
//     fontSize: 14,
//     fontWeight: "700",
//   },
//   dropMenuSub: {
//     fontSize: 11,
//     marginTop: 1,
//   },
//   dropMenuText: {
//     flex: 1,
//   },
// });

// export default MenuItems;

import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import React from "react";
import { StyleSheet } from "react-native";
import { Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";

interface MenuItemsProps {
  closeHeaderMenu: () => void;
  menuAnim: Animated.Value;
}
const MenuItems = ({ closeHeaderMenu, menuAnim }: MenuItemsProps) => {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={closeHeaderMenu}
    >
      <Pressable
        style={StyleSheet.absoluteFillObject}
        onPress={closeHeaderMenu}
      />

      <Animated.View
        style={[
          styles.dropMenu,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: menuAnim,
            transform: [
              {
                scale: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1],
                }),
              },
              {
                translateY: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              },
            ],
          },
        ]}
      >
        {[
          {
            icon: "chatbubble-ellipses-outline",
            label: "New Chat",
            sub: "Start a private conversation",
            color: "#00d4aa",
            bg: "rgba(0,212,170,0.1)",
            route: "/new-chat",
          },
          {
            icon: "people-outline",
            label: "New Group",
            sub: "Create a group chat",
            color: "#5b8dee",
            bg: "rgba(91,141,238,0.1)",
            route: "/new-group",
          },
          {
            icon: "person-add-outline",
            label: "Contacts",
            sub: "Find friends on LinksChat",
            color: "#ff6b9d",
            bg: "rgba(255,107,157,0.1)",
            route: "/phone-contacts",
          },
        ].map(({ icon, label, sub, color, bg, route }, i) => (
          <TouchableOpacity
            key={label}
            style={[
              styles.dropMenuItem,
              i < 2 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
            onPress={() => {
              closeHeaderMenu();
              setTimeout(() => router.push(route as any), 200);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.dropMenuIcon, { backgroundColor: bg }]}>
              <Ionicons name={icon as any} size={18} color={color} />
            </View>
            <View style={styles.dropMenuText}>
              <Text
                style={[styles.dropMenuLabel, { color: colors.textPrimary }]}
              >
                {label}
              </Text>
              <Text style={[styles.dropMenuSub, { color: colors.textMuted }]}>
                {sub}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ))}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dropMenu: {
    position: "absolute",
    top: 85,
    right: 16,
    width: 240,
    borderRadius: 16,
    borderWidth: 1,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    overflow: "hidden",
  },
  dropMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  dropMenuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dropMenuLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  dropMenuSub: {
    fontSize: 11,
    marginTop: 1,
  },
  dropMenuText: {
    flex: 1,
  },
});

export default MenuItems;
