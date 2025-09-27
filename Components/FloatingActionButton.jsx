import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { FloatingAction } from "react-native-floating-action";

const FloatingActionButton = () => {
  const [toggleFab, setToggleFab] = useState(false);
  const navigation = useNavigation();

  const handleToggleFab = () => {
    setToggleFab(!toggleFab);
  };
  return (
    <View>
      {toggleFab && (
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("AllRegisteredUsersScreen")}
            style={{
              width: 50,
              height: 50,
              backgroundColor: "#5bbbdf",
              borderRadius: 30,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              // Android Shadow
              elevation: 5,
              margin: 10,
              marginLeft: 0,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 5,
              position: "absolute",
              zIndex: 1000,
              bottom: 160,
              right: 20,
            }}
          >
            <Ionicons name="chatbubbles" size={20} color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddNewGroup")}
            style={{
              width: 50,
              height: 50,
              backgroundColor: "#5bbbdf",
              borderRadius: 30,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              // Android Shadow
              elevation: 5,
              margin: 10,
              marginLeft: 0,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 5,
              position: "absolute",
              zIndex: 1000,
              bottom: 100,
              right: 20,
            }}
          >
            <Ionicons name="people" size={20} color={"white"} />
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        onPress={handleToggleFab}
        style={{
          width: 60,
          height: 60,
          backgroundColor: "#5bbbdf",
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          // Android Shadow
          elevation: 5,
          margin: 10,
          marginLeft: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 5,
          position: "absolute",
          zIndex: 1000,
          bottom: 20,
          right: 20,
        }}
      >
        <Ionicons name="add-sharp" size={30} color={"white"} />
      </TouchableOpacity>
    </View>
  );
};

export default FloatingActionButton;
