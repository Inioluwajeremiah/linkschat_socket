import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, PayloadAction, ThunkDispatch } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
  isLogin: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userData = action.payload;
    },
    clearCredentials: (state) => {
      state.userData = null;
    },
    setLogin: (state, action) => {
      state.isLogin = action.payload;
    },
    clearLogin: (state) => {
      state.isLogin = false;
    },
  },
});

export const { setCredentials, clearCredentials, setLogin, clearLogin } =
  authSlice.actions;

export default authSlice.reducer;

// Async thunk to load initial user data from AsyncStorage
export const loadInitialUserData = () => async (dispatch) => {
  try {
    const userInfoString = await AsyncStorage.getItem("linkschat_auth");
    if (userInfoString) {
      const userData = JSON.parse(userInfoString);
      dispatch(setCredentials(userData));
    }
  } catch (error) {
    console.error("Error loading user info from AsyncStorage:", error);
  }
};
