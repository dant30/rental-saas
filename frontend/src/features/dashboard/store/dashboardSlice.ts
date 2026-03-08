export type DashboardSummary = Record<string, string | number>;

export interface DashboardState {
  summary: DashboardSummary | null;
  status: "idle" | "loading" | "success" | "error";
  error?: string;
}

export const dashboardInitialState: DashboardState = {
  summary: null,
  status: "idle",
  error: undefined,
};
