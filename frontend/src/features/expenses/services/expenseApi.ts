import { apiClient } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";
import { ExpenseCreatePayload, ExpenseRecord } from "../types";

export const expenseApi = {
  list: () => apiClient<ExpenseRecord[]>(endpoints.expenses),
  create: (body: ExpenseCreatePayload) =>
    apiClient<ExpenseRecord>(endpoints.expenses, { method: "POST", body }),
  scanReceipt: (id: number) => apiClient<ExpenseRecord>(`${endpoints.expenses}${id}/scan_receipt/`, { method: "POST", body: {} }),
};
