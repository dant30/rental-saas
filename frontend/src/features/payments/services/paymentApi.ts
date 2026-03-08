import { apiClient } from "../../../core/api/axios";
import { endpoints } from "../../../core/api/endpoints";
import { ArrearRecord, PaymentRecord } from "../types";

export const paymentApi = {
  listPayments: () => apiClient<PaymentRecord[]>(endpoints.payments),
  listArrears: () => apiClient<ArrearRecord[]>(endpoints.arrears),
  rentRoll: () => apiClient<Record<string, unknown>>(endpoints.reports.rentRoll),
  agedReceivables: () => apiClient<Record<string, unknown>>(endpoints.reports.agedReceivables),
  profitLoss: () =>
    apiClient<Record<string, unknown>>(`${endpoints.reports.propertyProfitLoss}?start_date=2026-03-01&end_date=2026-03-31`),
  initiateMpesa: (body: Record<string, unknown>) => apiClient<Record<string, unknown>>(endpoints.mpesa, { method: "POST", body }),
  recordBankPayment: (body: Record<string, unknown>) =>
    apiClient<Record<string, unknown>>(endpoints.bankPayments, { method: "POST", body }),
};
