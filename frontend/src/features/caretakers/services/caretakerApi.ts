import { apiClient } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";
import { CaretakerRecord } from "../types";

export const caretakerApi = {
  list: () => apiClient<CaretakerRecord[]>(endpoints.caretakers),
};
