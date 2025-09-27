import { useLogoutMutation } from "../Store/apislices/authApiSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { clearCredentials, clearLogin } from "../Store/slices/authSlice";
import { Alert } from "react-native";
// import ZegoUIKitPrebuiltCallService from "@zegocloud/zego-uikit-prebuilt-call-rn";

const useLogout = () => {
  const navigation = useNavigation();
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useDispatch();
  const onUserLogout = async () => {
    try {
      // await logout().unwrap();
      dispatch(clearLogin());

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }, 2000);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { onUserLogout, isLoading };
};

export default useLogout;
