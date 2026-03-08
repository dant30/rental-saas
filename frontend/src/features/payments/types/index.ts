export interface PaymentRecord {
  id: number;
  amount: string;
  payment_date: string;
  method: string;
  status: string;
  reference: string;
}

export interface ArrearRecord {
  id: number;
  outstanding_amount: string;
  due_date: string;
  status: string;
}
