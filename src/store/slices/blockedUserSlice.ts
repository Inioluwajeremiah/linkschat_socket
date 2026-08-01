import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { blockedUsersApi, privacyApi } from "../../services/api";

interface BlockedState {
  blockedIds: string[];
  loading: boolean;
}

const initialState: BlockedState = { blockedIds: [], loading: false };

export const fetchBlockedUsers = createAsyncThunk("blocked/fetch", async () => {
  const res = await blockedUsersApi.getBlockedUsers();
  if (!res.success) throw new Error("Failed to fetch blocked users");
  // Adjust this mapping if your controller's response shape differs.
  return (res.data.users as any[]).map((u) => u._id) as string[];
});

const blockedSlice = createSlice({
  name: "blocked",
  initialState,
  reducers: {
    // Dispatched immediately on block/unblock for instant UI feedback,
    // without waiting on a refetch round-trip.
    addBlocked: (state, action: PayloadAction<string>) => {
      if (!state.blockedIds.includes(action.payload)) {
        state.blockedIds.push(action.payload);
      }
    },
    removeBlocked: (state, action: PayloadAction<string>) => {
      state.blockedIds = state.blockedIds.filter((id) => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlockedUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.blockedIds = action.payload;
      })
      .addCase(fetchBlockedUsers.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { addBlocked, removeBlocked } = blockedSlice.actions;
export default blockedSlice.reducer;
