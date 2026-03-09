import { useEffect, useState } from "react";

export const useDebounce = <T,>(value: T, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handle);
  }, [delay, value]);

  return debouncedValue;
};
