import AsyncStorage from "@react-native-async-storage/async-storage";
import * as eva from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import { default as customMapping } from "../src/constants/themes/mapping.json";
import { Stack } from "expo-router";
import { useSetAtom } from "jotai";
import * as React from "react";
import { StatusBar } from "react-native";
import { useDatabaseBootstrap } from "../shared/store/databaseBootstrap";
import { SyncStatus } from "../shared/SyncStatus/SyncStatus";
import { useAuthenticatedAppSession } from "../entities/auth/lib/useAuthenticatedAppSession";
import { NetworkStatusToast } from "../widgets/NetworkStatusBar";
import { StartupLoadingScreen } from "../widgets/AppStartup";
import {
  FORCED_OFFLINE_STORAGE_KEY,
  forcedOfflineAtom,
} from "../shared/store/network";

function AuthenticatedApplication() {
  const { isAuthenticated, isLoading } = useAuthenticatedAppSession();
  const setForcedOffline = useSetAtom(forcedOfflineAtom);
  useDatabaseBootstrap();
  const continueOffline = React.useCallback(async () => {
    setForcedOffline(true);

    try {
      await AsyncStorage.setItem(FORCED_OFFLINE_STORAGE_KEY, "true");
    } catch (error) {
      console.warn("Failed to persist forced offline mode:", error);
    }
  }, [setForcedOffline]);

  if (isLoading) {
    return <StartupLoadingScreen onContinueOffline={continueOffline} />;
  }

  return (
    <>
      <StatusBar
        barStyle={"dark-content"}
        translucent={true}
        backgroundColor={"#00000000"}
      />

      <NetworkStatusToast />

      <Stack
        initialRouteName={isAuthenticated ? "(tabs)" : "login"}
        screenOptions={{
          contentStyle: {
            backgroundColor: "white",
          },
          headerShown: false,
        }}
      >
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="login" />
        </Stack.Protected>
        <Stack.Screen
          name="changePassword"
          options={{ presentation: "modal" }}
        />
      </Stack>
      <SyncStatus />
    </>
  );
}

export default function AppContainer1() {
  return (
    <ApplicationProvider
      {...eva}
      theme={eva.light}
      customMapping={{ ...eva.mapping, ...customMapping }}
    >
      <AuthenticatedApplication />
    </ApplicationProvider>
  );
}
