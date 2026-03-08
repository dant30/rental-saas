import { useEffect, useState } from "react";

import { handleError } from "../../../core/utils/errorHandler";
import { caretakerApi } from "../services/caretakerApi";
import { CaretakerRecord } from "../types";

export type EntityStatus = "idle" | "loading" | "success" | "error";

export type UseCaretakerResult = {
  caretaker?: CaretakerRecord;
  status: EntityStatus;
  error?: string;
};

export const useCaretaker = (id?: string | number): UseCaretakerResult => {
  const [state, setState] = useState<UseCaretakerResult>({ status: "idle" });

  useEffect(() => {
    if (!id) {
      setState({ status: "idle" });
      return;
    }

    let isMounted = true;

    const load = async () => {
      setState({ status: "loading" });
      try {
        const caretaker = await caretakerApi.detail(Number(id));
        if (!isMounted) return;
        setState({ status: "success", caretaker });
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
