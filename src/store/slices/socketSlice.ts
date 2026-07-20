import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SocketState } from "../../types";

const initialState: SocketState = {
  isConnected: false,
  onlineUsers: [],
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
  },
});

export const { setConnected, setOnlineUsers, addOnlineUser, removeOnlineUser } =
  socketSlice.actions;
export default socketSlice.reducer;
