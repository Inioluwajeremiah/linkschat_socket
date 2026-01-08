import "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import Splashscreen from "./Screens/splashscreen";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import AuthScreen from "./Navigation/AuthNavigation";
import { useFonts } from "expo-font";
import { Provider } from "react-redux";
import store, { persistor } from "./Store/Store";
import { PersistGate } from "redux-persist/integration/react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useFCMNotification from "./hooks/useFCMNotification";
import { SocketProvider } from "./socket/SocketProvider";

export const navigationRef = createNavigationContainerRef();

export function customNavigation(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export default function App() {
  const [isShown, setIsShown] = useState(true);
  const [loaded, error] = useFonts({
    bold: require("./assets/Fonts/Montserrat/static/Montserrat-Bold.ttf"),
    semibold: require("./assets/Fonts/Montserrat/static/Montserrat-SemiBold.ttf"),
    regular: require("./assets/Fonts/Montserrat/static/Montserrat-Regular.ttf"),
  });

  useFCMNotification();

  useEffect(() => {
    setTimeout(() => setIsShown(false), 2000);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <SafeAreaProvider>
          {/* <SafeAreaP style={{ flex: 1 }} edges={["top", "left", "right"]}> */}
          <SocketProvider>
            <NavigationContainer ref={navigationRef}>
              <KeyboardProvider>
                {isShown ? <Splashscreen /> : <AuthScreen />}
                <StatusBar style="auto" backgroundColor="#5bbbdf" />
              </KeyboardProvider>
            </NavigationContainer>
          </SocketProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
