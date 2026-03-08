import { useDeferredValue, useState } from "react";

import Header from "../../../components/layout/Header";
import EmptyState from "../../../components/shared/EmptyState";
import Input from "../../../components/shared/Input";
import Table, { type TableColumn } from "../../../components/shared/Table";
import { formatCurrency, formatDate } from "../../../core/utils/formatters";
import { ArrearRecord } from "../types";
import { usePayments } from "../hooks/usePayments";

const ArrearsPage = () => {
  const { arrears } = usePayments();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredArrears = arrears.filter((item) =>
    [item.status, item.outstanding_amount, item.due_date]
      .join(" ")
      .toLowerCase()
      .includes(deferredQuery.toLowerCase()),
  );

  const totalOutstanding = arrears.reduce((sum, item) => sum + Number(item.outstanding_amount || 0), 0);
  const overdueCount = arrears.filter((item) => item.status.toLowerCase().includes("over")).length;

  const columns: TableColumn<ArrearRecord>[] = [
    { key: "amount", header: "Outstanding", render: (item) => formatCurrency(item.outstanding_amount) },
    { key: "dueDate", header: "Due date", render: (item) => formatDate(item.due_date) },
    { key: "status", header: "Status", render: (item) => item.status },
  ];

  return (
    <>
      <Header subtitle="Live arrears from /api/arrears/." title="Arrears" />

      <section className="stats-grid">
        <article className="theme-kpi">
          <span className="theme-caption">Arrear records</span>
          <span className="theme-stat">{arrears.length}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">Outstanding balance</span>
          <span className="theme-stat">{formatCurrency(totalOutstanding)}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">Overdue items</span>
          <span className="theme-stat">{overdueCount}</span>
        </article>
      </section>

      <section className="theme-surface activity-card" style={{ marginTop: "2rem" }}>
        <h3 className="theme-title">Collection watchlist</h3>
        <p className="theme-subtitle">Search by amount, due date, or arrear status.</p>
        <div style={{ marginTop: "1rem" }}>
          <Input
            label="Search arrears"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by amount, due date, or status"
            value={query}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          {filteredArrears.length ? (
            <Table columns={columns} data={filteredArrears} rowKey={(item) => String(item.id)} />
          ) : (
            <EmptyState
              description="Try a broader query or wait for arrears records to sync."
              title="No arrears match this view"
            />
          )}
        </div>
      </section>
    </>
  );
};

export default ArrearsPage;
