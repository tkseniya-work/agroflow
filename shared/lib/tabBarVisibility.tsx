import { atom, useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";

const tabBarHiddenAtom = atom(false);

export const useTabBarVisibility = () => {
  const [isTabBarHidden, setIsTabBarHidden] = useAtom(tabBarHiddenAtom);

  const setTabBarHidden = useCallback(
    (hidden: boolean) => {
      setIsTabBarHidden(hidden);
    },
    [setIsTabBarHidden],
  );

  return { isTabBarHidden, setTabBarHidden };
};

export const useTabBarHidden = () => {
  return useAtomValue(tabBarHiddenAtom);
};
