import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MyActiveCall {
  callId: string;
  chatId: string;
  type: "audio" | "video";
}

interface MyCallState {
  active: MyActiveCall | null;
}

const initialState: MyCallState = { active: null };

// Tracks "is THIS device currently joined to a call" — a purely local
// fact (CallScreen knows it the moment call.join() succeeds), kept
// separate from ongoingCallsSlice ("does a call exist for this chat" —
// server-broadcast, shared across everyone). Broadcasting "I've joined"
// back out reliably to your own client is awkward (every call:ongoing
// emission path explicitly skips re-notifying whoever just joined), so
// this is simpler and more robust: just track it locally at the source.
const myCallSlice = createSlice({
  name: "myCall",
  initialState,
  reducers: {
    setMyActiveCall: (state, action: PayloadAction<MyActiveCall>) => {
      state.active = action.payload;
    },
    clearMyActiveCall: (state) => {
      state.active = null;
    },
  },
});

export const { setMyActiveCall, clearMyActiveCall } = myCallSlice.actions;
export default myCallSlice.reducer;
