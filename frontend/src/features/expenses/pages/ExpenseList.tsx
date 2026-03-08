import { useDeferredValue, useState } from "react";

import Header from "../../../components/layout/Header";
import EmptyState from "../../../components/shared/EmptyState";
import Input from "../../../components/shared/Input";
import Table, { type TableColumn } from "../../../components/shared/Table";
import { formatCurrency, formatDate } from "../../../core/utils/formatters";
import { ExpenseRecord } from "../types";
import { useExpenses } from "../hooks/useExpenses";

const ExpenseListPage = () => {
  const { items } = useExpenses();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredItems = items.filter((expense) =>
    [expense.title, expense.vendor_name, expense.ocr_status, expense.amount]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(deferredQuery.toLowerCase()),
  );

  const totalExpense = items.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const scannedReceipts = items.filter((expense) => !!expense.ocr_status && expense.ocr_status !== "not_requested").length;

  const columns: TableColumn<ExpenseRecord>[] = [
    { key: "title", header: "Title", render: (expense) => expense.title },
    { key: "vendor", header: "Vendor", render: (expense) => expense.vendor_name || "--" },
    { key: "amount", header: "Amount", render: (expense) => formatCurrency(expense.amount) },
    { key: "ocr", header: "OCR", render: (expense) => expense.ocr_status || "not_requested" },
    { key: "date", header: "Date", render: (expense) => formatDate(expense.expense_date) },
  ];

  return (
    <>
      <Header subtitle="Expense list plus OCR scan status." title="Expenses" />

      <section className="stats-grid">
        <article className="theme-kpi">
          <span className="theme-caption">Expenses</span>
          <span className="theme-stat">{items.length}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">Spend tracked</span>
          <span className="theme-stat">{formatCurrency(totalExpense)}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">OCR processed</span>
          <span className="theme-stat">{scannedReceipts}</span>
        </article>
      </section>

      <article className="glass-panel activity-card" style={{ marginTop: "2rem" }}>
        <h3>Expense ledger</h3>
        <p className="theme-subtitle">Search by title, vendor, OCR status, or amount.</p>
        <div style={{ marginTop: "1rem" }}>
          <Input
            label="Search expenses"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by title, vendor, OCR status, or amount"
            value={query}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          {filteredItems.length ? (
            <Table columns={columns} data={filteredItems} rowKey={(expense) => String(expense.id)} />
          ) : (
            <EmptyState
              description="Try a different query or record your first operating expense."
              title="No expenses match this view"
            />
          )}
        </div>
      </article>
    </>
  );
};

export default ExpenseListPage;
