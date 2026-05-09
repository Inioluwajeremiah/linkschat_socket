import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useDeleteAllUserCallsMutation } from "../Store/apislices/callApiSlice";
import { useSelector } from "react-redux";

const CallHistoryHeader = () => {
  const navigation = useNavigation();

  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  const [deleteAllUserCalls, { isLoading, error }] =
    useDeleteAllUserCallsMutation();

  const handleDeleteAllCallHistory = async () => {
    try {
      const response = await deleteAllUserCalls({ callerId: userId });
    } catch (error) {
      Alert.alert("", error.message);
    }
  };

  const confirmDeleteAll = () => {
    Alert.alert(
      "Clear call history",
      "This will permanently delete all call records.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: handleDeleteAllCallHistory,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Chats")}
          style={styles.backButton}
        >
          <MaterialIcons name="keyboard-arrow-left" size={34} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>Call History</Text>
      </View>

      <TouchableOpacity onPress={confirmDeleteAll} style={styles.deleteButton}>
        {isLoading ? (
          <ActivityIndicator size={"small"} />
        ) : (
          <MaterialCommunityIcons
            name="delete-outline"
            size={22}
            color="white"
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CallHistoryHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#5bbbdf",
    height: 80,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#5bbbdf",
    opacity: 0.7,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
    fontFamily: "regular",
  },
});
