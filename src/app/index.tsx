import { Redirect } from "expo-router";
import { useAppSelector } from "../hooks/useRedux";

export default function Index() {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const { isCompleteOnboarding } = useAppSelector((s) => s.onboarding);

  console.log("isCompleteOnboarding at root layout==>> ", isCompleteOnboarding);

  // Always show splash first — splash.tsx handles the timed redirect
  if (!isCompleteOnboarding) {
    return <Redirect href="/onboarding/splash" />;
  }

  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;
}
