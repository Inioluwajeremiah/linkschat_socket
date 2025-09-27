import { configureStore, createSlice } from "@reduxjs/toolkit";

const streamSlice = createSlice({
  name: "stream",
  initialState: { streamClient: null, streamCall: null },
  reducers: {
    setStreamClient: (state, action) => {
      state.streamClient = action.payload;

      console.log();
    },
    setStreamCall: (state, action) => {
      state.streamCall = action.payload;
      console.log("Stream Call set in Redux:", action.payload);
    },
    clearClient: (state) => {
      state.streamClient = null;
    },
    clearCall: (state) => {
      state.streamCall = null;
    },
  },
});

export const {
  setStreamClient,
  setStreamCall,
  clearStreamClient,
  clearStreamCall,
} = streamSlice.actions;

export default streamSlice.reducer;
