// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Debounces a value by the specified delay.
 * Used to prevent firing API calls on every keystroke.
 *
 * @param {*}      value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default 400ms)
 * @returns debounced value
 */
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
