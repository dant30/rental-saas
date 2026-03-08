import { formatCurrency, formatDate } from "../../../core/utils/formatters";
import { ExpenseRecord } from "../types";

const ExpenseRow = ({ expense }: { expense: ExpenseRecord }) => (
  <tr>
    <td>{expense.title}</td>
    <td>{expense.vendor_name || "--"}</td>
    <td>{formatCurrency(expense.amount)}</td>
    <td>{expense.ocr_status || "not_requested"}</td>
    <td>{formatDate(expense.expense_date)}</td>
  </tr>
);

export default ExpenseRow;
