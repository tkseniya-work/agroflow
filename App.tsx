import React from "react";
import { LogBox, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// ------------------------------- UI Kitten -----------------------------------
import { IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";

// ------------------------------- App Container -------------------------------
import AppContainer from "./app/AppContainer";

// ------------------------------- Assets Icon ---------------------------------
import AssetsIconsPack from "assets/AssetsIconsPack";

// ------------------------------- Components ----------------------------------
import { AppMessage } from "shared/ui";
import useCachedResources from "shared/lib/useCachedResources";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

LogBox.ignoreLogs([
  "`renderInPortal` is not supported outside of `VictoryContainer`. Component will be rendered in place",
]);

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

export default function App() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  }
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <IconRegistry icons={[AssetsIconsPack, EvaIconsPack]} />
        <AppContainer />
        <AppMessage />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
