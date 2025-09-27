import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import IonIcons from "@expo/vector-icons/Ionicons";
import { useDeleteMessageMutation } from "../Store/apislices/messageApiSlice";
import { Colors } from "../utils/Colors";

const DeleteMessageHeader = ({
  noOfMessagesSelected,
  messagesToDelete,
  setMessagesToDelete,
  chatId,
}) => {
  const [deleteMessage, { isLoading: loadingDeleteMessage }] =
    useDeleteMessageMutation();

  const handleDeleteMessage = async () => {
    try {
      const response = await deleteMessage({
        messageIds: messagesToDelete,
        chatId,
      });

      if (response?.data) {
        setMessagesToDelete([]);
      }

      if (response?.error) {
        Alert.alert(
          "",
          response?.error?.data?.message ||
            "Unable to delete message. Please try again later"
        );
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      Alert.alert("", errorMessage);
    }
  };
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 10,
        height: 80,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: "#fafafa",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity
          onPress={() => setMessagesToDelete([])}
          style={{
            // width: 32,
            // height: 32,
            // backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 16,
          }}
        >
          <IonIcons name="close-outline" size={24} color={"#000"} />
        </TouchableOpacity>
        <Text>{noOfMessagesSelected}</Text>
      </View>
      <TouchableOpacity onPress={handleDeleteMessage} style={{ padding: 4 }}>
        {loadingDeleteMessage ? (
          <ActivityIndicator size={"small"} color={Colors.primaryColor} />
        ) : (
          <IonIcons name="trash-outline" size={24} color="black" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default DeleteMessageHeader;
