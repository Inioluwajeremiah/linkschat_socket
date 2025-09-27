import { useState } from "react";
import {
  Button,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider,
} from "reanimated-color-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
// import { SafeAreaView } from "react-native-safe-area-context";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { Colors } from "../utils/Colors";
import { ScrollView } from "react-native-gesture-handler";
import { windowHeight, windowWidth } from "../utils/Dimensions";
import { useNavigation } from "@react-navigation/native";
import { ScrollViewBase } from "react-native";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { useCreateStatusMutation } from "../Store/apislices/statusApiSlice";

const AddTextUpdate = () => {
  const navigation = useNavigation();
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  const [showModal, setShowModal] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(Colors.primaryColor);
  const [statusText, setStatusText] = useState("");

  // create status slice
  const [createStatus, { isLoading: creatingStatus }] =
    useCreateStatusMutation();

  const updatingStatus = false;
  const onSelectColor = ({ hex }) => {
    // "worklet";
    // do something with the selected color.
    // console.log(hex);
    setBackgroundColor(hex);
  };

  const handleToggleColorPalette = () => {
    setShowModal(!showModal);
  };

  function hexToRgb(hex) {
    // Expand shorthand form (#fff) to full form (#ffffff)
    if (hex.length === 4) {
      hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  function isNearWhite(hex, threshold = 240) {
    const { r, g, b } = hexToRgb(hex);
    // Check if all RGB components are above a threshold (e.g., 240 out of 255)
    return r >= threshold && g >= threshold && b >= threshold;
  }

  const handleUploadTextStatus = async () => {
    try {
      const res = await createStatus({
        type: "text",
        text: statusText,
        imageUrl: "",
        userId: userId,
        viewed: [""],
        backgroundColor: backgroundColor,
      });

      // console.log("handleUploadTextStatus response:", res);
      if (res?.data) {
        navigation.navigate("Home");
      }

      if (res?.error) {
        Alert.alert(
          "",
          res?.error?.data?.message ||
            "Failed to update status. Please try again later"
        );
      }
    } catch (error) {
      // console.log("Error updating text status  ==>>> ", error);
      Alert.alert("", error?.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor }}>
      <Toast />
      <KeyboardAvoidingView
        keyboardVerticalOffset={10}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "white", position: "relative" }}
      >
        <View
          style={{
            flex: 1,
            position: "relative",
            backgroundColor: backgroundColor,
          }}
        >
          {/* header */}
          <View
            style={{
              width: windowWidth - 40,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginHorizontal: 20,
              position: "absolute",
              marginTop: 20,
              zIndex: 10,
            }}
          >
            <TouchableOpacity
              onPress={handleToggleColorPalette}
              style={{
                width: 40,
                height: 40,
                padding: 8,
                borderRadius: 20,
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            >
              <Ionicons name="color-palette-sharp" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Home");
                setBackgroundColor("");
              }}
              style={{
                width: 40,
                height: 40,
                padding: 8,
                borderRadius: 20,
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            >
              <EvilIcons
                name="close"
                size={24}
                color={isNearWhite(backgroundColor) ? "black" : "white"}
              />
            </TouchableOpacity>
          </View>

          <TextInput
            multiline
            style={{
              height: windowHeight,
              flex: 1,
              backgroundColor: backgroundColor,
              marginHorizontal: 20,
              marginTop: 60,
              textAlign: "justify",
              textAlignVertical: "top",
              // color: isNearWhite(backgroundColor) ? "gray" : "white",
              color: "white",
            }}
            //   keyboardAppearance="default"
            keyboardType="email-address"
            // cursorColor={isNearWhite(backgroundColor) ? "gray" : "white"}
            cursorColor={"white"}
            onChangeText={(text) => setStatusText(text)}
          />
          {/* sendbutton */}

          {statusText && (
            <TouchableOpacity
              onPress={handleUploadTextStatus}
              style={{
                backgroundColor: "rgba(0,0,0,0.4)",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                bottom: 60,
                height: windowHeight * 0.075,
                borderRadius: 100,
                padding: 10,
                position: "absolute",
                width: windowWidth - 40,
                marginHorizontal: 20,
              }}
            >
              {creatingStatus ? (
                <ActivityIndicator size={"small"} color={"#fff"} />
              ) : (
                <Text style={{ color: "#ffff", fontSize: 14 }}>
                  Update Status
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* switch color modal */}
      <Modal transparent visible={showModal} animationType="slide">
        <Pressable
          style={{ height: "20%" }}
          onPress={() => setShowModal(false)}
        />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{
            flex: 1,
            height: "80%",
            backgroundColor: "white",
            paddingVertical: 20,
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,

            borderTopEndRadius: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginBottom: 20,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Select Text Background Color
            </Text>
            <TouchableOpacity onPress={handleToggleColorPalette}>
              <EvilIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <ColorPicker
            style={{
              // marginHorizontal: 20,
              backgroundColor: "#fff",
              flex: 1,
            }}
            value={Colors.primaryColor}
            // onCompletJS={onSelectColor}
            onCompleteJS={({ hex }) => {
              if (hex && typeof hex === "string") {
                setBackgroundColor(hex);

                // console.log(hex);
              }
            }}
          >
            <Preview style={{}} />
            <Panel1 style={{ marginBottom: 20 }} />
            <HueSlider style={{ marginBottom: 20 }} />
            <OpacitySlider style={{ marginBottom: 20 }} />
            <Swatches style={{ marginBottom: 20 }} />
          </ColorPicker>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
};

export default AddTextUpdate;
