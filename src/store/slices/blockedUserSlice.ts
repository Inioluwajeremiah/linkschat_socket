// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import { blockedUsersApi, privacyApi } from "../../services/api";

// interface BlockedState {
//   blockedIds: string[];
//   loading: boolean;
// }

// const initialState: BlockedState = { blockedIds: [], loading: false };

// export const fetchBlockedUsers = createAsyncThunk("blocked/fetch", async () => {
//   const res = await blockedUsersApi.getBlockedUsers();
//   console.log("fetchBlockedUsers ===>>> ", res);
//   if (!res.success) throw new Error("Failed to fetch blocked users");
//   // Adjust this mapping if your controller's response shape differs.

//   return (res.data.users as any[]).map((u) => u._id) as string[];
// });

// const blockedSlice = createSlice({
//   name: "blocked",
//   initialState,
//   reducers: {
//     // Dispatched immediately on block/unblock for instant UI feedback,
//     // without waiting on a refetch round-trip.
//     addBlocked: (state, action: PayloadAction<string>) => {
//       if (!state.blockedIds.includes(action.payload)) {
//         state.blockedIds.push(action.payload);
//       }
//     },
//     removeBlocked: (state, action: PayloadAction<string>) => {
//       state.blockedIds = state.blockedIds.filter((id) => id !== action.payload);
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchBlockedUsers.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
//         state.loading = false;
//         state.blockedIds = action.payload;
//       })
//       .addCase(fetchBlockedUsers.rejected, (state) => {
//         state.loading = false;
//       });
//   },
// });

// export const { addBlocked, removeBlocked } = blockedSlice.actions;
// export default blockedSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { blockedUsersApi, privacyApi } from "../../services/api";

interface BlockedState {
  blockedIds: string[];
  loading: boolean;
}

const initialState: BlockedState = { blockedIds: [], loading: false };

// export const fetchBlockedUsers = createAsyncThunk(
//   "blocked/fetch",
//   async () => {
//     const res = await blockedUsersApi.getBlockedUsers();
//     console.log("blocked users ===>>> ", res);

//     if (!res.success) throw new Error("Failed to fetch blocked users");
//     // Adjust this mapping if your controller's response shape differs.
//     return (res.data.users as any[]).map((u) => u._id) as string[];
//   },
//   {
//     // Unlike loadDeviceContacts (a one-time sync that never needs
//     // redoing), blocked status is expected to change over the app's
//     // lifetime — so this only guards against two *concurrent* fetches
//     // stepping on each other (e.g. app-load's fetch still in flight when
//     // the Blocked Users screen also fires one on focus), not against
//     // fetching again later once loading has settled.
//     condition: (_, { getState }) => {
//       const { blocked } = getState() as { blocked: BlockedState };
//       return !blocked.loading;
//     },
//   }
// );

export const fetchBlockedUsers = createAsyncThunk(
  "blocked/fetch",
  async () => {
    try {
      const res = await blockedUsersApi.getBlockedUsers();
      console.log("blocked users ===>>> ", res);

      if (!res.success) throw new Error("Failed to fetch blocked users");
      // Adjust this mapping if your controller's response shape differs.
      return (res.data.users as any[]).map((u) => u._id) as string[];
    } catch (err) {
      // Catches network/request failures too, not just the explicit throw
      // above — without this, a failed request would reject with no
      // visibility into why. Re-thrown so the thunk still correctly lands
      // in the .rejected case in extraReducers.
      console.log("fetchBlockedUsers error ===>>", err);
      throw err;
    }
  },
  {
    // Unlike loadDeviceContacts (a one-time sync that never needs
    // redoing), blocked status is expected to change over the app's
    // lifetime — so this only guards against two *concurrent* fetches
    // stepping on each other (e.g. app-load's fetch still in flight when
    // the Blocked Users screen also fires one on focus), not against
    // fetching again later once loading has settled.
    condition: (_, { getState }) => {
      const { blocked } = getState() as { blocked: BlockedState };
      return !blocked.loading;
    },
  }
);
const blockedSlice = createSlice({
  name: "blocked",
  initialState,
  reducers: {
    // Dispatched immediately on block/unblock for instant UI feedback,
    // without waiting on a refetch round-trip. If the underlying API call
    // then fails, dispatch the opposite action to revert rather than
    // calling fetchBlockedUsers again — cheaper and just as correct.
    addBlocked: (state, action: PayloadAction<string>) => {
      if (!state.blockedIds.includes(action.payload)) {
        state.blockedIds.push(action.payload);
      }
    },
    removeBlocked: (state, action: PayloadAction<string>) => {
      state.blockedIds = state.blockedIds.filter((id) => id !== action.payload);
    },
    // Loads the copy saved on this device so blocks still apply offline.
    // Only fills an empty list; a fetched list is fresher.
    hydrateBlocked: (state, action: PayloadAction<string[]>) => {
      if (state.blockedIds.length === 0) state.blockedIds = action.payload;
    },
    // Sign-out: don't carry one account's blocked list to the next.
    clearBlocked: (state) => {
      state.blockedIds = [];
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

export const { addBlocked, removeBlocked, hydrateBlocked, clearBlocked } =
  blockedSlice.actions;
export default blockedSlice.reducer;
