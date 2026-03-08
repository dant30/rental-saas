import { useEffect, useState } from "react";

import { handleError } from "../../../core/utils/errorHandler";
import { dashboardApi } from "../services/dashboardApi";
import { dashboardInitialState, DashboardState } from "../store/dashboardSlice";

export const useDashboard = (role: "owner" | "tenant" | "caretaker" = "owner") => {
  const [state, setState] = useState<DashboardState>(dashboardInitialState);

  useEffect(() => {
    const load = async () => {
      setState({ ...dashboardInitialState, status: "loading" });
      try {
        const summary =
          role === "tenant"
            ? await dashboardApi.tenantSummary()
            : role === "caretaker"
              ? await dashboardApi.caretakerSummary()
              : await dashboardApi.ownerSummary();
        setState({ summary, status: "success" });
      } catch (error) {
        setState({ summary: { error: handleError(error) }, status: "error" });
      }
    };
    void load();
  }, [role]);

  return state;
};
