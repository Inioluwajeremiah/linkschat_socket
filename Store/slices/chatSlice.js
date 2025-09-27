import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  refetchChat: false,
  userChats: [],
  userChatsToDelete: [],
};

const chatSlice = createSlice({
  name: "refetchChat",
  initialState,
  reducers: {
    // Set full viewed status list (for initial load)
    setRefetchChat: (state, action) => {
      state.refetchChat = action.payload;
    },
    setUserChats: (state, action) => {
      state.userChats = action.payload;
    },
    setUserChatsToDelete: (state, action) => {
      state.userChatsToDelete = action.payload;
    },
  },
});

export const { setRefetchChat, setUserChats, setUserChatsToDelete } =
  chatSlice.actions;

export default chatSlice.reducer;
