'use client';

import { useEffect, useState } from 'react';

export function useOddsTicker(isRunning: boolean = true) {
  const [subSecondTick, setSubSecondTick] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setSubSecondTick((prev) => (prev + 1) % 60);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const formattedSeconds = subSecondTick.toString().padStart(2, '0');

  return {
    subSecondTick,
    formattedSeconds,
  };
}
