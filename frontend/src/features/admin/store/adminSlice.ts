export interface AdminState {
  status: "idle" | "loading" | "success" | "error";
}

export const adminInitialState: AdminState = {
  status: "idle",
};
