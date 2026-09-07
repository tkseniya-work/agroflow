import * as React from 'react';
const useCountDownUtil = (initValue: number): [string, () => void] => {
  const [time, setTime] = React.useState<number>(initValue);
  const timeRef = React.useRef<any>(null);

  React.useEffect(() => {
    timeRef.current = setInterval(() => {
      decrementTime();
    }, 1000);
    return () => {
      clearInterval(timeRef.current);
    };
  }, []);

  const decrementTime = React.useCallback(() => {
    setTime((prev: number) => {
      if (prev === 0) {
        clearInterval(timeRef.current);
        return 0;
      } else {
        return prev - 1;
      }
    });
  }, []);

  const reset = React.useCallback(() => {
    setTime(initValue);
  }, [initValue]);

  // Define helper function to format time to string
  const formatTime = React.useCallback((t: number): string => {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;

    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${formattedMinutes}:${formattedSeconds}`;
  }, []);

  // Call formatTime with time argument to get the formatted string value
  const formattedTime = formatTime(time);

  return [formattedTime, reset];
};

export default useCountDownUtil;
