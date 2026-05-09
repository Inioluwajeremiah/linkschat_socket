import { configureStore } from "@reduxjs/toolkit";
import contactReducer from "./contactSlice";
import amountReducer from "./walletSlice";
import toastReducer from "./toastSlice";
import giftReducer from "./GiftsSlice";
import { apiSlice } from "./apislices/createApiSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "@react-native-async-storage/async-storage";
import authSliceReducer from "./slices/authSlice";
import onboardingSliceReducer from "./slices/onboardingSlice";
import chatSliceReducer from "./slices/chatSlice";
import streamSliceReducer from "./slices/streamSlice";
import viewedStatusReducer from "./slices/statusSlice";
import { viewedStatusMiddleware } from "../utils/statusHelper";

const persistConfig = (key) => ({
  key: key,
  storage,
});

const persistedReducer = persistReducer(
  persistConfig("linkschat_auth"),
  authSliceReducer
);
const persistOnboardingReducer = persistReducer(
  persistConfig("linkschat_onboarding"),
  onboardingSliceReducer
);
const persistStreamReducer = persistReducer(
  persistConfig("linkschat_stream"),
  streamSliceReducer
);
const persistViewedStatus = persistReducer(
  persistConfig("linkschat_viewed_status"),
  viewedStatusReducer
);

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer, //for api slices
    auth: persistedReducer,
    onboarding: persistOnboardingReducer,
    chat: chatSliceReducer,
    contact: contactReducer,
    amount: amountReducer,
    toast: toastReducer,
    gift: giftReducer,
    stream: persistStreamReducer,
    viewedStatus: persistViewedStatus,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      // serializableCheck: {
      //   ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      // },
    }).concat(apiSlice.middleware, viewedStatusMiddleware),
});

export const persistor = persistStore(store);
export default store;
