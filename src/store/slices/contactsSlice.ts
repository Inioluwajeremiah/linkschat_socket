// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import * as Contacts from "expo-contacts";

// interface ContactsState {
//   // Maps last-9-digit phone suffix → saved contact name
//   phoneToName: Record<string, string>;
//   // Maps last-9-digit phone suffix → full phone number as saved on device
//   phoneToNumber: Record<string, string>;
//   loaded: boolean;
//   loading: boolean;
// }

// const initialState: ContactsState = {
//   phoneToName: {},
//   phoneToNumber: {},
//   loaded: false,
//   loading: false,
// };

// export const loadDeviceContacts = createAsyncThunk<
//   {
//     phoneToName: Record<string, string>;
//     phoneToNumber: Record<string, string>;
//   },
//   void,
//   { rejectValue: string }
// >("contacts/load", async (_, { rejectWithValue }) => {
//   try {
//     const { status } = await Contacts.requestPermissionsAsync();

//     if (status !== "granted") {
//       return { phoneToName: {}, phoneToNumber: {} };
//     }

//     const { data } = await Contacts.getContactsAsync({
//       fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
//     });

//     const phoneToName: Record<string, string> = {};
//     const phoneToNumber: Record<string, string> = {};

//     // const normalize = (p: string) => p.replace(/\\D/g, "");
//     const normalize = (p: string) => p.replace(/\D/g, "");

//     for (const contact of data) {
//       if (!contact.name || !contact.phoneNumbers) continue;

//       for (const pn of contact.phoneNumbers) {
//         const raw = pn.number || "";
//         const normalized = normalize(raw);

//         if (normalized.length < 7) continue;

//         // Match by last 9 digits
//         const suffix = normalized.slice(-9);

//         // First match wins
//         if (!phoneToName[suffix]) {
//           phoneToName[suffix] = contact.name;
//           phoneToNumber[suffix] = raw;
//         }
//       }
//     }

//     return { phoneToName, phoneToNumber };
//   } catch (e) {
//     return rejectWithValue("Failed to load contacts");
//   }
// });

// const contactsSlice = createSlice({
//   name: "contacts",
//   initialState,
//   reducers: {
//     clearContacts: (state) => {
//       state.phoneToName = {};
//       state.phoneToNumber = {};
//       state.loaded = false;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(loadDeviceContacts.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(loadDeviceContacts.fulfilled, (state, action) => {
//         state.loading = false;
//         state.loaded = true;
//         state.phoneToName = action.payload.phoneToName;
//         state.phoneToNumber = action.payload.phoneToNumber;
//       })
//       .addCase(loadDeviceContacts.rejected, (state) => {
//         state.loading = false;
//         state.loaded = true; // done even if permission denied
//       });
//   },
// });

// export const { clearContacts } = contactsSlice.actions;
// export default contactsSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as Contacts from "expo-contacts";

interface ContactsState {
  // Maps last-9-digit phone suffix → saved contact name
  phoneToName: Record<string, string>;
  // Maps last-9-digit phone suffix → full phone number as saved on device
  phoneToNumber: Record<string, string>;
  loaded: boolean;
  loading: boolean;
}

const initialState: ContactsState = {
  phoneToName: {},
  phoneToNumber: {},
  loaded: false,
  loading: false,
};

export const loadDeviceContacts = createAsyncThunk<
  {
    phoneToName: Record<string, string>;
    phoneToNumber: Record<string, string>;
  },
  void,
  { rejectValue: string; state: { contacts: ContactsState } }
>(
  "contacts/load",
  async (_, { rejectWithValue }) => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        return { phoneToName: {}, phoneToNumber: {} };
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      const phoneToName: Record<string, string> = {};
      const phoneToNumber: Record<string, string> = {};

      const normalize = (p: string) => p.replace(/\D/g, "");

      for (const contact of data) {
        if (!contact.name || !contact.phoneNumbers) continue;

        for (const pn of contact.phoneNumbers) {
          const raw = pn.number || "";
          const normalized = normalize(raw);

          if (normalized.length < 7) continue;

          // Match by last 9 digits
          const suffix = normalized.slice(-9);

          // First match wins
          if (!phoneToName[suffix]) {
            phoneToName[suffix] = contact.name;
            phoneToNumber[suffix] = raw;
          }
        }
      }

      return { phoneToName, phoneToNumber };
    } catch (e) {
      return rejectWithValue("Failed to load contacts");
    }
  },
  {
    // Skip re-dispatching if already loaded (or a load is already in
    // flight) — lets every screen call dispatch(loadDeviceContacts()) on
    // mount without worrying about re-fetching or re-prompting for
    // permission every time. NOTE: `state` here is typed loosely as
    // `{ contacts: ContactsState }` rather than your app's full RootState
    // — swap that in if you have one, for stronger typing elsewhere.
    condition: (_, { getState }) => {
      const { contacts } = getState();
      return !contacts.loaded && !contacts.loading;
    },
  }
);

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    clearContacts: (state) => {
      state.phoneToName = {};
      state.phoneToNumber = {};
      state.loaded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDeviceContacts.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadDeviceContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.phoneToName = action.payload.phoneToName;
        state.phoneToNumber = action.payload.phoneToNumber;
      })
      .addCase(loadDeviceContacts.rejected, (state) => {
        state.loading = false;
        state.loaded = true; // done even if permission denied
      });
  },
});

export const { clearContacts } = contactsSlice.actions;
export default contactsSlice.reducer;
