import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { localStorageService } from "../storage/localStorage";

export const useLocalStorage = <T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => localStorageService.get(key, initialValue));

  useEffect(() => {
    setValue(localStorageService.get(key, initialValue));
  }, [initialValue, key]);

  useEffect(() => {
    localStorageService.set(key, value);
  }, [key, value]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== key) {
        return;
      }
      setValue(localStorageService.get(key, initialValue));
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [initialValue, key]);

  return [value, setValue];
};
