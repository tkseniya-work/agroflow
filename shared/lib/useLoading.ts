import { useCallback, useState } from 'react';

export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const startLoading = useCallback((text: string = '') => {
    setIsLoading(true);
    setLoadingText(text);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingText('');
  }, []);

  const withLoading = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    loadingText?: string
  ): Promise<T> => {
    startLoading(loadingText);
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    withLoading,
  };
};