import Header from "../../../components/layout/Header";
import ExpenseRow from "../components/ExpenseRow";
import { useExpenses } from "../hooks/useExpenses";

const ExpenseListPage = () => {
  const { items } = useExpenses();
  return (
    <>
      <Header subtitle="Expense list plus OCR scan status." title="Expenses" />
      <article className="glass-panel activity-card">
        <table className="app-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>OCR</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((expense) => (
              <ExpenseRow expense={expense} key={expense.id} />
            ))}
          </tbody>
        </table>
      </article>
    </>
  );
};

export default ExpenseListPage;
