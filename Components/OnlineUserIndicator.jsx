import { View } from "react-native";
import { windowWidth } from "../utils/Dimensions";
import useGetUserStatus from "../hooks/useGetUserStatus";

const OnlineUserIndicator = ({ receiverId }) => {
  const { status, loading } = useGetUserStatus(receiverId);
  const imageSize = windowWidth * 0.15;
  const indicatorSize = imageSize * 0.25;

  // console.log("OnlineUserIndicator - Receiver ID:", receiverId);
  return (
    <View
      style={{
        width: indicatorSize,
        height: indicatorSize,
        borderRadius: indicatorSize / 2,
        backgroundColor: status?.online === true ? "green" : "gray",
        position: "absolute",
        top: imageSize - 20,
        right: 0,
        borderWidth: 2,
        borderColor: "white",
      }}
    ></View>
  );
};

export default OnlineUserIndicator;
