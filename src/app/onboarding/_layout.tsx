import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="splash" options={{ animation: "none" }} />
      <Stack.Screen name="welcome" options={{ animation: "fade" }} />
      <Stack.Screen
        name="privacypolicy"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
