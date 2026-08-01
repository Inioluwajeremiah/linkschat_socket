// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
// import chatReducer from './slices/chatSlice';
// import socketReducer from './slices/socketSlice';

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     chat: chatReducer,
//     socket: socketReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['persist/PERSIST'],
//       },
//     }),
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import callReducer from "./slices/callSlice";
import chatReducer from "./slices/chatSlice";
import socketReducer from "./slices/socketSlice";
import onboardingReducer from "./slices/onboardingslice";
import statusReducer from "./slices/statusSlice";
import reelReducer from "./slices/reelSlice";
import contactsReducer from "./slices/contactsSlice";
import blockedUsersReducer from "./slices/blockedUserSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    call: callReducer,
    socket: socketReducer,
    onboarding: onboardingReducer,
    status: statusReducer,
    reel: reelReducer,
    contacts: contactsReducer,
    blocked: blockedUsersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
