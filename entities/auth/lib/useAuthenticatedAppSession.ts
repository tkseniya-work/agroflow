import * as Network from "expo-network";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { isTokenExpired } from "../model/authSession.logic";
import { forcedOfflineAtom } from "../../../shared/store/network";
import { useAuth } from "./useAuth";

export const useAuthenticatedAppSession = () => {
  const session = useAuth();
  const forcedOffline = useAtomValue(forcedOfflineAtom);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const attemptedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (session.isLoading) {
      setIsRestoringSession(true);
      return;
    }

    if (forcedOffline) {
      setIsRestoringSession(false);
      return;
    }

    const { auth } = session;

    if (
      !auth.access_token ||
      !auth.refresh_token ||
      !isTokenExpired(auth)
    ) {
      setIsRestoringSession(false);
      return;
    }

    const sessionKey = `${auth.issued_at}:${auth.refresh_token}`;

    if (attemptedSessionRef.current === sessionKey) {
      setIsRestoringSession(false);
      return;
    }

    attemptedSessionRef.current = sessionKey;
    let isActive = true;
    setIsRestoringSession(true);

    const restoreSession = async () => {
      let shouldRefresh = true;

      try {
        const networkState = await Network.getNetworkStateAsync();
        shouldRefresh = networkState.isConnected !== false;
      } catch (error) {
        console.warn("Failed to check network before token refresh:", error);
      }

      if (shouldRefresh) {
        await session.getValidAccessToken();
      }
    };

    void restoreSession()
      .catch((error) => {
        console.error("Failed to restore auth session:", error);
      })
      .finally(() => {
        if (isActive) {
          setIsRestoringSession(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [
    session.auth,
    forcedOffline,
    session.getValidAccessToken,
    session.isLoading,
  ]);

  return {
    ...session,
    isLoading: session.isLoading || isRestoringSession,
  };
};
