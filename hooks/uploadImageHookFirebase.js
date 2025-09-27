import { useSelector } from "react-redux";
import { firebaseStorage } from "../firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// async function uploadImageAsync(uri, userId) {
//   setLoadingImageUpload(true);

//   const response = await fetch(uri);
//   const blob = await response.blob();

//   const fileRef = ref(firebaseStorage, "profileImage/" + userId);
//   const result = await uploadBytes(fileRef, blob);

//   // We're done with the blob, close and release it
//   // blob.close();

//   return await getDownloadURL(fileRef);
// }

// export const usePickImage = async () => {
//   const { userData } = useSelector((state) => state.auth);
//   const userId = JSON.parse(userData)?.userId;
//   const [loadingImageUpload, setLoadingImageUpload] = useState(false);
//   const [uploadImageUrl, setUploadImageUrl] = useState(null);
//   const [uploadImageError, setUploadImageError] = useState(null);

//   // No permissions request is necessary for launching the image library

//   let result = await ImagePicker.launchImageLibraryAsync({
//     mediaTypes: ["images"],
//     allowsEditing: true,
//     aspect: [4, 3],
//     quality: 1,
//   });
//   if (!result.canceled) {
//     try {
//       setLoadingImageUpload(true);
//       const uploadUrl = await uploadImageAsync(result.assets[0].uri, userId);

//       console.log("uploadUrl => ", uploadUrl);

//       setUploadImageUrl(uploadUrl);
//       // return uploadUrl;
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       setLoadingImageUpload(false);
//       setUploadImageError(error);
//       return null;
//     }
//   }

//   return {
//     loadingImageUpload,
//     uploadImageUrl,
//     uploadImageError,
//   };
// };

async function uploadImageAsync(uri, userId) {
  const response = await fetch(uri);
  const blob = await response.blob();

  const fileRef = ref(firebaseStorage, "profileImage/" + userId);
  await uploadBytes(fileRef, blob);
  return await getDownloadURL(fileRef);
}

export const usePickImage = () => {
  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  // console.log("userid at usePickImage ===>>  ", userId);

  const [loadingImageUpload, setLoadingImageUpload] = useState(false);
  const [uploadImageUrl, setUploadImageUrl] = useState(null);
  const [uploadImageError, setUploadImageError] = useState(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setLoadingImageUpload(true);
        const uploadUrl = await uploadImageAsync(result.assets[0].uri, userId);
        setUploadImageUrl(uploadUrl);
        setLoadingImageUpload(false);
        return uploadUrl;
      }
    } catch (error) {
      setUploadImageError(error);
      setLoadingImageUpload(false);
      console.error("Image upload error:", error);
    }
    return null;
  };

  return {
    pickImage, // call this from a button or event
    loadingImageUpload,
    uploadImageUrl,
    uploadImageError,
  };
};

// handle update image using flask
const uploadImage = (imageData) => {
  setLoadingImageUpload(true);

  const filename = imageData.uri.split("/").pop();
  const filetype = filename.split(".").pop();

  let formData = new FormData();
  formData.append(
    "file",
    {
      uri: imageData.uri,
      name: `image.${filetype}`,
      type: `image/${filetype}`,
    }
    // imageData, imageData.fileName
  );
};

const handleUploadProfileImage = async () => {
  const uploadTask = await uploadBytesResumable(storageRef, file, metadata);

  // Listen for state changes, errors, and completion of the upload.
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      // console.log("Upload is " + progress + "% done");
      setUploadProgress(progress);

      switch (snapshot.state) {
        case "paused":
          // console.log("Upload is paused");
          Alert.alert("", "Upload is paused");
          setUploadingImage(false);
          break;
        case "running":
          // console.log("Upload is running");
          setUploadingImage(true);
          break;
      }
    },
    (error) => {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case "storage/unauthorized":
          // User doesn't have permission to access the object
          setUploadingImage(false);
          Alert.alert("", "You are not authorized to upload this image");

          break;
        case "storage/canceled":
          setUploadingImage(false);
          // User canceled the upload
          Alert.alert("", "Upload canceled");
          break;

        case "storage/unknown":
          // Unknown error occurred, inspect error.serverResponse
          setUploadingImage(false);
          Alert.alert("", "Unknown error occurred, please try again later");
          break;
      }
    },
    () => {
      // Upload completed successfully, now we can get the download URL
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        // console.log("File available at", downloadURL);
        setDownloadURL(downloadURL);
      });
    }
  );
};
