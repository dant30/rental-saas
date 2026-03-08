import { ExpenseRecord } from "../types";

export interface ExpensesState {
  items: ExpenseRecord[];
}

export const expensesInitialState: ExpensesState = {
  items: [],
};
