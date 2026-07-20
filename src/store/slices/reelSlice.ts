import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reelApi } from "../../services/api";
import { Reel } from "../../types";

interface ReelState {
  reels: Reel[];
  loading: boolean;
  page: number;
  hasMore: boolean;
  trending: boolean;
}

const initialState: ReelState = {
  reels: [],
  loading: false,
  page: 1,
  hasMore: true,
  trending: false,
};

export const fetchReels = createAsyncThunk(
  "reel/fetch",
  async ({
    page = 1,
    trending = false,
    replace = false,
  }: {
    page?: number;
    trending?: boolean;
    replace?: boolean;
  }) => {
    const res = await reelApi.getReels(page, trending);
    if (!res.success) throw new Error("Failed to fetch reels");
    return { reels: res.data.reels as Reel[], page, trending, replace };
  }
);

export const deleteReelThunk = createAsyncThunk(
  "reel/delete",
  async (reelId: string) => {
    await reelApi.deleteReel(reelId);
    return reelId;
  }
);

const reelSlice = createSlice({
  name: "reel",
  initialState,
  reducers: {
    prependReel: (state, action) => {
      const exists = state.reels.some((r) => r._id === action.payload._id);
      if (!exists) state.reels.unshift(action.payload);
    },
    removeReelOptimistic: (state, action: { payload: string }) => {
      state.reels = state.reels.filter((r) => r._id !== action.payload);
    },
    restoreReel: (
      state,
      action: { payload: { reel: Reel; index: number } }
    ) => {
      state.reels.splice(action.payload.index, 0, action.payload.reel);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReels.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReels.fulfilled, (state, action) => {
        state.loading = false;
        state.trending = action.payload.trending;
        state.page = action.payload.page;
        state.hasMore = action.payload.reels.length === 10;
        state.reels = action.payload.replace
          ? action.payload.reels
          : [...state.reels, ...action.payload.reels];
      })
      .addCase(fetchReels.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { prependReel, removeReelOptimistic, restoreReel } =
  reelSlice.actions;
export default reelSlice.reducer;
