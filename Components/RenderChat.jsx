import { TouchableOpacity, Text, View } from "react-native";
import Octicons from "@expo/vector-icons/Octicons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Mark from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { timeAgo } from "../utils/TimeUtils";
import { Colors } from "../utils/Colors";

const RenderChats = ({
  item,
  userId,
  messagesToDelete,
  setMessagesToDelete,
}) => {
  const handleLongPress = (messageId) => {
    // setOnLongPressActivated(true);
    setMessagesToDelete((prev) => {
      if (prev.includes(messageId)) {
        return prev.filter((id) => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  return (
    <TouchableOpacity
      onLongPress={
        item?.senderId === userId ? () => handleLongPress(item?.id) : null
      }
      onPress={() => {
        messagesToDelete.length > 0 && item?.senderId === userId
          ? handleLongPress(item?.id)
          : null;
      }}
      style={{
        marginBottom: 10,
        paddingVertical: 10,
        marginHorizontal: messagesToDelete.includes(item?.id) ? 10 : 20,
        borderRadius: 10,
        backgroundColor: messagesToDelete.includes(item?.id)
          ? "rgba(91, 187, 223, 0.5)"
          : "transparent",
      }}
    >
      <View
        style={{
          alignItems: item?.senderId === userId ? "flex-end" : "flex-start",
          justifyContent: item?.senderId === userId ? "flex-end" : "flex-start",
        }}
      >
        <View
          style={{
            // color: item?.senderId === userId ? "white" : "gray",

            backgroundColor: "white",
            paddingVertical: 25,
            borderTopEndRadius: 25,
            borderTopLeftRadius: 25,
            borderBottomLeftRadius: item?.senderId === userId ? 25 : 0,
            borderBottomRightRadius: item?.senderId === userId ? 0 : 25,
            backgroundColor: item?.senderId === userId ? "#83d0ea" : "#ccc",
            width: 200,
            height: "auto",
          }}
        >
          <Text
            style={{
              fontFamily: "regular",
              marginLeft: 10,
            }}
          >
            {item?.content}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              marginTop: 10,
              marginRight: 5,
              gap: 5,
            }}
          >
            {item.star ? (
              <Octicons name="star-fill" size={14} color="white" />
            ) : null}
            <Text
              style={{
                fontFamily: "regular",
              }}
            >
              {timeAgo(item?.createdAt?.seconds * 1000)}
            </Text>
            {item?.senderId === userId && item?.status === "READ" ? (
              <Mark name="checkmark-done-sharp" color={"white"} size={20} />
            ) : item?.senderId === userId && item?.status === "DELIVERED" ? (
              <Ionicons name="checkmark-done-outline" color="gray" size={20} />
            ) : item?.senderId === userId && item?.status === "SENT" ? (
              <Ionicons name="checkmark-outline" color="white" size={20} />
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RenderChats;
