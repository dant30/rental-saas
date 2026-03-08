import { useEffect, useState } from "react";

import { expenseApi } from "../services/expenseApi";
import { expensesInitialState, ExpensesState } from "../store/expensesSlice";

export const useExpenses = () => {
  const [state, setState] = useState<ExpensesState>(expensesInitialState);

  const reload = async () => {
    const items = await expenseApi.list();
    setState({ items });
  };

  useEffect(() => {
    void reload();
  }, []);

  return { ...state, reload, scanReceipt: expenseApi.scanReceipt };
};
