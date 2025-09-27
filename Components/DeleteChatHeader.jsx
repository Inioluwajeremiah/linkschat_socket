import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import IonIcons from "@expo/vector-icons/Ionicons";
import { useDeleteChatMutation } from "../Store/apislices/chatApiSlice";
import { Colors } from "../utils/Colors";

const DeleteChatHeader = ({
  noOfChatsSelected,
  chatsToDelete,
  setChatsToDelete,
  userId,
}) => {
  const [deleteChat, { isLoading: deletingChat }] = useDeleteChatMutation();

  const handleDeleteChatHeader = async () => {
    try {
      const response = await deleteChat({
        chatIds: chatsToDelete,
        userId,
      });

      // console.log("handleDeleteChatHeader response ===>> ", response);

      if (response?.data) {
        setChatsToDelete([]);
      }

      if (response?.error) {
        Alert.alert(
          "",
          response?.error?.data?.message ||
            "Unable to delete chat. Please try again later"
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
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={() => setChatsToDelete([])}>
          <IonIcons name="close-outline" size={24} color={"#000"} />
        </TouchableOpacity>
        <Text>{noOfChatsSelected}</Text>
      </View>
      <TouchableOpacity onPress={handleDeleteChatHeader}>
        {deletingChat ? (
          <ActivityIndicator size={"small"} color={Colors.primaryColor} />
        ) : (
          <IonIcons name="trash-outline" size={24} color="black" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default DeleteChatHeader;
