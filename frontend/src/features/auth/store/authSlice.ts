import { UserProfile } from "../types";

export interface AuthState {
  user: UserProfile | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
}

export const authInitialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};
