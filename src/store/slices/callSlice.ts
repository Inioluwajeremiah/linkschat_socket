// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export interface IncomingCallData {
//   callId: string;
//   type: "audio" | "video";
//   callerId: string;
//   callerName: string;
//   callerAvatar?: string;
//   chatId?: string;
// }

// interface CallState {
//   incomingCall: IncomingCallData | null;
//   activeCallId: string | null;
// }

// const initialState: CallState = {
//   incomingCall: null,
//   activeCallId: null,
// };

// const callSlice = createSlice({
//   name: "call",
//   initialState,
//   reducers: {
//     setIncomingCall: (
//       state,
//       action: PayloadAction<IncomingCallData | null>
//     ) => {
//       state.incomingCall = action.payload;
//     },
//     setActiveCallId: (state, action: PayloadAction<string | null>) => {
//       state.activeCallId = action.payload;
//     },
//     clearCall: (state) => {
//       state.incomingCall = null;
//       state.activeCallId = null;
//     },
//   },
// });

// export const { setIncomingCall, setActiveCallId, clearCall } =
//   callSlice.actions;
// export default callSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IncomingCallData {
  callId: string;
  type: "audio" | "video";
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  chatId?: string;
  // NEW — present when the call was initiated in a group chat
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
}

interface CallState {
  incomingCall: IncomingCallData | null;
  activeCallId: string | null;
}

const initialState: CallState = {
  incomingCall: null,
  activeCallId: null,
};

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    setIncomingCall: (
      state,
      action: PayloadAction<IncomingCallData | null>
    ) => {
      state.incomingCall = action.payload;
    },
    setActiveCallId: (state, action: PayloadAction<string | null>) => {
      state.activeCallId = action.payload;
    },
    clearCall: (state) => {
      state.incomingCall = null;
      state.activeCallId = null;
    },
  },
});

export const { setIncomingCall, setActiveCallId, clearCall } =
  callSlice.actions;
export default callSlice.reducer;
