// features/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';
const amountSlice = createSlice({
  name: 'amount',
  initialState: {
    amount: 1000,
  },
  reducers: {
    setAmount: (state, action) => {
      state.amount = action.payload;
    },
    addAmount: (state, action) => {
        state.amount += action.payload;
        },
    withdraw: (state, action) => {
            state.amount -= action.payload;
        },
    addItem: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      
      state.total += action.payload.price;
    },
    
    removeItem: (state, action) => {
      const itemIndex = state.items.findIndex(item => item.id === action.payload);
      
      if (state.items[itemIndex]) {
        state.total -= state.items[itemIndex].price * state.items[itemIndex].quantity;
        state.items.splice(itemIndex, 1);
      }
    },
    
    updateQuantity: (state, action) => {
      const item = state.items.find(item => item.id === action.payload.id);
      
      if (item) {
        const difference = action.payload.quantity - item.quantity;
        state.total += difference * item.price;
        item.quantity = action.payload.quantity;
      }
    },
  },
});

export const { addItem, withdraw, addAmount,updateQuantity } = amountSlice.actions;
export default amountSlice.reducer;