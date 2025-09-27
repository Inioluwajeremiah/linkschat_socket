import React from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const CheckBox = ({ onPress, isChecked }) => {
  return (
    <TouchableOpacity style={[styles.container]} onPress={onPress}>
      {isChecked ? (
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 2,
            borderWidth: 2,
            borderColor: "#5bbbdf",
            backgroundColor: "#5bbbdf",
            marginRight: 8,
          }}
        >
          <Ionicons name="checkmark-sharp" size={16} color="white" />
        </View>
      ) : (
        <View style={styles.checkmark} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 4,
    justifyContent: "center",
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: "#5bbbdf",
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
  checked: {
    backgroundColor: "#5bbbdf",
  },
});

export default CheckBox;
