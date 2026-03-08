import { ArrearRecord, PaymentRecord } from "../types";

export interface PaymentsState {
  payments: PaymentRecord[];
  arrears: ArrearRecord[];
}

export const paymentsInitialState: PaymentsState = {
  payments: [],
  arrears: [],
};
