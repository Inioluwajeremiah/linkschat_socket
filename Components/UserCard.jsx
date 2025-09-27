import { useNavigation } from "@react-navigation/native";
import { Image } from "react-native";
import { View, Text, TouchableOpacity } from "react-native";
import { windowWidth } from "../utils/Dimensions";
import OnlineUserIndicator from "./OnlineUserIndicator";
import { useGetUserDetailsQuery } from "../Store/apislices/userApiSlice";

const UserCard = ({
  fromAddNewGroup,
  item,
  selectedMembers,
  setSelectedMembers,
}) => {
  const navigation = useNavigation();
  const imageSize = windowWidth * 0.15;
  const indicatorSize = imageSize * 0.25;

  // console.log("UserCard item ===>>> ", item);

  const { data: userBDetails, isLoading: loadingUserDetails } =
    useGetUserDetailsQuery({ userId: item.id });

  const handleAddtMembers = (memberId) => {
    setSelectedMembers((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((item) => item != memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        marginTop: 10,
        borderRadius: selectedMembers?.includes(item?.id) ? 10 : 0,
        paddingHorizontal: selectedMembers?.includes(item?.id) ? 10 : 0,
        gap: 10,
        backgroundColor: selectedMembers?.includes(item?.id)
          ? "rgba(91, 187, 223, 0.5)"
          : "transparent",
      }}
      onPress={
        fromAddNewGroup && selectedMembers?.length > 0
          ? () => handleAddtMembers(item?.id)
          : () =>
              navigation.navigate("chat-details", {
                item: item,
                isNewChat: true,
                userBDetails: userBDetails?.data,
              })
      }
      onLongPress={
        fromAddNewGroup === true ? () => handleAddtMembers(item?.id) : null
      }
    >
      {/* image */}
      <View
        style={{
          width: imageSize,
          height: imageSize,
          borderWidth: 3,
          borderColor: "#5bbbdf",
          borderRadius: imageSize / 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={{ uri: item?.imageUrl }}
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: imageSize / 2,
            objectFit: "contain",
          }}
        />
        {/* active indicator */}
        <OnlineUserIndicator />
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: "column",
          marginLeft: 10,
        }}
      >
        {item?.userName && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: "black",
              fontFamily: "regular",
            }}
            numberOfLines={1}
          >
            {item?.userName}
          </Text>
        )}

        <Text
          style={{
            fontSize: 14,
            color: "gray",
            fontFamily: "regular",
            marginTop: 6,
          }}
          numberOfLines={1}
        >
          {item?.phone}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default UserCard;
