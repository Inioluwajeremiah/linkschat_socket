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
import { windowWidth, windowHeight } from "../utils/Dimensions";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import * as Progress from "react-native-progress";
import { useDeleteStatusMutation } from "../Store/apislices/statusApiSlice";
import LoadingSpinner from "../Components/LoadingSpinner";
import { addViewedStatus } from "../Store/slices/statusSlice";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const optionMenuItem = [
  {
    title: "Voice call",
    screen: "VoiceCallScreen",
  },
  {
    title: "Video call",
    screen: "VideoCallScreen",
  },
];

const ViewUpdateScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.auth);
  const { viewedStatus } = useSelector((state) => state.viewedStatus);

  // console.log("viewedStatus at view updates screen ===>>> ", viewedStatus);

  const userId = JSON.parse(userData)?.userId;
  const {
    userDetails,
    allStatusUpdates,
    filterCurrentUserStatus,
    filterByOtherUsersStatus,
    statusIndex,
    fromCurrentUserStatus,
    statusOwnerId,
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

  // console.log("currentStatusItem ===>>> ", currentStatusItem?.id);

  const buttonSize = windowWidth <= 500 ? 40 : windowWidth * 0.1;
  const iconSize = buttonSize / 1.3;
  const imageSize = windowWidth * 0.15;

  const replyingStatus = false;
  const updateWidth = windowWidth / statusOwnerData?.length;

  const ToggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const goToNextStatus = () => {
    setReplyStatusText("");
    if (activeIndex < statusOwnerData?.length - 1) {
      setActiveIndex((prev) => prev + 1);
      dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
    } else if (activeIndex === statusOwnerData?.length - 1) {
      if (fromCurrentUserStatus && filterByOtherUsersStatus?.length > 0) {
        setCurrentStatusIndex(0);
        setCurrentStatusItem(filterByOtherUsersStatus[0]);
        setActiveUserId(currentStatusItem?.data?.userId);
        setActiveIndex(0);
        dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
      }

      if (
        !fromCurrentUserStatus &&
        currentStatusIndex < filterByOtherUsersStatus?.length - 1
      ) {
        setCurrentStatusIndex((prev) => prev + 1);
        setCurrentStatusItem(filterByOtherUsersStatus[currentStatusIndex + 1]);
        setActiveUserId(currentStatusItem?.data?.userId);
        setActiveIndex(0);
        dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
      }

      if (
        !fromCurrentUserStatus &&
        currentStatusIndex === filterByOtherUsersStatus?.length - 1
      ) {
        dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
        navigation.navigate("Home");
      }

      if (
        fromCurrentUserStatus &&
        currentStatusIndex === filterCurrentUserStatus?.length - 1 &&
        filterByOtherUsersStatus?.length === 0
      ) {
        dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
        navigation.navigate("Home");
      }
    }
  };

  const handleNext = () => {
    goToNextStatus();
  };

  // const handleNext = () => {
  //   if (activeIndex < statusOwnerData?.length - 1) {
  //     setActiveIndex((prev) => prev + 1);
  //     dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
  //   } else if (activeIndex === statusOwnerData?.length - 1) {
  //     /**
  //      * note ==>   statusOwnerData has been set above to hold the current status item.
  //      *  so it is independent on where the current status is coming from because it has been resolved before now
  //      *
  //      * activeIndex === statusOwnerData.length - 1 and iffrom current user and
  //      * filterByOtherUsersStatus has some status then next
  //      */
  //     if (fromCurrentUserStatus && filterByOtherUsersStatus?.length > 0) {
  //       setCurrentStatusIndex(0);
  //       setCurrentStatusItem(filterByOtherUsersStatus[0]);
  //       setActiveUserId(currentStatusItem?.data?.userId);
  //       setActiveIndex(0);
  //       dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
  //     }

  //     // continue normal navigation if status is not from current user
  //     if (
  //       !fromCurrentUserStatus &&
  //       currentStatusIndex < filterByOtherUsersStatus?.length - 1
  //     ) {
  //       setCurrentStatusIndex((prev) => prev + 1);
  //       // setCurrentStatusItem(allStatusUpdates?.[currentStatusIndex + 1]);
  //       setCurrentStatusItem(filterByOtherUsersStatus[currentStatusIndex + 1]);
  //       setActiveUserId(currentStatusItem?.data?.userId);
  //       setActiveIndex(0);
  //       dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
  //     }
  //     // navigate to chatscreen when there are no more status left to view
  //     if (
  //       !fromCurrentUserStatus &&
  //       currentStatusIndex === filterByOtherUsersStatus?.length - 1
  //     ) {
  //       navigation.navigate("Home");
  //     }
  //     // navigate to chatscreen when there are no more status left to view checking if the status is coming from the user
  //     if (
  //       fromCurrentUserStatus &&
  //       currentStatusIndex === filterCurrentUserStatus?.length - 1 &&
  //       filterByOtherUsersStatus?.length === 0
  //     ) {
  //       navigation.navigate("Home");
  //     }
  //   }
  // };

  const handlePrevious = () => {
    setReplyStatusText("");
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
      dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
    } else if (activeIndex === 0) {
      // navigate back to the last status of the current user if present, provided the current user
      // has some active status updates (filterCurrentUserStatus?.length > 0)
      // alert("prev level 2");

      if (
        activeUserId !== userId &&
        filterCurrentUserStatus?.length > 0 &&
        currentStatusIndex === filterByOtherUsersStatus?.length - 1
      ) {
        setCurrentStatusIndex(
          filterCurrentUserStatus[filterCurrentUserStatus?.length - 1]
        );
        setCurrentStatusItem(
          filterCurrentUserStatus[filterCurrentUserStatus?.length - 1]
        );
        setActiveUserId(currentStatusItem?.data?.userId);
        setActiveIndex(0);
        dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
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
        dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
      }

      if (
        activeUserId !== userId &&
        currentStatusIndex === filterByOtherUsersStatus?.length - 1
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
        dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
      }

      // navigate to chatscreen when the last status is 0
      if (
        !fromCurrentUserStatus &&
        currentStatusIndex === 0 &&
        filterCurrentUserStatus?.length === 0
      ) {
        dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
        navigation.navigate("Home");
      }
      // navigate to chatscreen when the last status is 0
      if (
        fromCurrentUserStatus &&
        currentStatusIndex === 0 &&
        filterCurrentUserStatus?.length === 0
      ) {
        dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
        navigation.navigate("Home");
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
        setShowMenu(false);
      }
      if (response?.error) {
        Alert.alert(
          "",
          response?.error?.data?.message ||
            "Unable to delete status. Please try again later"
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

  // useEffect(() => {
  //   // Set time left to 30 when a new story starts
  //   setTimeLeft(0);

  //   const timer = setInterval(() => {
  //     setTimeLeft((prev) => {
  //       if (prev === 10) {
  //         // move to next story when time is up
  //         setActiveIndex((prevIndex) => {
  //           if (prevIndex < statusOwnerData?.length - 1) {
  //             return prevIndex + 1;
  //           } else {
  //             return 0; // loop back

  //           }
  //         });

  //         return 0; // reset time
  //       }
  //       return prev + 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, [activeIndex, statusOwnerData?.length]);

  // // Add the userId of status to viewed list if the last status had been viewed
  // useEffect(() => {
  //   if (!statusOwnerData?.length) return;
  //   if (
  //     statusOwnerData?.length - 1 === activeIndex &&
  //     activeUserId === statusOwnerData?.[activeIndex]?.userId
  //   ) {
  //     // dispatch(addViewedStatus(statusOwnerData?.userId));
  //     dispatch(addViewedStatus(statusOwnerData[activeIndex]?.id));
  //   }
  // }, [activeIndex, statusOwnerData]);

  const handleSendMessage = async () => {
    if (!replystatusText.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const content = replystatusText;

    const tempMessage = {
      id: tempId,
      content,
      messageType: "text",
      status: "SENDING",
      senderId: userId,
      receiverId: statusOwnerId,
      createdAt: { _seconds: Math.floor(Date.now() / 1000) },
    };

    setReplyStatusText("");

    socket?.send?.(
      JSON.stringify({
        type: "NEW_MESSAGE",
        ...tempMessage,
        clientTempId: tempId,
      })
    );

    try {
      const res = await createMessage({
        senderId: userId,
        receiverId: statusOwnerId,
        content,
        status: "SENT",
        messageType: "text",
      });

      c;
    } catch (error) {
      // console.error("Error occurred:", error.message);
    }
  };

  useEffect(() => {
    setTimeLeft(0);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 10) {
          goToNextStatus(); // 👈 reuse same logic
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeIndex, statusOwnerData, fromCurrentUserStatus, currentStatusIndex]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          statusOwnerData?.[activeIndex]?.backgroundColor ??
          (statusOwnerData?.[activeIndex]?.type !== "text"
            ? "#000"
            : backgroundColor),
      }}
    >
      <Toast />

      {/* ================= TOP AREA ================= */}
      <View style={{ flex: 1 }}>
        {/* Progress bars */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 8,
            paddingTop: 10,
          }}
        >
          {statusOwnerData?.map((item, index) => (
            <Progress.Bar
              key={item?.id + index}
              progress={index === activeIndex ? (timeLeft * 10) / 100 : 0}
              width={(windowWidth - 32) / statusOwnerData.length}
              height={2}
              borderWidth={0}
              color="#fff"
              unfilledColor={
                activeIndex > index ? "#fff" : "rgba(255,255,255,0.3)"
              }
              style={{ marginHorizontal: 2 }}
            />
          ))}
        </View>

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={28} color="white" />
            </TouchableOpacity>

            <Image
              source={{ uri: statusOwnerData?.imageUrl }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "#fff",
              }}
            />

            <Text
              numberOfLines={1}
              style={{ color: "#fff", fontWeight: "bold" }}
            >
              {userDetails?.data?.userName}
            </Text>
          </View>
        </View>

        {/* ================= CONTENT ================= */}
        <View style={{ flex: 1 }}>
          {/* TEXT STATUS */}
          {statusOwnerData?.[activeIndex]?.type === "text" && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {statusOwnerData?.[activeIndex]?.text}
              </Text>
            </View>
          )}

          {/* IMAGE STATUS */}
          {statusOwnerData?.[activeIndex]?.type === "image" && (
            <View style={{ flex: 1 }}>
              <Image
                source={{ uri: statusOwnerData?.[activeIndex]?.imageUrl }}
                style={{
                  width: windowWidth,
                  height: windowHeight * 0.65,
                }}
                resizeMode="contain"
              />

              {!!statusOwnerData?.[activeIndex]?.text && (
                <Text
                  style={{
                    color: "#fff",
                    paddingHorizontal: 20,
                    paddingTop: 10,
                    textAlign: "center",
                  }}
                >
                  {statusOwnerData?.[activeIndex]?.text}
                </Text>
              )}
            </View>
          )}

          {/* Tap zones */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              flexDirection: "row",
            }}
          >
            <Pressable style={{ flex: 1 }} onPress={handlePrevious} />
            <Pressable style={{ flex: 1 }} onPress={handleNext} />
          </View>
        </View>
      </View>

      {/* ================= REPLY BAR ================= */}
      {statusOwnerId !== userId && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
        >
          <View
            style={{
              padding: 12,
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <TextInput
                value={replystatusText}
                placeholder="Reply..."
                placeholderTextColor="#aaa"
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#444",
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  color: "#fff",
                  height: 40,
                }}
                cursorColor="#fff"
                onChangeText={setReplyStatusText}
              />

              <TouchableOpacity onPress={handleSendMessage}>
                {replyingStatus ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Ionicons name="send-outline" size={24} color="#fff" />
                )}
              </TouchableOpacity>

              {/* <TouchableOpacity>
              <Ionicons name="thumbs-up-outline" size={24} color="#fff" />
            </TouchableOpacity> */}
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ================= OPTIONS MODAL ================= */}
      <Modal transparent visible={showMenu} animationType="fade">
        <Pressable style={{ flex: 1 }} onPress={ToggleMenu}>
          <View
            style={{
              position: "absolute",
              right: 20,
              top: 100,
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 16,
              width: windowWidth * 0.45,
            }}
          >
            {optionMenuItem.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Text style={{ paddingVertical: 8 }}>{item.title}</Text>
              </TouchableOpacity>
            ))}

            {statusOwnerData?.[activeIndex]?.userId === userId && (
              <TouchableOpacity
                onPress={() => handleDelete(statusOwnerData?.[activeIndex]?.id)}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons name="trash-bin-outline" size={18} color="red" />
                <Text style={{ color: "red" }}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default ViewUpdateScreen;
