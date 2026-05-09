import React, { createRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import login from "./o_prev_ui.png";
// import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  useResendOtpMutation,
  useVerifyEmailMutation,
} from "../Store/apislices/authApiSlice";
import { windowWidth } from "../utils/Dimensions";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { setCredentials, setLogin } from "../Store/slices/authSlice";
import {
  clearOnboardingState,
  setIsCompleteOnboarding,
  setStartedOnboarding,
} from "../Store/slices/onboardingSlice";
import messaging from "@react-native-firebase/messaging";

const OtpScreen = ({ navigation, route }) => {
  const { onBoardingId } = useSelector((state) => state.onboarding);
  const dispatch = useDispatch();
  const [verifyEmail, { isLoading: loadingVerifyEmail }] =
    useVerifyEmailMutation();
  const [resendOtp, { isLoading: loadingResendOtp }] = useResendOtpMutation();

  // console.log("onBoardingId ===>> ", onBoardingId);
  const boxSize = windowWidth / 6;
  const boxArray = [...Array(4).keys()];
  const pRefs = Array.from({ length: boxArray.length }, () => createRef());

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [p4, setP4] = useState("");
  const [timeLeft, setTimeLeft] = useState(10 * 60);

  const [fcmToken, setFCMToken] = useState("");

  const isDisabled = !p1 || !p2 || !p3 || !p4;

  const codes = [p1, p2, p3, p4];
  const setCodes = [setP1, setP2, setP3, setP4];

  const handleGoBack = () => {
    dispatch(setStartedOnboarding(false));
    setTimeout(() => {
      navigation.navigate("Login");
    }, 2000);
  };
  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace") {
      // If the current box is empty and backspace is pressed,
      // focus on the previous box if it exists.
      if (codes[index].length === 0 && index > 0) {
        pRefs[index - 1].current?.focus();
      }
    }
  };

  const handleCodeChange = (text, index) => {
    const newCodes = [...codes];
    newCodes[index] = text;
    setCodes[index](text);

    // Move focus to the next box if a digit is entered
    if (text.length === 1 && index < boxArray.length - 1 && text !== " ") {
      pRefs[index + 1].current?.focus();
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  const handleResendOtp = async () => {
    try {
      const response = await resendOtp({ userId: onBoardingId });
      // console.log("handleResendOtp response ===>> ", response);
      if (response.data) {
        setP1("");
        setP2("");
        setP3("");
        setP4("");
        Alert.alert("", response.data.message);
        setTimeLeft(10 * 60);
      }

      if (response.error) {
        Alert.alert(
          "",
          response.error.data.message || "Resend OTP failed. Please try again"
        );
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === "string") errorMessage = error;
      Alert.alert("", errorMessage);
    }
  };

  const handleVerifyEmail = async () => {
    const otp = `${p1}${p2}${p3}${p4}`;
    try {
      const response = await verifyEmail({
        userId: onBoardingId,
        otp,
        fcmToken: fcmToken,
      });

      if (response.data) {
        dispatch(setCredentials(JSON.stringify({ userId: onBoardingId })));
        dispatch(setIsCompleteOnboarding(true));
        dispatch(setLogin(true));
        Alert.alert("", response.data.message);
        navigation.navigate("MainScreen");
      }
      if (response.error) {
        Alert.alert(
          "",
          response.error.data.message ||
            "Verification failed. Please try again later"
        );
      }
    } catch (error) {
      Alert.alert("", error.message);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await messaging().getToken();
        setFCMToken(token);
      } catch (error) {}
    };

    getToken();
  }, []);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1, paddingHorizontal: 20 }}
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}
        >
          <TouchableOpacity
            onPress={handleGoBack}
            style={{
              width: 40,
              height: 40,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
          </TouchableOpacity>
          <Image
            source={login}
            style={{
              width: "100%",
              height: 300,
              resizeMode: "contain",
              borderRadius: 100,
              alignSelf: "center",
            }}
          />
          <View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                // marginBottom:10,
                color: "#5bbbdf",
                fontFamily: "regular",
              }}
            >
              OTP Verification
            </Text>
            <Text
              style={{
                fontSize: 18,
                // marginBottom:10,
                color: "gray",
                marginTop: 10,
                fontFamily: "regular",
              }}
            >
              Lets start again to chat with friends.
            </Text>
          </View>

          <View style={{}}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                // marginBottom:10,
                color: "black",
                fontFamily: "regular",
              }}
            >
              OTP
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              marginVertical: 10,
            }}
          >
            {boxArray.map((_, index) => (
              <TextInput
                keyboardType="numeric"
                key={index}
                style={{
                  width: boxSize,
                  height: boxSize,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 5,
                  fontSize: 18,
                  textAlign: "center",
                  // iOS Shadow
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  // Android Shadow
                  // elevation: 5,
                  fontFamily: "regular",
                }}
                cursorColor="#5bbbdf"
                maxLength={1}
                ref={pRefs[index]}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                value={codes[index]}
              />
            ))}
            {/* <TextInput
              keyboardType="numeric"
              style={{
                width: 60,
                height: 60,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                fontSize: 24,
                textAlign: "center",
                // iOS Shadow
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
                // Android Shadow
                // elevation: 5,
              }}
            />

            <TextInput
              keyboardType="numeric"
              style={{
                width: 60,
                height: 60,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                fontSize: 24,
                textAlign: "center",
                // iOS Shadow
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
                // Android Shadow
                // elevation: 5,
              }}
            />
            <TextInput
              keyboardType="numeric"
              style={{
                width: 60,
                height: 60,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                fontSize: 24,
                textAlign: "center",
                // iOS Shadow
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
                // Android Shadow
                //  elevation: 5,
              }}
            /> */}
          </View>
          <TouchableOpacity
            // onPress={() => {
            //   dispatch(clearOnboardingState());
            //   navigation.navigate("Home");
            // }}
            disabled={!fcmToken}
            onPress={handleVerifyEmail}
            style={{
              backgroundColor: "#5bbbdf",
              padding: 15,
              marginTop: 20,
              borderRadius: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 5,

              elevation: 5,
            }}
          >
            {loadingVerifyEmail ? (
              <ActivityIndicator size={"small"} color="#fff" />
            ) : (
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                  fontFamily: "regular",
                }}
              >
                Verify
              </Text>
            )}
          </TouchableOpacity>

          {/* resend otp */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignSelf: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ color: "gray", fontFamily: "regular", padding: 10 }}>
              Not Received Yet?
            </Text>
            <TouchableOpacity
              style={{ padding: 10 }}
              // onPress={() => navigation.navigate("Login")}
              onPress={handleResendOtp}
            >
              {loadingResendOtp ? (
                <ActivityIndicator size={"small"} color="#000" />
              ) : (
                <Text style={{ fontWeight: "bold", fontFamily: "regular" }}>
                  Resend It
                </Text>
              )}
            </TouchableOpacity>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 14,
                fontFamily: "regular",
                padding: 10,
              }}
            >
              {formatTime(timeLeft)}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    // <SafeAreaView style={{ flex: 1 }}>
    //   <KeyboardAwareScrollView
    //     keyboardShouldPersistTaps="handled"
    //     bottomOffset={22}
    //     style={{ flex: 1 }}
    //     contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}
    //   >
    //     <Image
    //       source={login}
    //       style={{
    //         width: "100%",
    //         height: 300,
    //         resizeMode: "contain",
    //         borderRadius: 100,
    //         alignSelf: "center",
    //       }}
    //     />
    //     <View>
    //       <Text
    //         style={{
    //           fontSize: 24,
    //           fontWeight: "bold",
    //           // marginBottom:10,
    //           color: "#5bbbdf",

    //           fontFamily: "regular",
    //         }}
    //       >
    //         OTP Verification
    //       </Text>
    //       <Text
    //         style={{
    //           fontSize: 18,
    //           // marginBottom:10,
    //           color: "gray",
    //
    //           fontFamily: "regular",
    //         }}
    //       >
    //         Lets start again to chat with friends.
    //       </Text>
    //     </View>

    //     <View
    //       style={{
    //
    //       }}
    //     >
    //       <Text
    //         style={{
    //           fontSize: 24,
    //           fontWeight: "bold",
    //           // marginBottom:10,
    //           color: "black",
    //           fontFamily: "regular",
    //         }}
    //       >
    //         OTP
    //       </Text>
    //     </View>

    //     <View
    //       style={{
    //         flexDirection: "row",
    //         justifyContent: "space-around",
    //         alignItems: "center",

    //         marginVertical: 10,
    //       }}
    //     >
    //       <TextInput
    //         keyboardType="numeric"
    //         style={{
    //           height: 60,
    //           borderWidth: 1,
    //           borderColor: "#ccc",
    //           borderRadius: 5,
    //           fontSize: 18,
    //           textAlign: "center",
    //           // iOS Shadow
    //           shadowColor: "#000",
    //           shadowOffset: { width: 0, height: 5 },
    //           shadowOpacity: 0.2,
    //           shadowRadius: 5,
    //           // Android Shadow
    //           // elevation: 5,
    //           fontFamily: "regular",
    //         }}
    //       />
    //       <TextInput
    //         keyboardType="numeric"
    //         style={{
    //           width: 60,
    //           height: 60,
    //           borderWidth: 1,
    //           borderColor: "#ccc",
    //           borderRadius: 5,
    //           fontSize: 24,
    //           textAlign: "center",
    //           // iOS Shadow
    //           shadowColor: "#000",
    //           shadowOffset: { width: 0, height: 5 },
    //           shadowOpacity: 0.2,
    //           shadowRadius: 5,
    //           // Android Shadow
    //           // elevation: 5,
    //         }}
    //       />

    //       <TextInput
    //         keyboardType="numeric"
    //         style={{
    //           width: 60,
    //           height: 60,
    //           borderWidth: 1,
    //           borderColor: "#ccc",
    //           borderRadius: 5,
    //           fontSize: 24,
    //           textAlign: "center",
    //           // iOS Shadow
    //           shadowColor: "#000",
    //           shadowOffset: { width: 0, height: 5 },
    //           shadowOpacity: 0.2,
    //           shadowRadius: 5,
    //           // Android Shadow
    //           // elevation: 5,
    //         }}
    //       />
    //       <TextInput
    //         keyboardType="numeric"
    //         style={{
    //           width: 60,
    //           height: 60,
    //           borderWidth: 1,
    //           borderColor: "#ccc",
    //           borderRadius: 5,
    //           fontSize: 24,
    //           textAlign: "center",
    //           // iOS Shadow
    //           shadowColor: "#000",
    //           shadowOffset: { width: 0, height: 5 },
    //           shadowOpacity: 0.2,
    //           shadowRadius: 5,
    //           // Android Shadow
    //           //  elevation: 5,
    //         }}
    //       />
    //     </View>
    //     <TouchableOpacity
    //       onPress={() => navigation.navigate("Home")}
    //       style={{
    //         backgroundColor: "#5bbbdf",
    //         padding: 15,
    //         borderRadius: 10,
    //         shadowColor: "#000",
    //         shadowOffset: { width: 0, height: 5 },
    //         shadowOpacity: 0.2,
    //         shadowRadius: 5,

    //         elevation: 5,
    //       }}
    //     >
    //       <Text
    //         style={{
    //           color: "#fff",
    //           fontSize: 18,
    //           fontWeight: "bold",
    //           textAlign: "center",
    //           fontFamily: "regular",
    //         }}
    //       >
    //         SEND OTP
    //       </Text>
    //     </TouchableOpacity>

    //     {/* resend otp */}
    //     <View
    //       style={{
    //         flexDirection: "row",
    //         gap: 3,
    //         alignSelf: "center",
    //         marginTop: 20,
    //       }}
    //     >
    //       <Text style={{ color: "gray", fontFamily: "regular" }}>
    //         Not Received Yet ?
    //       </Text>
    //       <TouchableOpacity onPress={() => navigation.navigate("Login")}>
    //         <Text style={{ fontWeight: "bold", fontFamily: "regular" }}>
    //           Resend It
    //         </Text>
    //       </TouchableOpacity>
    //     </View>
    //   </KeyboardAwareScrollView>
    // </SafeAreaView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
