// features/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';
import woman from "./woman.png";
import man from "./profile.png";

const contactSlice = createSlice({
  name: 'contact',
  initialState: {
    items: [
            {
                id:1,
                text:"Hello",
                sender:"Hayley",
                time:" Today 10:00 AM",
                image:woman,
                isSent:false
            },
            {
                id:2,
                text:"I love to Deejoft technologies.",
                sender:"Hawkins",
                time:"Last Seen:10 minutes ago",
                image:man,
                isSent:true
            },
            {
                id:3,
                text:"Hello",
                sender:"Gabreilla",
                time:"Today 01:00pm",
                image:man,
                isSent:true
            },
            {
                id:4,
                text:"I love to Deejoft technologies.",
                sender:"Elon",
                time:"yesterday 12:07pm",
                image:man,
                isSent:true,
                isPin:true,
                isOnline:true
            },
            {
                id:5,
                text:"Hello",
                sender:"Eliana",
                time:"10:00 AM",
                image:woman,
                isSent:false
            },
         
            {
                id:6,
                text:"Hello",
                sender:"Eliora",
                time:"yesterday 10:00 AM",
                image: woman,
                isSent:false,
                isPin:false,
                isOnline:true
            },
          
            {
                id:7,
                text:"Hello",
                sender:"John",
                time:"10:00 AM",
                image:man,
                isSent:false,
                isPin:true,
                isOnline:true
            },
            {
                id:8,
                text:"I love to Deejoft technologies.",
                sender:"Kings",
                time:"02/01/2025",
                image:man,
                isSent:true,
                isPin:true,
                isOnline:true
            },
        ],
  },
  reducers: {
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

export const { addItem, removeItem, updateQuantity } = contactSlice.actions;
export default contactSlice.reducer;