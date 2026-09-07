import { atom } from "jotai";

export enum ThemeMode {
  DARK = "dark",
  LIGHT = "light",
}

export interface AppAlert {
  type: "notification" | "success" | "error";
  title: string;
  message: string;
}

export const appLoadingAtom = atom(false);
export const themeModeAtom = atom<ThemeMode>(ThemeMode.LIGHT);
export const appAlertAtom = atom<AppAlert | null>(null as AppAlert | null);
