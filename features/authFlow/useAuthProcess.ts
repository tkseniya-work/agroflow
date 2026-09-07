import { router } from "expo-router";
import { useAuth } from "../../entities/auth/lib/useAuth";
import { useAtom } from "jotai";
import { useCallback } from "react";
import { AuthProcessResult, useAuthActions } from "../../entities/auth";
import { loadUserInfoAtom } from "../../entities/user";
import { DataSyncService } from "../dataSync/DataSyncService";
import { useAlerts } from "../../shared/lib/useAlerts";

export const useAuthProcess = (
  dataSyncService: DataSyncService,
  updateAuthState: (updates: any) => void,
  resetAuthState: () => void
) => {
  const { login } = useAuth();
  const [, loadUserInfo] = useAtom(loadUserInfoAtom);
  const { exchangeCodeForToken, getUserInfo } = useAuthActions();

  const { showError, showWarning } = useAlerts();

  const handleSuccessfulAuth = useCallback(
    async (code: string, codeVerifier?: string): Promise<AuthProcessResult> => {
      updateAuthState({ isProcessingAuth: true, isLoggingIn: true });

      try {
        const tokenResponse = await exchangeCodeForToken(code, codeVerifier);
        if (!tokenResponse) {
          throw new Error("Failed to get access token");
        }

        login(
          tokenResponse.access_token,
          tokenResponse.refresh_token,
          tokenResponse.expires_in
        );

        const userInfo = await getUserInfo(tokenResponse.access_token);
        if (!userInfo) {
          throw new Error("Failed to get user info");
        }

        const parsedObject = JSON.parse(JSON.stringify(userInfo));
        loadUserInfo(parsedObject);

        const syncResult = await dataSyncService.syncUserData(
          tokenResponse.access_token,
          userInfo.sub,
          userInfo.uuid_company_id
        );

        return {
          success: true,
          userInfo,
          warnings: syncResult.warnings,
        };
      } catch (error) {
        console.error("Auth processing error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      } finally {
        resetAuthState();
      }
    },
    [
      login,
      loadUserInfo,
      exchangeCodeForToken,
      getUserInfo,
      dataSyncService,
      updateAuthState,
      resetAuthState,
    ]
  );

  const processAuthResult = useCallback(
    (result: AuthProcessResult) => {
      if (result.success) {
        if (result.warnings && result.warnings.length > 0) {
          showWarning(
            `${result.warnings.join(
              " ",
            )} Вы можете продолжить работу в ограниченном режиме.`,
          );
        }
        router.replace("/(tabs)");
      } else {
        showError(result.error || "Произошла ошибка при обработке авторизации");
      }
    },
    [showError, showWarning],
  );

  return {
    handleSuccessfulAuth,
    processAuthResult,
  };
};
