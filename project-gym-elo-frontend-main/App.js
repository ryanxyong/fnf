import React from "react";
import { Provider } from "react-redux";
import store from "./src/app/store";
import MainNav from "./src/navigation/MainNav";
import { LogBox } from "react-native";
import {
  Lato_300Light,
  Lato_400Regular,
  Lato_700Bold,
  Lato_900Black,
} from "@expo-google-fonts/lato";
import { useFonts } from "expo-font";
import { PusherProvider } from "./src/PusherContext";


export default function App() {
  LogBox.ignoreLogs(["Warning: ..."]);
  LogBox.ignoreAllLogs();
  const [fontsLoaded] = useFonts({
    Lato_300Light,
    Lato_400Regular,
    Lato_700Bold,
    Lato_900Black,
  });

  if (fontsLoaded) {
    return (
      <PusherProvider>
        <Provider store={store}>
          <MainNav />
        </Provider>
      </PusherProvider>
    );
  }
}
