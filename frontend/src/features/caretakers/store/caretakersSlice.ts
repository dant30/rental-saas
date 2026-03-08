import { CaretakerRecord } from "../types";

export interface CaretakersState {
  items: CaretakerRecord[];
}

export const caretakersInitialState: CaretakersState = {
  items: [],
};
