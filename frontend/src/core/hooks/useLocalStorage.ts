import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { localStorageService } from "../storage/localStorage";

export const useLocalStorage = <T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => localStorageService.get(key, initialValue));

  useEffect(() => {
    localStorageService.set(key, value);
  }, [key, value]);

  return [value, setValue];
};
