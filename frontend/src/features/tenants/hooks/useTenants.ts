import { useEffect, useState } from "react";

import { tenantApi } from "../services/tenantApi";
import { tenantsInitialState, TenantsState } from "../store/tenantsSlice";

export const useTenants = () => {
  const [state, setState] = useState<TenantsState>(tenantsInitialState);

  useEffect(() => {
    tenantApi
      .listResidents()
      .then((items) => setState({ items, status: "success" }))
      .catch(() => setState({ items: [], status: "error" }));
  }, []);

  return state;
};
