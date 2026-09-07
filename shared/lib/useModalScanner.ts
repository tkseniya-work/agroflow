import { useCallback, useState } from 'react';

export const useModalScanner = (initialState = false) => {
  const [visible, setVisible] = useState(initialState);

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);
  const toggle = useCallback(() => setVisible(prev => !prev), []);

  return {
    visible,
    show,
    hide,
    toggle
  };
};