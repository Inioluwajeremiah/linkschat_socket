import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { statusApi } from "../../services/api";
import { StatusGroup } from "../../types";

interface StatusState {
  myStatus: StatusGroup | null;
  statuses: StatusGroup[];
  loading: boolean;
}

const initialState: StatusState = {
  myStatus: null,
  statuses: [],
  loading: false,
};

export const fetchStatuses = createAsyncThunk("status/fetch", async () => {
  const res = await statusApi.getStatuses();
  if (!res.success) throw new Error("Failed to fetch statuses");
  return { myStatus: res.data.myStatus, statuses: res.data.statuses };
});

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    clearStatuses: (state) => {
      state.myStatus = null;
      state.statuses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatuses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.myStatus = action.payload.myStatus;
        state.statuses = action.payload.statuses;
      })
      .addCase(fetchStatuses.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearStatuses } = statusSlice.actions;
export default statusSlice.reducer;
