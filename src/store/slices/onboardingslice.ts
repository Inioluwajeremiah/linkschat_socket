import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "..";

interface OnboardingState {
  isCompleteOnboarding: boolean;
}

const initialState: OnboardingState = {
  isCompleteOnboarding: false,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setIsCompleteOnboarding: (state, action: PayloadAction<boolean>) => {
      state.isCompleteOnboarding = action.payload;
    },
    resetOnboarding: (state) => {
      state.isCompleteOnboarding = false;
    },
  },
});

export const { setIsCompleteOnboarding, resetOnboarding } =
  onboardingSlice.actions;

export default onboardingSlice.reducer;

// ─── Async thunks for AsyncStorage persistence ────────────────────────────────
// Call these alongside the slice actions to keep AsyncStorage in sync.

// export const persistOnboardingComplete = (value: boolean) => async () => {
//   try {
//     await AsyncStorage.setItem("isCompleteOnboarding", JSON.stringify(value));
//   } catch (e) {
//     console.warn("Failed to persist onboarding state:", e);
//   }
// };

export const loadOnboardingState =
  () =>
  async (
    dispatch: (action: ReturnType<typeof setIsCompleteOnboarding>) => void
  ) => {
    try {
      const stored = await AsyncStorage.getItem("isCompleteOnboarding");
      console.log("isCompleteOnboarding at loadOnboardingState ==>>> ", stored);

      if (stored !== null) {
        dispatch(setIsCompleteOnboarding(JSON.parse(stored)));
      }
    } catch (e) {
      console.warn("Failed to load onboarding state:", e);
    }
  };
