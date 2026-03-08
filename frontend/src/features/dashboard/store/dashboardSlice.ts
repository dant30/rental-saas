export interface DashboardState {
  summary: Record<string, unknown> | null;
  status: "idle" | "loading" | "success" | "error";
}

export const dashboardInitialState: DashboardState = {
  summary: null,
  status: "idle",
};
