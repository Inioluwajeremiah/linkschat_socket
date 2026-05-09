import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Colors } from "../utils/Colors";
import { windowWidth, windowHeight } from "../utils/Dimensions";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import * as Progress from "react-native-progress";
import { useDeleteStatusMutation } from "../Store/apislices/statusApiSlice";
import LoadingSpinner from "../Components/LoadingSpinner";
import { addViewedStatus } from "../Store/slices/statusSlice";

const optionMenuItem = [
  {
    title: "Voice call",
    screen: "CallScreen",
  },
  {
    title: "Video call",
    screen: "CallScreen",
  },
];

const ViewUpdateScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;
  const {
    userDetails,
    allStatusUpdates,
    filterCurrentUserStatus,
    filterByOtherUsersStatus,
    statusIndex,
    fromCurrentUserStatus,
    refetchUpdate,
  } = route.params;

  const [currentStatusIndex, setCurrentStatusIndex] = useState(
    statusIndex || 0
  );
  const [currentStatusItem, setCurrentStatusItem] = useState(
    // statusIndex ? allStatusUpdates[currentStatusItem] : allStatusUpdates[0]
    fromCurrentUserStatus
      ? filterCurrentUserStatus[currentStatusIndex]
      : filterByOtherUsersStatus[currentStatusIndex]
  );
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#5bbbdf");
  const [replystatusText, setReplyStatusText] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeUserId, setActiveUserId] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const statusOwnerData = currentStatusItem?.data;

  const [deleteStatus, { isLoading: deletingStatus }] =
    useDeleteStatusMutation();

  const buttonSize = windowWidth <= 500 ? 40 : windowWidth * 0.1;
  const iconSize = buttonSize / 1.3;
  const imageSize = windowWidth * 0.15;

  const statusLength = fromCurrentUserStatus
    ? filterCurrentUserStatus?.length
    : filterByOtherUsersStatus?.length;

  const replyingStatus = false;
  const updateWidth = windowWidth / statusOwnerData?.length;
  // const updateWidth = windowWidth / statusLength;

  const ToggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleNext = () => {
    if (activeIndex < statusOwnerData?.length - 1) {
      // if (activeIndex < statusLength - 1) {
      setActiveIndex((prev) => prev + 1);
    } else if (activeIndex === statusOwnerData?.length - 1) {
      // } else if (activeIndex === statusLength - 1) {
      // if allStatusUpdates length form currentUser is 1 i.e index 0, then
      // if (
      //   currentStatusIndex < allStatusUpdates?.length - 1 ||
      //   fromCurrentUserStatus
      // ) {
      //   alert("right pressed");
      //   setCurrentStatusIndex((prev) => prev + 1);
      //   setCurrentStatusItem(allStatusUpdates?.[currentStatusIndex + 1]);
      //   setActiveUserId(currentStatusItem?.data?.userId);
      //   setActiveIndex(0);
      // }

      /**
       * note ==>   statusOwnerData has been set above to hold the current status item.
       *  so it is independent on where the current status is coming from because it has been resolved before now
       *
       * activeIndex === statusOwnerData.length - 1 and iffrom current user and
       * filterByOtherUsersStatus has some status then next
       */
      if (fromCurrentUserStatus && filterByOtherUsersStatus?.length > 0) {
        alert("right pressed");
        setCurrentStatusIndex(0);
        setCurrentStatusItem(filterByOtherUsersStatus[0]);
        setActiveUserId(currentStatusItem?.data?.userId);
        setActiveIndex(0);
      }

      // continue normal navigation if status is not from current user
      if (
        !fromCurrentUserStatus &&
        currentStatusIndex < filterCurrentUserStatus?.length - 1
      ) {
        alert("right pressed");
        setCurrentStatusIndex((prev) => prev + 1);
        // setCurrentStatusItem(allStatusUpdates?.[currentStatusIndex + 1]);
        setCurrentStatusItem(filterCurrentUserStatus[currentStatusIndex + 1]);
        setActiveUserId(currentStatusItem?.data?.userId);
        setActiveIndex(0);
      }
    }
  };

  const handlePrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    } else if (activeIndex === 0) {
      // navigate back to the last status of the current user if present provided the current user
      // has some active status updates (filterCurrentUserStatus?.length > 0)

      // console.log("currentStatusIndex ===>> ", currentStatusIndex);
      // console.log(
      //   "filterByOtherUsersStatus?.length - 1 ==> ",
      //   filterByOtherUsersStatus?.length - 1
      // );
      // console.log(
      //   "filterCurrentUserStatus?.length  ==> ",
      //   filterCurrentUserStatus?.length
      // );
      // console.log("fromCurrentUserStatus ===>> ", fromCurrentUserStatus);

      if (
        activeUserId !== userId &&
        filterCurrentUserStatus?.length > 0 &&
        currentStatusIndex === filterByOtherUsersStatus?.length - 1
      ) {
        alert("left pressed");
        setCurrentStatusIndex(
          filterCurrentUserStatus[filterCurrentUserStatus?.length - 1]
        );
        setCurrentStatusItem(
          filterCurrentUserStatus[filterCurrentUserStatus?.length - 1]
        );
        setActiveUserId(currentStatusItem?.data?.userId);
        setActiveIndex(0);
      }

      // navigate back to previous status  of others i.e not owned by current user provided
      // the current index is less than statuses posted by other (filterByOtherUsersStatus?.length - 1)
      if (
        activeUserId !== userId &&
        currentStatusIndex < filterByOtherUsersStatus?.length - 1
      ) {
        setCurrentStatusIndex((prev) => prev - 1);
        setCurrentStatusItem(
          filterByOtherUsersStatus?.[currentStatusIndex - 1]
        );
        setActiveUserId(
          filterByOtherUsersStatus?.[currentStatusIndex - 1]?.userId
        );
        setActiveIndex(
          filterByOtherUsersStatus?.[currentStatusIndex - 1]?.data?.length - 1
        );
      }

      // if (currentStatusIndex > 0) {
      // setCurrentStatusIndex((prev) => prev - 1);
      // setCurrentStatusItem(allStatusUpdates?.[currentStatusIndex - 1]);
      // setActiveUserId(allStatusUpdates?.[currentStatusIndex - 1]?.userId);
      // setActiveIndex(
      //   allStatusUpdates?.[currentStatusIndex - 1]?.data.length - 1
      // );
      // }
    }
  };
  const handleDelete = async (itemId) => {
    try {
      const response = await deleteStatus({
        statusId: itemId,
        userId: userId,
      });
      if (response?.data) {
        Toast.show({
          type: "success",
          text1: "Status deleted successfully",
        });
        navigation.navigate("Home");
        setShowMenu(false);
      }
      if (response?.error) {
        Alert.alert(
          "",
          response?.error?.data?.message ||
            "Unable to delete status. Please try again later"
        );
      }
      // console.log("delete status response ===>>> ", response);
      // console.log("delete status id ===>>> ", itemId);
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

  useEffect(() => {
    // Set time left to 30 when a new story starts
    setTimeLeft(0);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 10) {
          // move to next story when time is up
          setActiveIndex((prevIndex) => {
            if (prevIndex < statusOwnerData?.length - 1) {
              // if (prevIndex < statusLength - 1) {
              return prevIndex + 1;
            } else {
              return 0; // loop back
            }
          });

          return 0; // reset time
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeIndex, statusOwnerData?.length]);
  // }, [activeIndex, statusLength]);

  // Add the userId of status to viewed list if the last status had been viewed
  useEffect(() => {
    if (!statusOwnerData?.length) return;
    if (
      statusOwnerData?.length - 1 === activeIndex &&
      activeUserId === statusOwnerData?.[activeIndex]?.userId
    ) {
      dispatch(addViewedStatus(statusOwnerData?.userId));
    }
  }, [activeIndex, statusOwnerData]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: statusOwnerData?.[activeIndex]?.backgroundColor
          ? statusOwnerData?.[activeIndex]?.backgroundColor
          : statusOwnerData?.[activeIndex]?.type !== "text"
          ? "#000"
          : backgroundColor,
      }}
    >
      <Toast />
      <KeyboardAvoidingView
        keyboardVerticalOffset={20}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, position: "relative" }}
      >
        {/* updates/status indicator */}

        {/* <Text style={{ color: "white" }}> {formatTime(timeLeft)}</Text> */}
        <View
          style={{
            width: windowWidth,
            maxWidth: windowWidth,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginTop: 10,
          }}
        >
          {statusOwnerData?.map((item, index) => (
            <Progress.Bar
              key={item?.id + index.toString()}
              progress={index === activeIndex ? (timeLeft * 10) / 100 : 0}
              // : index > activeIndex
              // ? 1
              width={updateWidth - 16}
              height={2}
              borderWidth={0}
              color={"#fff"}
              unfilledColor={
                activeIndex > index ? "#fff" : "rgba(255,255,255,0.3)"
              }
              style={{ marginHorizontal: 2 }}
            />
          ))}
        </View>

        {/* profile image and options*/}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              // marginRight:20
            }}
          >
            {/* back arrow */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Home")}
              style={{
                width: iconSize,
                height: iconSize,
                justifyContent: "center",
                alignItems: "center",

                elevation: 5,
              }}
            >
              <Ionicons name="arrow-back-outline" size={34} color="white" />
            </TouchableOpacity>

            {/* middle view - user details */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",

                gap: 10,
              }}
            >
              <Image
                source={{ uri: statusOwnerData?.imageUrl }}
                style={{
                  width: imageSize,
                  height: imageSize,
                  borderRadius: imageSize / 2,
                  borderColor: "white",
                  borderWidth: 1,
                }}
              />

              <Text
                style={{
                  fontFamily: "bold",
                  fontWeight: "bold",
                  color: "white",
                }}
                numberOfLines={1}
              >
                {userDetails?.data?.userName}
              </Text>
            </View>
          </View>
          {/* options menu */}
          <TouchableOpacity
            onPress={ToggleMenu}
            style={{
              width: iconSize,
              height: iconSize,
              borderColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="ellipsis-vertical-outline"
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* show content - image or text */}
        <View
          style={{
            flex: 1,
            backgroundColor: statusOwnerData?.[activeIndex]?.backgroundColor,
          }}
        >
          {/* display text */}
          {typeof statusOwnerData?.[activeIndex]?.text === "string" &&
            statusOwnerData?.[activeIndex]?.type === "text" && (
              <Text
                style={{
                  flex: 1,
                  color: "#fff",
                  paddingHorizontal: "20",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {statusOwnerData?.[activeIndex]?.text}
              </Text>
            )}
          {/* display image */}
          {statusOwnerData?.[activeIndex]?.type === "image" && (
            <View style={{ flex: 1 }}>
              <Image
                style={{
                  width: windowWidth,
                  height: windowHeight * 0.6,
                  objectFit: "contain",
                }}
                source={{ uri: statusOwnerData?.[activeIndex]?.imageUrl }}
              />
              <Text
                style={{
                  marginTop: 12,
                  backgroundColor: "#000",
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: "regular",
                  paddingHorizontal: 20,
                  textAlign: "center",
                }}
              >
                {statusOwnerData?.[activeIndex]?.text}
              </Text>
            </View>
          )}

          {/* left and right navigation */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              position: "absolute",
              width: windowWidth,
              height: windowHeight * 0.6,
            }}
          >
            <Pressable
              style={{
                flex: 1,

                borderColor: "#fff",
              }}
              onPress={handlePrevious}
            />
            <Pressable
              style={{ flex: 1, borderColor: "#fff" }}
              onPress={handleNext}
            />
          </View>
        </View>

        {/* status update action area - textinput, send and like button  */}
        {/* <View
          style={{
            position: "relative",
            flexDirection: "row",
            backgroundColor: backgroundColor,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              bottom: 10,
              height: windowHeight * 0.075,
              borderRadius: 100,
              padding: 10,
              position: "absolute",
              width: windowWidth - 40,
              marginHorizontal: 20,
              flexDirection: "row",
              gap: 10,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "gray",
                borderRadius: 20,
                paddingHorizontal: 10,
              }}
              cursorColor={"gray"}
              onChange={(text) => setReplyStatusText(text)}
            />

   
            <TouchableOpacity style={{}}>
              {replyingStatus ? (
                <ActivityIndicator size={"small"} color={"#fff"} />
              ) : (
                <Ionicons name="send-outline" color={"#fff"} size={24} />
              )}
            </TouchableOpacity>

          
            <TouchableOpacity style={{}}>
              {replyingStatus ? (
                <ActivityIndicator size={"small"} color={"#fff"} />
              ) : (
                <Ionicons name="thumbs-up-outline" size={24} color={"white"} />
              )}
            </TouchableOpacity>
          </View>
        </View> */}
      </KeyboardAvoidingView>

      {/* options menu */}
      <Modal transparent visible={showMenu} animationType="none">
        <Pressable style={{ height: windowHeight }} onPress={ToggleMenu}>
          <View
            style={{
              position: "absolute",
              right: 20,
              top: 100,
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 20,
              width: windowWidth * 0.4,
            }}
          >
            {optionMenuItem.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Text style={{ fontSize: 14, paddingVertical: 5 }}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}

            {statusOwnerData?.[activeIndex]?.userId === userId && (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  // justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 0,
                }}
                onPress={() => handleDelete(statusOwnerData?.[activeIndex]?.id)}
              >
                {deletingStatus ? (
                  <LoadingSpinner color={Colors.primaryColor} />
                ) : (
                  <>
                    <Ionicons name="trash-bin-outline" size={20} color="red" />
                    <Text
                      style={{ fontSize: 14, paddingVertical: 5, color: "red" }}
                    >
                      Delete
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  progressContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  progressBackground: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(0,0,0,0.3)",
    marginHorizontal: 2,
    borderRadius: 2,
  },
  progressBar: {
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
});

export default ViewUpdateScreen;
