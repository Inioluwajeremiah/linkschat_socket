import AWS from "aws-sdk";
import { Alert, Platform } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { APIEndPoints } from "../utils/ApiEndpoints";
import { useSelector } from "react-redux";

export const useUploadImage = () => {
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  const [loadingImageUpload, setLoadingImageUpload] = useState(false);
  const [uploadImageUrl, setUploadImageUrl] = useState(null);
  const [uploadImageError, setUploadImageError] = useState(null);

  const pickImage = async () => {
    try {
      const bucketName = "linkschat-s3-bucket";
      AWS.config.update({
        accessKeyId: "AKIARJ62HMLSIOYFFT5I",
        secretAccessKey: "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",
        region: "eu-north-1",
      });
      const s3 = new AWS.S3();

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      // console.log(result.assets);

      if (!result.canceled) {
        setLoadingImageUpload(true);
        // setImagePath(result.assets[0].uri);
        const file_path =
          Platform.OS === "ios"
            ? result.assets[0].uri.replace("file://", "")
            : result.assets[0].uri;
        const fileName = result.assets[0].fileName
          ? result.assets[0].fileName
          : `profile_image${new Date().getTime()}.${
              result.assets[0].uri.split(".")[3]
            }`;

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
          setLoadingImageUpload(false);
          Alert.alert("", "Image uploaded successfully");
          // return { result: uploadUrl };
        } else {
          const error = "An error occured while uploading to AWS";
          Alert.alert("", error);
          setUploadImageError(error);
          setLoadingImageUpload(false);
          // return { result: error };
        }
      }
    } catch (error) {
      // console.log("Error uploading file from document", error);
      Alert.alert("aws upload error", error.message);
      setUploadImageError(error.message);
      setLoadingImageUpload(false);
      // return { result: error };
    }
  };

  // return result;
  return {
    pickImage, // call this from a button or event
    loadingImageUpload,
    uploadImageUrl,
    uploadImageError,
  };
};
