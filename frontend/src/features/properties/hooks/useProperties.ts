import { useEffect, useState } from "react";

import { handleError } from "../../../core/utils/errorHandler";
import { propertyApi } from "../services/propertyApi";
import { propertiesInitialState, PropertiesState } from "../store/propertiesSlice";

export const useProperties = () => {
  const [state, setState] = useState<PropertiesState>(propertiesInitialState);

  useEffect(() => {
    const load = async () => {
      setState({ ...propertiesInitialState, status: "loading" });
      try {
        const items = await propertyApi.list();
        setState({ items, status: "success" });
      } catch (error) {
        setState({ items: [], status: "error" });
        handleError(error);
      }
    };
    void load();
  }, []);

  return state;
};
