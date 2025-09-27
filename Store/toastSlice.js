// features/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';
const toastSlice = createSlice({
  name: 'toast',
  initialState: {
    toast: true,
  },
  reducers: {
    setToast: (state, action) => {
      state.amount = action.payload;
    },

  },
});

export const { setToast } = toastSlice.actions;
export default toastSlice.reducer;