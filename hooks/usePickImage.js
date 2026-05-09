import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Platform, Alert } from "react-native";

export const usePickImage = () => {
  const [image, setImage] = useState(null);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    try {
      setPicking(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) {
        setPicking(false);
        return null;
      }

      const asset = result.assets[0];

      const uri =
        Platform.OS === "ios" ? asset.uri.replace("file://", "") : asset.uri;

      const fileName =
        asset.fileName ??
        `profile_image_${Date.now()}.${asset.uri.split(".").pop()}`;

      const pickedImage = {
        uri,
        fileName,
        type: asset.mimeType ?? "image/jpeg",
      };

      setImage(pickedImage);
      setPicking(false);
      return pickedImage;
    } catch (err) {
      Alert.alert("Image Picker Error", err.message);
      setError(err.message);
      setPicking(false);
      return null;
    }
  };

  return {
    pickImage,
    image,
    picking,
    error,
  };
};
