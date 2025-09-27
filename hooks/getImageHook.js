import { firebaseStorage } from "../firebaseConfig";

export const useGetProfileImage = (userId) => {
  const [gettingImage, setGettingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  setGettingImage(true);
  getDownloadURL(ref(firebaseStorage, `profileImage/${userId}`))
    .then((url) => {
      // `url` is the download URL for 'images/stars.jpg'

      // This can be downloaded directly:
      const xhr = new XMLHttpRequest();
      xhr.responseType = "blob";
      xhr.onload = (event) => {
        const blob = xhr.response;
      };
      xhr.open("GET", url);
      xhr.send();

      setProfileImageUrl(url);
      setGettingImage(false);
    })
    .catch((error) => {
      // Handle any errors
      console.log("Error fetching profile image:", error);
      setGettingImage(false);
    });

  return { gettingImage, profileImageUrl };
};
