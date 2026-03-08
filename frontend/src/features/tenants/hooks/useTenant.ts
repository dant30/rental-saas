import { useEffect, useState } from "react";

import { handleError } from "../../../core/utils/errorHandler";
import { tenantApi } from "../services/tenantApi";
import { TenantResident } from "../types";

export type EntityStatus = "idle" | "loading" | "success" | "error";

export type UseTenantResult = {
  tenant?: TenantResident;
  status: EntityStatus;
  error?: string;
};

export const useTenant = (id?: string | number): UseTenantResult => {
  const [state, setState] = useState<UseTenantResult>({ status: "idle" });

  useEffect(() => {
    if (!id) {
      setState({ status: "idle" });
      return;
    }

    let isMounted = true;

    const load = async () => {
      setState({ status: "loading" });
      try {
        const tenant = await tenantApi.detail(Number(id));
        if (!isMounted) return;
        setState({ status: "success", tenant });
      } catch (error) {
        if (!isMounted) return;
        setState({ status: "error", error: handleError(error) });
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  return state;
};
