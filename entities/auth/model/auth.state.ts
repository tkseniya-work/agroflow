import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { AuthState } from "./auth.interfaces";
import { isTokenExpired } from "./authSession.logic";

export { isTokenExpired };

const storage = createJSONStorage<AuthState>(() => AsyncStorage);

const INITIAL_STATE: AuthState = {
  access_token: null,
  refresh_token: null,
  expires_in: null,
  issued_at: null,
  error: null,
  isLoaded: false,
};

export const authAtom = atomWithStorage<AuthState>(
  "auth",
  INITIAL_STATE,
  storage
);

export const authInitializedAtom = atom(false);

const isPromiseLikeAuthState = (
  value: AuthState | Promise<AuthState>
): value is Promise<AuthState> => {
  return typeof (value as Promise<AuthState>).then === "function";
};

export const stableAuthStateAtom = atom<AuthState>((get) => {
  const isInitialized = get(authInitializedAtom);
  const auth = get(authAtom);
  
  if (!isInitialized || isPromiseLikeAuthState(auth)) {
    return { ...INITIAL_STATE, isLoaded: false };
  }
  
  return auth;
});

export const initializeAuthAtom = atom(
  null,
  async (get, set) => {
    if (get(authInitializedAtom)) return;

    try {
      const stored = await AsyncStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored) as AuthState;
        set(authAtom, { ...parsed, isLoaded: true });
      } else {
        set(authAtom, { ...INITIAL_STATE, isLoaded: true });
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      set(authAtom, { ...INITIAL_STATE, isLoaded: true });
    } finally {
      set(authInitializedAtom, true);
    }
  }
);

export const isAuthenticatedAtom = atom((get) => {
  const { isLoaded, ...auth } = get(stableAuthStateAtom);
  
  if (!isLoaded) return false;
  if (!auth.access_token) return false;
  if (auth.error) return false;

  if (!isTokenExpired({ isLoaded, ...auth })) return true;

  // Не сбрасываем сессию только из-за истекшего access token:
  // refresh token позволит обновиться при сети, а оффлайн-режим должен остаться доступен.
  return Boolean(auth.refresh_token);
});

export const accessTokenAtom = atom((get) => {
  const auth = get(stableAuthStateAtom);
  return auth.isLoaded ? auth.access_token : null;
});

export const refreshTokenAtom = atom((get) => {
  const auth = get(stableAuthStateAtom);
  return auth.isLoaded ? auth.refresh_token : null;
});

export const tokenExpiryAtom = atom((get) => {
  const auth = get(stableAuthStateAtom);
  
  if (!auth.isLoaded || !auth.issued_at || !auth.expires_in) {
    return null;
  }

  const expiryTime = auth.issued_at + auth.expires_in * 1000;
  return Math.max(0, expiryTime - Date.now());
});

export const loginAtom = atom(
  null,
  async (
    _get,
    set,
    tokens: {
      accessToken: string;
      refreshToken?: string;
      expiresIn?: number;
    }
  ) => {
    const { accessToken, refreshToken, expiresIn = 3600 } = tokens;

    if (!accessToken) {
      set(authAtom, {
        ...INITIAL_STATE,
        error: "Access token is required",
        isLoaded: true,
      });
      return;
    }

    set(authAtom, {
      access_token: accessToken,
      refresh_token: refreshToken || null,
      expires_in: expiresIn,
      issued_at: Date.now(),
      error: null,
      isLoaded: true,
    });
  }
);

export const logoutAtom = atom(
  null,
  async (_get, set) => {
    set(authAtom, { ...INITIAL_STATE, isLoaded: true });
  }
);
