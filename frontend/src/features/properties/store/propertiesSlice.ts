import { PropertyRecord } from "../types";

export interface PropertiesState {
  items: PropertyRecord[];
  status: "idle" | "loading" | "success" | "error";
}

export const propertiesInitialState: PropertiesState = {
  items: [],
  status: "idle",
};
