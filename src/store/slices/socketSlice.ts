import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SocketState } from "../../types";

const initialState: SocketState = {
  isConnected: false,
  onlineUsers: [],
  presenceSynced: false,
  lastSeen: {},
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
      state.presenceSynced = true;
    },
    addOnlineUser: (state, action: PayloadAction<string>) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter(
        (id) => id !== action.payload
      );
    },
    setLastSeen: (
      state,
      action: PayloadAction<{ userId: string; lastSeen: string | null }>
    ) => {
      state.lastSeen[action.payload.userId] = action.payload.lastSeen;
    },
  },
});

export const {
  setConnected,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setLastSeen,
} = socketSlice.actions;
export default socketSlice.reducer;
