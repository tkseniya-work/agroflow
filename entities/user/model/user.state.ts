import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { UserInfo, UserState } from "./user.interface";

const storage = createJSONStorage<UserState>(() => AsyncStorage);

const INITIAL_STATE = {
  userInfo: null,
  error: null,
};

export const profileAtom = atomWithStorage<UserState>(
  "userInfo",
  INITIAL_STATE,
  storage,
);

export const loadUserInfoAtom = atom(
  (get) => {
    return get(profileAtom);
  },
  (_get, set, userInfo: UserInfo) => {
    set(profileAtom, {
      userInfo: null,
      error: null,
    });
    try {
      set(profileAtom, {
        userInfo: userInfo,
        error: null,
      });
    } catch (error) {
      console.error("Error saving user info:", error);
    }
  },
);
