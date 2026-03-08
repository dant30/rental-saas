import { apiClient } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";
import { ExpenseRecord } from "../types";

export const expenseApi = {
  list: () => apiClient<ExpenseRecord[]>(endpoints.expenses),
  create: (body: Partial<ExpenseRecord>) => apiClient<ExpenseRecord>(endpoints.expenses, { method: "POST", body }),
  scanReceipt: (id: number) => apiClient<ExpenseRecord>(`${endpoints.expenses}${id}/scan_receipt/`, { method: "POST", body: {} }),
};
