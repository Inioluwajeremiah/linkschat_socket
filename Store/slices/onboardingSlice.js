import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isCompleteOnboarding: false,
  isStartedOnboarding: false,
  onBoardingId: "",
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setIsCompleteOnboarding: (state, action) => {
      state.isCompleteOnboarding = action.payload;
    },
    setStartedOnboarding: (state, action) => {
      state.isStartedOnboarding = action.payload;
    },
    setOnBoardingId: (state, action) => {
      state.onBoardingId = action.payload;
    },
    clearOnboardingState: (state) => {
      state.isStartedOnboarding = false;
      state.onBoardingId = "";
    },
  },
});

export const {
  setIsCompleteOnboarding,
  setStartedOnboarding,
  setOnBoardingId,
  clearOnboardingState,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
