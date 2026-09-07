import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";

export const useReloadOnReturn = (reload: () => void | Promise<unknown>) => {
  const reloadRef = useRef(reload);
  const isFirstFocusRef = useRef(true);

  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocusRef.current) {
        isFirstFocusRef.current = false;
        return;
      }

      void reloadRef.current();
    }, []),
  );
};
