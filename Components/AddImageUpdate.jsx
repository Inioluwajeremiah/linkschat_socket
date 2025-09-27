import {
  Platform,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  View,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import AWS from "aws-sdk";
import { APIEndPoints } from "../utils/ApiEndpoints";
import { windowHeight, windowWidth } from "../utils/Dimensions";
import Ionicons from "@expo/vector-icons/Ionicons";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../utils/Colors";
import { useCreateStatusMutation } from "../Store/apislices/statusApiSlice";
import { useSelector } from "react-redux";
import CameraModal from "./CameraModal";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import LoadingSpinner from "./LoadingSpinner";

const AddImageUpdate = ({}) => {
  const navigation = useNavigation();
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  const [permission, requestPermission] = ImagePicker.useCameraPermissions();
  const [loadingImageUpload, setLoadingImageUpload] = useState(false);
  const [uploadImageUrl, setUploadImageUrl] = useState(null);
  const [imageCaption, setImageCaption] = useState("");
  const [uploadImageError, setUploadImageError] = useState(null);
  const [imagePath, setImagePath] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  // create status slice
  const [createStatus, { isLoading: creatingStatus }] =
    useCreateStatusMutation();

  const imageSize = windowWidth * 0.15;
  const iconSize = imageSize / 2;

  const ToggleCamera = () => {
    setImagePath(null);
    setShowCamera(!showCamera);
  };

  // handle pick image
  const pickImageAsync = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,

        quality: 1,
      });

      // console.log(result.assets);

      if (!result.canceled) {
        setImagePath(result.assets[0]);
      }
    } catch (error) {
      console.log("error picling file ===> ", error);
    }
  };

  const handleUploadImageStatus = async () => {
    if (!imagePath) {
      Alert.alert("", "Please select an image to upload");
      return;
    }
    setLoadingImageUpload(true);
    try {
      const bucketName = "linkschat-s3-bucket";
      AWS.config.update({
        accessKeyId: "AKIARJ62HMLSIOYFFT5I",
        secretAccessKey: "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",
        region: "eu-north-1",
      });
      const s3 = new AWS.S3();
      const file_path =
        Platform.OS === "ios"
          ? imagePath.uri.replace("file://", "")
          : imagePath.uri;
      const fileName = imagePath.fileName
        ? imagePath.fileName
        : `profile_image${new Date().getTime()}.${imagePath.uri.split(".")[3]}`;

      // console.log(
      //   "pickedFile path and name =>",
      //   file_path + " <<===>> " + fileName
      // );
      const uploadFileToS3 = (bucketName, fileName, fileData) => {
        return s3
          .putObject({
            Bucket: bucketName,
            Key: fileName,
            Body: fileData,
          })
          .promise();
      };

      const fileData = await fetch(file_path).then((resp) => resp.blob());
      const s3Result = await uploadFileToS3(bucketName, fileName, fileData);
      // Alert.alert("", "file uploaded");

      // console.log("aws upload rewult in hook ==> ", s3Result);
      if (s3Result && s3Result.ETag) {
        const uploadUrl = APIEndPoints.S3_URL + fileName;
        // console.log("aws upload url in hook ==> ", uploadUrl);

        setUploadImageUrl(uploadUrl);

        //  send to status endpoint
        const res = await createStatus({
          type: "image",
          text: imageCaption,
          imageUrl: uploadUrl,
          userId: userId,
          viewed: [""],
          backgroundColor: "",
        });

        // console.log("handleUploadImageStatus response:", res);
        if (res?.data) {
          setLoadingImageUpload(false);
          navigation.navigate("Home");
        }

        if (res?.error) {
          setLoadingImageUpload(false);
          Alert.alert(
            "",
            res?.error?.data?.message ||
              "Failed to update status. Please try again later"
          );
        }
      } else {
        const error = "An error occured while uploading to AWS";
        Alert.alert("", error);
        setUploadImageError(error);
        setLoadingImageUpload(false);
        // return { result: error };
      }
    } catch (error) {
      // console.log("Error uploading file from document", error);
      Alert.alert("aws upload error", error.message);
      setUploadImageError(error.message);
      setLoadingImageUpload(false);
    }
  };

  useEffect(() => {
    if (showCamera && imagePath) {
      setShowCamera(false);
    }
  }, [imagePath, showCamera]);

  if (showCamera) {
    return (
      <CameraModal
        permission={permission}
        requestPermission={requestPermission}
        setImagePath={setImagePath}
        setShowCamera={setShowCamera}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      {/* <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={60}
        contentContainerStyle={{ flexGrow: 1 }}
      > */}
      <KeyboardAvoidingView
        keyboardVerticalOffset={10}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, position: "relative" }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          {/* header */}
          {imagePath && (
            <View
              style={{
                width: windowWidth - 40,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginHorizontal: 20,
                position: "absolute",
                paddingTop: 20,
                zIndex: 10,
              }}
            >
              <View style={{ flexDirection: "row", gap: 10 }}>
                {/* pick image */}
                <TouchableOpacity
                  onPress={pickImageAsync}
                  style={{
                    width: 40,
                    height: 40,
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  <Ionicons name="images-outline" size={24} color={"#fff"} />
                </TouchableOpacity>
                {/* snap picture */}
                <TouchableOpacity
                  onPress={ToggleCamera}
                  style={{
                    width: 40,
                    height: 40,
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  <Ionicons name="camera-outline" size={24} color={"#fff"} />
                </TouchableOpacity>
                {/* upload to server -> aws and then firebase */}
              </View>

              {/* close button */}
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Home");
                }}
                style={{
                  width: 40,
                  height: 40,
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              >
                <EvilIcons name="close" size={24} color={"gray"} />
              </TouchableOpacity>
            </View>
          )}
          {imagePath && (
            <Image
              source={{
                // uri: "https://linkschat-s3-bucket.s3.eu-north-1.amazonaws.com/8580d7b1-8bd0-48f4-825f-33d1518a6a01.jpeg",
                uri: imagePath.uri,
              }}
              style={{
                width: windowWidth,
                height: windowHeight - 120,
                objectFit: "contain",
              }}
            />
          )}

          {/* close button */}
          {!imagePath && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 40,
                height: 40,
                padding: 8,
                borderRadius: 20,
                marginTop: 20,
                marginRight: 20,
                // flexDirection: "row",
                alignSelf: "flex-end",
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Ionicons name="close-outline" size={24} color={"white"} />
            </TouchableOpacity>
          )}

          {/* select image or take snapshot if no image is selected */}
          {!imagePath && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                paddingHorizontal: 20,
                gap: 20,
              }}
            >
              <TouchableOpacity
                onPress={pickImageAsync}
                style={{
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="images-outline" size={64} color={"gray"} />
                <Text style={{ marginTop: 10, color: "gray" }}>
                  Select from gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={ToggleCamera}
                style={{
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="camera-outline" size={64} color={"gray"} />
                <Text style={{ marginTop: 10, color: "gray" }}>
                  Take selfie
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* action area */}

          {imagePath && (
            <View
              style={{
                position: "absolute",
                zIndex: 9999,
                borderRadius: imageSize,
                flexDirection: "row",
                alignItems: "center",
                width: windowWidth - 40,
                bottom: 70,
                paddingVertical: 10,
                marginHorizontal: 20,
                gap: 6,
              }}
            >
              <TextInput
                value={imageCaption}
                style={{
                  flex: 1,
                  color: "#fff",
                  borderRadius: imageSize,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  paddingHorizontal: 10,
                  borderWidth: 1,
                  borderColor: "gray",
                  paddingVertical: 5,
                  height: imageSize,
                }}
                cursorColor={"#fff"}
                placeholder="add caption"
                placeholderTextColor={"gray"}
                onChangeText={(text) => setImageCaption(text)}
              />
              {/* <TouchableOpacity
            style={{
              width: imageSize * 0.6,
              height: imageSize * 0.6,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: iconSize,
            }}
          >
            <Ionicons
              name="happy-outline"
              size={iconSize}
              color={Colors.primaryColor}
            />
          </TouchableOpacity> */}
              <TouchableOpacity
                onPress={handleUploadImageStatus}
                style={{
                  width: imageSize * 0.85,
                  height: imageSize * 0.85,
                  padding: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: iconSize,
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                {loadingImageUpload || creatingStatus ? (
                  <ActivityIndicator size={"small"} color={"#fff"} />
                ) : (
                  <Ionicons
                    name="cloud-upload-outline"
                    size={iconSize}
                    color={Colors.primaryColor}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddImageUpdate;
