import { useState, useEffect } from 'react';

export function useWordRotation(words: string[], holdDuration = 2000, finalHoldDuration = 3000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // If it's the last word, hold it longer
    const currentDuration = index === words.length - 1 ? finalHoldDuration : holdDuration;
    
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [index, words.length, holdDuration, finalHoldDuration]);

  return words[index];
}
