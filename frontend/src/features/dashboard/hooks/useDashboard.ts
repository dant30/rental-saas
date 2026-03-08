import { useEffect, useState } from "react";

import { handleError } from "../../../core/utils/errorHandler";
import { dashboardApi } from "../services/dashboardApi";
import { dashboardInitialState, DashboardState } from "../store/dashboardSlice";

export const useDashboard = (role: "owner" | "tenant" | "caretaker" = "owner") => {
  const [state, setState] = useState<DashboardState>(dashboardInitialState);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setState({ ...dashboardInitialState, status: "loading" });
      try {
        const summary =
          role === "tenant"
            ? await dashboardApi.tenantSummary()
            : role === "caretaker"
            ? await dashboardApi.caretakerSummary()
            : await dashboardApi.ownerSummary();

        if (!isMounted) return;
        setState({ summary, status: "success" });
      } catch (error) {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : String(error);
        setState({ summary: null, status: "error", error: message });
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [role]);

  return state;
};
