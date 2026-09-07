import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import * as SplashScreen from "expo-splash-screen";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

import AppContainer1 from "./AppContainer";
import AssetsIconsPack from "../src/assets/AssetsIconsPack";
import Colors from "../shared/styles/Colors";
import { runAppResetIfNeeded } from "../src/services/appResetService";
import { configureAppRequestHeaders } from "../src/configs/apiRequestHeaders";

SplashScreen.preventAutoHideAsync();
configureAppRequestHeaders();

function LoadingView() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Colors.greenColor} />
    </View>
  );
}

function AppWithMigrations({
  db,
  migrations,
}: {
  db: any;
  migrations: any;
}) {
  const [isSplashReady, setIsSplashReady] = useState(false);

  const { success, error: migrationError } = useMigrations(db, migrations);

  useDrizzleStudio(db.$client);

  useEffect(() => {
    if (migrationError) {
      throw migrationError;
    }
  }, [migrationError]);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = setTimeout(() => setIsSplashReady(true), 300);
    return () => clearTimeout(timer);
  }, [success]);

  if (!success || !isSplashReady) {
    return <LoadingView />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <PortalProvider>
          <SafeAreaProvider>
            <IconRegistry icons={[AssetsIconsPack, EvaIconsPack]} />
            <AppContainer1 />
          </SafeAreaProvider>
        </PortalProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [dbModule, setDbModule] = useState<any>(null);
  const [rootLaidOut, setRootLaidOut] = useState(false);
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await runAppResetIfNeeded();

        const dbClient = await import("../db/client");
        const migrationsModule = await import("../drizzle/migrations");

        setDbModule({
          db: dbClient.db,
          migrations: migrationsModule.default,
        });
      } catch (e) {
        console.log("Bootstrap error:", e);
      } finally {
        setReady(true);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (!rootLaidOut || nativeSplashHidden) return;

    SplashScreen.hideAsync()
      .catch((error) => {
        console.warn("Failed to hide native splash screen:", error);
      })
      .finally(() => {
        setNativeSplashHidden(true);
      });
  }, [nativeSplashHidden, rootLaidOut]);

  const handleRootLayout = useCallback(() => {
    setRootLaidOut(true);
  }, []);

  const content =
    !ready || !dbModule ? (
      <LoadingView />
    ) : (
      <AppWithMigrations
        db={dbModule.db}
        migrations={dbModule.migrations}
      />
    );

  return (
    <View style={styles.container} onLayout={handleRootLayout}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
});
