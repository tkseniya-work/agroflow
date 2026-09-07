import { useCallback, useMemo, useState } from "react";

type AuthUiState = {
  isLoggingIn: boolean;
  authInProgress: boolean;
  isProcessingAuth: boolean;
};

const INITIAL_AUTH_UI_STATE: AuthUiState = {
  isLoggingIn: false,
  authInProgress: false,
  isProcessingAuth: false,
};

export const useAuthState = (isSyncing: boolean) => {
  const [authState, setAuthState] = useState<AuthUiState>(
    INITIAL_AUTH_UI_STATE,
  );

  const isLoading = useMemo(() => 
    authState.isLoggingIn || isSyncing || authState.authInProgress || authState.isProcessingAuth,
    [authState.isLoggingIn, authState.authInProgress, authState.isProcessingAuth, isSyncing]
  );

  const updateAuthState = useCallback((updates: Partial<AuthUiState>) => {
    setAuthState((prev) => {
      const next = { ...prev, ...updates };
      const unchanged =
        prev.isLoggingIn === next.isLoggingIn &&
        prev.authInProgress === next.authInProgress &&
        prev.isProcessingAuth === next.isProcessingAuth;

      return unchanged ? prev : next;
    });
  }, []);

  const resetAuthState = useCallback(() => {
    setAuthState((prev) => {
      const unchanged =
        prev.isLoggingIn === INITIAL_AUTH_UI_STATE.isLoggingIn &&
        prev.authInProgress === INITIAL_AUTH_UI_STATE.authInProgress &&
        prev.isProcessingAuth === INITIAL_AUTH_UI_STATE.isProcessingAuth;

      return unchanged ? prev : INITIAL_AUTH_UI_STATE;
    });
  }, []);

  return {
    authState,
    isLoading,
    updateAuthState,
    resetAuthState,
  };
};
