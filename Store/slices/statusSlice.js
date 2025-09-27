import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  viewedStatus: [], // [{ id, timestamp }]
};

const viewedStatusSlice = createSlice({
  name: "viewedStatus",
  initialState,
  reducers: {
    setViewedStatus: (state, action) => {
      state.viewedStatus = action.payload;
    },

    addViewedStatus: (state, action) => {
      const statusId = action.payload;
      const alreadyViewed = state.viewedStatus.some(
        (status) => status.id === statusId
      );

      if (!alreadyViewed) {
        state.viewedStatus.push({
          id: statusId,
          timestamp: Date.now(),
        });
      }
    },

    clearExpiredViewedStatus: (state) => {
      const oneDay = 24 * 60 * 60 * 1000;
      const now = Date.now();
      state.viewedStatus = state.viewedStatus.filter(
        (status) => now - status.timestamp < oneDay
      );
    },

    clearViewedStatus: (state) => {
      state.viewedStatus = [];
    },
  },
});

export const {
  setViewedStatus,
  addViewedStatus,
  clearViewedStatus,
  clearExpiredViewedStatus,
} = viewedStatusSlice.actions;

export default viewedStatusSlice.reducer;
