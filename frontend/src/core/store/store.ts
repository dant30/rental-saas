import { rootReducer, RootState } from "./rootReducer";

type Listener = () => void;

let currentState: RootState = rootReducer(undefined);
const listeners = new Set<Listener>();

export const store = {
  getState: () => currentState,
  dispatch: (payload: Partial<RootState>) => {
    currentState = { ...currentState, ...payload };
    listeners.forEach((listener) => listener());
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
