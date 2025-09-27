import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import loginImage from "../assets/login.png";
import PhonetInputModal from "../Components/PhonetInputModal";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useRegisterMutation } from "../Store/apislices/authApiSlice";
import { useDispatch } from "react-redux";
import {
  setOnBoardingId,
  setStartedOnboarding,
} from "../Store/slices/onboardingSlice";
import messaging from "@react-native-firebase/messaging";
// import ZegoUIKitPrebuiltCallService from "@zegocloud/zego-uikit-prebuilt-call-rn";
// import * as ZIM from "zego-zim-react-native";
// import * as ZPNs from "zego-zpns-react-native";

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+1");
  const [mobilenumber, setMobilenumber] = useState("");
  const [register, { isLoading, error: loginError }] = useRegisterMutation();

  const [email, setEmail] = useState("");
  const [fcmToken, setFCMToken] = useState("");

  const handleSelect = (code) => {
    // setCountries(Countries);
    setSelectedCountryCode(code);
    setShowModal(false);
  };
  const phone = selectedCountryCode + mobilenumber;

  const handleRegister = async () => {
    try {
      const res = await register({
        email: email.toLowerCase(),
        phone: phone,
        fcmToken: fcmToken,
      });

      console.log("register response:", res);

      console.log("register response obj:", res.data?.data);
      if (res?.data) {
        dispatch(setStartedOnboarding(true));
        // dispatch(setOnBoardingId(res.data?.data?.id));
        dispatch(setOnBoardingId(res.data?.data?.newUser?.id));
        // const userID = res?.data?.data?.userId;
        // const yourAppID = APIEndPoints.ZEGO_APP_ID;
        // const yourAppSign = APIEndPoints.ZEPO_APP_SIGNIN;
        // const userName = res?.data?.data?.userName || "User";
        // ZegoUIKitPrebuiltCallService.init(
        //   yourAppID,
        //   yourAppSign,
        //   userID,
        //   userName,
        //   [ZIM, ZPNs],
        //   {
        //     ringtoneConfig: {
        //       incomingCallFileName: "zego_incoming.mp3",
        //       outgoingCallFileName: "zego_outgoing.mp3",
        //     },
        //     androidNotificationConfig: {
        //       channelID: "ZegoUIKit",
        //       channelName: "ZegoUIKit",
        //     },
        //   }
        // );
        Alert.alert(
          "",
          res.data?.data?.message || "Email has been successfully sent to you"
        );
        setTimeout(() => {
          navigation.navigate("Otp");
        }, 2000);
      }

      if (res?.error) {
        if (
          res?.error?.data?.message ==
          "You have register but can't send you email at the moment"
        ) {
          dispatch(setStartedOnboarding(true));
          // dispatch(setOnBoardingId(res.data?.data?.id));
          dispatch(setOnBoardingId(res.data?.data?.newUser?.id));

          Alert.alert(
            "",
            res.error?.data?.message || "message at error"
            // "Email has been successfully sent to you"
          );
          setTimeout(() => {
            navigation.navigate("Otp");
          }, 2000);
        } else {
          Alert.alert(
            "",
            res?.error?.data?.message ||
              "Register failed. Please try again later"
          );
        }
        // Alert.alert(
        //   "",
        //   res?.error?.data?.message || "Login failed. Please try again later"
        // );
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

  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await messaging().getToken();
        console.log("FCM token at otp screen at register screen ===>> ", token);
        setFCMToken(token);
      } catch (error) {
        console.error("error getting token at otp screen ====>> ", error);
      }
    };

    getToken();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={10}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "white", justifyContent: "center" }}
      >
        <ScrollView
          style={{
            width: "100%",
            backgroundColor: "white",
            flex: 1,
            paddingHorizontal: 20,
          }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <Toast />
          <Image
            source={loginImage}
            style={{
              width: "100%",
              height: 300,
              resizeMode: "contain",
              alignSelf: "center",
            }}
          />
          <View
            style={{
              marginBottom: 10,
              marginTop: 20,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 10,
                color: "#5bbbdf",

                fontFamily: "regular",
              }}
            >
              Register
            </Text>
            <Text
              style={{
                fontSize: 18,
                marginBottom: 10,
                color: "gray",

                fontFamily: "regular",
              }}
            >
              Lets start again to chat with friends.
            </Text>
          </View>

          {/* mobile number */}
          <Text
            style={{
              fontSize: 14,
              marginBottom: 10,
              color: "black",
              fontFamily: "regular",
            }}
          >
            Mobile Number
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              style={{
                width: "22%",
                height: 50,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f0f0f0",
              }}
            >
              <Text style={{ fontFamily: "regular" }}>
                {selectedCountryCode}
              </Text>
            </TouchableOpacity>
            <TextInput
              value={mobilenumber}
              keyboardType="numeric"
              placeholderTextColor={"gray"}
              placeholder="Enter your number"
              style={{
                flex: 1,
                height: 50,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                fontSize: 14,
                paddingHorizontal: 10,
                marginBottom: 10,
                fontFamily: "regular",
                color: "#000",
              }}
              onChangeText={(text) => setMobilenumber(text)}
            />
          </View>

          <Text
            style={{
              fontSize: 14,
              marginTop: 16,
              marginBottom: 10,
              fontFamily: "regular",
            }}
          >
            Email
          </Text>
          <TextInput
            placeholderTextColor={"gray"}
            value={email}
            placeholder="Enter your email"
            style={{
              height: 50,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
              fontSize: 14,
              paddingHorizontal: 10,
              marginBottom: 10,
              backgroundColor: "white",
              fontFamily: "regular",
              color: "#black",
            }}
            onChangeText={(text) => setEmail(text)}
          />
          {/* get otp button */}
          <TouchableOpacity
            // onPress={() => {
            //   dispatch(setStartedOnboarding(true));
            //   navigation.navigate("Otp");
            // }}
            onPress={handleRegister}
            disabled={!mobilenumber || !email}
            style={{
              backgroundColor: !mobilenumber || !email ? "gray" : "#5bbbdf",
              marginTop: 20,
              alignSelf: "center",
              borderRadius: 10,
              height: 50,
              width: "100%",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            {isLoading ? (
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
                GET OTP
              </Text>
            )}
          </TouchableOpacity>
          {/* not yet registrered */}

          <View
            style={{
              flexDirection: "row",
              gap: 3,
              alignSelf: "center",
              marginTop: 20,
            }}
          >
            <Text style={{ color: "gray", fontFamily: "regular" }}>
              Already Registered?
            </Text>
            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={{ fontWeight: "bold", fontFamily: "regular" }}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showModal && (
        <PhonetInputModal
          showModal={showModal}
          setShowModal={setShowModal}
          handleSelect={handleSelect}
          selectedCountryCode={selectedCountryCode}
        />
      )}
    </SafeAreaView>
  );
};

export default RegisterScreen;
