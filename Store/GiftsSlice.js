// features/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';
import woman from "./woman.png";
import man from "./profile.png";

const giftsSlice = createSlice({
  name: 'gift',
  initialState: {
    items: [
        ],
  },
  reducers: {
    addGift: (state, action) => {
      return {
        items: [
          action.payload,
          ...state.items
        ],
      };
    },
    
    removeItem: (state, action) => {
      const itemIndex = state.items.findIndex(item => item.id === action.payload);
      
      if (state.items[itemIndex]) {
        state.total -= state.items[itemIndex].price * state.items[itemIndex].quantity;
        state.items.splice(itemIndex, 1);
      }
    },
    
  },
});

export const { addGift } = giftsSlice.actions;
export default giftsSlice.reducer;