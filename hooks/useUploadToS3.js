import AWS from "aws-sdk";
import { useState } from "react";
import { Alert } from "react-native";
import { APIEndPoints } from "../utils/ApiEndpoints";

export const useUploadToS3 = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [error, setError] = useState(null);

  const uploadToS3 = async ({ uri, fileName, type }) => {
    try {
      setUploading(true);

      AWS.config.update({
        accessKeyId: process.env.EXPO_PUBLIC_ACCESS_KEY,
        secretAccessKey: process.env.EXPO_PUBLIC_SECRET_KEY,
        region: "eu-north-1",
      });

      const s3 = new AWS.S3();
      const bucketName = "linkschat-bucket";

      const fileData = await fetch(uri).then((res) => res.blob());

      const result = await s3
        .putObject({
          Bucket: bucketName,
          Key: fileName,
          Body: fileData,
          ContentType: type,
        })
        .promise();

      if (!result?.ETag) {
        throw new Error("AWS upload failed");
      }

      const fileUrl = result?.ETag ? `${APIEndPoints.S3_URL}${fileName}` : "";

      setUploadedUrl(fileUrl);
      setUploading(false);
      return fileUrl;
    } catch (err) {
      Alert.alert("Upload Error", err.message);
      setError(err.message);
      setUploading(false);
      return null;
    }
  };

  return {
    uploadToS3,
    uploading,
    uploadedUrl,
    error,
  };
};
