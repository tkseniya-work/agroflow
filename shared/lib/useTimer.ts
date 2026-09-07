import React from "react";

const useTimer = (initialState = 0) => {
  const [timer, setTimer] = React.useState(initialState);
  const [isPlay, setIsPlay] = React.useState(false);
  const countRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStart = () => {
    setIsPlay(true);
    countRef.current = setInterval(() => {
      setTimer((timer) => timer + 1);
    }, 1000);
  };

  const handlePause = () => {
    if (countRef.current) {
      clearInterval(countRef.current);
      countRef.current = null;
    }
    setIsPlay(false);
  };

  const handleResume = () => {
    setIsPlay(true);
    countRef.current = setInterval(() => {
      setTimer((timer) => timer + 1);
    }, 1000);
  };

  return {
    timer,
    isPlay,
    handleStart,
    handlePause,
    handleResume,
  };
};
export default useTimer;
