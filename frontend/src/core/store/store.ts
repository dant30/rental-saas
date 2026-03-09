import { rootReducer, RootState } from "./rootReducer";

type Listener = () => void;

let currentState: RootState = Object.freeze({ ...rootReducer(undefined) });
const listeners = new Set<Listener>();

export const store = {
  getState: () => currentState,
  dispatch: (payload: Partial<RootState>) => {
    if (!payload || typeof payload !== "object") {
      return;
    }
    currentState = Object.freeze({ ...currentState, ...payload });
    listeners.forEach((listener) => listener());
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
