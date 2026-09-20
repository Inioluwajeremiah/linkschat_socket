import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OngoingGroupCall {
  callId: string;
  type: "audio" | "video";
  joinedCount: number;
}

interface OngoingCallsState {
  byChatId: Record<string, OngoingGroupCall>;
}

const initialState: OngoingCallsState = { byChatId: {} };

const ongoingCallsSlice = createSlice({
  name: "ongoingCalls",
  initialState,
  reducers: {
    setOngoingCall: (
      state,
      action: PayloadAction<{ chatId: string; call: OngoingGroupCall }>
    ) => {
      state.byChatId[action.payload.chatId] = action.payload.call;
    },
    clearOngoingCall: (state, action: PayloadAction<{ chatId: string }>) => {
      delete state.byChatId[action.payload.chatId];
    },
  },
});

export const { setOngoingCall, clearOngoingCall } = ongoingCallsSlice.actions;
export default ongoingCallsSlice.reducer;
