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
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useLoginMutation } from "../Store/apislices/authApiSlice";
import { useDispatch } from "react-redux";
import {
  setOnBoardingId,
  setStartedOnboarding,
} from "../Store/slices/onboardingSlice";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import messaging from "@react-native-firebase/messaging";

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+1");
  const [mobilenumber, setMobilenumber] = useState("");
  const [login, { isLoading, error: loginError }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [fcmToken, setFCMToken] = useState("");

  const handleSelect = (code) => {
    // setCountries(Countries);
    setSelectedCountryCode(code);
    setShowModal(false);
  };
  const phone = selectedCountryCode + mobilenumber;

  const handleLogin = async () => {
    try {
      const res = await login({
        email: email.toLowerCase(),
        // phone: phone,
        fcmToken: fcmToken,
      });

      if (res?.data) {
        dispatch(setStartedOnboarding(true));
        dispatch(setOnBoardingId(res.data?.data?.id));

        Alert.alert(
          "",
          res.data?.data?.message || "Email has been successfully sent to you"
        );
        setTimeout(() => {
          navigation.navigate("Otp");
        }, 2000);
      }

      if (res?.error) {
        Alert.alert(
          "",
          res?.error?.data?.message || "Login failed. Please try again later"
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

  // get fcm token
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
      <KeyboardAwareScrollView
        // keyboardVerticalOffset={10}
        // behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1, backgroundColor: "white", paddingHorizontal: 20 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        {/* <ScrollView
          style={{
            width: "100%",
            backgroundColor: "white",
            flex: 1,
            paddingHorizontal: 20,
          }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        > */}
        <View>
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
              Login
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
          {/* <Text
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
              }}
              onChangeText={(text) => setMobilenumber(text)}
            />
          </View> */}

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
              color: "#000",
            }}
            onChangeText={(text) => setEmail(text)}
          />
          {/* get otp button */}
          <TouchableOpacity
            // onPress={() => {
            //   dispatch(setStartedOnboarding(true));
            //   navigation.navigate("Otp");
            // }}
            onPress={handleLogin}
            // disabled={!mobilenumber || !email}
            disabled={!email}
            style={{
              // backgroundColor: !mobilenumber || !email ? "gray" : "#5bbbdf",
              backgroundColor: !email ? "gray" : "#5bbbdf",
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
              Not Registered?
            </Text>
            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={{ fontWeight: "bold", fontFamily: "regular" }}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
          {/* </ScrollView>*/}
        </View>
      </KeyboardAwareScrollView>

      {/* {showModal && (
        <PhonetInputModal
          showModal={showModal}
          setShowModal={setShowModal}
          handleSelect={handleSelect}
          selectedCountryCode={selectedCountryCode}
        />
      )} */}
    </SafeAreaView>
  );
};

export default LoginScreen;
