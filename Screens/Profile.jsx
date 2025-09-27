import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import { windowWidth } from "../utils/Dimensions";
import { useEffect, useState } from "react";
import { useUploadImage } from "../hooks/uploadImageHookAws";
import {
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../Store/apislices/userApiSlice";
import { useDispatch, useSelector } from "react-redux";
import LoadingSpinner from "../Components/LoadingSpinner";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Profile = ({ navigation, route }) => {
  const { fromDahboard } = route.params || { fromDahboard: true };
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  const { pickImage, loadingImageUpload, uploadImageUrl } = useUploadImage();

  // console.log("uploadImageUrl ===>  ", uploadImageUrl);

  const [updateProfile, { isLoading: updatingProfile }] =
    useUpdateUserMutation();

  const { data: userProfileData, isLoading: loadingProfileData } =
    useGetUserDetailsQuery({
      userId: userId,
    });

  const [deleteUser, { isLoading: loadingDeleteUser }] =
    useDeleteUserMutation();

  const dispatch = useDispatch();

  // console.log("user profile data ===>> ", userProfileData);

  // bio, department, subjectCombinations
  const [about, setAbout] = useState(userProfileData?.data?.about || "");
  const [userName, setUserName] = useState(
    userProfileData?.data?.userName || ""
  );
  const [profileImageUrl, setProfileImageUrl] = useState(uploadImageUrl || "");

  // console.log("profileImageUrl ===>> ", profileImageUrl);

  const handlepdateProfile = async () => {
    try {
      const response = await updateProfile({
        userId: userId,
        userName: userName ? userName : profileImageUrl,
        imageUrl: uploadImageUrl,
        about: about,
      });

      // console.log(
      //   "response data at update  proifle ===> ",
      //   response?.data?.data
      // );
      if (response.data) {
        Alert.alert("", response?.data?.message);
      }
      if (response?.error) {
        Alert.alert(
          "",
          response?.error?.data?.message ||
            "Unable to update profile. Please try again later"
        );
      }
    } catch (error) {
      // console.log("update profle catch error ==> ", error);
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      Alert.alert("", errorMessage);
    }
  };

  const hanleDeleteProfile = async () => {
    try {
      const response = await deleteUser({
        userId: userId,
      });
      if (response.data) {
        // console.log(
        //   "response data at delete  proifle ===> ",
        //   response?.data?.data
        // );
        await AsyncStorage.clear();
        Alert.alert("", response?.data?.message);

        setTimeout(() => {
          navigation.navigate("Welcome");
        }, 2000);
      }
      if (response?.error) {
        Alert.alert(
          "",
          res?.error?.data?.message ||
            "Unable to delete profile. Please try again later"
        );
      }
    } catch (error) {
      console.log("delete profle catch error ==> ", error);
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
    if (userProfileData?.data) {
      setAbout(userProfileData?.data?.about || "");
      setProfileImageUrl(userProfileData?.data?.imageUrl || "");
      setUserName(userProfileData?.data?.userName || "");
    }
  }, [userProfileData]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1, paddingHorizontal: 20 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          {/* header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              justifyContent: "space-between",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {fromDahboard ? (
                <TouchableOpacity
                  onPress={() => navigation.openDrawer("Home")}
                  style={{
                    width: 40,
                    height: 40,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.2,
                    shadowRadius: 5,
                  }}
                >
                  <MaterialIcons name="menu" size={24} color="black" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
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
                  <MaterialIcons
                    name="keyboard-arrow-left"
                    size={30}
                    color="black"
                  />
                </TouchableOpacity>
              )}
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                  fontFamily: "regular",
                }}
              >
                Profile Setup
              </Text>
            </View>
            <TouchableOpacity onPress={hanleDeleteProfile} style={{}}>
              {loadingDeleteUser ? (
                <LoadingSpinner size={"small"} color={"red"} />
              ) : (
                <EvilIcons name="trash" size={40} color="black" />
              )}
            </TouchableOpacity>
          </View>

          {loadingProfileData ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size={"small"} />
            </View>
          ) : (
            <View>
              {/* profile Image */}
              <View
                style={{
                  marginHorizontal: "auto",
                  position: "relative",
                  marginTop: 20,

                  width: windowWidth * 0.3,
                  height: windowWidth * 0.3,
                }}
              >
                <View
                  style={{
                    width: windowWidth * 0.3,
                    height: windowWidth * 0.3,
                    borderWidth: 1,
                    borderRadius: windowWidth * 0.3,
                    borderColor: "#ccc",
                    alignSelf: "center",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {loadingImageUpload ? (
                    <ActivityIndicator size={"small"} />
                  ) : uploadImageUrl || profileImageUrl ? (
                    <Image
                      source={{
                        uri: uploadImageUrl
                          ? uploadImageUrl
                          : profileImageUrl
                          ? profileImageUrl
                          : userProfileData?.data?.imageUrl,
                      }}
                      style={{ width: 64, height: 64 }}
                    />
                  ) : (
                    <FontAwesome name="user-circle" size={64} color="#5bbbdf" />
                  )}
                </View>
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    width: 40,
                    height: 40,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 20,
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "white",
                    zIndex: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Entypo name="plus" size={30} color="#5bbbdf" />
                </TouchableOpacity>
              </View>

              {/* email */}
              <Text>{}</Text>
              {/* username */}
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 10,
                  marginTop: 20,
                  color: "gray",
                  fontFamily: "regular",
                }}
              >
                User Name
              </Text>
              <TextInput
                placeholderTextColor={"gray"}
                value={userName}
                placeholder=""
                style={{
                  height: 50,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 5,
                  fontSize: 16,
                  paddingHorizontal: 10,
                  marginBottom: 10,

                  backgroundColor: "white",
                  // iOS Shadow
                }}
                onChangeText={(text) => setUserName(text)}
              />
              {/* about */}
              <Text
                style={{
                  fontSize: 14,
                  // fontWeight:"bold",
                  marginBottom: 10,
                  color: "gray",

                  fontFamily: "regular",
                }}
              >
                About
              </Text>
              <TextInput
                placeholderTextColor={"gray"}
                placeholder=""
                value={about}
                style={{
                  height: 50,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 5,
                  fontSize: 16,
                  paddingHorizontal: 10,
                  marginBottom: 10,

                  backgroundColor: "white",
                  // iOS Shadow
                }}
                onChangeText={(text) => setAbout(text)}
              />
              {/* update button */}
              <TouchableOpacity
                onPressOut={handlepdateProfile}
                style={{
                  backgroundColor: "#5bbbdf",
                  padding: 12,
                  borderRadius: 10,
                  marginTop: 20,

                  // justifyContent:"center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  // Android Shadow
                  elevation: 3,
                }}
              >
                {updatingProfile ? (
                  <ActivityIndicator size={"small"} color={"#fff"} />
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
                    Update
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({});
