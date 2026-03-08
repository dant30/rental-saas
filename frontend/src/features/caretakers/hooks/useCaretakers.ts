import { useEffect, useState } from "react";

import { caretakerApi } from "../services/caretakerApi";
import { caretakersInitialState, CaretakersState } from "../store/caretakersSlice";

export const useCaretakers = () => {
  const [state, setState] = useState<CaretakersState>(caretakersInitialState);

  useEffect(() => {
    caretakerApi.list().then((items) => setState({ items })).catch(() => setState(caretakersInitialState));
  }, []);

  return state;
};
