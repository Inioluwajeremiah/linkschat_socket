import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "../utils/Colors";
import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { APIEndPoints } from "../utils/ApiEndpoints";
import { useSelector } from "react-redux";
import { useGetUserDetailsQuery } from "../Store/apislices/userApiSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LinksChatStreamVideoProvider = ({ children }) => {
  const [videoClient, setVideoClient] = useState(null);
  const [localProfile, setLocalProfile] = useState(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const { userData } = useSelector((state) => state.auth);
  const userId = JSON.parse(userData)?.userId;

  // 🔹 Run query only if needed
  const {
    data: userProfileData,
    isLoading: loadingProfileData,
    error: userProfileDataError,
  } = useGetUserDetailsQuery({ userId });

  // 🔹 Load profile from AsyncStorage first
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem("@userProfile");

        if (storedProfile) {
          setLocalProfile(JSON.parse(storedProfile));
          setShouldFetch(false); // don’t fetch if we already have it
        } else {
          setShouldFetch(true); // fetch only if missing
        }
      } catch (err) {
        // console.error("Failed to load user profile:", err);
        setShouldFetch(true);
      }
    };
    loadProfile();
  }, []);

  // 🔹 Save profile from API to AsyncStorage
  useEffect(() => {
    if (userProfileData?.data) {
      const profileToSave = {
        userId,
        userName: userProfileData.data.userName,
        imageUrl: userProfileData.data.imageUrl,
        streamToken: userProfileData.data.streamToken,
      };

      setLocalProfile(profileToSave);
      AsyncStorage.setItem("@userProfile", JSON.stringify(profileToSave)).catch(
        (err) => {
          // console.error("Failed to save profile:", err);
        }
      );
    }
  }, [userProfileData, userId]);

  // 🔹 Setup StreamVideoClient
  useEffect(() => {
    if (!localProfile) return;

    const client = new StreamVideoClient({
      apiKey: APIEndPoints.STREAM_API_KEY,
      user: {
        id: localProfile?.userId,
        name: localProfile?.userName,
        image: localProfile?.imageUrl,
      },
      token: localProfile?.streamToken,
      options: {
        maxConnectUserRetries: 100,
        onConnectUserError: (err, allErrors) => {
          // console.error("Failed to connect user", err, allErrors);
        },
      },
    });

    setVideoClient(client);

    return () => {
      client.disconnectUser();
    };
  }, [localProfile]);

  // 🔹 Loading state
  if (!videoClient || (shouldFetch && loadingProfileData)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={Colors.primaryColor} size="small" />
      </View>
    );
  }

  return (
    <StreamVideo style={{ flex: 1 }} client={videoClient}>
      {children}
    </StreamVideo>
  );
};

export default LinksChatStreamVideoProvider;
