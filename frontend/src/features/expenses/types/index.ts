export interface ExpenseRecord {
  id: number;
  title: string;
  amount: string;
  expense_date: string;
  vendor_name?: string;
  ocr_status?: string;
}

export interface ExpenseCreatePayload {
  title: string;
  amount: number;
  vendor?: string;
}
