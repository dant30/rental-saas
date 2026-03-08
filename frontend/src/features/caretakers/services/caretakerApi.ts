import { apiClient } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";
import { CaretakerRecord } from "../types";

export const caretakerApi = {
  list: () => apiClient<CaretakerRecord[]>(endpoints.caretakers),
  detail: (id: number) => apiClient<CaretakerRecord>(`${endpoints.caretakers}${id}/`),
  create: (body: Partial<CaretakerRecord>) => apiClient<CaretakerRecord>(endpoints.caretakers, { method: "POST", body }),
  update: (id: number, body: Partial<CaretakerRecord>) =>
    apiClient<CaretakerRecord>(`${endpoints.caretakers}${id}/`, { method: "PATCH", body }),
};
