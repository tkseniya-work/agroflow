import { Text } from "../../shared/ui";
import { LoginButton } from "../../widgets/LoginButton";
import { AUTH_CONFIG, useAuthState } from "../../entities/auth";
import { useAuthRequest } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useAuthProcess } from "../../features/authFlow";
import { useDataSync } from "../../features/dataSync/lib/useDataSync";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { DataSyncService } from "../../features/dataSync/DataSyncService";
import { useDatabaseBootstrap } from "../../shared/store/databaseBootstrap";
import Colors from "../../shared/styles/Colors";

WebBrowser.maybeCompleteAuthSession();

export const LoginPage: React.FC = () => {
  const { syncAllData, syncEmployeeData, syncCompanyData, isSyncing } = useDataSync();
  const { reloadLocalData } = useDatabaseBootstrap();
  const processedAuthCodeRef = useRef<string | null>(null);

  const dataSyncService = useMemo(
    () =>
      new DataSyncService(
        syncAllData,
        syncEmployeeData,
        syncCompanyData,
        reloadLocalData,
      ),
    [syncAllData, syncEmployeeData, syncCompanyData, reloadLocalData]
  );

  const { authState, isLoading, updateAuthState, resetAuthState } =
    useAuthState(isSyncing);

  const { handleSuccessfulAuth, processAuthResult } = useAuthProcess(
    dataSyncService,
    updateAuthState,
    resetAuthState
  );

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: AUTH_CONFIG.clientId,
      scopes: AUTH_CONFIG.scopes,
      redirectUri: AUTH_CONFIG.redirectUri,
      usePKCE: true,
      responseType: "code",
      extraParams: {
        prompt: "login",
      },
    },
    AUTH_CONFIG.discovery
  );

  const startAuthProcess = useCallback(async () => {
    if (!request || authState.authInProgress || authState.isProcessingAuth)
      return;

    updateAuthState({ authInProgress: true });

    try {
      const authResult = await promptAsync();

      if (authResult.type !== "success") {
        updateAuthState({ authInProgress: false });
      }
    } catch (error) {
      console.error("Prompt error:", error);
      updateAuthState({ authInProgress: false });
    }
  }, [
    request,
    authState.authInProgress,
    authState.isProcessingAuth,
    promptAsync,
    updateAuthState,
  ]);

  useEffect(() => {
    if (
      response?.type === "success" &&
      response.params.code &&
      processedAuthCodeRef.current !== response.params.code &&
      !authState.isProcessingAuth
    ) {
      processedAuthCodeRef.current = response.params.code;
      handleSuccessfulAuth(response.params.code, request?.codeVerifier).then(
        processAuthResult
      );
    } else if (response && response.type !== "success") {
      if (response.type === "error") {
        console.error("Auth error:", response.error);
      }

      updateAuthState({ authInProgress: false });
    }
  }, [
    response,
    authState.isProcessingAuth,
    handleSuccessfulAuth,
    processAuthResult,
    request?.codeVerifier,
    updateAuthState,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.buttonContainer}>
          <LoginButton
            onPress={startAuthProcess}
            disabled={!request || isLoading}
            isLoading={isLoading}
          />
        </View>

        <View style={styles.versionCenterContainer}>
          <Text style={styles.versionCenterText}>v{AUTH_CONFIG.version}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingBottom: 60,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  buttonContainer: {
    flex: 1,
    paddingHorizontal: 50,
    paddingTop: 35,
  },
  versionCenterContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  versionCenterText: {
    fontSize: 12,
    color: Colors.grey500,
    textAlign: "center",
  },
});

export default LoginPage;
