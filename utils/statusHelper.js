import AsyncStorage from "@react-native-async-storage/async-storage";
import { setViewedStatus } from "../Store/slices/statusSlice";
import { useDispatch } from "react-redux";

const STORAGE_KEY = "linkschat_viewed_status";

export const saveViewedStatus = async (data) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadViewedStatus = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const viewedStatusMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type.startsWith("viewedStatus/")) {
    const { viewedStatus } = store.getState().viewedStatus;
    saveViewedStatus(viewedStatus);
  }

  return result;
};

export const hydrateViewedStatus = () => async () => {
  const dispatch = useDispatch();
  const stored = await loadViewedStatus();
  dispatch(setViewedStatus(stored));
};
