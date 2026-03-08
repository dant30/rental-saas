import { useEffect, useState } from "react";

import { handleError } from "../../../core/utils/errorHandler";
import { propertyApi } from "../services/propertyApi";
import { PropertyRecord } from "../types";

export type EntityStatus = "idle" | "loading" | "success" | "error";

export type UsePropertyResult = {
  property?: PropertyRecord;
  status: EntityStatus;
  error?: string;
};

export const useProperty = (id?: string | number): UsePropertyResult => {
  const [state, setState] = useState<UsePropertyResult>({ status: "idle" });

  useEffect(() => {
    if (!id) {
      setState({ status: "idle" });
      return;
    }

    let isMounted = true;

    const load = async () => {
      setState({ status: "loading" });
      try {
        const property = await propertyApi.detail(Number(id));
        if (!isMounted) return;
        setState({ status: "success", property });
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
